/** Focused: contact CTA appears after the stream COMPLETES (not mid-stream). */
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'msedge', headless: true });
let failed = false;
for (const locale of ['en', 'fa']) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 950 } });
  const p = await ctx.newPage();
  await p.goto(`https://quantiviq.xyz/${locale}/mind`, { waitUntil: 'load', timeout: 60000 });
  await p.locator('.mind-full-starter').nth(3).click(); // "How does he connect Product, Engineering…" / FA equivalent
  await p.waitForSelector('.mind-msg-ai .mind-bubble', { timeout: 30000 });
  // wait for stream completion: typing indicator gone + text stable for 6s
  let last = '';
  for (let i = 0; i < 45; i++) {
    const t = (await p.locator('.mind-msg-ai .mind-bubble').last().innerText()).trim();
    if (t === last && t.length > 100 && !(await p.locator('.mind-typing').isVisible().catch(() => false))) break;
    last = t;
    await p.waitForTimeout(2000);
  }
  await p.waitForTimeout(500);
  const cta = await p.locator('.mind-contact-page').isVisible().catch(() => false);
  const answerLen = last.length;
  console.log(`${locale}: stream complete (${answerLen} chars), contact CTA visible = ${cta}`);
  if (!cta || answerLen < 150) failed = true;
  await ctx.close();
}
await b.close();
console.log(failed ? 'CTA CHECK FAILED' : 'CTA CHECK PASS');
process.exitCode = failed ? 1 : 0;
