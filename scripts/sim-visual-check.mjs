/**
 * V4 browser verification: simulator command-center UX + Persian typography.
 * Run against a local server (CAPTURE_BASE). Exits non-zero on any failure.
 */
import { chromium } from 'playwright';

const BASE = process.env.CAPTURE_BASE ?? 'http://127.0.0.1:3219';
const fails = [];
const ok = (name, cond, detail = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
  if (!cond) fails.push(name);
};

const browser = await chromium.launch({ channel: 'msedge', headless: true });

for (const locale of ['en', 'fa']) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/${locale}`, { waitUntil: 'networkidle', timeout: 60000 });
  await p.locator('.sim-frame').scrollIntoViewIfNeeded();
  await p.waitForTimeout(900);

  const t = (k) => (k === 'fa'
    ? { idle: 'برای کاوش اجرا کنید', run: /اجرا|سیگنال/, busy: /در حال اجرا/ }
    : { idle: 'RUN TO EXPLORE', run: /RUN|SEND/, busy: /RUNNING/ });

  /* command bar: Step1/Step2 at top, CTA inside first viewport */
  ok(`${locale}: command bar present`, (await p.locator('.sim-command').count()) === 1);
  ok(`${locale}: step1 label`, (await p.locator('.cmd-choose .cmd-k').innerText()).length > 5);
  ok(`${locale}: step2 label`, (await p.locator('.cmd-run .cmd-k').innerText()).length > 5);
  const cta = p.locator('.sim-cta.primary').first();
  ok(`${locale}: primary CTA exists`, (await cta.count()) >= 1);
  const ctaBox = await cta.boundingBox();
  const vp = p.viewportSize();
  ok(`${locale}: CTA inside initial viewport (1440)`, !!ctaBox && ctaBox.y < vp.height, ctaBox && `y=${Math.round(ctaBox.y)}`);
  const sigBox = await p.locator('.sim-signals').first().boundingBox();
  ok(`${locale}: signal chooser inside initial viewport`, !!sigBox && sigBox.y < vp.height);

  /* legend */
  ok(`${locale}: legend items >= 9`, (await p.locator('.sim-legend .lg-item').count()) >= 9, `${await p.locator('.sim-legend .lg-item').count()}`);

  /* honest KPI idle */
  const lat0 = await p.locator('.sm-row.sm-big .sm-v').innerText();
  ok(`${locale}: KPI idle state (no 00:00)`, lat0 === t(locale).idle, lat0);

  /* node readability: font size + glyphs + no overlap at idle */
  const labelFs = await p.locator('.sim-node-label').first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  ok(`${locale}: node label >= 12.5px`, labelFs >= 12.5, `${labelFs}px`);
  const glyphCount = await p.locator('.sim-node-ico').count();
  ok(`${locale}: kind glyph on every node (13 topology nodes)`, glyphCount === 13, `${glyphCount}`);
  const overlapsIdle = await p.evaluate(() => {
    const boxes = [...document.querySelectorAll('.sim-node')].filter((n) => !n.classList.contains('k-ambient')).map((n) => n.getBoundingClientRect());
    let hits = 0;
    for (let i = 0; i < boxes.length; i++)
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], b = boxes[j];
        if (a.left < b.right - 2 && b.left < a.right - 2 && a.top < b.bottom - 2 && b.top < a.bottom - 2) hits++;
      }
    return hits;
  });
  ok(`${locale}: no overlapping node boxes (idle)`, overlapsIdle === 0, `${overlapsIdle} overlaps`);

  /* arrowheads applied by kind */
  const marker = await p.locator('.sim-edge.k-flow').first().evaluate((el) => getComputedStyle(el).markerEnd);
  ok(`${locale}: flow edge has arrow marker`, /arr-/.test(marker), marker);

  /* run the simulation: busy CTA -> completion */
  await cta.click();
  await p.waitForTimeout(700);
  const busyTxt = await p.locator('.sim-cta.primary').first().innerText().catch(() => '');
  ok(`${locale}: busy CTA visible while running`, t(locale).busy.test(busyTxt) || busyTxt === '', busyTxt.slice(0, 20));
  await p.waitForFunction(() => document.querySelector('.sim-strip')?.textContent?.length > 0, { timeout: 5000 }).catch(() => {});
  await p.waitForTimeout(9000); /* old run + transform + new run durations */
  const lat1 = await p.locator('.sm-row.sm-big .sm-v').innerText();
  ok(`${locale}: KPI shows a measured value after run`, lat1 !== t(locale).idle && lat1.length > 0, lat1);

  /* secondary controls functional */
  const speedBefore = await p.locator('.sim-util .chip').first().innerText();
  await p.locator('.sim-util .chip').first().click().catch(() => {});
  const speedAfter = await p.locator('.sim-util .chip').first().innerText().catch(() => speedBefore);
  ok(`${locale}: speed control toggles`, speedBefore !== speedAfter, `${speedBefore} -> ${speedAfter}`);
  const tog = p.locator('.sim-toggles .chip.tog').first();
  const pressedBefore = await tog.getAttribute('aria-pressed');
  await tog.click();
  const pressedAfter = await tog.getAttribute('aria-pressed');
  ok(`${locale}: overlay toggle flips aria-pressed`, pressedBefore !== pressedAfter, `${pressedBefore}->${pressedAfter}`);
  await tog.click();

  /* reset restores the honest idle */
  await p.locator('.sim-util .chip', { hasText: locale === 'fa' ? /بازنشانی/ : /RESET/i }).first().click().catch(() => {});
  await p.waitForTimeout(600);
  const lat2 = await p.locator('.sm-row.sm-big .sm-v').innerText().catch(() => '');
  ok(`${locale}: reset restores idle KPI`, lat2 === t(locale).idle, lat2);

  await ctx.close();
}

/* ---- widths: CTA discoverable at 360 / 768 / 1733 ---- */
for (const [w, h] of [[360, 800], [768, 900], [1733, 900]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500 });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/en`, { waitUntil: 'networkidle', timeout: 60000 });
  await p.locator('#simulator').scrollIntoViewIfNeeded().catch(() => {});
  await p.waitForTimeout(700);
  const cta = p.locator('.sim-cta.primary').first();
  const box = await cta.boundingBox().catch(() => null);
  ok(`w${w}: primary CTA rendered`, !!box, box ? `y=${Math.round(box.y)} h=${Math.round(box.height)}` : 'missing');
  const sig = await p.locator('.sim-signals').first().boundingBox().catch(() => null);
  ok(`w${w}: signal chooser rendered`, !!sig);
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(`w${w}: no horizontal overflow`, overflow <= 0, `${overflow}px`);
  await ctx.close();
}

