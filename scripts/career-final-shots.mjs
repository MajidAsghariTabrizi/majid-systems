/** Final deliverable captures from production: home/leadership/resume EN/FA desktop+mobile + resume print PDF. */
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = 'https://quantiviq.xyz';
const out = 'captures-career/final';
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ channel: 'msedge', headless: true });
for (const [locale, w, h, name] of [
  ['en', 1440, 1000, 'desktop'],
  ['fa', 1440, 1000, 'desktop'],
  ['en', 390, 844, 'mobile'],
  ['fa', 390, 844, 'mobile'],
]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  const tag = `${locale}-${name}`;
  await p.goto(`${BASE}/${locale}`, { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `${out}/home-${tag}.png`, fullPage: false });
  await p.goto(`${BASE}/${locale}/leadership`, { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(900);
  await p.screenshot({ path: `${out}/leadership-${tag}-full.png`, fullPage: true });
  await ctx.close();
  console.log('captured', tag);
}
// resume desktop + print PDF (EN)
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/resume`, { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(800);
  await p.screenshot({ path: `${out}/resume-en-desktop-full.png`, fullPage: true });
  await p.pdf({ path: `${out}/resume-en-print.pdf`, format: 'A4', printBackground: true });
  await ctx.close();
  console.log('captured resume + pdf');
}
await browser.close();
console.log('FINAL CAPTURES DONE');
