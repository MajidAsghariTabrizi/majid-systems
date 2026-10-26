import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const pg = await (await browser.newContext({ viewport: { width: 320, height: 690 } })).newPage();
await pg.goto('http://127.0.0.1:3219/en/mind', { waitUntil: 'networkidle', timeout: 60000 });
const out = await pg.evaluate(() => {
  const body = document.querySelector('.mind-full-body');
  const kids = [...body.children].map(c => ({ tag: c.tagName, cls: String(c.className).slice(0, 30), w: Math.round(c.getBoundingClientRect().width), sw: c.scrollWidth, cw: c.clientWidth }));
  const card = document.querySelector('.mind-full-card');
  const ck = card ? [...card.children].map(c => ({ tag: c.tagName, cls: String(c.className).slice(0, 30), w: Math.round(c.getBoundingClientRect().width), sw: c.scrollWidth, cw: c.clientWidth })) : [];
  return { kids, ck };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();