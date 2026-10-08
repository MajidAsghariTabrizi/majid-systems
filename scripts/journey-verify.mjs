/**
 * /journey DOM verification + captures against the built site.
 * Usage: CAPTURE_BASE=http://127.0.0.1:3219 node scripts/journey-verify.mjs
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.CAPTURE_BASE ?? 'http://127.0.0.1:3100';
const OUT = path.resolve('captures-journey');
fs.mkdirSync(OUT, { recursive: true });

let failures = 0;
const errs = [];
const ok = (name, cond, detail = '') => {
  console.log(`${cond ? '✔' : '✖'} ${name}${detail ? ` — ${detail}` : ''}`);
  if (!cond) failures++;
};
const shot = async (page, name) => {
  await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  console.log(`captured: ${name}`);
};

const run = async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto(`${BASE}/journey`, { waitUntil: 'networkidle' });

  /* cold open */
  const l1 = await page.locator('.jv-open-l1').innerText();
  ok('cold open line 1', l1.toLowerCase().includes('switch careers'), l1.trim().slice(0, 40));
  ok('cold open cue', (await page.locator('.jv-open-cue').innerText()).includes('SCROLL TO TRACE THE SYSTEM'));

  await shot(page, '01-cold-open');

  /* scene 01 */
  await page.locator('#jv-technology').scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  ok('scene 01 headline', (await page.locator('#jv-technology .jv-headline').innerText()).includes('make software actually run'));
  await page.locator('.jv-flow-stage:nth-child(4)').click(); // BUILD
  ok('tech flow note updates', (await page.locator('.jv-flow-note').innerText()).includes('Immutable artifacts'));
  await shot(page, '02-technology');

  /* scene 03 org */
  await page.locator('#jv-organization').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'REORGANIZE INTO A FLOW' }).click();
  await page.waitForTimeout(900);
  ok('org reorganized', await page.locator('.jv-org-grid.flow').count() === 1);
  await shot(page, '03-organization');

  /* scene 04 market network */
  await page.locator('#jv-marketplace').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.locator('.jv-net-node').nth(3).click(); // SEARCH
  await page.waitForTimeout(300);
  ok('market node lights neighbors', await page.locator('.jv-net-node.near').count() >= 2);
  await shot(page, '04-marketplace');

  /* scene 05 */
  await page.locator('.jv-audit').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1400);
  ok('audit counters revealed', (await page.locator('.jv-audit-row.in').count()) >= 1);
  await shot(page, '05-lab-intro-audit');

  // scroll a bit further to pooling + abstain
  await page.locator('.jv-pool').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1400);
  ok('pooling bars filled', await page.locator('.jv-pool-bar i').first().evaluate((el) => el.style.width !== '0%'));
  await shot(page, '06-pooling');

  await page.locator('.jv-abstain').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'RUN LIVE CANDIDATES' }).click();
  await page.waitForTimeout(2400);
  ok('all candidates stamped ABSTAIN', await page.locator('.jv-cand[data-stamp="ABSTAIN"]').count() === 5);
  await shot(page, '07-abstain-moment');

  /* generation scrubber */
  await page.locator('.jv-scrub').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const scrubCount = await page.locator('.jv-scrub-tab').count();
  ok('scrubber has 8 generations', scrubCount === 8, `${scrubCount}`);
  await page.locator('.jv-scrub-tab').nth(3).click(); // M16
  await page.waitForTimeout(200);
  ok('M16 ledger shows NET EDGE', (await page.locator('.jv-scrub .jv-ledger').innerText()).includes('NET EDGE −'));
  await shot(page, '08-generations-m16');

  /* phoenix */
  await page.locator('.jv-gate').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'SEND A SIGNAL' }).click();
  await page.waitForTimeout(3200);
  ok('signal blocked at economics', await page.locator('.jv-gate-stage.blocked').count() === 1);
  await page.locator('.jv-ladder').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1800);
  const ladderIn = await page.locator('.jv-ladder-row.in').count();
  ok('claims ladder revealed', ladderIn === 5, `${ladderIn}/5`);
  await shot(page, '09-phoenix-gate');

  await page.locator('.jv-numbers').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  ok('phoenix numbers on page', (await page.locator('.jv-numbers').innerText()).includes('39,538'));
  await shot(page, '10-phoenix-numbers-lessons');

  /* router */
  await page.locator('#jv-router').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: 'SEND REQUEST' }).click();
  await page.waitForTimeout(2600);
  ok('reroute completed', await page.locator('.jv-route-prov.up').count() === 1);
  await shot(page, '11-router-failover');

  /* agents */
  await page.locator('#jv-agents').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: '⚡ FAIL' }).click();
  await page.waitForTimeout(900);
  ok('fail classified', (await page.locator('.jv-ring-core').first().textContent()).includes('CLASSIFY'));
  await page.waitForTimeout(1200);
  ok('recovered to re-verify', (await page.locator('.jv-ring-core').first().textContent()).includes('RECOVERED'));
  await shot(page, '12-uea-fail-recover');

  /* brain */
  await page.locator('#jv-brain').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'RUN THE WORK' }).click();
  await page.waitForTimeout(4300);
  const ctxWidth = await page.locator('.jv-mem-task').nth(1).locator('.jv-mem-ctx i').evaluate((el) => el.style.width);
  ok('task 2 starts with more context', ctxWidth === '88%', ctxWidth);
  await shot(page, '13-brain-memory');

  await page.locator('.jv-split').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'SYNC' }).click();
  await page.waitForTimeout(400);
  ok('split diverges', await page.locator('.jv-split-boxes.diverge').count() === 1);
  await page.getByRole('button', { name: 'GOVERN' }).click();
  await page.waitForTimeout(400);
  ok('split resolves', await page.locator('.jv-split-boxes.resolve').count() === 1);
  await shot(page, '14-brain-split');

  /* convergence + final */
  await page.locator('#jv-convergence').scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000);
  ok('convergence stack revealed', await page.locator('.jv-conv.in').count() === 1);
  ok('quantiviq stamp visible', (await page.locator('.jv-conv-q').innerText()) === 'QUANTIVIQ');
  await shot(page, '15-convergence');
  ok('graph zoomed + center node', await page.locator('.jv-graph.zoom').count() === 1);

  await page.locator('#jv-final').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  ok('final headline', (await page.locator('.jv-final-h').innerText()) === 'I BUILD SYSTEMS THAT LEARN FROM THEIR OWN WORK.');
  await shot(page, '16-final');

  /* graph rail check mid-page */
  await page.locator('#jv-decision-systems').scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  const hotLayers = await page.locator('.jv-g-node.hot').count();
  ok('graph highlights active layer', hotLayers === 1, `${hotLayers} hot`);
  await page.screenshot({ path: path.join(OUT, '17-graph-rail.png') });

  /* ask panel */
  await page.getByRole('button', { name: 'ASK THE SYSTEM' }).click();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'What did Phoenix teach you about autonomous systems?' }).click();
  await page.waitForTimeout(300);
  const ansText = await page.locator('.jv-ask-a').first().innerText();
  ok('ask: deterministic phoenix answer', ansText.includes('permission to execute'), ansText.slice(0, 50));
  await page.screenshot({ path: path.join(OUT, '18-ask-panel.png') });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  ok('ask closes on Escape', await page.locator('.jv-ask.open').count() === 0);

  /* explore map */
  await page.getByRole('button', { name: 'EXPLORE', exact: true }).click();
  await page.waitForTimeout(300);
  const exploreLinks = await page.locator('.jv-explore-link').count();
  ok('explore lists all scenes', exploreLinks === 10, `${exploreLinks} links`);
  await page.screenshot({ path: path.join(OUT, '19-explore.png') });
  await page.keyboard.press('Escape');

  /* ask abstains on unknown */
  await page.getByRole('button', { name: 'ASK THE SYSTEM' }).click();
  await page.locator('.jv-ask-form input').fill('what is your favorite color and salary history');
  await page.locator('.jv-ask-form button[type="submit"]').click();
  await page.waitForTimeout(300);
  ok('ask abstains on unknown', (await page.locator('.jv-ask-none').innerText()).includes('abstains'));
  await page.keyboard.press('Escape');

  await page.close();

  /* mobile */
  const m = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  m.on('console', (msg) => msg.type() === 'error' && errs.push(`[mobile] ${msg.text()}`));
  m.on('pageerror', (e) => errs.push(`[mobile pageerror] ${e.message}`));
  await m.goto(`${BASE}/journey`, { waitUntil: 'networkidle' });
  await m.waitForTimeout(600);
  ok('mobile: graph rail hidden', await m.locator('.jv-graph-rail').isVisible() === false);
  await m.locator('#jv-decision-systems').scrollIntoViewIfNeeded();
  await m.waitForTimeout(500);
  await m.getByRole('button', { name: 'RUN LIVE CANDIDATES' }).tap();
  await m.waitForTimeout(2400);
  ok('mobile: abstain works', await m.locator('.jv-cand[data-stamp="ABSTAIN"]').count() === 5);
  await m.screenshot({ path: path.join(OUT, '20-mobile-lab.png') });
  await m.locator('#jv-final').scrollIntoViewIfNeeded();
  await m.waitForTimeout(400);
  await m.screenshot({ path: path.join(OUT, '21-mobile-final.png') });
  await m.close();

  /* resume page */
  const r = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  const resp = await r.goto(`${BASE}/resume`, { waitUntil: 'networkidle' });
  ok('resume: 200', resp.status() === 200);
  ok('resume: employer list', (await r.locator('.r-note').first().innerText()).includes('SnappMarket'));
  await r.screenshot({ path: path.join(OUT, '22-resume.png') });
  await r.close();

  /* seo */
  const seo = await browser.newPage();
  const resp2 = await seo.goto(`${BASE}/journey`, { waitUntil: 'domcontentloaded' });
  ok('journey: 200', resp2.status() === 200);
  const title = await seo.title();
  ok('journey: seo title', title.includes('The Convergence'));
  const h2Count = await seo.locator('.jv-scene h2, .jv-theme').count();
  ok('journey: semantic headings SSR', h2Count >= 10, `${h2Count} headings`);
  const html = await seo.content();
  ok('journey: SSR contains thesis', html.includes('deeper layers') || html.includes('one layer deeper'));
  ok('journey: SSR contains ledger verdict', html.includes('MAJOR LEARNING'));
  await seo.close();

  await browser.close();

  console.log('');
  if (errs.length) {
    console.log('CONSOLE ERRORS:');
    errs.forEach((e) => console.log('  ' + e));
  } else {
    console.log('no console errors');
  }
  if (failures > 0 || errs.length) {
    console.log(`FAILED: ${failures} assertion(s), ${errs.length} console error(s)`);
    process.exit(1);
  }
  console.log('ALL JOURNEY VERIFICATIONS PASSED');
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
