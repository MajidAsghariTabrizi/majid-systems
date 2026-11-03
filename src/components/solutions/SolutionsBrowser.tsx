'use client';

/** Catalog browser: client-side search + category filter over the static catalog. */
import { useEffect, useMemo, useState } from 'react';

import { CATEGORIES, SOLUTIONS, SOLUTION_UI, type SolutionCategory } from '@/content/solutions';
import { faMatch } from '@/content/solutions/search';
import type { Locale } from '@/content/i18n';
import { qEvent } from '@/lib/analytics';
import { SolutionCard } from './SolutionCard';

export function SolutionsBrowser({ locale }: { locale: Locale }) {
  const l = locale === 'fa' ? 'fa' : 'en';
  const t = SOLUTION_UI;
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<SolutionCategory | 'all'>('all');
  useEffect(() => { qEvent('solutions_view', { locale }); }, []);

  const filtered = useMemo(() => {
    const needle = q.trim();
    return SOLUTIONS.filter((s) => {
      if (cat !== 'all' && s.category !== cat) return false;
      if (!needle) return true;
      // normalizeFa handles ZWNJ/space/Arabic-variant spellings (پیش فاکتور
      // finds پیش‌فاکتور); display text is never altered.
      const hay = [s.title.en, s.title.fa, s.oneLiner.en, s.oneLiner.fa, s.problem.en, s.problem.fa, s.id].join(' ');
      const needleEn = needle.toLowerCase();
      return faMatch(hay, needle) || hay.toLowerCase().includes(needleEn);
    });
  }, [q, cat]);

  return (
    <>
      <div className="sol-controls">
        <div className="sol-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.searchPlaceholder[l]}
            aria-label={t.searchPlaceholder[l]}
          />
        </div>
        <div className="sol-cat-chips" role="group" aria-label={l === 'fa' ? 'دسته‌بندی' : 'Categories'}>
          <button className={`sol-chip ${cat === 'all' ? 'on' : ''}`} aria-pressed={cat === 'all'} onClick={() => setCat('all')}>
            {t.allCategories[l]}
          </button>
          {CATEGORIES.map((c) => (
            <button key={c.key} className={`sol-chip ${cat === c.key ? 'on' : ''}`} aria-pressed={cat === c.key} onClick={() => setCat(c.key)}>
              {c.label[l]}
            </button>
          ))}
        </div>
      </div>
      <div className="sol-results-head">
        <p className="sol-count" aria-live="polite">{l === 'fa' ? `${filtered.length.toLocaleString('fa-IR')} راهکار` : `${filtered.length} solutions`}</p>
        <p className="sol-status-guide">{l === 'fa' ? '«مسیر اجرای مشخص» جزئیات تحویل دارد؛ «نیازمند نیازسنجی» پس از شناخت کسب‌وکار شما تعریف می‌شود.' : 'Detailed offerings have a delivery path; scoping engagements are defined after discovery.'}</p>
      </div>
      {filtered.length === 0 ? (
        <div className="sol-empty"><p>{t.noResults[l]}</p><button className="sol-chip" onClick={() => { setQ(''); setCat('all'); }}>{l === 'fa' ? 'نمایش همه‌ی راهکارها' : 'Show all solutions'}</button></div>
      ) : (
        <div className="sol-grid">
          {filtered.map((s) => (
            <SolutionCard key={s.id} s={s} locale={locale} />
          ))}
        </div>
      )}
    </>
  );
}
