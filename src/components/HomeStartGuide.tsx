'use client';

import Link from 'next/link';
import { useId, useRef, useState, type KeyboardEvent } from 'react';
import type { Locale } from '@/content/i18n';
import { homeGuide } from '@/content/home-guide';

/** A first-visit route chooser, with no form, tracking payload or account step. */
export function HomeStartGuide({ locale }: { locale: Locale }) {
  const copy = homeGuide(locale);
  const [selected, setSelected] = useState(0);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const id = useId();

  function onTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const direction = locale === 'fa' ? -1 : 1;
    let next: number | undefined;
    if (event.key === 'ArrowRight') next = (index + direction + copy.paths.length) % copy.paths.length;
    if (event.key === 'ArrowLeft') next = (index - direction + copy.paths.length) % copy.paths.length;
    if (event.key === 'ArrowDown') next = (index + 1) % copy.paths.length;
    if (event.key === 'ArrowUp') next = (index - 1 + copy.paths.length) % copy.paths.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = copy.paths.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    setSelected(next);
    tabs.current[next]?.focus();
  }

  return (
    <section id="start-here" className="home-guide" aria-labelledby={`${id}-heading`}>
      <div className="container-wide">
        <div className="home-guide-heading">
          <span className="eyebrow sig">{copy.eyebrow}</span>
          <h2 id={`${id}-heading`}>{copy.title}</h2>
          <p>{copy.intro}</p>
        </div>
        <div className="home-guide-shell">
          <div className="home-guide-tabs" role="tablist" aria-label={copy.tabsLabel}>
            {copy.paths.map((path, index) => (
              <button
                key={path.key}
                ref={(element) => { tabs.current[index] = element; }}
                id={`${id}-tab-${index}`}
                type="button"
                role="tab"
                aria-selected={selected === index}
                aria-controls={`${id}-panel-${index}`}
                tabIndex={selected === index ? 0 : -1}
                onClick={() => setSelected(index)}
                onKeyDown={(event) => onTabKey(event, index)}
              >
                <span className="home-guide-tab-number" aria-hidden="true">
                  {new Intl.NumberFormat(locale, { minimumIntegerDigits: 2 }).format(index + 1)}
                </span>
                <span><strong>{path.label}</strong><small>{path.hint}</small></span>
                <span className="home-guide-tab-arrow" aria-hidden="true">{locale === 'fa' ? '←' : '→'}</span>
              </button>
            ))}
          </div>
          <div className="home-guide-panels">
            {copy.paths.map((path, index) => (
              <div
                key={path.key}
                id={`${id}-panel-${index}`}
                className="home-guide-panel"
                role="tabpanel"
                aria-labelledby={`${id}-tab-${index}`}
                hidden={selected !== index}
                tabIndex={0}
              >
                <span className="home-guide-panel-label">{copy.nextLabel}</span>
                <h3>{path.title}</h3>
                <p>{path.body}</p>
                <ol className="home-guide-steps">
                  {path.steps.map((step, stepIndex) => <li key={step}><span className="home-guide-step-number" aria-hidden="true">{new Intl.NumberFormat(locale).format(stepIndex + 1)}</span>{step}</li>)}
                </ol>
                <div className="hero-actions home-guide-actions">
                  <Link className="btn btn-primary" href={`/${locale}${path.href}`}>
                    {path.primary}<span aria-hidden="true">{locale === 'fa' ? '←' : '→'}</span>
                  </Link>
                  <Link className="home-more-link" href={`/${locale}${path.secondaryHref}`}>{path.secondary}</Link>
                </div>
                <p className="home-guide-note">{path.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
