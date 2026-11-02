import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getSolution } from '@/content/solutions';
import { isLocale, type Locale } from '@/content/i18n';
import { socialMeta } from '@/lib/social';
import { SolutionRequestForm } from '@/components/solutions/SolutionRequestForm';

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const s = getSolution(params.slug);
  const l = params.locale === 'fa' ? 'fa' : 'en';
  const title = s ? `${s.title[l]} — ${l === 'fa' ? 'درخواست راهکار' : 'Request'}` : 'Request';
  return {
    title,
    ...socialMeta({
      title,
      description: l === 'fa'
        ? 'ثبت درخواست مشاوره برای این راهکار — بدون حساب کاربری و بدون پرداخت.'
        : 'Request a consultative follow-up for this solution — no account, no payment.',
      path: `/${params.locale}/solutions/${params.slug}/request`,
      locale: l,
    }),
    robots: { index: false, follow: false },
  };
}

export default async function SolutionRequestPage({
  params,
  searchParams,
}: {
  params: { locale: string; slug: string };
  searchParams?: { src?: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const s = getSolution(params.slug);
  if (!s) notFound();
  const locale = params.locale as Locale;
  const l = locale === 'fa' ? 'fa' : 'en';
  return (
    <div className="sol-form-wrap">
      <h1>{l === 'fa' ? 'درخواست راهکار' : 'Request This Solution'}</h1>
      <p className="lede" style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.6 }}>
        {l === 'fa'
          ? 'بدون پرداخت و بدون حساب کاربری. درخواست شما ثبت می‌شود و ما شخصاً برای بررسی و پیشنهاد اختصاصی با شما تماس می‌گیریم.'
          : 'No payment and no account needed. Your request is registered; we personally follow up to scope and propose.'}
      </p>
      <SolutionRequestForm solution={s} locale={locale} source={searchParams?.src} />
    </div>
  );
}
