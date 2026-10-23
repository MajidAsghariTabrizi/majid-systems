/** Local visual check of /leadership EN+FA desktop+mobile + home hiring links. */
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3100';
const outDir = 'captures-career/local';
fs.mkdirSync(outDir, { recursive: true });
const issues = [];

const browser = await chromium.launch({ channel: 'msedge', headless: true });
for (const [locale, vw, name] of [
  ['en', { width: 1440, height: 1000 }, 'desktop'],
  ['fa', { width: 1440, height: 1000 }, 'desktop'],
  ['en', { width: 390, height: 844 }, 'mobile'],
  ['fa', { width: 390, height: 844 }, 'mobile'],
]) {
  const ctx = await browser.newContext({ viewport: vw });
  const p = await ctx.newPage();
  const errs = [];
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 120)));
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 120)));

  await p.goto(`${BASE}/${locale}/leadership`, { waitUntil: 'load', timeout: 45000 });
  await p.waitForTimeout(900);
  const tag = `${locale}-${name}`;

  // sections present
  const counts = {
    cards: await p.locator('.leadership-card').count(),
    evidenceRows: await p.locator('.leadership-evidence-row').count(),
    chips: await p.locator('.leadership-chip').count(),
    layers: await p.locator('.leadership-layer').count(),
    caseSteps: await p.locator('.leadership-case-structure li').count(),
  };
  console.log(tag, JSON.stringify(counts), 'consoleErrors:', errs.length);
  if (counts.cards !== 3) issues.push(`${tag}: cards=${counts.cards}`);
  if (counts.evidenceRows !== 4) issues.push(`${tag}: evidenceRows=${counts.evidenceRows}`);
  if (counts.layers < 8) issues.push(`${tag}: layers=${counts.layers}`);
  if (counts.caseSteps !== 5) issues.push(`${tag}: caseSteps=${counts.caseSteps}`);
  if (errs.length) issues.push(`${tag}: console ${errs[0]}`);

  // hiring CTA present + links
  const cta = await p.locator(`a[href*="intent=hiring"]`).count();
  if (cta < 1) issues.push(`${tag}: no hiring CTA`);
  const mail = await p.locator('.leadership-contact-mail').count();
  if (mail !== 1) issues.push(`${tag}: contact mail=${mail}`);

  // dir + overflow
  const dir = await p.getAttribute('html', 'dir');
  if (dir !== (locale === 'fa' ? 'rtl' : 'ltr')) issues.push(`${tag}: dir=${dir}`);
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 0) issues.push(`${tag}: overflow=${overflow}px`);

  await p.screenshot({ path: `${outDir}/leadership-${tag}-full.png`, fullPage: true });
  await p.screenshot({ path: `${outDir}/leadership-${tag}-hero.png` });

  // home: hiring link + bridge + nav
  await p.goto(`${BASE}/${locale}`, { waitUntil: 'load', timeout: 45000 });
  await p.waitForTimeout(600);
  const hiringLink = await p.locator('.hero-hiring a').count();
  const navLead = await p.locator(`nav a[href="/${locale}/leadership"]`).count();
  if (hiringLink !== 1) issues.push(`${tag}: home hiring link=${hiringLink}`);
  if (navLead < 1) issues.push(`${tag}: nav leadership link=${navLead}`);
  await p.screenshot({ path: `${outDir}/home-${tag}-hero.png` });
  await ctx.close();
}
await browser.close();
console.log(issues.length ? `ISSUES:\n- ${issues.join('\n- ')}` : 'ALL LOCAL LEADERSHIP CHECKS PASS');
