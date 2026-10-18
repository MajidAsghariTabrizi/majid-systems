/** AFTER screenshots — local hardened build, for the audit's before/after. */
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const BASE = process.env.CAPTURE_BASE ?? 'http://127.0.0.1:3219';
const OUT = path.resolve('captures-v3-audit', 'after');
fs.mkdirSync(OUT, { recursive: true });

const shots = [
  { url: '/en', name: 'en-home-1440', w: 1440, h: 900 },
  { url: '/en', name: 'en-home-390', w: 390, h: 844, mobile: true },
  { url: '/en', name: 'en-home-360', w: 360, h: 800, mobile: true },
  { url: '/fa', name: 'fa-home-390', w: 390, h: 844, mobile: true },
  { url: '/fa', name: 'fa-home-1440-fa', w: 1440, h: 900 },
  { url: '/fa/proof', name: 'fa-proof-1440', w: 1440, h: 900 },
  { url: '/en/services', name: 'en-services-1440', w: 1440, h: 900 },
  { url: '/fa/services', name: 'fa-services-1440', w: 1440, h: 900 },
  { url: '/en/contact', name: 'en-contact-390', w: 390, h: 844, mobile: true },
];

const browser = await chromium.launch({ channel: 'msedge', headless: true });
for (const s of shots) {
  const ctx = await browser.newContext({
    viewport: { width: s.w, height: s.h },
    isMobile: !!s.mobile,
    hasTouch: !!s.mobile,
  });
  const p = await ctx.newPage();
  await p.goto(BASE + s.url, { waitUntil: 'networkidle', timeout: 45000 });
  await p.waitForTimeout(700);
  await p.screenshot({ path: path.join(OUT, `${s.name}.png`), fullPage: false });
  console.log('after:', s.name);
  await ctx.close();
}
await browser.close();
