import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { dict, isLocale } from '@/content/i18n';
import { socialMeta } from '@/lib/social';
import {
  ARTICLES_BY_LOCALE,
  AUTHORS,
  PILLAR_BY_ID,
  getArticleBySlug,
  getArticles,
  pillarFor,
  sourcesFor,
  type Article,
  type Locale,
} from '@/content/insights';
import { INSIGHTS_UI } from '@/content/insights/ui';
import { ArticleJsonLd } from '@/components/InsightsJsonLd';
import { InsightRead } from '@/components/InsightRead';
import { ArticleSolutionBridge } from '@/components/solutions/ArticleSolutionBridge';
import { SITE } from '@/content/shared';
import { formatInsightDate, formatInsightNumber } from '@/lib/insights-format';

type Params = { locale: string; slug: string };

/** Articles are published bilingually: EN originals + complete FA counterparts
 *  at the same slug under /fa/insights. Missing FA content is a hard 404 —
 *  never an English fallback under a Persian URL. */
export function generateStaticParams(): { locale: string; slug: string }[] {
  return (['en', 'fa'] as Locale[]).flatMap((locale) =>
    getArticles(locale).map((a) => ({ locale, slug: a.slug })),
  );
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = params;
  if (!isLocale(locale)) return { robots: { index: false, follow: false } };
  const l = locale as Locale;
  const article = getArticleBySlug(slug, l);
  if (!article) return {};
  const path = `/${l}/insights/${article.slug}`;
  const ogImage = l === 'fa' ? `/og/insights/fa/${article.id}.png` : `/og/insights/${article.id}.png`;
  return {
    title: article.seo_title,
    description: article.seo_description,
    keywords: [article.primary_term, ...article.secondary_terms],
    alternates: {
      canonical: path,
      languages: { en: `/en/insights/${article.slug}`, fa: `/fa/insights/${article.slug}` },
      types: { 'application/rss+xml': `${SITE.canonicalUrl}/${l === 'fa' ? 'fa/insights.xml' : 'insights.xml'}` },
    },
    ...socialMeta({
      title: article.seo_title,
      description: article.seo_description,
      path,
      locale: l,
      languages: { en: `/en/insights/${article.slug}`, fa: `/fa/insights/${article.slug}` },
      image: ogImage,
      imageAlt: article.hero_alt,
      type: 'article',
    }),
  };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { locale, slug } = params;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  const article = getArticleBySlug(slug, l);
  if (!article) notFound();

  const t = INSIGHTS_UI[l];
  const d = dict(l);
  const author = AUTHORS[article.author_id];
  const pillar = pillarFor(article.pillar, l);
  const sources = sourcesFor(article);
  const verificationDates = [...new Set(sources.map((source) => source.accessed_at))]
    .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date)).sort();
  const corpus = ARTICLES_BY_LOCALE[l];
  const idx = corpus.findIndex((a) => a.slug === article.slug);
  const prev = idx < corpus.length - 1 ? corpus[idx + 1] : null;
  const next = idx > 0 ? corpus[idx - 1] : null;
  const related = (article.related_article_ids ?? [])
    .map((id) => corpus.find((a) => a.id === id))
    .filter((a): a is Article => Boolean(a));
  const shareUrl = `${SITE.canonicalUrl}/${l}/insights/${article.slug}`;
  const ogImage = l === 'fa' ? `/og/insights/fa/${article.id}.png` : `/og/insights/${article.id}.png`;
  const pillarName = (p: string) => pillarFor(p, l)?.name ?? PILLAR_BY_ID[p]?.name;

  return (
    <article className="ins-article" itemScope itemType="https://schema.org/BlogPosting">
      <ArticleJsonLd article={article} />
    <InsightRead slug={article.slug} locale={article.locale} />

      <header className="ins-article-head">
        <div className="container">
          <nav className="ins-breadcrumb" aria-label={l === 'fa' ? 'مسیر صفحه' : 'Breadcrumb'}>
            <ol>
              <li><Link href={`/${l}`}>{l === 'fa' ? 'خانه' : 'Home'}</Link></li>
              <li><Link href={`/${l}/insights`}>{t.title}</Link></li>
              <li>
                <Link href={`/${l}/insights/topics/${article.pillar}`}>{pillar?.name}</Link>
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
                <Link href={`/${l}/insights/author`} itemProp="author">
                  {l === 'fa' && author.author_id === 'quantiviq-research' ? 'پژوهش کوانتی‌ویک' : author.name}
                </Link>
              </span>
            )}
            <span className="ins-meta-dot" aria-hidden>·</span>
            <time dateTime={article.published_at} itemProp="datePublished">
              {t.published} {formatInsightDate(article.published_at, l)}
            </time>
            {article.updated_at !== article.published_at && (
              <>
                <span className="ins-meta-dot" aria-hidden>·</span>
                <time dateTime={article.updated_at} itemProp="dateModified">
                  {t.updated} {formatInsightDate(article.updated_at, l)}
                </time>
              </>
            )}
            <span className="ins-meta-dot" aria-hidden>·</span>
            <span>{formatInsightNumber(article.readingTime, l)} {t.minRead}</span>
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
            <details className="ins-mobile-toc">
              <summary>{t.onThisPage}</summary>
              <nav aria-label={t.onThisPage}>
                <ul>{article.headings.filter((heading) => heading.depth === 2).map((heading) => (
                  <li key={heading.id}><a href={`#${heading.id}`}>{heading.text}</a></li>
                ))}</ul>
              </nav>
            </details>
            <div className="ins-prose" itemProp="articleBody" dangerouslySetInnerHTML={{ __html: article.html }} />

            <aside className="ins-rail" aria-label={l === 'fa' ? 'راهنمای مقاله و اشتراک‌گذاری' : 'Article navigation and sharing'}>
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
                  {l === 'fa' ? 'ایمیل' : 'Email'}
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
              {formatInsightNumber(sources.length, l)} {t.sourcesLabel} · {t.methodologyNote}:{' '}
              <Link href={`/${l}/insights/methodology`}>{t.methodologyTitle}</Link>.{' '}
              {verificationDates.length > 0 && <>{l === 'fa' ? 'تاریخ ثبت‌شده برای بررسی منابع: ' : 'Recorded source checks: '}
                {formatInsightDate(verificationDates[0], l)}
                {verificationDates.length > 1 && <> — {formatInsightDate(verificationDates[verificationDates.length - 1], l)}</>}.
              </>}
            </p>
          </section>

          <nav className="ins-articlenav" aria-label={l === 'fa' ? 'مقاله‌های قبلی و بعدی' : 'Article navigation'}>
            {prev ? (
              <Link className="ins-articlenav-prev" href={`/${l}/insights/${prev.slug}`} rel="prev">
                <span className="ins-articlenav-label">{l === 'fa' ? '→' : '←'} {t.prevArticle}</span>
                <span className="ins-articlenav-title">{prev.title}</span>
              </Link>
            ) : (
              <Link className="ins-articlenav-prev" href={`/${l}/insights`} rel="prev">
                <span className="ins-articlenav-label">{l === 'fa' ? '→' : '←'} {t.backToInsights}</span>
              </Link>
            )}
            {next && (
              <Link className="ins-articlenav-next" href={`/${l}/insights/${next.slug}`} rel="next">
                <span className="ins-articlenav-label">{t.nextArticle} {l === 'fa' ? '←' : '→'}</span>
                <span className="ins-articlenav-title">{next.title}</span>
              </Link>
            )}
          </nav>

          {/* Editorial bridge: one restrained panel from the central registry */}
      <ArticleSolutionBridge articleId={`${article.id}-${article.slug}`} locale={l} />

            {related.length > 0 && (
            <section className="ins-related" aria-label={t.related}>
              <h2>{t.related}</h2>
              <div className="ins-grid">
                {related.map((r) => (
                  <Link key={r.slug} className="ins-card" href={`/${l}/insights/${r.slug}`}>
                    <span className="ins-card-pillar">{pillarName(r.pillar)}</span>
                    <h3 className="ins-card-title">{r.title}</h3>
                    <span className="ins-card-meta">{formatInsightNumber(r.readingTime, l)} {t.minRead}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <aside className="ins-cta">
            <h2>{t.contactCta}</h2>
            <p>{t.contactBody}</p>
            <div className="hero-actions">
              <Link href={`/${l}/contact`} className="btn btn-primary">
                {d.nav.contact} <span className="arrow" aria-hidden>→</span>
              </Link>
              <Link href={`/${l}/system`} className="btn">
                {d.nav.system} <span className="arrow" aria-hidden>→</span>
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
