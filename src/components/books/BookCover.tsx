'use client';

/** Book cover with deterministic fallback: if the Open Library cover fails to
 *  load (404/blank), we render a designed text-only card — never a generated
 *  facsimile of copyrighted artwork (mission §6 covers rule). */
import { useState } from 'react';
import { COVER_VERIFIED, type Book } from '@/content/knowledge';

export default function BookCover({
  book,
  size = 'L',
  credit,
  locale,
}: {
  book: Book;
  size?: 'M' | 'L';
  credit?: string;
  locale: 'en' | 'fa';
}) {
  // ISBNs measured as coverless (receipts) skip the network request entirely
  const [failed, setFailed] = useState(COVER_VERIFIED[book.isbn13] === false);
  const url = `https://covers.openlibrary.org/b/isbn/${book.isbn13}-${size}.jpg?default=false`;

  if (failed) {
    return (
      <div className="book-cover-fallback" dir={locale === 'fa' ? 'rtl' : 'ltr'} aria-label={book.title[locale]}>
        <span className="bcf-publisher">{book.publisher}</span>
        <span className="bcf-title">{book.title[locale]}</span>
        <span className="bcf-authors">{book.authors.join(' · ')}</span>
        <span className="bcf-isbn">ISBN {book.isbn13}</span>
        <span className="bcf-note">cover unavailable — text card</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={`${book.title[locale]} — ${book.authors.join(', ')}`}
      className="book-cover"
      loading="lazy"
      onError={() => setFailed(true)}
      {...(credit ? { 'data-credit': credit } : {})}
    />
  );
}
