/**
 * V3 Language UX Matrix + lead pipeline E2E.
 * Covers: EN default, explicit /en /fa, tabs desktop+mobile, deep-route
 * retention, persistence, RTL correctness, metadata parity, contact form
 * localization, lead submit/persist/negative paths.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.CAPTURE_BASE ?? 'http://127.0.0.1:3219';
const OUT = path.resolve('captures-v3');
fs.mkdirSync(OUT, { recursive: true });
let failures = 0;
const errs = [];
const ok = (row, c, d = '') => { console.log(`${c ? 'PASS' : 'FAIL'} ${row}${d ? ` — ${d}` : ''}`); if (!c) failures++; };

const run = async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  /* ---------- R1: fresh visitor at / → EN, cookie honored ---------- */
  const c1 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p1 = await c1.newPage();
  p1.on('pageerror', (e) => errs.push(`[r1] ${e.message}`));
  const resp = await p1.goto(`${BASE}/`, { waitUntil: 'networkidle', maxRedirects: 10 });
  ok('R1 fresh / → /en EN selected', p1.url().includes('/en') && (await p1.locator('html').getAttribute('lang')) === 'en' && (await p1.locator('.lang-tab.is-on').innerText()).includes('English'), `→ ${p1.url()}`);
  ok('R1 no Accept-Language auto-FA', !(await p1.locator('html').getAttribute('lang'))?.includes('fa'));

  /* R2: direct /fa → Persian RTL, FA selected */
  await p1.goto(`${BASE}/fa`, { waitUntil: 'networkidle' });
  ok('R2 /fa → lang=fa dir=rtl FA tab on', (await p1.locator('html').getAttribute('dir')) === 'rtl' && (await p1.locator('.lang-tab.is-on').innerText()).includes('فارسی'));
  ok('R2 Persian hero', (await p1.locator('h1').innerText()).includes('شرکت را از نو بسازید'));
  await p1.screenshot({ path: path.join(OUT, 'fa-home-desktop.png') });

  /* R3: direct /en overrides remembered FA choice */
  await p1.goto(`${BASE}/en`, { waitUntil: 'networkidle' });
  ok('R3 explicit /en wins', (await p1.locator('html').getAttribute('lang')) === 'en' && (await p1.locator('.lang-tab.is-on').innerText()).includes('English'));

  /* R4: root honors the MOST RECENT explicit choice (back to /fa, then /) */
  await p1.goto(`${BASE}/fa`, { waitUntil: 'networkidle' });
  await p1.goto(`${BASE}/`, { waitUntil: 'networkidle', maxRedirects: 10 });
  ok('R4 root honors remembered FA', p1.url().includes('/fa'), p1.url());
  await c1.close();

  /* R5: switch preserves deep route + query, both directions */
  const c2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p2 = await c2.newPage();
  p2.on('pageerror', (e) => errs.push(`[r5] ${e.message}`));
  await p2.goto(`${BASE}/en/contact?intent=infrastructure`, { waitUntil: 'networkidle' });
  ok('R5 intent preselected', await p2.locator('select >> nth=0').inputValue() === 'infrastructure');
  await p2.locator('.lang-tab', { hasText: 'فارسی' }).click();
  await p2.waitForURL('**/fa/contact?intent=infrastructure', { timeout: 8000 }).catch(() => {});
  ok('R5 EN→FA keeps route+query', p2.url().includes('/fa/contact') && p2.url().includes('intent=infrastructure'), p2.url());
  ok('R5 Persian form labels', (await p2.locator('.lead-label').first().innerText()).length > 0 && !(await p2.locator('.lead-label').first().innerText()).match(/[a-zA-Z]{4,}/));
  await p2.screenshot({ path: path.join(OUT, 'fa-contact-desktop.png') });
  await p2.locator('.lang-tab:not(.is-on)').click(); // switch back to English
  await p2.waitForURL('**/en/contact**', { timeout: 8000 }).catch(() => {});
  ok('R5 FA→EN returns', p2.url().includes('/en/contact'), p2.url());
  await c2.close();

  /* R6: switcher visible on mobile without hamburger + RTL no h-scroll */
  const c3 = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p3 = await c3.newPage();
  p3.on('pageerror', (e) => errs.push(`[r6] ${e.message}`));
  await p3.goto(`${BASE}/fa/services`, { waitUntil: 'networkidle' });
  const sw = await p3.locator('.lang-tabs').isVisible();
  const swBox = await p3.locator('.lang-tabs').boundingBox();
  ok('R6 switcher visible on mobile', sw && !!swBox && swBox.y < 120);
  const overflow = await p3.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok('R6 no horizontal scroll (RTL)', overflow <= 1, `${overflow}px`);
  ok('R6 Persian services h1', (await p3.locator('h1').innerText()).includes('بازسازی'));
  await p3.screenshot({ path: path.join(OUT, 'fa-services-mobile.png') });
  // deep fa route preservation on switch from mobile
  await p3.locator('.lang-tab:not(.is-on)').click();
  await p3.waitForURL('**/en/services**', { timeout: 8000 }).catch(() => {});
  ok('R6 mobile FA→EN keeps /services', p3.url().includes('/en/services'), p3.url());
  await p3.screenshot({ path: path.join(OUT, 'en-services-mobile.png') });
  await c3.close();

  /* R7: metadata + hreflang parity */
  const c4 = await browser.newContext();
  const p4 = await c4.newPage();
  await p4.goto(`${BASE}/en/system`, { waitUntil: 'domcontentloaded' });
  const enHref = await p4.locator('link[rel="alternate"][hreflang="fa"]').getAttribute('href');
  ok('R7 EN page hreflang fa', enHref?.includes('/fa/system'), enHref ?? 'missing');
  const enCanon = await p4.locator('link[rel="canonical"]').getAttribute('href');
  ok('R7 EN canonical', enCanon?.endsWith('/en/system'), enCanon ?? '');
  await p4.goto(`${BASE}/fa/system`, { waitUntil: 'domcontentloaded' });
  ok('R7 FA canonical', (await p4.locator('link[rel="canonical"]').getAttribute('href'))?.endsWith('/fa/system'));
  ok('R7 FA og locale', (await p4.evaluate(() => document.querySelector('meta[property="og:locale"]')?.getAttribute('content'))) === 'fa_IR');
  await c4.close();

  /* R8: legacy redirects */
  const p5 = await browser.newPage();
  const r8a = await p5.goto(`${BASE}/about`, { maxRedirects: 10, waitUntil: 'domcontentloaded' });
  ok('R8 /about → /en/about (308)', p5.url().includes('/en/about'));
  const r8b = await p5.goto(`${BASE}/contact?intent=diagnostic`, { maxRedirects: 10, waitUntil: 'domcontentloaded' });
  ok('R8 /contact?intent → /en/contact?intent', p5.url().includes('/en/contact?intent=diagnostic'), p5.url());
  const r8c = await p5.goto(`${BASE}/journey`, { waitUntil: 'domcontentloaded' });
  ok('R8 /journey untouched', p5.url().endsWith('/journey') && (await p5.locator('html').getAttribute('lang')) === 'en');
  await p5.close();

  /* ---------- Lead pipeline ---------- */
  const p6 = await browser.newPage();
  await p6.goto(`${BASE}/en/contact`, { waitUntil: 'networkidle' });

  // negative: submit empty → client+server validation errors visible
  await p6.locator('.lead-submit').click();
  await p6.waitForTimeout(700);
  ok('LEAD negative shows errors', (await p6.locator('.lead-error').count()) >= 2, `${await p6.locator('.lead-error').count()}`);
  await p6.screenshot({ path: path.join(OUT, 'en-contact-errors.png') });

  // positive submit
  await p6.selectOption('select[name="intent-display"]', 'rebuild-function').catch(() => {});
  await p6.fill('input[name="name"]', 'E2E Tester');
  await p6.fill('input[name="email"]', 'e2e@example.com');
  await p6.fill('textarea[name="message"]', 'Support operations rebuild — E2E verification lead. Please archive.');
  await p6.check('input[name="consent"]');
  await p6.locator('.lead-submit').click();
  await p6.waitForSelector('.lead-success', { timeout: 10000 });
  const refText = await p6.locator('.lead-success-body').innerText();
  const refId = (refText.match(/QV-[a-z0-9-]+/i) ?? [''])[0];
  ok('LEAD submit → success with reference', refId.startsWith('QV-'), refId);
  await p6.screenshot({ path: path.join(OUT, 'en-contact-success.png') });

  // durable persistence on disk
  const leadsPath = path.resolve('.data', 'leads.jsonl');
  const lines = fs.existsSync(leadsPath) ? fs.readFileSync(leadsPath, 'utf8').trim().split('\n') : [];
  const mine = lines.map((l) => JSON.parse(l)).find((r) => r.id === refId);
  ok(
    'LEAD durably stored',
    !!mine &&
      mine.fields.email === 'e2e@example.com' &&
      mine.status === 'stored' &&
      ['outbox_queued', 'smtp', 'sent'].includes(mine.notify),
    mine ? `${mine.id} notify=${mine.notify}` : 'missing'
  );

  // Persian form end-to-end (validation messages localized)
  await p6.goto(`${BASE}/fa/contact`, { waitUntil: 'networkidle' });
  await p6.fill('input[name="name"]', 'تست کننده');
  await p6.fill('input[name="email"]', 'bad-email');
  await p6.fill('textarea[name="message"]', 'این یک پیام آزمایشی برای بررسی پیام‌های خطای فارسی است.');
  await p6.check('input[name="consent"]');
  await p6.locator('.lead-submit').click();
  await p6.waitForTimeout(800);
  const faErr = await p6.locator('.lead-error').first().innerText();
  ok('LEAD FA validation message localized', /[\u0600-\u06FF]/.test(faErr), faErr.slice(0, 40));
  await p6.screenshot({ path: path.join(OUT, 'fa-contact-error.png') });

  // honeypot: bots get fake success, nothing stored.
  // Probed from node with an isolated x-real-ip so the shared 127.0.0.1
  // rate-limit bucket from the browser flow above cannot mask the result.
  const probe = async (ip, body) => {
    const r = await fetch(`${BASE}/api/lead`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-real-ip': ip },
      body: JSON.stringify(body),
    });
    return { status: r.status, body: await r.json().catch(() => ({})) };
  };
  const before = fs.existsSync(leadsPath) ? fs.readFileSync(leadsPath, 'utf8').trim().split('\n').length : 0;
  const hp = await probe('203.0.113.77', {
    intent: 'diagnostic',
    name: 'Bot',
    email: 'bot@spam.com',
    message: 'buy now please',
    consent: true,
    company_site: 'http://spam.tld',
  });
  const after = fs.existsSync(leadsPath) ? fs.readFileSync(leadsPath, 'utf8').trim().split('\n').length : 0;
  ok('LEAD honeypot: fake success, nothing stored', hp.status === 202 && hp.body.id === 'QV-ignored' && before === after, `${hp.status} ${before}→${after}`);

  // rate limit: 6 rapid posts from one isolated IP → 429 on the 6th
  let got429 = false;
  for (let i = 0; i < 6; i++) {
    const r = await probe('198.51.100.9', {
      intent: 'other',
      name: 'RL Test',
      email: 'rl@example.com',
      message: 'rate limit probe message long enough',
      consent: true,
    });
    if (r.status === 429) { got429 = true; break; }
  }
  ok('LEAD rate limit 429 after burst', got429);

  // health probe
  const health = await p6.evaluate(async () => (await (await fetch('/api/lead')).json()));
  ok('LEAD health endpoint', health.ok === true && health.storage === 'writable', JSON.stringify(health));
  await p6.close();

  await browser.close();
  console.log(errs.length ? `CONSOLE/PAGE ERRORS:\n${errs.join('\n')}` : 'no page errors');
  if (failures || errs.length) { console.log(`FAILED: ${failures} row(s), ${errs.length} errors`); process.exit(1); }
  console.log('LANGUAGE UX MATRIX: ALL PASS');
};
run().catch((e) => { console.error(e); process.exit(1); });
