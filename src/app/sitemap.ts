import type { MetadataRoute } from 'next';

import { PROJECTS } from '@/content/projects';
import { NOTES } from '@/content/notes';
import { ARTICLES, PILLARS } from '@/content/insights';
import { SITE } from '@/content/shared';

const BASE = SITE.canonicalUrl;

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
  const items: MetadataRoute.Sitemap = ['', '/services', '/system', '/lab', '/method', '/proof', '/about', '/contact', '/privacy'].map((p) =>
    loc(p)
  );

  /* Quantiviq Insights publication (EN primary; FA index localized). */
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
      lastModified: ARTICLES[0] ? new Date(ARTICLES[0].updated_at) : now,
      changeFrequency: 'weekly',
      priority: 0.6,
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
  );
  for (const p of PILLARS) {
    items.push({
      url: `${BASE}/en/insights/topics/${p.id}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }
  for (const a of ARTICLES) {
    items.push({
      url: `${BASE}/en/insights/${a.slug}`,
      lastModified: new Date(a.updated_at),
      changeFrequency: 'monthly',
      priority: a.featured ? 0.9 : 0.8,
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
