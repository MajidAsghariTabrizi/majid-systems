import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { isLocale } from '@/content/i18n';
import { socialMeta } from '@/lib/social';
import { AUTHORS, PILLARS, articlesByPillar, getArticles, insightsStats, pillarFor, type Locale } from '@/content/insights';
import { INSIGHTS_UI } from '@/content/insights/ui';
import { SITE } from '@/content/shared';

type Params = { locale: string };

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const l = params.locale;
  if (!isLocale(l)) return {};
  const fa = l === 'fa';
  const title = fa ? 'پژوهش کوانتی‌ویک — نویسندگان' : 'Quantiviq Research — Authors';
  const description = fa
    ? 'پژوهش کوانتی‌ویک، گروه سردبیری تحلیل‌های کوانتی‌ویک است: تحلیل‌های اصیل و مستند دربارهٔ تحول کسب‌وکار بومی هوش مصنوعی.'
    : 'Quantiviq Research is the editorial collective behind Quantiviq Insights: original, source-verified analysis on AI-native business transformation.';
  return {
    title,
    description,
    alternates: {
      canonical: `/${l}/insights/author`,
      languages: { en: '/en/insights/author', fa: '/fa/insights/author', 'x-default': '/en/insights/author' },
    },
    ...socialMeta({
      title,
      description,
      path: `/${l}/insights/author`,
      locale: fa ? 'fa' : 'en',
      languages: { en: '/en/insights/author', fa: '/fa/insights/author', 'x-default': '/en/insights/author' },
    }),
  };
}

export default async function AuthorPage({ params }: { params: Params }) {
  const l = params.locale;
  if (!isLocale(l)) notFound();
  const locale = (l === 'fa' ? 'fa' : 'en') as Locale;
  const author = AUTHORS['quantiviq-research'];
  const t = INSIGHTS_UI[locale];
  const stats = insightsStats(locale);
  const articles = getArticles(locale);
  const faRole = 'گروه سردبیری تحلیل‌های کوانتی‌ویک';
  const faBio =
    'پژوهش کوانتی‌ویک نام جمعی گروهی است که تحلیل‌های این انتشارات را تولید می‌کند: پژوهش‌گرانی با پیشینهٔ بهره‌برداری محصول، معماری سیستم و اقتصاد شرکت. هر مقاله پیش از انتشار بر اساس دفتر منابع راستی‌آزمایی و از نظر ساختار و صحت فنی بازبینی می‌شود. روش کامل کار در صفحهٔ روش سردبیری آمده است.';

  return (
    <>
      <section className="ins-hero-section">
        <div className="container-narrow">
          <nav className="ins-breadcrumb" aria-label="Breadcrumb">
            <ol>
              <li><Link href={`/${locale}`}>{locale === 'fa' ? 'خانه' : 'Home'}</Link></li>
              <li><Link href={`/${locale}/insights`}>{t.title}</Link></li>
              <li aria-current="page">{locale === 'fa' ? 'نویسنده' : 'Author'}</li>
            </ol>
          </nav>
          <span className="eyebrow sig">{t.eyebrow}</span>
          <h1 className="q-display">{locale === 'fa' ? (author?.name ?? 'پژوهش کوانتی‌ویک') : author?.name}</h1>
          <p className="ins-subtitle">{locale === 'fa' ? faRole : author?.role}</p>
          <p className="q-lede">{locale === 'fa' ? faBio : author?.bio}</p>
        </div>
      </section>

      <section className="q-section">
        <div className="container-wide">
          <h2 className="q-h2">{t.latest}</h2>
          {PILLARS.map((p) => (
            <div key={p.id} className="ins-author-group">
              <h3 className="q-h3-like">{pillarFor(p.id, locale)?.name}</h3>
              <ul className="ins-author-list">
                {articlesByPillar(p.id, locale).map((a) => (
                  <li key={a.slug}>
                    <Link href={`/${locale}/insights/${a.slug}`}>
                      {a.title}
                      <span className="ins-card-meta"> — {a.published_at} · {a.readingTime} {t.minRead}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="ins-stats-note">
            {locale === 'fa' ? (
              <>
                {stats.articles} مقاله · {stats.sources} منبع راستی‌آزمایی‌شده ·{' '}
                <Link href="/fa/insights/methodology">روش پژوهش ما</Link>.
              </>
            ) : (
              <>
                {stats.articles} articles · {stats.sources} verified sources · methodology:{' '}
                <Link href="/en/insights/methodology">how we research</Link>.
              </>
            )}
          </p>
        </div>
      </section>
    </>
  );
}
