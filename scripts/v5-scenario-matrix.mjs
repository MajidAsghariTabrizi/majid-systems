#!/usr/bin/env node
/**
 * v5-scenario-matrix.mjs — four-signal × two-locale regression matrix for the org simulator.
 *
 * What it does
 *   1. Frees port 3220 (kills any current listener), then starts its own production server
 *      `npx next start -H 127.0.0.1 -p 3220` (spawn, stdio ignored) and waits for HTTP 200
 *      on /en (poll every 750ms, max 40 tries).
 *   2. For each of the 4 signals × each locale (en, fa): fresh 1366×768 context on /:locale,
 *      selects the signal chip (EN: matched by label text read from the page; FA: by index
 *      0..3 in the canonical order), clicks the primary CTA, flips speed to 2× right after
 *      the CTA click, waits for the old run to complete (CTA re-enables after RUNNING…;
 *      tolerates a RESTRUCTURING phase label), records big-KPI value / phase chip / WHERE
 *      strip cell, clicks REBUILD, waits 6s for the morph, clicks RUN AGAIN, re-ensures 2×
 *      (only clicks the speed chip if it dropped back to 1× — the built app persists 2×),
 *      and waits up to 90s for `.sim-payoff.on`.
 *   3. Prints a matrix table (signal × locale → oldKpi, oldOk, newOk, phases seen) and exits
 *      non-zero if any of the 8 scenarios fails.
 *   4. Kills the child server in a finally block (taskkill /T on Windows) and re-frees the port.
 *
 * Run:  node scripts/v5-scenario-matrix.mjs        (from the repo root)
 */

import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const HOST = '127.0.0.1';
const PORT = 3220;
const BASE = `http://${HOST}:${PORT}`;
const IS_WIN = process.platform === 'win32';

/** @type {Array<{ id: string, en: string }>} canonical chip order, indexes 0..3 */
const SIGNALS = [
  { id: 'customer-issue', en: 'CUSTOMER ISSUE' },
  { id: 'product-signal', en: 'PRODUCT SIGNAL' },
  { id: 'production-incident', en: 'PRODUCTION INCIDENT' },
  { id: 'revenue-drop', en: 'REVENUE DROP' },
];
const LOCALES = ['en', 'fa'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const firstLine = (m) => String(m ?? '').split('\n')[0].slice(0, 200);

/* ------------------------------------------------------------------ *
 * Port 3220 cleanup — PowerShell first, netstat/taskkill fallback.   *
 * ------------------------------------------------------------------ */
function psKillPort() {
  const script =
    `Get-NetTCPConnection -LocalPort ${PORT} -State Listen -ErrorAction SilentlyContinue | ` +
    `ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }`;
  return new Promise((resolve) => {
    const p = spawn('powershell', ['-NoProfile', '-NonInteractive', '-Command', script], {
      stdio: 'ignore',
      windowsHide: true,
    });
    p.on('error', () => resolve(false));
    p.on('close', (code) => resolve(code === 0));
  });
}

function netstatKillPort() {
  return new Promise((resolve) => {
    const n = spawn('netstat', ['-ano'], { stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true });
    let out = '';
    n.stdout?.on('data', (d) => { out += String(d); });
    n.on('error', () => resolve());
    n.on('close', () => {
      const pids = new Set();
      for (const line of out.split(/\r?\n/)) {
        if (line.includes(`:${PORT} `) && /LISTENING/i.test(line)) {
          const pid = line.trim().split(/\s+/).pop();
          if (/^\d+$/.test(pid)) pids.add(pid);
        }
      }
      for (const pid of pids) {
        spawn('taskkill', ['/F', '/PID', pid], { stdio: 'ignore', windowsHide: true });
      }
      resolve();
    });
  });
}

async function killPortListeners() {
  if (!(await psKillPort())) await netstatKillPort();
  else await netstatKillPort(); // belt and braces: catch anything PS missed
  await sleep(400);
}

/* ------------------------------------------------------------------ *
 * Child production server.                                           *
 * ------------------------------------------------------------------ */
function startServer() {
  const child = spawn('npx', ['next', 'start', '-H', HOST, '-p', String(PORT)], {
    cwd: ROOT,
    stdio: 'ignore',
    shell: IS_WIN, // npx.cmd on Windows needs a shell
    windowsHide: true,
  });
  return child;
}

async function killServer(child) {
  if (!child || child.pid == null) return;
  if (IS_WIN) {
    await new Promise((resolve) => {
      const k = spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
        stdio: 'ignore',
        windowsHide: true,
      });
      k.on('close', resolve);
      k.on('error', resolve);
    });
  } else {
    child.kill('SIGTERM');
  }
  await sleep(500);
}

async function waitUntilReady(server) {
  for (let i = 1; i <= 40; i++) {
    if (server.exitCode !== null) return false; // child died (e.g. port busy / no build)
    try {
      const res = await fetch(`${BASE}/en`, { redirect: 'manual' });
      if (res.status === 200) return true;
    } catch { /* not up yet */ }
    await sleep(750);
  }
  return false;
}

