import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SOLUTION_UI } from '@/content/solutions';
import { dict, isLocale, LOCALES, type Locale } from '@/content/i18n';
import { socialMeta } from '@/lib/social';
import { SolutionsBrowser } from '@/components/solutions/SolutionsBrowser';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const l = params.locale;
  const title = l === 'fa' ? 'راهکارهای کوانتی‌ویک' : 'Quantiviq Solutions';
  const desc =
    l === 'fa'
      ? 'چهل راهکار عملی هوش مصنوعی برای مسائل واقعی کسب‌وکار: فروش، نقدینگی، عملیات، مشتری و دانش سازمانی — با تأیید انسانی و تحویل تعریف‌شده.'
      : 'Forty practical AI-enabled solutions for real operating problems across sales, cash, operations, customers and knowledge — human-approved, scoped delivery.';
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://quantiviq.xyz';
  // Truthful sharing metadata for the catalog route itself (not the homepage's).
  const social = socialMeta({
    title,
    description: desc,
    path: `/${l}/solutions`,
    locale: l,
    languages: { en: `${base}/en/solutions`, fa: `${base}/fa/solutions` },
  });
  return {
    title,
    description: desc,
    ...social,
    robots: { index: true, follow: true },
  };
}

export default async function SolutionsPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const l = locale === 'fa' ? 'fa' : 'en';
  return (
    <div>
      <section className="sol-section sol-hero">
        <p className="eyebrow">{SOLUTION_UI.heroEyebrow[l]}</p>
        <h1>{SOLUTION_UI.catalogTitle[l]}</h1>
        <p className="lede">{SOLUTION_UI.catalogLead[l]}</p>
      </section>
      <section className="sol-section">
        <SolutionsBrowser locale={locale} />
        <div className="sol-finder-strip">
          <a href={`/${locale}/solutions/find`}>{SOLUTION_UI.finderLink[l]}</a>
        </div>
      </section>
    </div>
  );
}
