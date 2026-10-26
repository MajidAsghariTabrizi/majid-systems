import Link from 'next/link';
import BookCover from './BookCover';
import { BOOK_DOMAIN_LABELS, SOURCE_STATUS_LABELS, bookPath, type Book, type Locale } from '@/content/knowledge';
import { dict } from '@/content/i18n';

export default function BookCard({ book, locale }: { book: Book; locale: Locale }) {
  const t = dict(locale).booksPage;
  return (
    <article className="book-card">
      <Link href={bookPath(book, locale)} className="book-card-cover" aria-label={book.title[locale]}>
        <BookCover book={book} size="M" locale={locale} credit={t.coverCredit} />
      </Link>
      <div className="book-card-body">
        <div className="book-card-domains">
          {book.domains.map((d) => (
            <span key={d} className="chip chip-quiet">{BOOK_DOMAIN_LABELS[d][locale]}</span>
          ))}
        </div>
        <h3 className="book-card-title">
          <Link href={bookPath(book, locale)}>{book.title[locale]}</Link>
        </h3>
        <p className="book-card-authors">{book.authors.join(locale === 'fa' ? '، ' : ', ')}</p>
        <p className="book-card-edition">
          {book.publisher} · {book.year} · {locale === 'fa' ? 'ویراست' : 'ed.'}{' '}
          {locale === 'fa'
            ? book.edition.replace(/First edition/i, 'اول').replace(/Updated and Expanded/g, 'توسعه‌یافته')
            : book.edition}
        </p>
        <p className="book-card-brief">{book.brief[locale].slice(0, 165)}…</p>
        <p className="book-card-status" title={book.skillStatus.note}>
          <span className="dot dot-hollow" aria-hidden="true" />
          {SOURCE_STATUS_LABELS[book.sourceStatus][locale]}
        </p>
      </div>
    </article>
  );
}
