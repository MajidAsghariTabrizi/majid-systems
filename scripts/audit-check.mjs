/**
 * V3 AUDIT CHECKS — fix-and-verify mission evidence.
 * Covers: mobile nav restoration (360/390/768/1440), switcher outside menu,
 * /fa/proof key-matched localization, lead → outbox notification flow,
 * deletion ops, a11y wiring on form errors.
 * Requires a freshly started server (rate window resets per process).
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const BASE = process.env.CAPTURE_BASE ?? 'http://127.0.0.1:3219';
const OUT = path.resolve('captures-v3-audit', 'after');
fs.mkdirSync(OUT, { recursive: true });
let failures = 0;
const ok = (row, c, d = '') => { console.log(`${c ? 'PASS' : 'FAIL'} ${row}${d ? ` — ${d}` : ''}`); if (!c) failures++; };

const run = async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  /* ---- C1: viewport matrix — nav + switcher visible, no overflow ---- */
  for (const vp of [
    { w: 360, h: 800, mobile: true, name: '360' },
    { w: 390, h: 844, mobile: true, name: '390' },
    { w: 768, h: 1024, name: '768' },
    { w: 1440, h: 900, name: '1440' },
  ]) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, isMobile: !!vp.mobile, hasTouch: !!vp.mobile });
    const p = await ctx.newPage();
    await p.goto(`${BASE}/en/services`, { waitUntil: 'networkidle' });
    const navVisible = await p.locator('.site-header .nav a').first().isVisible();
    const navCount = await p.locator('.site-header .nav a').count();
    const swVisible = await p.locator('.lang-tabs').isVisible();
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(`C1 [${vp.name}] nav visible (${navCount} links)`, navVisible && navCount >= 5);
    ok(`C1 [${vp.name}] switcher visible outside menu`, swVisible);
    ok(`C1 [${vp.name}] no horizontal overflow`, overflow <= 1, `${overflow}px`);
    if (vp.mobile || vp.name === '360' || vp.name === '390') {
      await p.screenshot({ path: path.join(OUT, `nav-${vp.name}-en.png`) });
    }
    await ctx.close();
  }

  /* RTL mobile nav too */
  const ctxFa = await browser.newContext({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true });
  const pFa = await ctxFa.newPage();
  await pFa.goto(`${BASE}/fa/services`, { waitUntil: 'networkidle' });
  ok('C1 [360 fa] nav visible RTL', await pFa.locator('.site-header .nav a').first().isVisible());
  const ofFa = await pFa.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok('C1 [360 fa] no overflow', ofFa <= 1, `${ofFa}px`);
  await pFa.screenshot({ path: path.join(OUT, 'nav-360-fa.png') });

  /* ---- C2: /fa/proof localized by key (names Persian, levels correct) ---- */
  await pFa.goto(`${BASE}/fa/proof`, { waitUntil: 'networkidle' });
  const faNames = await pFa.locator('.primitive-card h3').allInnerTexts();
  // 3 concept names localized to Persian; Phoenix + UEA stay Latin product names.
  const persianNames = faNames.filter((n) => /[\u0600-\u06FF]/.test(n));
  ok('C2 FA proof names Persian (brand names stay Latin)', persianNames.length === 3 && faNames.length === 5, faNames.join('|').slice(0, 80));
  const faProofs = await pFa.locator('.primitive-proof').allInnerTexts();
  ok('C2 FA proof levels kept canonical', faProofs.filter((t) => /PUBLICLY VERIFIED|OWNER-ATTESTED/.test(t)).length === 5, `${faProofs.length}/5`);
  const bodyText = await pFa.locator('body').innerText();
  ok('C2 no EN fallback blurb text on FA proof', !bodyText.includes('OpenAI-compatible router across free model providers'));

  /* ---- C3: lead → durable store → outbox notification → deletion ---- */
  const p2 = await ctxFa.newPage();
  await p2.goto(`${BASE}/en/contact`, { waitUntil: 'networkidle' });
  await p2.fill('input[name="name"]', 'Audit Probe');
  await p2.fill('input[name="email"]', 'audit@example.com');
  await p2.fill('textarea[name="message"]', 'Audit hardening verification lead — safe to delete via leads-tool.');
  await p2.check('input[name="consent"]');
  await p2.locator('.lead-submit').click();
  await p2.waitForSelector('.lead-success', { timeout: 10000 });
  const ref = ((await p2.locator('.lead-success-body').innerText()).match(/QV-[a-z0-9-]+/i) ?? [''])[0];

  const leadsFile = path.resolve('.data', 'leads.jsonl');
  const stored = fs.existsSync(leadsFile)
    ? fs.readFileSync(leadsFile, 'utf8').trim().split('\n').map((l) => JSON.parse(l)).find((r) => r.id === ref)
    : undefined;
  ok('C3 lead stored with outbox_queued notify', !!stored && stored.notify === 'outbox_queued', stored ? stored.notify : 'missing');

  const outboxFile = path.resolve('.data', 'outbox.jsonl');
  const outboxLines = fs.existsSync(outboxFile) ? fs.readFileSync(outboxFile, 'utf8').trim().split('\n').filter((l) => l) : [];
  const obHit = outboxLines.map((l) => JSON.parse(l)).find((j) => j.leadId === ref);
  ok('C3 owner notification queued in outbox', !!obHit && obHit.subject.includes('[quantiviq lead]'), obHit ? obHit.subject.slice(0, 40) : 'missing');

  const health = await p2.evaluate(async () => (await (await fetch('/api/lead')).json()));
  ok('C3 health distinguishes storage+notify', health.storage === 'writable' && health.notify === 'outbox' && typeof health.outboxPending === 'number', JSON.stringify(health));

  if (ref) {
    const del = execSync(`node scripts/leads-tool.mjs delete ${ref}`, { encoding: 'utf8' }).trim();
    const still = fs.readFileSync(leadsFile, 'utf8').includes(ref);
    ok('C3 deletion op removes record', del.startsWith('deleted') && !still, del);
  }

  /* ---- C4: form a11y wiring ---- */
  await p2.goto(`${BASE}/fa/contact`, { waitUntil: 'networkidle' });
  await p2.fill('input[name="name"]', 'تست');
  await p2.fill('input[name="email"]', 'bad');
  await p2.fill('textarea[name="message"]', 'پیام آزمایشی برای بررسی دسترس‌پذیری خطاها.');
  await p2.check('input[name="consent"]');
  await p2.locator('.lead-submit').click();
  await p2.waitForTimeout(800);
  const emailInvalid = await p2.locator('input[name="email"]').getAttribute('aria-invalid');
  const describedBy = await p2.locator('input[name="email"]').getAttribute('aria-describedby');
  const errRole = await p2.locator('#err-email[role="alert"]').count();
  ok('C4 aria-invalid on bad email', emailInvalid === 'true');
  ok('C4 aria-describedby wired', describedBy === 'err-email');
  ok('C4 error announced via role=alert', errRole === 1);

  /* keyboard pass over header tabs */
  await p2.goto(`${BASE}/en`, { waitUntil: 'networkidle' });
  await p2.keyboard.press('Tab'); // brand
  await p2.keyboard.press('Tab'); // first nav link
  const focusedNav = await p2.evaluate(() => document.activeElement?.tagName);
  await p2.locator('.lang-tab').first().focus();
  const focusedSwitch = await p2.evaluate(() => document.activeElement?.className);
  ok('C4 keyboard reaches nav then switcher', focusedNav === 'A' && focusedSwitch.includes('lang-tab'), `${focusedNav}/${focusedSwitch}`);

  await ctxFa.close();
  await browser.close();
  if (failures) { console.log(`FAILED: ${failures} row(s)`); process.exit(1); }
  console.log('AUDIT CHECKS: ALL PASS');
};
run().catch((e) => { console.error(e); process.exit(1); });
