'use client';

/**
 * Enterprise AI Stack atlas — interactive five-layer explorer.
 * Pure presentation over content/knowledge/oss.json; no invented capability:
 * every layer states its OSS/commercial boundary and links its upstream repo.
 */
import { useState } from 'react';
import Link from 'next/link';
import {
  OSS,
  OSS_BY_ID,
  BOOK_BY_SLUG,
  type Locale,
} from '@/content/knowledge';
import { dict } from '@/content/i18n';

export default function StackAtlas({ locale }: { locale: Locale }) {
  const t = dict(locale).stackPage;
  const [active, setActive] = useState(OSS.layers[0].id);
  const layer = OSS_BY_ID[active];

  return (
    <div className="stack-atlas">
      <p className="stack-status-badge">
        <span className="dot dot-hollow" aria-hidden="true" /> {t.statusBadge}
      </p>

      <div className="stack-diagram" role="tablist" aria-label={t.h1}>
        {OSS.layers.map((l, i) => (
          <button
            key={l.id}
            id={`layer-tab-${l.id}`}
            role="tab"
            aria-selected={active === l.id}
            aria-controls={`layer-panel-${l.id}`}
            className={`stack-node ${active === l.id ? 'on' : ''}`}
            onClick={() => setActive(l.id)}
          >
            <span className="stack-node-num" aria-hidden="true">0{l.order}</span>
            <span className="stack-node-name">{l.name[locale]}</span>
            <span className="stack-node-key">{l.license.label}</span>
          </button>
        ))}
      </div>

      <section
        id={`layer-panel-${layer.id}`}
        role="tabpanel"
        aria-labelledby={`layer-tab-${layer.id}`}
        className="stack-panel"
        key={layer.id}
      >
        <header className="stack-panel-head">
          <h2>{layer.name[locale]}</h2>
          <a className="repo-link" href={layer.githubUrl} target="_blank" rel="noopener noreferrer">
            GitHub ↗
          </a>
        </header>
        <p className="stack-brief">{layer.brief[locale]}</p>
        <div className="stack-grid">
          <div className="stack-cell">
            <h3>{t.whatItAnswers}</h3>
            <p>{layer.inputs[locale]} → {layer.outputs[locale]}</p>
          </div>
          <div className="stack-cell">
            <h3>{t.whatItDoesNot}</h3>
            <p>{layer.whenNot[locale]}</p>
          </div>
          <div className="stack-cell">
            <h3>{t.licenseBoundary}</h3>
            <p>
              <strong>{layer.license.label}.</strong> {layer.license.note}
              {layer.license.boundaryUrl && (
                <>
                  {' '}
                  <a href={layer.license.boundaryUrl} target="_blank" rel="noopener noreferrer">
                    {locale === 'fa' ? 'مرز قابلیت‌ها ↗' : 'capability boundary ↗'}
                  </a>
                </>
              )}
              {layer.license.cncfUrl && (
                <>
                  {' · '}
                  <a href={layer.license.cncfUrl} target="_blank" rel="noopener noreferrer">CNCF ↗</a>
                </>
              )}
            </p>
          </div>
          <div className="stack-cell stack-cell-guard">
            <h3>{locale === 'fa' ? 'محافظت' : 'Guard'}</h3>
            <p>{layer.guard[locale]}</p>
          </div>
        </div>
        {layer.relatedBooks.length > 0 && (
          <p className="stack-related-books">
            {t.relatedBooks}:{' '}
            {layer.relatedBooks.map((slug, i) => (
              <span key={slug}>
                {i > 0 && ' · '}
                <Link href={`/${locale}/insights/books/${slug}`}>{BOOK_BY_SLUG[slug]?.title[locale] ?? slug}</Link>
              </span>
            ))}
          </p>
        )}
        <p className="stack-deeplink">
          <Link href={`/${locale}/explore#source-${layer.id}`}>{t.deepLink} →</Link>
        </p>
        <p className="stack-verified-at">{t.verifiedAt}: {OSS.verifiedAt}</p>
      </section>

      <section className="stack-story">
        <h2>{t.combinedTitle}</h2>
        <p className="stack-story-note">{t.combinedNote}</p>
        <p className="stack-story-q">“{OSS.combinedStory.question[locale]}”</p>
        <ol className="stack-story-steps">
          {OSS.combinedStory.steps.map((s, i) => (
            <li key={i}>
              <span className="story-idx" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <span>{s[locale]}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="stack-table-wrap">
        <h2>{t.tableTitle}</h2>
        <div className="table-scroll" tabIndex={0} role="region" aria-label={t.tableTitle}>
          <table className="stack-table">
            <thead>
              <tr>
                <th>{locale === 'fa' ? 'لایه' : 'Layer'}</th>
                <th>{t.whatItAnswers}</th>
                <th>{t.whatItDoesNot}</th>
                <th>{t.licenseBoundary}</th>
                <th>{t.inputsOutputs}</th>
                <th>{locale === 'fa' ? 'پیوند' : 'Link'}</th>
              </tr>
            </thead>
            <tbody>
              {OSS.layers.map((l) => (
                <tr key={l.id} id={l.id}>
                  <td><strong>{l.name[locale]}</strong></td>
                  <td>{l.outputs[locale]}</td>
                  <td>{l.whenNot[locale]}</td>
                  <td>{l.license.label}</td>
                  <td>{l.inputs[locale]} → {l.outputs[locale]}</td>
                  <td>
                    <a href={l.githubUrl} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
