import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'msedge', headless: true });
const p = await (await b.newContext({ viewport: { width: 1366, height: 768 } })).newPage();
await p.goto('http://127.0.0.1:3219/en', { waitUntil: 'networkidle', timeout: 60000 });
await p.evaluate(() => {
  const sec = document.querySelector('.sim-scroll');
  const top = sec.getBoundingClientRect().top + window.scrollY;
  window.scrollTo(0, top + 4);
});
await p.waitForTimeout(1300);
const m = await p.evaluate(() => {
  const g = (s) => document.querySelector(s);
  const r = (el) => el ? { h: Math.round(el.getBoundingClientRect().height), w: Math.round(el.getBoundingClientRect().width) } : null;
  const svg = g('.sim-svg');
  const sr = svg ? svg.getBoundingClientRect() : null;
  const lbl = g('.sim-node-label');
  return {
    frame: r(g('.sim-frame')), head: r(g('.sim-head')), cmd: r(g('.sim-command')),
    journey: r(g('.sim-journey')), legend: r(g('.sim-legend')), body: r(g('.sim-body')),
    stage: r(g('.sim-stage')), strip: r(g('.sim-strip')), controls: r(g('.sim-controls')),
    svg: sr ? { h: Math.round(sr.height), w: Math.round(sr.width) } : null,
    stickyTop: Math.round(g('.sim-sticky').getBoundingClientRect().top),
    cam: g('.sim-viewport').getAttribute('transform'),
  };
});
console.log(JSON.stringify(m, null, 1));
await b.close();