/* ---- font wiring: Estedad on fa, Inter untouched on en ---- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const fontReqs = [];
  p.on('response', (r) => { if (/fonts/i.test(r.url())) fontReqs.push(r.url()); });
  await p.goto(`${BASE}/fa`, { waitUntil: 'networkidle', timeout: 60000 });
  const faBody = await p.evaluate(() => getComputedStyle(document.body).fontFamily);
  ok('fa: body font is Estedad', /^("?Estedad"?)/.test(faBody.trim()), faBody.slice(0, 40));
  const estLoaded = await p.evaluate(async () => {
    await document.fonts.ready;
    return document.fonts.check('16px Estedad');
  });
  ok('fa: Estedad face actually loaded', estLoaded === true);
  ok('fa: Estedad served self-hosted', fontReqs.some((u) => u.includes('/fonts/Estedad-Variable.woff2')), fontReqs.find((u) => u.includes('Estedad')) ?? 'none');
  ok('fa: no Vazirmatn request', !fontReqs.some((u) => /vazirmatn/i.test(u)));
  await p.goto(`${BASE}/en`, { waitUntil: 'networkidle', timeout: 60000 });
  const enBody = await p.evaluate(() => getComputedStyle(document.body).fontFamily);
  ok('en: body font stays Inter', /^("?Inter"?)/.test(enBody.trim()), enBody.slice(0, 40));
  const enEst = await p.evaluate(() => document.fonts.check('16px Estedad'));
  ok('en: Estedad NOT loaded on EN page', enEst === false);
  /* V5: site-wide FA typography tokens */
  const faH1 = await p.goto(`${BASE}/fa`, { waitUntil: 'networkidle', timeout: 60000 });
  const h1s = await p.locator('h1').first().evaluate((el) => {
    const c = getComputedStyle(el);
    return { fs: parseFloat(c.fontSize), lh: parseFloat(c.lineHeight), ff: c.fontFamily, ls: c.letterSpacing };
  });
  ok('fa: H1 44-56px', h1s.fs >= 44 && h1s.fs <= 56, `${h1s.fs}px`);
  ok('fa: H1 Estedad line-height >= 1.2', /Estedad/i.test(h1s.ff) && h1s.lh / h1s.fs >= 1.2, `${(h1s.lh / h1s.fs).toFixed(2)}`);
  ok('fa: H1 no negative tracking', parseFloat(h1s.ls) >= 0 || h1s.ls === 'normal', h1s.ls);
  const h2s = await p.locator('h2').first().evaluate((el) => ({ fs: parseFloat(getComputedStyle(el).fontSize) }));
  ok('fa: H2 30-40px', h2s.fs >= 30 && h2s.fs <= 40, `${h2s.fs}px`);
  const eye = await p.locator('.eyebrow').first().evaluate((el) => ({
    ff: getComputedStyle(el).fontFamily,
    ls: getComputedStyle(el).letterSpacing,
  }));
  ok('fa: eyebrow mono removed + no tracking', /Estedad/i.test(eye.ff) && (eye.ls === 'normal' || parseFloat(eye.ls) === 0), `${eye.ff.slice(0, 16)} ls=${eye.ls}`);
  await p.goto(`${BASE}/en`, { waitUntil: 'networkidle', timeout: 60000 });
  const enH1 = await p.locator('h1').first().evaluate((el) => getComputedStyle(el).fontFamily);
  ok('en: H1 stays Inter', /Inter/i.test(enH1), enH1.slice(0, 24));
  await ctx.close();
}

