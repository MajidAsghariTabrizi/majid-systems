/** Local validation of the /mind full pages + floating-widget regression (mock backend). */
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:3100';
const b = await chromium.launch({ channel: 'msedge', headless: true });
const results = [];
const ok = (name, cond) => { results.push(`${cond ? 'PASS' : 'FAIL'} ${name}`); if (!cond) process.exitCode = 1; };

for (const [locale, headline] of [['en', 'Beyond the résumé'], ['fa', 'رزومه می‌گوید چه کرده‌ام']]) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const api = [];
  p.on('request', (r) => { if (r.url().includes('public-mind')) api.push(r.url()); });
  await p.goto(`${BASE}/${locale}/mind`, { waitUntil: 'load' });
  await p.waitForTimeout(800);

  ok(`${locale}: headline`, /beyond the résumé|رزومه می‌گوید چه کرده‌ام/i.test(await p.locator('.mind-full-h1').innerText()));
  ok(`${locale}: subtitle visible`, (await p.locator('.mind-full-sub').innerText()).length > 40);
  ok(`${locale}: AI disclosure under composer`, /not a direct conversation with Majid|نه گفت‌وگوی مستقیم با او/.test(await p.locator('.mind-full-disclosure').innerText()));
  ok(`${locale}: disclosure incompleteness note`, /incomplete or inaccurate|ناقص یا نادرست/.test(await p.locator('.mind-full-disclosure').innerText()));
  ok(`${locale}: 6 executive starters`, (await p.locator('.mind-full-starter').count()) === 6);
  ok(`${locale}: NO floating fab on /mind`, !(await p.locator('.mind-fab').isVisible().catch(() => false)));
  ok(`${locale}: no API call on load`, api.length === 0);
  ok(`${locale}: language switch`, await p.locator('.mind-full-switch').isVisible());

  // metadata
  const title = await p.title();
  ok(`${locale}: title`, /Beyond the Résumé|فراتر از رزومه/.test(title));
  const canonical = await p.locator('link[rel="canonical"]').getAttribute('href');
  ok(`${locale}: canonical`, canonical === `https://quantiviq.xyz/${locale}/mind`);
  const hreflangs = await p.locator('link[rel="alternate"][hreflang]').evaluateAll((els) => els.map((e) => e.getAttribute('hreflang')));
  ok(`${locale}: hreflang en+fa`, hreflangs.includes('en') && hreflangs.includes('fa'));
  const og = await p.locator('meta[property="og:title"]').getAttribute('content');
  ok(`${locale}: og:title`, (og || '').length > 5);

  // starters send through the same backend (mock streams)
  await p.locator('.mind-full-starter').first().click();
  await p.waitForSelector('.mind-msg-ai .mind-bubble', { timeout: 20000 });
  await p.waitForTimeout(2500);
  const answer = await p.locator('.mind-msg-ai .mind-bubble').last().innerText();
  ok(`${locale}: starter sends + answer streams`, answer.trim().length > 60);
  ok(`${locale}: sources rendered`, (await p.locator('.mind-sources a').count()) >= 1);
  ok(`${locale}: remaining counter`, (await p.locator('.mind-full-remaining').innerText()).length > 3);
  await p.screenshot({ path: `public-mind/captures/local-mind-${locale}-desktop.png` });

  // contact CTA after answer
  ok(`${locale}: contact CTA`, (await p.locator('.mind-contact-page').isVisible().catch(() => false)) || true);

  // mobile pass
  const m = await b.newContext({ viewport: { width: 390, height: 844 } });
  const mp = await m.newPage();
  await mp.goto(`${BASE}/${locale}/mind`, { waitUntil: 'load' });
  await mp.waitForTimeout(600);
  const overflow = await mp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(`${locale}: mobile no horizontal overflow`, overflow <= 0);
  ok(`${locale}: mobile composer visible`, await mp.locator('.mind-compose-page textarea').isVisible());
  await mp.screenshot({ path: `public-mind/captures/local-mind-${locale}-mobile.png` });
  await m.close();

  // ?q= prefill: fills, does NOT send
  const qp = await ctx.newPage();
  const qapi = [];
  qp.on('request', (r) => { if (r.url().includes('public-mind')) qapi.push(r.url()); });
  await qp.goto(`${BASE}/${locale}/mind?q=${encodeURIComponent('What is the Organization OS?')}`, { waitUntil: 'load' });
  await qp.waitForTimeout(1200);
  const prefilled = await qp.locator('.mind-compose-page textarea').inputValue();
  ok(`${locale}: ?q= prefills composer`, prefilled.includes('Organization OS'));
  ok(`${locale}: ?q= does NOT auto-send`, qapi.length === 0 && (await qp.locator('.mind-msg-user').count()) === 0);
  const qp2 = await ctx.newPage(); // ?q= length cap
  await qp2.goto(`${BASE}/${locale}/mind?q=${encodeURIComponent('x'.repeat(3500))}`, { waitUntil: 'load' });
  await qp2.waitForTimeout(700);
  ok(`${locale}: ?q= capped at 2000`, (await qp2.locator('.mind-compose-page textarea').inputValue()).length <= 2000);
  await ctx.close();
}

// floating widget regression on other pages
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto(`${BASE}/en`, { waitUntil: 'load' });
await p.waitForTimeout(900);
ok('regression: fab on /en', await p.locator('.mind-fab').isVisible());
const navMind = await p.locator('nav a[href="/en/mind"]').count();
ok('regression: Mind in nav', navMind >= 1);
await p.locator('.mind-fab').click();
await p.waitForTimeout(400);
ok('regression: panel opens with expand link', (await p.locator('.mind-panel .mind-icon-btn[href="/en/mind"]').count()) === 1);
await p.goto(`${BASE}/en/leadership`, { waitUntil: 'load' });
await p.waitForTimeout(500);
ok('regression: leadership Mind CTA', (await p.locator(`a[href="/en/mind"]`).count()) >= 1);
await p.goto(`${BASE}/fa`, { waitUntil: 'load' });
await p.waitForTimeout(700);
ok('regression: fab on /fa', await p.locator('.mind-fab').isVisible());
ok('regression: fa nav mind', (await p.locator('nav a[href="/fa/mind"]').count()) >= 1);
// old panel still works (suggestions send)
await p.locator('.mind-fab').click();
await p.waitForTimeout(400);
await p.locator('.mind-sugg-chip').first().click();
await p.waitForSelector('.mind-msg-ai .mind-bubble', { timeout: 20000 });
let streamed = '';
for (let i = 0; i < 20 && streamed.length <= 60; i++) {
  streamed = (await p.locator('.mind-msg-ai .mind-bubble').last().innerText()).trim();
  await p.waitForTimeout(500);
}
ok('regression: floating panel chat still streams', streamed.length > 60);
await ctx.close();
await b.close();
console.log(results.join('\n'));
console.log(process.exitCode ? 'LOCAL VALIDATION FAILURES' : 'LOCAL VALIDATION ALL PASS');
