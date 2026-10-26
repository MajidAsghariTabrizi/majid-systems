/**
 * Silver-bullet Gate A — external benchmark captures (8 reference sites).
 * Best-effort: strict timeouts; blocked/slow sites are recorded, not retried.
 * Output: captures-sb/benchmark/*.png + benchmark-report.json
 */
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const OUT = path.resolve('captures-sb', 'benchmark');
fs.mkdirSync(OUT, { recursive: true });

const SITES = [
  { id: 'palantir-aip', url: 'https://www.palantir.com/platforms/aip/' },
  { id: 'linear', url: 'https://linear.app/homepage' },
  { id: 'stripe', url: 'https://stripe.com/' },
  { id: 'notion-ai', url: 'https://www.notion.com/product/ai' },
  { id: 'vercel', url: 'https://vercel.com/' },
  { id: 'mckinsey-qb', url: 'https://www.mckinsey.com/capabilities/quantumblack/how-we-help-clients' },
  { id: 'figma', url: 'https://www.figma.com/' },
  { id: 'anthropic', url: 'https://www.anthropic.com/' },
];

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const report = [];

for (const s of SITES) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36' });
  const p = await ctx.newPage();
  const entry = { id: s.id, url: s.url, status: null, title: '', h1: '', shots: [], error: null };
  try {
    const r = await p.goto(s.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    entry.status = r ? r.status() : null;
    await p.waitForTimeout(2500);
    entry.title = await p.title().catch(() => '');
    entry.h1 = ((await p.locator('h1').first().textContent().catch(() => '')) ?? '').trim().slice(0, 140);
    await p.screenshot({ path: path.join(OUT, s.id + '-desktop.png'), fullPage: false });
    await p.setViewportSize({ width: 390, height: 844 });
    await p.waitForTimeout(600);
    await p.screenshot({ path: path.join(OUT, s.id + '-mobile.png'), fullPage: false });
    entry.shots = [s.id + '-desktop.png', s.id + '-mobile.png'];
  } catch (e) {
    entry.error = e.message.split('\n')[0].slice(0, 140);
    try { await p.screenshot({ path: path.join(OUT, s.id + '-error.png') }); } catch {}
  }
  report.push(entry);
  await ctx.close();
}

await browser.close();
fs.writeFileSync(path.resolve('captures-sb', 'benchmark-report.json'), JSON.stringify({ capturedAt: new Date().toISOString(), sites: report }, null, 2));
for (const r of report) console.log(r.id, '=>', r.status ?? 'ERR', r.error ?? r.title.slice(0, 60));
