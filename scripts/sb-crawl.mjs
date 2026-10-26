/**
 * Silver-bullet Gate A — live production crawl of quantiviq.xyz.
 * Captures: response codes, console errors, failed requests, broken images,
 * horizontal overflow, titles/h1, and full-page screenshots at 5 widths.
 * Output: captures-sb/before/*.png + crawl-report.json
 */
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const BASE = process.env.CRAWL_BASE ?? 'https://quantiviq.xyz';
const OUT = path.resolve('captures-sb', 'before');
const RPT = path.resolve('captures-sb', 'crawl-report.json');
fs.mkdirSync(OUT, { recursive: true });

const WIDTHS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '1024', width: 1024, height: 768 },
  { name: '768', width: 768, height: 1024 },
  { name: '390', width: 390, height: 844 },
  { name: '320', width: 320, height: 690 },
];

const FULL_WIDTH_ROUTES = ['/en', '/fa', '/en/insights', '/fa/insights', '/en/lab', '/fa/lab', '/en/mind', '/fa/mind'];
const FAST_ROUTES = [
  '/en/about', '/fa/about', '/en/leadership', '/fa/leadership', '/en/proof', '/fa/proof',
  '/en/system', '/fa/system', '/en/method', '/fa/method', '/en/services', '/fa/services',
  '/en/contact', '/fa/contact', '/en/privacy', '/fa/privacy',
  '/en/insights/ai-adoption-is-not-ai-transformation',
  '/fa/insights/ai-adoption-is-not-ai-transformation',
  '/en/insights/who-owns-ai-transformation',
  '/en/journey', '/en/notes', '/en/open-source', '/en/work', '/en/resume', '/en/engineering',
];

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const report = { base: BASE, startedAt: new Date().toISOString(), routes: {}, screenshots: [] };

async function crawl(route, widths) {
  const entry = { route, status: null, consoleErrors: [], failedRequests: [], brokenImages: [], title: '', h1: '', overflow: {}, shots: [] };
  const ctx = await browser.newContext({ viewport: { width: widths[0].width, height: widths[0].height } });
  const p = await ctx.newPage();
  p.on('console', (m) => { if (m.type() === 'error') entry.consoleErrors.push(m.text().slice(0, 300)); });
  p.on('requestfailed', (r) => { entry.failedRequests.push(r.url().slice(0, 160) + ' :: ' + (r.failure()?.errorText ?? '')); });
  p.on('response', (r) => { if (r.url().startsWith(BASE) && r.status() >= 400) entry.failedRequests.push(r.status() + ' ' + r.url().slice(0, 160)); });
  let resp;
  try {
    resp = await p.goto(BASE + route, { waitUntil: 'networkidle', timeout: 45000 });
  } catch (e) {
    entry.status = 'GOTO_ERROR:' + e.message.split('\n')[0].slice(0, 120);
    report.routes[route] = entry; await ctx.close(); return entry;
  }
  entry.status = resp.status();
  entry.title = await p.title();
  entry.h1 = (await p.locator('h1').first().textContent().catch(() => ''))?.trim().slice(0, 120) ?? '';
  entry.brokenImages = await p.evaluate(() =>
    [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src.slice(0, 160)));
  for (const w of widths) {
    await p.setViewportSize({ width: w.width, height: w.height });
    await p.waitForTimeout(350);
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    entry.overflow[w.name] = overflow;
    const file = route === '/en' ? `home-en-${w.name}.png` : route === '/fa' ? `home-fa-${w.name}.png` : `${route.replaceAll('/', '_').replace(/^_/, '')}-${w.name}.png`;
    await p.screenshot({ path: path.join(OUT, file), fullPage: w.name === '1440' || w.name === '390' });
    entry.shots.push(file);
    report.screenshots.push(file);
  }
  report.routes[route] = entry;
  await ctx.close();
  return entry;
}

for (const r of FULL_WIDTH_ROUTES) await crawl(r, WIDTHS);
for (const r of FAST_ROUTES) await crawl(r, [WIDTHS[0], WIDTHS[3]]);

// discover any in-app links we missed (same-host, locale routes)
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto(BASE + '/en', { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
const links = await p.evaluate(() => [...new Set([...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')))]).catch(() => []);
const missing = links
  .filter((h) => h && h.startsWith('/') && !h.startsWith('//') && !h.includes('.'))
  .filter((h) => !FULL_WIDTH_ROUTES.includes(h) && !FAST_ROUTES.includes(h) && !h.startsWith('/api'))
  .filter((h) => /^\/(en|fa)(\/|$)/.test(h));
report.discoveredExtraLinks = [...new Set(missing)].slice(0, 40);
await ctx.close();

// EN Insights image/wall collision probe (reported issue)
const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const p2 = await ctx2.newPage();
await p2.goto(BASE + '/en/insights', { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
report.insightsCollisionProbe = await p2.evaluate(() => {
  const out = [];
  for (const img of document.images) {
    const r = img.getBoundingClientRect();
    for (const img2 of document.images) {
      if (img2 === img) continue;
      const r2 = img2.getBoundingClientRect();
      const ox = Math.max(0, Math.min(r.right, r2.right) - Math.max(r.left, r2.left));
      const oy = Math.max(0, Math.min(r.bottom, r2.bottom) - Math.max(r.top, r2.top));
      if (ox > 24 && oy > 24) { out.push((img.src.split('/').pop() ?? '') + ' <-> ' + (img2.src.split('/').pop() ?? '') + ` (${Math.round(ox)}x${Math.round(oy)})`); break; }
    }
  }
  return [...new Set(out)].slice(0, 12);
}).catch((e) => 'probe-error:' + e.message.slice(0, 80));
await ctx2.close();

await browser.close();
report.finishedAt = new Date().toISOString();
const errs = Object.values(report.routes).flatMap((r) => (r.consoleErrors || []).map((e) => r.route + ' :: ' + e));
report.summary = {
  routesCrawled: Object.keys(report.routes).length,
  routesWithErrors: Object.values(report.routes).filter((r) => (r.consoleErrors?.length ?? 0) + (r.failedRequests?.length ?? 0) > 0).length,
  brokenImagesTotal: Object.values(report.routes).reduce((a, r) => a + (r.brokenImages?.length ?? 0), 0),
  overflowPositive: Object.entries(report.routes).flatMap(([rt, r]) => Object.entries(r.overflow ?? {}).filter(([, v]) => v > 2).map(([w, v]) => rt + '@' + w + ':' + v)),
  consoleErrors: errs.slice(0, 25),
};
fs.writeFileSync(RPT, JSON.stringify(report, null, 2));
console.log('CRAWL DONE. routes:', report.summary.routesCrawled, '| withErrors:', report.summary.routesWithErrors, '| brokenImgs:', report.summary.brokenImagesTotal);
console.log('overflow:', JSON.stringify(report.summary.overflowPositive));
console.log('consoleErrors:', JSON.stringify(report.summary.consoleErrors.slice(0, 10), null, 1));
console.log('insightsCollision:', JSON.stringify(report.insightsCollisionProbe));
console.log('extraLinks:', JSON.stringify(report.discoveredExtraLinks));
