import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
let pg = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await pg.goto('https://quantiviq.xyz/en', { waitUntil: 'networkidle', timeout: 60000 });
const home = await pg.evaluate(() => {
  const h1 = document.querySelector('h1');
  return {
    h1: h1?.textContent.trim().slice(0, 40),
    font: h1 ? getComputedStyle(h1).fontFamily.split(',')[0] : null,
    h1Size: h1 ? getComputedStyle(h1).fontSize : null,
    groups: document.querySelectorAll('.nv-btn').length,
    plainLinks: document.querySelectorAll('.nv-link').length,
    cta: document.querySelector('.nav-cta')?.textContent.trim(),
    map: !!document.querySelector('.intel-map'),
    svc: document.querySelectorAll('.svc-card').length,
  };
});
console.log('PROD HOME:', JSON.stringify(home));
const mm = await fetch('https://quantiviq.xyz/meet-majid', { redirect: 'manual' });
console.log('meet-majid:', mm.status, mm.headers.get('x-robots-tag'));
await pg.close();
pg = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await pg.goto('https://quantiviq.xyz/fa', { waitUntil: 'networkidle', timeout: 60000 });
const fa = await pg.evaluate(async () => {
  await document.fonts.ready;
  const h1 = document.querySelector('h1');
  return { font: getComputedStyle(h1).fontFamily.split(',')[0], dir: document.documentElement.dir, skip: document.querySelector('.skip-link')?.textContent.trim(), cta: document.querySelector('.nav-cta')?.textContent.trim() };
});
console.log('PROD FA:', JSON.stringify(fa));
await pg.close();
pg = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await pg.goto('https://quantiviq.xyz/en/explore', { waitUntil: 'networkidle', timeout: 60000 });
await pg.waitForTimeout(700);
const sync = await pg.evaluate(() => ({
  outer: [...document.querySelectorAll('.explore-step .role-chip.on')].map((b) => b.textContent.trim().slice(0, 16)),
  inner: [...document.querySelectorAll('.sim-signals .sig.on')].map((b) => b.textContent.trim().slice(0, 16)),
}));
console.log('PROD EXPLORE SYNC:', JSON.stringify(sync));
await pg.close();
pg = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await pg.goto('https://quantiviq.xyz/en/proof', { waitUntil: 'networkidle', timeout: 60000 });
const phoenix = await pg.evaluate(() => [...document.querySelectorAll('.chip')].map((c) => c.textContent.trim()).filter((t) => /RETIRED|PRODUCTION/.test(t)));
console.log('PROD PHOENIX chips:', JSON.stringify(phoenix));
await browser.close();
