import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { isLocale } from '@/content/i18n';
import { socialMeta } from '@/lib/social';
import { ARTICLES, PILLARS, PILLAR_BY_ID, articlesByPillar } from '@/content/insights';
import { INSIGHTS_UI } from '@/content/insights/ui';
import { SITE } from '@/content/shared';

type Params = { locale: string; topic: string };

export const dynamicParams = false;

export function generateStaticParams(): { locale: string; topic: string }[] {
  return PILLARS.flatMap((p) => [
    { locale: 'en', topic: p.id },
  ]);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, topic } = params;
  if (locale !== 'en') return { robots: { index: false, follow: false } };
  const pillar = PILLAR_BY_ID[topic];
  if (!pillar) return {};
  return {
    title: `${pillar.name} — Quantiviq Insights`,
    description: `${pillar.description} Original, source-verified analysis from Quantiviq Research.`,
    alternates: {
      canonical: `/en/insights/topics/${topic}`,
      types: { 'application/rss+xml': `${SITE.canonicalUrl}/insights.xml` },
    },
    ...socialMeta({
      title: `${pillar.name} — Quantiviq Insights`,
      description: pillar.description,
      path: `/en/insights/topics/${topic}`,
      locale: 'en',
    }),
  };
}

export default async function TopicPage({ params }: { params: Params }) {
  const { locale, topic } = params;
  if (locale !== 'en') notFound();
  const pillar = PILLAR_BY_ID[topic];
  if (!pillar) notFound();
  const t = INSIGHTS_UI.en;
  const articles = articlesByPillar(topic);

  return (
    <>
      <section className="ins-hero-section">
        <div className="container-wide">
          <nav className="ins-breadcrumb" aria-label="Breadcrumb">
            <ol>
              <li><Link href="/en">Home</Link></li>
              <li><Link href="/en/insights">Insights</Link></li>
              <li aria-current="page">{pillar.name}</li>
            </ol>
          </nav>
          <span className="eyebrow sig">{t.eyebrow} · 0{pillar.order}</span>
          <h1 className="q-display">{pillar.name}</h1>
          <p className="ins-subtitle">{pillar.tagline}</p>
          <p className="q-lede">{pillar.description}</p>
        </div>
      </section>

      <section className="q-section">
        <div className="container-wide">
          <div className="ins-grid">
            {articles.map((a) => (
              <Link key={a.slug} className="ins-card" href={`/en/insights/${a.slug}`}>
                <span className="ins-card-pillar">{pillar.name}</span>
                <span className="ins-card-title">{a.title}</span>
                <span className="ins-card-sub">{a.excerpt}</span>
                <span className="ins-card-meta">{a.published_at} · {a.readingTime} {t.minRead}</span>
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
              <Link key={p.id} href={`/en/insights/topics/${p.id}`} className="chip">
                {p.name}
              </Link>
            ))}
            <Link href="/en/insights" className="chip">{t.allArticles}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
