import { ARTICLES, PILLARS, SOURCES } from '@/content/insights';
import { SITE } from '@/content/shared';

export const dynamic = 'force-static';

/** Machine-readable article index for AI agents and integrations.
 *  Companion to /insights.xml (RSS) and /llms.txt. */
export async function GET(): Promise<Response> {
  const base = SITE.canonicalUrl;
  const payload = {
    publication: 'Quantiviq Insights',
    description: 'Original, source-verified analysis on AI-native business transformation.',
    language: 'en',
    url: `${base}/en/insights`,
    rss: `${base}/insights.xml`,
    methodology: `${base}/en/insights/methodology`,
    pillars: PILLARS.map((p) => ({ id: p.id, name: p.name, url: `${base}/en/insights/topics/${p.id}` })),
    sources: Object.values(SOURCES).map((s) => ({
      id: s.source_id,
      title: s.title,
      publisher: s.publisher,
      date: s.publication_date,
      url: s.source_url,
      accessed_at: s.accessed_at,
    })),
    articles: ARTICLES.map((a) => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      subtitle: a.subtitle,
      excerpt: a.excerpt,
      pillar: a.pillar,
      url: `${base}/en/insights/${a.slug}`,
      published: a.published_at,
      updated: a.updated_at,
      reading_time_minutes: a.readingTime,
      primary_term: a.primary_term,
      source_ids: a.source_ids,
      references: (a.source_ids ?? []).map((id) => SOURCES[id]?.source_url).filter(Boolean),
      headings: a.headings.filter((h) => h.depth === 2).map((h) => ({ id: h.id, text: h.text })),
    })),
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
