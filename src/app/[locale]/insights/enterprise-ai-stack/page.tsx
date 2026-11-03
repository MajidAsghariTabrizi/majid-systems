import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import { dict, isLocale, type Locale } from '@/content/i18n';
import { socialMeta } from '@/lib/social';
import StackAtlas from '@/components/stack/StackAtlas';

type Params = { locale: string };

export const dynamicParams = false;

export function generateStaticParams(): { locale: string }[] {
  return [{ locale: 'en' }, { locale: 'fa' }];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = params;
  if (!isLocale(locale)) return { robots: { index: false, follow: false } };
  const l = locale as Locale;
  const t = dict(l).stackPage;
  const path = `/${l}/insights/enterprise-ai-stack`;
  return {
    title: t.meta.title,
    description: t.meta.description,
    alternates: {
      canonical: path,
      languages: { en: '/en/insights/enterprise-ai-stack', fa: '/fa/insights/enterprise-ai-stack' },
    },
    ...socialMeta({
      title: t.meta.title,
      description: t.meta.description,
      path,
      locale: l,
      languages: { en: '/en/insights/enterprise-ai-stack', fa: '/fa/insights/enterprise-ai-stack' },
    }),
  };
}

export default async function StackPage({ params }: { params: Params }) {
  const { locale } = params;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  const t = dict(l).stackPage;

  return (
    <div className="stack-page" dir={l === 'fa' ? 'rtl' : 'ltr'}>
      <div className="container-wide">
      <nav className="ins-breadcrumb" aria-label={l === 'fa' ? 'مسیر صفحه' : 'Breadcrumb'}><ol><li><Link href={`/${l}`}>{l === 'fa' ? 'خانه' : 'Home'}</Link></li><li><Link href={`/${l}/insights`}>{l === 'fa' ? 'تحلیل‌ها' : 'Insights'}</Link></li><li aria-current="page">{l === 'fa' ? 'معماری هوش مصنوعی سازمانی' : 'Enterprise AI architecture'}</li></ol></nav>
      <header className="stack-head">
        <p className="eyebrow">{l === 'fa' ? 'اطلس متن‌باز' : 'OPEN-SOURCE ATLAS'}</p>
        <h1>{t.h1}</h1>
        <p className="lede">{t.sub}</p>
        <p className="stack-intro">{/* intro from data, bilingual */}
          {l === 'fa'
            ? 'ساختن سازمانی با هوش مصنوعی به انتخاب یک مدل زبانی یا چت‌بات محدود نمی‌شود. پنج قابلیت هوشمند باید با قراردادهای روشن به هم وصل شوند: منابع قابل پیگیری، حدود اختیار تصمیم و چرخه‌ای برای ارزیابی و یادگیری.'
            : 'An AI-native business needs more than a language model — the architecture becomes useful only when provenance, authority and evaluation connect these capabilities into a coherent decision workflow.'}
        </p>
      </header>
      <StackAtlas locale={l} />
      </div>
    </div>
  );
}
