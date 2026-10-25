#!/usr/bin/env node
/* Renders the OG source SVGs to 1200x630 PNGs via Playwright. */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const SRC = path.join(process.cwd(), 'captures-v5', 'og-src');
const OUT = path.join(process.cwd(), 'public', 'og', 'insights');
fs.mkdirSync(OUT, { recursive: true });

const files = fs.readdirSync(SRC).filter((f) => f.endsWith('.svg'));
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await (await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })).newPage();

for (const f of files) {
  const svg = fs.readFileSync(path.join(SRC, f), 'utf8');
  await page.setContent(`<!doctype html><html><body style="margin:0">${svg}</body></html>`, { waitUntil: 'load' });
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(OUT, f.replace('.svg', '.png')), clip: { x: 0, y: 0, width: 1200, height: 630 } });
  console.log('og png:', f.replace('.svg', '.png'));
}
await browser.close();
console.log(`done: ${files.length} OG PNGs -> public/og/insights/`);
