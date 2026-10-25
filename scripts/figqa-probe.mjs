/* DOM-level visual QA probe: EN vs FA article image layout.
 * Measures hero img, inline SVG figures, figcaptions, containers:
 * containment (clipping), sibling overlap, viewBox proportionality. */
import { chromium } from 'playwright';

const BASE = process.env.PROD ? 'https://quantiviq.xyz' : 'http://127.0.0.1:3219';
const SLUG = 'ai-adoption-is-not-ai-transformation';
const OUT = 'captures-figqa';
import fs from 'node:fs';
fs.mkdirSync(OUT, { recursive: true });

const widths = [390, 768, 1024, 1440];
const browser = await chromium.launch({ channel: 'msedge', headless: true });

for (const loc of ['en', 'fa']) {
  for (const w of widths) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/${loc}/insights/${SLUG}`, { waitUntil: 'networkidle', timeout: 90000 });
    const r = await page.evaluate(() => {
      const out = { issues: [] };
      const in_ = (inner, outer, pad = 0.5) =>
        inner.left >= outer.left - pad && inner.right <= outer.right + pad &&
        inner.top >= outer.top - pad && inner.bottom <= outer.bottom + pad;
      const overlaps = (a, b) => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;

      // hero
      const heroImg = document.querySelector('.ins-hero img, .ins-hero-section img');
      if (heroImg) {
        const img = heroImg.getBoundingClientRect();
        const box = heroImg.parentElement.getBoundingClientRect();
        out.hero = { imgW: Math.round(img.width), imgH: Math.round(img.height), boxW: Math.round(box.width), contained: in_(img, box), natural: heroImg.naturalWidth + 'x' + heroImg.naturalHeight };
        if (!in_(img, box)) out.issues.push(`hero img outside container: img ${Math.round(img.left)}..${Math.round(img.right)} vs box ${Math.round(box.left)}..${Math.round(box.right)}`);
      }
      // inline figures
      out.figures = [];
      document.querySelectorAll('.ins-prose figure').forEach((fig, i) => {
        const svg = fig.querySelector('svg');
        const cap = fig.querySelector('figcaption');
        const fr = fig.getBoundingClientRect();
        const f = { i, figW: Math.round(fr.width), figH: Math.round(fr.height), overflowX: fig.scrollWidth > fig.clientWidth + 1 ? fig.scrollWidth - fig.clientWidth : 0 };
        if (svg) {
          const sr = svg.getBoundingClientRect();
          const vb = svg.getAttribute('viewBox');
          let arOk = null, vbRatio = null, renderRatio = null;
          if (vb) {
            const [, , vw, vh] = vb.split(/\s+/).map(Number);
            vbRatio = Math.round((vw / vh) * 1000) / 1000;
            renderRatio = Math.round((sr.width / sr.height) * 1000) / 1000;
            arOk = Math.abs(vbRatio - renderRatio) < 0.05;
          }
          f.svg = { w: Math.round(sr.width), h: Math.round(sr.height), vbRatio, renderRatio, arOk, contained: in_(sr, fr) };
          if (!arOk) out.issues.push(`figure ${i}: svg aspect ${renderRatio} != viewBox ${vbRatio}`);
          if (!in_(sr, fr)) out.issues.push(`figure ${i}: svg rect (${Math.round(sr.left)},${Math.round(sr.top)},${Math.round(sr.right)},${Math.round(sr.bottom)}) outside figure (${Math.round(fr.left)},${Math.round(fr.top)},${Math.round(fr.right)},${Math.round(fr.bottom)})`);
        }
        if (cap) {
          const cr = cap.getBoundingClientRect();
          f.cap = { top: Math.round(cr.top), figBottom: Math.round(fr.bottom), h: Math.round(cr.height), contained: in_(cr, fr), overlapSvg: svg ? overlaps(cr, svg.getBoundingClientRect()) : false };
          if (!in_(cr, fr)) out.issues.push(`figure ${i}: figcaption outside figure`);
          if (f.cap.overlapSvg) out.issues.push(`figure ${i}: figcaption overlaps svg`);
        }
        out.figures.push(f);
      });
      return out;
    });
    console.log(`\n===== ${loc.toUpperCase()} @${w} (${BASE}) =====`);
    console.log(JSON.stringify(r, null, 1));
    await page.screenshot({ path: `${OUT}/${loc}-${w}.png`, fullPage: true });
    await ctx.close();
  }
}
await browser.close();
