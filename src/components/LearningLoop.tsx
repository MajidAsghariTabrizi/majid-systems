'use client';

/**
 * SystemFlow — the one canonical loop of the AI-native company:
 * SIGNAL → RETRIEVE STATE → DECIDE → AUTHORITY CHECK → ACT → MEASURE → LEARN.
 * A signal pulse steps through it while visible; static under reduced motion.
 * The authority gate is the distinguished step — it is the thesis.
 */

import { useEffect, useState } from 'react';

import { SYSTEM_FLOW } from '@/content/quantiviq';
import { useInView, usePrefersReducedMotion } from '@/lib/motion';

export function SystemFlow() {
  const { ref, inView } = useInView<HTMLDivElement>('60px');
  const reduced = usePrefersReducedMotion();
  const [step, setStep] = useState(0);
  const animate = inView && !reduced;

  useEffect(() => {
    if (!animate) return;
    const id = setInterval(() => setStep((s) => (s + 1) % SYSTEM_FLOW.length), 1100);
    return () => clearInterval(id);
  }, [animate]);

  return (
    <div ref={ref}>
      <ol className="loop-flow" aria-label="How the system learns — signal to learning">
        {SYSTEM_FLOW.map((s, i) => (
          <li
            key={s.key}
            className={`loop-step ${s.key === 'authority' ? 'loop-step-gate' : ''} ${
              animate && i === step ? 'is-active' : ''
            } ${!animate && i === SYSTEM_FLOW.length - 1 ? 'is-active-static' : ''}`}
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
    </div>
  );
}
