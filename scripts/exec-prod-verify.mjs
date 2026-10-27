/**
 * PRODUCTION verification of the Executive Dialogue at https://quantiviq.xyz.
 * Route + headers + isolation, real multi-turn conversation with context
 * retention + challenge, citation validity, /en/mind regression, screenshots.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = 'https://quantiviq.xyz';
const out = {};

// 1. route + headers
const res = await fetch(BASE + '/meet-majid', { redirect: 'manual', signal: AbortSignal.timeout(30000) });
out.route = { status: res.status, robots: res.headers.get('x-robots-tag'), cache: res.headers.get('cache-control') };
const html = await res.text();
out.content = {
  noindexMeta: /noindex/.test(html),
  hasName: html.includes('MAJID ASGHARI TABRIZI'),
  hasHeadline: html.includes('Challenge how I think'),
  noPublicNav: !html.includes('site-header') && !html.includes('site-footer'),
};
console.log('route:', JSON.stringify(out.route), '| content:', JSON.stringify(out.content));

// 2. isolation: not in sitemap, not linked from public pages
const sm = await (await fetch(BASE + '/sitemap.xml')).text();
out.sitemapClean = !sm.includes('meet-majid');
console.log('sitemap clean:', out.sitemapClean);

// 3. multi-turn conversation via public gateway (persona executive)
async function chat(session, messages, locale = 'en') {
  const r = await fetch(BASE + '/api/public-mind/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session, locale, persona: 'executive', messages }), signal: AbortSignal.timeout(120000) });
  const raw = await r.text();
  let answer = '', done = null, sources = [];
  for (const line of raw.split('\n')) {
    if (!line.startsWith('data:')) continue;
    try { const ev = JSON.parse(line.slice(5).trim()); if (ev.sources) sources = ev.sources; if (typeof ev.text === 'string') answer += ev.text; if (ev.status) done = ev.status; } catch {}
  }
  return { status: r.status, done, answer, sources };
}
const s = 'prodexec' + Date.now().toString(36);
const t1 = await chat(s, [{ role: 'user', content: 'What has Majid actually shipped, and what remains experimental?' }]);
out.turn1 = { done: t1.done, len: t1.answer.length, sources: t1.sources.length, namesProjects: /Phoenix/i.test(t1.answer) && /(Smart ?Trader|Free Best Router|Universal Engineering Agent)/i.test(t1.answer) };
console.log('turn1:', JSON.stringify({ done: t1.done, len: t1.answer.length, sources: t1.sources.length, namesProjects: out.turn1.namesProjects }));
// turn 2: follow-up relying on turn-1 context
const t2 = await chat(s, [
  { role: 'user', content: 'What has Majid actually shipped, and what remains experimental?' },
  { role: 'assistant', content: t1.answer.slice(0, 1800) },
  { role: 'user', content: 'You mentioned the retired one. Why was retiring it the right call, and what does that decision prove about his judgment?' },
]);
out.turn2 = { done: t2.done, len: t2.answer.length, referencesContext: /retir|negative result|shut/i.test(t2.answer), sources: t2.sources.length };
console.log('turn2 (context retention):', JSON.stringify(out.turn2));
// turn 3: challenge
const t3 = await chat(s, [
  { role: 'user', content: 'What has Majid actually shipped, and what remains experimental?' },
  { role: 'assistant', content: t1.answer.slice(0, 1200) },
  { role: 'user', content: 'Challenge your own answer: what is the weakest claim in it?' },
]);
out.turn3 = { done: t3.done, len: t3.answer.length, challenges: /(weakest|however|counter|risk|assum)/i.test(t3.answer) };
console.log('turn3 (challenge):', JSON.stringify(out.turn3));
// FA turn
const t4 = await chat(s + 'fa', [{ role: 'user', content: '\u0645\u062c\u06cc\u062f \u0648\u0627\u0642\u0639\u0627\u064b \u0686\u0647 \u0686\u06cc\u0632\u06cc \u0631\u0627 \u0628\u0647 \u062a\u0648\u0644\u06cc\u062f \u0631\u0633\u0627\u0646\u062f\u0647\u061f' }], 'fa');
out.turnFA = { done: t4.done, len: t4.answer.length, persian: /[\u0600-\u06FF]/.test(t4.answer), sources: t4.sources.length };
console.log('turnFA:', JSON.stringify(out.turnFA));
// citation validity + no malformed URLs
const allAnswers = [t1.answer, t2.answer, t3.answer, t4.answer].join(' ');
out.badUrls = allAnswers.match(/https?:\/\/(?!quantiviq\.xyz|github\.com\/MajidAsghariTabrizi)[a-z0-9.-]+/gi) ?? [];
out.citeUrlsValid = [...t1.sources, ...t2.sources].every((x) => /^https:\/\/(quantiviq\.xyz|github\.com\/MajidAsghariTabrizi)(\/|$)/.test(x.url));
console.log('badUrls:', out.badUrls.length, '| citeUrlsValid:', out.citeUrlsValid);

// 4. /en/mind regression (default persona)
const mind = await fetch(BASE + '/api/public-mind/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session: 'prodmindreg' + Date.now().toString(36), locale: 'en', messages: [{ role: 'user', content: 'What is the workflow atlas?' }] }), signal: AbortSignal.timeout(120000) });
const mraw = await mind.text();
let mans = '', mdone = null, msrc = 0;
for (const line of mraw.split('\n')) { if (!line.startsWith('data:')) continue; try { const ev = JSON.parse(line.slice(5).trim()); if (ev.sources) msrc = ev.sources.length; if (typeof ev.text === 'string') mans += ev.text; if (ev.status) mdone = ev.status; } catch {} }
out.mindRegression = { status: mind.status, done: mdone, len: mans.length, sources: msrc };
console.log('/en/mind regression:', JSON.stringify(out.mindRegression));

// 5. production screenshots
const browser = await chromium.launch({ channel: 'msedge', headless: true });
fs.mkdirSync('captures-exec/prod', { recursive: true });
for (const [w, h, tag] of [[1440, 900, '1440'], [390, 844, '390']]) {
  const pg = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
  await pg.goto(BASE + '/meet-majid', { waitUntil: 'networkidle', timeout: 60000 });
  await pg.screenshot({ path: 'captures-exec/prod/intro-' + tag + '.png', fullPage: w === 390 });
  if (w === 1440) {
    await pg.locator('.ex-path').nth(1).click();
    await pg.locator('.ex-suggest').first().click();
    await pg.locator('.ex-cite').first().waitFor({ timeout: 90000 }).catch(() => {});
    await pg.waitForTimeout(3000);
    await pg.screenshot({ path: 'captures-exec/prod/chat-1440.png' });
  }
  await pg.close();
}
await browser.close();
console.log('screenshots saved');
fs.writeFileSync('captures-exec/prod/verification.json', JSON.stringify(out, null, 1));
console.log('PROD VERIFICATION:', (out.route.status === 200 && out.content.noindexMeta && out.content.hasName && out.sitemapClean && out.turn1.done === 'ok' && out.turn2.done === 'ok' && out.turn3.done === 'ok' && out.turnFA.done === 'ok' && out.badUrls.length === 0 && out.citeUrlsValid && out.mindRegression.done === 'ok') ? 'ALL GATES PASS' : 'CHECK FAILURES');
