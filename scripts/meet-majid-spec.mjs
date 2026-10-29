import { chromium } from 'playwright';
const NL = String.fromCharCode(10);
const SRC = [
  { id: 's1', title: 'AI Adoption Is Not AI Transformation', url: 'https://quantiviq.xyz/en/insights/ai-adoption-is-not-ai-transformation', type: 'insight', class: 'PUBLIC', language: 'en' },
  { id: 's2', title: 'AI Engineering: Building Applications with Foundation Models', url: 'https://quantiviq.xyz/en/insights/books/ai-engineering', type: 'book', class: 'PUBLIC', language: 'en' },
  { id: 's3', title: 'Phoenix case study', url: 'https://quantiviq.xyz/work/phoenix', type: 'evidence', class: 'ARCHIVED', language: 'en' },
];
const LONG = ('Measured value requires an honest baseline, a counterfactual and a ledger of seven metrics. Interpretation stays labeled as interpretation. ').repeat(24);
const MOCK = 'const W = ' + JSON.stringify(LONG.split(' ')) + '; const SRC = ' + JSON.stringify(SRC) + '; const NL = String.fromCharCode(10);' +
'const of = window.fetch.bind(window); window.fetch = (u, o) => { if (!String(u).includes("/api/public-mind/chat")) return of(u, o); const enc = new TextEncoder(); let i = 0;' +
'const s = new ReadableStream({ async start(c) { const put = (ev, ob) => c.enqueue(enc.encode("event: " + ev + NL + "data: " + JSON.stringify(ob) + NL + NL));' +
'put("sources", { sources: SRC }); await new Promise((r) => setTimeout(r, 250));' +
'while (i < W.length) { let ch = ""; for (let k = 0; k < 6 && i < W.length; k++, i++) ch += W[i] + " "; put("delta", { text: ch }); await new Promise((r) => setTimeout(r, 25)); }' +
'put("done", { status: "ok" }); c.close(); } });' +
'return Promise.resolve(new Response(s, { headers: { "content-type": "text/event-stream" } })); };';
const R = {};
function pass(k, ok, d) { R[k] = ok ? 'PASS' : 'FAIL'; console.log(k, R[k], d ?? ''); }
const browser = await chromium.launch({ channel: 'msedge', headless: true });

for (const [loc, vw, vh, tag] of [['en', 1440, 900, 'desktop'], ['fa', 1440, 900, 'desktop'], ['en', 390, 844, 'mobile'], ['fa', 390, 844, 'mobile'], ['en', 320, 700, 'reflow']]) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh } });
  const pg = await ctx.newPage();
  await pg.addInitScript({ content: MOCK });
  await pg.goto('http://127.0.0.1:3219/meet-majid', { waitUntil: 'networkidle', timeout: 60000 });
  if (loc === 'fa') { await pg.locator('.ex-locale-toggle button[aria-pressed=false]').click(); await pg.waitForTimeout(250); }
  const L = await pg.evaluate(() => ({
    h1: document.querySelector('h1')?.textContent,
    h1Count: document.querySelectorAll('h1').length,
    ctaVisible: (() => { const b = [...document.querySelectorAll('button')].find((x) => /conversation|Start|شروع|ادامه/.test(x.textContent ?? '')); if (!b) return false; const r = b.getBoundingClientRect(); return r.top > 0 && r.top < window.innerHeight && r.height > 0; })(),
    ctaTop: Math.round([...document.querySelectorAll('button')].find((x) => /conversation|شروع|ادامه/.test(x.textContent ?? ''))?.getBoundingClientRect().top ?? -1),
    starters: document.querySelectorAll('.ex2-starter').length,
    general: !!document.querySelector('.ex2-general-btn'),
    diagram: !!document.querySelector('.mx-stage'),
    diagramLabels: [document.querySelector('.mx-q')?.textContent, document.querySelector('.mx-mind-label')?.textContent, document.querySelectorAll('.mx-src').length],
    examples: [...document.querySelectorAll('.ex2-examples a')].map((a) => a.getAttribute('href')),
    unlisted: document.body.textContent.includes('Unlisted, not private') || document.body.textContent.includes('فهرست‌نشده'),
    ovf: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    dir: document.documentElement.dir,
    mainSite: !!document.querySelector('.ex2-main-link'),
  }));
  const lang = await pg.evaluate(() => document.documentElement.lang);
  pass('landing-' + loc + '-' + tag, L.h1Count === 1 && L.ctaVisible && L.ctaTop < (tag === 'mobile' || tag === 'reflow' ? 844 : 900) && L.starters === 3 && L.general && L.diagram && L.ovf === 0 && L.examples.length === 3 && lang === loc, JSON.stringify({ ctaTop: L.ctaTop, starters: L.starters, ovf: L.ovf, dir: L.dir }));
  if (loc === 'en' && tag === 'desktop') await pg.screenshot({ path: 'captures-mm/en-desktop-landing.png', fullPage: true });
  if (loc === 'fa' && tag === 'desktop') await pg.screenshot({ path: 'captures-mm/fa-desktop-landing.png', fullPage: true });
  if (tag === 'mobile') await pg.screenshot({ path: 'captures-mm/' + loc + '-mobile-landing.png', fullPage: false });
  await pg.close(); await ctx.close();
}

