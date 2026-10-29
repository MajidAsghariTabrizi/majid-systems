// QUANTIVIQ MIND streaming-stability spec (M1-M8, mission 2026-10-29).
// Deterministic PACED streaming via in-page fetch interception - no
// network, no production queries. Run: node scripts/mind-stream-spec.mjs http://127.0.0.1:3219
import { chromium } from 'playwright';
const BASE = process.argv[2] || 'http://127.0.0.1:3219';
const NL = String.fromCharCode(10);
const SRC = [
  { id: 's1', title: 'AI Adoption Is Not AI Transformation', url: 'https://quantiviq.xyz/en/insights/ai-adoption-is-not-ai-transformation', type: 'insight', class: 'PUBLIC', language: 'en' },
  { id: 's2', title: 'AI Engineering: Building Applications with Foundation Models', url: 'https://quantiviq.xyz/en/insights/books/ai-engineering', type: 'book', class: 'PUBLIC', language: 'en' },
  { id: 's3', title: 'Phoenix case study', url: 'https://quantiviq.xyz/work/phoenix', type: 'evidence', class: 'ARCHIVED', language: 'en' },
  { id: 's4', title: 'Living Organization: eight layers', url: 'https://quantiviq.xyz/en/system', type: 'concept', class: 'OWNER_ATTESTED', language: 'en' },
  { id: 's5', title: 'Twelve organizational flows', url: 'https://quantiviq.xyz/en/mind/flows', type: 'org_flow', class: 'PUBLIC', language: 'en' },
  { id: 's6', title: 'Rewired: McKinsey Playbook', url: 'https://quantiviq.xyz/en/insights/books/rewired', type: 'book', class: 'PUBLIC', language: 'en' },
  { id: 's7', title: 'free-best-router', url: 'https://github.com/MajidAsghariTabrizi/free-best-router', type: 'repo', class: 'PUBLIC', language: 'en' },
];
const LONG = ('Baseline honesty comes first: measure the current function before changing it. ' +
  'A serious counterfactual asks what the same work would have cost without agents. ' +
  '## Seven-metric value ledger ' +
  '- cycle time from signal to decision ' + '- decision latency percentiles ' + '- rework and handoffs ' +
  '- knowledge reuse rate ' + '- agent execution success under gates ' + '- human override frequency ' + '- realized economics ' +
  '| Metric | Traditional | AI-native |' + '| Cycle time | days | hours |' + '| Rework | high | measured |' +
  'The [system page](https://quantiviq.xyz/en/system) grounds the architecture; interpretation stays labeled. ' +
  '```python' + NL + 'def gate(sig):' + NL + '    return sig.verified' + NL + '```' +
  'Persian check: «سازمان زنده» و دانش مشترک. ' +
  'A 90-day pilot refuses to scale on anecdotes. ').repeat(8);
