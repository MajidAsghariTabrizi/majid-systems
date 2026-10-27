import { chromium } from 'playwright';
import fs from 'node:fs';
const BASE = 'https://quantiviq.xyz';
const out = {};

// computed ivory check on prod
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const pg = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await pg.goto(BASE + '/en', { waitUntil: 'networkidle', timeout: 60000 });
const ivory = await pg.evaluate(() => {
  const bg = getComputedStyle(document.body).backgroundColor;
  const fg = getComputedStyle(document.body).color;
  const header = document.querySelector('.site-header');
  return { bg, fg, headerBg: header ? getComputedStyle(header).backgroundColor : null };
});
out.ivory = ivory;
console.log('prod tokens:', JSON.stringify(ivory));
// /meet-majid intact
const res = await fetch(BASE + '/meet-majid', { redirect: 'manual' });
out.meet = { status: res.status, robots: res.headers.get('x-robots-tag') };
const mm = await res.text();
out.meet.noindex = mm.includes('noindex');
console.log('meet-majid:', JSON.stringify(out.meet));
// routes
for (const p of ['/en', '/fa', '/en/mind', '/fa/mind', '/en/explore', '/en/about', '/en/insights', '/en/insights/books', '/en/lab', '/en/mind/flows', '/journey', '/work', '/profile', '/en/insights/ai-adoption-is-not-ai-transformation']) {
  const r2 = await fetch(BASE + p, { redirect: 'manual', signal: AbortSignal.timeout(30000) });
  if (r2.status !== 200) console.log('ROUTE FAIL', p, r2.status);
}
console.log('routes: all 200 unless listed above');
// mind chat prod probe
const mind = await fetch(BASE + '/api/public-mind/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session: 'dstprod' + Date.now().toString(36), locale: 'en', messages: [{ role: 'user', content: 'What is the workflow atlas?' }] }), signal: AbortSignal.timeout(120000) });
const mraw = await mind.text();
let mans = '', mdone = null, msrc = 0;
for (const line of mraw.split('\n')) { if (line.startsWith('data:')) { try { const ev = JSON.parse(line.slice(5).trim()); if (ev.sources) msrc = ev.sources.length; if (typeof ev.text === 'string') mans += ev.text; if (ev.status) mdone = ev.status; } catch {} } }
console.log('prod mind:', mind.status, mdone, 'len', mans.length, 'sources', msrc);
// FA Estedad on prod
const pgfa = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await pgfa.goto(BASE + '/fa', { waitUntil: 'networkidle', timeout: 60000 });
const fa = await pgfa.evaluate(async () => { await document.fonts.ready; return { font: getComputedStyle(document.body).fontFamily.split(',')[0], estedad: [...document.fonts].some((f) => f.family === 'Estedad' && f.status === 'loaded'), dir: document.documentElement.dir, lh: getComputedStyle(document.body).lineHeight }; });
console.log('prod FA:', JSON.stringify(fa));
// prod screenshots
fs.mkdirSync('captures-dst/prod', { recursive: true });
for (const [name, route] of [['home', '/en'], ['home-fa', '/fa'], ['explore', '/en/explore'], ['mind', '/en/mind'], ['mind-fa', '/fa/mind'], ['article', '/en/insights/ai-adoption-is-not-ai-transformation'], ['lab', '/en/lab'], ['meet', '/meet-majid']]) {
  const p = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto(BASE + route, { waitUntil: 'networkidle', timeout: 60000 });
  await p.screenshot({ path: 'captures-dst/prod/' + name + '.png' });
  await p.close();
}
console.log('prod screenshots saved');
fs.writeFileSync('captures-dst/prod/verification.json', JSON.stringify(out, null, 1));
await browser.close();
