/**
 * Final production verification against https://quantiviq.xyz.
 * Route sweep (new + legacy), sitemap content, covers, functional probes,
 * mind API through the public gateway (scope + real answer), lab check.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = 'https://quantiviq.xyz';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const report = { routes: [], functional: {}, mind: {} };

const ROUTES = [
  ['/', 200], ['/en', 200], ['/fa', 200],
  ['/en/explore', 200], ['/fa/explore', 200],
  ['/en/insights/books', 200], ['/fa/insights/books', 200],
  ['/en/insights/books/rewired', 200], ['/en/insights/books/competing-in-the-age-of-ai', 200],
  ['/fa/insights/books/ai-snake-oil', 200],
  ['/en/insights/enterprise-ai-stack', 200], ['/fa/insights/enterprise-ai-stack', 200],
  ['/en/mind/flows', 200], ['/fa/mind/flows', 200],
  ['/en/mind', 200], ['/fa/mind', 200],
  ['/en/insights', 200], ['/en/lab', 200], ['/en/about', 200], ['/en/contact', 200],
  ['/journey', 200], ['/notes/production-is-part-of-the-product', 200],
  ['/sitemap.xml', 200], ['/robots.txt', 200], ['/manifest.webmanifest', 200],
];
for (const [route, expect] of ROUTES) {
  let status = 'ERR', final = route;
  try {
    const r = await fetch(BASE + route, { redirect: 'follow', signal: AbortSignal.timeout(30000) });
    status = r.status;
  } catch (e) { status = 'ERR:' + String(e).slice(0, 40); }
  report.routes.push({ route, status, ok: status === expect });
  console.log(String(status).padEnd(4), route);
}

// page-level probes on the new routes
for (const rt of ['/en/explore', '/en/insights/books', '/en/insights/books/rewired', '/en/insights/enterprise-ai-stack', '/en/mind/flows', '/fa/mind/flows']) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 100)); });
  await pg.goto(BASE + rt, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  const covers = await pg.evaluate(() => [...document.images].filter((i) => i.src.includes('covers.openlibrary.org')).map((i) => i.complete && i.naturalWidth > 0));
  const cards = await pg.locator('.book-card').count().catch(() => 0);
  const flows = await pg.locator('.flow-card-head').count().catch(() => 0);
  const stackNodes = await pg.locator('.stack-node').count().catch(() => 0);
  const scopeChips = await pg.locator('.mind-scope-chip').count().catch(() => 0);
  const fallbacks = await pg.locator('.book-cover-fallback').count().catch(() => 0);
  report.functional[rt] = { consoleErrors: errs.length, coversOK: covers.filter(Boolean).length, coversTotal: covers.length, cards, flows, stackNodes, scopeChips, fallbacks };
  console.log(rt.padEnd(36), 'errs=' + errs.length, 'covers=' + covers.filter(Boolean).length + '/' + covers.length, 'cards=' + cards, 'flows=' + flows, 'stack=' + stackNodes, 'scopeChips=' + scopeChips, 'fallbacks=' + fallbacks);
  await ctx.close();
}

// hero CTA points to /explore
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const pg = await ctx.newPage();
  await pg.goto(BASE + '/en', { waitUntil: 'networkidle', timeout: 60000 });
  report.functional.heroCTA = await pg.locator('.hero-actions .btn-primary').first().getAttribute('href');
  console.log('hero CTA ->', report.functional.heroCTA);
  await ctx.close();
}
await browser.close();

// sitemap contains the 14 new URLs
const sm = await (await fetch(BASE + '/sitemap.xml')).text();
const need = ['/en/explore', '/fa/explore', '/en/insights/books', '/fa/insights/books', '/en/insights/books/rewired', '/en/insights/enterprise-ai-stack', '/fa/insights/enterprise-ai-stack', '/en/mind/flows', '/fa/mind/flows'];
report.sitemap = need.map((u) => ({ u, present: sm.includes(u) }));
console.log('sitemap new URLs present:', report.sitemap.every((x) => x.present), '(' + report.sitemap.filter((x) => x.present).length + '/' + need.length + ')');

// mind via PUBLIC gateway: scope filter + real answer
async function mind(q, scope) {
  const body = { session: 'prod-final-' + Math.random().toString(36).slice(2, 8), locale: 'en', messages: [{ role: 'user', content: q }] };
  if (scope) body.scope = scope;
  const r = await fetch(BASE + '/api/public-mind/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(90000) });
  const raw = await r.text();
  let answer = '', sources = [], done = false, usage = null;
  for (const line of raw.split('\n')) {
    if (!line.startsWith('data:')) continue;
    try {
      const ev = JSON.parse(line.slice(5).trim());
      if (ev.sources) sources = ev.sources;
      if (typeof ev.text === 'string') answer += ev.text;
      if (ev.usage) usage = ev.usage;
      if (ev.status === 'ok') done = true;
    } catch {}
  }
  return { status: r.status, sources, answer, done, usage };
}
const m1 = await mind('Which edition of the book Human + Machine is in the library?', 'books');
report.mind.scopeBooks = { status: m1.status, types: [...new Set(m1.sources.map((s) => s.type))], done: m1.done, len: m1.answer.length, urls: m1.sources.slice(0, 2).map((s) => s.url) };
console.log('MIND scope=books via gateway:', JSON.stringify(report.mind.scopeBooks));
const m2 = await mind('What is Quantiviq?');
report.mind.default = { status: m2.status, done: m2.done, len: m2.answer.length, sources: m2.sources.length, tokens: m2.usage?.total_tokens };
console.log('MIND default via gateway:', JSON.stringify(report.mind.default));
fs.writeFileSync('captures-sb/prod-final-report.json', JSON.stringify(report, null, 2));
const bad = report.routes.filter((r) => !r.ok);
console.log('\nROUTE SWEEP:', bad.length === 0 ? 'ALL ' + ROUTES.length + ' OK' : 'FAILURES: ' + bad.map((b) => b.route + '=' + b.status).join(', '));
