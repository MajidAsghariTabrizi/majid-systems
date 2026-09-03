import type { MetadataRoute } from 'next';

import { PROJECTS } from '@/content/projects';
import { NOTES } from '@/content/notes';
import { SITE } from '@/content/shared';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = [
    { path: '', priority: 1.0, changeFrequency: 'monthly' as const },
    { path: '/work', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/engineering', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/notes', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/open-source', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/about', priority: 0.7, changeFrequency: 'yearly' as const },
    { path: '/contact', priority: 0.6, changeFrequency: 'yearly' as const },
  ];

  const items: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${SITE.canonicalUrl}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  for (const p of PROJECTS.filter((x) => x.category === 'flagship')) {
    items.push({
      url: `${SITE.canonicalUrl}/work/${p.slug}`,
      lastModified: p.dates.latest ? new Date(p.dates.latest) : now,
      changeFrequency: 'monthly',
      priority: 0.85,
    });
  }

  for (const n of NOTES) {
    items.push({
      url: `${SITE.canonicalUrl}/notes/${n.slug}`,
      lastModified: n.date ? new Date(n.date) : now,
      changeFrequency: 'yearly',
      priority: 0.7,
    });
  }

  return items;
}