import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'msedge', headless: true });
const p = await (await b.newContext({ viewport: { width: 1366, height: 768 } })).newPage();
await p.goto('http://127.0.0.1:3219/en', { waitUntil: 'networkidle', timeout: 60000 });
for (const y of [807, 1000, 1200, 1500, 1700]) {
  await p.evaluate((yy) => window.scrollTo(0, yy), y);
  await p.waitForTimeout(350);
  const r = await p.evaluate(() => {
    const st = document.querySelector('.sim-sticky').getBoundingClientRect();
    let anc = document.querySelector('.sim-sticky').parentElement;
    const overs = [];
    while (anc && anc !== document.body) {
      const c = getComputedStyle(anc);
      if (c.overflow !== 'visible' || c.overflowX !== 'visible' || c.overflowY !== 'visible') overs.push(anc.tagName + '.' + anc.className + ' ' + c.overflow + '/' + c.overflowX);
      anc = anc.parentElement;
    }
    return { y: Math.round(window.scrollY), top: Math.round(st.top), h: Math.round(st.height), overs };
  });
  console.log(JSON.stringify(r));
}
await b.close();