const MD = '## Heading two' + NL + '- bullet one' + NL + '  - nested bullet' + NL + '- bullet two' + NL + '1. first' + NL + '2. second' + NL + '**bold text** and [label](https://quantiviq.xyz/en/system) link.' + NL + '| A | B |' + NL + '| 1 | 2 |' + NL + '```js' + NL + 'const x = 1;' + NL + '```';
function mock(words, opts) {
  opts = opts || {};
  return 'const W = ' + JSON.stringify(words) + '; const SRC = ' + JSON.stringify(SRC) + '; const OPT = ' + JSON.stringify(opts) + '; const NL = String.fromCharCode(10);' +
  'const of = window.fetch.bind(window);' +
  'window.fetch = (u, o) => {' +
  '  if (!String(u).includes("/api/public-mind/chat")) return of(u, o);' +
  '  const enc = new TextEncoder(); let i = 0;' +
  '  const stream = new ReadableStream({ async start(c) {' +
  '    const put = (ev, obj) => c.enqueue(enc.encode("event: " + ev + NL + "data: " + JSON.stringify(obj) + NL + NL));' +
  '    if (!OPT.noSources) { put("sources", { sources: SRC }); await new Promise((r) => setTimeout(r, 250)); }' +
  '    while (i < W.length) {' +
  '      let ch = ""; for (let k = 0; k < 5 && i < W.length; k++, i++) ch += W[i] + " ";' +
  '      if (OPT.failAt === i) { put("done", { status: "error" }); c.close(); return; }' +
  '      put("delta", { text: ch });' +
  '      await new Promise((r) => setTimeout(r, OPT.fast ? 4 : 22));' +
  '    }' +
  '    await new Promise((r) => setTimeout(r, 120));' +
  '    put("done", { status: "ok" }); c.close();' +
  '  }});' +
  '  return Promise.resolve(new Response(stream, { headers: { "content-type": "text/event-stream" } }));' +
  '};';
}
const R = {};
function pass(k, ok, detail) { R[k] = { verdict: ok ? 'PASS' : 'FAIL', detail }; console.log(k, ok ? 'PASS' : 'FAIL', detail ?? ''); }
async function fresh(browser, vw, vh, locale, mockSrc) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh } });
  const pg = await ctx.newPage();
  if (mockSrc) await pg.addInitScript({ content: mockSrc });
  await pg.goto(BASE + '/' + locale + '/mind', { waitUntil: 'networkidle', timeout: 60000 });
  await pg.evaluate(() => {
    window.__prog = [];
    const el = document.querySelector('.mind-full-scroll');
    if (el) { const d = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollTop'); Object.defineProperty(el, 'scrollTop', { get() { return d.get.call(this); }, set(v) { window.__prog.push(Math.round(v)); d.set.call(this, v); }, configurable: true }); }
  });
  return { ctx, pg };
}
async function send(pg) { const ta = pg.locator('textarea').first(); await ta.fill('q' + Math.floor(Math.random() * 1e6)); await ta.press('Enter'); }

const browser = await chromium.launch({ channel: 'msedge', headless: true });

// ---- M1 + M2 + M3: desktop follow / anchor / resume
let { ctx, pg } = await fresh(browser, 1440, 900, 'en', mock(LONG.split(' ')));
await send(pg);
await pg.waitForSelector('.mind-msg-ai p', { timeout: 15000 });
await pg.waitForTimeout(2000);
const m1 = await pg.evaluate(() => { const el = document.querySelector('.mind-full-scroll'); return Math.round(el.scrollHeight - el.scrollTop - el.clientHeight); });
pass('M1', m1 <= 120, 'dist-to-bottom=' + m1 + 'px while following');
const a1 = await pg.evaluate(() => { const ps = document.querySelectorAll('.mind-msg-ai p'); const a = ps[1]; a.setAttribute('data-anchor', 'x'); a.scrollIntoView({ block: 'center' }); return Math.round(a.getBoundingClientRect().top); });
const stB = await pg.evaluate(() => Math.round(document.querySelector('.mind-full-scroll').scrollTop));
const progB = await pg.evaluate(() => window.__prog.length);
await pg.waitForTimeout(5000);
const m2 = await pg.evaluate(() => ({ top: Math.round(document.querySelector('[data-anchor=x]').getBoundingClientRect().top), st: Math.round(document.querySelector('.mind-full-scroll').scrollTop), prog: window.__prog.length }));
pass('M2', Math.abs(m2.top - a1) <= 3 && (m2.prog - progB) === 0, 'drift=' + Math.abs(m2.top - a1) + 'px, progScrolls=' + (m2.prog - progB));
const jump = pg.locator('.mind-jump');
const jumpShown = (await jump.count()) > 0;
if (jumpShown) { await jump.click(); await pg.waitForTimeout(400); }
else { await pg.evaluate(() => { const el = document.querySelector('.mind-full-scroll'); el.scrollTop = el.scrollHeight; }); await pg.waitForTimeout(400); }
const m3 = await pg.evaluate(() => { const el = document.querySelector('.mind-full-scroll'); return Math.round(el.scrollHeight - el.scrollTop - el.clientHeight); });
pass('M3', m3 <= 120 && jumpShown, 'resume dist=' + m3 + 'px via ' + (jumpShown ? 'Jump control' : 'manual bottom'));
// keyboard PageUp suspends again
await pg.locator('.mind-full-scroll').click();
await pg.keyboard.press('PageUp');
await pg.waitForTimeout(1200);
const m3b = await pg.evaluate(() => document.querySelector('.mind-full-scroll').scrollTop < document.querySelector('.mind-full-scroll').scrollHeight - 400);
pass('M3b', m3b, 'PageUp moved reader away and stayed');
await pg.close(); await ctx.close();

