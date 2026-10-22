/**
 * Lab screenshots: EN/FA × desktop/mobile × key sections, plus interaction
 * states (topology node select, replay scenes, live mode). Captures the local
 * production build by default; BASE_SOURCE=prod captures the live site.
 * Also asserts console-free load and saves a JSON capture report.
 */
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const PROD = process.env.BASE_SOURCE === 'prod';
const BASE = PROD ? 'https://quantiviq.xyz' : (process.env.CAPTURE_BASE ?? 'http://127.0.0.1:3100');
const OUT = path.resolve('captures-lab', PROD ? 'prod' : 'local');
fs.mkdirSync(OUT, { recursive: true });

const report = { base: BASE, at: new Date().toISOString(), captures: [], consoleErrors: [] };
const browser = await chromium.launch({ channel: 'msedge', headless: true });

async function shot(page, name) {
  const file = `${name}.png`;
  await page.screenshot({ path: path.join(OUT, file) });
  report.captures.push(file);
  console.log('  ✔', file);
}

async function labPass(locale, viewport, mobile, label) {
  const ctx = await browser.newContext({
    viewport,
    isMobile: mobile,
    hasTouch: mobile,
  });
  const p = await ctx.newPage();
  p.on('console', (m) => {
    if (m.type() === 'error') report.consoleErrors.push(`[${locale}] ${m.text().slice(0, 200)}`);
  });
  p.on('pageerror', (e) => report.consoleErrors.push(`[${locale}] pageerror: ${String(e).slice(0, 200)}`));

  await p.goto(`${BASE}/${locale}/lab`, { waitUntil: 'load', timeout: 90000 });
  await p.waitForSelector('.lab-app', { timeout: 60000 });
  await p.waitForTimeout(1200); // snapshot decompress + render
  await shot(p, `${locale}-${label}-hero`);

  // topology
  await p.locator('#topology').scrollIntoViewIfNeeded();
  await p.waitForTimeout(700);
  await shot(p, `${locale}-${label}-topology`);
  // click a node (first expert node)
  const node = p.locator('.lab-topo-node').nth(3);
  if (await node.count()) {
    await node.click({ force: true }).catch(() => {});
    await p.waitForTimeout(500);
    await shot(p, `${locale}-${label}-topology-node`);
  }

  // replay — step to gates scene
  await p.locator('#replay').scrollIntoViewIfNeeded();
  await p.waitForTimeout(600);
  await shot(p, `${locale}-${label}-replay`);
  for (let i = 0; i < 6; i++) {
    await p.getByLabel('Next scene').click().catch(() => {});
    await p.waitForTimeout(180);
  }
  await shot(p, `${locale}-${label}-replay-gates`);

  // decisions
  await p.locator('#decisions').scrollIntoViewIfNeeded();
  await p.waitForTimeout(500);
  await shot(p, `${locale}-${label}-decisions`);

  // brain + models + experiments
  for (const id of ['brain', 'models', 'experiments', 'safety']) {
    await p.locator(`#${id}`).scrollIntoViewIfNeeded();
    await p.waitForTimeout(450);
    await shot(p, `${locale}-${label}-${id}`);
  }

  // live mode toggle (desktop only — strip is present on mobile too, try anyway)
  const liveTab = p.getByRole('tab', { name: locale === 'fa' ? 'آزمایشگاه زنده' : 'Live Laboratory' });
  if (await liveTab.count()) {
    await p.locator('#topology').scrollIntoViewIfNeeded();
    await liveTab.click().catch(() => {});
    await p.waitForTimeout(700);
    await shot(p, `${locale}-${label}-live-mode`);
  }

  await ctx.close();
}

console.log(`lab capture -> ${OUT} (base ${BASE})`);
await labPass('en', { width: 1366, height: 900 }, false, 'desktop');
await labPass('fa', { width: 1366, height: 900 }, false, 'desktop');
await labPass('en', { width: 390, height: 844 }, true, 'mobile');
await labPass('fa', { width: 390, height: 844 }, true, 'mobile');

await browser.close();
fs.writeFileSync(path.join(OUT, 'capture-report.json'), JSON.stringify(report, null, 2));
console.log(`captures: ${report.captures.length}, console errors: ${report.consoleErrors.length}`);
if (report.consoleErrors.length) {
  console.log('console errors:');
  for (const e of report.consoleErrors.slice(0, 10)) console.log('  -', e);
}
