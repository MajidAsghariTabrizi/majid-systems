'use client';

/**
 * BrainDemo — a scripted query against the company brain.
 * Deterministic: the same query always produces the same knowledge-state
 * answer, revealed progressively (instantly under reduced motion).
 */

import { useEffect, useRef, useState } from 'react';

import { BRAIN_DEMO } from '@/content/quantiviq';
import { useInView, usePrefersReducedMotion } from '@/lib/motion';

type RunState = 'idle' | 'running' | 'done';

const STATE_KIND: Record<string, string> = {
  OBSERVED: 'observed',
  VERIFIED: 'verified',
  UNKNOWN: 'unknown',
  STALE: 'stale',
  SUPERSEDED: 'superseded',
  PATH: 'path',
};

export function BrainDemo() {
  const [run, setRun] = useState<RunState>('idle');
  const [revealed, setRevealed] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const { ref, inView } = useInView<HTMLDivElement>('60px');
  const reduced = usePrefersReducedMotion();
  const total = BRAIN_DEMO.sections.length;

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
            {run === 'running' && 'RESOLVING…'}
            {run === 'done' && `ANSWERED · ${new Set(
              BRAIN_DEMO.sections.flatMap((s) => s.items.map((i) => i.state))
            ).size} CLAIM STATES`}
          </span>
        </div>
        <div className="brain-term-query">
          <span aria-hidden>›</span>
          <code>{BRAIN_DEMO.query}</code>
          <button type="button" className="brain-run" onClick={execute} disabled={run === 'running'}>
            {run === 'done' ? 'run again' : 'run query'}
          </button>
        </div>

        {run === 'idle' && (
          <p className="brain-term-hint">
            A real company brain answers with the state of its knowledge — not a
            generated guess. Run the query to see the shape of the answer.
          </p>
        )}

        {run === 'done' &&
          BRAIN_DEMO.sections.map((sec, si) => (
            <div
              key={sec.heading}
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
                      <span className="brain-claim-evidence">evidence: {item.evidence}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>

      <div className="brain-legend" aria-label="Knowledge state legend">
        {BRAIN_DEMO.legend.map((l) => (
          <span key={l.state} className="brain-legend-item">
            <span className={`chip chip-${STATE_KIND[l.state] ?? 'unknown'}`}>{l.state}</span>
            <span className="brain-legend-meaning">{l.meaning}</span>
          </span>
        ))}
      </div>

      <p className="brain-caption">{BRAIN_DEMO.caption}</p>
    </div>
  );
}
