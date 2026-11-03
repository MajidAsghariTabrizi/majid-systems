import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { isLocale } from '@/content/i18n';
import { socialMeta } from '@/lib/social';
import { PILLARS, PILLAR_BY_ID, articlesByPillar, pillarFor, type Locale } from '@/content/insights';
import { INSIGHTS_UI } from '@/content/insights/ui';
import { SITE } from '@/content/shared';
import { formatInsightDate, formatInsightNumber } from '@/lib/insights-format';

type Params = { locale: string; topic: string };

export const dynamicParams = false;

export function generateStaticParams(): { locale: string; topic: string }[] {
  return (['en', 'fa'] as Locale[]).flatMap((locale) => PILLARS.map((p) => ({ locale, topic: p.id })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, topic } = params;
  if (!isLocale(locale)) return { robots: { index: false, follow: false } };
  const l = locale as Locale;
  const pillar = pillarFor(topic, l);
  if (!pillar) return {};
  const suffix = l === 'fa' ? 'تحلیل‌های کوانتی‌ویک' : 'Quantiviq Insights';
  return {
    title: `${pillar.name} — ${suffix}`,
    description:
      l === 'fa'
        ? `${pillar.description} تحلیل‌های اصیل و مستند پژوهش کوانتی‌ویک.`
        : `${pillar.description} Original, source-verified analysis from Quantiviq Research.`,
    alternates: {
      canonical: `/${l}/insights/topics/${topic}`,
      languages: { en: `/en/insights/topics/${topic}`, fa: `/fa/insights/topics/${topic}` },
      types: { 'application/rss+xml': `${SITE.canonicalUrl}/${l === 'fa' ? 'fa/insights.xml' : 'insights.xml'}` },
    },
    ...socialMeta({
      title: `${pillar.name} — ${suffix}`,
      description: pillar.description,
      path: `/${l}/insights/topics/${topic}`,
      locale: l,
      languages: { en: `/en/insights/topics/${topic}`, fa: `/fa/insights/topics/${topic}` },
    }),
  };
}

export default async function TopicPage({ params }: { params: Params }) {
  const { locale, topic } = params;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  const pillar = PILLAR_BY_ID[topic];
  if (!pillar) notFound();
  const loc = pillarFor(topic, l);
  const t = INSIGHTS_UI[l];
  const articles = articlesByPillar(topic, l);

  return (
    <>
      <section className="ins-hero-section">
        <div className="container-wide">
          <nav className="ins-breadcrumb" aria-label={l === 'fa' ? 'مسیر صفحه' : 'Breadcrumb'}>
            <ol>
              <li><Link href={`/${l}`}>{l === 'fa' ? 'خانه' : 'Home'}</Link></li>
              <li><Link href={`/${l}/insights`}>{t.title}</Link></li>
              <li aria-current="page">{loc?.name}</li>
            </ol>
          </nav>
          <span className="eyebrow sig">{t.eyebrow} · {l === 'fa' ? formatInsightNumber(pillar.order, l) : `0${pillar.order}`}</span>
          <h1 className="q-display">{loc?.name}</h1>
          <p className="ins-subtitle">{loc?.tagline}</p>
          <p className="q-lede">{loc?.description}</p>
        </div>
      </section>

      <section className="q-section">
        <div className="container-wide">
          <h2 className="visually-hidden">{l === 'fa' ? 'مقاله‌های این موضوع' : 'Articles in this topic'}</h2>
          <div className="ins-grid">
            {articles.map((a) => (
              <Link key={a.slug} className="ins-card" href={`/${l}/insights/${a.slug}`}>
                <span className="ins-card-pillar">{loc?.name}</span>
                <h3 className="ins-card-title">{a.title}</h3>
                <span className="ins-card-sub">{a.excerpt}</span>
                <span className="ins-card-meta"><time dateTime={a.published_at}>{formatInsightDate(a.published_at, l)}</time> · {formatInsightNumber(a.readingTime, l)} {t.minRead}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="q-section ins-method-note">
        <div className="container-narrow">
          <h2 className="q-h2">{t.topicsTitle}</h2>
          <div className="ins-topic-links">
            {PILLARS.filter((p) => p.id !== topic).map((p) => (
              <Link key={p.id} href={`/${l}/insights/topics/${p.id}`} className="chip">
                {pillarFor(p.id, l)?.name}
              </Link>
            ))}
            <Link href={`/${l}/insights`} className="chip">{t.allArticles}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
