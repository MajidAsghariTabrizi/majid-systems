import { chromium } from 'playwright';
const BASE = 'http://127.0.0.1:3219';
const NL = String.fromCharCode(10);
const SRC = [
  { id: 's1', title: 'AI Adoption Is Not AI Transformation', url: 'https://quantiviq.xyz/en/insights/ai-adoption-is-not-ai-transformation', type: 'insight', class: 'PUBLIC', language: 'en' },
  { id: 's2', title: 'AI Engineering: Building Applications with Foundation Models', url: 'https://quantiviq.xyz/en/insights/books/ai-engineering', type: 'book', class: 'PUBLIC', language: 'en' },
  { id: 's3', title: 'Phoenix case study', url: 'https://quantiviq.xyz/work/phoenix', type: 'evidence', class: 'ARCHIVED', language: 'en' },
  { id: 's4', title: 'Living Organization: eight layers', url: 'https://quantiviq.xyz/en/system', type: 'concept', class: 'OWNER_ATTESTED', language: 'en' },
];
const WORDS = ('Paragraph one states the honest baseline. Paragraph two develops the counterfactual in detail for measurement. '.repeat(200)).split(' ');
// paced: ~400 chunks x 45ms = 18s
const MOCK = 'const W = ' + JSON.stringify(WORDS) + '; const SRC = ' + JSON.stringify(SRC) + '; const NL = String.fromCharCode(10);' +
'window.__chunks = 0; window.__t0 = performance.now(); window.__times = [];' +
'const of = window.fetch.bind(window); window.fetch = (u, o) => { if (!String(u).includes("/api/public-mind/chat")) return of(u, o);' +
'const enc = new TextEncoder(); let i = 0;' +
'const s = new ReadableStream({ async start(c) { const put = (ev, ob) => c.enqueue(enc.encode("event: " + ev + NL + "data: " + JSON.stringify(ob) + NL + NL));' +
'put("sources", { sources: SRC }); await new Promise((r) => setTimeout(r, 400));' +
'while (i < W.length) { let ch = ""; for (let k = 0; k < 6 && i < W.length; k++, i++) ch += W[i] + " ";' +
'put("delta", { text: ch }); window.__chunks++; window.__times.push(Math.round(performance.now() - window.__t0));' +
'await new Promise((r) => setTimeout(r, 45)); }' +
'await new Promise((r) => setTimeout(r, 300)); put("done", { status: "ok" }); c.close(); } });' +
'return Promise.resolve(new Response(s, { headers: { "content-type": "text/event-stream" } })); };';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
async function route(pg) { await pg.addInitScript({ content: MOCK }); }
async function measure(name, path, chatOpener) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const pg = await ctx.newPage();
  await route(pg);
  await pg.goto(BASE + path, { waitUntil: 'networkidle', timeout: 60000 });
  await chatOpener(pg);
  await pg.waitForTimeout(250);
  const ta = pg.locator('textarea').first();
  await ta.fill('long question'); await ta.press('Enter');
  // wait ~4s of streaming, then reader scrolls UP to read paragraph 2 area
  await pg.waitForTimeout(4000);
  const pre = await pg.evaluate(() => {
    const sc = document.querySelector('.ex2-thread') || document.querySelector('.mind-full-scroll');
    const paras = sc ? [...sc.querySelectorAll('p')] : [];
    const a = paras[0];
    if (!a || !sc) return null;
    a.setAttribute('data-anchor', 'x');
    sc.scrollTop = Math.max(0, a.offsetTop - sc.clientHeight / 2);
    return { top: Math.round(a.getBoundingClientRect().top), st: Math.round(sc.scrollTop), owner: sc.className };
  });
  await pg.waitForTimeout(10000); // 10s more streaming while reading
  const post = await pg.evaluate(() => {
    const sc = document.querySelector('.ex2-thread') || document.querySelector('.mind-full-scroll');
    const a = document.querySelector('[data-anchor=x]');
    return a && sc ? { top: Math.round(a.getBoundingClientRect().top), st: Math.round(sc.scrollTop), docScroll: Math.round(window.scrollY) } : null;
  });
  const streamInfo = await pg.evaluate(() => ({ chunks: window.__chunks, lastT: window.__times.at(-1) }));
  console.log(name, JSON.stringify({ pre, post, drift: pre && post ? Math.abs(post.top - pre.top) : 'n/a', streamInfo }));
  await pg.screenshot({ path: 'captures-chat/' + name + '-before.png' });
  await pg.close(); await ctx.close();
}
await measure('MEET', '/meet-majid', async (pg) => { await pg.locator('.ex2-cta').first().click(); });
await measure('MIND', '/en/mind', async (pg) => {});
await browser.close();