#!/usr/bin/env node
/* Renders the Persian OG source SVGs to 1200x630 PNGs via Playwright (Edge).
 * Loads the self-hosted Estedad variable font via @font-face so Persian titles
 * render in the licensed typeface, then waits for document.fonts.ready. */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const SRC = path.join(process.cwd(), 'captures-v5', 'og-src-fa');
const OUT = path.join(process.cwd(), 'public', 'og', 'insights', 'fa');
const FONT = path.join(process.cwd(), 'public', 'fonts', 'Estedad-Variable.woff2');
fs.mkdirSync(OUT, { recursive: true });

const fontUrl = 'file:///' + FONT.replace(/\\/g, '/');
const files = fs.readdirSync(SRC).filter((f) => f.endsWith('.svg'));
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await (await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })).newPage();

for (const f of files) {
  const svg = fs.readFileSync(path.join(SRC, f), 'utf8');
  await page.setContent(
    `<!doctype html><html><head><style>
      @font-face { font-family: 'Estedad'; src: url('${fontUrl}') format('woff2-variations'); font-weight: 100 900; }
      body { margin: 0; font-family: 'Estedad', Tahoma, sans-serif; direction: rtl; }
    </style></head><body>${svg}</body></html>`,
    { waitUntil: 'load' },
  );
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(OUT, f.replace('.svg', '.png')), clip: { x: 0, y: 0, width: 1200, height: 630 } });
  console.log('og-fa png:', f.replace('.svg', '.png'));
}
await browser.close();
console.log(`done: ${files.length} Persian OG PNGs -> public/og/insights/fa/`);
