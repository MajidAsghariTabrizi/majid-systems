import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const routes = ['/en/explore','/fa/explore','/en/insights/books','/fa/insights/books','/en/insights/books/rewired','/en/insights/enterprise-ai-stack','/en/mind/flows','/fa/mind/flows','/en/mind'];
let totalCrit = 0;
for (const rt of routes) {
  const pg = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await pg.goto('http://127.0.0.1:3219' + rt, { waitUntil: 'networkidle', timeout: 60000 });
  await pg.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/axe-core@4.10.0/axe.min.js' });
  const v = await pg.evaluate(async () => {
    const r = await window.axe.run(document, { resultTypes: ['violations'] });
    return r.violations.filter(x => ['critical','serious','moderate'].includes(x.impact)).map(x => ({ id: x.id, impact: x.impact, n: x.nodes.length, t: x.nodes[0].target.join(' ').slice(0, 60) }));
  });
  const crit = v.filter(x => x.impact !== 'moderate');
  totalCrit += crit.length;
  console.log(rt.padEnd(34), crit.length === 0 ? 'NO critical/serious' : 'CRIT: ' + JSON.stringify(crit), v.length ? '| mod: ' + v.filter(x => x.impact === 'moderate').map(x => x.id + 'x' + x.n).join(',') : '');
  await pg.close();
}
console.log('TOTAL critical/serious across routes:', totalCrit);
await browser.close();