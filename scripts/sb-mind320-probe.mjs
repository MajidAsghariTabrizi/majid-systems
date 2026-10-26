import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const pg = await (await browser.newContext({ viewport: { width: 320, height: 690 } })).newPage();
await pg.goto('http://127.0.0.1:3219/en/mind', { waitUntil: 'networkidle', timeout: 60000 });
const out = await pg.evaluate(() => {
  const doc = document.documentElement;
  const bad = [];
  for (const el of doc.querySelectorAll('.mind-full-card *')) {
    const cs = getComputedStyle(el);
    const minw = el.getBoundingClientRect().width;
    if (minw > 318 && minw < 500) {
      bad.push({ tag: el.tagName, cls: String(el.className).slice(0, 40), w: Math.round(minw), ws: cs.whiteSpace, mw: cs.minWidth, txt: (el.textContent || '').trim().slice(0, 40) });
    }
  }
  return bad.slice(0, 10);
});
console.log(JSON.stringify(out, null, 1));
await browser.close();