/* ------------------------------------------------------------------ *
 * One scenario: one signal on one locale, fresh browser context.     *
 * ------------------------------------------------------------------ */
async function runScenario(browser, locale, sigIndex, signal) {
  /** @type {any} */
  const rec = {
    locale,
    signal: signal.id,
    chipLabel: '',
    oldKpi: '',
    phaseAtOldComplete: '',
    where: '',
    phasesSeen: [],
    speedOld: '',
    speedNew: '',
    oldOk: false,
    newOk: false,
    errors: [],
    note: '',
    wallS: 0,
  };
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await context.newPage();
  const t0 = Date.now();
  try {
    page.on('console', (m) => { if (m.type() === 'error') rec.errors.push(m.text()); });
    page.on('pageerror', (e) => rec.errors.push(`pageerror: ${e.message}`));

    await page.goto(`${BASE}/${locale}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('.sim-frame', { timeout: 20000 });

    const phaseLoc = page.locator('.sim-phase').first();
    const kpiLoc = page.locator('.sm-row.sm-big .sm-v').first();
    const ctaLoc = page.locator('.sim-cta.primary').first();
    const utilChips = page.locator('.sim-util .chip.util');
    const speedChip = utilChips.first(); // first util chip = speed toggle, last = RESET
    const sigChips = page.locator('.sim-signals .chip.sig');

    const notePhase = async () => {
      const t = (await phaseLoc.innerText().catch(() => '')).trim();
      if (t && rec.phasesSeen[rec.phasesSeen.length - 1] !== t) rec.phasesSeen.push(t);
      return t;
    };

    // Read the signal chip labels from the page (verification + locating).
    const chipCount = await sigChips.count();
    const chipTexts = [];
    for (let i = 0; i < chipCount; i++) chipTexts.push((await sigChips.nth(i).innerText()).trim());

    let chipIdx = sigIndex; // FA: match by index within the canonical order
    if (locale === 'en') {
      const want = signal.en.toUpperCase();
      chipIdx = chipTexts.findIndex((t) => t.toUpperCase() === want);
      if (chipIdx === -1) chipIdx = chipTexts.findIndex((t) => t.toUpperCase().includes(want));
      if (chipIdx === -1) {
        throw new Error(`EN chip label "${signal.en}" not found; page chips: ${JSON.stringify(chipTexts)}`);
      }
    }
    if (chipCount !== 4) rec.note += `expected 4 signal chips, saw ${chipCount};`;
    rec.chipLabel = chipTexts[chipIdx] ?? '';

    const kpiIdle = (await kpiLoc.innerText()).trim();
    await notePhase();

    // 1) Select the signal chip BEFORE the CTA click — chips are disabled while running.
    await sigChips.nth(chipIdx).click({ timeout: 15000 });

    // 2) Start the old run.
    await ctaLoc.click({ timeout: 15000 });

    // 3) Speed to 2× right after the CTA click (halves wall time).
    const speedOn0 = await speedChip.evaluate((el) => el.classList.contains('on'));
    if (!speedOn0) {
      try { await speedChip.click({ timeout: 5000 }); rec.speedOld = '2x'; }
      catch (e) { rec.speedOld = 'click-failed'; rec.note += `speed-old: ${firstLine(e.message)};`; }
    } else {
      rec.speedOld = 'already-2x';
    }

    // 4) Wait until the run actually started (CTA flips to RUNNING… disabled), then until
    //    the old run completes: CTA re-enables (OLD_COMPLETE) — or a RESTRUCTURING phase
    //    label shows up, whichever the build uses.
    await page.waitForFunction(
      () => { const c = document.querySelector('.sim-cta.primary'); return !!c && c.disabled; },
      null,
      { timeout: 15000, polling: 200 },
    );
    await page.waitForFunction(
      () => {
        const c = document.querySelector('.sim-cta.primary');
        const ph = document.querySelector('.sim-phase');
        const ctaReady = !!c && !c.disabled && !/RUNNING/i.test(c.textContent || '');
        const restructuring = !!ph && /RESTRUCTUR/i.test(ph.innerText || '');
        return ctaReady || restructuring;
      },
      null,
      { timeout: 60000, polling: 250 },
    );

    rec.phaseAtOldComplete = await notePhase();
    rec.oldKpi = (await kpiLoc.innerText()).trim();
    rec.where = (await page.locator('.sim-strip .strip-cell').nth(1).locator('.strip-v')
      .innerText().catch(() => '')).trim();
    rec.oldOk = rec.oldKpi.length > 0 && rec.oldKpi !== kpiIdle;

    // 5) REBUILD ORGANIZATION → morph (~4s at 1×, less at 2×).
    await ctaLoc.click({ timeout: 15000 });
    await page.waitForTimeout(6000);
    await notePhase();
    await page.waitForFunction(
      () => { const c = document.querySelector('.sim-cta.primary'); return !!c && !c.disabled; },
      null,
      { timeout: 30000, polling: 200 },
    );
    await notePhase(); // expect the AI-NATIVE era label here

    // 6) RUN AGAIN — run the same signal through the AI-native org.
    await ctaLoc.click({ timeout: 15000 });

    // Re-ensure 2× for the new run: the built app persists 2× through the rebuild, so only
    // click when the toggle is actually back at 1× (clicking a live 2× would slow us down).
    const speedOn1 = await speedChip.evaluate((el) => el.classList.contains('on'));
    if (!speedOn1) {
      try { await speedChip.click({ timeout: 5000 }); rec.speedNew = '2x'; }
      catch (e) { rec.speedNew = 'click-failed'; rec.note += `speed-new: ${firstLine(e.message)};`; }
    } else {
      rec.speedNew = 'still-2x';
    }

    // 7) Final comparison payoff.
    await page.waitForSelector('.sim-payoff.on', { timeout: 90000 });
    rec.newOk = true;
    await notePhase();
  } catch (e) {
    rec.note += `error: ${firstLine(e && e.message ? e.message : e)};`;
    try {
      const ph = (await page.locator('.sim-phase').first().innerText({ timeout: 2000 })).trim();
      if (ph && rec.phasesSeen[rec.phasesSeen.length - 1] !== ph) rec.phasesSeen.push(ph);
    } catch { /* page may be gone */ }
  } finally {
    rec.wallS = Number(((Date.now() - t0) / 1000).toFixed(1));
    await context.close().catch(() => {});
  }
  return rec;
}

/* ------------------------------------------------------------------ *
 * Report.                                                            *
 * ------------------------------------------------------------------ */
function printMatrix(results) {
  const vis = (b) => (b ? 'PASS' : 'FAIL');
  console.log('\n================ ORG SIMULATOR — v5 SCENARIO MATRIX ================');
  console.log(
    'SIGNAL'.padEnd(20) + 'LOC'.padEnd(5) + 'OLD KPI'.padEnd(18) + 'WHERE'.padEnd(14) +
    'OLD'.padEnd(6) + 'NEW'.padEnd(6) + 'WALL'.padEnd(7) + 'PHASES SEEN',
  );
  console.log('-'.repeat(110));
  for (const r of results) {
    console.log(
      r.signal.padEnd(20) + r.locale.padEnd(5) + r.oldKpi.padEnd(18) + r.where.padEnd(14) +
      vis(r.oldOk).padEnd(6) + vis(r.newOk).padEnd(6) + (r.wallS + 's').padEnd(7) +
      (r.phasesSeen.join(' → ') || '(none)'),
    );
  }
  console.log('-'.repeat(110));
  for (const r of results) {
    const extras = [];
    if (r.chipLabel) extras.push(`chip="${r.chipLabel}"`);
    extras.push(`phase@old="${r.phaseAtOldComplete}"`, `speed=${r.speedOld}/${r.speedNew}`);
    if (r.errors.length) extras.push(`consoleErrors=${r.errors.length}`);
    if (r.note) extras.push(`note: ${r.note}`);
    console.log(`[${r.signal} / ${r.locale}] oldOk=${r.oldOk} newOk=${r.newOk} — ${extras.join(' | ')}`);
    const uniqErrs = [...new Set(r.errors)].slice(0, 3);
    for (const e of uniqErrs) console.log(`    console error: ${e.slice(0, 220)}`);
  }
  const passed = results.filter((r) => r.oldOk && r.newOk).length;
  console.log(`\nRESULT: ${passed}/${results.length} scenarios passed`);
}

/* ------------------------------------------------------------------ */
async function main() {
  console.log(`[v5-matrix] repo: ${ROOT}`);
  console.log('[v5-matrix] freeing port ' + PORT + '…');
  await killPortListeners();

  const server = startServer();
  let browser = null;
  try {
    const ready = await waitUntilReady(server);
    if (!ready) {
      throw new Error(`production server not ready on ${BASE} (40 polls); ` +
        `is there a valid .next build? child exitCode=${server.exitCode}`);
    }
    console.log(`[v5-matrix] server ready: ${BASE}/en`);

    browser = await chromium.launch({ channel: 'msedge' });
    const results = [];
    for (const locale of LOCALES) {
      for (let i = 0; i < SIGNALS.length; i++) {
        const sig = SIGNALS[i];
        process.stdout.write(`[v5-matrix] scenario ${sig.id} / ${locale} … running\n`);
        const rec = await runScenario(browser, locale, i, sig);
        results.push(rec);
        console.log(
          `[v5-matrix] scenario ${sig.id} / ${locale} -> oldOk=${rec.oldOk} newOk=${rec.newOk} ` +
          `kpi="${rec.oldKpi}" phases=[${rec.phasesSeen.join(' > ')}] (${rec.wallS}s)`,
        );
      }
    }

    printMatrix(results);
    const failed = results.filter((r) => !(r.oldOk && r.newOk));
    process.exitCode = failed.length > 0 ? 1 : 0;
  } catch (e) {
    console.error('[v5-matrix] FATAL:', (e && e.stack) || e);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close().catch(() => {});
    console.log('[v5-matrix] stopping child server…');
    await killServer(server);
    await killPortListeners();
    console.log('[v5-matrix] done.');
  }
}

main();
