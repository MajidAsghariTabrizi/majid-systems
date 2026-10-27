import { chromium } from 'playwright';
const BASE = 'http://127.0.0.1:3219';
const PAGES = [['home', '/{loc}'], ['explore', '/{loc}/explore'], ['about', '/{loc}/about'], ['mind', '/{loc}/mind'], ['books', '/{loc}/insights/books'], ['lab', '/{loc}/lab'], ['article', '/{loc}/insights/ai-adoption-is-not-ai-transformation'], ['flows', '/{loc}/mind/flows'], ['journey', '/journey'], ['work', '/work'], ['meet', '/meet-majid']];
const browser = await chromium.launch({ channel: 'msedge', headless: true });
let totalCs = 0;
for (const [name, tpl] of PAGES) {
  for (const loc of ['en', 'fa']) {
    if (!tpl.includes('{loc}') && loc === 'fa') continue;
    const route = tpl.replace('{loc}', loc);
    try {
      const pg = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
      await pg.goto(BASE + route, { waitUntil: 'networkidle', timeout: 45000 });
      await pg.addScriptTag({ path: 'node_modules/axe-core/axe.min.js' });
      const res = await pg.evaluate(async () => {
        const r = await window.axe.run(document, { resultTypes: ['violations'], runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } });
        return r.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length }));
      });
      const cs = res.filter((v) => v.impact === 'critical' || v.impact === 'serious');
      totalCs += cs.reduce((a, v) => a + v.n, 0);
      console.log((cs.length ? 'VIOL ' : 'OK   ') + name, loc, cs.length ? JSON.stringify(cs) : '');
      await pg.close();
    } catch (e) { console.log('ERR', name, loc, String(e).slice(0, 50)); }
  }
}
await browser.close();
console.log('TOTAL critical/serious:', totalCs);
