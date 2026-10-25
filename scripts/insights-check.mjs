#!/usr/bin/env node
/**
 * insights-check.mjs — BILINGUAL QA suite for the Quantiviq Insights publication.
 * Usage: CAPTURE_BASE=http://127.0.0.1:3219 node scripts/insights-check.mjs
 * EN regression: routes 200, SSR, canonical, OG, JSON-LD, sitemap, feeds, links.
 * FA edition: 20 article routes 200, lang="fa" dir="rtl", Persian H1, reciprocal
 * hreflang, FA canonical + OG, FA feeds, topics, notice-free index, RTL mobile
 * overflow checks at 360/390/768/1440, screenshots.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.CAPTURE_BASE ?? 'http://127.0.0.1:3219';
const CANON = 'https://quantiviq.xyz';
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

// Article metadata from frontmatter on disk (EN + FA).
const loadArticles = (dir) => fs.readdirSync(dir).filter((f) => f.endsWith('.md') && f !== 'TEMPLATE.md').map((f) => {
  const raw = fs.readFileSync(path.join(dir, f), 'utf8');
  const fm = raw.slice(raw.indexOf('---') + 3, raw.indexOf('---', 3));
  const get = (k) => { const m = fm.match(new RegExp(`^${k}:\\s*(.+)$`, 'm')); return m ? m[1].trim().replace(/^["']|["']$/g, '') : ''; };
  return { file: f, id: get('id'), slug: get('slug'), hero: get('hero_image') };
}).filter((a) => a.slug);
const articles = loadArticles(CONTENT);
const faArticles = loadArticles(path.join(CONTENT, 'fa'));
const PILLARS = ['transformation-strategy', 'economics-value', 'ai-native-operations', 'trust-governance', 'applied-industry'];

const main = async () => {
  console.log(`insights-check against ${BASE} (EN ${articles.length}, FA ${faArticles.length})`);
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  const http = async (url) => {
    try { const r = await fetch(url, { redirect: 'manual' }); return { status: r.status, text: await r.text(), headers: r.headers }; }
    catch (e) { return { status: 0, text: '', headers: {}, err: String(e) }; }
  };

  /* ================= EN regression ================= */
  for (const p of ['/en/insights', '/en/insights/methodology', '/en/insights/author']) {
    const r = await http(`${BASE}${p}`);
    check(`EN GET ${p} → 200`, r.status === 200, `got ${r.status}`);
  }
  for (const a of articles) {
    const r = await http(`${BASE}/en/insights/${a.slug}`);
    check(`EN ${a.id} GET /en/insights/${a.slug} → 200`, r.status === 200, `got ${r.status}`);
    if (r.status !== 200) continue;
    const html = r.text;
    check(`EN ${a.id} canonical`, new RegExp(`rel="canonical" href="${CANON}/en/insights/${a.slug}"`).test(html) || /rel="canonical" href="https:\/\/quantiviq\.xyz\/en\/insights\//.test(html));
    check(`EN ${a.id} OG image`, html.includes('og:image') && html.includes(`/og/insights/${a.id}.png`));
    check(`EN ${a.id} BlogPosting JSON-LD`, html.includes('BlogPosting'));
    check(`EN ${a.id} BreadcrumbList JSON-LD`, html.includes('BreadcrumbList'));
    check(`EN ${a.id} hero SVG referenced`, html.includes(a.hero));
    check(`EN ${a.id} reciprocal hreflang → fa`, new RegExp(`hreflang="fa"[^>]*href="${CANON}/fa/insights/${a.slug}"`).test(html) || new RegExp(`href="${CANON}/fa/insights/${a.slug}"[^>]*hreflang="fa"`).test(html));
    const links = [...new Set([...html.matchAll(/href="(\/(?:en|fa)\/[^"#]*)"/g)].map((m) => m[1]))]
      .filter((l) => /^\/en\//.test(l));
    const bad = [];
    for (const l of links) { const rr = await http(`${BASE}${l}`); if (rr.status !== 200) bad.push(`${l}→${rr.status}`); }
    check(`EN ${a.id} internal links resolve (${links.length})`, bad.length === 0, bad.join(', '));
  }
  for (const t of PILLARS) {
    const r = await http(`${BASE}/en/insights/topics/${t}`);
    check(`EN topic ${t} → 200`, r.status === 200, `got ${r.status}`);
  }
  for (const a of articles) {
    const s = await http(`${BASE}${a.hero}`);
    check(`EN hero SVG ${a.id} → 200`, s.status === 200 && s.text.includes('<svg'), `got ${s.status}`);
    const o = await http(`${BASE}/og/insights/${a.id}.png`);
    check(`EN OG PNG ${a.id} → 200`, o.status === 200, `got ${o.status}`);
  }
  const rss = await http(`${BASE}/insights.xml`);
  check('EN RSS /insights.xml → 200 with 20 items', rss.status === 200 && (rss.text.match(/<item>/g) || []).length === 20, `got ${rss.status}, ${(rss.text.match(/<item>/g) || []).length} items`);
  const js = await http(`${BASE}/insights.json`);
  check('EN /insights.json → 200', js.status === 200, `got ${js.status}`);

  /* ================= Sitemap (bilingual) ================= */
  const sm = await http(`${BASE}/sitemap.xml`);
  check('GET /sitemap.xml → 200', sm.status === 200, `got ${sm.status}`);
  const smx = sm.text;
  check('sitemap: all 20 EN articles', articles.every((a) => smx.includes(`/en/insights/${a.slug}`)));
  check('sitemap: all 20 FA articles', faArticles.every((a) => smx.includes(`/fa/insights/${a.slug}`)));
  check('sitemap: 40 article URLs total', (smx.match(/\/insights\/[^<]*/g) || []).length >= 40);
  check('sitemap: FA hreflang reciprocity', articles.every((a) => new RegExp(`hreflang="fa"[^>]*href="${CANON}/fa/insights/${a.slug}"`).test(smx)));

  /* ================= llms.txt (bilingual) ================= */
  const ll = await http(`${BASE}/llms.txt`);
  check('llms.txt: 20 EN + 20 FA article URLs', ll.status === 200 && (ll.text.match(/quantiviq\.xyz\/en\/insights\//g) || []).length >= 20 && (ll.text.match(/quantiviq\.xyz\/fa\/insights\//g) || []).length >= 20, `EN ${(ll.text.match(/quantiviq\.xyz\/en\/insights\//g) || []).length}, FA ${(ll.text.match(/quantiviq\.xyz\/fa\/insights\//g) || []).length}`);

  /* ================= FA edition ================= */
  const faIdx = await http(`${BASE}/fa/insights`);
  check('FA GET /fa/insights → 200', faIdx.status === 200, `got ${faIdx.status}`);
  check('FA index: no English-fallback notice', !/این صفحه‌ها به انگلیسی‌اند|English edition|فارسی در راه است/.test(faIdx.text));
  for (const p of ['/fa/insights/methodology', '/fa/insights/author']) {
    const r = await http(`${BASE}${p}`);
    check(`FA GET ${p} → 200`, r.status === 200, `got ${r.status}`);
  }
  for (const a of faArticles) {
    const r = await http(`${BASE}/fa/insights/${a.slug}`);
    check(`FA ${a.id} GET /fa/insights/${a.slug} → 200`, r.status === 200, `got ${r.status}`);
    if (r.status !== 200) continue;
    const html = r.text;
    check(`FA ${a.id} lang=fa dir=rtl`, html.includes('lang="fa"') && html.includes('dir="rtl"'));
    check(`FA ${a.id} canonical (self, FA)`, new RegExp(`rel="canonical" href="${CANON}/fa/insights/${a.slug}"`).test(html));
    check(`FA ${a.id} FA OG image`, html.includes('og:image') && html.includes(`/og/insights/fa/${a.id}.png`));
    check(`FA ${a.id} reciprocal hreflang → en`, new RegExp(`hreflang="en"[^>]*href="${CANON}/en/insights/${a.slug}"`).test(html) || new RegExp(`href="${CANON}/en/insights/${a.slug}"[^>]*hreflang="en"`).test(html));
    check(`FA ${a.id} FA hero SVG referenced`, html.includes(`/insights/heroes/fa/${a.id}.svg`));
    check(`FA ${a.id} references anchors`, html.includes('id="ref-'));
    check(`FA ${a.id} inline citation links`, /href="#ref-/.test(html));
    const links = [...new Set([...html.matchAll(/href="(\/(?:en|fa)\/[^"#]*)"/g)].map((m) => m[1]))]
      .filter((l) => /^\/fa\//.test(l));
    const bad = [];
    for (const l of links) { const rr = await http(`${BASE}${l}`); if (rr.status !== 200) bad.push(`${l}→${rr.status}`); }
    check(`FA ${a.id} internal /fa/ links resolve (${links.length})`, bad.length === 0, bad.join(', '));
  }
  for (const t of PILLARS) {
    const r = await http(`${BASE}/fa/insights/topics/${t}`);
    check(`FA topic ${t} → 200`, r.status === 200, `got ${r.status}`);
  }
  for (const a of faArticles) {
    const s = await http(`${BASE}/insights/heroes/fa/${a.id}.svg`);
    check(`FA hero SVG ${a.id} → 200`, s.status === 200 && s.text.includes('<svg'), `got ${s.status}`);
    const o = await http(`${BASE}/og/insights/fa/${a.id}.png`);
    check(`FA OG PNG ${a.id} → 200`, o.status === 200, `got ${o.status}`);
  }
  const faRss = await http(`${BASE}/fa/insights.xml`);
  check('FA RSS /fa/insights.xml → 200 with 20 items', faRss.status === 200 && (faRss.text.match(/<item>/g) || []).length === 20, `got ${faRss.status}, ${(faRss.text.match(/<item>/g) || []).length} items`);
  const faJs = await http(`${BASE}/fa/insights.json`);
  check('FA /fa/insights.json → 200', faJs.status === 200, `got ${faJs.status}`);
  if (faJs.status === 200) {
    try { const j = JSON.parse(faJs.text); check('FA insights.json parses + 20 articles', Array.isArray(j.articles ?? j) && (j.articles ?? j).length === 20); }
    catch { check('FA insights.json parses + 20 articles', false, 'JSON parse error'); }
  }

  /* ================= Browser checks ================= */
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/en/insights`, { waitUntil: 'networkidle', timeout: 60000 });
  const idxHtml = await page.content();
  check('EN index: 20 article cards', (idxHtml.match(/ins-card/g) || []).length >= 20);
  await page.screenshot({ path: path.join(OUT, 'index-en-desktop.png'), fullPage: false });

  // FA index in a real browser: RTL, Persian H1, 20 cards, no notice
  const faPage = await ctx.newPage();
  await faPage.goto(`${BASE}/fa/insights`, { waitUntil: 'networkidle', timeout: 60000 });
  const faDom = await faPage.evaluate(() => ({
    lang: document.documentElement.lang,
    dir: document.documentElement.dir,
    h1: document.querySelector('h1')?.textContent ?? '',
    cards: document.querySelectorAll('.ins-card').length,
    notice: document.body.textContent.includes('فارسی در راه') || document.body.textContent.includes('English edition'),
  }));
  check('FA index: documentElement lang=fa', faDom.lang === 'fa', `got '${faDom.lang}'`);
  check('FA index: documentElement dir=rtl', faDom.dir === 'rtl', `got '${faDom.dir}'`);
  check('FA index: Persian H1', /[\u0600-\u06FF]/.test(faDom.h1), `h1='${faDom.h1.slice(0, 40)}'`);
  check('FA index: 20 article cards', faDom.cards >= 20, `got ${faDom.cards}`);
  check('FA index: no fallback notice', !faDom.notice);
  await faPage.screenshot({ path: path.join(OUT, 'index-fa-desktop.png'), fullPage: true });

  // FA article in browser: RTL + Persian H1 + TOC + figure
  const faFirst = faArticles.find((a) => a.id === '01') ?? faArticles[0];
  const faArt = await ctx.newPage();
  await faArt.goto(`${BASE}/fa/insights/${faFirst.slug}`, { waitUntil: 'networkidle', timeout: 60000 });
  const artDom = await faArt.evaluate(() => ({
    lang: document.documentElement.lang,
    dir: document.documentElement.dir,
    h1: document.querySelector('h1')?.textContent ?? '',
    svg: !!document.querySelector('figure svg'),
    toc: !!document.querySelector('nav') || document.body.textContent.includes('فهرست'),
  }));
  check('FA article: lang=fa', artDom.lang === 'fa', `got '${artDom.lang}'`);
  check('FA article: dir=rtl', artDom.dir === 'rtl', `got '${artDom.dir}'`);
  check('FA article: Persian H1', /[\u0600-\u06FF]/.test(artDom.h1), `h1='${artDom.h1.slice(0, 40)}'`);
  check('FA article: inline figure SVG renders', artDom.svg);
  check('FA article: TOC present', artDom.toc);
  await faArt.screenshot({ path: path.join(OUT, 'article-fa-desktop.png'), fullPage: true });

  // EN article browser checks (regression)
  const first = articles.find((a) => a.id === '01') ?? articles[0];
  const art = await ctx.newPage();
  await art.goto(`${BASE}/en/insights/${first.slug}`, { waitUntil: 'networkidle', timeout: 60000 });
  const artHtml = await art.content();
  check('EN article: inline figure SVG renders', artHtml.includes('<svg'));
  check('EN article: discussion questions section', /discussion/i.test(artHtml));
  await art.screenshot({ path: path.join(OUT, 'article-en-desktop.png') });

  // Responsive: no horizontal overflow on FA index + FA article at 360/390/768/1440
  for (const width of [360, 390, 768, 1440]) {
    const rc = await browser.newContext({ viewport: { width, height: 844 } });
    const rp = await rc.newPage();
    await rp.goto(`${BASE}/fa/insights`, { waitUntil: 'networkidle', timeout: 60000 });
    const of1 = await rp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check(`FA index @${width}w: no horizontal overflow`, of1 <= 2, `overflow ${of1}px`);
    if (width === 360 || width === 1440) await rp.screenshot({ path: path.join(OUT, `index-fa-${width}.png`) });
    await rp.goto(`${BASE}/fa/insights/${faFirst.slug}`, { waitUntil: 'networkidle', timeout: 60000 });
    const of2 = await rp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check(`FA article @${width}w: no horizontal overflow`, of2 <= 2, `overflow ${of2}px`);
    if (width === 360 || width === 1440) await rp.screenshot({ path: path.join(OUT, `article-fa-${width}.png`) });
    await rc.close();
  }

  // EN mobile regression
  const mob = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mp = await mob.newPage();
  await mp.goto(`${BASE}/en/insights`, { waitUntil: 'networkidle', timeout: 60000 });
  await mp.screenshot({ path: path.join(OUT, 'index-en-mobile.png') });
  check('EN mobile: no horizontal overflow', await mp.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2));
  await mob.close();

  await ctx.close();
  await browser.close();

  console.log(`\ninsights-check: ${pass} passed, ${fail} failed`);
  if (fail > 0) { console.log('FAILURES:'); fails.forEach((f) => console.log(`  - ${f}`)); process.exit(1); }
};

main().catch((e) => { console.error('SUITE ERROR:', e); process.exit(1); });
