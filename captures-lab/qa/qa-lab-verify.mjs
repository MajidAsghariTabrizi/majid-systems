/**
 * QA browser verification for the DEPLOYED lab (read-only, evidence-collecting).
 * Modeled on scripts/lab-shots.mjs: channel msedge, headless, waitUntil 'load'.
 * Records every check as PASS/FAIL instead of throwing, so one failure cannot
 * mask the rest. Screenshots + qa-results.json land in captures-lab/qa/.
 */
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const BASE = 'https://quantiviq.xyz';
const OUT = path.resolve('captures-lab', 'qa');
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const failures = [];
function record(check, pass, detail) {
  results.push({ check, pass, detail: String(detail) });
  if (!pass) failures.push(`${check} — ${detail}`);
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${check} — ${detail}`);
}

const browser = await chromium.launch({ channel: 'msedge', headless: true });

async function passLocale(locale, viewport, mobile, label) {
  const ctx = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile });
  const p = await ctx.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  p.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)); });
  p.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 200)));

  await p.goto(`${BASE}/${locale}/lab`, { waitUntil: 'load', timeout: 90000 });
  await p.waitForSelector('.lab-app', { timeout: 60000 });
  await p.waitForTimeout(1500); // snapshot decompress + render

  const cnt = (sel) => p.locator(sel).count();
  const estat = await cnt('.lab-estat');
  record(`${locale}/${label}: .lab-estat stat cards == 6`, estat === 6, `count=${estat}`);
  const topo = await cnt('.lab-topo-node');
  record(`${locale}/${label}: .lab-topo-node >= 20`, topo >= 20, `count=${topo}`);
  const dots = await cnt('.lab-replay-dots button');
  record(`${locale}/${label}: .lab-replay-dots buttons == 10`, dots === 10, `count=${dots}`);
  const matrix = await cnt('.lab-matrix li');
  record(`${locale}/${label}: .lab-matrix li == 11`, matrix === 11, `count=${matrix}`);
  const panels = await cnt('.lab-experiments .lab-panel');
  record(`${locale}/${label}: experiment panels == 5`, panels === 5, `count=${panels}`);

  const ov = await p.evaluate(() => {
    const d = document.documentElement;
    return { scrollW: d.scrollWidth, clientW: d.clientWidth, bodyScrollW: document.body.scrollWidth };
  });
  record(
    `${locale}/${label}: no horizontal overflow @${viewport.width}px`,
    ov.scrollW - ov.clientW <= 1,
    `scrollW=${ov.scrollW} clientW=${ov.clientW} bodyScrollW=${ov.bodyScrollW}`
  );

  await p.screenshot({ path: path.join(OUT, `${locale}-${label}-qa-hero.png`) });

  if (label === 'desktop') {
    // Replay: restart to scene 0, pause auto-advance, then step Next 8x -> outcome (scene idx 8)
    await p.locator('#replay').scrollIntoViewIfNeeded();
    await p.waitForTimeout(400);
    const btns = p.locator('.lab-replay-btns button');
    await btns.nth(3).click().catch(() => {}); // restart
    await p.locator('.lab-replay-play').click().catch(() => {}); // pause
    for (let i = 0; i < 8; i++) {
      await btns.nth(2).click().catch(() => {}); // next scene
      await p.waitForTimeout(220);
    }
    const scene = await p.locator('.lab-replay-stage').getAttribute('data-scene');
    record(`${locale}: replay Next-scene advances to outcome scene`, scene === 'outcome', `data-scene=${scene}`);
    const yText = ((await p.locator('.lab-rv-y').textContent().catch(() => '')) || '').trim();
    record(`${locale}: replay outcome scene shows bps value`, /[+-]?\d+(\.\d+)?\s?bps/.test(yText), `text="${yText}"`);
    await p.screenshot({ path: path.join(OUT, `${locale}-qa-replay-outcome.png`) });

    // Live Laboratory tab toggles + provenance age
    const liveTab = p.getByRole('tab', { name: locale === 'fa' ? 'آزمایشگاه زنده' : 'Live Laboratory' });
    const liveTabCount = await liveTab.count();
    record(`${locale}: Live Laboratory tab (role=tab) present`, liveTabCount === 1, `count=${liveTabCount}`);
    if (liveTabCount) {
      await liveTab.click().catch(() => {});
      await p.waitForTimeout(900);
      const prov = ((await p.locator('.lab-provenance').textContent().catch(() => '')) || '').replace(/\s+/g, ' ');
      record(`${locale}: .lab-provenance shows snapshot age after Live toggle`, /\d+(\.\d+)?h/.test(prov), `prov="${prov.slice(0, 160)}"`);
      await p.screenshot({ path: path.join(OUT, `${locale}-qa-live-mode.png`) });
    }
  }

  if (locale === 'fa') {
    const dir = await p.evaluate(() => document.documentElement.getAttribute('dir'));
    record(`fa/${label}: documentElement dir == rtl`, dir === 'rtl', `dir=${dir}`);
  }

  record(`${locale}/${label}: zero pageerror events`, pageErrors.length === 0, pageErrors.join(' | ') || 'none');
  record(`${locale}/${label}: zero console errors`, consoleErrors.length === 0, consoleErrors.join(' | ') || 'none');

  // Supplementary resilience probe: bogus artifact fetch must not disturb the rendered lab
  if (locale === 'en' && label === 'desktop') {
    const bogus = await p.evaluate(async () => {
      const r = await fetch('/lab/nope.labpack');
      return { status: r.status, ok: r.ok };
    });
    const stillApp = await p.locator('.lab-app').count();
    record('supplementary: fetch /lab/nope.labpack -> 404, lab stays rendered', bogus.status === 404 && stillApp === 1, JSON.stringify(bogus) + ` lab-app=${stillApp}`);
  }

  await ctx.close();
}

await passLocale('en', { width: 1366, height: 900 }, false, 'desktop');
await passLocale('fa', { width: 1366, height: 900 }, false, 'desktop');
await passLocale('en', { width: 390, height: 844 }, true, 'mobile');
await passLocale('fa', { width: 390, height: 844 }, true, 'mobile');

await browser.close();
fs.writeFileSync(path.join(OUT, 'qa-results.json'), JSON.stringify({ base: BASE, at: new Date().toISOString(), results, failures }, null, 2));
console.log(`\nTOTAL ${results.length} checks, FAILED ${failures.length}`);
process.exitCode = failures.length ? 1 : 0;
