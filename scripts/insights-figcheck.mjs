#!/usr/bin/env node
/**
 * insights-figcheck.mjs — figure/image visual-regression suite.
 * Catches what page-level overflow checks miss, at the ELEMENT level:
 *   1. hero image extends outside its container (clipped/misaligned)
 *   2. figure SVG extends outside its figure card
 *   3. figcaption overlaps the SVG or escapes the figure card
 *   4. SVG content drawn outside its viewBox (clipped at render — the
 *      2026-10 blank-line regression class)
 *   5. SVG source rendered as a code block (the literal regression:
 *      markdown blank lines inside <figure> split the HTML block)
 *   6. loose </svg>/figcaption outside any figure
 *   7. aspect-ratio distortion: rendered ratio vs viewBox ratio
 * Runs against BOTH editions (en, fa) at 390 / 768 / 1440.
 * Usage: CAPTURE_BASE=http://127.0.0.1:3219 node scripts/insights-figcheck.mjs
 *        BASE=https://quantiviq.xyz node scripts/insights-figcheck.mjs --prod
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE ?? process.env.CAPTURE_BASE ?? 'http://127.0.0.1:3219';
const WIDTHS = [390, 768, 1440];
const browser = await chromium.launch({ channel: 'msedge', headless: true });

let pass = 0, fail = 0;
const fails = [];
const check = (name, ok, detail = '') => {
  if (ok) pass++;
  else { fail++; fails.push(`${name}${detail ? ` — ${detail}` : ''}`); console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`); }
};

for (const loc of ['en', 'fa']) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/${loc}/insights`, { waitUntil: 'networkidle', timeout: 90000 });
  const slugs = await page.evaluate((l) =>
    [...new Set([...document.querySelectorAll(`a[href^="/${l}/insights/"]`)].map((a) => a.getAttribute('href')))]
      .filter((h) => !/methodology|author|topics/.test(h))
      .map((h) => h.replace(`/${l}/insights/`, '')), loc);
  check(`${loc}: index lists 20 articles`, slugs.length === 20, `got ${slugs.length}`);
  await ctx.close();

  for (const slug of slugs) {
    for (const w of WIDTHS) {
      const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
      const page = await ctx.newPage();
      try {
        await page.goto(`${BASE}/${loc}/insights/${slug}`, { waitUntil: 'networkidle', timeout: 90000 });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(150);
        const r = await page.evaluate(() => {
          const res = { issues: [] };
          const contained = (inner, outer, pad = 1) =>
            inner.left >= outer.left - pad && inner.right <= outer.right + pad &&
            inner.top >= outer.top - pad && inner.bottom <= outer.bottom + pad;
          const overlap = (a, b) => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;

          // 1. hero image
          const heroImg = document.querySelector('.ins-hero img');
          if (heroImg) {
            // a broken image (e.g. XML-invalid SVG served as image/svg+xml)
            // still reserves its aspect box but never paints — naturalWidth
            // stays 0. Containment alone would pass; assert the load too.
            if (!heroImg.complete || heroImg.naturalWidth === 0) res.issues.push('hero-img-failed-to-load');
            const img = heroImg.getBoundingClientRect();
            const box = heroImg.parentElement.getBoundingClientRect();
            if (!contained(img, box)) res.issues.push(`hero-img-outside-container`);
            const boxAR = img.width / img.height;
            if (boxAR < 1.6 || boxAR > 2.0) res.issues.push(`hero-aspect-${boxAR.toFixed(2)}`);
          } else res.issues.push('hero-img-missing');

          // 2-7. inline figures
          const prose = document.querySelector('.ins-prose');
          if (!prose) { res.issues.push('no-prose'); return res; }
          const figs = prose.querySelectorAll('figure');
          figs.forEach((fig, i) => {
            const fr = fig.getBoundingClientRect();
            if (fig.scrollWidth > fig.clientWidth + 1) res.issues.push(`fig${i}-scroll-overflow`);
            const svg = fig.querySelector('svg');
            const cap = fig.querySelector('figcaption');
            if (!svg) { res.issues.push(`fig${i}-no-svg`); return; }
            const sr = svg.getBoundingClientRect();
            if (!contained(sr, fr)) res.issues.push(`fig${i}-svg-outside-card`);
            const vb = (svg.getAttribute('viewBox') || '').split(/\s+/).map(Number);
            if (vb.length !== 4 || vb.some(Number.isNaN)) { res.issues.push(`fig${i}-no-viewbox`); return; }
            const [, , vw, vh] = vb;
            const renderRatio = sr.width / sr.height;
            const vbRatio = vw / vh;
            if (Math.abs(renderRatio - vbRatio) > 0.05 * vbRatio) res.issues.push(`fig${i}-aspect-distorted(${renderRatio.toFixed(2)}vs${vbRatio.toFixed(2)})`);
            // 4. content clipped at the viewBox edge (transform-aware, in viewBox units)
            const sx = vw / sr.width, sy = vh / sr.height;
            let clipped = 0;
            svg.querySelectorAll('rect,circle,ellipse,line,polyline,polygon,path,text,image').forEach((el) => {
              const st = getComputedStyle(el);
              if (st.display === 'none' || st.visibility === 'hidden') return;
              const er = el.getBoundingClientRect();
              if (!er.width || !er.height) return;
              const x1 = (er.left - sr.left) * sx, y1 = (er.top - sr.top) * sy;
              const x2 = (er.right - sr.left) * sx, y2 = (er.bottom - sr.top) * sy;
              if (x1 < -1 || y1 < -1 || x2 > vw + 1 || y2 > vh + 1) clipped++;
            });
            if (clipped > 0) res.issues.push(`fig${i}-content-clipped(${clipped})`);
            // 3. caption
            if (cap) {
              const cr = cap.getBoundingClientRect();
              if (!contained(cr, fr)) res.issues.push(`fig${i}-caption-outside-card`);
              if (overlap(cr, sr)) res.issues.push(`fig${i}-caption-overlaps-svg`);
            } else res.issues.push(`fig${i}-no-caption`);
          });
          // 5. SVG source rendered as code (the 2026-10 regression signature)
          const svgAsCode = [...prose.querySelectorAll('code, pre')].filter((c) => /<(text|rect|path)\s/.test(c.textContent)).length;
          if (svgAsCode > 0) res.issues.push(`svg-source-as-code(${svgAsCode})`);
          // 6. loose svg / figcaption outside figures
          const looseSvg = [...prose.querySelectorAll('svg')].filter((s) => !s.closest('figure')).length;
          const looseCap = [...prose.querySelectorAll('figcaption')].filter((c) => !c.closest('figure')).length;
          if (looseSvg > 0) res.issues.push(`loose-svg(${looseSvg})`);
          if (looseCap > 0) res.issues.push(`loose-figcaption(${looseCap})`);
          return res;
        });
        check(`${loc}/${slug}@${w}`, r.issues.length === 0, r.issues.join(', '));
      } finally {
        await ctx.close();
      }
    }
  }
}
await browser.close();
console.log(`\ninsights-figcheck: ${pass} passed, ${fail} failed (${BASE})`);
if (fail > 0) { fails.forEach((f) => console.log(`  - ${f}`)); process.exit(1); }
