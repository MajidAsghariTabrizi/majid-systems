/** Production browser verification + deliverable screenshots for Quantiviq Mind. */
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = 'https://quantiviq.xyz';
const out = 'public-mind/captures';
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ channel: 'msedge', headless: true });
const log = [];

for (const [locale, w, h, tag] of [['en', 1440, 1000, 'desktop'], ['fa', 1440, 1000, 'desktop'], ['en', 390, 844, 'mobile'], ['fa', 390, 844, 'mobile']]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  const api = [];
  p.on('request', (r) => { if (r.url().includes('public-mind')) api.push(r.url()); });
  await p.goto(`${BASE}/${locale}`, { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(1500);
  const fabVisible = await p.locator('.mind-fab').isVisible().catch(() => false);
  log.push(`${locale}-${tag}: fab=${fabVisible} apiCallsOnLoad=${api.length}`);
  await p.screenshot({ path: `${out}/home-${locale}-${tag}.png` });
  if (fabVisible) {
    await p.locator('.mind-fab').click();
    await p.waitForTimeout(600);
    const panel = await p.locator('.mind-panel').isVisible().catch(() => false);
    const disclosure = await p.locator('.mind-head-sub').innerText().catch(() => '');
    const suggestions = await p.locator('.mind-sugg-chip').count();
    log.push(`${locale}-${tag}: panel=${panel} suggestions=${suggestions} disclosure=${disclosure.length > 20}`);
    await p.screenshot({ path: `${out}/panel-${locale}-${tag}.png` });
    // ask a question -> disabled message expected (production, chat off)
    await p.locator('.mind-sugg-chip').first().click();
    await p.waitForTimeout(2500);
    const err = await p.locator('.mind-error').innerText().catch(() => '');
    log.push(`${locale}-${tag}: disabled-message-shown=${err.length > 10} "${err.slice(0, 60)}"`);
    await p.screenshot({ path: `${out}/disabled-${locale}-${tag}.png` });
    if (locale === 'fa') {
      log.push(`fa-${tag}: html dir=${await p.evaluate(() => document.documentElement.dir)}`);
    }
  }
  await ctx.close();
}
await b.close();
console.log(log.join('\n'));
console.log('PRODUCTION CAPTURES DONE');
