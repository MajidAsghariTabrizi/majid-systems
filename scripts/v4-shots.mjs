/**
 * V4 before/after screenshots: idle, running, completed simulation states.
 * BASE_SOURCE=prod captures the live (pre-V4) site; default captures the local build.
 */
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const PROD = process.env.BASE_SOURCE === 'prod';
const BASE = PROD ? 'https://quantiviq.xyz' : (process.env.CAPTURE_BASE ?? 'http://127.0.0.1:3219');
const OUT = path.resolve('captures-v4', PROD ? 'before' : 'after');
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'msedge', headless: true });

async function stateShots(locale, prefix) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/${locale}`, { waitUntil: 'networkidle', timeout: 60000 });
  await p.locator('.sim-frame').scrollIntoViewIfNeeded().catch(() => {});
  await p.waitForTimeout(900);
  await p.screenshot({ path: path.join(OUT, `${prefix}-idle-1440.png`) });

  const cta = p.locator('.sim-cta.primary').first();
  if (await cta.count()) {
    await cta.click().catch(() => {});
    await p.waitForTimeout(2600);
    await p.screenshot({ path: path.join(OUT, `${prefix}-running-1440.png`) });
    // wait for COMPARISON payoff (completed state)
    await p.waitForSelector('.sim-payoff.on', { timeout: 40000 }).catch(() => {});
    await p.waitForTimeout(800);
    await p.screenshot({ path: path.join(OUT, `${prefix}-completed-1440.png`) });
  }
  await ctx.close();
}

async function idleShot(locale, w, h, mobile) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: !!mobile, hasTouch: !!mobile });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/${locale}`, { waitUntil: 'networkidle', timeout: 60000 });
  await p.locator('.sim-frame').scrollIntoViewIfNeeded().catch(() => {});
  await p.waitForTimeout(800);
  await p.screenshot({ path: path.join(OUT, `${locale}-idle-${w}.png`) });
  await ctx.close();
}

await stateShots('en', 'en');
await stateShots('fa', 'fa');
await idleShot('en', 360, 800, true);
await idleShot('fa', 360, 800, true);
await idleShot('en', 768, 900, false);
await idleShot('en', 1733, 900, false);

await browser.close();
console.log(`shots -> ${OUT}:`, fs.readdirSync(OUT).join(', '));
