/* Detail probe: exact out-of-viewBox elements with overflow amounts. */
import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'http://127.0.0.1:3219';
const cases = [
  ['en', 'the-real-cost-of-enterprise-ai-agents'],
  ['en', 'the-ai-native-product-operating-model'],
  ['fa', 'ai-adoption-is-not-ai-transformation'],
  ['fa', 'who-owns-ai-transformation'],
  ['fa', 'the-ai-transformation-value-ledger'],
  ['fa', 'the-90-day-ai-transformation-roadmap'],
];
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
for (const [loc, slug] of cases) {
  await page.goto(`${BASE}/${loc}/insights/${slug}`, { waitUntil: 'networkidle', timeout: 90000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);
  const out = await page.evaluate(() => {
    const res = [];
    document.querySelectorAll('.ins-prose figure svg').forEach((svg, fi) => {
      const [, , vw, vh] = (svg.getAttribute('viewBox') || '').split(/\s+/).map(Number);
      const sr = svg.getBoundingClientRect();
      const sx = vw / sr.width, sy = vh / sr.height;
      svg.querySelectorAll('rect,circle,ellipse,line,polyline,polygon,path,text,image').forEach((el) => {
        const st = getComputedStyle(el);
        if (st.display === 'none' || st.visibility === 'hidden') return;
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const x1 = (r.left - sr.left) * sx, y1 = (r.top - sr.top) * sy;
        const x2 = (r.right - sr.left) * sx, y2 = (r.bottom - sr.top) * sy;
        const dL = Math.round(-x1), dT = Math.round(-y1), dR = Math.round(x2 - vw), dB = Math.round(y2 - vh);
        if (dL > 1 || dT > 1 || dR > 1 || dB > 1) {
          res.push({ fig: fi, tag: el.tagName.toLowerCase(), over: { left: dL, top: dT, right: dR, bottom: dB }, text: (el.textContent || '').trim().slice(0, 24), x: el.getAttribute('x'), anchor: el.getAttribute('text-anchor') });
        }
      });
    });
    return res;
  });
  console.log(`\n== ${loc}/${slug}: ${out.length} out-of-bounds`);
  out.slice(0, 14).forEach((o) => console.log('  ' + JSON.stringify(o)));
}
await browser.close();
