/** LIVE production browser verification — real GLM answers in the UI. */
import { chromium } from 'playwright';

const BASE = 'https://quantiviq.xyz';
const OUT = 'public-mind/captures/live';
const b = await chromium.launch({ channel: 'msedge', headless: true });
const log = [];
const ok = (name, cond) => { log.push(`${cond ? 'PASS' : 'FAIL'} ${name}`); if (!cond) process.exitCode = 1; };

for (const locale of ['en', 'fa']) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 950 } });
  const p = await ctx.newPage();
  const api = [];
  p.on('request', (r) => { if (r.url().includes('public-mind')) api.push(r.url()); });
  await p.goto(`${BASE}/${locale}/mind`, { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(1200);
  ok(`${locale}: no model call on load`, api.length === 0);
  ok(`${locale}: no floating widget on /mind`, !(await p.locator('.mind-fab').isVisible().catch(() => false)));

  // ask a real question through the executive starter
  await p.locator('.mind-full-starter').first().click();
  // wait for real streaming (GLM ~10-40s)
  await p.waitForSelector('.mind-msg-ai .mind-bubble', { timeout: 30000 });
  let answer = '';
  for (let i = 0; i < 40; i++) {
    answer = (await p.locator('.mind-msg-ai .mind-bubble').last().innerText()).trim();
    if (answer.length > 250) break;
    await p.waitForTimeout(2000);
  }
  ok(`${locale}: REAL streamed answer (${answer.length} chars)`, answer.length > 250);
  const srcCount = await p.locator('.mind-sources a').count();
  ok(`${locale}: sources clickable`, srcCount >= 1);
  if (srcCount >= 1) {
    const href = await p.locator('.mind-sources a').first().getAttribute('href');
    ok(`${locale}: source links allowlisted`, /^https:\/\/quantiviq\.xyz(\/|$)/.test(href || ''));
  }
  const contact = await p.locator('.mind-contact-page').isVisible().catch(() => false);
  ok(`${locale}: contact CTA after answer`, contact);
  const remaining = await p.locator('.mind-full-remaining').innerText().catch(() => '');
  ok(`${locale}: remaining counter`, /questions left|پرسش دیگر/.test(remaining));
  await p.screenshot({ path: `${OUT}/${locale}-desktop-answer.png` });

  // RTL check (FA)
  if (locale === 'fa') {
    ok('fa: html dir=rtl', (await p.evaluate(() => document.documentElement.dir)) === 'rtl');
  }

  // mobile
  const m = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const mp = await m.newPage();
  await mp.goto(`${BASE}/${locale}/mind`, { waitUntil: 'load', timeout: 60000 });
  await mp.waitForTimeout(700);
  const ov = await mp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(`${locale}: mobile no overflow`, ov <= 0);
  await mp.screenshot({ path: `${OUT}/${locale}-mobile.png` });
  await m.close();
  await ctx.close();
}

// floating widget regression + REAL answer via widget on another page
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto(`${BASE}/en/insights`, { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(1000);
ok('floating fab on /en/insights', await p.locator('.mind-fab').isVisible());
await p.locator('.mind-fab').click();
await p.waitForTimeout(500);
ok('floating panel opens', await p.locator('.mind-panel').isVisible());
await p.locator('.mind-sugg-chip').first().click();
await p.waitForSelector('.mind-msg-ai .mind-bubble', { timeout: 30000 });
let wans = '';
for (let i = 0; i < 30; i++) {
  wans = (await p.locator('.mind-msg-ai .mind-bubble').last().innerText()).trim();
  if (wans.length > 200) break;
  await p.waitForTimeout(2000);
}
ok(`floating panel REAL answer (${wans.length} chars)`, wans.length > 200);
await p.screenshot({ path: `${OUT}/en-floating-answer.png` });

// routes regression
for (const u of ['/en', '/fa', '/en/insights', '/fa/insights', '/en/leadership', '/fa/leadership', '/en/lab', '/fa/lab', '/en/mind', '/fa/mind']) {
  const r = await fetch(`${BASE}${u}`, { redirect: 'manual' });
  ok(`route ${u}`, r.status === 200);
}
await ctx.close();
await b.close();
console.log(log.join('\n'));
console.log(process.exitCode ? 'LIVE VERIFICATION FAILURES' : 'LIVE VERIFICATION ALL PASS');
