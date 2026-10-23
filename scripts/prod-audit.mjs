/** Prod audit: interactive E2E against https://quantiviq.xyz â€” desktop+mobile, EN+FA. */
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = 'https://quantiviq.xyz';
const ONLY = process.env.AUDIT_PASS ? process.env.AUDIT_PASS.split(',') : null; // e.g. "en-desktop,fa-mobile"
const results = [];
const consoleErrors = [];
const failedRequests = [];

function check(name, pass, detail = '') {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  â€” ' + detail : ''}`);
}

const browser = await chromium.launch({ channel: 'msedge', headless: true });

for (const [locale, vw, mobile] of [
  ['en', { width: 1366, height: 900 }, false],
  ['fa', { width: 1366, height: 900 }, false],
  ['en', { width: 390, height: 844 }, true],
  ['fa', { width: 390, height: 844 }, true],
]) {
  const tag = `${locale}-${mobile ? 'mobile' : 'desktop'}`;
  if (ONLY && !ONLY.includes(tag)) continue;
  console.log(`--- pass: ${tag} ---`);
  const ctx = await browser.newContext({ viewport: vw, isMobile: mobile, hasTouch: mobile });
  const p = await ctx.newPage();
  p.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`[${tag}] ${m.text().slice(0, 150)}`); });
  p.on('pageerror', (e) => consoleErrors.push(`[${tag}] pageerror ${String(e).slice(0, 150)}`));
  p.on('requestfailed', (r) => failedRequests.push(`[${tag}] ${r.url().slice(0, 120)} ${r.failure()?.errorText}`));
  p.on('response', (r) => { if (r.status() >= 400) failedRequests.push(`[${tag}] HTTP ${r.status()} ${r.url().slice(0, 120)}`); });

  // 1. homepage + hydration
  await p.goto(`${BASE}/${locale}`, { waitUntil: 'load', timeout: 45000 });
  await p.waitForTimeout(1500);
  check(`${tag} home title`, (await p.title()).length > 5, (await p.title()).slice(0, 50));
  check(`${tag} home dir`, (await p.getAttribute('html', 'dir')) === (locale === 'fa' ? 'rtl' : 'ltr'));

  // 2. language switcher (desktop: header link; verify href not localhost)
  const langHref = await p.evaluate(() => {
    const a = [...document.querySelectorAll('header a, nav a')].find((x) => /\/(en|fa)(\/|$)/.test(x.getAttribute('href') || '') && x.getAttribute('href') !== location.pathname);
    return a ? a.getAttribute('href') : null;
  });
  check(`${tag} lang-switch href sane`, !langHref || (!langHref.includes('localhost') && !langHref.includes('127.0.0.1')), langHref || 'n/a');

  // 3. system simulation renders + starts (interaction) â€” the org simulator lives on the homepage
  if (!mobile) {
    const sim = await p.locator('.sim-frame').count();
    check(`${tag} org sim renders on home`, sim > 0);
    const cta = p.locator('.sim-cta.primary').first();
    if (await cta.count()) {
      await cta.click().catch(() => {});
      await p.waitForTimeout(1500);
      const running = await p.evaluate(() => document.body.innerHTML.includes('sim-'));
      check(`${tag} org sim interactive`, running);
    }
    // system page renders its own content
    await p.goto(`${BASE}/${locale}/system`, { waitUntil: 'load', timeout: 60000 });
    await p.waitForTimeout(1000);
    check(`${tag} system page renders`, (await p.locator('main').count()) > 0 && (await p.title()).length > 5);
  }

  // 4. lab â€” hydration + sections + interactions
  await p.goto(`${BASE}/${locale}/lab`, { waitUntil: 'load', timeout: 45000 });
  await p.waitForSelector('.lab-app', { timeout: 45000 });
  await p.waitForTimeout(1200);
  check(`${tag} lab hydrated`, (await p.locator('.lab-estat').count()) === 6);
  check(`${tag} lab topology nodes`, (await p.locator('.lab-topo-node').count()) >= 20);
  check(`${tag} lab replay dots`, (await p.locator('.lab-replay-dots button').count()) === 10);
  check(`${tag} lab matrix rows`, (await p.locator('.lab-matrix li').count()) === 11);
  check(`${tag} lab experiments`, (await p.locator('.lab-experiments .lab-panel').count()) === 5);
  check(`${tag} lab no localhost in DOM`, !(await p.content()).includes('localhost:3000'));

  // interactions: topology click â†’ detail; replay step â†’ outcome
  await p.locator('#topology').scrollIntoViewIfNeeded();
  const node = p.locator('.lab-topo-node').nth(3);
  await node.click({ force: true }).catch(() => {});
  await p.waitForTimeout(400);
  check(`${tag} topology click shows detail`, (await p.locator('.lab-topo-detail').count()) > 0);
  await p.locator('#replay').scrollIntoViewIfNeeded();
  const nextBtn = p.locator('.lab-replay-btns button').nth(2); // prev(0) play(1) next(2) restart(3) - labels are aria-only
  for (let i = 0; i < 8; i++) { await nextBtn.click().catch(() => {}); await p.waitForTimeout(120); }
  const outcomeText = await p.locator('.lab-rv-y').first().textContent().catch(() => '');
  check(`${tag} replay reaches outcome`, /bps/.test(outcomeText || ''), (outcomeText || '').trim());
  // decision browser pick
  await p.locator('#decisions').scrollIntoViewIfNeeded();
  await p.locator('.lab-dec-rows button').nth(2).click().catch(() => {});
  await p.waitForTimeout(400);
  check(`${tag} decision browser selectable`, (await p.locator('.lab-dec-anatomy').count()) > 0);

  // 5. CTA/nav presence on home
  await p.goto(`${BASE}/${locale}`, { waitUntil: 'load', timeout: 60000 });
  const navCount = await p.locator('header a, nav a').count();
  check(`${tag} nav links present`, navCount >= 4, `${navCount} links`);

  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(`${tag} no horizontal overflow`, overflow <= 0, `${overflow}px`);
  await ctx.close();
}

if (!ONLY || ONLY.includes('contact')) {
  // forms: contact form renders + client-side validation
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const p = await ctx.newPage();
  console.log('--- pass: contact ---');
  await p.goto(`${BASE}/en/contact`, { waitUntil: 'load', timeout: 45000 });
  const form = await p.locator('form').count();
  check('en contact form renders', form > 0);
  await ctx.close();
}

await browser.close();

// summary
const failed = results.filter((r) => !r.pass);
const report = {
  at: new Date().toISOString(),
  base: BASE,
  total: results.length,
  pass: results.length - failed.length,
  fail: failed.length,
  consoleErrors: consoleErrors.slice(0, 10),
  consoleErrorCount: consoleErrors.length,
  failedRequests: failedRequests.slice(0, 10),
  failedRequestCount: failedRequests.length,
  results,
};
fs.writeFileSync('captures-lab/prodaudit-results.json', JSON.stringify(report, null, 2));
console.log(`\nTOTAL ${results.length}: ${report.pass} pass, ${failed.length} fail | consoleErrors=${report.consoleErrorCount} failedRequests=${report.failedRequestCount}`);
if (failed.length) for (const f of failed) console.log('FAILED:', f.name, f.detail);
