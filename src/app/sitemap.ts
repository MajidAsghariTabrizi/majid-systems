import type { MetadataRoute } from 'next';

import { PROJECTS } from '@/content/projects';
import { NOTES } from '@/content/notes';
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
  const items: MetadataRoute.Sitemap = ['', '/services', '/system', '/method', '/proof', '/about', '/contact', '/privacy'].map((p) =>
    loc(p)
  );

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
