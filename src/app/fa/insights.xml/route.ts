import { getArticles, SOURCES } from '@/content/insights';
import { SITE } from '@/content/shared';

export const dynamic = 'force-static';

/** RSS 2.0 feed for the Persian edition of Quantiviq Insights. */
export async function GET(): Promise<Response> {
  const base = SITE.canonicalUrl;
  const ARTICLES = getArticles('fa');
  const items = ARTICLES.map((a) => {
    const sources = (a.source_ids ?? []).map((id) => SOURCES[id]).filter(Boolean);
    const pubDate = new Date(`${a.published_at}T09:00:00Z`).toUTCString();
    return `    <item>
      <title><![CDATA[${a.seo_title}]]></title>
      <link>${base}/fa/insights/${a.slug}</link>
      <guid isPermaLink="true">${base}/fa/insights/${a.slug}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${a.excerpt} تحلیل مستند با ${sources.length} منبع استنادشده.]]></description>
      <category><![CDATA[${a.pillar}]]></category>
    </item>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>تحلیل‌های کوانتی‌ویک</title>
    <link>${base}/fa/insights</link>
    <description>تحلیل‌های اصیل و مستند دربارهٔ تحول کسب‌وکار بومی هوش مصنوعی — استراتژی، اقتصاد، مدل عملیاتی، حکمرانی و راهبردهای کاربردی.</description>
    <language>fa-ir</language>
    <lastBuildDate>${new Date(ARTICLES[0]?.updated_at ?? Date.now()).toUTCString()}</lastBuildDate>
    <atom:link href="${base}/fa/insights.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