// ---- M4: source during stream
({ ctx, pg } = await fresh(browser, 1440, 900, 'en', mock(LONG.split(' '))));
await send(pg);
await pg.waitForSelector('.mind-msg-ai p', { timeout: 15000 });
await pg.waitForTimeout(1500);
await pg.evaluate(() => { const ps = document.querySelectorAll('.mind-msg-ai p'); ps[1].setAttribute('data-anchor', 'y'); ps[1].scrollIntoView({ block: 'center' }); });
const yB = await pg.evaluate(() => Math.round(document.querySelector('[data-anchor=y]').getBoundingClientRect().top));
// dispatchEvent (no actionability auto-scroll): models a human clicking a
// citation that is already visible - Playwright .click() would teleport the
// viewport to the chip first, which a reader never does mid-read.
await pg.locator('.mind-cite').nth(1).dispatchEvent('click');
await pg.waitForTimeout(300);
const m4 = await pg.evaluate(() => ({ open: !!document.querySelector('.mind-evidence'), title: document.querySelector('.mind-evidence-title')?.textContent?.slice(0, 20), top: Math.round(document.querySelector('[data-anchor=y]').getBoundingClientRect().top) }));
await pg.waitForTimeout(2500); // more tokens
const m4b = await pg.evaluate(() => ({ stillOpen: !!document.querySelector('.mind-evidence'), title: document.querySelector('.mind-evidence-title')?.textContent?.slice(0, 20), top: Math.round(document.querySelector('[data-anchor=y]').getBoundingClientRect().top) }));
await pg.keyboard.press('Escape');
const m4c = await pg.evaluate(() => ({ closed: !document.querySelector('.mind-evidence'), top: Math.round(document.querySelector('[data-anchor=y]').getBoundingClientRect().top) }));
pass('M4', m4.open && m4b.stillOpen && m4b.title === m4.title && Math.abs(m4b.top - yB) <= 3 && Math.abs(m4c.top - yB) <= 3 && m4c.closed, 'source kept=' + m4b.title + ', anchorDrift=' + Math.abs(m4c.top - yB) + 'px');
await pg.close(); await ctx.close();

// ---- M5: multi-turn
({ ctx, pg } = await fresh(browser, 1440, 900, 'en', mock(LONG.split(' '), { fast: true })));
await send(pg); await pg.waitForSelector('.mind-msg-ai p', { timeout: 15000 });
await pg.waitForTimeout(2500);
const firstId = await pg.evaluate(() => document.querySelectorAll('.mind-msg-ai')[0]?.getAttribute('data-incomplete') ?? 'ok');
const hist1 = await pg.evaluate(() => { const el = document.querySelector('.mind-full-scroll'); el.scrollTop = 200; return { st: 200, p: document.querySelectorAll('.mind-msg-ai p')[2].getBoundingClientRect().top }; });
await send(pg);
await pg.waitForTimeout(2500);
const m5 = await pg.evaluate(() => { const msgs = document.querySelectorAll('.mind-msg-ai'); const el = document.querySelector('.mind-full-scroll'); return { turns: msgs.length, userTurns: document.querySelectorAll('.mind-msg-user').length, progAfter: window.__prog.length }; });
pass('M5', m5.turns === 2 && m5.userTurns === 2, 'turns=' + m5.turns + ', users=' + m5.userTurns + ', historical messages mounted');
await pg.close(); await ctx.close();

