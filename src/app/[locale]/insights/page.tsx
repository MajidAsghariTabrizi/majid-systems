import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { dict, isLocale } from '@/content/i18n';
import { socialMeta } from '@/lib/social';
import {
  ARTICLES,
  INSIGHTS_STATS,
  PILLARS,
  PILLAR_BY_ID,
  articlesByPillar,
  type Article,
} from '@/content/insights';
import { INSIGHTS_UI } from '@/content/insights/ui';
import { InsightsIndexJsonLd } from '@/components/InsightsJsonLd';
import { SITE } from '@/content/shared';

type Params = { locale: string };

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const l = params.locale;
  if (!isLocale(l)) return {};
  const en = l === 'en';
  return {
    title: en ? 'Quantiviq Insights — AI-Native Business Transformation Research' : 'تحلیل‌های کوانتی‌ویک — پژوهش تحول کسب‌وکار بومی هوش مصنوعی',
    description: en
      ? 'Original, source-verified analysis on AI-native business transformation: strategy, economics, operating models, governance and applied industry playbooks for executives.'
      : 'تحلیل‌های اصیل و مستند دربارهٔ تحول کسب‌وکار بومی هوش مصنوعی: استراتژی، اقتصاد، مدل عملیاتی، حاکمیت و راهبردهای صنعتی برای مدیران.',
    alternates: {
      canonical: `/${l}/insights`,
      languages: { en: '/en/insights', fa: '/fa/insights', 'x-default': '/en/insights' },
      types: { 'application/rss+xml': `${SITE.canonicalUrl}/insights.xml` },
    },
    ...socialMeta({
      title: 'Quantiviq Insights — AI-Native Business Transformation Research',
      description:
        'Original, source-verified analysis on AI transformation: strategy, economics, operating models, governance and applied playbooks.',
      path: `/${l}/insights`,
      locale: l === 'fa' ? 'fa' : 'en',
      languages: { en: '/en/insights', fa: '/fa/insights', 'x-default': '/en/insights' },
    }),
  };
}

function Card({ article, t, locale }: { article: Article; t: (typeof INSIGHTS_UI)['en']; locale: string }) {
  return (
    <Link className="ins-card" href={`/en/insights/${article.slug}`} hrefLang="en">
      <span className="ins-card-pillar">{PILLAR_BY_ID[article.pillar]?.name}</span>
      <span className="ins-card-title">{article.title}</span>
      <span className="ins-card-sub">{article.excerpt}</span>
      <span className="ins-card-meta">
        {article.published_at} · {article.readingTime} {t.minRead}
        {locale === 'fa' ? ' · EN' : ''}
      </span>
    </Link>
  );
}

export default async function InsightsIndexPage({ params }: { params: Params }) {
  const l = params.locale;
  if (!isLocale(l)) notFound();
  const t = INSIGHTS_UI[l === 'fa' ? 'fa' : 'en'];
  const d = dict(l);
  const featured = ARTICLES.find((a) => a.featured) ?? ARTICLES[0];
  const latest = ARTICLES.filter((a) => a.slug !== featured?.slug);

  return (
    <>
      <InsightsIndexJsonLd articles={ARTICLES} />

      <section className="ins-hero-section">
        <div className="container-wide">
          <span className="eyebrow sig">{t.eyebrow}</span>
          <h1 className="q-display">{t.title}</h1>
          <p className="ins-subtitle">{t.subtitle}</p>
          <p className="q-lede">{t.intro}</p>
          <div className="ins-stats" role="list">
            <span role="listitem"><strong>{INSIGHTS_STATS.articles}</strong> {l === 'fa' ? 'مقالهٔ پژوهشی' : 'research articles'}</span>
            <span role="listitem"><strong>{INSIGHTS_STATS.pillars}</strong> {l === 'fa' ? 'محور سردبیری' : 'editorial pillars'}</span>
            <span role="listitem"><strong>{INSIGHTS_STATS.sources}</strong> {t.sourcesLabel}</span>
          </div>
        </div>
      </section>

      {l === 'fa' && (
        <section className="ins-notice">
          <div className="container-narrow">
            <h2>{t.noticeTitle}</h2>
            <p>{t.noticeBody}</p>
          </div>
        </section>
      )}

      {featured && (
        <section className="ins-featured" aria-label={t.series}>
          <div className="container-wide">
            <Link className="ins-featured-card" href={`/en/insights/${featured.slug}`} hrefLang="en">
              <div className="ins-featured-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={featured.hero_image} alt={featured.hero_alt} width={1600} height={900} loading="lazy" decoding="async" />
              </div>
              <div className="ins-featured-body">
                <span className="ins-card-pillar">{PILLAR_BY_ID[featured.pillar]?.name}</span>
                <h2 className="ins-featured-title">{featured.title}</h2>
                <p className="ins-featured-sub">{featured.subtitle}</p>
                <span className="ins-card-meta">
                  {featured.published_at} · {featured.readingTime} {t.minRead} {l === 'fa' ? '· EN' : ''}
                </span>
                <span className="btn btn-primary ins-featured-cta">{t.readArticle} <span className="arrow" aria-hidden>→</span></span>
              </div>
            </Link>
          </div>
        </section>
      )}

      <section className="q-section ins-pillars-section">
        <div className="container-wide">
          <h2 className="q-h2">{t.pillars}</h2>
          <div className="ins-pillar-grid">
            {PILLARS.map((p) => (
              <Link key={p.id} className="ins-pillar" href={`/en/insights/topics/${p.id}`} hrefLang="en">
                <span className="ins-pillar-num">0{p.order}</span>
                <span className="ins-pillar-name">{p.name}</span>
                <span className="ins-pillar-tag">{p.tagline}</span>
                <span className="ins-pillar-desc">{p.description}</span>
                <span className="ins-pillar-count">{articlesByPillar(p.id).length} {l === 'fa' ? 'مقاله' : 'articles'}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="q-section">
        <div className="container-wide">
          <h2 className="q-h2">{t.latest}</h2>
          <div className="ins-grid">
            {latest.map((a) => (
              <Card key={a.slug} article={a} t={t} locale={l} />
            ))}
          </div>
        </div>
      </section>

      <section className="q-section ins-method-note">
        <div className="container-narrow">
          <h2 className="q-h2">{t.methodologyTitle}</h2>
          <p className="q-lede">{t.aiDisclosure}</p>
          <div className="hero-actions">
            <Link href="/en/insights/methodology" hrefLang="en" className="btn">
              {t.methodologyNote} <span className="arrow" aria-hidden>→</span>
            </Link>
            <Link href={l === 'fa' ? '/fa/contact' : '/en/contact'} className="btn btn-primary">
              {t.contactCta} <span className="arrow" aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
