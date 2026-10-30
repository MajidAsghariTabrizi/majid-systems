// scripts/audit-public-routes.mjs — read-only public route inventory & SEO evidence.
// Usage: node scripts/audit-public-routes.mjs [baseUrl] [outDir]
// Records per-route: status, redirects, title/desc, canonical, hreflang,
// robots meta + X-Robots-Tag, JSON-LD types, OG tags, unhydrated text size.
import fs from 'node:fs';
import path from 'node:path';

const BASE = (process.argv[2] || 'https://quantiviq.xyz').replace(/\/$/, '');
const OUT = process.argv[3] || 'docs/discoverability';

function extract(html, re) { const m = html.match(re); return m ? m[1].trim() : ''; }
async function probe(url) {
  const t0 = Date.now();
  let res, html = '', err = '';
  try { res = await fetch(url, { redirect: 'manual', headers: { 'user-agent': 'QuantiviqSEOAudit/1.0 (+https://quantiviq.xyz)' } }); }
  catch (e) { err = String(e); }
  const ms = Date.now() - t0;
  if (!res) return { url, error: err };
  if ((res.status === 200 || res.status === 304) && !res.headers.get('content-type')?.includes('xml')) html = await res.text().catch(() => '');
  const links = [...html.matchAll(/<link[^>]+>/g)].map((m) => m[0]);
  const jsonLd = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)].map((m) => { try { return JSON.parse(m[1]); } catch { return { '@type': 'INVALID' }; } });
  const text = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  return {
    url,
    status: res.status,
    location: res.headers.get('location') || '',
    ms,
    contentType: res.headers.get('content-type') || '',
    xRobots: res.headers.get('x-robots-tag') || '',
    hsts: res.headers.get('strict-transport-security') ? 'yes' : '',
    bytes: html.length,
    textChars: text.trim().length,
    title: extract(html, /<title[^>]*>([\s\S]*?)<\/title>/),
    desc: extract(html, /<meta[^>]+name="description"[^>]+content="([^"]*)"/) || extract(html, /<meta[^>]+content="([^"]*)"[^>]+name="description"/),
    robotsMeta: extract(html, /<meta[^>]+name="robots"[^>]+content="([^"]*)"/) || extract(html, /<meta[^>]+content="([^"]*)"[^>]+name="robots"/),
    canonical: (links.find((l) => l.includes('rel="canonical"')) || '').match(/href="([^"]*)"/)?.[1] || '',
    hreflang: links.filter((l) => /hreflang/i.test(l)).map((l) => (l.match(/hreflang="([^"]*)"/i) || [])[1] + '→' + (l.match(/href="([^"]*)"/) || [])[1]),
    ogTitle: extract(html, /<meta[^>]+property="og:title"[^>]+content="([^"]*)"/) || '',
    ogImage: extract(html, /<meta[^>]+property="og:image"[^>]+content="([^"]*)"/) || '',
    lang: extract(html, /<html[^>]+lang="([^"]*)"/),
    dir: extract(html, /<html[^>]+dir="([^"]*)"/),
    jsonLdTypes: jsonLd.flatMap((j) => (Array.isArray(j) ? j : [j])).map((j) => j['@type'] + (j.inLanguage ? ':' + j.inLanguage : '')).join('|'),
  };
}

const sitemapUrls = [];
const sm = await fetch(BASE + '/sitemap.xml').then((r) => r.text()).catch(() => '');
for (const m of sm.matchAll(/<loc>([^<]+)<\/loc>/g)) sitemapUrls.push(m[1]);
const extras = ['/', '/en', '/fa', '/robots.txt', '/meet-majid', '/en/mind', '/fa/mind', '/en/profile', '/fa/profile', '/en/journey', '/en/simulator', '/feed.xml', '/en/nonexistent-page-404-probe'];
const urls = [...sitemapUrls];
for (const e of extras) { const u = BASE + e; if (!urls.includes(u)) urls.push(u); }
const results = [];
for (const u of urls) { results.push(await probe(u)); process.stderr.write('.'); }
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, '07_route_probe_raw.json'), JSON.stringify({ base: BASE, generatedAt: new Date().toISOString(), sitemapCount: sitemapUrls.length, results }, null, 1));
const cols = ['url', 'status', 'location', 'ms', 'xRobots', 'robotsMeta', 'title', 'desc', 'canonical', 'hreflang', 'lang', 'dir', 'ogTitle', 'ogImage', 'jsonLdTypes', 'bytes', 'textChars', 'contentType', 'hsts', 'error'];
const esc = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
fs.writeFileSync(path.join(OUT, '07_SEO_ROUTE_AUDIT.csv'), cols.join(',') + '\n' + results.map((r) => cols.map((c) => esc(Array.isArray(r[c]) ? r[c].join(' ; ') : r[c])).join(',')).join('\n'));
const problems = results.filter((r) => r.error || (r.status >= 400) || (r.status >= 300 && !r.location) || (r.status === 200 && r.textChars < 400) || (r.status === 200 && !r.title));
console.log('\nprobed', results.length, 'routes; sitemap entries:', sitemapUrls.length, '; flagged:', problems.length);
for (const p of problems) console.log('FLAG', p.url, p.status || p.error, 'textChars=' + (p.textChars ?? '-'), 'title=' + (p.title ? 'ok' : 'MISSING'));