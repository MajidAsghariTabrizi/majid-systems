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
  const en = l === 'en';
  // Server-rendered descriptive block: the interactive experience is a
  // client app; this static section guarantees meaningful crawlable HTML
  // (F2, 2026-10-30) without changing the interactive UI above it.
  return (
    <>
      <MindFullPage locale={l} s={MIND_STRINGS[l]} />
      <section className="mind-seo" aria-label={en ? 'About Quantiviq Mind' : 'دربارهٔ ذهن Quantiviq'}>
        <div className="container-wide">
          <h2>{en ? 'What is Quantiviq Mind?' : 'ذهن Quantiviq چیست؟'}</h2>
          <p>
            {en
              ? 'Quantiviq Mind is an AI assistant grounded in Majid Asghari Tabrizi\u2019s published work \u2014 documented projects, bilingual Insights articles, curated book notes and public open-source repositories. Ask a question about AI-native organizations, AI transformation economics, agent governance or workflow design; every answer lists its retrieved sources so you can inspect the evidence yourself. Answers are AI interpretation, clearly separated from documented material.'
              : 'ذهن Quantiviq یک دستیار هوش مصنوعی است که بر آثار منتشرشدهٔ مجید اصغری تبریزی تکیه دارد \u2014 پروژه‌های مستند، مقالات دوزبانهٔ Insights، یادداشت‌های کتاب‌های منتخب و مخازن متن‌باز عمومی. دربارهٔ سازمان‌های بومی هوش مصنوعی، اقتصاد تحول AI، حکمرانی عامل‌ها یا طراحی جریان کار بپرسید؛ هر پاسخ منابع بازیابی‌شده را فهرست می‌کند تا خودتان شواهد را بررسی کنید. پاسخ‌ها تفسیر هوش مصنوعی‌اند و از مطالب مستند تفکیک می‌شوند.'}
          </p>
          <p>
            {en ? 'Try asking: ' : 'این پرسش‌ها را امتحان کنید: '}
            <ul>
              <li>{en ? 'What is the difference between AI adoption and AI transformation?' : 'تفاوت پذیرش هوش مصنوعی و تحول هوش مصنوعی چیست؟'}</li>
              <li>{en ? 'How do you measure the economic value of an AI transformation?' : 'ارزش اقتصادی تحول هوش مصنوعی را چگونه اندازه می‌گیرید؟'}</li>
              <li>{en ? 'Which workflows should never be automated?' : 'کدام جریان‌های کار هرگز نباید خودکار شوند؟'}</li>
            </ul>
          </p>
          <p>
            {en ? 'Related reading: ' : 'مطالب مرتبط: '}
            <a href={`/${l}/insights/ai-adoption-is-not-ai-transformation`}>{en ? 'AI adoption is not AI transformation' : 'پذیرش هوش مصنوعی، تحول نیست'}</a>
            {' \u00b7 '}
            <a href={`/${l}/insights/the-real-cost-of-enterprise-ai-agents`}>{en ? 'The real cost of enterprise AI agents' : 'هزینهٔ واقعی عامل‌های هوش مصنوعی سازمانی'}</a>
            {' \u00b7 '}
            <a href={`/${l}/method`}>{en ? 'The Quantiviq method' : 'روش Quantiviq'}</a>
          </p>
        </div>
      </section>
    </>
  );
}
