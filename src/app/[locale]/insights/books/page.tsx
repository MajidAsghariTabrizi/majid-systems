import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { dict, isLocale } from '@/content/i18n';
import { socialMeta } from '@/lib/social';
import { SITE } from '@/content/shared';
import BookLibrary from '@/components/books/BookLibrary';
import { BOOKS } from '@/content/knowledge';
import type { Locale } from '@/content/i18n';

type Params = { locale: string };

export const dynamicParams = false;

export function generateStaticParams(): { locale: string }[] {
  return [{ locale: 'en' }, { locale: 'fa' }];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = params;
  if (!isLocale(locale)) return { robots: { index: false, follow: false } };
  const l = locale as Locale;
  const t = dict(l).booksPage;
  const path = `/${l}/insights/books`;
  return {
    title: t.meta.title,
    description: t.meta.description,
    alternates: {
      canonical: path,
      languages: { en: '/en/insights/books', fa: '/fa/insights/books' },
    },
    ...socialMeta({
      title: t.meta.title,
      description: t.meta.description,
      path,
      locale: l,
      languages: { en: '/en/insights/books', fa: '/fa/insights/books' },
    }),
  };
}

export default async function BooksPage({ params }: { params: Params }) {
  const { locale } = params;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  const t = dict(l).booksPage;

  return (
    <main className="books-page" dir={l === 'fa' ? 'rtl' : 'ltr'}>
      <div className="container-wide">
      <header className="stack-head">
        <p className="eyebrow">{l === 'fa' ? 'کتابخانه کوانتیویک' : 'QUANTIVIQ LIBRARY'}</p>
        <h1>{t.h1}</h1>
        <p className="lede">{t.sub}</p>
      </header>
      <BookLibrary locale={l} />
      <p className="books-note">
        {l === 'fa'
          ? 'جلدها از Open Library با ذکر منبع نمایش داده می‌شوند؛ هیچ جلد ساختگی یا بازتولیدشده‌ای استفاده نشده است.'
          : 'Covers are displayed from Open Library with credit; no generated or reproduced artwork is used.'}
      </p>
      </div>
    </main>
  );
}