// journey: CTA -> composer focused, no auto-send; starters; draft; return keeps history
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const pg = await ctx.newPage();
await pg.addInitScript({ content: MOCK });
let chatCalls = 0;
await pg.goto('http://127.0.0.1:3219/meet-majid', { waitUntil: 'networkidle', timeout: 60000 });
pg.on('request', (r) => { if (r.url().includes('/api/public-mind/chat')) chatCalls++; });
const cta = pg.locator('.ex2-cta').first();
await cta.click();
await pg.waitForTimeout(300);
const j1 = await pg.evaluate(() => ({ stage: !!document.querySelector('.ex2-thread'), focused: document.activeElement?.tagName === 'TEXTAREA', suggestions: document.querySelectorAll('.ex-suggest').length, asked: document.querySelector('.ex-hint')?.textContent }));
pass('cta-enters-chat', j1.stage && j1.focused && j1.suggestions === 3, JSON.stringify(j1));
pass('no-auto-request', chatCalls === 0, 'chat api calls after CTA: ' + chatCalls);
// starter prefill (no send)
const sug = pg.locator('.ex-suggest').first();
await sug.click();
await pg.waitForTimeout(200);
const j2 = await pg.evaluate(() => ({ draft: document.querySelector('.ex-input')?.value?.length ?? 0, calls: 0 }));
pass('starter-prefills', j2.draft > 10 && chatCalls === 0, 'draft len=' + j2.draft);
// send via Enter, stream, then return to intro and back — history + draft preserved
await pg.keyboard.press('Enter');
await pg.waitForSelector('.mind-cite', { timeout: 20000 });
await pg.waitForTimeout(4500);
const j3 = await pg.evaluate(() => ({ msgs: document.querySelectorAll('.ex-msg').length, cites: document.querySelectorAll('.mind-cite').length }));
pass('shared-renderer-stream', j3.msgs === 2 && j3.cites >= 3, JSON.stringify(j3));
// open evidence inspector
await pg.locator('.mind-cite').first().dispatchEvent('click');
await pg.waitForTimeout(250);
const j4 = await pg.evaluate(() => ({ open: !!document.querySelector('.mind-evidence'), title: document.querySelector('.mind-evidence-title')?.textContent?.slice(0, 24) }));
pass('inspector-opens', j4.open && !!j4.title, JSON.stringify(j4));
await pg.keyboard.press('Escape');
// back to intro (keeps messages), CTA shows Continue, return keeps history
await pg.locator('.ex-back-btn').click();
await pg.waitForTimeout(250);
const j5 = await pg.evaluate(() => ({ intro: !!document.querySelector('.ex2-landing'), ctaText: document.querySelector('.ex2-cta')?.textContent?.trim() }));
pass('back-keeps-conversation', j5.intro && /Continue|ادامه/.test(j5.ctaText ?? ''), JSON.stringify(j5));
await pg.locator('.ex2-cta').first().click();
await pg.waitForTimeout(300);
const j6 = await pg.evaluate(() => ({ msgs: document.querySelectorAll('.ex-msg').length, suggestions: document.querySelectorAll('.ex-suggest').length }));
pass('continue-preserves-history', j6.msgs === 2 && j6.suggestions === 0, JSON.stringify(j6));
// keyboard focus + lang switch mid-conversation
await pg.locator('.ex-locale-toggle button[aria-pressed=false]').click();
await pg.waitForTimeout(300);
const j7 = await pg.evaluate(() => ({ dir: document.documentElement.dir, msgs: document.querySelectorAll('.ex-msg').length, lang: document.documentElement.lang }));
pass('lang-switch-keeps-history', j7.dir === 'rtl' && j7.msgs === 2 && j7.lang === 'fa', JSON.stringify(j7));
await pg.screenshot({ path: 'captures-mm/fa-desktop-chat.png' });
await pg.close(); await ctx.close();

// example links resolve (main site pages)
const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const pg2 = await ctx2.newPage();
const hrefs = ['/en/insights/ai-adoption-is-not-ai-transformation', '/en/insights/books/ai-engineering', '/en/system'];
const codes = [];
for (const h of hrefs) { const res = await pg2.goto('http://127.0.0.1:3219' + h, { waitUntil: 'domcontentloaded' }).catch(() => null); codes.push(res ? res.status() : 0); }
pass('example-links-200', codes.every((c) => c === 200), codes.join(','));
await pg2.close(); await ctx2.close();

await browser.close();
const fails = Object.entries(R).filter(([, v]) => v !== 'PASS');
console.log('MM SPEC:', fails.length === 0 ? 'ALL PASS' : fails.map(([k]) => k).join(','));
process.exit(fails.length === 0 ? 0 : 1);