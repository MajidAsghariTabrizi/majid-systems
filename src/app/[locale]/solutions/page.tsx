import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import Link from 'next/link';
import { SOLUTION_UI, SOLUTIONS, FLAGSHIPS, CATEGORIES } from '@/content/solutions';
import { isLocale, LOCALES, type Locale } from '@/content/i18n';
import { socialMeta } from '@/lib/social';
import { SolutionsBrowser } from '@/components/solutions/SolutionsBrowser';
import { SolutionVisual } from '@/components/solutions/SolutionVisual';

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
    <div className="sol-catalog-page">
      <section className="sol-section sol-catalog-hero">
        <div className="sol-hero-copy">
          <p className="eyebrow">{SOLUTION_UI.heroEyebrow[l]}</p>
          <h1>{l === 'fa' ? <>از مسئله‌ی امروز،<br /><em>تا راهکارِ قابل اجرا.</em></> : <>From an operating problem<br /><em>to a working solution.</em></>}</h1>
          <p className="lede">{SOLUTION_UI.catalogLead[l]}</p>
          <div className="sol-hero-actions">
            <a className="sol-button" href="#catalog">{l === 'fa' ? 'بررسی راهکارها' : 'Explore solutions'}<span aria-hidden="true">↓</span></a>
            <Link className="sol-text-link" href={`/${locale}/solutions/find`}>{l === 'fa' ? 'کمکم کنید انتخاب کنم' : 'Help me choose'}<span aria-hidden="true">{l === 'fa' ? '←' : '→'}</span></Link>
          </div>
          <p className="sol-hero-note">{l === 'fa' ? 'متناسب با فرایند شما، با داده‌های شما و نظارت تیم شما.' : 'Built around your workflows, your data and your team’s oversight.'}</p>
        </div>
        <SolutionVisual locale={locale} variant="hero" />
      </section>
      <div className="sol-section">
        <dl className="sol-catalog-facts">
          <div><dt>{l === 'fa' ? SOLUTIONS.length.toLocaleString('fa-IR') : SOLUTIONS.length}</dt><dd>{l === 'fa' ? 'مسیر برای حل مسائل کسب‌وکار' : 'ways to address operating problems'}</dd></div>
          <div><dt>{l === 'fa' ? CATEGORIES.length.toLocaleString('fa-IR') : CATEGORIES.length}</dt><dd>{l === 'fa' ? 'حوزه، از فروش تا دانش سازمانی' : 'areas, from sales to enterprise knowledge'}</dd></div>
          <div><dt>{l === 'fa' ? FLAGSHIPS.length.toLocaleString('fa-IR') : FLAGSHIPS.length}</dt><dd>{l === 'fa' ? 'راهکار با مسیر تحویل مشخص' : 'offerings with a documented delivery path'}</dd></div>
        </dl>
      </div>
      <section className="sol-section sol-catalog-body" id="catalog" aria-labelledby="catalog-title">
        <div className="sol-section-intro">
          <div><p className="eyebrow">{l === 'fa' ? 'کتابخانه‌ی راهکارها' : 'The solution library'}</p><h2 id="catalog-title">{l === 'fa' ? 'از اولویت کسب‌وکارتان شروع کنید' : 'Start with your business priority'}</h2></div>
          <p>{l === 'fa' ? 'مسئله یا حوزه‌ی موردنظر را جست‌وجو کنید. هر صفحه توضیح می‌دهد چه داده‌ای لازم است، چه چیزی تحویل می‌گیرید و نتیجه را چگونه می‌سنجیم.' : 'Search by problem or business area. Each page explains the starting data, proposed deliverables and how progress can be measured.'}</p>
        </div>
        <SolutionsBrowser locale={locale} />
      </section>
      <section className="sol-section sol-engagement" aria-labelledby="engagement-title">
        <div className="sol-section-intro"><div><p className="eyebrow">{l === 'fa' ? 'مسیر همکاری' : 'How we work'}</p><h2 id="engagement-title">{l === 'fa' ? 'اول مسئله را روشن می‌کنیم، بعد راهکار را می‌سازیم.' : 'Understand the problem. Then build the workflow.'}</h2></div></div>
        <ol className="sol-stage-grid">
          {(l === 'fa' ? [
            ['شناخت مسئله و داده‌ها', 'فرایند فعلی، محدودیت‌ها و نقطه‌ی شروع را با تیم شما بررسی می‌کنیم.'],
            ['تعریف و ارزیابی پایلوت', 'دامنه، خروجی‌ها، معیار موفقیت و نقاط تأیید انسانی را پیش از اجرا مشخص می‌کنیم.'],
            ['تصمیم برای گسترش', 'پس از ارزیابی پایلوت، درباره‌ی اتصال به سیستم‌ها، آموزش و پشتیبانی توافق می‌کنیم.'],
          ] : [
            ['Understand the workflow', 'Review the current process, available data and constraints with your team.'],
            ['Scope and evaluate a pilot', 'Agree deliverables, success measures and human approval points before implementation.'],
            ['Decide how to expand', 'Use pilot findings to agree integrations, team training and ongoing support.'],
          ]).map(([title, body], i) => <li key={title}><span className="sol-step-num">{l === 'fa' ? (i + 1).toLocaleString('fa-IR') : `0${i + 1}`}</span><h3>{title}</h3><p>{body}</p></li>)}
        </ol>
        <div className="sol-help-panel"><div><h3>{l === 'fa' ? 'هنوز نمی‌دانید کدام راهکار مناسب شماست؟' : 'Still deciding where to begin?'}</h3><p>{l === 'fa' ? 'با سه پرسش کوتاه، گزینه‌های نزدیک‌تر به نیازتان را پیدا کنید؛ بدون ثبت‌نام.' : 'Answer three short questions to narrow the options. No account needed.'}</p></div><Link className="sol-button" href={`/${locale}/solutions/find`}>{l === 'fa' ? 'پیدا کردن راهکار مناسب' : 'Find a suitable solution'}<span aria-hidden="true">{l === 'fa' ? '←' : '→'}</span></Link></div>
      </section>
    </div>
  );
}
