/** Single targeted retry: CTA visible after stream completes on PRODUCTION. */
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'msedge', headless: true });
let failed = false;
for (const locale of ['en', 'fa']) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 950 } });
  const p = await ctx.newPage();
  await p.goto(`https://quantiviq.xyz/${locale}/mind`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.locator('.mind-full-starter').nth(3).click({ timeout: 30000 });
  await p.waitForSelector('.mind-msg-ai .mind-bubble', { timeout: 30000 });
  let last = '';
  for (let i = 0; i < 45; i++) {
    const t = (await p.locator('.mind-msg-ai .mind-bubble').last().innerText()).trim();
    if (t === last && t.length > 100 && !(await p.locator('.mind-typing').isVisible().catch(() => false))) break;
    last = t;
    await p.waitForTimeout(2000);
  }
  await p.waitForTimeout(600);
  const cta = await p.locator('.mind-contact-page').isVisible().catch(() => false);
  const label = cta ? await p.locator('.mind-contact-page').innerText() : '(not visible)';
  console.log(`${locale}: stream complete (${last.length} chars), CTA=${cta} label=${JSON.stringify(label)}`);
  if (!cta || last.length < 150) failed = true;
  await ctx.close();
}
await b.close();
console.log(failed ? 'CTA RETRY FAILED' : 'CTA RETRY PASS');
process.exitCode = failed ? 1 : 0;
