import { AUTHORS, PILLAR_BY_ID, pillarFor, type Article } from '@/content/insights';
import { SITE } from '@/content/shared';

/** BlogPosting + BreadcrumbList structured data for an Insights article.
 *  Locale-aware: URL, inLanguage, image and breadcrumb names follow the
 *  article's own locale (FA articles get FA OG images and FA pillar names). */
export function ArticleJsonLd({ article }: { article: Article }) {
  const base = SITE.canonicalUrl;
  const l = article.locale;
  const author = AUTHORS[article.author_id];
  const url = `${base}/${l}/insights/${article.slug}`;
  const pillar = pillarFor(article.pillar, l);
  const ogImage = l === 'fa' ? `${base}/og/insights/fa/${article.id}.png` : `${base}/og/insights/${article.id}.png`;
  const blogName = l === 'fa' ? 'تحلیل‌های کوانتی‌ویک' : 'Quantiviq Insights';
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            '@id': url,
            mainEntityOfPage: { '@type': 'WebPage', '@id': url },
            headline: article.seo_title,
            alternativeHeadline: article.subtitle,
            description: article.seo_description,
            inLanguage: l,
            url,
            datePublished: article.published_at,
            dateModified: article.updated_at,
            wordCount: article.words,
            keywords: [article.primary_term, ...article.secondary_terms].join(', '),
            articleSection: pillar?.name,
            image: [ogImage],
            author: {
              '@type': 'Organization',
              name: author?.name ?? 'Quantiviq Research',
              url: `${base}/${l}/insights/author`,
            },
            publisher: {
              '@type': 'Organization',
              name: 'Quantiviq',
              url: base,
            },
            isPartOf: { '@type': 'Blog', '@id': `${base}/${l}/insights`, name: blogName },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: blogName, item: `${base}/${l}/insights` },
              { '@type': 'ListItem', position: 2, name: pillar?.name ?? 'Analysis', item: `${base}/${l}/insights/topics/${article.pillar}` },
              { '@type': 'ListItem', position: 3, name: article.title, item: url },
            ],
          },
        ]),
      }}
    />
  );
}

/** Blog structured data for a publication index (locale-scoped by caller). */
export function InsightsIndexJsonLd({ articles, locale = 'en' }: { articles: Article[]; locale?: 'en' | 'fa' }) {
  const base = SITE.canonicalUrl;
  const l = locale;
  const blogName = l === 'fa' ? 'تحلیل‌های کوانتی‌ویک' : 'Quantiviq Insights';
  const description =
    l === 'fa'
      ? 'تحلیل‌های اصیل دربارهٔ تحول کسب‌وکار بومی هوش مصنوعی.'
      : 'Original analysis on AI-native business transformation.';
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Blog',
          '@id': `${base}/${l}/insights`,
          name: blogName,
          description,
          url: `${base}/${l}/insights`,
          inLanguage: l,
          publisher: { '@type': 'Organization', name: 'Quantiviq', url: base },
          blogPost: articles.slice(0, 20).map((a) => ({
            '@type': 'BlogPosting',
            headline: a.seo_title,
            url: `${base}/${l}/insights/${a.slug}`,
            datePublished: a.published_at,
            dateModified: a.updated_at,
          })),
        }),
      }}
    />
  );
}

export function pillarName(pillar: string, locale: 'en' | 'fa'): string {
  return (locale === 'fa' ? pillarFor(pillar, 'fa') : PILLAR_BY_ID[pillar])?.name ?? '';
}
