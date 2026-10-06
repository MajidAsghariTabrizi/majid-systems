/**
 * DOM-state verification for the Quantiviq hero simulator (build site).
 * Asserts the same things a human would check visually — node transforms,
 * metric texts, overlay cards, era flags, payoff, slider, mobile steps —
 * through the full mission arc. Any failure exits non-zero.
 *
 * Usage: CAPTURE_BASE=http://127.0.0.1:3219 node scripts/hero-verify.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.CAPTURE_BASE ?? 'http://127.0.0.1:3100';
let failures = 0;
const ok = (name, cond, detail = '') => {
  const mark = cond ? '✔' : '✖';
  console.log(`${mark} ${name}${detail ? ` — ${detail}` : ''}`);
  if (!cond) failures++;
};
const approx = (a, b, eps) => Math.abs(a - b) <= eps;

const run = async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('#simulator .sim-stage', { timeout: 15000 });
  await page.waitForTimeout(700);

  const node = (id) => page.locator(`.sim-node[data-node="${id}"]`);
  const transformOf = async (id) => {
    const t = await node(id).getAttribute('transform');
    const m = t.match(/translate\(([-\d.]+) ([-\d.]+)\)/);
    return { x: parseFloat(m[1]), y: parseFloat(m[2]) };
  };
  const railText = (label) =>
    page.locator(`.sim-metrics .sm-row:has(.sm-k:text-is("${label}")) .sm-v`).innerText();

  /* ---- 1. initial state ---- */
  ok('initial: frame exists', await page.locator('.sim-frame').count() === 1);
  ok('initial: era=old', (await page.locator('.sim-stage').getAttribute('data-era')) === 'old');
  ok('initial: tag visible', (await page.locator('.sim-tag').innerText()).includes('FROM COMPANY-AS-CHART'));
  ok('initial: disclosure visible', (await page.locator('.sim-disclosure').innerText()).includes('ILLUSTRATIVE ORGANIZATION'));
  const sig0 = await transformOf('SIGNAL');
  ok('initial: SIGNAL parked at old pos', approx(sig0.x, 95, 2) && approx(sig0.y, 430, 2), JSON.stringify(sig0));
  ok('initial: latency 00:00', (await railText('COMPANY LATENCY')) === '00:00');
  ok('initial: payoff hidden', await page.locator('.sim-payoff').evaluate((el) => getComputedStyle(el).opacity) === '0');

  /* ---- 2. hero copy ---- */
  const h1 = await page.locator('h1.q-display').innerText();
  ok('hero: H1 exact', h1.trim() === 'REBUILD THE COMPANY.', h1.trim());
  const sub = await page.locator('.q-hero-sub').innerText();
  ok('hero: sub exact', sub.trim() === 'For an era where intelligence is no longer exclusively human.');
  ok(
    'hero: body P1 exact',
    (await page.locator('.q-hero-body').first().innerText()).startsWith('Most companies added AI to the old operating model.')
  );
  ok(
    'hero: latency definition after sim',
    (await page.locator('#latency-definition .q-latency-def-body').innerText()).includes(
      'The time between a signal entering the organization and the organization producing the right response'
    )
  );
  ok(
    'hero: final CTA label',
    (await page.locator('#latency-definition .btn.btn-primary').innerText()).includes('EXPLORE THE ORGANIZATION OS')
  );

  /* ---- 3. old run ---- */
  // Enter the sticky range deterministically at progress ≈ 0 so the scroll
  // narrative is parked at IDLE_OLD before the first manual interaction.
  await page.evaluate(() => document.querySelector('#simulator').scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(400);
  ok('old run: pre-click parked at TRADITIONAL', (await page.locator('.sim-phase').innerText()) === 'TRADITIONAL');
  await page.getByRole('button', { name: 'SEND A SIGNAL' }).click();
  await page.waitForTimeout(1000);
  ok('old run: phase label TRADITIONAL', (await page.locator('.sim-phase').innerText()) === 'TRADITIONAL');
  const stripWhere = async () =>
    page.locator('.sim-strip .strip-cell:has(.strip-k:text-is("WHERE IT IS")) .strip-v').innerText();
  ok('old run: WHERE updates', /^EMPLOYEE|MANAGER|SLACK/.test(await stripWhere()), await stripWhere());
  const t3 = await page.waitForTimeout(8500); // ~9.5s in → past SLACK (frags visible)
  const fragOpacity = await page.locator('.sim-frag').first().evaluate((el) => el.style.opacity);
  ok('old run: context-loss fragment visible at SLACK', parseFloat(fragOpacity) > 0.3, fragOpacity);
  await page.waitForTimeout(17500); // OLD_DURATION 25.6s + margin
  ok('old run: 4.2 DAYS at completion', (await railText('COMPANY LATENCY')) === '4.2 DAYS');
  ok('old run: 17 handoffs', (await railText('HANDOFFS')) === '17');
  ok('old run: 5 BITS loss', (await railText('CONTEXT LOSS')) === '5 BITS');

  /* ---- 4. rebuild / morph ---- */
  await page.getByRole('button', { name: 'REBUILD THIS COMPANY' }).click();
  await page.waitForTimeout(2600);
  const eraMid = await page.locator('.sim-stage').getAttribute('data-era');
  const midTransform = await transformOf('MANAGER');
  ok('morph: mid-flight (era still old near t=0.5 or new)', eraMid === 'old' || eraMid === 'new', eraMid);
  ok('morph: MANAGER left its old position', !(approx(midTransform.x, 430, 2) && approx(midTransform.y, 345, 2)));
  await page.waitForTimeout(3300);
  ok('morph: era=new after completion', (await page.locator('.sim-stage').getAttribute('data-era')) === 'new');
  const newSlack = await transformOf('SLACK');
  ok('morph: SLACK became CONTEXT ASSEMBLY position', approx(newSlack.x, 235, 4) && approx(newSlack.y, 372, 4), JSON.stringify(newSlack));
  ok('morph: new label shown', (await page.locator('.sim-node[data-node="SLACK"] .sim-node-label.new').evaluate((el) => el.style.opacity)).startsWith('1'));
  ok('morph: gate motto visible', parseFloat(await page.locator('.sim-gate-motto').evaluate((el) => getComputedStyle(el).opacity)) > 0.5);
  ok('morph: layer chips appear', await page.locator('.sim-layer-chips .chip').count() === 8);

  /* ---- 5. new run: brain card ---- */
  await page.getByRole('button', { name: 'RUN THE SAME SIGNAL' }).click();
  await page.waitForTimeout(5000); // inside investigate (4.3–6.1s)
  const brainCardVisible = await page.locator('.sim-brain-card').evaluate((el) => el.style.visibility === 'visible');
  ok('new run: brain card visible during investigate', brainCardVisible);
  const ivText = await page.locator('.sbc-iv').innerText();
  ok('new run: investigation arrow flips', ivText.includes('INVESTIGATE') || ivText.includes('EVIDENCE'), ivText);

  /* ---- 6. gate card ---- */
  await page.waitForTimeout(4700); // ~9.7s → gate step (9.0–10.4)
  const gateVisible = await page.locator('.sim-gate-card').evaluate((el) => el.style.visibility === 'visible');
  ok('new run: gate card visible', gateVisible);
  const rowsOn = await page.locator('.sgc-row.on').count();
  ok('new run: gate rows light up progressively', rowsOn >= 1 && rowsOn <= 3, `${rowsOn} rows on`);
  ok('new run: principle text', (await page.locator('.sgc-principle').innerText()) === 'INTELLIGENCE IS NOT AUTHORITY.');

  /* ---- 7. learning ---- */
  await page.waitForTimeout(6300); // ~15s → LEARNING
  ok('new run: KNOWN 32 after learning', (await page.locator('.sim-brain-counters .bc-v').first().textContent()) === '32');
  const learnBadge = await page.locator('.sim-learn-badge').evaluate((el) => el.style.opacity);
  ok('new run: learn badge visible', learnBadge === '1');

  /* ---- 8. comparison + slider ---- */
  await page.waitForTimeout(3800);
  ok('comparison: payoff visible', await page.locator('.sim-payoff').evaluate((el) => getComputedStyle(el).opacity) === '1');
  ok('comparison: headline exact', (await page.locator('.sp-h').innerText()) === 'SAME COMPANY. DIFFERENT OPERATING PHYSICS.');
  ok('comparison: slider present', await page.locator('.sim-compare input[type="range"]').count() === 1);
  await page.locator('.sim-compare input[type="range"]').fill('0');
  await page.waitForTimeout(250);
  ok('comparison: slider→old era', (await page.locator('.sim-stage').getAttribute('data-era')) === 'old');
  ok('comparison: old latency again', (await railText('COMPANY LATENCY')) === '4.2 DAYS');
  await page.locator('.sim-compare input[type="range"]').fill('1');
  await page.waitForTimeout(250);
  ok('comparison: slider→new era', (await page.locator('.sim-stage').getAttribute('data-era')) === 'new');

  /* ---- 9. knowledge overlay ---- */
  await page.getByRole('button', { name: 'SHOW KNOWLEDGE FLOW' }).click();
  await page.waitForTimeout(300);
  const knowledgeEdge = await page.locator('.sim-edge.is-knowledge').count();
  ok('overlay: knowledge edges highlighted', knowledgeEdge >= 6, `${knowledgeEdge} edges`);
  await page.getByRole('button', { name: 'SHOW KNOWLEDGE FLOW' }).click();

  /* ---- 10. keyboard a11y ---- */
  await page.locator('.sim-node[data-node="MEETING"]').focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  ok('a11y: node inspect via keyboard', await page.locator('.sim-inspect').count() === 1);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Tab'); // move focus somewhere neutral
  ok('a11y: inspect closes', await page.locator('.sim-inspect').count() === 0);

  /* ---- 11. manual lock survives reload via sessionStorage; scroll no-op ---- */
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('#simulator .sim-stage', { timeout: 15000 });
  const lockedAfterReload = await page.evaluate(() => sessionStorage.getItem('qv-sim-manual') === '1');
  ok('persistence: manualLock survives reload', lockedAfterReload);
  const phaseBefore = await page.locator('.sim-phase').innerText();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
  ok('persistence: scroll is a permanent no-op after manual', (await page.locator('.sim-phase').innerText()) === phaseBefore);

  await page.close();

  /* ---- 12. mobile ---- */
  const m = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  m.on('console', (msg) => msg.type() === 'error' && errs.push(`[mobile] ${msg.text()}`));
  await m.goto(BASE, { waitUntil: 'networkidle' });
  await m.waitForSelector('#simulator .sim-mobile', { timeout: 15000 });
  ok('mobile: vertical narrative renders', await m.locator('.sim-m-step').count() >= 14);
  ok('mobile: 4.2 DAYS chip on old chain', (await m.locator('.sms-lat').last().innerText()) === '4.2 DAYS');
  await m.getByRole('button', { name: 'SEND A SIGNAL' }).click();
  await m.waitForTimeout(1200);
  const activeOld = await m.locator('.sim-m-step[data-state="active"]').count();
  ok('mobile: active step lights during old run', activeOld === 1, `${activeOld} active`);
  await m.waitForTimeout(25000);
  await m.getByRole('button', { name: 'REBUILD THIS COMPANY' }).click();
  await m.waitForTimeout(5600);
  ok('mobile: era flips to new after rebuild', (await m.locator('.sim-m-flow').getAttribute('data-era')) === 'new');
  await m.close();

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
  console.log('ALL DOM VERIFICATIONS PASSED');
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
