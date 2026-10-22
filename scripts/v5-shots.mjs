/**
 * V5 before/after screenshots: 1366x768 desktop + 390x844 mobile, idle/running/completed.
 * BASE_SOURCE=prod captures the live site; default captures the local build.
 */
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const PROD = process.env.BASE_SOURCE === 'prod';
const BASE = PROD ? 'https://quantiviq.xyz' : (process.env.CAPTURE_BASE ?? 'http://127.0.0.1:3219');
const OUT = path.resolve('captures-v5', PROD ? 'before' : 'after');
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'msedge', headless: true });

async function desktopStates(locale) {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/${locale}`, { waitUntil: 'networkidle', timeout: 60000 });
  await p.locator('.sim-frame').scrollIntoViewIfNeeded().catch(() => {});
  await p.waitForTimeout(900);
  await p.screenshot({ path: path.join(OUT, `${locale}-desktop-idle-1366.png`) });
  const cta = p.locator('.sim-cta.primary').first();
  if (await cta.count()) {
    await cta.click().catch(() => {});
    await p.waitForTimeout(2600);
    await p.screenshot({ path: path.join(OUT, `${locale}-desktop-running-1366.png`) });
    await p.waitForSelector('.sim-payoff.on', { timeout: 40000 }).catch(() => {});
    await p.waitForTimeout(800);
    await p.screenshot({ path: path.join(OUT, `${locale}-desktop-completed-1366.png`) });
  }
  await ctx.close();
}

async function mobileStates(locale) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/${locale}`, { waitUntil: 'networkidle', timeout: 60000 });
  await p.locator('.sim-frame').scrollIntoViewIfNeeded().catch(() => {});
  await p.waitForTimeout(800);
  await p.screenshot({ path: path.join(OUT, `${locale}-mobile-idle-390.png`) });
  const cta = p.locator('.sim-cta.primary').first();
  if (await cta.count()) {
    await cta.click().catch(() => {});
    await p.waitForSelector('.sim-payoff.on', { timeout: 40000 }).catch(() => {});
    await p.waitForTimeout(600);
    await p.screenshot({ path: path.join(OUT, `${locale}-mobile-completed-390.png`) });
  }
  await ctx.close();
}

await desktopStates('en');
await desktopStates('fa');
await mobileStates('en');
await mobileStates('fa');

await browser.close();
console.log(`shots -> ${OUT}:`, fs.readdirSync(OUT).join(', '));
