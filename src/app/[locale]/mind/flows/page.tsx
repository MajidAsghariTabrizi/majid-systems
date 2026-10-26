import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { dict, isLocale, type Locale } from '@/content/i18n';
import { socialMeta } from '@/lib/social';
import FlowAtlas from '@/components/flows/FlowAtlas';

type Params = { locale: string };

export const dynamicParams = false;

export function generateStaticParams(): { locale: string }[] {
  return [{ locale: 'en' }, { locale: 'fa' }];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = params;
  if (!isLocale(locale)) return { robots: { index: false, follow: false } };
  const l = locale as Locale;
  const t = dict(l).flowsPage;
  const path = `/${l}/mind/flows`;
  return {
    title: t.meta.title,
    description: t.meta.description,
    alternates: {
      canonical: path,
      languages: { en: '/en/mind/flows', fa: '/fa/mind/flows' },
    },
    ...socialMeta({
      title: t.meta.title,
      description: t.meta.description,
      path,
      locale: l,
      languages: { en: '/en/mind/flows', fa: '/fa/mind/flows' },
    }),
  };
}

export default async function FlowsPage({ params }: { params: Params }) {
  const { locale } = params;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  const t = dict(l).flowsPage;

  return (
    <main className="flows-page" dir={l === 'fa' ? 'rtl' : 'ltr'}>
      <div className="container-wide">
      <header className="stack-head">
        <p className="eyebrow">{l === 'fa' ? 'ذهن سازمان' : 'THE ORGANIZATION MIND'}</p>
        <h1>{t.h1}</h1>
        <p className="lede">{t.sub}</p>
      </header>
      <FlowAtlas locale={l} />
      </div>
    </main>
  );
}
