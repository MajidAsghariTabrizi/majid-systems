/** Render the og card template to a 1200×630 PNG (site-wide social image). */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import fs from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..');
const out = join(repo, 'public', 'og', 'quantiviq-og.png');
fs.mkdirSync(dirname(out), { recursive: true });

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto('file:///' + join(here, 'og-template.html').replace(/\\/g, '/'), { waitUntil: 'load' });
await page.waitForTimeout(400);
await page.screenshot({ path: out, type: 'png' });
await browser.close();
const kb = Math.round(fs.statSync(out).size / 1024);
console.log(`og image written: ${out} (${kb} KB)`);
