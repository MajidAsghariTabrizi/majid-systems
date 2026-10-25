/** Copy QA — local, both surfaces, both locales (mock backend). */
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:3100';
const b = await chromium.launch({ channel: 'msedge', headless: true });
const log = [];
const ok = (name, cond) => { log.push(`${cond ? 'PASS' : 'FAIL'} ${name}`); if (!cond) process.exitCode = 1; };

for (const locale of ['en', 'fa']) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 950 } });
  const p = await ctx.newPage();
  const api = [];
  p.on('request', (r) => { if (r.url().includes('public-mind')) api.push(r.url()); });
  await p.goto(`${BASE}/${locale}/mind`, { waitUntil: 'load' });
  await p.waitForTimeout(900);

  // hero
  const lines = await p.locator('.mind-full-h1 .h1-line').allInnerTexts();
  if (locale === 'en') {
    ok('en: headline line 1', /beyond the résumé\./i.test(lines[0]));
    ok('en: headline line 2', /explore the thinking behind the work\./i.test(lines[1]));
  } else {
    ok('fa: headline line 1', lines[0] === 'رزومه می‌گوید چه کرده‌ام؛');
    ok('fa: headline line 2', lines[1] === 'اینجا بپرس چطور فکر می‌کنم.');
  }
  const sub = await p.locator('.mind-full-sub').innerText();
  ok(`${locale}: subtitle present + first-person/challenge framing`, sub.length > 60 && /challenge the reasoning|سنجش نتیجه/.test(sub));
  ok(`${locale}: NO ai-note in hero`, (await p.locator('.mind-full-ai-note').count()) === 0);
  const disc = await p.locator('.mind-full-disclosure').innerText();
  ok(`${locale}: disclosure under composer`, disc.length > 40);
  ok(`${locale}: disclosure has incompleteness note`, /incomplete or inaccurate|ناقص یا نادرست/.test(disc));

  // starters
  const starters = await p.locator('.mind-full-starter').allInnerTexts();
  ok(`${locale}: 6 starters`, starters.length === 6);
  ok(`${locale}: starters are the executive set`, starters.some((t) => /autonomy|اختیار/.test(t)) && starters.some((t) => /evidence|شواهد/.test(t)));
  ok(`${locale}: NO books starter`, !starters.some((t) => /book|کتاب/i.test(t)));

  // composer + widget labels
  ok(`${locale}: placeholder`, /project, decision|پروژه‌ها یا رویکرد/.test(await p.locator('.mind-compose-page textarea').getAttribute('placeholder') || ''));
  ok(`${locale}: no model call on load`, api.length === 0);

  // SEO
  const title = await p.title();
  ok(`${locale}: SEO title`, /Beyond the Résumé|فراتر از رزومه/.test(title));
  const desc = await p.locator('meta[name="description"]').getAttribute('content');
  ok(`${locale}: SEO description`, (desc || '').length > 80);
  const og = await p.locator('meta[property="og:title"]').getAttribute('content');
  ok(`${locale}: og title aligned`, (og || '').includes(locale === 'fa' ? 'فراتر از رزومه' : 'Beyond the Résumé'));

  // mobile overflow + screenshot
  await p.screenshot({ path: `public-mind/captures/copy-${locale}-desktop.png` });
  const m = await b.newContext({ viewport: { width: 390, height: 844 } });
  const mp = await m.newPage();
  await mp.goto(`${BASE}/${locale}/mind`, { waitUntil: 'load' });
  await mp.waitForTimeout(600);
  const ov = await mp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(`${locale}: mobile no overflow`, ov <= 0);
  const h1Visible = await mp.locator('.mind-full-h1').isVisible();
  ok(`${locale}: mobile headline visible`, h1Visible);
  await mp.screenshot({ path: `public-mind/captures/copy-${locale}-mobile.png` });
  await m.close();

  // floating widget copy
  await p.goto(`${BASE}/${locale}`, { waitUntil: 'load' });
  await p.waitForTimeout(6500); // invitation delay
  const invite = await p.locator('.mind-invite').innerText().catch(() => '');
  ok(`${locale}: invite copy`, /decisions behind the work|چه تصمیم‌هایی بوده/.test(invite));
  const fab = await p.locator('.mind-fab').innerText();
  ok(`${locale}: fab label`, fab.includes(locale === 'fa' ? 'گفت‌وگو' : 'Ask'));
  await p.locator('.mind-fab').click();
  await p.waitForTimeout(400);
  const empty = await p.locator('.mind-empty-title').innerText();
  ok(`${locale}: empty-state heading`, /What would you like to explore|کدام تصمیم یا تجربه/.test(empty));
  const chips = await p.locator('.mind-sugg-chip').allInnerTexts();
  ok(`${locale}: 6 short widget chips`, chips.length === 6);
  ok(`${locale}: widget chips short (<=48 chars)`, chips.every((c) => c.length <= 48));
  ok(`${locale}: NO books chip`, !chips.some((c) => /book|کتاب/i.test(c)));
  const ph = await p.locator('#mind-input').getAttribute('placeholder');
  ok(`${locale}: widget placeholder`, /project, decision|پروژه‌ها یا رویکرد/.test(ph || ''));
  // panel disclosure (header sub)
  const pdis = await p.locator('.mind-head-sub').innerText();
  ok(`${locale}: panel disclosure`, /not a direct conversation|نه گفت‌وگوی مستقیم/.test(pdis));
  await p.screenshot({ path: `public-mind/captures/copy-${locale}-widget.png` });
  await ctx.close();
}

await b.close();
console.log(log.join('\n'));
console.log(process.exitCode ? 'COPY QA FAILURES' : 'COPY QA ALL PASS');
