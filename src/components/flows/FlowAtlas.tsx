'use client';

/**
 * Workflow Atlas — 12 generic org flows + 11 mindsets.
 * Card mode (default) and an accessible list mode; both keyboard-operable,
 * no hover-only functionality. Contract fields from content/knowledge/flows.json.
 */
import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  FLOWS,
  FLOW_BY_ID,
  FLOW_CONTRACT_FIELDS,
  FLOW_DOMAIN_LABELS,
  CONCEPTS,
  BOOK_BY_SLUG,
  OSS_BY_ID,
  type FlowDomain,
  type Locale,
} from '@/content/knowledge';
import { dict } from '@/content/i18n';
import { matchesSearch } from '@/lib/search-text';

const ALL = 'all';

export default function FlowAtlas({ locale }: { locale: Locale }) {
  const t = dict(locale).flowsPage;
  const [domain, setDomain] = useState<string>(ALL);
  const [open, setOpen] = useState<string | null>(FLOWS[0].id);
  const [listMode, setListMode] = useState(false);
  const [query, setQuery] = useState('');

  const domains = useMemo(() => [...new Set(FLOWS.map((f) => f.domain))] as FlowDomain[], []);
  const count = (value: number) => value.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US');
  const shown = FLOWS.filter((flow) => {
    if (domain !== ALL && flow.domain !== (domain as FlowDomain)) return false;
    const searchable = [flow.name, flow.inputTrigger, flow.actors, flow.steps, flow.outcomes, flow.tools, FLOW_DOMAIN_LABELS[flow.domain]].flatMap((field) => [field.en, field.fa]).join(' ');
    return matchesSearch(searchable, query);
  });

  return (
    <div className="flow-atlas">
      <div className="knowledge-search" role="search">
        <label htmlFor="flow-atlas-search">{locale === 'fa' ? 'جست‌وجو در فرایندها' : 'Search the workflows'}</label>
        <input id="flow-atlas-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} aria-controls="flow-atlas-results" placeholder={locale === 'fa' ? 'نام فرایند، نقش یا مسئله…' : 'Workflow, role or problem…'} />
      </div>
      <div className="flow-controls">
        <div className="book-filters" role="group" aria-label={locale === 'fa' ? 'پالایش حوزه' : 'Filter domain'}>
          <button className={`chip chip-btn ${domain === ALL ? 'on' : ''}`} aria-pressed={domain === ALL} onClick={() => setDomain(ALL)}>
            {t.filterAll} ({count(FLOWS.length)})
          </button>
          {domains.map((d) => (
            <button
              key={d}
              className={`chip chip-btn ${domain === d ? 'on' : ''}`}
              aria-pressed={domain === d}
              onClick={() => setDomain(d)}
            >
              {FLOW_DOMAIN_LABELS[d][locale]} ({count(FLOWS.filter((f) => f.domain === d).length)})
            </button>
          ))}
        </div>
        <div className="flow-mode-toggle" role="group" aria-label={locale === 'fa' ? 'حالت نمایش' : 'View mode'}>
          <button className={`chip chip-btn ${!listMode ? 'on' : ''}`} aria-pressed={!listMode} onClick={() => setListMode(false)}>
            {t.viewCards}
          </button>
          <button className={`chip chip-btn ${listMode ? 'on' : ''}`} aria-pressed={listMode} onClick={() => setListMode(true)}>
            {t.viewList}
          </button>
        </div>
      </div>

      <p className="knowledge-results" role="status">{locale === 'fa' ? `${count(shown.length)} فرایند از ${count(FLOWS.length)} فرایند` : `${count(shown.length)} of ${count(FLOWS.length)} workflows`}</p>
      <div id="flow-atlas-results">
      {shown.length === 0 ? <div className="knowledge-empty"><h3>{locale === 'fa' ? 'فرایندی با این مشخصات پیدا نشد' : 'No workflows match these choices'}</h3><p>{locale === 'fa' ? 'عبارت یا حوزه دیگری را امتحان کنید.' : 'Try another search or domain.'}</p><button className="chip chip-btn" onClick={() => { setQuery(''); setDomain(ALL); }}>{locale === 'fa' ? 'نمایش همه فرایندها' : 'Show all workflows'}</button></div> : listMode ? (
        <ol className="flow-list-mode">
          {shown.map((f) => (
            <li key={f.id} id={f.id}>
              <h3>
                {f.name[locale]}{' '}
                <span className="chip chip-quiet">{FLOW_DOMAIN_LABELS[f.domain][locale]}</span>
              </h3>
              <dl className="flow-list-contract">
                {FLOW_CONTRACT_FIELDS.map((c) => (
                  <div key={c.key}>
                    <dt>{c.label[locale]}</dt>
                    <dd>{(f[c.key] as { en: string; fa: string })[locale]}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ol>
      ) : (
        <div className="flow-cards">
          {shown.map((f) => {
            const isOpen = open === f.id;
            return (
              <article key={f.id} id={f.id} className={`flow-card ${isOpen ? 'open' : ''}`}>
                <button
                  className="flow-card-head"
                  aria-expanded={isOpen}
                  aria-controls={`flow-contract-${f.id}`}
                  onClick={() => setOpen(isOpen ? null : f.id)}
                >
                  <span className="flow-card-num" aria-hidden="true">{locale === 'fa' ? count(f.order) : String(f.order).padStart(2, '0')}</span>
                  <span className="flow-card-name">{f.name[locale]}</span>
                  <span className="chip chip-quiet">{FLOW_DOMAIN_LABELS[f.domain][locale]}</span>
                  <span className="flow-caret" aria-hidden="true">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div id={`flow-contract-${f.id}`} className="flow-contract">
                    <p className="flow-meta">
                      {t.version} {f.version} · {t.publicSafe}
                    </p>
                    <dl className="flow-list-contract">
                      {FLOW_CONTRACT_FIELDS.map((c) => (
                        <div key={c.key}>
                          <dt>{c.label[locale]}</dt>
                          <dd>{(f[c.key] as { en: string; fa: string })[locale]}</dd>
                        </div>
                      ))}
                    </dl>
                    {(f.relatedBooks.length > 0 || f.relatedRepos.length > 0) && (
                      <p className="flow-related">
                        {f.relatedBooks.length > 0 && (
                          <>
                            <span className="flow-rel-label">{t.relatedBooks}:</span>{' '}
                            {f.relatedBooks.map((s, i) => (
                              <span key={s}>
                                {i > 0 && ' · '}
                                <Link href={`/${locale}/insights/books/${s}`}>{BOOK_BY_SLUG[s]?.title[locale] ?? s}</Link>
                              </span>
                            ))}
                          </>
                        )}
                        {f.relatedRepos.length > 0 && (
                          <>
                            {' · '}
                            <span className="flow-rel-label">{t.relatedLayers}:</span>{' '}
                            {f.relatedRepos.map((r, i) => (
                              <span key={r}>
                                {i > 0 && ' · '}
                                <Link href={`/${locale}/insights/enterprise-ai-stack#${r}`}>{OSS_BY_ID[r]?.name[locale] ?? r}</Link>
                              </span>
                            ))}
                          </>
                        )}
                      </p>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
      </div>

      <section className="mindsets">
        <h2>{t.mindsetsTitle}</h2>
        <ul className="mindset-grid">
          {CONCEPTS.map((c) => (
            <li key={c.id} className="mindset-card">
              <h3>{c.name[locale]}</h3>
              <p>{c.body[locale]}</p>
              {(c.relatedBooks.length > 0 || c.relatedRepos.length > 0) && (
                <p className="mindset-links">
                  {c.relatedBooks.map((s) => (
                    <Link key={s} className="chip chip-quiet" href={`/${locale}/insights/books/${s}`}>
                      {BOOK_BY_SLUG[s]?.title[locale].split(':')[0] ?? s}
                    </Link>
                  ))}
                  {c.relatedRepos.map((r) => (
                    <Link key={r} className="chip chip-quiet" href={`/${locale}/insights/enterprise-ai-stack#${r}`}>
                      {OSS_BY_ID[r]?.name[locale].split(' — ')[0] ?? r}
                    </Link>
                  ))}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
