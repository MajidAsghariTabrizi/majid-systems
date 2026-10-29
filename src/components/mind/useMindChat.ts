'use client';

/**
 * Quantiviq Mind — shared chat state for BOTH surfaces (panel + /mind).
 * 2026-10-29 stability pass: persistent message IDs, batched delta
 * flushes (~45ms), generation guard against late writes, partial answers
 * preserved on stop/failure (marked incomplete), and a follow/pause scroll
 * hook so streaming never drags a reading user around.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { MindStrings } from './strings';

export type Msg = {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  /** persistent identity: created ONCE, never derived from array index */
  id: string;
  /** true when the turn ended early (stop/failure) with partial text kept */
  incomplete?: boolean;
};
export type Source = { id: string; title: string; url: string; type: string; class: string; language: string };

export const MAX_QUESTIONS = 6;

let _seq = 0;
function mid(role: 'user' | 'assistant') {
  return role + '-' + (crypto.randomUUID?.() ?? 'g' + Date.now() + '-' + (_seq++));
}

export function sessionId(): string {
  return sessionKeyed('mind-session');
}

/** session identity per surface: the public mind and the executive
 *  dialogue keep SEPARATE sessions and quotas by key. */
export function sessionKeyed(key: string): string {
  if (typeof window === 'undefined') return 'server';
  let s = sessionStorage.getItem(key);
  if (!s) {
    s = key.slice(0, 3) + (crypto.randomUUID?.() ?? 's-' + Date.now() + '-' + Math.random()).replace(/-/g, '').slice(0, 29);
    sessionStorage.setItem(key, s);
  }
  return s;
}

/** Viewport policy engine (2026-10-30 remediation). ONE scroll owner per
 *  surface. Explicit states: turn-start | reading | follow-latest.
 *  - a new user turn is anchored near the transcript top ONCE (by id)
 *  - streaming NEVER moves the reader on its own
 *  - follow-latest is entered ONLY by explicit Jump activation; reader
 *    navigation exits it synchronously (queued frames are cancelled)
 *  - self-scrolls are tagged with CLAMPED targets so classification is
 *    correct even for short/no-overflow transcripts
 *  - attaches via node state, so late-mounting viewports (Meet intro ->
 *    chat) and Strict Mode remounts get exactly one live listener */
export type FollowMode = 'turn-start' | 'reading' | 'follow-latest';

