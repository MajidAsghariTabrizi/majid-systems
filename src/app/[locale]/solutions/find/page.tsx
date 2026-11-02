import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { isLocale, LOCALES } from '@/content/i18n';
import { SolutionFinder } from '@/components/solutions/SolutionFinder';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const l = params.locale === 'fa' ? 'fa' : 'en';
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://quantiviq.xyz';
  return {
    title: l === 'fa' ? 'راهکار خود را پیدا کنید' : 'Find Your Solution',
    description: l === 'fa'
      ? 'سه پرسش کوتاه، بدون ثبت‌نام — راهکار مناسب کسب‌وکار خود را پیدا کنید.'
      : 'Three quick questions, no sign-in — find the solution that fits your business.',
    alternates: {
      canonical: `${base}/${params.locale}/solutions/find`,
      languages: { en: `${base}/en/solutions/find`, fa: `${base}/fa/solutions/find` },
    },
    robots: { index: false, follow: true },
  };
}

export default async function FindPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  return (
    <main>
      <SolutionFinder locale={params.locale as 'en' | 'fa'} />
    </main>
  );
}
