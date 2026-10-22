import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'msedge', headless: true });
const p = await (await b.newContext({ viewport: { width: 1366, height: 768 } })).newPage();
await p.goto('http://127.0.0.1:3219/en', { waitUntil: 'networkidle', timeout: 60000 });
await p.evaluate(() => {
  const sec = document.querySelector('.sim-scroll');
  window.scrollTo(0, sec.getBoundingClientRect().top + window.scrollY + 220);
});
await p.waitForTimeout(1200);
const m = await p.evaluate(() => {
  const c = document.querySelector('.sim-controls');
  const cs = getComputedStyle(c);
  const kids = [...c.children].map((el) => {
    const r = el.getBoundingClientRect();
    return { cls: el.className, display: getComputedStyle(el).display, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  });
  return { display: cs.display, dir: cs.direction, wrap: cs.flexWrap, w: Math.round(c.getBoundingClientRect().width), h: Math.round(c.getBoundingClientRect().height), kids };
});
console.log(JSON.stringify(m, null, 1));
await b.close();
