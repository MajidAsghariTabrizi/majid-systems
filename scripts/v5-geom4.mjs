import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'msedge', headless: true });
const p = await (await b.newContext({ viewport: { width: 1366, height: 768 } })).newPage();
await p.goto('http://127.0.0.1:3219/en', { waitUntil: 'networkidle', timeout: 60000 });
await p.evaluate(() => {
  const sec = document.querySelector('.sim-scroll');
  window.scrollTo(0, sec.getBoundingClientRect().top + window.scrollY + 220);
});
await p.waitForTimeout(1600);
const m = await p.evaluate(() => {
  const q = (s) => document.querySelector(s);
  const h = (s) => { const el = q(s); if (!el) return null; const r = el.getBoundingClientRect(); return { top: Math.round(r.top), h: Math.round(r.height) }; };
  const svg = q('.sim-svg');
  const sr = svg.getBoundingClientRect();
  return {
    scrollY: Math.round(window.scrollY),
    sticky: h('.sim-sticky'), frame: h('.sim-frame'), head: h('.sim-head'),
    command: h('.sim-command'), journey: h('.sim-journey'), legend: h('.sim-legend'),
    body: h('.sim-body'), stage: h('.sim-stage'), strip: h('.sim-strip'), controls: h('.sim-controls'),
    payoff: h('.sim-payoff'),
    svg: { top: Math.round(sr.top), h: Math.round(sr.height) },
    bodyStyle: (({ minHeight, height, alignSelf }) => ({ minHeight, height, alignSelf }))(getComputedStyle(q('.sim-body'))),
    stageStyle: (({ minHeight }) => ({ minHeight }))(getComputedStyle(q('.sim-stage'))),
  };
});
console.log(JSON.stringify(m, null, 1));
await b.close();
