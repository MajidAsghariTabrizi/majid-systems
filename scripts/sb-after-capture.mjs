/**
 * Silver-bullet AFTER capture — new pages at 4 widths (320/390/768/1440), EN+FA,
 * with console-error, broken-image, overflow and a11y-structure probes, plus
 * functional probes: book filter, flow expand, stack tab, explore gate choice.
 */
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const BASE = process.env.CAPTURE_BASE ?? 'http://127.0.0.1:3219';
const OUT = path.resolve('captures-sb', 'after');
fs.mkdirSync(OUT, { recursive: true });

const WIDTHS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '768', width: 768, height: 1024 },
  { name: '390', width: 390, height: 844 },
  { name: '320', width: 320, height: 690 },
];

const PAGES = [
  { route: '/en/explore', id: 'explore-en' },
  { route: '/fa/explore', id: 'explore-fa' },
  { route: '/en/insights/books', id: 'books-en' },
  { route: '/fa/insights/books', id: 'books-fa' },
  { route: '/en/insights/books/rewired', id: 'book-rewired-en' },
  { route: '/fa/insights/books/rewired', id: 'book-rewired-fa' },
  { route: '/en/insights/books/competing-in-the-age-of-ai', id: 'book-competing-en' },
  { route: '/en/insights/enterprise-ai-stack', id: 'stack-en' },
  { route: '/fa/insights/enterprise-ai-stack', id: 'stack-fa' },
  { route: '/en/mind/flows', id: 'flows-en' },
  { route: '/fa/mind/flows', id: 'flows-fa' },
  { route: '/en/mind', id: 'mind-en' },
  { route: '/en', id: 'home-en' },
  { route: '/fa', id: 'home-fa' },
];

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const report = { pages: [], functional: {} };

for (const p of PAGES) {
  const entry = { id: p.id, route: p.route, consoleErrors: [], failedRequests: [], brokenImages: [], overflow: {}, status: null };
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const pg = await ctx.newPage();
  pg.on('console', (m) => { if (m.type() === 'error') entry.consoleErrors.push(m.text().slice(0, 200)); });
  pg.on('requestfailed', (r) => entry.failedRequests.push(r.url().slice(0, 140)));
  const resp = await pg.goto(BASE + p.route, { waitUntil: 'networkidle', timeout: 60000 }).catch((e) => null);
  entry.status = resp ? resp.status() : 'ERR';
  await pg.waitForTimeout(700);
  entry.brokenImages = await pg.evaluate(() =>
    [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && !i.src.includes('covers.openlibrary.org'))
      .map((i) => i.src.slice(0, 120)));
  entry.coverImages = await pg.evaluate(() =>
    [...document.images].filter((i) => i.src.includes('covers.openlibrary.org')).map((i) => ({ src: i.src.slice(-40), ok: i.complete && i.naturalWidth > 0 })));
  entry.h1 = (await pg.locator('h1').first().textContent().catch(() => ''))?.trim().slice(0, 90) ?? '';
  for (const w of WIDTHS) {
    await pg.setViewportSize({ width: w.width, height: w.height });
    await pg.waitForTimeout(280);
    entry.overflow[w.name] = await pg.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    await pg.screenshot({ path: path.join(OUT, `${p.id}-${w.name}.png`), fullPage: w.name === '1440' });
  }
  // lang/dir sanity for FA
  if (p.route.startsWith('/fa')) entry.dir = await pg.evaluate(() => document.documentElement.dir);
  report.pages.push(entry);
  await ctx.close();
}

