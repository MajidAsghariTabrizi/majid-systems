'use client';

/**
 * Quantiviq Mind — standalone full-page conversation experience for
 * /en/mind and /fa/mind. Reuses useMindChat + MindMessage (the SAME
 * backend, session and streaming path as the floating panel).
 *
 * ?q= prefills the composer. It NEVER auto-sends, is length-capped, and
 * carries no executable semantics.
 */
import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMindChat, MAX_QUESTIONS } from './useMindChat';
import { MindMessage } from './QuantiviqMindPanel';
import type { MindStrings } from './strings';

function MindPageInner({ locale, s }: { locale: 'en' | 'fa'; s: MindStrings }) {
  const params = useSearchParams();
  const { messages, busy, error, notice, asked, retryQuestion, send, stop, reset } = useMindChat(locale, s);
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  // ?q= prefill: cap length, never auto-send, strip control chars.
  useEffect(() => {
    const q = params.get('q');
    if (q) setInput(q.replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, 2000));
  }, [params]);

  // restore a failed question for one-tap retry (429/5xx/network only)
  useEffect(() => {
    if (retryQuestion) setInput(retryQuestion);
  }, [retryQuestion]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const last = messages.at(-1);
  const showContact = !busy && last?.role === 'assistant' && (last.content?.length ?? 0) > 80;
  const other = locale === 'fa' ? '/en/mind' : '/fa/mind';

  const submit = (text: string) => {
    send(text);
    setInput('');
  };

  return (
    <section className="mind-full" data-locale={locale}>
      {/* ===== HEADER ===== */}
      <div className="mind-full-head">
        <div className="container-wide">
          <div className="mind-full-head-row">
            <div className="mind-full-head-l">
              <span className="eyebrow sig">Quantiviq Mind</span>
              <h1 className="q-display mind-full-h1">{s.headline}</h1>
              <p className="mind-full-sub">{s.subtitle}</p>
              <p className="mind-full-ai-note">
                <span aria-hidden>✦</span> {s.aiNote}
              </p>
            </div>
            <div className="mind-full-head-actions">
              <Link href={other} className="mind-full-switch" lang={locale === 'fa' ? 'en' : 'fa'}>
                {s.switchLabel}
              </Link>
              {messages.length > 0 && (
                <button type="button" className="mind-full-reset" onClick={reset}>
                  {s.reset} ⟳
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== CONVERSATION ===== */}
      <div className="mind-full-body">
        <div className="container-wide">
          <div className="mind-full-card">
            <div className="mind-full-scroll" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="mind-full-empty">
                  <p className="mind-full-starters-title">{s.startersTitle}</p>
                  <div className="mind-full-starters">
                    {s.starters.map((sg) => (
                      <button key={sg} type="button" className="mind-full-starter" onClick={() => submit(sg)}>
                        {sg}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
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
                  {notice && (
                    <div className="mind-notice" role="status">
                      {notice}
                    </div>
                  )}
                  {showContact && (
                    <div className="mind-contact mind-contact-page">
                      <span>{s.contactCta}</span>
                      <div className="mind-contact-actions">
                        <a
                          className="mind-contact-btn"
                          href={locale === 'fa' ? '/fa/contact?intent=hiring' : '/en/contact?intent=hiring'}
                        >
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
                </>
              )}
            </div>

            {/* ===== COMPOSER (sticky) ===== */}
            <form
              className="mind-compose mind-compose-page"
              onSubmit={(e) => {
                e.preventDefault();
                submit(input);
              }}
            >
              <label className="mind-sr" htmlFor="mind-page-input">
                {s.inputLabel}
              </label>
              <textarea
                id="mind-page-input"
                ref={composerRef}
                rows={2}
                dir="auto"
                value={input}
                maxLength={2000}
                placeholder={s.placeholder}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    submit(input);
                  }
                }}
                disabled={asked >= MAX_QUESTIONS && !busy}
              />
              {busy ? (
                <button type="button" className="mind-send" onClick={stop}>
                  {s.stop}
                </button>
              ) : (
                <button type="submit" className="mind-send" disabled={!input.trim() || asked >= MAX_QUESTIONS}>
                  {s.send}
                </button>
              )}
            </form>
            {asked > 0 && (
              <p className="mind-full-remaining">
                {s.remainingTemplate.replace('{n}', String(Math.max(0, MAX_QUESTIONS - asked)))}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function MindFullPage({ locale, s }: { locale: 'en' | 'fa'; s: MindStrings }) {
  return (
    <Suspense fallback={<div className="mind-full" data-locale={locale} />}>
      <MindPageInner locale={locale} s={s} />
    </Suspense>
  );
}
