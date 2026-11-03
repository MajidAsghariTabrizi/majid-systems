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
import { matchesSearch } from '@/lib/search-text';

const ALL = 'all';

export default function BookLibrary({ locale }: { locale: Locale }) {
  const t = dict(locale).booksPage;
  const [filter, setFilter] = useState<string>(ALL);
  const [query, setQuery] = useState('');

  const domains = useMemo(() => {
    const s = new Set<BookDomain>();
    for (const b of BOOKS) for (const d of b.domains) s.add(d);
    return [...s];
  }, []);

  const count = (value: number) => value.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US');
  const shown = BOOKS.filter((book) => {
    if (filter !== ALL && !book.domains.includes(filter as BookDomain)) return false;
    return matchesSearch([book.title.en, book.title.fa, ...book.authors, book.brief.en, book.brief.fa, book.publisher, book.year, ...book.domains.flatMap((domain) => Object.values(BOOK_DOMAIN_LABELS[domain]))].join(' '), query);
  });

  return (
    <section aria-label={t.h1}>
      <h2 className="books-grid-label">{t.gridLabel}</h2>
      <div className="knowledge-search" role="search">
        <label htmlFor="book-library-search">{locale === 'fa' ? 'جست‌وجو در کتابخانه' : 'Search the library'}</label>
        <input id="book-library-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} aria-controls="book-library-results" placeholder={locale === 'fa' ? 'نام کتاب، نویسنده یا موضوع…' : 'Book, author or topic…'} />
      </div>
      <div className="book-filters" role="group" aria-label={locale === 'fa' ? 'پالایش بر اساس حوزه' : 'Filter by domain'}>
        <button
          className={`chip chip-btn ${filter === ALL ? 'on' : ''}`}
          aria-pressed={filter === ALL}
          onClick={() => setFilter(ALL)}
        >
          {t.filterAll} ({count(BOOKS.length)})
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
              {BOOK_DOMAIN_LABELS[d][locale]} ({count(n)})
            </button>
          );
        })}
      </div>
      <p className="knowledge-results" role="status">{locale === 'fa' ? `${count(shown.length)} کتاب از ${count(BOOKS.length)} کتاب` : `${count(shown.length)} of ${count(BOOKS.length)} books`}</p>
      <div id="book-library-results">
      {shown.length ? <div className="book-grid">
        {shown.map((b) => (
          <BookCard key={b.id} book={b} locale={locale} />
        ))}
      </div> : <div className="knowledge-empty"><h3>{locale === 'fa' ? 'کتابی با این مشخصات پیدا نشد' : 'No books match these choices'}</h3><p>{locale === 'fa' ? 'عبارت جست‌وجو یا حوزه را تغییر دهید، یا همه کتاب‌ها را ببینید.' : 'Try another search or domain, or return to the complete library.'}</p><button className="chip chip-btn" onClick={() => { setQuery(''); setFilter(ALL); }}>{locale === 'fa' ? 'نمایش همه کتاب‌ها' : 'Show all books'}</button></div>}
      </div>
    </section>
  );
}
