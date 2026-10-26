import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const cases = [
  ['/fa/insights/books', ['color-contrast']],
  ['/en/insights/books/rewired', ['color-contrast', 'link-in-text-block']],
  ['/en/mind', ['color-contrast']],
  ['/en/explore', ['nested-interactive']],
];
for (const [rt, ids] of cases) {
  const pg = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await pg.goto('http://127.0.0.1:3219' + rt, { waitUntil: 'networkidle', timeout: 60000 });
  await pg.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/axe-core@4.10.0/axe.min.js' });
  const v = await pg.evaluate(async (ids) => {
    const r = await window.axe.run(document, { resultTypes: ['violations'] });
    return r.violations.filter(x => ids.includes(x.id)).map(x => x.nodes.slice(0, 2).map(n => ({ target: n.target.join(' ').slice(0, 50), html: n.html.slice(0, 130, ), sum: (n.failureSummary || '').split('\n').slice(1, 3).join(' | ').slice(0, 140) })));
  }, ids);
  console.log('==', rt, JSON.stringify(v, null, 1).slice(0, 900));
  await pg.close();
}
await browser.close();