import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { isLocale } from '@/content/i18n';
import { socialMeta } from '@/lib/social';
import { ARTICLES, AUTHORS, INSIGHTS_STATS, PILLARS, articlesByPillar } from '@/content/insights';
import { INSIGHTS_UI } from '@/content/insights/ui';
import { SITE } from '@/content/shared';

type Params = { locale: string };

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const l = params.locale;
  if (!isLocale(l)) return {};
  const title = 'Quantiviq Research — Authors';
  const description =
    'Quantiviq Research is the editorial collective behind Quantiviq Insights: original, source-verified analysis on AI-native business transformation.';
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
      locale: l === 'fa' ? 'fa' : 'en',
      languages: { en: '/en/insights/author', fa: '/fa/insights/author', 'x-default': '/en/insights/author' },
    }),
  };
}

export default async function AuthorPage({ params }: { params: Params }) {
  const l = params.locale;
  if (!isLocale(l)) notFound();
  if (l === 'fa') {
    const t = INSIGHTS_UI.fa;
    return (
      <section className="q-section">
        <div className="container-narrow">
          <span className="eyebrow sig">{t.eyebrow}</span>
          <h1 className="q-display">{t.authorTitle}</h1>
          <p className="q-lede">{t.noticeBody}</p>
          <div className="hero-actions">
            <Link href="/en/insights/author" hrefLang="en" className="btn btn-primary">
              About Quantiviq Research (EN) <span className="arrow" aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const author = AUTHORS['quantiviq-research'];
  const t = INSIGHTS_UI.en;

  return (
    <>
      <section className="ins-hero-section">
        <div className="container-narrow">
          <nav className="ins-breadcrumb" aria-label="Breadcrumb">
            <ol>
              <li><Link href="/en">Home</Link></li>
              <li><Link href="/en/insights">Insights</Link></li>
              <li aria-current="page">Author</li>
            </ol>
          </nav>
          <span className="eyebrow sig">{t.eyebrow}</span>
          <h1 className="q-display">{author?.name}</h1>
          <p className="ins-subtitle">{author?.role}</p>
          <p className="q-lede">{author?.bio}</p>
        </div>
      </section>

      <section className="q-section">
        <div className="container-wide">
          <h2 className="q-h2">{t.latest}</h2>
          {PILLARS.map((p) => (
            <div key={p.id} className="ins-author-group">
              <h3 className="q-h3-like">{p.name}</h3>
              <ul className="ins-author-list">
                {articlesByPillar(p.id).map((a) => (
                  <li key={a.slug}>
                    <Link href={`/en/insights/${a.slug}`}>
                      {a.title}
                      <span className="ins-card-meta"> — {a.published_at} · {a.readingTime} {t.minRead}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="ins-stats-note">
            {INSIGHTS_STATS.articles} articles · {INSIGHTS_STATS.sources} verified sources · methodology:{' '}
            <Link href="/en/insights/methodology">how we research</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
