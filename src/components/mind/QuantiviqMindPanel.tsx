'use client';

/**
 * Quantiviq Mind — floating chat panel (overlay variant).
 * Chat state lives in useMindChat, shared with the /mind full page.
 * Markdown is rendered with a minimal safe renderer (no raw HTML, links
 * restricted to the allowlist enforced server-side).
 */
import { useEffect, useRef, useState } from 'react';
import { useMindChat, type Msg, type Source } from './useMindChat';
import type { MindStrings } from './strings';

/** minimal safe inline rendering: **bold**, `code`, allowlisted links */
export function renderInline(text: string) {
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

export function MindMessage({ m, label = 'Sources' }: { m: Msg; label?: string }) {
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
          <span className="mind-sources-label">{label}</span>
          <ul>
            {m.sources.slice(0, 5).map((s: Source) => (
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
  const { messages, busy, error, notice, asked, retryQuestion, send, stop, reset } = useMindChat(locale, s);
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // restore a failed question for one-tap retry (429/5xx/network only)
  useEffect(() => {
    if (retryQuestion) setInput(retryQuestion);
  }, [retryQuestion]);

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
            <a
              className="mind-icon-btn"
              href={locale === 'fa' ? '/fa/mind' : '/en/mind'}
              aria-label={s.openFull}
              title={s.openFull}
            >
              ⤢
            </a>
            <button type="button" className="mind-icon-btn" onClick={reset} aria-label={s.reset}>
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
              <p className="mind-empty-title">{s.emptyTitle}</p>
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
            <MindMessage key={i} m={m} label={s.sources} />
          ))}
          {busy && (
            <div className="mind-typing" aria-live="polite">
              <span /> <span /> <span />
            </div>
          )}
          {error && (
            <div className="mind-error" role="alert">
              {error}
              {retryQuestion && <span className="mind-retry-hint"> · {s.retryHint}</span>}
            </div>
          )}
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
            setInput('');
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
                setInput('');
              }
            }}
            disabled={asked >= 6 && !busy}
          />
          {busy ? (
            <button type="button" className="mind-send" onClick={stop}>
              {s.stop}
            </button>
          ) : (
            <button type="submit" className="mind-send" disabled={!input.trim() || asked >= 6}>
              {s.send}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