export function useFollow<T extends HTMLElement>() {
  const [node, setNode] = useState<T | null>(null);
  const [mode, setMode] = useState<FollowMode>('turn-start');
  const [atBottom, setAtBottom] = useState(false);
  const modeRef = useRef<FollowMode>('turn-start');
  modeRef.current = mode;
  const selfRef = useRef(false);
  const selfTargetRef = useRef(-1);
  const rafRef = useRef(0);
  /** last observed reader-input timestamp; queued sticks must not run if
   *  the reader acted after the stick was queued (in-flight rAF race) */
  const readerInputAtRef = useRef(0);

  const cancelWork = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
  }, []);

  const clampTarget = (el: HTMLElement, target: number) =>
    Math.max(0, Math.min(target, el.scrollHeight - el.clientHeight));

  const measureBottom = useCallback(() => {
    if (!node) return;
    const near = node.scrollHeight - node.scrollTop - node.clientHeight <= 88;
    setAtBottom((prev) => (prev === near ? prev : near));
  }, [node]);

  const stickBottom = useCallback(() => {
    rafRef.current = 0;
    if (!node) return;
    const target = clampTarget(node, node.scrollHeight);
    selfRef.current = true;
    selfTargetRef.current = target;
    node.scrollTop = target;
    setAtBottom(true);
  }, [node]);

  useEffect(() => {
    if (!node) return;
    // Reader-intent INPUTS win synchronously: a queued stick frame can
    // land between a touch/wheel move and its scroll event, erasing the
    // reader's position before any handler observes it. wheel/touch/key
    // events arrive before that frame runs, so they interrupt follow
    // immediately (2026-10-30 touch race, second fix).
    const readerActed = () => {
      readerInputAtRef.current = performance.now();
      cancelWork();
      modeRef.current = 'reading';
      setMode('reading');
    };
    const onKey = (e: KeyboardEvent) => {
      if (['PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) readerActed();
    };
    node.addEventListener('wheel', readerActed, { passive: true });
    node.addEventListener('touchstart', readerActed, { passive: true });
    node.addEventListener('touchmove', readerActed, { passive: true });
    node.addEventListener('keydown', onKey);
    const onScroll = () => {
      // A self-tag is trustworthy only if the tagged target is STILL the
      // current clamped bottom. While follow-latest sticks every frame, a
      // reader gesture (touch flick, wheel) can land within tolerance of
      // the last stick's target and be misclassified as our own write —
      // letting queued sticks override the reader (2026-10-30 touch race).
      const clampNow = Math.max(0, node.scrollHeight - node.clientHeight);
      const isSelf =
        selfRef.current &&
        Math.abs(node.scrollTop - selfTargetRef.current) <= 2 &&
        Math.abs(selfTargetRef.current - clampNow) <= 2;
      selfRef.current = false;
      if (isSelf) return;
      cancelWork();
      modeRef.current = 'reading';
      setMode('reading');
      measureBottom();
    };
    node.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      node.removeEventListener('scroll', onScroll);
      node.removeEventListener('wheel', readerActed);
      node.removeEventListener('touchstart', readerActed);
      node.removeEventListener('touchmove', readerActed);
      node.removeEventListener('keydown', onKey);
      cancelWork();
    };
  }, [node, cancelWork, measureBottom]);

  /** call after each batched flush renders. Only follow-latest moves.
   *  The queued frame re-validates BOTH mode and reader-input recency, so
   *  an in-flight frame can never overwrite an intervening touch/wheel. */
  const afterFlush = useCallback(() => {
    if (!node) return;
    measureBottom();
    if (modeRef.current === 'follow-latest' && !rafRef.current) {
      const queuedAt = performance.now();
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        if (modeRef.current !== 'follow-latest') return;
        if (readerInputAtRef.current > queuedAt) return; // reader won
        stickBottom();
      });
    }
  }, [node, measureBottom, stickBottom]);

  /** one-shot: bring the newly submitted user turn near the transcript
   *  top (small preceding-context offset), tagged as a self scroll. */
  const anchorTurn = useCallback(
    (el: HTMLElement | null) => {
      if (!node || !el) return;
      const target = clampTarget(
        node,
        node.scrollTop + el.getBoundingClientRect().top - node.getBoundingClientRect().top - 24
      );
      selfRef.current = true;
      selfTargetRef.current = target;
      node.scrollTop = target;
      modeRef.current = 'turn-start';
      setMode('turn-start');
    },
    [node]
  );

  /** explicit reader activation only - never re-entered by deltas */
  const jumpToLatest = useCallback(() => {
    if (!node) return;
    modeRef.current = 'follow-latest';
    setMode('follow-latest');
    stickBottom();
  }, [node, stickBottom]);

  /** callback ref: React notifies us of real mount/unmount */
  const ref = useCallback((n: T | null) => {
    setNode(n);
  }, []);

  return { ref, mode, atBottom, afterFlush, anchorTurn, jumpToLatest };
}
export type MindScope = 'all' | 'books' | 'oss' | 'flows' | 'concepts' | 'articles';

/** page-specific controller options: BOTH surfaces run this one sender */
export type ChatOptions = {
  persona?: string;          // undefined = public mind (default persona + scope)
  sessionKey?: string;       // sessionStorage key (separate sessions/quotas)
  limit?: number;            // questions per session
};

