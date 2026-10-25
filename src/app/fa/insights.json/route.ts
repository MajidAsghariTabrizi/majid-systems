import { getArticles, PILLARS_FA, SOURCES, PILLARS } from '@/content/insights';
import { SITE } from '@/content/shared';

export const dynamic = 'force-static';

/** Machine-readable Persian article index for AI agents and integrations.
 *  Companion to /fa/insights.xml (RSS) — mirrors /insights.json for the FA edition. */
export async function GET(): Promise<Response> {
  const base = SITE.canonicalUrl;
  const ARTICLES = getArticles('fa');
  const payload = {
    publication: 'تحلیل‌های کوانتی‌ویک',
    description: 'تحلیل‌های اصیل و مستند دربارهٔ تحول کسب‌وکار بومی هوش مصنوعی.',
    language: 'fa',
    url: `${base}/fa/insights`,
    rss: `${base}/fa/insights.xml`,
    methodology: `${base}/fa/insights/methodology`,
    pillars: PILLARS.map((p) => ({ id: p.id, name: PILLARS_FA[p.id].name, url: `${base}/fa/insights/topics/${p.id}` })),
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
      url: `${base}/fa/insights/${a.slug}`,
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
