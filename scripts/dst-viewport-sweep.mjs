import { chromium } from 'playwright';
const BASE = 'http://127.0.0.1:3219';
const PAGES = [['home', '/{loc}'], ['explore', '/{loc}/explore'], ['about', '/{loc}/about'], ['mind', '/{loc}/mind'], ['books', '/{loc}/insights/books'], ['stack', '/{loc}/insights/enterprise-ai-stack'], ['flows', '/{loc}/mind/flows'], ['insights', '/{loc}/insights'], ['lab', '/{loc}/lab'], ['article', '/{loc}/insights/ai-adoption-is-not-ai-transformation'], ['journey', '/journey'], ['work', '/work'], ['profile', '/profile'], ['meet', '/meet-majid']];
const WS = [[320, 700, '320'], [390, 844, '390'], [768, 1024, '768'], [1024, 768, '1024'], [1440, 900, '1440']];
const browser = await chromium.launch({ channel: 'msedge', headless: true });
let bad = 0, n = 0;
for (const [name, tpl] of PAGES) {
  for (const loc of ['en', 'fa']) {
    if (!tpl.includes('{loc}') && loc === 'fa') continue;
    const route = tpl.replace('{loc}', loc);
    for (const [w, h, tag] of WS) {
      try {
        const pg = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
        const errs = [];
        pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 60)); });
        await pg.goto(BASE + route, { waitUntil: 'networkidle', timeout: 45000 });
        const ov = await pg.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        n++;
        if (ov > 1 || errs.length) { bad++; console.log('BAD', name, loc, tag, 'ov=' + ov, errs.slice(0, 2).join(' | ')); }
        await pg.close();
      } catch (e) { bad++; console.log('ERR', name, loc, tag, String(e).slice(0, 40)); }
    }
  }
}
await browser.close();
console.log('swept', n, 'combos; bad:', bad);
