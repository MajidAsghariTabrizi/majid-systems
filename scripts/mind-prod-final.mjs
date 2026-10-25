/** FINAL production validation — Task 8 checklist (quantiviq.xyz, 2026-10-25). */
import { chromium } from 'playwright';

const BASE = 'https://quantiviq.xyz';
const OUT = 'public-mind/captures/prod-mind';
const b = await chromium.launch({ channel: 'msedge', headless: true });
const log = [];
const ok = (name, cond) => { log.push(`${cond ? 'PASS' : 'FAIL'} ${name}`); if (!cond) process.exitCode = 1; };

// ---- 1. HTTP health of mind pages + existing routes
for (const u of ['/en/mind', '/fa/mind', '/en/insights', '/fa/insights', '/en/leadership', '/fa/leadership', '/en/lab', '/fa/lab', '/en', '/fa']) {
  const r = await fetch(`${BASE}${u}`, { redirect: 'manual' });
  ok(`route ${u} -> 200`, r.status === 200);
}

// ---- 2. gateway semantics (chat disabled state)
const gw = await fetch(`${BASE}/api/public-mind/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ session: 'prod-final-12345678', locale: 'en', messages: [{ role: 'user', content: 'hello' }] }),
});
const gwBody = await gw.json().catch(() => ({}));
ok('gateway disabled -> 503 bilingual', gw.status === 503 && !!gwBody.message_en && !!gwBody.message_fa);

for (const [locale, headlineRe] of [['en', /explore how majid thinks/i], ['fa', /با ذهن هوشمند مجید گفت‌وگو کن/]]) {
  // ---- desktop
  const ctx = await b.newContext({ viewport: { width: 1440, height: 950 } });
  const p = await ctx.newPage();
  const api = [];
  p.on('request', (r) => { if (r.url().includes('public-mind')) api.push(r.url()); });
  await p.goto(`${BASE}/${locale}/mind`, { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(1200);
  ok(`${locale}: headline`, headlineRe.test(await p.locator('.mind-full-h1').innerText()));
  ok(`${locale}: AI note`, /AI representation|بازنمایی هوش مصنوعی/.test(await p.locator('.mind-full-ai-note').innerText()));
  ok(`${locale}: 6 starters`, (await p.locator('.mind-full-starter').count()) === 6);
  ok(`${locale}: NO floating widget on /mind`, !(await p.locator('.mind-fab').isVisible().catch(() => false)));
  ok(`${locale}: no model call on load`, api.length === 0);
  ok(`${locale}: lang switch`, (await p.locator('.mind-full-switch').getAttribute('href')) === (locale === 'fa' ? '/en/mind' : '/fa/mind'));
  // SEO on production
  ok(`${locale}: canonical`, (await p.locator('link[rel="canonical"]').getAttribute('href')) === `${BASE}/${locale}/mind`);
  const alts = await p.locator('link[rel="alternate"][hreflang]').evaluateAll((els) => els.map((e) => `${e.getAttribute('hreflang')}=${e.getAttribute('href')}`));
  ok(`${locale}: hreflang reciprocal`, alts.some((a) => a.startsWith('en=')) && alts.some((a) => a.startsWith('fa=')));
  ok(`${locale}: og:title`, ((await p.locator('meta[property="og:title"]').getAttribute('content')) || '').length > 5);
  ok(`${locale}: html lang/dir`, (await p.evaluate(() => `${document.documentElement.lang}|${document.documentElement.dir}`)) === (locale === 'fa' ? 'fa|rtl' : 'en|ltr'));
  // starter -> real gateway path (disabled notice expected — the honest state)
  await p.locator('.mind-full-starter').first().click();
  await p.waitForTimeout(3000);
  const err = await p.locator('.mind-error').innerText().catch(() => '');
  ok(`${locale}: starter hits same gateway -> disabled notice`, err.length > 10 && /switched off|خاموش/.test(err));
  await p.screenshot({ path: `${OUT}/${locale}-desktop.png`, fullPage: false });

  // ---- mobile
  const m = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mp = await m.newPage();
  await mp.goto(`${BASE}/${locale}/mind`, { waitUntil: 'load', timeout: 60000 });
  await mp.waitForTimeout(900);
  const overflow = await mp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(`${locale}: mobile no horizontal overflow`, overflow <= 0);
  ok(`${locale}: mobile composer`, await mp.locator('.mind-compose-page textarea').isVisible());
  // keyboard interaction: focus composer + type
  await mp.locator('.mind-compose-page textarea').tap();
  await mp.keyboard.type('test', { delay: 20 });
  ok(`${locale}: mobile keyboard input`, (await mp.locator('.mind-compose-page textarea').inputValue()) === 'test');
  await mp.screenshot({ path: `${OUT}/${locale}-mobile.png` });
  await m.close();

  // ---- floating widget regression on other pages
  await p.goto(`${BASE}/${locale}/insights`, { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(1000);
  ok(`${locale}: floating fab on /insights`, await p.locator('.mind-fab').isVisible());
  await p.locator('.mind-fab').click();
  await p.waitForTimeout(500);
  ok(`${locale}: floating panel opens`, await p.locator('.mind-panel').isVisible());
  ok(`${locale}: panel expand -> /mind`, (await p.locator('.mind-panel .mind-icon-btn[href$="/mind"]').count()) === 1);
  await p.screenshot({ path: `${OUT}/${locale}-floating.png` });
  await ctx.close();
}

await b.close();
console.log(log.join('\n'));
console.log(process.exitCode ? 'PRODUCTION VALIDATION FAILURES' : 'PRODUCTION VALIDATION ALL PASS');
