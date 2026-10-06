'use client';

/**
 * LearningLoop — the organizational learning loop, animated when visible,
 * static under reduced motion. Below it: the OLD vs AI-NATIVE comparison
 * of what happens to experience.
 */

import { useEffect, useState } from 'react';

import { LOOP_NATIVE, LOOP_OLD, LOOP_STEPS } from '@/content/quantiviq';
import { useInView, usePrefersReducedMotion } from '@/lib/motion';

export function LearningLoop() {
  const { ref, inView } = useInView<HTMLDivElement>('60px');
  const reduced = usePrefersReducedMotion();
  const [step, setStep] = useState(0);
  const animate = inView && !reduced;

  useEffect(() => {
    if (!animate) return;
    const id = setInterval(() => setStep((s) => (s + 1) % LOOP_STEPS.length), 1100);
    return () => clearInterval(id);
  }, [animate]);

  return (
    <div ref={ref}>
      <ol className="loop-flow" aria-label="The learning loop">
        {LOOP_STEPS.map((s, i) => (
          <li
            key={s.key}
            className={`loop-step ${animate && i === step ? 'is-active' : ''} ${
              !animate && i === LOOP_STEPS.length - 1 ? 'is-active-static' : ''
            }`}
            aria-current={animate && i === step ? 'step' : undefined}
          >
            <span className="loop-step-label">{s.label}</span>
            <span className="loop-step-note">{s.note}</span>
          </li>
        ))}
        <li className="loop-return" aria-hidden>
          <span>↺ compounds</span>
        </li>
      </ol>

      <div className="loop-compare">
        <div className="loop-col loop-col-old">
          <h4>{LOOP_OLD.title}</h4>
          <ol>
            {LOOP_OLD.steps.map((s, i) => (
              <li key={s} style={{ opacity: 1 - i * 0.13 }}>
                <span aria-hidden>— </span>
                {s}
              </li>
            ))}
          </ol>
          <span className="chip chip-disputed">EXPERIENCE EVAPORATES</span>
        </div>
        <div className="loop-col loop-col-native">
          <h4>{LOOP_NATIVE.title}</h4>
          <ol>
            {LOOP_NATIVE.steps.map((s, i) => (
              <li key={s} style={{ opacity: 0.72 + i * 0.06 }}>
                <span aria-hidden>+ </span>
                {s}
              </li>
            ))}
          </ol>
          <span className="chip chip-verified">EXPERIENCE COMPOUNDS</span>
        </div>
      </div>
    </div>
  );
}
