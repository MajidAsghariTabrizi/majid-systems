import { chromium } from 'playwright';
const BASE = 'http://127.0.0.1:3219';
const NL = String.fromCharCode(10);
const LONGW = ('Paragraph for measurement the honest baseline and counterfactual matter more than a dashboard. '.repeat(60)).split(' ');
const SRC = [
  { id: 's1', title: 'AI Adoption Is Not AI Transformation', url: 'https://quantiviq.xyz/x', type: 'insight', class: 'PUBLIC', language: 'en' },
  { id: 's2', title: 'AI Engineering', url: 'https://quantiviq.xyz/y', type: 'book', class: 'PUBLIC', language: 'en' },
];
const mock = 'const W = ' + JSON.stringify(LONGW) + '; const SRC = ' + JSON.stringify(SRC) + '; const NL = String.fromCharCode(10);' +
'const of = window.fetch.bind(window); window.fetch = (u, o) => { if (!String(u).includes("/api/public-mind/chat")) return of(u, o);' +
'const enc = new TextEncoder(); let i = 0; const s = new ReadableStream({ async start(c) {' +
'const put = (ev, ob) => c.enqueue(enc.encode("event: " + ev + NL + "data: " + JSON.stringify(ob) + NL + NL));' +
'put("sources", { sources: SRC }); await new Promise((r) => setTimeout(r, 150));' +
'while (i < W.length) { let ch = ""; for (let k = 0; k < 5 && i < W.length; k++, i++) ch += W[i] + " "; put("delta", { text: ch }); await new Promise((r) => setTimeout(r, 25)); }' +
'put("done", { status: "ok" }); c.close(); } });' +
'return Promise.resolve(new Response(s, { headers: { "content-type": "text/event-stream" } })); };';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const pg = await ctx.newPage();
await pg.addInitScript({ content: mock });
await pg.goto(BASE + '/meet-majid', { waitUntil: 'networkidle' });
await pg.locator('.ex2-cta').first().tap();
await pg.waitForTimeout(250);
await pg.evaluate(() => { window.__ev = []; const el = document.querySelector('.ex2-transcript'); const d = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollTop'); Object.defineProperty(el, 'scrollTop', { get() { return d.get.call(this); }, set(v) { window.__ev.push(['SET', Math.round(v), Math.round(performance.now()), String(new Error().stack).split(String.fromCharCode(10)).slice(1, 4).join(' | ').slice(0, 220)]); d.set.call(this, v); }, configurable: true }); el.addEventListener('scroll', () => window.__ev.push(['scroll', Math.round(el.scrollTop), Math.round(performance.now())]), { passive: true }); });
const ta = pg.locator('textarea').first();
await ta.fill('touch q'); await ta.press('Enter');
await pg.waitForSelector('.mind-msg-ai p', { timeout: 15000 });
await pg.waitForTimeout(2500);
const jumpEl = pg.locator('.ex-jump');
console.log('jump count before tap:', await jumpEl.count());
const jb = await jumpEl.boundingBox();
console.log('jump box:', JSON.stringify(jb));
await jumpEl.tap();
await pg.waitForTimeout(400);
const t0 = await pg.evaluate(() => Math.round(document.querySelector('.ex2-transcript').scrollTop));
console.log('t0 after jump tap:', t0);
const cdp = await ctx.newCDPSession(pg);
await cdp.send('Input.emulateTouchFromMouseEvent', { type: 'mouseWheel', x: 195, y: 600, deltaX: 0, deltaY: -400, timestamp: Math.floor(Date.now() / 1000), button: 'none', clickCount: 0, modifiers: 0 });
await pg.waitForTimeout(900);
const r = await pg.evaluate(() => ({ st: Math.round(document.querySelector('.ex2-transcript').scrollTop), ev: window.__ev.slice(-8), jump: !!document.querySelector('.ex-jump') }));
console.log('after touch:', JSON.stringify(r));
await browser.close();