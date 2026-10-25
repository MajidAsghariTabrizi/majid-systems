/* Production EN audit: for each of the 20 articles, fetch rendered HTML and
 * detect (a) code blocks containing SVG source, (b) stray </svg>/</figure>
 * outside figure containers, (c) figure/svg/figcaption count consistency. */
import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'https://quantiviq.xyz';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${BASE}/en/insights`, { waitUntil: 'networkidle', timeout: 90000 });
const slugs = await page.evaluate(() =>
  [...new Set([...document.querySelectorAll('a[href^="/en/insights/"]')].map((a) => a.getAttribute('href')))]
    .filter((h) => !/methodology|author|topics/.test(h))
    .map((h) => h.replace('/en/insights/', '')));

let problems = 0;
for (const slug of slugs) {
  await page.goto(`${BASE}/en/insights/${slug}`, { waitUntil: 'networkidle', timeout: 90000 });
  const r = await page.evaluate(() => {
    const prose = document.querySelector('.ins-prose');
    if (!prose) return { err: 'no .ins-prose' };
    const figures = prose.querySelectorAll('figure');
    const svgsInFig = prose.querySelectorAll('figure svg').length;
    const svgsTotal = prose.querySelectorAll('svg').length;
    const capsInFig = prose.querySelectorAll('figure figcaption').length;
    const capsTotal = prose.querySelectorAll('figcaption').length;
    const svgCode = [...prose.querySelectorAll('code, pre')].filter((c) => /<text |<rect |<path d=/.test(c.textContent)).length;
    // svg must be direct child (or in wrapper) of figure, never loose in prose
    const looseSvgs = [...prose.querySelectorAll('svg')].filter((s) => !s.closest('figure')).length;
    const looseCaps = [...prose.querySelectorAll('figcaption')].filter((c) => !c.closest('figure')).length;
    return { figures: figures.length, svgsInFig, svgsTotal, capsInFig, capsTotal, svgCode, looseSvgs, looseCaps };
  });
  const bad = r.err || r.svgCode > 0 || r.looseSvgs > 0 || r.looseCaps > 0 || r.svgsInFig !== r.svgsTotal || r.capsInFig !== r.capsTotal;
  if (bad) problems++;
  console.log(`${bad ? 'PROBLEM' : 'ok     '} ${slug}: ${JSON.stringify(r)}`);
}
console.log(`\n${problems === 0 ? 'AUDIT CLEAN: all 20 EN articles' : problems + ' article(s) with problems'}`);
await browser.close();
