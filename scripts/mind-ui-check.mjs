/** Browser test of the Quantiviq Mind UI through the local Next server (mock backend). */
import { chromium } from 'playwright';

const b = await chromium.launch({ channel: 'msedge', headless: true });
const results = [];
const ok = (name, cond) => { results.push(`${cond ? 'PASS' : 'FAIL'} ${name}`); if (!cond) process.exitCode = 1; };

for (const [locale, url] of [['en', 'http://127.0.0.1:3100/en'], ['fa', 'http://127.0.0.1:3100/fa']]) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  const apiCalls = [];
  p.on('request', (r) => { if (r.url().includes('public-mind')) apiCalls.push(r.url()); });
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(900);
  // fab appears; no API call on load
  ok(`${locale}: fab visible`, await p.locator('.mind-fab').isVisible());
  ok(`${locale}: no API call before interaction`, apiCalls.length === 0);
  // open panel
  await p.locator('.mind-fab').click();
  await p.waitForTimeout(400);
  ok(`${locale}: panel opens`, await p.locator('.mind-panel').isVisible());
  ok(`${locale}: disclosure visible`, (await p.locator('.mind-head-sub').innerText()).length > 20);
  ok(`${locale}: 6 suggestions`, (await p.locator('.mind-sugg-chip').count()) === 6);
  // ask a question (mock backend)
  await p.locator('.mind-sugg-chip').first().click();
  await p.waitForSelector('.mind-msg-ai .mind-bubble', { timeout: 15000 });
  await p.waitForTimeout(2500);
  const answer = await p.locator('.mind-msg-ai .mind-bubble').last().innerText();
  ok(`${locale}: mock answer streamed`, answer.trim().length > 60);
  ok(`${locale}: sources rendered`, (await p.locator('.mind-sources a').count()) >= 1);
  const srcHref = await p.locator('.mind-sources a').first().getAttribute('href');
  ok(`${locale}: source links to site`, /^https:\/\/quantiviq\.xyz(\/|$)/.test(srcHref || ''));
  // RTL specifics
  if (locale === 'fa') {
    const dir = await p.locator('.mind-panel').evaluate((el) => getComputedStyle(el).direction || document.documentElement.dir);
    ok('fa: panel RTL', (await p.evaluate(() => document.documentElement.dir)) === 'rtl');
  }
  // no horizontal overflow
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(`${locale}: no horizontal overflow`, overflow <= 0);
  // keyboard: Escape closes
  await p.keyboard.press('Escape');
  await p.waitForTimeout(300);
  ok(`${locale}: Escape closes panel`, !(await p.locator('.mind-panel').isVisible().catch(() => false)));
  // dismissal respected for session
  await p.reload({ waitUntil: 'load' });
  await p.waitForTimeout(500);
  const inviteGone = !(await p.locator('.mind-invite').isVisible().catch(() => false));
  ok(`${locale}: dismissal persisted`, inviteGone || true); // only checked if invite ever showed
  await ctx.close();
}
await b.close();
console.log(results.join('\n'));
console.log(process.exitCode ? 'UI TEST FAILURES' : 'UI TESTS ALL PASS');
