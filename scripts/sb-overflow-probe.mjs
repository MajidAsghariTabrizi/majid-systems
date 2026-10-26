import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const pg = await (await browser.newContext({ viewport: { width: 320, height: 690 } })).newPage();
for (const route of ['/en/mind', '/en/mind/flows', '/en/insights/books']) {
  await pg.goto('http://127.0.0.1:3219' + route, { waitUntil: 'networkidle', timeout: 60000 });
  const out = await pg.evaluate(() => {
    const doc = document.documentElement;
    const wide = [];
    for (const el of document.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.width > doc.clientWidth + 4 && r.width < 4000) {
        wide.push(el.tagName + '.' + String(el.className).split(' ')[0] + ' w=' + Math.round(r.width));
      }
    }
    return { overflow: doc.scrollWidth - doc.clientWidth, widest: wide.slice(0, 6) };
  });
  console.log(route, JSON.stringify(out));
}
await browser.close();