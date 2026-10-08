/** Refinement checks: system map clarity + CTA states + motion guards. */
import { chromium } from 'playwright';
import path from 'node:path';

const BASE = process.env.CAPTURE_BASE ?? 'http://127.0.0.1:3219';
const OUT = path.resolve('captures-journey');
let failures = 0;
const errs = [];
const ok = (n, c, d = '') => { console.log(`${c ? '✔' : '✖'} ${n}${d ? ` — ${d}` : ''}`); if (!c) failures++; };

const run = async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto(`${BASE}/journey`, { waitUntil: 'networkidle' });

  /* map is explanatory */
  ok('map: SYSTEM MAP heading', (await page.locator('.jv-map-title').innerText()) === 'SYSTEM MAP');
  ok('map: sublabel', (await page.locator('.jv-map-sub').innerText()).includes('converging into Quantiviq'));
  const legend = await page.locator('.jv-map-legend span').allInnerTexts();
  ok('map: legend 3 states', legend.join('|') === 'Active|Connected|Future layer', legend.join('|'));
  ok('map: progress shows scene 00 at top', (await page.locator('.jv-map-progress-k').innerText()).startsWith('SCENE 00'));

  /* node states distinguishable — sample until the map state is stable */
  await page.locator('#jv-decision-systems').scrollIntoViewIfNeeded();
  const nodeCounts = await page.waitForFunction(
    () => {
      const a = document.querySelectorAll('.jv-g-node.is-active').length;
      const c = document.querySelectorAll('.jv-g-node.is-connected').length;
      const f = document.querySelectorAll('.jv-g-node.is-future').length;
      return a === 1 && c === 4 && f === 3 ? { a, c, f } : false;
    },
    null,
    { timeout: 8000, polling: 250 }
  ).then((r) => r.jsonValue()).catch(() => null);
  const settled = await page.locator('.jv-map-progress-k').innerText();
  ok('map: settles on SCENE 05', settled.startsWith('SCENE 05'), settled);
  const nActive = nodeCounts ? nodeCounts.a : -1;
  const nConnected = nodeCounts ? nodeCounts.c : -1;
  const nFuture = nodeCounts ? nodeCounts.f : -1;
  console.log(`   node states (settled): active=${nActive} connected=${nConnected} future=${nFuture}`);
  ok('map: exactly one active node', nActive === 1);
  ok('map: connected nodes visible', nConnected === 4, `${nConnected}`);
  ok('map: future nodes dashed', nFuture === 3, `${nFuture}`);
  const liveEdges = await page.locator('.jv-g-edge.live').count();
  ok('map: live edge animates', liveEdges >= 1, `${liveEdges} live`);
  ok('map: progress label advanced', (await page.locator('.jv-map-progress-k').innerText()).includes('SCENE 05'));
  const barW = await page.locator('.jv-map-bar i').evaluate((el) => el.style.width);
  ok('map: progress bar filled', parseFloat(barW) > 30, barW);
  await page.screenshot({ path: path.join(OUT, 'after-map-decision-systems.png') });

  /* map navigation works */
  await page.locator('.jv-g-node.is-connected').first().click();
  await page.waitForTimeout(1200);
  const jumped = await page.evaluate(() => Math.round(window.scrollY));
  ok('map: click navigates', jumped > 400, `scrollY=${jumped}`);

  /* CTA hierarchy + states */
  await page.locator('#jv-final').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  const primBg = await page.locator('.jv-cta.primary').evaluate((el) => getComputedStyle(el).backgroundImage);
  ok('cta: primary is filled/gradient', primBg.includes('gradient'), primBg.slice(0, 40));
  ok('cta: secondary warm outline', (await page.locator('.jv-cta.secondary').evaluate((el) => getComputedStyle(el).color)) !== (await page.locator('.jv-cta.tertiary').evaluate((el) => getComputedStyle(el).color)));
  ok('cta: arrows present', (await page.locator('.jv-cta-arrow').count()) === 3);
  const primWeight = await page.locator('.jv-cta.primary').evaluate((el) => getComputedStyle(el).fontWeight);
  ok('cta: confident weight', parseInt(primWeight) >= 600, primWeight);
  await page.locator('.jv-cta.primary').hover();
  await page.waitForTimeout(300);
  const lifted = await page.locator('.jv-cta.primary').evaluate((el) => getComputedStyle(el).transform);
  ok('cta: hover lift', lifted.includes('matrix'), lifted);
  await page.screenshot({ path: path.join(OUT, 'after-final-ctas.png') });

  /* scene reveal motion: seen scene visible, never-visited scene starts hidden */
  await page.locator('#jv-technology').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  ok('motion: scene gets .seen', (await page.locator('#jv-technology.seen').count()) === 1);
  ok('motion: seen headline visible', (await page.locator('#jv-technology .jv-headline').evaluate((el) => getComputedStyle(el).opacity)) === '1');
  const unseenOpacity = await page.evaluate(() => {
    const el = document.querySelector('#jv-harness .jv-headline');
    return el ? getComputedStyle(el).opacity : 'missing';
  });
  ok('motion: unseen scene starts hidden', parseFloat(unseenOpacity) < 0.5, unseenOpacity);
  await page.screenshot({ path: path.join(OUT, 'after-technology.png') });

  await page.close();

  /* reduced motion: everything visible instantly, no animation */
  const rm = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await rm.goto(`${BASE}/journey`, { waitUntil: 'networkidle' });
  await rm.locator('#jv-technology').scrollIntoViewIfNeeded();
  await rm.waitForTimeout(200);
  const rmOpacity = await rm.locator('#jv-technology .jv-headline').evaluate((el) => getComputedStyle(el).opacity);
  ok('reduced-motion: content never hidden', rmOpacity === '1', rmOpacity);
  await rm.locator('#jv-decision-systems').scrollIntoViewIfNeeded();
  await rm.waitForTimeout(900);
  const animDur = await rm.locator('.jv-g-edge.live').first().evaluate((el) => {
    const d = getComputedStyle(el).animationDuration;
    return String(parseFloat(d)) + '|' + d;
  });
  ok('reduced-motion: edge flow off', parseFloat(animDur.split('|')[0]) < 0.001, animDur);
  await rm.close();

  await browser.close();
  console.log(errs.length ? `CONSOLE ERRORS:\n${errs.join('\n')}` : 'no console errors');
  if (failures || errs.length) { console.log(`FAILED: ${failures} assertions, ${errs.length} errors`); process.exit(1); }
  console.log('ALL REFINEMENT CHECKS PASSED');
};
run().catch((e) => { console.error(e); process.exit(1); });
