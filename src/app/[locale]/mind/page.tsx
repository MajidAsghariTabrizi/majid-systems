import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { dict, isLocale, type Locale } from '@/content/i18n';
import { socialMeta } from '@/lib/social';
import { MIND_STRINGS } from '@/components/mind/strings';
import { MindFullPage } from '@/components/mind/MindFullPage';

/**
 * /en/mind + /fa/mind — the standalone, shareable Quantiviq Mind page.
 * Same backend, session and streaming path as the floating widget
 * (useMindChat is the single shared implementation). The floating widget
 * is suppressed on this route; it stays everywhere else.
 */
export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const t = dict(params.locale as Locale).meta.mind;
  return {
    title: t.title,
    description: t.description,
    ...socialMeta({
      title: t.title,
      description: t.description,
      path: `/${params.locale}/mind`,
      locale: params.locale === 'fa' ? 'fa' : 'en',
      languages: { en: '/en/mind', fa: '/fa/mind', 'x-default': '/en/mind' },
    }),
    robots: { index: true, follow: true }, // the PAGE is indexed; transcripts/prompts never are
  };
}

export default async function MindPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const l = params.locale as Locale;
  return <MindFullPage locale={l} s={MIND_STRINGS[l]} />;
}
