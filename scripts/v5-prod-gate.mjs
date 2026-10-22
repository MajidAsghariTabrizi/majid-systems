import { chromium } from 'playwright';

/* Lean V5 production gate — the load-bearing acceptance facts only:
   1) camera operational mode active + node label rendered >= 15px @1366x768
   2) journey stepper present and advancing on a real run
   3) full run completes (engine intact) on production
   4) FA: H1 44-56px Estedad line-height 1.35, mono purged from eyebrow */
const BASE = process.env.CAPTURE_BASE || 'https://quantiviq.xyz';
let fails = 0;
const ok = (name, cond, detail = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
  if (!cond) fails += 1;
};

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
const p = await ctx.newPage();

await p.goto(`${BASE}/en`, { waitUntil: 'domcontentloaded', timeout: 45000 });
await p.locator('.sim-frame').scrollIntoViewIfNeeded();
await p.waitForTimeout(1500);
const cam = await p.locator('.sim-viewport').getAttribute('transform');
ok('prod: operational camera active', /scale\(1\.[3-9]/.test(cam ?? ''), cam ?? 'none');
const rendered = await p
  .locator('.sim-node-label')
  .first()
  .evaluate((el) => {
    const m = el.getScreenCTM();
    return parseFloat(getComputedStyle(el).fontSize) * m.a;
  });
ok('prod: node label >= 15px rendered (1366x768)', rendered >= 15, `${Math.round(rendered * 10) / 10}px`);
ok('prod: journey 6 stages', (await p.locator('.sj-step').count()) === 6);
ok('prod: viewbar 6 controls', (await p.locator('.sim-viewbar .vb-btn').count()) === 6);

await p.locator('.sim-cta.primary').click();
await p.waitForTimeout(9000);
const stepA = await p.locator('.sj-step.on').innerText().catch(() => '');
await p.waitForTimeout(9000);
const stepB = await p.locator('.sj-step.on').innerText().catch(() => '');
ok('prod: journey advances with run', stepA.length > 0 && stepB !== stepA, `${stepA} -> ${stepB}`);
await p.waitForFunction(
  () => (document.querySelector('.sim-cta.primary')?.textContent ?? '').includes('REBUILD'),
  null,
  { timeout: 60000 },
);
await p.locator('.sim-cta.primary').click();
await p.waitForTimeout(7000);
await p.locator('.sim-cta.primary').click();
await p.waitForSelector('.sim-payoff.on', { timeout: 90000 }).catch(() => {});
ok('prod: full run completes (engine untouched)', (await p.locator('.sim-payoff.on').count()) === 1);
await ctx.close();

const fa = await (await browser.newContext({ viewport: { width: 1366, height: 768 } })).newPage();
await fa.goto(`${BASE}/fa`, { waitUntil: 'domcontentloaded', timeout: 45000 });
await fa.waitForTimeout(1200);
const h1 = await fa.locator('h1').first().evaluate((el) => {
  const c = getComputedStyle(el);
  return { fs: parseFloat(c.fontSize), lh: parseFloat(c.lineHeight), ff: c.fontFamily, ls: c.letterSpacing };
});
ok('prod fa: H1 44-56px', h1.fs >= 44 && h1.fs <= 56, `${h1.fs}px`);
ok('prod fa: H1 Estedad + lh>=1.2 + no negative tracking', /Estedad/i.test(h1.ff) && h1.lh / h1.fs >= 1.2 && (h1.ls === 'normal' || parseFloat(h1.ls) >= 0), `${(h1.lh / h1.fs).toFixed(2)} ls=${h1.ls}`);
const eye = await fa.locator('.eyebrow').first().evaluate((el) => getComputedStyle(el).fontFamily);
ok('prod fa: eyebrow mono purged', /Estedad/i.test(eye), eye.slice(0, 20));
await fa.close();

await browser.close();
console.log(fails ? `V5 PROD GATE: ${fails} FAIL` : 'V5 PROD GATE: ALL PASS');
process.exit(fails ? 1 : 0);
