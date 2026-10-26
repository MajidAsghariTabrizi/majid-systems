import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { dict, isLocale, type Locale } from '@/content/i18n';
import { socialMeta } from '@/lib/social';
import ExploreExperience from '@/components/explore/ExploreExperience';

type Params = { locale: string };

export const dynamicParams = false;

export function generateStaticParams(): { locale: string }[] {
  return [{ locale: 'en' }, { locale: 'fa' }];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = params;
  if (!isLocale(locale)) return { robots: { index: false, follow: false } };
  const l = locale as Locale;
  const t = dict(l).explore;
  const path = `/${l}/explore`;
  return {
    title: t.meta.title,
    description: t.meta.description,
    alternates: {
      canonical: path,
      languages: { en: '/en/explore', fa: '/fa/explore' },
    },
    ...socialMeta({
      title: t.meta.title,
      description: t.meta.description,
      path,
      locale: l,
      languages: { en: '/en/explore', fa: '/fa/explore' },
    }),
  };
}

export default async function ExplorePage({ params }: { params: Params }) {
  const { locale } = params;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  return (
    <main className="explore-page" dir={l === 'fa' ? 'rtl' : 'ltr'}>
      <div className="container-wide">
        <ExploreExperience locale={l} />
      </div>
    </main>
  );
}
