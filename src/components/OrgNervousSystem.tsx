'use client';

/**
 * OrgNervousSystem — the AI-Native Organization OS as an interactive diagram.
 * The company brain sits at the center (it is layer 06 and is selectable);
 * the other seven layers orbit it. Selecting any element (click / keyboard)
 * explains its role. Signal pulses run on the connection lines while visible,
 * disabled under prefers-reduced-motion.
 */

import { useState } from 'react';

import { OS_LAYERS } from '@/content/quantiviq';
import { useInView, usePrefersReducedMotion } from '@/lib/motion';

const BRAIN_KEY = 'brain';

// Satellite positions (percent of stage box) for the seven orbiting layers,
// in OS_LAYERS order with the brain layer removed.
const POS = [
  { x: 50, y: 9 }, // 01 governance (top)
  { x: 86, y: 26 }, // 02 authority
  { x: 93, y: 55 }, // 03 control plane
  { x: 76, y: 84 }, // 04 workflows
  { x: 50, y: 93 }, // 05 agents
  { x: 24, y: 84 }, // 07 data plane
  { x: 7, y: 55 }, // 08 tools
  { x: 14, y: 26 }, // (spare — unused)
];

/** Localized layer names/roles can be injected; default = canonical EN data. */
export function OrgNervousSystem({
  layers = OS_LAYERS,
  locale = 'en',
}: {
  layers?: { key: string; num: string; name: string; role: string; detail: string }[];
  locale?: 'en' | 'fa';
}) {
  // Keep this homepage diagram independent of the full simulator dictionary.
  const t = locale === 'fa'
    ? { a11y_os_stage: 'سیستم‌عامل سازمان بومی هوش مصنوعی — یک لایه انتخاب کنید', layer_of_8: 'لایهٔ {n} از ۰۸' }
    : { a11y_os_stage: 'The AI-native organization operating system — select a layer', layer_of_8: 'Layer {n} / 08' };
  const number = (value: string) => Number(value).toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US', { minimumIntegerDigits: 2, useGrouping: false });
  const [activeKey, setActiveKey] = useState('control-plane');
  const { ref, inView } = useInView<HTMLDivElement>('60px');
  const reduced = usePrefersReducedMotion();
  const animate = inView && !reduced;

  const brain = layers.find((l) => l.key === BRAIN_KEY)!;
  const orbit = layers.filter((l) => l.key !== BRAIN_KEY);
  const active = layers.find((l) => l.key === activeKey) ?? brain;

  return (
    <div className="os-viz" ref={ref}>
      <div className="os-stage" role="group" aria-label={t.a11y_os_stage}>
        <svg className="os-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          {orbit.map((l, i) => (
            <line
              key={l.key}
              x1="50"
              y1="50"
              x2={POS[i].x}
              y2={POS[i].y}
              className={`os-line ${l.key === activeKey ? 'is-active' : ''} ${animate ? 'is-animated' : ''}`}
              style={{ animationDelay: `${i * -0.9}s` }}
            />
          ))}
        </svg>

        <button
          type="button"
          className={`os-center ${activeKey === BRAIN_KEY ? 'is-active' : ''}`}
          onMouseEnter={() => setActiveKey(BRAIN_KEY)}
          onFocus={() => setActiveKey(BRAIN_KEY)}
          onClick={() => setActiveKey(BRAIN_KEY)}
          aria-pressed={activeKey === BRAIN_KEY}
        >
          <span className="os-center-title">{brain.name}</span>
          <span className="os-center-sub">{brain.role}</span>
        </button>

        {orbit.map((l, i) => (
          <button
            key={l.key}
            type="button"
            className={`os-node ${l.key === activeKey ? 'is-active' : ''}`}
            style={{ left: `${POS[i].x}%`, top: `${POS[i].y}%` }}
            onMouseEnter={() => setActiveKey(l.key)}
            onFocus={() => setActiveKey(l.key)}
            onClick={() => setActiveKey(l.key)}
            aria-pressed={l.key === activeKey}
          >
            <span className="os-node-num">{number(l.num)}</span>
            <span className="os-node-name">{l.name}</span>
            <span className="os-node-role">{l.role}</span>
          </button>
        ))}
      </div>

      <div className="os-detail" aria-live="polite">
        <span className="eyebrow">{t.layer_of_8.replace('{n}', number(active.num))}</span>
        <h3>{active.name}</h3>
        <p className="os-detail-role">{active.role}</p>
        <p className="os-detail-body">{active.detail}</p>
      </div>
    </div>
  );
}
