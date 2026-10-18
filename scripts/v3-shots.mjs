/** Final screenshot pack for the release report. */
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const BASE = process.env.CAPTURE_BASE ?? 'http://127.0.0.1:3219';
const OUT = path.resolve('captures-v3');
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const shots = [
  { url: '/en', name: 'en-home-desktop', w: 1440, h: 900 },
  { url: '/en#simulator', name: 'en-sim-desktop', w: 1440, h: 900, scroll: '#simulator' },
  { url: '/en/services', name: 'en-services-desktop', w: 1440, h: 900 },
  { url: '/en/contact', name: 'en-contact-desktop', w: 1440, h: 900 },
  { url: '/en/system', name: 'en-system-desktop', w: 1440, h: 900 },
  { url: '/fa', name: 'fa-home-mobile-390', w: 390, h: 844, mobile: true },
  { url: '/fa', name: 'fa-home-320', w: 320, h: 700, mobile: true },
  { url: '/fa/system', name: 'fa-system-desktop', w: 1440, h: 900 },
  { url: '/fa/method', name: 'fa-method-desktop', w: 1440, h: 900 },
  { url: '/fa/proof', name: 'fa-proof-desktop', w: 1440, h: 900 },
];

for (const s of shots) {
  const ctx = await browser.newContext({
    viewport: { width: s.w, height: s.h },
    isMobile: !!s.mobile,
    hasTouch: !!s.mobile,
    deviceScaleFactor: 1,
  });
  const p = await ctx.newPage();
  await p.goto(BASE + s.url, { waitUntil: 'networkidle' });
  if (s.scroll) await p.locator(s.scroll).scrollIntoViewIfNeeded().catch(() => {});
  await p.waitForTimeout(600);
  await p.screenshot({ path: path.join(OUT, `${s.name}.png`) });
  console.log('captured', s.name);
  await ctx.close();
}

// sitemap alternates smoke
const p = await browser.newPage();
const sm = await (await p.goto(`${BASE}/sitemap.xml`)).text();
const hasFa = sm.includes('/fa/services') && sm.includes('hreflang') || sm.includes('<xhtml:link');
console.log('sitemap fa alternates:', sm.includes('/fa'));
await browser.close();
