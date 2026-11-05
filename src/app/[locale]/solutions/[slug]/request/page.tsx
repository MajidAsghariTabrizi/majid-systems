import type { Metadata } from 'next';
import Link from 'next/link';
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
      <Link className="sol-form-back" href={`/${locale}/solutions/${s.id}`}><span aria-hidden="true">{l === 'fa' ? '→' : '←'}</span>{l === 'fa' ? 'بازگشت به جزئیات راهکار' : 'Back to the solution'}</Link>
      <p className="eyebrow">{l === 'fa' ? 'گام اول همکاری' : 'The first step'}</p>
      <h1>{l === 'fa' ? 'از نیاز شما شروع کنیم.' : 'Let’s start with your need.'}</h1>
      <p className="sol-form-intro">
        {l === 'fa'
          ? 'شرح کوتاهی از شرایطتان بنویسید. ابتدا تناسب راهکار با نیاز شما را بررسی می‌کنیم؛ دامنه، هزینه و گام بعدی پیش از شروع کار با شما توافق می‌شود.'
          : 'Share a little context. We’ll review whether this solution fits, then agree the scope, cost and next step with you before any work begins.'}
      </p>
      <p className="sol-form-reassurance">{l === 'fa' ? 'بدون ثبت‌نام، بدون پرداخت و بدون تعهد به خرید.' : 'No account, no payment and no commitment to buy.'}</p>
      <SolutionRequestForm solution={s} locale={locale} source={searchParams?.src} />
    </div>
  );
}
