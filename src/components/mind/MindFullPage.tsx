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
import { useMindChat, useFollow, MAX_QUESTIONS } from './useMindChat';
import { MindMessage, EvidenceInspector, normalizeSources, type EvidenceSel } from './evidence';
import type { MindStrings } from './strings';

function MindPageInner({ locale, s }: { locale: 'en' | 'fa'; s: MindStrings }) {
  const params = useSearchParams();
  const { messages, busy, error, notice, asked, retryQuestion, send, stop, reset, scope, setScope } = useMindChat(locale, s);
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const follow = useFollow<HTMLDivElement>();
  const [evidence, setEvidence] = useState<EvidenceSel>(null);
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());
  const openEvidence = (msgId: string, srcId: string) => {
    follow.hold(); // selection must not move the reader or re-engage follow
    setEvidence({ msgId, srcId });
  };
  const toggleExpand = (msgId: string) =>
    setExpandedSources((prev) => { const n = new Set(prev); if (n.has(msgId)) n.delete(msgId); else n.add(msgId); return n; });

  // ?q= prefill: cap length, never auto-send, strip control chars.
  useEffect(() => {
    const q = params.get('q');
    if (q) setInput(q.replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, 2000));
  }, [params]);

  // restore a failed question for one-tap retry (429/5xx/network only)
  useEffect(() => {
    if (retryQuestion) setInput(retryQuestion);
  }, [retryQuestion]);

  // Streaming stability (2026-10-29): no per-delta smooth scrolling. The
  // follow hook sticks to bottom ONLY while the reader is already there,
  // pauses when they scroll up, and offers an explicit Jump-to-latest.
  // Reveal ONCE per new user question (tracked by its persistent id), then
  // per-flush stick only while the reader is following. The previous
  // condition (role check on every messages update) was true for the whole
  // stream and forced scrollTop on every batched flush - the P0 jump.
  const revealedUserRef = useRef<string | null>(null);
  useEffect(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUser && lastUser.id !== revealedUserRef.current) {
      revealedUserRef.current = lastUser.id;
      follow.reveal();
      return;
    }
    requestAnimationFrame(() => follow.afterFlush());
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              <h1 className="q-display mind-full-h1">
                <span className="h1-line">{s.headline}</span>
                {s.headlineSecond && <span className="h1-line">{s.headlineSecond}</span>}
              </h1>
              <p className="mind-full-sub">{s.subtitle}</p>
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
            <div className="mind-full-scroll" ref={follow.ref}>
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
                  {messages.map((m) => (
                    <MindMessage
                      key={m.id}
                      m={m}
                      label={s.sources}
                      viewAll={s.viewAll}
                      incompleteLabel={s.incomplete}
                      onOpen={openEvidence}
                      expandedSet={expandedSources}
                      onToggleExpand={toggleExpand}
                      onHold={follow.hold}
                    />
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
              {!follow.following && messages.length > 0 && (
                <button type="button" className="mind-jump" onClick={follow.jumpToLatest}>
                  ↓ {s.jumpToLatest}
                </button>
              )}
            </div>

            {/* ===== SCOPE SWITCH (always visible) ===== */}
            <div className="mind-scope-row mind-scope-row-composer" role="group" aria-label={s.scopeTitle}>
              {s.scopes.map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  className={`chip chip-btn mind-scope-chip ${scope === sc.id ? 'on' : ''}`}
                  aria-pressed={scope === sc.id}
                  onClick={() => setScope(sc.id as typeof scope)}
                >
                  {sc.label}
                </button>
              ))}
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
                {s.remainingTemplate
                  .replace('{n}', locale === 'fa' ? (Math.max(0, MAX_QUESTIONS - asked)).toLocaleString('fa-IR') : String(Math.max(0, MAX_QUESTIONS - asked)))
                  .replace('questions left', Math.max(0, MAX_QUESTIONS - asked) === 1 ? 'question left' : 'questions left')}
              </p>
            )}
            {/* discreet, persistent AI transparency note (§7 hierarchy: after input) */}
            <p className="mind-full-disclosure">
              <span aria-hidden>✦</span> {s.aiNote} <span className="mind-full-disclosure-detail">{s.aiNoteDetail}</span>
            </p>
          </div>
        </div>
      </div>
    <EvidenceInspector
      source={
        evidence
          ? normalizeSources(messages.find((m) => m.id === evidence.msgId)?.sources).find(
              (x) => x.id === evidence.srcId
            ) ?? null
          : null
      }
      locale={locale}
      s={s}
      onClose={() => setEvidence(null)}
    />
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
