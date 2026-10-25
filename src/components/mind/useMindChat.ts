'use client';

/**
 * Quantiviq Mind — shared chat state/logic for BOTH surfaces (floating panel
 * and the /mind full page). One implementation, one backend, one session.
 * Extracted unchanged in behavior from QuantiviqMindPanel (2026-10-25).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { MindStrings } from './strings';

export type Msg = { role: 'user' | 'assistant'; content: string; sources?: Source[] };
export type Source = { id: string; title: string; url: string; type: string; class: string; language: string };

export const MAX_QUESTIONS = 6;

export function sessionId(): string {
  if (typeof window === 'undefined') return 'server';
  let s = sessionStorage.getItem('mind-session');
  if (!s) {
    s = (crypto.randomUUID?.() ?? `s-${Date.now()}-${Math.random()}`).replace(/-/g, '').slice(0, 32);
    sessionStorage.setItem('mind-session', s);
  }
  return s;
}

export function useMindChat(locale: string, s: MindStrings) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [asked, setAsked] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const reset = useCallback(() => {
    setMessages([]);
    setAsked(0);
    setNotice('');
    setError('');
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
      setAsked((n) => n + 1);
      const history = [...messages, { role: 'user' as const, content: q }];
      setMessages([...history, { role: 'assistant', content: '' }]);
      setBusy(true);

      const ac = new AbortController();
      abortRef.current = ac;
      try {
        const res = await fetch('/api/public-mind/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session: sessionId(),
            locale,
            messages: history.map((m) => ({ role: m.role, content: m.content })),
          }),
          signal: ac.signal,
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          if (j.error === 'disabled') setError(locale === 'fa' ? s.disabledFa : s.disabledEn);
          else if (j.error === 'session_limit' || j.error === 'budget')
            setError(locale === 'fa' ? j.message_fa ?? s.limitReached : j.message_en ?? s.limitReached);
          else setError(s.error);
          setMessages(history);
          return;
        }
        const reader = res.body!.getReader();
        const dec = new TextDecoder();
        let buf = '';
        let answer = '';
        let sources: Source[] | undefined;
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
            else if (ev === 'done' && data.status === 'error') setError(s.error);
            setMessages([...history, { role: 'assistant', content: answer, sources }]);
          }
        }
      } catch (e) {
        if ((e as Error).name !== 'AbortError') setError(s.error);
        setMessages((ms) => (ms.at(-1)?.content === '' ? ms.slice(0, -1) : ms));
      } finally {
        setBusy(false);
        abortRef.current = null;
      }
    },
    [busy, asked, messages, locale, s]
  );

  return { messages, busy, error, notice, asked, send, stop, reset, setError, setNotice };
}
