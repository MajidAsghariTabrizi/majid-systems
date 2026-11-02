'use client';

/** Deterministic guided finder — three questions, transparent tag matching,
 *  zero LLM calls. Closure 2026-11-02: bottleneck options grouped by the
 *  chosen outcome (clearing incompatible selections), pressed-button
 *  semantics with programmatic selected state, result cards carry the same
 *  detailed/scoping qualification as the catalog, and the privacy line states
 *  exactly what is measured (anonymous categories) — contact details stay
 *  local until a request is submitted. */
import { useState } from 'react';
import Link from 'next/link';

import { bottleneckOptions, finderMatch, OUTCOME_OPTIONS, SOLUTION_UI, STATUS_LABEL, TYPE_OPTIONS } from '@/content/solutions';
import type { Locale } from '@/content/i18n';
import { qEvent } from '@/lib/analytics';

export function SolutionFinder({ locale }: { locale: Locale }) {
  const l = locale === 'fa' ? 'fa' : 'en';
  const t = SOLUTION_UI.finder;
  const [outcome, setOutcome] = useState<string | null>(null);
  const [bottleneck, setBottleneck] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const bottlenecks = bottleneckOptions(outcome ?? undefined);
  const answered = outcome && (bottleneck || type);
  const results = submitted && answered ? finderMatch({ outcome: outcome ?? undefined, bottleneck: bottleneck ?? undefined, type: type ?? undefined }) : [];

  function pickOutcome(key: string) {
    setOutcome(key);
    setSubmitted(false);
    // Options are outcome-scoped: a previously chosen bottleneck outside the
    // new outcome's group would silently stop matching — clear it instead.
    if (bottleneck && !bottleneckOptions(key).some((o) => o.key === bottleneck)) setBottleneck(null);
  }

  return (
    <div className="sol-finder">
      <h1>{t.title[l]}</h1>
      <p className="lead">{t.lead[l]}</p>

      <div className="sol-q">
        <h3 id="fq-outcome">{t.q1[l]}</h3>
        <div className="opts" role="group" aria-labelledby="fq-outcome">
          {OUTCOME_OPTIONS.map((o) => (
            <button key={o.key} className={`opt-btn ${outcome === o.key ? 'on' : ''}`} aria-pressed={outcome === o.key}
              onClick={() => pickOutcome(o.key)}>
              {o.label[l]}
            </button>
          ))}
        </div>
      </div>

      <div className="sol-q">
        <h3 id="fq-bottleneck">{t.q2[l]}</h3>
        <div className="opts" role="group" aria-labelledby="fq-bottleneck">
          {bottlenecks.map((o) => (
            <button key={o.key} className={`opt-btn ${bottleneck === o.key ? 'on' : ''}`} aria-pressed={bottleneck === o.key}
              onClick={() => { setBottleneck(bottleneck === o.key ? null : o.key); setSubmitted(false); }}>
              {o.label[l]}
            </button>
          ))}
        </div>
      </div>

      <div className="sol-q">
        <h3 id="fq-type">{t.q3[l]}</h3>
        <div className="opts" role="group" aria-labelledby="fq-type">
          {TYPE_OPTIONS.map((o) => (
            <button key={o.key} className={`opt-btn ${type === o.key ? 'on' : ''}`} aria-pressed={type === o.key}
              onClick={() => { setType(type === o.key ? null : o.key); setSubmitted(false); }}>
              {o.label[l]}
            </button>
          ))}
        </div>
      </div>

      <button className="sol-submit" onClick={() => { qEvent('solution_finder_start', { locale }); qEvent('solution_finder_complete', { locale, outcome: outcome ?? undefined, bottleneck: bottleneck ?? undefined, type: type ?? undefined }); setSubmitted(true); }} disabled={!answered}>
        {l === 'fa' ? 'نمایش پیشنهادها' : 'Show suggestions'}
      </button>

      {submitted && (
        <div className="sol-finder-results" aria-live="polite">
          <div className="sol-section-h">{t.matches[l]}</div>
          {results.length === 0 ? (
            <p className="sol-empty">{l === 'fa'
              ? 'با این ترکیب، پیشنهاد مشخصی نداریم — اما مسیر درست، یک گفت‌وگوی کوتاه است.'
              : 'No specific match for this combination — but the right path is a short conversation.'}</p>
          ) : (
            <div className="sol-grid">
              {results.map(({ solution: s, reasons }) => (
                <article key={s.id} className="sol-card">
                  <span className={`sol-badge ${s.status}`}>{STATUS_LABEL[s.status][l]}</span>
                  <h3><Link href={`/${locale}/solutions/${s.id}`}>{s.title[l]}</Link></h3>
                  <p className="sol-one">{s.oneLiner[l]}</p>
                  <p className="sol-why">
                    {t.why[l]}: {reasons.map((r) => r[l]).join(' · ')}
                  </p>
                  <div className="sol-card-actions">
                    <Link className="sol-cta-mini" href={`/${locale}/solutions/${s.id}/request?src=finder`}>
                      {l === 'fa' ? 'درخواست این راهکار' : 'Request This Solution'}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
          <div className="sol-bridge" style={{ maxWidth: '100%' }}>
            <h3>{t.custom[l]}</h3>
            <p>{t.customNote[l]}</p>
            <div className="links">
              <Link className="sol-cta-mini" href={`/${locale}/contact?intent=other&src=finder`}>
                {l === 'fa' ? 'شرح مسئله شما' : 'Describe your problem'}
              </Link>
            </div>
          </div>
          <div className="restart">
            <button className="sol-chip" onClick={() => { setOutcome(null); setBottleneck(null); setType(null); setSubmitted(false); }}>
              {t.start[l]}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
