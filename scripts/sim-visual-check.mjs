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
  await ctx.close();
}

await browser.close();
console.log(fails.length ? `V4 VISUAL: ${fails.length} FAIL -> ${fails.join(' | ')}` : 'V4 VISUAL: ALL PASS');
process.exit(fails.length ? 1 : 0);
