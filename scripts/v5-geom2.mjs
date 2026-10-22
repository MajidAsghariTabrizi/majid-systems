import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'msedge', headless: true });
const p = await (await b.newContext({ viewport: { width: 1366, height: 768 } })).newPage();
await p.goto('http://127.0.0.1:3219/en', { waitUntil: 'networkidle', timeout: 60000 });
const before = await p.evaluate(() => {
  const sec = document.querySelector('.sim-scroll');
  return { secTop: Math.round(sec.getBoundingClientRect().top + window.scrollY), secH: Math.round(sec.getBoundingClientRect().height), stickyH: Math.round(document.querySelector('.sim-sticky').getBoundingClientRect().height) };
});
await p.evaluate(() => {
  const sec = document.querySelector('.sim-scroll');
  const top = sec.getBoundingClientRect().top + window.scrollY;
  window.scrollTo(0, top + 4);
});
await p.waitForTimeout(1200);
const after = await p.evaluate(() => {
  const st = document.querySelector('.sim-sticky').getBoundingClientRect();
  const fr = document.querySelector('.sim-frame').getBoundingClientRect();
  return { scrollY: Math.round(window.scrollY), stickyTop: Math.round(st.top), stickyH: Math.round(st.height), frameTop: Math.round(fr.top), frameH: Math.round(fr.height) };
});
console.log('before:', JSON.stringify(before));
console.log('after :', JSON.stringify(after));
await b.close();
