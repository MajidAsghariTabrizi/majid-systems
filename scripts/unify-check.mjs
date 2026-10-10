/** Unification checks: homepage six-beat structure, nav, dedup, continuity. */
import { chromium } from 'playwright';
import path from 'node:path';

const BASE = process.env.CAPTURE_BASE ?? 'http://127.0.0.1:3219';
const OUT = path.resolve('captures-unify');
let failures = 0;
const errs = [];
const ok = (n, c, d = '') => { console.log(`${c ? '✔' : '✖'} ${n}${d ? ` — ${d}` : ''}`); if (!c) failures++; };

const run = async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const html = await page.content();

  /* six beats, in order */
  const beats = ['.q-hero', '#simulator', '#problem', '#operating-model', '#learning', '#proof', '#method', '.q-final'];
  for (const b of beats) ok(`beat ${b} present`, (await page.locator(b).count()) >= 1);

  /* removed sections are gone */
  for (const gone of ['#latency-definition', '.q-signature', '#changes', '#restructuring', '#use-cases', '#founder']) {
    ok(`removed ${gone}`, (await page.locator(gone).count()) === 0);
  }

  /* signature question appears exactly once in visible text (not RSC payload) */
  const bodyText = await page.locator('body').innerText();
  const qCount = (bodyText.match(/founded today/g) ?? []).length;
  ok('signature question exactly once', qCount === 1, `${qCount}×`);

  /* thesis sentence not repeated verbatim */
  const thesis = (bodyText.match(/bottleneck is still the company itself/g) ?? []).length;
  ok('thesis stated once in hero', thesis === 1, `${thesis}×`);

  /* nav is intention-based */
  const nav = await page.locator('.site-header-root .nav a').allInnerTexts();
  ok('nav: System/Method/Proof/Journey/About', nav.slice(0, 5).join('|') === 'System|Method|Proof|Journey|About', nav.join('|'));

  /* system flow: 7 steps with authority gate */
  const flow = await page.locator('.loop-step .loop-step-label').allInnerTexts();
  ok('flow: SIGNAL→LEARN with AUTHORITY CHECK', flow.join('→').includes('SIGNAL→RETRIEVE STATE→DECIDE→AUTHORITY CHECK→ACT→MEASURE→LEARN'), flow.join('→'));
  ok('flow: authority gate styled', (await page.locator('.loop-step-gate').count()) === 1);

  /* signal grammar shared (5 section eyebrows + proof bridge) */
  ok('signal dot on home sections', (await page.locator('.eyebrow.sig').count()) === 6);

  /* proof bridge links to journey + profile */
  const bridge = await page.locator('.proof-bridge').innerText();
  ok('bridge → journey', bridge.includes('journey'), '');
  ok('bridge → profile', (await page.locator('.proof-bridge a[href="/profile"]').count()) === 1);

  /* anchors all resolve */
  for (const a of ['#problem', '#operating-model', '#learning', '#proof', '#method']) {
    ok(`anchor ${a} resolves`, (await page.locator(a).count()) === 1);
  }

  /* homepage is materially shorter */
  const h1 = await page.locator('.q-h2').allInnerTexts();
  ok('six section headers', h1.length === 5, `${h1.length}: ${h1.join(' | ').slice(0, 90)}`);

  await page.screenshot({ path: path.join(OUT, 'unify-home-top.png') });
  await page.locator('#learning').scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT, 'unify-learning.png') });
  await page.locator('#method').scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT, 'unify-method.png') });
  await page.close();

  /* mobile */
  const m = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  m.on('console', (msg) => msg.type() === 'error' && errs.push(`[mobile] ${msg.text()}`));
  m.on('pageerror', (e) => errs.push(`[mobile] ${e.message}`));
  await m.goto(BASE, { waitUntil: 'networkidle' });
  await m.locator('#problem').scrollIntoViewIfNeeded();
  await m.waitForTimeout(400);
  ok('mobile: latency rows stack', (await m.locator('#problem .latency-row').first().isVisible()));
  await m.screenshot({ path: path.join(OUT, 'unify-mobile.png') });
  await m.close();

  /* journey unchanged + kickers carry the same signal grammar */
  const j = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  j.on('pageerror', (e) => errs.push(`[journey] ${e.message}`));
  await j.goto(`${BASE}/journey`, { waitUntil: 'networkidle' });
  await j.waitForTimeout(400);
  const dot = await j.locator('.jv-kicker').first().evaluate((el) => getComputedStyle(el, '::before').width);
  ok('journey kickers share signal dot', dot !== '' && dot !== 'auto', dot);
  await j.close();

  await browser.close();
  console.log(errs.length ? `CONSOLE ERRORS:\n${errs.join('\n')}` : 'no console errors');
  if (failures || errs.length) { console.log(`FAILED: ${failures} assertions, ${errs.length} errors`); process.exit(1); }
  console.log('ALL UNIFICATION CHECKS PASSED');
};
run().catch((e) => { console.error(e); process.exit(1); });