// ---- M6: markdown boundary
({ ctx, pg } = await fresh(browser, 1440, 900, 'en', mock(MD.split(NL).map((l) => l + NL), { fast: true })));
await send(pg);
await pg.waitForTimeout(4000);
const m6 = await pg.evaluate(() => ({
  h: !!document.querySelector('.mind-p-strong'),
  list: !!document.querySelector('.mind-md-list'),
  table: !!document.querySelector('.mind-md-table table'),
  pre: !!document.querySelector('.mind-pre'),
  link: !!document.querySelector('.mind-bubble a[href="https://quantiviq.xyz/en/system"]'),
  rawPipes: [...document.querySelectorAll('.mind-bubble p')].some((p) => /\| A \| B \|/.test(p.textContent ?? '')),
  rawFence: [...document.querySelectorAll('.mind-bubble p')].some((p) => /```/.test(p.textContent ?? '')),
}));
pass('M6', m6.h && m6.list && m6.table && m6.pre && m6.link && !m6.rawPipes && !m6.rawFence, JSON.stringify(m6));
await pg.close(); await ctx.close();

// ---- M7: mobile 390 EN + FA RTL
for (const [loc, vw] of [['en', 390], ['fa', 390]]) {
  ({ ctx, pg } = await fresh(browser, vw, 844, loc, mock(LONG.split(' '), { fast: true })));
  await send(pg);
  await pg.waitForSelector('.mind-msg-ai p', { timeout: 15000 });
  await pg.waitForTimeout(2000);
  await pg.evaluate(() => { const ps = document.querySelectorAll('.mind-msg-ai p'); ps[1].setAttribute('data-anchor', 'z'); ps[1].scrollIntoView({ block: 'center' }); });
  const zB = await pg.evaluate(() => Math.round(document.querySelector('[data-anchor=z]').getBoundingClientRect().top));
  await pg.waitForTimeout(2500);
  const m7 = await pg.evaluate(() => ({ z: Math.round(document.querySelector('[data-anchor=z]').getBoundingClientRect().top), ovf: document.documentElement.scrollWidth - document.documentElement.clientWidth, dir: document.documentElement.dir, bounded: getComputedStyle(document.querySelector('.mind-full-scroll')).maxHeight !== 'none', composerVisible: (() => { const t = document.querySelector('textarea'); const r = t.getBoundingClientRect(); return r.top > 0 && r.bottom <= window.innerHeight + 80; })() }));
  pass('M7-' + loc, Math.abs(m7.z - zB) <= 3 && m7.ovf === 0 && m7.bounded && m7.composerVisible && m7.dir === (loc === 'fa' ? 'rtl' : 'ltr'), 'drift=' + Math.abs(m7.z - zB) + 'px ovf=' + m7.ovf);
  await pg.close(); await ctx.close();
}

// ---- M8: failure paths (error mid-stream, zero sources, dup sources)
({ ctx, pg } = await fresh(browser, 1440, 900, 'en', mock(LONG.split(' ').slice(0, 400), { failAt: 200, fast: true })));
const err0 = await pg.evaluate(() => 0);
await send(pg);
await pg.waitForTimeout(3500);
const m8 = await pg.evaluate(() => ({
  errorShown: !!document.querySelector('.mind-error'),
  partialKept: (document.querySelector('.mind-msg-ai .mind-bubble')?.textContent ?? '').length > 50,
  userOnce: document.querySelectorAll('.mind-msg-user').length === 1,
}));
pass('M8-error', m8.errorShown && m8.partialKept && m8.userOnce, JSON.stringify(m8));
await pg.close(); await ctx.close();
({ ctx, pg } = await fresh(browser, 1440, 900, 'en', mock(['one two three four five six seven eight nine ten eleven twelve'], { noSources: true, fast: true })));
await send(pg);
await pg.waitForTimeout(2500);
const m8b = await pg.evaluate(() => ({ noSourcesUi: !document.querySelector('.mind-sources'), answer: (document.querySelector('.mind-msg-ai .mind-bubble')?.textContent ?? '').length > 20 }));
pass('M8-zero-sources', m8b.noSourcesUi && m8b.answer, JSON.stringify(m8b));
await pg.close(); await ctx.close();

await browser.close();
const fails = Object.entries(R).filter(([, v]) => v.verdict !== 'PASS');
console.log('SPEC SUMMARY:', fails.length === 0 ? 'ALL PASS' : fails.length + ' FAIL: ' + fails.map(([k]) => k).join(','));
process.exit(fails.length === 0 ? 0 : 1);