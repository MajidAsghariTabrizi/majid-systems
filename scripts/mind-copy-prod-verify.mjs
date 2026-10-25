/** PRODUCTION copy verification — post-deploy, public HTTPS, both locales. */
import { chromium } from 'playwright';

const BASE = 'https://quantiviq.xyz';
const b = await chromium.launch({ channel: 'msedge', headless: true });
const log = [];
const ok = (name, cond) => { log.push(`${cond ? 'PASS' : 'FAIL'} ${name}`); if (!cond) process.exitCode = 1; };

for (const locale of ['en', 'fa']) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 950 } });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/${locale}/mind`, { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(1000);

  // hero + disclosure
  const lines = await p.locator('.mind-full-h1 .h1-line').allInnerTexts();
  ok(`${locale}: prod headline`, (locale === 'en' ? /beyond the résumé/i : /رزومه می‌گوید چه کرده‌ام/).test(lines[0] || ''));
  ok(`${locale}: prod headline line 2`, (locale === 'en' ? /explore the thinking/i : /چطور فکر می‌کنم/).test(lines[1] || ''));
  const disc = await p.locator('.mind-full-disclosure').innerText();
  ok(`${locale}: prod disclosure`, /not a direct conversation|نه گفت‌وگوی مستقیم/.test(disc));
  ok(`${locale}: prod incompleteness note`, /incomplete or inaccurate|ناقص یا نادرست/.test(disc));
  ok(`${locale}: no old ai-note in hero`, (await p.locator('.mind-full-ai-note').count()) === 0);

  // starters — REAL GLM answer through one of them
  const starters = await p.locator('.mind-full-starter').allInnerTexts();
  ok(`${locale}: prod 6 starters`, starters.length === 6);
  ok(`${locale}: prod NO books starter`, !starters.some((t) => /book|کتاب/i.test(t)));
  await p.locator('.mind-full-starter').first().click();
  await p.waitForSelector('.mind-msg-ai .mind-bubble', { timeout: 30000 });
  let answer = '';
  for (let i = 0; i < 40; i++) {
    answer = (await p.locator('.mind-msg-ai .mind-bubble').last().innerText()).trim();
    if (answer.length > 250) break;
    await p.waitForTimeout(2000);
  }
  ok(`${locale}: prod REAL streamed answer (${answer.length} chars)`, answer.length > 250);
  const cta = await p.locator('.mind-contact-page').isVisible().catch(() => false);
  ok(`${locale}: prod contact CTA label`, cta && /Contact Majid|تماس با مجید/.test(await p.locator('.mind-contact-page').innerText()));

  // SEO on production
  ok(`${locale}: prod SEO title`, (locale === 'en' ? /Beyond the Résumé/ : /فراتر از رزومه/).test(await p.title()));
  const canonical = await p.locator('link[rel="canonical"]').getAttribute('href');
  ok(`${locale}: prod canonical`, canonical === `${BASE}/${locale}/mind`);

  await p.screenshot({ path: `public-mind/captures/prod-copy-${locale}-desktop.png` });
  // mobile
  const m = await b.newContext({ viewport: { width: 390, height: 844 } });
  const mp = await m.newPage();
  await mp.goto(`${BASE}/${locale}/mind`, { waitUntil: 'load', timeout: 60000 });
  await mp.waitForTimeout(700);
  ok(`${locale}: prod mobile no overflow`, (await mp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) <= 0);
  await mp.screenshot({ path: `public-mind/captures/prod-copy-${locale}-mobile.png` });
  await m.close();

  // widget
  await p.goto(`${BASE}/${locale}`, { waitUntil: 'load' });
  await p.waitForTimeout(6500);
  ok(`${locale}: prod fab label`, (await p.locator('.mind-fab').innerText()).includes(locale === 'fa' ? 'گفت‌وگو' : 'Ask'));
  await p.locator('.mind-fab').click();
  await p.waitForTimeout(400);
  ok(`${locale}: prod widget empty state`, /What would you like to explore|کدام تصمیم یا تجربه/.test(await p.locator('.mind-empty-title').innerText()));
  const chips = await p.locator('.mind-sugg-chip').allInnerTexts();
  ok(`${locale}: prod 6 short chips`, chips.length === 6 && !chips.some((c) => /book|کتاب/i.test(c)));
  await p.screenshot({ path: `public-mind/captures/prod-copy-${locale}-widget.png` });
  await ctx.close();
}

// routes + sitemap integrity
for (const u of ['/en', '/fa', '/en/mind', '/fa/mind']) {
  const r = await fetch(`${BASE}${u}`, { redirect: 'manual' });
  ok(`prod route ${u}`, r.status === 200);
}
const sm = await (await fetch(`${BASE}/sitemap.xml`)).text();
ok('sitemap includes both mind pages', sm.includes('/en/mind') && sm.includes('/fa/mind'));

await b.close();
console.log(log.join('\n'));
console.log(process.exitCode ? 'PRODUCTION COPY VERIFICATION FAILURES' : 'PRODUCTION COPY VERIFICATION ALL PASS');
