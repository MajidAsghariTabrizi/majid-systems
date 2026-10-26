import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { dict, isLocale, type Locale } from '@/content/i18n';
import { socialMeta } from '@/lib/social';
import BookCover from '@/components/books/BookCover';
import {
  BOOKS,
  BOOK_BY_SLUG,
  BOOK_DOMAIN_LABELS,
  CONCEPT_BY_ID,
  FLOW_BY_ID,
  OSS_BY_ID,
  SOURCE_STATUS_LABELS,
  askMindLink,
  bookPath,
  coverCreditUrl,
} from '@/content/knowledge';

type Params = { locale: string; slug: string };

export const dynamicParams = false;

export function generateStaticParams(): { locale: string; slug: string }[] {
  return (['en', 'fa'] as Locale[]).flatMap((locale) => BOOKS.map((b) => ({ locale, slug: b.slug })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = params;
  if (!isLocale(locale)) return { robots: { index: false, follow: false } };
  const l = locale as Locale;
  const book = BOOK_BY_SLUG[slug];
  if (!book) return {};
  const path = bookPath(book, l);
  const title = `${book.title[l]} — ${book.authors[0]}`;
  return {
    title,
    description: book.brief[l].slice(0, 155),
    alternates: {
      canonical: path,
      languages: { en: bookPath(book, 'en'), fa: bookPath(book, 'fa') },
    },
    ...socialMeta({
      title,
      description: book.brief[l].slice(0, 155),
      path,
      locale: l,
      languages: { en: bookPath(book, 'en'), fa: bookPath(book, 'fa') },
    }),
  };
}

export default async function BookDetailPage({ params }: { params: Params }) {
  const { locale, slug } = params;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  const book = BOOK_BY_SLUG[slug];
  if (!book) notFound();
  const t = dict(l).booksPage;

  return (
    <main className="book-detail" dir={l === 'fa' ? 'rtl' : 'ltr'}>
      <div className="container-narrow">
      <nav className="breadcrumb" aria-label={l === 'fa' ? 'مسیر' : 'Breadcrumb'}>
        <Link href={`/${l}/insights/books`}>← {t.backToLibrary}</Link>
      </nav>

      <header className="book-hero">
        <div className="book-hero-cover">
          <BookCover book={book} size="L" locale={l} credit={t.coverCredit} />
          <a className="book-cover-credit" href={coverCreditUrl(book.isbn13)} target="_blank" rel="noopener noreferrer">
            {t.coverCredit} ↗
          </a>
        </div>
        <div className="book-hero-meta">
          <p className="eyebrow">{l === 'fa' ? `کتاب ${book.num} از ۱۰` : `BOOK ${book.num} OF 10`}</p>
          <h1>{book.title[l]}</h1>
          <p className="book-authors">{book.authors.join(l === 'fa' ? '، ' : ', ')}</p>
          <dl className="book-facts">
            <div><dt>ISBN-13</dt><dd>{book.isbn13}</dd></div>
            <div><dt>{l === 'fa' ? 'ناشر' : 'Publisher'}</dt><dd>{book.publisher}</dd></div>
            <div><dt>{l === 'fa' ? 'سال' : 'Year'}</dt><dd>{book.year}</dd></div>
            <div><dt>{l === 'fa' ? 'ویراست' : 'Edition'}</dt><dd>{book.edition}</dd></div>
          </dl>
          <p className="book-source-link">
            {t.verifiedAgainst}:{' '}
            <a href={book.officialSourceUrl} target="_blank" rel="noopener noreferrer">
              {new URL(book.officialSourceUrl).hostname} ↗
            </a>
          </p>
          <div className="book-domains">
            {book.domains.map((d) => (
              <span key={d} className="chip chip-quiet">{BOOK_DOMAIN_LABELS[d][l]}</span>
            ))}
          </div>
          <p className="book-card-status">
            <span className="dot dot-hollow" aria-hidden="true" />
            {SOURCE_STATUS_LABELS[book.sourceStatus][l]}
          </p>
        </div>
      </header>

      <section className="book-brief">
        <h2>{l === 'fa' ? 'چرا این کتاب اینجاست' : 'Why this book is here'}</h2>
        <p>{book.brief[l]}</p>
        <h3>{t.useAtWork}</h3>
        <p className="book-takeaway">{book.takeaway[l]}</p>
      </section>

      <section className="book-skill">
        <h2>{t.skillTitle}</h2>
        <p className="book-skill-state">
          <span className="chip">{book.skillStatus.state}</span>
        </p>
        <p className="book-skill-note">{book.skillStatus.note}</p>
        <p className="book-skill-policy">
          {l === 'fa'
            ? 'توضیحات این صفحه خلاصه تحلیلی مالک سایت است؛ نقل‌قول فصل یا صفحه‌ای از کتاب ارائه نمی‌شود و ادعایی درباره دریافت متن کامل مطرح نیست.'
            : 'The copy on this page is the owner’s analytical summary; no chapter or page quotations are offered, and no claim is made that the full text was ingested.'}
        </p>
      </section>

      <section className="book-links">
        <h2>{t.questions}</h2>
        <ul className="book-questions">
          {book.questions[l].map((q) => (
            <li key={q}>
              <Link className="book-question" href={askMindLink(l, q, book.slug)}>
                {q} <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="book-related">
          <h3>{t.relatedConcepts}</h3>
          <ul className="related-list">
            {book.mindConcepts.map((cid) => {
              const c = CONCEPT_BY_ID[cid];
              return c ? (
                <li key={cid}>
                  <span className="rel-name">{c.name[l]}</span>
                  <span className="rel-note">{c.body[l]}</span>
                </li>
              ) : (
                <li key={cid}><span className="rel-name">{cid}</span></li>
              );
            })}
          </ul>
        </div>

        {book.relatedFlow && FLOW_BY_ID[book.relatedFlow] && (
          <div className="book-related">
            <h3>{t.relatedFlow}</h3>
            <Link className="rel-link" href={`/${l}/mind/flows#${book.relatedFlow}`}>
              {FLOW_BY_ID[book.relatedFlow].name[l]} →
            </Link>
          </div>
        )}

        {book.relatedRepos.length > 0 && (
          <div className="book-related">
            <h3>{l === 'fa' ? 'لایه‌های مرتبط استک' : 'Related stack layers'}</h3>
            <ul className="related-list">
              {book.relatedRepos.map((rid) => {
                const r = OSS_BY_ID[rid];
                return r ? (
                  <li key={rid}>
                    <Link className="rel-link" href={`/${l}/insights/enterprise-ai-stack#${rid}`}>{r.name[l]} →</Link>
                  </li>
                ) : null;
              })}
            </ul>
          </div>
        )}
      </section>
      </div>
    </main>
  );
}