/* ---- functional probes ---- */
{
  // 1. books filter
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const pg = await ctx.newPage();
  await pg.goto(BASE + '/en/insights/books', { waitUntil: 'networkidle' });
  const before = await pg.locator('.book-card').count();
  await pg.locator('.chip-btn', { hasText: 'Engineering' }).first().click();
  await pg.waitForTimeout(300);
  const after = await pg.locator('.book-card').count();
  report.functional.booksFilter = { before, afterEngineering: after };
  await ctx.close();
}
{
  // 2. stack tabs
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const pg = await ctx.newPage();
  await pg.goto(BASE + '/en/insights/enterprise-ai-stack', { waitUntil: 'networkidle' });
  const firstPanel = await pg.locator('.stack-panel h2').first().textContent();
  await pg.locator('.stack-node').nth(4).click();
  await pg.waitForTimeout(250);
  const secondPanel = await pg.locator('.stack-panel h2').first().textContent();
  report.functional.stackTabs = { first: firstPanel?.trim(), afterClick5: secondPanel?.trim() };
  await ctx.close();
}
{
  // 3. flow expand + list mode
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const pg = await ctx.newPage();
  await pg.goto(BASE + '/en/mind/flows', { waitUntil: 'networkidle' });
  await pg.locator('.flow-card-head').nth(3).click();
  await pg.waitForTimeout(250);
  const openCount = await pg.locator('.flow-card.open').count();
  await pg.locator('.chip-btn', { hasText: 'Accessible list mode' }).click();
  await pg.waitForTimeout(250);
  const listItems = await pg.locator('.flow-list-mode > li').count();
  report.functional.flows = { openAfterClick: openCount, listModeItems: listItems };
  await ctx.close();
}
{
  // 4. explore gate choice changes outcome + role/signal chips
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const pg = await ctx.newPage();
  await pg.goto(BASE + '/en/explore', { waitUntil: 'networkidle' });
  await pg.locator('.role-chip', { hasText: 'CTO' }).click();
  await pg.locator('.role-chip', { hasText: 'PRODUCTION INCIDENT' }).click();
  const approveText = (await pg.locator('.gate-outcome').textContent())?.trim().slice(0, 80);
  await pg.locator('.gate-choices .chip-btn', { hasText: 'Reject' }).click();
  const rejectText = (await pg.locator('.gate-outcome').textContent())?.trim().slice(0, 80);
  const logText = (await pg.locator('.gate-log').textContent())?.trim().slice(0, 80);
  report.functional.exploreGate = { approveText, rejectText, changed: approveText !== rejectText, logShown: !!logText };
  // transcript opens
  await pg.locator('.explore-transcript summary').click();
  await pg.waitForTimeout(200);
  report.functional.transcriptVisible = await pg.locator('.transcript-list').first().isVisible();
  // source drawer
  await pg.locator('.src-drawer-head').first().click();
  await pg.waitForTimeout(200);
  report.functional.sourceDrawerVisible = await pg.locator('.src-drawer-body').first().isVisible();
  await pg.screenshot({ path: path.join(OUT, 'explore-en-interactions-1440.png') });
  await ctx.close();
}
{
  // 5. mind scope chips render on /en/mind
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const pg = await ctx.newPage();
  await pg.goto(BASE + '/en/mind', { waitUntil: 'networkidle' });
  report.functional.mindScopeChips = await pg.locator('.mind-scope-chip').count();
  await ctx.close();
}
{
  // 6. book deep-link prefill /en/mind?q=...
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const pg = await ctx.newPage();
  await pg.goto(BASE + '/en/mind?q=Which%20claims%20on%20this%20site%20are%20hypotheses%3F', { waitUntil: 'networkidle' });
  report.functional.mindPrefill = (await pg.locator('#mind-page-input').inputValue()).slice(0, 60);
  await ctx.close();
}

await browser.close();
fs.writeFileSync(path.resolve('captures-sb', 'after-report.json'), JSON.stringify(report, null, 2));
const bad = report.pages.filter((p) => p.consoleErrors.length || p.failedRequests.length || p.brokenImages.length || Object.values(p.overflow).some((v) => v > 2));
console.log('pages captured:', report.pages.length, '| problem pages:', bad.length);
for (const p of report.pages) {
  console.log(`${p.id.padEnd(22)} status=${p.status} dir=${p.dir ?? '-'} ov=${JSON.stringify(p.overflow)} errs=${p.consoleErrors.length} brokenImgs=${p.brokenImages.length} covers=${(p.coverImages ?? []).filter((c) => c.ok).length}/${(p.coverImages ?? []).length}`);
}
console.log('functional:', JSON.stringify(report.functional, null, 1));
if (bad.length) console.log('PROBLEM PAGES:', bad.map((p) => p.id).join(', '));
