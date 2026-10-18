import type { MetadataRoute } from 'next';

import { SITE } from '@/content/shared';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SITE.canonicalUrl}/sitemap.xml`,
    host: SITE.canonicalUrl,
  };
}
