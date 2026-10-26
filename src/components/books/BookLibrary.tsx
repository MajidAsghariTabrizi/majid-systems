'use client';

import { useMemo, useState } from 'react';
import BookCard from './BookCard';
import {
  BOOKS,
  BOOK_DOMAIN_LABELS,
  type BookDomain,
  type Locale,
} from '@/content/knowledge';
import { dict } from '@/content/i18n';

const ALL = 'all';

export default function BookLibrary({ locale }: { locale: Locale }) {
  const t = dict(locale).booksPage;
  const [filter, setFilter] = useState<string>(ALL);

  const domains = useMemo(() => {
    const s = new Set<BookDomain>();
    for (const b of BOOKS) for (const d of b.domains) s.add(d);
    return [...s];
  }, []);

  const shown = filter === ALL ? BOOKS : BOOKS.filter((b) => b.domains.includes(filter as BookDomain));

  return (
    <section aria-label={t.h1}>
      <h2 className="books-grid-label">{t.gridLabel}</h2>
      <div className="book-filters" role="group" aria-label={locale === 'fa' ? 'پالایش بر اساس حوزه' : 'Filter by domain'}>
        <button
          className={`chip chip-btn ${filter === ALL ? 'on' : ''}`}
          aria-pressed={filter === ALL}
          onClick={() => setFilter(ALL)}
        >
          {t.filterAll} ({BOOKS.length})
        </button>
        {domains.map((d) => {
          const n = BOOKS.filter((b) => b.domains.includes(d)).length;
          return (
            <button
              key={d}
              className={`chip chip-btn ${filter === d ? 'on' : ''}`}
              aria-pressed={filter === d}
              onClick={() => setFilter(d)}
            >
              {BOOK_DOMAIN_LABELS[d][locale]} ({n})
            </button>
          );
        })}
      </div>
      <div className="book-grid">
        {shown.map((b) => (
          <BookCard key={b.id} book={b} locale={locale} />
        ))}
      </div>
    </section>
  );
}
