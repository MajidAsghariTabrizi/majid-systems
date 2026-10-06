/**
 * Visual verification captures for the Quantiviq hero simulator.
 * Drives the real built site (next start :3100) through the full mission
 * arc and screenshots every required state. Console errors fail the run.
 *
 * Usage: node scripts/hero-capture.mjs
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('captures');
const BASE = process.env.CAPTURE_BASE ?? 'http://127.0.0.1:3100';
fs.mkdirSync(OUT, { recursive: true });

const consoleErrors = [];
const shots = [];

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  shots.push(name);
  console.log(`captured: ${name}`);
}

const run = async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  /* ---------------- desktop arc ---------------- */
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(`[desktop] ${m.text()}`);
  });
  page.on('pageerror', (e) => consoleErrors.push(`[desktop pageerror] ${e.message}`));

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('#simulator .sim-stage', { timeout: 15000 });
  await page.waitForTimeout(800);
  await page.evaluate(() => document.querySelector('#simulator').scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(400);

  await shot(page, '01-initial-traditional');

  // inspect a node (pause + card)
  await page.evaluate(() => document.querySelector('#simulator').scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(400);
  await page.locator('.sim-node[data-node="SLACK"]').click();
  await page.waitForTimeout(400);
  await shot(page, '02-node-inspect-slack');
  await page.locator('.sim-inspect .si-close').click();
  await page.waitForTimeout(200);

  // old flow — capture mid-flow ~35% (≈9s of 25.6s)
  await page.getByRole('button', { name: 'SEND A SIGNAL' }).click();
  await page.waitForTimeout(9000);
  await shot(page, '03-old-signal-midflow');
  await page.waitForTimeout(3000);
  await shot(page, '04-old-signal-late-slack-meeting');

  // finish the old run (rest of 25.6s from click)
  await page.waitForTimeout(14500);
  await shot(page, '05-old-complete');

  // rebuild — capture t≈0.5 (2.6s of 5.2s)
  await page.getByRole('button', { name: 'REBUILD THIS COMPANY' }).click();
  await page.waitForTimeout(2600);
  await shot(page, '06-mid-transformation');
  await page.waitForTimeout(3200);
  await shot(page, '07-ai-native-idle');

  // run the same signal — brain investigation (t≈5.0s: inside investigate 4.3–6.1)
  await page.getByRole('button', { name: 'RUN THE SAME SIGNAL' }).click();
  await page.waitForTimeout(5000);
  await shot(page, '08-brain-investigation');

  // authority gate (8.4–9.7s)
  await page.waitForTimeout(3600);
  await shot(page, '09-authority-gate');

  // learning (SIGNAL_NEW total 14.7s → LEARNING starts)
  await page.waitForTimeout(6300);
  await shot(page, '10-learning-moment');

  // comparison + payoff + slider
  await page.waitForTimeout(3000);
  await shot(page, '11-comparison-payoff');

  // slider mid + latency overlay + layer explorer
  await page.locator('.sim-compare input[type="range"]').fill('0.45');
  await page.waitForTimeout(400);
  await shot(page, '12-comparison-slider-mid');
  await page.getByRole('button', { name: 'SHOW LATENCY' }).click();
  await page.locator('.sim-compare input[type="range"]').fill('0');
  await page.waitForTimeout(400);
  await shot(page, '13-comparison-latency-overlay-old');
  await page.getByRole('button', { name: 'SHOW LATENCY' }).click();
  await page.getByRole('button', { name: 'SHOW KNOWLEDGE FLOW' }).click();
  await page.locator('.sim-compare input[type="range"]').fill('1');
  await page.waitForTimeout(400);
  await shot(page, '14-knowledge-overlay-new');
  await page.getByRole('button', { name: 'SHOW KNOWLEDGE FLOW' }).click();

  // layer explorer
  await page.getByRole('button', { name: 'COMPANY BRAIN', exact: true }).first().click();
  await page.waitForTimeout(400);
  await shot(page, '15-layer-explorer-brain');
  await page.locator('.sim-layer-panel .si-close').click();

  // RESET returns to traditional
  await page.getByRole('button', { name: 'RESET', exact: true }).click();
  await page.waitForTimeout(600);
  await shot(page, '16-reset-traditional');

  await page.close();

  /* ---------------- scroll storytelling (fresh page, no manual) ---------------- */
  const page2 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page2.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(`[scroll] ${m.text()}`);
  });
  page2.on('pageerror', (e) => consoleErrors.push(`[scroll pageerror] ${e.message}`));
  await page2.goto(BASE, { waitUntil: 'networkidle' });
  await page2.waitForSelector('#simulator .sim-stage', { timeout: 15000 });

  const simTop = await page2.locator('#simulator').boundingBox();
  // 45% through the sticky range ≈ mid-transformation
  const vh = 900;
  const stickyRange = simTop.height - vh;
  const targetY = simTop.y + stickyRange * 0.47;
  await page2.evaluate((y) => window.scrollTo({ top: y }), targetY);
  await page2.waitForTimeout(600);
  await shot(page2, '17-scroll-mid-transformation');
  const manualLocked = await page2.evaluate(() => sessionStorage.getItem('qv-sim-manual'));
  console.log('scroll mode manualLock (expect null):', manualLocked);

  await page2.evaluate((y) => window.scrollTo({ top: y }), simTop.y + stickyRange * 0.99);
  await page2.waitForTimeout(600);
  await shot(page2, '18-scroll-end-comparison');
  await page2.close();

  /* ---------------- mobile arc ---------------- */
  const m = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  m.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(`[mobile] ${msg.text()}`);
  });
  m.on('pageerror', (e) => consoleErrors.push(`[mobile pageerror] ${e.message}`));
  await m.goto(BASE, { waitUntil: 'networkidle' });
  await m.waitForSelector('#simulator .sim-mobile', { timeout: 15000 });
  await m.waitForTimeout(900);
  await m.evaluate(() => document.querySelector('.sim-mobile').scrollIntoView({ block: 'start' }));
  await m.waitForTimeout(400);
  await shot(m, '19-mobile-initial-traditional');

  await m.getByRole('button', { name: 'SEND A SIGNAL' }).click();
  await m.waitForTimeout(9000);
  await shot(m, '20-mobile-old-midflow');
  await m.waitForTimeout(17500);
  await shot(m, '21-mobile-old-complete');

  await m.getByRole('button', { name: 'REBUILD THIS COMPANY' }).click();
  await m.waitForTimeout(5600);
  await shot(m, '22-mobile-ai-native');
  await m.getByRole('button', { name: 'RUN THE SAME SIGNAL' }).click();
  await m.waitForTimeout(5000);
  await shot(m, '23-mobile-new-run');
  await m.waitForTimeout(12500);
  await shot(m, '24-mobile-learned');
  await m.close();

  await browser.close();

  console.log(`\n${shots.length} captures written to captures/`);
  if (consoleErrors.length) {
    console.log('\nCONSOLE ERRORS:');
    for (const e of consoleErrors) console.log('  ' + e);
    process.exitCode = 1;
  } else {
    console.log('no console errors');
  }
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
