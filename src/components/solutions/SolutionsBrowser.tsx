'use client';

/** Catalog browser: client-side search + category filter over the static catalog. */
import { useEffect, useMemo, useState } from 'react';

import { CATEGORIES, SOLUTIONS, SOLUTION_UI, type SolutionCategory } from '@/content/solutions';
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
    const needle = q.trim().toLowerCase();
    return SOLUTIONS.filter((s) => {
      if (cat !== 'all' && s.category !== cat) return false;
      if (!needle) return true;
      const hay = [s.title.en, s.title.fa, s.oneLiner.en, s.oneLiner.fa, s.problem.en, s.problem.fa, s.id].join(' ').toLowerCase();
      return hay.includes(needle);
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
          <button className={`sol-chip ${cat === 'all' ? 'on' : ''}`} onClick={() => setCat('all')}>
            {t.allCategories[l]}
          </button>
          {CATEGORIES.map((c) => (
            <button key={c.key} className={`sol-chip ${cat === c.key ? 'on' : ''}`} onClick={() => setCat(c.key)}>
              {c.label[l]}
            </button>
          ))}
        </div>
      </div>
      <p className="sol-count" aria-live="polite">
        {filtered.length} {l === 'fa' ? 'راهکار' : 'solutions'}
      </p>
      {filtered.length === 0 ? (
        <p className="sol-empty">{t.noResults[l]}</p>
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
