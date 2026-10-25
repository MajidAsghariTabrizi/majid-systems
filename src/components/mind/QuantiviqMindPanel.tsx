'use client';

/**
 * Quantiviq Mind — chat panel. Streams SSE from the same-origin gateway.
 * Markdown is rendered with a minimal safe renderer (no raw HTML, links
 * restricted to the allowlist enforced server-side).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { MindStrings } from './strings';

type Msg = { role: 'user' | 'assistant'; content: string; sources?: Source[] };
type Source = { id: string; title: string; url: string; type: string; class: string; language: string };

const MAX_QUESTIONS = 6;

function sessionId(): string {
  if (typeof window === 'undefined') return 'server';
  let s = sessionStorage.getItem('mind-session');
  if (!s) {
    s = (crypto.randomUUID?.() ?? `s-${Date.now()}-${Math.random()}`).replace(/-/g, '').slice(0, 32);
    sessionStorage.setItem('mind-session', s);
  }
  return s;
}

/** minimal safe inline rendering: **bold**, `code`, allowlisted links */
function renderInline(text: string) {
  const parts: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|https?:\/\/[^\s<>")\]]+)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('**')) {
      parts.push(<strong key={k++}>{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith('`')) {
      parts.push(
        <code key={k++} dir="ltr" className="mind-code">
          {tok.slice(1, -1)}
        </code>
      );
    } else {
      const allowed = /^https?:\/\/(quantiviq\.xyz|github\.com\/MajidAsghariTabrizi)\//.test(tok);
      parts.push(
        allowed ? (
          <a key={k++} href={tok} target="_blank" rel="noopener noreferrer" dir="ltr">
            {tok.replace(/^https?:\/\/(www\.)?/, '').slice(0, 48) + (tok.length > 60 ? '…' : '')}
          </a>
        ) : (
          <span key={k++} dir="ltr">{tok}</span>
        )
      );
    }
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function MindMessage({ m }: { m: Msg }) {
  if (m.role === 'user') {
    return (
      <div className="mind-msg mind-msg-user" dir="auto">
        <div className="mind-bubble">{m.content}</div>
      </div>
    );
  }
  return (
    <div className="mind-msg mind-msg-ai">
      <div className="mind-bubble" dir="auto">
        {m.content.split('\n').map((line, i) => (
          <p key={i} className={line.startsWith('##') || line.startsWith('**') ? 'mind-p-strong' : undefined}>
            {renderInline(line.replace(/^#{1,3}\s*/, ''))}
          </p>
        ))}
      </div>
      {m.sources && m.sources.length > 0 && (
        <div className="mind-sources">
          <span className="mind-sources-label">Sources</span>
          <ul>
            {m.sources.slice(0, 5).map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" dir="ltr">
                  {s.title.slice(0, 64)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function QuantiviqMindPanel({ locale, s, onClose }: { locale: string; s: MindStrings; onClose: () => void }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [asked, setAsked] = useState(0);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);
  useEffect(() => {
    inputRef.current?.focus();
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  const send = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || busy) return;
      if (asked >= MAX_QUESTIONS) {
        setNotice(s.limitReached);
        return;
      }
      setError('');
      setNotice('');
      setInput('');
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
            setMessages([
              ...history,
              { role: 'assistant', content: answer, sources },
            ]);
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

  const last = messages.at(-1);
  const showContact = !busy && last?.role === 'assistant' && (last.content?.length ?? 0) > 80;

  return (
    <div className="mind-overlay" role="dialog" aria-modal="true" aria-label={s.title}>
      <div className="mind-panel" data-locale={locale}>
        <header className="mind-head">
          <div className="mind-head-l">
            <span className="mind-head-glyph" aria-hidden>
              ✦
            </span>
            <div>
              <strong className="mind-head-title">{s.title}</strong>
              <p className="mind-head-sub">{s.disclosure}</p>
            </div>
          </div>
          <div className="mind-head-actions">
            <button type="button" className="mind-icon-btn" onClick={() => { setMessages([]); setAsked(0); setNotice(''); setError(''); }} aria-label={s.reset}>
              ⟳
            </button>
            <button type="button" className="mind-icon-btn" onClick={onClose} aria-label={s.close}>
              ×
            </button>
          </div>
        </header>

        <div className="mind-scroll" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="mind-empty">
              <p className="mind-empty-title">{locale === 'fa' ? 'با ذهن هوشمند مجید گفت‌وگو کن' : 'Ask Majid’s AI Mind'}</p>
              <div className="mind-sugg">
                {s.suggestions.map((sg) => (
                  <button key={sg} type="button" className="mind-sugg-chip" onClick={() => send(sg)}>
                    {sg}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <MindMessage key={i} m={m} />
          ))}
          {busy && (
            <div className="mind-typing" aria-live="polite">
              <span /> <span /> <span />
            </div>
          )}
          {error && <div className="mind-error" role="alert">{error}</div>}
          {notice && <div className="mind-notice" role="status">{notice}</div>}
          {showContact && (
            <div className="mind-contact">
              <span>{s.contactCta}</span>
              <div className="mind-contact-actions">
                <a className="mind-contact-btn" href={locale === 'fa' ? '/fa/contact?intent=hiring' : '/en/contact?intent=hiring'}>
                  {s.contactLink}
                </a>
                <button
                  type="button"
                  className="mind-icon-btn"
                  aria-label={s.copy}
                  onClick={() => {
                    navigator.clipboard?.writeText(last?.content ?? '');
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                >
                  {copied ? '✓' : '⧉'}
                </button>
              </div>
            </div>
          )}
        </div>

        <form
          className="mind-compose"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <label className="mind-sr" htmlFor="mind-input">
            {s.inputLabel}
          </label>
          <textarea
            id="mind-input"
            ref={inputRef}
            rows={1}
            dir="auto"
            value={input}
            placeholder={s.placeholder}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            disabled={asked >= MAX_QUESTIONS && !busy}
          />
          {busy ? (
            <button type="button" className="mind-send" onClick={() => abortRef.current?.abort()}>
              {s.stop}
            </button>
          ) : (
            <button type="submit" className="mind-send" disabled={!input.trim() || asked >= MAX_QUESTIONS}>
              {s.send}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
