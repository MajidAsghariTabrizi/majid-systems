import type { MetadataRoute } from 'next';

import { SITE } from '@/content/shared';

/** Single source of truth for robots.txt — the shadowing public/robots.txt
 *  was removed so this generated file is the one actually served. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/.next/', '/api/internal/'],
      },
    ],
    sitemap: `${SITE.canonicalUrl}/sitemap.xml`,
  };
}
