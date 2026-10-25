/* Exact SVG content-clip probe v2: maps every visible SVG descendant's
 * getBoundingClientRect() into viewBox units (transform-aware) and reports
 * geometry that falls outside the viewBox — i.e., content clipped at render. */
import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'http://127.0.0.1:3219';
const LOC = process.argv[3] ?? 'en';
const SLUGS = process.argv[4] ? process.argv[4].split(',') : null;
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

if (!SLUGS) {
  // discover all slugs from the index
  await page.goto(`${BASE}/${LOC}/insights`, { waitUntil: 'networkidle', timeout: 90000 });
  const slugs = await page.evaluate((l) =>
    [...new Set([...document.querySelectorAll(`a[href^="/${l}/insights/"]`)].map((a) => a.getAttribute('href')))]
      .filter((h) => !/methodology|author|topics/.test(h))
      .map((h) => h.replace(`/${l}/insights/`, '')), LOC);
  await runAll(slugs);
} else {
  await runAll(SLUGS);
}

async function runAll(slugs) {
  let figsTotal = 0, figsBad = 0;
  for (const slug of slugs) {
    await page.goto(`${BASE}/${LOC}/insights/${slug}`, { waitUntil: 'networkidle', timeout: 90000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(250);
    const figs = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('.ins-prose figure svg').forEach((svg, i) => {
        const vb = (svg.getAttribute('viewBox') || '').split(/\s+/).map(Number);
        if (vb.length !== 4 || vb.some(isNaN)) { out.push({ fig: i, err: 'no viewBox' }); return; }
        const [, , vw, vh] = vb;
        const sr = svg.getBoundingClientRect();
        if (!sr.width || !sr.height) { out.push({ fig: i, err: 'zero render size' }); return; }
        const sx = vw / sr.width, sy = vh / sr.height;
        const bad = [];
        svg.querySelectorAll('*').forEach((el) => {
          if (! /^(RECT|CIRCLE|ELLIPSE|LINE|POLYLINE|POLYGON|PATH|TEXT|IMAGE)$/.test(el.tagName)) return;
          const st = getComputedStyle(el);
          if (st.display === 'none' || st.visibility === 'hidden' || parseFloat(st.opacity) === 0) return;
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height) return;
          const x = (r.left - sr.left) * sx, y = (r.top - sr.top) * sy;
          const rgt = (r.right - sr.left) * sx, bot = (r.bottom - sr.top) * sy;
          if (x < -1 || y < -1 || rgt > vw + 1 || bot > vh + 1) {
            bad.push({ tag: el.tagName.toLowerCase(), x: Math.round(x), y: Math.round(y), r: Math.round(rgt), b: Math.round(bot), text: (el.textContent || '').trim().slice(0, 26) });
          }
        });
        out.push({ fig: i, vw, vh, badCount: bad.length, bad: bad.slice(0, 5) });
      });
      return out;
    });
    const bad = figs.filter((f) => f.badCount > 0 || f.err);
    figsTotal += figs.length; figsBad += bad.length;
    console.log(`${LOC}/${slug}: ${figs.length} fig${figs.length === 1 ? '' : 's'}${bad.length ? `  <-- ${bad.length} PROBLEM` : ''}`);
    for (const b of bad) console.log('    ' + JSON.stringify(b));
  }
  console.log(`\nTOTAL ${LOC}: ${figsTotal} figures, ${figsBad} with problems`);
}
await browser.close();
