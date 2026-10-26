import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

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
    <main className="stack-page" dir={l === 'fa' ? 'rtl' : 'ltr'}>
      <div className="container-wide">
      <header className="stack-head">
        <p className="eyebrow">{l === 'fa' ? 'اطلس متن‌باز' : 'OPEN-SOURCE ATLAS'}</p>
        <h1>{t.h1}</h1>
        <p className="lede">{t.sub}</p>
        <p className="stack-intro">{/* intro from data, bilingual */}
          {l === 'fa'
            ? 'یک سازمان AI-Native صرفاً به یک LLM یا چت‌بات نیاز ندارد. پنج نوع هوشمندی کنار هم قرار می‌گیرند و ارزش در قراردادهای مشترک، منبع معتبر، مجوز تصمیم و چرخه یادگیری است.'
            : 'An AI-native business needs more than a language model — the architecture becomes useful only when provenance, authority and evaluation connect these capabilities into a coherent decision workflow.'}
        </p>
      </header>
      <StackAtlas locale={l} />
      </div>
    </main>
  );
}
