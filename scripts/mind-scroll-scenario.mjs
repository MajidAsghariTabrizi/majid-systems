import { chromium } from 'playwright';
const BASE = process.argv[2];
const LABEL = process.argv[3];
const NL = String.fromCharCode(10);
const WORDS = ('The AI-native organization redesign must be measured against an honest baseline and a serious counterfactual. ' +
  'A counterfactual matters more than a dashboard: what would the same function have cost and delivered without the redesign? ' +
  '## A seven-metric value ledger ' +
  '- cycle time from signal to decision - decision latency percentiles - rework and handoff counts - knowledge reuse rate ' +
  '- agent execution success under authority gates - human override frequency and reasons - realized economics ' +
  'A 90-day pilot holds one function fixed, measures both physics, and refuses to scale on anecdotes. ' +
  'Knowledge persists across turns; interpretation stays labeled as interpretation. ').repeat(6).split(' ');
const SRC = [
  { id: 's1', title: 'AI Adoption Is Not AI Transformation', url: 'https://quantiviq.xyz/en/insights/ai-adoption-is-not-ai-transformation', type: 'insight', class: 'PUBLIC', language: 'en' },
  { id: 's2', title: 'AI Engineering: Building Applications with Foundation Models', url: 'https://quantiviq.xyz/en/insights/books/ai-engineering', type: 'book', class: 'PUBLIC', language: 'en' },
  { id: 's3', title: 'Phoenix case study', url: 'https://quantiviq.xyz/work/phoenix', type: 'evidence', class: 'ARCHIVED', language: 'en' },
  { id: 's4', title: 'Living Organization: eight layers', url: 'https://quantiviq.xyz/en/system', type: 'concept', class: 'OWNER_ATTESTED', language: 'en' },
  { id: 's5', title: 'Twelve organizational flows', url: 'https://quantiviq.xyz/en/mind/flows', type: 'org_flow', class: 'PUBLIC', language: 'en' },
  { id: 's6', title: 'Rewired: McKinsey Playbook', url: 'https://quantiviq.xyz/en/insights/books/rewired', type: 'book', class: 'PUBLIC', language: 'en' },
  { id: 's7', title: 'free-best-router', url: 'https://github.com/MajidAsghariTabrizi/free-best-router', type: 'repo', class: 'PUBLIC', language: 'en' },
];
const MOCK = 'const WORDS = ' + JSON.stringify(WORDS) + '; const SRC = ' + JSON.stringify(SRC) + '; const NL = String.fromCharCode(10);' +
  'const origFetch = window.fetch.bind(window);' +
  'window.fetch = (u, o) => {' +
    'if (!String(u).includes("/api/public-mind/chat")) return origFetch(u, o);' +
    'const enc = new TextEncoder();' +
    'let i = 0;' +
    'const stream = new ReadableStream({ async start(c) {' +
      'const put = (ev, obj) => c.enqueue(enc.encode("event: " + ev + NL + "data: " + JSON.stringify(obj) + NL + NL));' +
      'put("sources", { sources: SRC });' +
      'await new Promise((r) => setTimeout(r, 300));' +
      'while (i < WORDS.length) {' +
        'let chunk = "";' +
        'for (let k = 0; k < 6 && i < WORDS.length; k++, i++) chunk += WORDS[i] + " ";' +
        'put("delta", { text: chunk });' +
        'await new Promise((r) => setTimeout(r, 25));' +
      '}' +
      'await new Promise((r) => setTimeout(r, 250));' +
      'put("done", { status: "ok" });' +
      'c.close();' +
    '}});' +
    'return Promise.resolve(new Response(stream, { headers: { "content-type": "text/event-stream" } }));' +
  '};';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const pg = await ctx.newPage();
await pg.addInitScript({ content: MOCK });
await pg.goto(BASE + '/en/mind', { waitUntil: 'networkidle', timeout: 60000 });
// programmatic scrollTop setter detector on the actual scroll owner
await pg.evaluate(() => {
  window.__prog = [];
  const el = document.querySelector('.mind-full-scroll');
  if (!el) return;
  const d = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollTop');
  Object.defineProperty(el, 'scrollTop', {
    get() { return d.get.call(this); },
    set(v) { window.__prog.push({ t: Math.round(performance.now()), v: Math.round(v) }); d.set.call(this, v); },
    configurable: true,
  });
});
const ta = pg.locator('textarea').first();
await ta.fill('prove value');
await ta.press('Enter');
await pg.waitForSelector('.mind-msg-ai', { timeout: 15000 });
await pg.waitForTimeout(1800);
const atBottomMid = await pg.evaluate(() => { const el = document.querySelector('.mind-full-scroll'); return { dist: Math.round(el.scrollHeight - el.scrollTop - el.clientHeight), progSoFar: window.__prog.length }; });
// M2 anchor: second paragraph of the AI answer, scrolled to center
const anchorTop = await pg.evaluate(() => {
  const el = document.querySelector('.mind-full-scroll');
  const ps = el.querySelectorAll('.mind-msg-ai p');
  const a = ps[1] || ps[0];
  a.setAttribute('data-anchor', 'm2');
  a.scrollIntoView({ block: 'center' });
  return Math.round(a.getBoundingClientRect().top);
});
const stBefore = await pg.evaluate(() => Math.round(document.querySelector('.mind-full-scroll').scrollTop));
const progBefore = await pg.evaluate(() => window.__prog.length);
await pg.waitForTimeout(5200); // >= 100 more chunks while reading
const after = await pg.evaluate(() => ({
  top: Math.round(document.querySelector('[data-anchor=m2]').getBoundingClientRect().top),
  st: Math.round(document.querySelector('.mind-full-scroll').scrollTop),
  progAfter: window.__prog.length,
}));
console.log(LABEL, JSON.stringify({ atBottomMid, anchorTopBefore: anchorTop, anchorTopAfter: after.top, driftPx: Math.abs(after.top - anchorTop), scrollTopBefore: stBefore, scrollTopAfter: after.st, progScrollsDuringReading: after.progAfter - progBefore, snapAtEnd: Math.abs(after.st - stBefore) > 40 }));
await pg.screenshot({ path: 'captures-mind/' + LABEL + '-m2.png' });
await browser.close();