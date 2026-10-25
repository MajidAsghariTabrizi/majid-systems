import { chromium } from 'playwright';
import fs from 'node:fs';
fs.mkdirSync('captures-figqa/hero', { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto('https://quantiviq.xyz/en/insights/ai-adoption-is-not-ai-transformation', { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForTimeout(600);
const st = await page.evaluate(() => {
  const img = document.querySelector('.ins-hero img');
  return { complete: img.complete, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight };
});
console.log('PROD hero img:', JSON.stringify(st));
const img = await page.$('.ins-hero img');
await img.screenshot({ path: 'captures-figqa/hero/imgbox-en01-prod-after.png' });
await page.screenshot({ path: 'captures-figqa/hero/prod-en01-full-1440.png', fullPage: true });
await ctx.close();
await browser.close();
console.log('prod screenshots saved');
