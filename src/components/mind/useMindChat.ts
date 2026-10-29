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
  if (typeof window === 'undefined') return 'server';
  let s = sessionStorage.getItem('mind-session');
  if (!s) {
    s = (crypto.randomUUID?.() ?? 's-' + Date.now() + '-' + Math.random()).replace(/-/g, '').slice(0, 32);
    sessionStorage.setItem('mind-session', s);
  }
  return s;
}

/** Follow/pause scroll behavior. ONE scroll owner per surface.
 *  - follows new content only while the reader is near the bottom
 *    (<= 88px), with immediate coalesced movement (no per-token smooth)
 *  - pauses when the reader scrolls up; Jump-to-latest resumes
 *  - respects reduced motion (always immediate) */
export function useFollow<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [following, setFollowing] = useState(true);
  /** self-scroll tagging: our own sticks fire 'scroll' events; without
   *  tagging, a stick landing between the reader's scroll and the rAF
   *  measurement erases user intent (the residual P0 jump). */
  const selfRef = useRef(false);
  const lastTargetRef = useRef(-1);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight <= 88;
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const isSelf = selfRef.current && Math.abs(el.scrollTop - lastTargetRef.current) <= 2;
        selfRef.current = false;
        if (isSelf) return; // our own stick - not user intent
        const near = measure();
        followingRef.current = near;
        setFollowing(near);
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('scroll', onScroll);
    };
  }, [measure]);

  /** programmatic stick to bottom, tagged so its scroll event is not
   *  mistaken for the reader's intent */
  const stick = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    selfRef.current = true;
    lastTargetRef.current = el.scrollHeight;
    el.scrollTop = el.scrollHeight;
  }, []);

  /** persistent follow decision, updated ONLY by user scroll and explicit
   *  actions (never by post-growth measurement — the DOM has already grown
   *  when effects run, so measuring there would break auto-follow). */
  const followingRef = useRef(true);
  followingRef.current = following;
  // hoisted for onScroll above (defined before the effect that uses it)

  /** kept for API compatibility; the decision now lives in followingRef. */
  const beforeFlush = useCallback(() => {}, []);

  /** call after a flush renders: stick to bottom iff the reader was
   *  following. Immediate — no smooth animation per token. */
  const afterFlush = useCallback(() => {
    if (followingRef.current) stick();
  }, [stick]);

  /** intentional reveal of a just-sent question (once, not per token) */
  const reveal = useCallback(() => {
    followingRef.current = true;
    setFollowing(true);
    stick();
  }, [stick]);

  const jumpToLatest = useCallback(() => {
    followingRef.current = true;
    setFollowing(true);
    stick();
  }, [stick]);

  /** restore + hold the current reading position (tagged as self) - used
   *  when selecting a citation so focus/scroll side effects cannot move
   *  the reader or re-engage following (mission: source open must retain
   *  reading position). */
  const hold = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const st = el.scrollTop;
    followingRef.current = false; // selection never re-engages follow
    setFollowing(false);
    requestAnimationFrame(() => {
      selfRef.current = true;
      lastTargetRef.current = st;
      el.scrollTop = st;
    });
  }, []);

  return { ref, following, beforeFlush, afterFlush, reveal, jumpToLatest, hold };
}

export type MindScope = 'all' | 'books' | 'oss' | 'flows' | 'concepts' | 'articles';

export function useMindChat(locale: string, s: MindStrings) {
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
      if (asked >= MAX_QUESTIONS) {
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
            session: sessionId(),
            locale,
            scope,
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
    [busy, asked, messages, locale, s, fail, scope, patchLast]
  );

  return { messages, busy, error, notice, asked, retryQuestion, send, stop, reset, setError, setNotice, scope, setScope };
}