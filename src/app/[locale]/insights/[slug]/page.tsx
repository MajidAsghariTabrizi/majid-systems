import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { dict, isLocale } from '@/content/i18n';
import { socialMeta } from '@/lib/social';
import {
  ARTICLES,
  ARTICLE_BY_SLUG,
  AUTHORS,
  PILLAR_BY_ID,
  sourcesFor,
  type Article,
} from '@/content/insights';
import { INSIGHTS_UI } from '@/content/insights/ui';
import { ArticleJsonLd } from '@/components/InsightsJsonLd';
import { SITE } from '@/content/shared';

type Params = { locale: string; slug: string };

/** Articles are published in English only. FA article URLs do not exist
 *  (no fake hreflang; the FA index links to the English originals). */
export function generateStaticParams(): { locale: string; slug: string }[] {
  return ARTICLES.map((a) => ({ locale: 'en', slug: a.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = params;
  if (locale !== 'en') return { robots: { index: false, follow: false } };
  const article = ARTICLE_BY_SLUG[slug];
  if (!article) return {};
  return {
    title: article.seo_title,
    description: article.seo_description,
    keywords: [article.primary_term, ...article.secondary_terms],
    alternates: {
      canonical: `/en/insights/${article.slug}`,
      types: { 'application/rss+xml': `${SITE.canonicalUrl}/insights.xml` },
    },
    ...socialMeta({
      title: article.seo_title,
      description: article.seo_description,
      path: `/en/insights/${article.slug}`,
      locale: 'en',
      image: `/og/insights/${article.id}.png`,
      imageAlt: article.hero_alt,
      type: 'article',
    }),
  };
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { locale, slug } = params;
  if (locale !== 'en') notFound();
  const article = ARTICLE_BY_SLUG[slug];
  if (!article) notFound();

  const t = INSIGHTS_UI.en;
  const d = dict('en');
  const author = AUTHORS[article.author_id];
  const pillar = PILLAR_BY_ID[article.pillar];
  const sources = sourcesFor(article);
  const idx = ARTICLES.findIndex((a) => a.slug === article.slug);
  const prev = idx < ARTICLES.length - 1 ? ARTICLES[idx + 1] : null;
  const next = idx > 0 ? ARTICLES[idx - 1] : null;
  const related = (article.related_article_ids ?? [])
    .map((id) => ARTICLES.find((a) => a.id === id))
    .filter((a): a is Article => Boolean(a));
  const shareUrl = `${SITE.canonicalUrl}/en/insights/${article.slug}`;

  return (
    <article className="ins-article" itemScope itemType="https://schema.org/BlogPosting">
      <ArticleJsonLd article={article} />

      <header className="ins-article-head">
        <div className="container">
          <nav className="ins-breadcrumb" aria-label="Breadcrumb">
            <ol>
              <li><Link href="/en">Home</Link></li>
              <li><Link href="/en/insights">{t.title}</Link></li>
              <li>
                <Link href={`/en/insights/topics/${article.pillar}`}>{pillar?.name}</Link>
              </li>
            </ol>
          </nav>
          <span className="eyebrow sig">{pillar?.name}</span>
          <h1 className="ins-h1" itemProp="headline">{article.title}</h1>
          <p className="ins-deck">{article.subtitle}</p>
          <div className="ins-meta">
            {author && (
              <span className="ins-meta-author">
                {t.byAuthor}{' '}
                <Link href="/en/insights/author" itemProp="author">
                  {author.name}
                </Link>
              </span>
            )}
            <span className="ins-meta-dot" aria-hidden>·</span>
            <time dateTime={article.published_at} itemProp="datePublished">
              {t.published} {formatDate(article.published_at)}
            </time>
            {article.updated_at !== article.published_at && (
              <>
                <span className="ins-meta-dot" aria-hidden>·</span>
                <time dateTime={article.updated_at} itemProp="dateModified">
                  {t.updated} {formatDate(article.updated_at)}
                </time>
              </>
            )}
            <span className="ins-meta-dot" aria-hidden>·</span>
            <span>{article.readingTime} {t.minRead}</span>
          </div>
        </div>
      </header>

      <figure className="ins-hero">
        <div className="container">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.hero_image}
            alt={article.hero_alt}
            width={1600}
            height={900}
            itemProp="image"
            decoding="async"
          />
          <figcaption>{article.hero_caption}</figcaption>
        </div>
      </figure>

      <div className="ins-article-body">
        <div className="container">
          <div className="ins-layout">
            <div className="ins-prose" itemProp="articleBody" dangerouslySetInnerHTML={{ __html: article.html }} />

            <aside className="ins-rail">
              <nav className="ins-toc" aria-label={t.onThisPage}>
                <h2 className="ins-rail-h">{t.onThisPage}</h2>
                <ul>
                  {article.headings
                    .filter((h) => h.depth === 2)
                    .map((h) => (
                      <li key={h.id}>
                        <a href={`#${h.id}`}>{h.text}</a>
                      </li>
                    ))}
                </ul>
              </nav>
              <div className="ins-share">
                <h2 className="ins-rail-h">{t.share}</h2>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
                <a href={`https://x.com/intent/post?text=${encodeURIComponent(article.seo_title)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer">
                  X
                </a>
                <a href={`mailto:?subject=${encodeURIComponent(article.seo_title)}&body=${encodeURIComponent(shareUrl)}`}>
                  Email
                </a>
              </div>
            </aside>
          </div>

          {(article.discussion_questions ?? []).length > 0 && (
            <section className="ins-discussion" aria-label={t.discussion}>
              <h2>{t.discussion}</h2>
              <p className="ins-discussion-intro">{t.discussionIntro}</p>
              <ol>
                {article.discussion_questions.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ol>
            </section>
          )}

          <section className="ins-refs" aria-label={t.references}>
            <p className="ins-refs-note">
              {sources.length} {t.sourcesLabel} · {t.methodologyNote}:{' '}
              <Link href="/en/insights/methodology">methodology</Link>. Links verified {sources[0]?.accessed_at ?? '2026-10-23'}.
            </p>
          </section>

          <nav className="ins-articlenav" aria-label="Article navigation">
            {prev ? (
              <Link className="ins-articlenav-prev" href={`/en/insights/${prev.slug}`} rel="prev">
                <span className="ins-articlenav-label">← {t.prevArticle}</span>
                <span className="ins-articlenav-title">{prev.title}</span>
              </Link>
            ) : (
              <Link className="ins-articlenav-prev" href="/en/insights" rel="prev">
                <span className="ins-articlenav-label">← {t.backToInsights}</span>
              </Link>
            )}
            {next && (
              <Link className="ins-articlenav-next" href={`/en/insights/${next.slug}`} rel="next">
                <span className="ins-articlenav-label">{t.nextArticle} →</span>
                <span className="ins-articlenav-title">{next.title}</span>
              </Link>
            )}
          </nav>

          {related.length > 0 && (
            <section className="ins-related" aria-label={t.related}>
              <h2>{t.related}</h2>
              <div className="ins-grid">
                {related.map((r) => (
                  <Link key={r.slug} className="ins-card" href={`/en/insights/${r.slug}`}>
                    <span className="ins-card-pillar">{PILLAR_BY_ID[r.pillar]?.name}</span>
                    <span className="ins-card-title">{r.title}</span>
                    <span className="ins-card-meta">{r.readingTime} {t.minRead}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <aside className="ins-cta">
            <h2>{t.contactCta}</h2>
            <p>{t.contactBody}</p>
            <div className="hero-actions">
              <Link href="/en/contact" className="btn btn-primary">
                {d.nav.contact} <span className="arrow" aria-hidden>→</span>
              </Link>
              <Link href="/en/system" className="btn">
                {d.nav.system} <span className="arrow" aria-hidden>→</span>
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
