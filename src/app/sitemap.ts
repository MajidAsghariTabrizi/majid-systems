import type { MetadataRoute } from 'next';

import { PROJECTS } from '@/content/projects';
import { NOTES } from '@/content/notes';
import { ARTICLES, getArticles, PILLARS } from '@/content/insights';
import { BOOKS } from '@/content/knowledge';
import { SITE } from '@/content/shared';

const BASE = SITE.canonicalUrl;
const FA_ARTICLES = getArticles('fa');
const faArticleBySlug = new Map(FA_ARTICLES.map((a) => [a.slug, a]));

/** Locale-prefixed routes with EN/FA alternates. */
function loc(p: string): MetadataRoute.Sitemap[number] {
  return {
    url: `${BASE}/en${p}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: p === '' ? 1.0 : 0.8,
    alternates: {
      languages: {
        en: `${BASE}/en${p}`,
        fa: `${BASE}/fa${p}`,
        'x-default': `${BASE}/en${p}`,
      },
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const items: MetadataRoute.Sitemap = ['', '/explore', '/services', '/system', '/lab', '/method', '/proof', '/about', '/contact', '/privacy', '/mind', '/mind/flows', '/insights/enterprise-ai-stack', '/insights/books'].map((p) =>
    loc(p)
  );

  /* Silver-bullet knowledge library: 10 book detail pages (bilingual). */
  items.push(
    ...BOOKS.flatMap((b) => [
      {
        url: `${BASE}/en/insights/books/${b.slug}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
        alternates: {
          languages: {
            en: `${BASE}/en/insights/books/${b.slug}`,
            fa: `${BASE}/fa/insights/books/${b.slug}`,
            'x-default': `${BASE}/en/insights/books/${b.slug}`,
          },
        },
      },
    ]),
  );

  /* Quantiviq Insights publication (bilingual EN + FA, same slugs). */
  items.push(
    {
      url: `${BASE}/en/insights`,
      lastModified: ARTICLES[0] ? new Date(ARTICLES[0].updated_at) : now,
      changeFrequency: 'weekly',
      priority: 0.95,
      alternates: {
        languages: {
          en: `${BASE}/en/insights`,
          fa: `${BASE}/fa/insights`,
          'x-default': `${BASE}/en/insights`,
        },
      },
    },
    {
      url: `${BASE}/fa/insights`,
      lastModified: FA_ARTICLES[0] ? new Date(FA_ARTICLES[0].updated_at) : now,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: {
          en: `${BASE}/en/insights`,
          fa: `${BASE}/fa/insights`,
          'x-default': `${BASE}/en/insights`,
        },
      },
    },
    {
      url: `${BASE}/en/insights/methodology`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
      alternates: {
        languages: {
          en: `${BASE}/en/insights/methodology`,
          fa: `${BASE}/fa/insights/methodology`,
          'x-default': `${BASE}/en/insights/methodology`,
        },
      },
    },
    {
      url: `${BASE}/fa/insights/methodology`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
      alternates: {
        languages: {
          en: `${BASE}/en/insights/methodology`,
          fa: `${BASE}/fa/insights/methodology`,
          'x-default': `${BASE}/en/insights/methodology`,
        },
      },
    },
    {
      url: `${BASE}/en/insights/author`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
      alternates: {
        languages: {
          en: `${BASE}/en/insights/author`,
          fa: `${BASE}/fa/insights/author`,
          'x-default': `${BASE}/en/insights/author`,
        },
      },
    },
    {
      url: `${BASE}/fa/insights/author`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
      alternates: {
        languages: {
          en: `${BASE}/en/insights/author`,
          fa: `${BASE}/fa/insights/author`,
          'x-default': `${BASE}/en/insights/author`,
        },
      },
    },
  );
  for (const p of PILLARS) {
    items.push(
      {
        url: `${BASE}/en/insights/topics/${p.id}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: {
          languages: {
            en: `${BASE}/en/insights/topics/${p.id}`,
            fa: `${BASE}/fa/insights/topics/${p.id}`,
          },
        },
      },
      {
        url: `${BASE}/fa/insights/topics/${p.id}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: {
          languages: {
            en: `${BASE}/en/insights/topics/${p.id}`,
            fa: `${BASE}/fa/insights/topics/${p.id}`,
          },
        },
      },
    );
  }
  for (const a of ARTICLES) {
    // EN article with reciprocal hreflang when the FA counterpart exists.
    const faUrl = faArticleBySlug.has(a.slug) ? `${BASE}/fa/insights/${a.slug}` : undefined;
    items.push({
      url: `${BASE}/en/insights/${a.slug}`,
      lastModified: new Date(a.updated_at),
      changeFrequency: 'monthly',
      priority: a.featured ? 0.9 : 0.8,
      ...(faUrl
        ? { alternates: { languages: { en: `${BASE}/en/insights/${a.slug}`, fa: faUrl } } }
        : {}),
    });
  }
  for (const a of FA_ARTICLES) {
    items.push({
      url: `${BASE}/fa/insights/${a.slug}`,
      lastModified: new Date(a.updated_at),
      changeFrequency: 'monthly',
      priority: a.featured ? 0.9 : 0.8,
      alternates: {
        languages: {
          en: `${BASE}/en/insights/${a.slug}`,
          fa: `${BASE}/fa/insights/${a.slug}`,
        },
      },
    });
  }

  // Shared English deep content (locale-neutral builder tree).
  const shared: MetadataRoute.Sitemap = [
    { path: '/journey', priority: 0.9 },
    { path: '/profile', priority: 0.9 },
    { path: '/work', priority: 0.85 },
    { path: '/engineering', priority: 0.8 },
    { path: '/notes', priority: 0.8 },
    { path: '/open-source', priority: 0.8 },
    { path: '/resume', priority: 0.5 },
  ].map((r) => ({
    url: `${BASE}${r.path}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: r.priority,
  }));

  items.push(...shared);

  for (const p of PROJECTS.filter((x) => x.category === 'flagship')) {
    items.push({
      url: `${BASE}/work/${p.slug}`,
      lastModified: p.dates.latest ? new Date(p.dates.latest) : now,
      changeFrequency: 'monthly',
      priority: 0.85,
    });
  }

  for (const n of NOTES) {
    items.push({
      url: `${BASE}/notes/${n.slug}`,
      lastModified: n.date ? new Date(n.date) : now,
      changeFrequency: 'yearly',
      priority: 0.7,
    });
  }

  return items;
}
