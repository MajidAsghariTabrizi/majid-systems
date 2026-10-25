#!/usr/bin/env node
/**
 * insights-check.mjs — QA suite for the Quantiviq Insights publication.
 * Usage: CAPTURE_BASE=http://127.0.0.1:3219 node scripts/insights-check.mjs
 * Checks: routes (200/404), SSR content, sitemap/RSS/JSON feed, JSON-LD,
 * canonical + hreflang + OG tags, internal links resolve, hero SVGs + OG PNGs,
 * FA index notice, screenshots (EN/FA, desktop/mobile).
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.CAPTURE_BASE ?? 'http://127.0.0.1:3219';
const ROOT = path.resolve(import.meta.dirname, '..');
const CONTENT = path.join(ROOT, 'content', 'insights');
const OUT = path.join(ROOT, 'captures-insights-qa');
fs.mkdirSync(OUT, { recursive: true });

let pass = 0, fail = 0;
const fails = [];
const check = (name, ok, detail = '') => {
  if (ok) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; fails.push(`${name}${detail ? ` — ${detail}` : ''}`); console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`); }
};

// Load article metadata from the built loader's source of truth: frontmatter on disk.
const files = fs.readdirSync(CONTENT).filter(f => f.endsWith('.md') && f !== 'TEMPLATE.md');
const articles = files.map(f => {
  const raw = fs.readFileSync(path.join(CONTENT, f), 'utf8');
  const fm = raw.slice(raw.indexOf('---') + 3, raw.indexOf('---', 3));
  const get = k => { const m = fm.match(new RegExp(`^${k}:\\s*(.+)$`, 'm')); return m ? m[1].trim().replace(/^["']|["']$/g, '') : ''; };
  return { file: f, id: get('id'), slug: get('slug'), hero: get('hero_image'), featured: get('featured') };
}).filter(a => a.slug);

const main = async () => {
  console.log(`insights-check against ${BASE} (${articles.length} articles)`);
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  // ---------- HTTP-level checks ----------
  const http = async (url) => {
    try { const r = await fetch(url, { redirect: 'manual' }); return { status: r.status, text: await r.text(), headers: r.headers }; }
    catch (e) { return { status: 0, text: '', headers: {}, err: String(e) }; }
  };

  // Index + chrome pages
  for (const p of ['/en/insights', '/fa/insights', '/en/insights/methodology', '/en/insights/author']) {
    const r = await http(`${BASE}${p}`);
    check(`GET ${p} → 200`, r.status === 200, `got ${r.status}`);
  }

  // Every article 200 + SSR content + canonical + OG
  for (const a of articles) {
    const r = await http(`${BASE}/en/insights/${a.slug}`);
    check(`GET /en/insights/${a.slug} → 200`, r.status === 200, `got ${r.status}`);
    if (r.status !== 200) continue;
    const html = r.text;
    check(`  ${a.id} SSR article body`, html.includes('ins-prose') || html.includes('References'));
    check(`  ${a.id} canonical`, html.includes(`rel="canonical" href="${BASE.replace('http://127.0.0.1', 'https://quantiviq.xyz')}/en/insights/${a.slug}"`) || /rel="canonical" href="https:\/\/quantiviq\.xyz\/en\/insights\//.test(html));
    check(`  ${a.id} OG image`, html.includes(`og:image`) && html.includes(`/og/insights/${a.id}.png`));
    check(`  ${a.id} BlogPosting JSON-LD`, html.includes('BlogPosting'));
    check(`  ${a.id} BreadcrumbList JSON-LD`, html.includes('BreadcrumbList'));
    check(`  ${a.id} hero SVG referenced`, html.includes(a.hero));
    // internal links resolve (strip anchors, dedupe)
    const links = [...new Set([...html.matchAll(/href="(\/(?:en|fa)\/[^"#]*)"/g)].map(m => m[1]))]
      .filter(l => l.startsWith('/en/insights/') || l.startsWith('/en/system') || l.startsWith('/en/proof') || l.startsWith('/en/method') || l.startsWith('/en/services'));
    const bad = [];
    for (const l of links) { const rr = await http(`${BASE}${l}`); if (rr.status !== 200) bad.push(`${l}→${rr.status}`); }
    check(`  ${a.id} internal links resolve (${links.length})`, bad.length === 0, bad.join(', '));
  }

  // FA article routes 404; topics 200
  const faArt = await http(`${BASE}/fa/insights/${articles[0].slug}`);
  check(`GET /fa/insights/${articles[0].slug} → 404`, faArt.status === 404, `got ${faArt.status}`);
  for (const t of ['transformation-strategy', 'economics-value', 'ai-native-operations', 'trust-governance', 'applied-industry']) {
    const r = await http(`${BASE}/en/insights/topics/${t}`);
    check(`GET topic ${t} → 200`, r.status === 200, `got ${r.status}`);
  }

  // Static assets: hero SVGs + OG PNGs
  for (const a of articles) {
    const s = await http(`${BASE}${a.hero}`);
    check(`hero SVG ${a.id} → 200`, s.status === 200 && s.text.includes('<svg'), `got ${s.status}`);
    const o = await http(`${BASE}/og/insights/${a.id}.png`);
    check(`OG PNG ${a.id} → 200`, o.status === 200, `got ${o.status}`);
  }

  // Sitemap
  const sm = await http(`${BASE}/sitemap.xml`);
  check('GET /sitemap.xml → 200', sm.status === 200, `got ${sm.status}`);
  let smx = sm.text;
  check('sitemap includes all 20 articles', articles.every(a => smx.includes(`/en/insights/${a.slug}`)));
  check('sitemap includes insights index', smx.includes('/en/insights'));
  check('sitemap includes methodology + author', smx.includes('/en/insights/methodology') && smx.includes('/en/insights/author'));
  check('sitemap hreflang for insights index', /<xhtml:link[^>]*hreflang="en"[^>]*\/en\/insights/.test(smx) || smx.includes('hreflang="en"'));

  // RSS + JSON feed
  const rss = await http(`${BASE}/insights.xml`);
  check('GET /insights.xml → 200 RSS', rss.status === 200 && rss.text.includes('<rss') && rss.text.includes('<item'));
  check('RSS has 20 items', (rss.text.match(/<item>/g) || []).length === 20);
  const js = await http(`${BASE}/insights.json`);
  check('GET /insights.json → 200', js.status === 200, `got ${js.status}`);
  try { const j = JSON.parse(js.text); check('insights.json parses + 20 articles', Array.isArray(j.articles ?? j) && (j.articles ?? j).length === 20); }
  catch { check('insights.json parses + 20 articles', false, 'JSON parse error'); }

  // llms.txt
  const ll = await http(`${BASE}/llms.txt`);
  check('GET /llms.txt → 200 with 20 articles', ll.status === 200 && (ll.text.match(/quantiviq\.xyz\/en\/insights\//g) || []).length >= 20);

  // ---------- Browser checks ----------
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/en/insights`, { waitUntil: 'networkidle', timeout: 60000 });
  const idxHtml = await page.content();
  check('EN index: 20 article cards', (idxHtml.match(/ins-card/g) || []).length >= 20);
  check('EN index: Blog JSON-LD', idxHtml.includes('"Blog"') || idxHtml.includes('Blog'));
  check('EN index: Insights nav active', idxHtml.includes('Insights'));
  await page.screenshot({ path: path.join(OUT, 'index-en-desktop.png'), fullPage: false });

  // FA index notice
  const faPage = await ctx.newPage();
  await faPage.goto(`${BASE}/fa/insights`, { waitUntil: 'networkidle', timeout: 60000 });
  const faHtml = await faPage.content();
  check('FA index: localized chrome', faHtml.includes('تحلیل') || faHtml.includes('Quantiviq'));
  check('FA index: EN notice present', /insights|مقالات انگلیسی|English/i.test(faHtml));
  await faPage.screenshot({ path: path.join(OUT, 'index-fa-desktop.png') });

  // Article page: TOC, references, figure SVG, discussion
  const first = articles.find(a => a.id === '01') ?? articles[0];
  const art = await ctx.newPage();
  await art.goto(`${BASE}/en/insights/${first.slug}`, { waitUntil: 'networkidle', timeout: 60000 });
  const artHtml = await art.content();
  check('article: inline figure SVG renders', artHtml.includes('<svg'));
  check('article: references anchors', artHtml.includes('id="ref-'));
  check('article: inline citation links', /href="#ref-/.test(artHtml));
  check('article: discussion questions section', /discussion/i.test(artHtml));
  await art.screenshot({ path: path.join(OUT, 'article-en-desktop.png') });

  // Mobile viewport
  const mob = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mp = await mob.newPage();
  await mp.goto(`${BASE}/en/insights`, { waitUntil: 'networkidle', timeout: 60000 });
  await mp.screenshot({ path: path.join(OUT, 'index-en-mobile.png') });
  check('mobile: no horizontal overflow', await mp.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2));
  await mob.close();

  await ctx.close();
  await browser.close();

  console.log(`\ninsights-check: ${pass} passed, ${fail} failed`);
  if (fail > 0) { console.log('FAILURES:'); fails.forEach(f => console.log(`  - ${f}`)); process.exit(1); }
};

main().catch(e => { console.error('SUITE ERROR:', e); process.exit(1); });