export function useMindChat(locale: string, s: MindStrings, opts: ChatOptions = {}) {
  const persona = opts.persona;
  const sessionKey = opts.sessionKey ?? 'mind-session';
  const limit = opts.limit ?? MAX_QUESTIONS;
  const [messages, setMessages] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [scope, setScope] = useState<MindScope>('all');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [asked, setAsked] = useState(0);
  const [retryQuestion, setRetryQuestion] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  /** generation counter: a cancelled/older stream can never write into a
   *  newer conversation (reset / new send / unmount all bump it) */
  const genRef = useRef(0);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      genRef.current += 1;
      abortRef.current?.abort();
    };
  }, []);

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const reset = useCallback(() => {
    genRef.current += 1;
    abortRef.current?.abort();
    setMessages([]);
    setAsked(0);
    setNotice('');
    setError('');
    setRetryQuestion('');
  }, []);

  const fail = useCallback((message: string, question: string, retryable: boolean) => {
    setError(message);
    setRetryQuestion(retryable ? question : '');
    setAsked((n) => Math.max(0, n - 1));
    setMessages((ms) => {
      const last = ms.at(-1);
      if (last?.role === 'assistant' && last.content === '') return ms.slice(0, -1);
      // keep any partial text, marked incomplete
      if (last?.role === 'assistant' && last.incomplete === undefined && last.content) {
        return [...ms.slice(0, -1), { ...last, incomplete: true }];
      }
      return ms;
    });
  }, []);

  /** stable functional update of ONLY the streaming turn */
  const patchLast = useCallback((patch: Partial<Msg>, gen: number) => {
    if (gen !== genRef.current || !mountedRef.current) return;
    setMessages((ms) => {
      const last = ms.at(-1);
      if (!last || last.role !== 'assistant') return ms;
      return [...ms.slice(0, -1), { ...last, ...patch }];
    });
  }, []);

  const send = useCallback(
    async (text: string) => {
      const q = text.trim().slice(0, 2000);
      if (!q || busy) return;
      if (asked >= limit) {
        setNotice(s.limitReached);
        return;
      }
      setError('');
      setNotice('');
      setRetryQuestion('');
      setAsked((n) => n + 1);
      const gen = ++genRef.current;
      abortRef.current?.abort();
      const userMsg: Msg = { role: 'user', content: q, id: mid('user') };
      const aiMsg: Msg = { role: 'assistant', content: '', id: mid('assistant') };
      const history = messages;
      setMessages([...history, userMsg, aiMsg]);
      setBusy(true);

      const ac = new AbortController();
      abortRef.current = ac;
      let streamFailed = false;
      try {
        const res = await fetch('/api/public-mind/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session: sessionKeyed(sessionKey),
            locale,
            ...(persona ? { persona } : { scope }),
            messages: [...history, userMsg].map((m) => ({ role: m.role, content: m.content })),
          }),
          signal: ac.signal,
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          if (j.error === 'disabled') {
            fail(locale === 'fa' ? s.disabledFa : s.disabledEn, q, false);
          } else if (j.error === 'session_limit' || j.error === 'budget') {
            fail(locale === 'fa' ? j.message_fa ?? s.limitReached : j.message_en ?? s.limitReached, q, false);
          } else if (res.status === 429 || res.status >= 500) {
            fail(
              locale === 'fa' ? j.message_fa ?? s.serviceUnavailable : j.message_en ?? s.serviceUnavailable,
              q,
              true
            );
          } else {
            fail(s.error, q, true);
          }
          return;
        }
        const reader = res.body!.getReader();
        const dec = new TextDecoder();
        let buf = '';
        let answer = '';
        let sources: Source[] | undefined;
        // batched flush: coalesce deltas at ~45ms instead of per-token renders
        let flushTimer: ReturnType<typeof setTimeout> | null = null;
        let lastAnswerLen = -1;
        const flushNow = () => {
          flushTimer = null;
          if (answer.length === lastAnswerLen && sources === undefined) return;
          lastAnswerLen = answer.length;
          patchLast({ content: answer, sources }, gen);
        };
        const scheduleFlush = () => {
          if (flushTimer === null) flushTimer = setTimeout(flushNow, 45);
        };
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let idx: number;
          while ((idx = buf.indexOf('\n\n')) >= 0) {
            const frame = buf.slice(0, idx);
            buf = buf.slice(idx + 2);
            const evLine = frame.split('\n').find((l) => l.startsWith('event: '));
            const dataLine = frame.split('\n').find((l) => l.startsWith('data: '));
            if (!evLine || !dataLine) continue;
            const ev = evLine.slice(7).trim();
            const data = JSON.parse(dataLine.slice(6));
            if (ev === 'sources') sources = data.sources;
            else if (ev === 'delta') answer += data.text;
            else if (ev === 'done' && data.status === 'error') {
              streamFailed = true;
              fail(s.serviceUnavailable, q, true);
            }
            if (!streamFailed) scheduleFlush();
          }
        }
        if (flushTimer !== null) clearTimeout(flushTimer);
        if (!streamFailed) patchLast({ content: answer, sources }, gen);
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          fail(s.serviceUnavailable, q, true);
        } else {
          // user pressed Stop: keep the partial answer, mark incomplete
          genRef.current === gen && patchLast({ incomplete: true }, gen);
        }
      } finally {
        if (gen === genRef.current) {
          setBusy(false);
          abortRef.current = null;
        }
      }
    },
    [busy, asked, messages, locale, s, fail, scope, patchLast, persona, sessionKey, limit]
  );

  return { messages, busy, error, notice, asked, retryQuestion, send, stop, reset, setError, setNotice, scope, setScope };
}