import { chromium } from 'playwright';
import fs from 'node:fs';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const pg = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await pg.goto('http://127.0.0.1:3219/en/insights/books', { waitUntil: 'networkidle' });

// 1. axe-core via CDN
await pg.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/axe-core@4.10.0/axe.min.js' });
const axe = await pg.evaluate(async () => {
  const r = await window.axe.run(document, { resultTypes: ['violations'] });
  return r.violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length, target: v.nodes[0].target.join(' '), fix: v.nodes[0].failureSummary?.split('\n')[1]?.slice(0, 90) }));
});
console.log('AXE violations (books):', JSON.stringify(axe.filter(v => ['critical','serious','moderate'].includes(v.impact)), null, 1));

// 2. heading order dump
const heads = await pg.evaluate(() => [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => h.tagName + ': ' + (h.textContent || '').trim().slice(0, 40)));
console.log('HEADINGS:', heads.slice(0, 12).join(' | '));

// 3. links whose accessible name mismatches visible text
const mism = await pg.evaluate(() => {
  const out = [];
  for (const a of document.querySelectorAll('a, button')) {
    const vis = (a.textContent || '').trim().slice(0, 30);
    const acc = (a.getAttribute('aria-label') || a.getAttribute('aria-labelledby') || vis).slice(0, 30);
    const alt = a.getAttribute('aria-label');
    if (alt && vis && !alt.toLowerCase().includes(vis.toLowerCase().slice(0, 8)) && !vis.toLowerCase().includes(alt.toLowerCase().slice(0, 8))) out.push({ vis, alt });
  }
  return out.slice(0, 5);
});
console.log('NAME-MISMATCH candidates:', JSON.stringify(mism));
await browser.close();