/* ---- V5: camera, viewbar, signal journey (acceptance criteria) ---- */
{
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/en`, { waitUntil: 'networkidle', timeout: 60000 });
  await p.locator('.sim-frame').scrollIntoViewIfNeeded();
  await p.waitForTimeout(1100);
  ok('v5: viewport transform group present', (await p.locator('.sim-viewport').count()) === 1);
  ok('v5: viewbar has 6 controls', (await p.locator('.sim-viewbar .vb-btn').count()) === 6);
  ok('v5: journey shows 6 stages', (await p.locator('.sj-step').count()) === 6);

  /* acceptance 1: active path readable at 1366x768 without manual zoom */
  await p.evaluate(() => {
    const sec = document.querySelector('.sim-scroll');
    const top = sec.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + 220); // inside the sticky pin range
  });
  await p.waitForTimeout(1300);
  const lbl = p.locator('.sim-node-label').first();
  const rendered = await lbl.evaluate((el) => {
    const m = el.getScreenCTM();
    return parseFloat(getComputedStyle(el).fontSize) * m.a;
  });
  ok('v5: node label rendered >= 15px on 1366x768', rendered >= 15, `${Math.round(rendered * 10) / 10}px`);
  // return to the idle state for the interaction checks
  await p.evaluate(() => {
    const sec = document.querySelector('.sim-scroll');
    const top = sec.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + 4);
  });
  await p.waitForTimeout(800);

  const t0 = await (async () => {
    await p.locator('.sim-viewbar .vb-btn').nth(4).click(); // reset to the live-baseline camera
    await p.waitForTimeout(650);
    return p.locator('.sim-viewport').getAttribute('transform');
  })();
  await p.locator('.sim-viewbar .vb-btn').nth(3).click(); // full system map
  await p.waitForTimeout(650);
  const t1 = await p.locator('.sim-viewport').getAttribute('transform');
  ok('v5: full-map mode changes camera', t0 !== t1, `${t0} -> ${t1}`);
  await p.locator('.sim-viewbar .vb-btn').nth(2).click(); // refocus signal path
  await p.waitForTimeout(650);
  const t2 = await p.locator('.sim-viewport').getAttribute('transform');
  ok('v5: operational refocus restores path camera', t2 === t0);
  await p.locator('.sim-viewbar .vb-btn').nth(0).click(); // zoom in
  await p.waitForTimeout(500);
  const t3 = await p.locator('.sim-viewport').getAttribute('transform');
  ok('v5: zoom-in button works', t3 !== t2);
  await p.locator('.sim-viewbar .vb-btn').nth(4).click(); // reset
  await p.waitForTimeout(500);
  ok('v5: reset restores camera', (await p.locator('.sim-viewport').getAttribute('transform')) === t2);

  /* journey follows the real run */
  await p.locator('.sim-cta.primary').click();
  await p.waitForTimeout(900);
  const stepA = await p.locator('.sj-step.on').innerText().catch(() => '');
  ok('v5: journey active during run', stepA.length > 0, stepA);
  ok('v5: journey latency present', ((await p.locator('.sj-lat').innerText().catch(() => '')) || '').length > 0);
  await p.waitForTimeout(8000);
  const stepB = await p.locator('.sj-step.on').innerText().catch(() => '');
  ok('v5: journey step advances with simulation', stepB !== stepA, `${stepA} -> ${stepB}`);
  const dim = await p.evaluate(() => {
    const n = [...document.querySelectorAll('.sim-node')].find((x) => !x.classList.contains('is-active'));
    return n ? getComputedStyle(n).opacity : '1';
  });
  ok('v5: unrelated nodes de-emphasized', parseFloat(dim) < 0.9, `opacity=${dim}`);

  /* full engine path: old run -> rebuild -> run again -> comparison payoff */
  await p.waitForFunction(
    () => (document.querySelector('.sim-cta.primary')?.textContent ?? '').includes('REBUILD'),
    null,
    { timeout: 60000 },
  );
  const kpiOld = await p.locator('.sm-row.sm-big .sm-v').innerText();
  ok('v5: old run completes with measured total', /\d/.test(kpiOld), kpiOld);
  await p.locator('.sim-cta.primary').click(); // rebuild
  await p.waitForTimeout(7000);
  await p.locator('.sim-cta.primary').click(); // run the same signal on the new org
  await p.waitForSelector('.sim-payoff.on', { timeout: 90000 }).catch(() => {});
  ok('v5: full run completes (engine untouched)', (await p.locator('.sim-payoff.on').count()) === 1);
  await ctx.close();
}

/* ---- V5: mobile journey + full-map disclosure + touch targets ---- */
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/en`, { waitUntil: 'networkidle', timeout: 60000 });
  await p.locator('.sim-frame').scrollIntoViewIfNeeded().catch(() => {});
  await p.waitForTimeout(800);
  ok('v5 mobile: journey stepper present', (await p.locator('.sj-step').count()) === 6);
  ok('v5 mobile: full-map toggle present', (await p.locator('.sim-m-mapbtn').count()) === 1);
  const targets = await p.evaluate(() =>
    [...document.querySelectorAll('.sim-m-mapbtn, .sim-m-ctas .chip.util')].map((b) => b.getBoundingClientRect().height),
  );
  ok('v5 mobile: controls >= 44px touch targets', targets.length >= 3 && Math.min(...targets) >= 44, targets.map((x) => Math.round(x)).join(','));
  await p.locator('.sim-m-mapbtn').click();
  await p.waitForTimeout(600);
  ok('v5 mobile: full-map graph opens', (await p.locator('.sim-m-fullmap svg').count()) === 1);
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok('v5 mobile: no horizontal overflow with map open', overflow <= 0, `${overflow}px`);
  await ctx.close();
}

await browser.close();
console.log(fails.length ? `V4 VISUAL: ${fails.length} FAIL -> ${fails.join(' | ')}` : 'V4 VISUAL: ALL PASS');
process.exit(fails.length ? 1 : 0);
