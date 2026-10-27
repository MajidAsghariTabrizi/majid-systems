/**
 * Executive Dialogue UI acceptance: screenshots (5 viewports × EN/FA),
 * overflow, console errors, axe-core, functional streaming + cancel +
 * citations + drawer + suggestions. Runs against local preview (needs
 * a real-model service is NOT required — UI streaming verified against
 * the mock-mode service or production gateway).
 */
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.env.EXEC_BASE ?? 'http://127.0.0.1:3219';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const report = { viewports: {}, axe: null, functional: {} };
fs.mkdirSync('captures-exec', { recursive: true });

for (const locale of ['en', 'fa']) {
  for (const [name, width, height] of [['320', 320, 700], ['390', 390, 844], ['768', 768, 1024], ['1024', 1024, 768], ['1440', 1440, 900]]) {
    const ctx = await browser.newContext({ viewport: { width, height } });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 90)); });
    pg.on('pageerror', (e) => errs.push(String(e).slice(0, 90)));
    await pg.goto(BASE + '/meet-majid', { waitUntil: 'networkidle', timeout: 60000 });
    if (locale === 'fa') { await pg.locator('.ex-locale-toggle button[aria-pressed="true"]', { hasText: 'فا' }).click().catch(async () => { await pg.locator('.ex-locale-toggle button').nth(1).click(); }); await pg.waitForTimeout(400); }
    const overflow = await pg.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    const dir = await pg.evaluate(() => document.documentElement.dir);
    await pg.screenshot({ path: 'captures-exec/intro-' + locale + '-' + name + '.png', fullPage: width <= 768 });
    report.viewports[locale + '-' + name] = { overflow, dir, consoleErrors: errs.length };
    console.log('intro', locale, name.padEnd(4), 'dir=' + dir, 'ov=' + overflow, 'errs=' + errs.length, errs[0] ?? '');
    await ctx.close();
  }
}

// axe on intro EN + FA
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const pg = await ctx.newPage();
await pg.goto(BASE + '/meet-majid', { waitUntil: 'networkidle' });
await pg.evaluate(() => Promise.all([import('https://cdn.jsdelivr.net/npm/axe-core@4.10.0/axe.min.js')]).catch(() => {}));
await pg.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/axe-core@4.10.0/axe.min.js' });
const axe = await pg.evaluate(() => window.axe?.run(document, { resultTypes: ['violations'] }));
const serious = (axe?.violations ?? []).filter((v) => ['critical', 'serious'].includes(v.impact));
report.axe = serious.map((v) => v.id + ' x' + v.nodes.length);
console.log('axe critical/serious (intro EN):', report.axe.length ? report.axe.join(', ') : 'NONE');

// functional: enter path, ask starter (mock/real via gateway), citations render, drawer, cancel
await pg.locator('.ex-path').nth(1).click();
await pg.waitForTimeout(300);
const nSuggest = await pg.locator('.ex-suggest').count();
console.log('chat stage: suggestions=', nSuggest, 'composer=', await pg.locator('.ex-input').count());
// keyboard path: focus composer, type, Enter
await pg.locator('.ex-input').fill('What has Majid actually shipped?');
await pg.keyboard.press('Enter');
await pg.waitForTimeout(1500);
const streaming = await pg.evaluate(() => ({ msgs: document.querySelectorAll('.ex-msg').length, busy: !!document.querySelector('.ex-stop') }));
console.log('after ask: msgs=', streaming.msgs, 'busy(stop btn)=', streaming.busy);
// cancel quickly if still busy
if (streaming.busy) { await pg.locator('.ex-stop').click(); await pg.waitForTimeout(600); }
const afterCancel = await pg.evaluate(() => ({ msgs: document.querySelectorAll('.ex-msg').length, stopped: !document.querySelector('.ex-stop') }));
console.log('after cancel: msgs=', afterCancel.msgs, 'stopped=', afterCancel.stopped);
// full ask to completion for citations
await pg.locator('.ex-input').fill('What did Phoenix prove?');
await pg.keyboard.press('Enter');
try { await pg.locator('.ex-cite').first().waitFor({ timeout: 90000 }); } catch {}
const cites = await pg.locator('.ex-cite').count();
const evItems = await pg.locator('.ex-ev-item').count();
console.log('citations=', cites, 'evidence items=', evItems);
await pg.screenshot({ path: 'captures-exec/chat-en-1440.png', fullPage: false });
report.functional = { suggestions: nSuggest, cancel: afterCancel.stopped, cites, evidenceItems: evItems };
await ctx.close();
await browser.close();
fs.writeFileSync('captures-exec/ui-report.json', JSON.stringify(report, null, 2));
console.log('UI acceptance done');
