import { chromium } from 'playwright';
import fs from 'node:fs';
const BASE = 'http://127.0.0.1:3219';
const PAGES = [
  ['home', '/{loc}'], ['explore', '/{loc}/explore'], ['about', '/{loc}/about'],
  ['mind', '/{loc}/mind'], ['books', '/{loc}/insights/books'], ['stack', '/{loc}/insights/enterprise-ai-stack'],
  ['flows', '/{loc}/mind/flows'], ['insights', '/{loc}/insights'], ['lab', '/{loc}/lab'], ['article', '/{loc}/insights/ai-native-organization-design'],
];
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const PHASE = process.argv[2] ?? 'before';
fs.mkdirSync('captures-dst/' + PHASE, { recursive: true });
let n = 0;
for (const [name, tpl] of PAGES) {
  for (const loc of ['en', 'fa']) {
    const route = tpl.replace('{loc}', loc);
    for (const [w, h, tag] of [[1440, 900, '1440'], [390, 844, '390']]) {
      try {
        const pg = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
        await pg.goto(BASE + route, { waitUntil: 'networkidle', timeout: 45000 });
        await pg.screenshot({ path: 'captures-dst/' + PHASE + '/' + name + '-' + loc + '-' + tag + '.png', fullPage: false });
        await pg.close();
        n++;
      } catch (e) { console.log('FAIL', route, tag, String(e).slice(0, 50)); }
    }
  }
}
await browser.close();
console.log('before shots:', n);
