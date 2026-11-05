'use client';

/** Deterministic guided finder — three questions, transparent tag matching,
 *  zero LLM calls. Closure 2026-11-02: bottleneck options grouped by the
 *  chosen outcome (clearing incompatible selections), pressed-button
 *  semantics with programmatic selected state, result cards carry the same
 *  detailed/scoping qualification as the catalog, and the privacy line states
 *  exactly what is measured (anonymous categories) — contact details stay
 *  local until a request is submitted. */
import { useRef, useState } from 'react';
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
  const resultsRef = useRef<HTMLHeadingElement>(null);
  const outcomeRef = useRef<HTMLHeadingElement>(null);

  const bottlenecks = bottleneckOptions(outcome ?? undefined);
  const answered = outcome && (bottleneck || type);
  const completed = Number(Boolean(outcome)) + Number(Boolean(bottleneck)) + Number(Boolean(type));
  const results = submitted && answered ? finderMatch({ outcome: outcome ?? undefined, bottleneck: bottleneck ?? undefined, type: type ?? undefined }) : [];

  function pickOutcome(key: string) {
    setOutcome(key);
    setSubmitted(false);
    // Options are outcome-scoped: a previously chosen bottleneck outside the
    // new outcome's group would silently stop matching — clear it instead.
    if (bottleneck && !bottleneckOptions(key).some((o) => o.key === bottleneck)) setBottleneck(null);
  }

  function showSuggestions() {
    if (!answered) return;
    qEvent('solution_finder_start', { locale });
    qEvent('solution_finder_complete', { locale, outcome: outcome ?? undefined, bottleneck: bottleneck ?? undefined, type: type ?? undefined });
    setSubmitted(true);
    requestAnimationFrame(() => {
      resultsRef.current?.focus({ preventScroll: true });
      resultsRef.current?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
  }

  function restart() {
    setOutcome(null); setBottleneck(null); setType(null); setSubmitted(false);
    requestAnimationFrame(() => outcomeRef.current?.focus());
  }

  return (
    <div className="sol-finder">
      <Link className="sol-form-back" href={`/${locale}/solutions`}><span aria-hidden="true">{l === 'fa' ? '→' : '←'}</span>{l === 'fa' ? 'همه راهکارها' : 'All solutions'}</Link>
      <p className="eyebrow">{l === 'fa' ? 'یک نقطه شروع روشن' : 'Find a clear starting point'}</p>
      <h1>{t.title[l]}</h1>
      <p className="lead">{l === 'fa' ? 'اولویتتان را انتخاب کنید، سپس از مسئله یا نوع کسب‌وکارتان بگویید. چند مسیر نزدیک‌تر به نیازتان را برای بررسی پیشنهاد می‌کنیم.' : 'Choose your priority, then add a bottleneck or business type. We’ll suggest a few relevant paths for you to explore.'}</p>
      <ol className="sol-finder-progress" aria-label={l === 'fa' ? 'پرسش‌های انتخاب راهکار' : 'Solution finder questions'}>
        {[
          [l === 'fa' ? 'اولویت شما' : 'Your priority', Boolean(outcome)],
          [l === 'fa' ? 'مسئله فعلی' : 'Your bottleneck', Boolean(bottleneck)],
          [l === 'fa' ? 'نوع کسب‌وکار' : 'Business type', Boolean(type)],
        ].map(([label, complete], i) => <li key={String(label)} className={complete ? 'is-complete' : ''}><span aria-hidden="true">{complete ? '✓' : (i + 1).toLocaleString(l === 'fa' ? 'fa-IR' : 'en-US')}</span><span>{label}</span></li>)}
      </ol>
      <p className="sol-finder-status" role="status">{l === 'fa' ? answered ? `${completed.toLocaleString('fa-IR')} پاسخ انتخاب شده؛ آماده بررسی پیشنهادها` : `${completed.toLocaleString('fa-IR')} از ۳ پاسخ انتخاب شده` : answered ? `${completed} answers selected — ready to explore` : `${completed} of 3 answers selected`}</p>

      <div className="sol-q">
        <h2 id="fq-outcome" ref={outcomeRef} tabIndex={-1}><span className="sol-q-number" aria-hidden="true">{l === 'fa' ? '۱' : '1'}</span>{t.q1[l]}</h2>
        <div className="opts" role="group" aria-labelledby="fq-outcome">
          {OUTCOME_OPTIONS.map((o) => (
            <button key={o.key} className={`opt-btn ${outcome === o.key ? 'on' : ''}`} aria-pressed={outcome === o.key}
              onClick={() => pickOutcome(o.key)}>
              {o.label[l]}
            </button>
          ))}
        </div>
      </div>

      {outcome ? <div className="sol-q">
        <h2 id="fq-bottleneck"><span className="sol-q-number" aria-hidden="true">{l === 'fa' ? '۲' : '2'}</span>{t.q2[l]}</h2>
        <p className="sol-q-hint">{l === 'fa' ? 'یک مورد را انتخاب کنید؛ اگر هنوز مطمئن نیستید، نوع کسب‌وکارتان را در پرسش بعدی مشخص کنید.' : 'Choose one. If you’re unsure, add your business type in the next question instead.'}</p>
        <div className="opts" role="group" aria-labelledby="fq-bottleneck">
          {bottlenecks.map((o) => (
            <button key={o.key} className={`opt-btn ${bottleneck === o.key ? 'on' : ''}`} aria-pressed={bottleneck === o.key}
              onClick={() => { setBottleneck(bottleneck === o.key ? null : o.key); setSubmitted(false); }}>
              {o.label[l]}
            </button>
          ))}
        </div>
      </div> : <div className="sol-finder-next"><span aria-hidden="true">↓</span><p>{l === 'fa' ? 'با انتخاب اولویت، گزینه‌های مرتبط با مسئله شما اینجا نمایش داده می‌شود.' : 'Choose a priority above to reveal relevant bottlenecks and business types.'}</p></div>}

      {outcome && <div className="sol-q">
        <h2 id="fq-type"><span className="sol-q-number" aria-hidden="true">{l === 'fa' ? '۳' : '3'}</span>{t.q3[l]}</h2>
        <p className="sol-q-hint">{l === 'fa' ? 'اگر مسئله را انتخاب کرده‌اید، پاسخ به این پرسش اختیاری است و به دقیق‌تر شدن پیشنهادها کمک می‌کند.' : 'Optional if you’ve chosen a bottleneck. This helps narrow the suggestions.'}</p>
        <div className="opts" role="group" aria-labelledby="fq-type">
          {TYPE_OPTIONS.map((o) => (
            <button key={o.key} className={`opt-btn ${type === o.key ? 'on' : ''}`} aria-pressed={type === o.key}
              onClick={() => { setType(type === o.key ? null : o.key); setSubmitted(false); }}>
              {o.label[l]}
            </button>
          ))}
        </div>
      </div>}

      <button type="button" className="sol-submit" onClick={showSuggestions} disabled={!answered} aria-describedby={!answered ? 'finder-selection-hint' : undefined}>
        {l === 'fa' ? 'نمایش پیشنهادها' : 'Show suggestions'}
      </button>
      {!answered && <p id="finder-selection-hint" className="sol-q-hint">{l === 'fa' ? 'اولویت و دست‌کم یکی از دو مورد «مسئله فعلی» یا «نوع کسب‌وکار» را انتخاب کنید.' : 'Choose a priority and at least one bottleneck or business type to continue.'}</p>}
      <details className="sol-finder-privacy"><summary>{l === 'fa' ? 'پیشنهادها چگونه انتخاب می‌شوند؟' : 'How are suggestions selected?'}</summary><p>{l === 'fa' ? 'پیشنهادها با تطبیق انتخاب‌های شما با موضوع راهکارها مرتب می‌شوند. برای انتخاب نهایی، شرایط واقعی کسب‌وکارتان را با هم بررسی می‌کنیم.' : 'Your selections are matched to solution topics. We review your real workflow and data with you before recommending an engagement.'}</p><p>{t.lead[l]}</p></details>

      {submitted && (
        <section className="sol-finder-results" aria-labelledby="finder-results-title">
          <h2 id="finder-results-title" className="sol-section-h" ref={resultsRef} tabIndex={-1}>{t.matches[l]}</h2>
          <p className="sol-finder-result-note">{l === 'fa' ? 'ابتدا فرایند، ورودی‌ها و خروجی‌های هر گزینه را ببینید؛ اگر به نیاز شما نزدیک بود، برای بررسی شرایطتان درخواست ثبت کنید.' : 'Explore each workflow, its inputs and deliverables first. If it looks relevant, share your context so we can review the fit.'}</p>
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
                    <Link className="sol-link" href={`/${locale}/solutions/${s.id}`}>
                      {l === 'fa' ? 'این راهکار چطور کار می‌کند؟' : 'See how it works'}<span aria-hidden="true">{l === 'fa' ? '←' : '→'}</span>
                    </Link>
                    <Link className="sol-cta-mini" href={`/${locale}/solutions/${s.id}/request?src=finder`}>
                      {l === 'fa' ? 'بررسی نیاز من' : 'Discuss my need'}
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
            <button type="button" className="sol-chip" onClick={restart}>
              {t.start[l]}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
