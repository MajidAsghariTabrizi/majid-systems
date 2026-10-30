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
        disallow: ['/.next/', '/api/internal/', '/api/public-mind/', '/smart-trader/', '/api/lead'],
        // NOTE: the unlisted executive route is intentionally NOT disallowed
        // here — a robots.txt Disallow would hide its noindex meta from
        // crawlers. The meta robots noindex + X-Robots-Tag remain the
        // enforcement (belt and braces, but crawlable).
      },
      // AI-search retrieval + user-initiated fetch are ALLOWED for public
      // content (independent, deliberate decisions — flipping either is a
      // one-line change). GPTBot (training) is allowed as the published
      // Insights are meant to be cited; it is NOT required for search.
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
    ],
    sitemap: `${SITE.canonicalUrl}/sitemap.xml`,
    host: SITE.canonicalUrl,
  };
}
