import { AUTHORS, ARTICLE_BY_SLUG, PILLAR_BY_ID, type Article } from '@/content/insights';
import { SITE } from '@/content/shared';

/** BlogPosting + BreadcrumbList structured data for an Insights article. */
export function ArticleJsonLd({ article }: { article: Article }) {
  const base = SITE.canonicalUrl;
  const author = AUTHORS[article.author_id];
  const url = `${base}/en/insights/${article.slug}`;
  const pillar = PILLAR_BY_ID[article.pillar];
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
            inLanguage: 'en',
            url,
            datePublished: article.published_at,
            dateModified: article.updated_at,
            wordCount: article.words,
            keywords: [article.primary_term, ...article.secondary_terms].join(', '),
            articleSection: pillar?.name,
            image: [`${base}/og/insights/${article.id}.png`],
            author: {
              '@type': 'Organization',
              name: author?.name ?? 'Quantiviq Research',
              url: `${base}/en/insights/author`,
            },
            publisher: {
              '@type': 'Organization',
              name: 'Quantiviq',
              url: base,
            },
            isPartOf: { '@type': 'Blog', '@id': `${base}/en/insights`, name: 'Quantiviq Insights' },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Insights', item: `${base}/en/insights` },
              { '@type': 'ListItem', position: 2, name: pillar?.name ?? 'Analysis', item: `${base}/en/insights/topics/${article.pillar}` },
              { '@type': 'ListItem', position: 3, name: article.title, item: url },
            ],
          },
        ]),
      }}
    />
  );
}

/** Blog structured data for the publication index. */
export function InsightsIndexJsonLd({ articles }: { articles: Article[] }) {
  const base = SITE.canonicalUrl;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Blog',
          '@id': `${base}/en/insights`,
          name: 'Quantiviq Insights',
          description: 'Original analysis on AI-native business transformation.',
          url: `${base}/en/insights`,
          inLanguage: 'en',
          publisher: { '@type': 'Organization', name: 'Quantiviq', url: base },
          blogPost: articles.slice(0, 20).map((a) => ({
            '@type': 'BlogPosting',
            headline: a.seo_title,
            url: `${base}/en/insights/${a.slug}`,
            datePublished: a.published_at,
            dateModified: a.updated_at,
          })),
        }),
      }}
    />
  );
}

export function articleFromSlug(slug: string): Article | undefined {
  return ARTICLE_BY_SLUG[slug];
}
