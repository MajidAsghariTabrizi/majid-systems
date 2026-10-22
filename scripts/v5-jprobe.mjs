import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'msedge', headless: true });
const p = await (await b.newContext({ viewport: { width: 1366, height: 768 } })).newPage();
await p.goto('http://127.0.0.1:3219/en', { waitUntil: 'networkidle', timeout: 60000 });
await p.locator('.sim-frame').scrollIntoViewIfNeeded();
await p.waitForTimeout(900);
await p.locator('.sim-cta.primary').click();
for (const t of [500, 3000, 6000, 10000, 14000]) {
  await p.waitForTimeout(t === 500 ? 500 : t - (t > 500 ? [500,3000,6000,10000][[500,3000,6000,10000].indexOf(t)-1] : 0));
  const info = await p.evaluate(() => {
    const on = document.querySelector('.sj-step.on');
    const lat = document.querySelector('.sj-lat');
    const phase = document.querySelector('.sim-frame').className.match(/phase-[\w-]+/)?.[0];
    return { step: on ? on.textContent.trim() : 'none', lat: lat ? lat.textContent : '', phase };
  });
  console.log(t, JSON.stringify(info));
}
await b.close();
