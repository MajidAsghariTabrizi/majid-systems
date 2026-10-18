'use client';

/**
 * BrainDemo — a scripted query against the company brain.
 * Deterministic: the same query always produces the same knowledge-state
 * answer, revealed progressively (instantly under reduced motion).
 *
 * Bilingual: all user-visible copy comes from simLabels[locale] (sim.ts); the
 * demo DATA lives in the dictionary keys (demo_*) so EN and FA never diverge.
 * Claim-state codes stay canonical Latin (site convention + CSS class keys).
 */

import { useEffect, useRef, useState } from 'react';

import { simLabels } from '@/content/i18n/sim';
import { useInView, usePrefersReducedMotion } from '@/lib/motion';

type RunState = 'idle' | 'running' | 'done';
type Locale = 'en' | 'fa';

const STATE_KIND: Record<string, string> = {
  OBSERVED: 'observed',
  VERIFIED: 'verified',
  UNKNOWN: 'unknown',
  STALE: 'stale',
  SUPERSEDED: 'superseded',
  PATH: 'path',
};

/** Section ids in render order — display headings come from the dictionary. */
const SECTION_IDS = ['known', 'unknown', 'prior', 'next'] as const;

export function BrainDemo({ locale = 'en' }: { locale?: Locale }) {
  const t = simLabels[locale];
  const [run, setRun] = useState<RunState>('idle');
  const [revealed, setRevealed] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const { ref, inView } = useInView<HTMLDivElement>('60px');
  const reduced = usePrefersReducedMotion();
  void inView;

  const sections = [
    {
      id: 'known',
      heading: t.demo_section_known,
      items: [
        { state: 'OBSERVED', text: t.demo_known_1, evidence: t.demo_ev_known_1 },
        { state: 'OBSERVED', text: t.demo_known_2, evidence: t.demo_ev_known_2 },
        { state: 'OBSERVED', text: t.demo_known_3, evidence: t.demo_ev_known_3 },
      ],
    },
    {
      id: 'unknown',
      heading: t.demo_section_unknown,
      items: [
        { state: 'UNKNOWN', text: t.demo_unknown_1, evidence: t.demo_ev_unknown_1 },
        { state: 'UNKNOWN', text: t.demo_unknown_2, evidence: t.demo_ev_unknown_2 },
      ],
    },
    {
      id: 'prior',
      heading: t.demo_section_prior,
      items: [
        { state: 'STALE', text: t.demo_prior_1, evidence: t.demo_ev_prior_1 },
        { state: 'SUPERSEDED', text: t.demo_prior_2, evidence: t.demo_ev_prior_2 },
      ],
    },
    {
      id: 'next',
      heading: t.demo_section_next,
      items: [{ state: 'PATH', text: t.demo_next_1, evidence: t.demo_ev_next_1 }],
    },
  ];
  const total = sections.length;
  const claimStates = new Set(sections.flatMap((s) => s.items.map((i) => i.state))).size;

  const legend = [
    { state: 'OBSERVED', meaning: t.legend_observed },
    { state: 'VERIFIED', meaning: t.legend_verified },
    { state: 'UNKNOWN', meaning: t.legend_unknown },
    { state: 'STALE', meaning: t.legend_stale },
    { state: 'SUPERSEDED', meaning: t.legend_superseded },
    { state: 'PATH', meaning: t.legend_path },
  ];

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => clearTimers, []);

  const execute = () => {
    clearTimers();
    setRun('running');
    setRevealed(0);
    if (reduced) {
      setRun('done');
      setRevealed(total);
      return;
    }
    timers.current.push(setTimeout(() => setRun('done'), 500));
    for (let i = 1; i <= total; i++) {
      timers.current.push(setTimeout(() => setRevealed(i), 500 + i * 380));
    }
  };

  return (
    <div className="brain-demo" ref={ref}>
      <div className="brain-term" data-run={run}>
        <div className="brain-term-head">
          <span className="brain-term-title">company-brain · query</span>
          <span className="brain-term-state">
            {run === 'idle' && 'READY'}
            {run === 'running' && t.term_resolving}
            {run === 'done' && t.term_answered.replace('{n}', String(claimStates))}
          </span>
        </div>
        <div className="brain-term-query">
          <span aria-hidden>›</span>
          <code>{t.demo_query}</code>
          <button
            type="button"
            className="brain-run"
            onClick={execute}
            disabled={run === 'running'}
          >
            {run === 'done' ? t.btn_run_again : t.btn_run_query}
          </button>
        </div>

        {run === 'idle' && <p className="brain-term-hint">{t.demo_hint}</p>}

        {run === 'done' &&
          sections.map((sec, si) => (
            <div
              key={sec.id}
              className={`brain-section ${si < revealed ? 'is-shown' : ''}`}
              aria-hidden={si >= revealed}
            >
              <h4>{sec.heading}</h4>
              <ul>
                {sec.items.map((item) => (
                  <li key={item.text} className="brain-claim">
                    <span className={`chip chip-${STATE_KIND[item.state] ?? 'unknown'}`}>
                      {item.state}
                    </span>
                    <span className="brain-claim-text">
                      {item.text}
                      <span className="brain-claim-evidence">
                        {locale === 'fa' ? 'شاهد' : 'evidence'}: {item.evidence}
                      </span>                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>

      <div
        className="brain-legend"
        aria-label={locale === 'fa' ? 'راهنمای وضعیت دانش' : 'Knowledge state legend'}
      >
        {legend.map((l) => (
          <span key={l.state} className="brain-legend-item">
            <span className={`chip chip-${STATE_KIND[l.state] ?? 'unknown'}`}>{l.state}</span>
            <span className="brain-legend-meaning">{l.meaning}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
