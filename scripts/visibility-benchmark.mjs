// scripts/visibility-benchmark.mjs — G5: reproducible search & AI answer
// visibility measurement with explicit denominators. NO synthetic mentions.
import fs from 'node:fs';

const BASE = 'https://quantiviq.xyz';
const OUT = 'docs/discoverability/16_VISIBILITY_BASELINE.json';
const results = { generatedAt: new Date().toISOString(), metrics: [] };
const metric = (name, num, den, note = '') => results.metrics.push({ name, numerator: num, denominator: den, ratio: den ? +(num / den).toFixed(3) : null, note });

const sm = await (await fetch(BASE + '/sitemap.xml')).text();
const urls = (sm.match(/<loc>/g) || []).length;
metric('sitemap_urls', urls, urls, 'all sitemap entries are candidate documents');

let live = [];
try {
  const bing = await fetch('https://www.bing.com/search?q=' + encodeURIComponent('site:quantiviq.xyz') + '&count=30', { headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } });
  const html = await bing.text();
  live = [...html.matchAll(/quantiviq\.xyz\/[a-z\/\-]*/g)].map((m) => m[0]);
  metric('bing_site_indexed_pages', new Set(live).size, urls, 'unique quantiviq.xyz paths in first SERP vs sitemap size (approx, bot-dependent)');
} catch (e) {
  metric('bing_site_indexed_pages', 0, urls, 'SERP fetch failed: ' + String(e).slice(0, 60));
}

const robots = await (await fetch(BASE + '/robots.txt')).text();
metric('ai_search_crawlers_allowed', ['OAI-SearchBot', 'ChatGPT-User', 'GPTBot', 'ClaudeBot'].filter((b) => robots.includes(b)).length, 4, 'explicit AI-crawler grants in robots.txt');

const llms = await (await fetch(BASE + '/llms.txt')).text();
metric('llms_txt_public_urls', (llms.match(/https:\/\/quantiviq\.xyz/g) || []).length, urls, 'llms.txt coverage of public corpus');

const aud = JSON.parse(fs.readFileSync('docs/discoverability/07_route_probe_raw.json', 'utf8'));
const ok200 = aud.results.filter((r) => r.status === 200 && String(r.contentType).includes('html'));
metric('routes_serving_200_html', ok200.length, aud.results.length, 'live probe both vantages');
metric('routes_with_canonical', ok200.filter((r) => r.canonical).length, ok200.length, 'self-canonical coverage');
metric('routes_with_hreflang', ok200.filter((r) => Array.isArray(r.hreflang) && r.hreflang.length > 0).length, ok200.length, 'hreflang cluster coverage (case-insensitive match, 2026-10-30 re-probe)');

fs.mkdirSync('docs/discoverability', { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(results, null, 1));
for (const m of results.metrics) console.log(m.name.padEnd(28), String(m.numerator).padStart(4), '/', String(m.denominator).padStart(4), m.ratio !== null ? '  (' + m.ratio + ')' : '', ' ' + m.note.slice(0, 70));
console.log('written ' + OUT);
console.log('NOTE: AI-answer citation checks (ChatGPT/Perplexity) are operator-run; never claimed without recorded answer transcripts (see 15_AI_EVALUATION_PLAN.md)');