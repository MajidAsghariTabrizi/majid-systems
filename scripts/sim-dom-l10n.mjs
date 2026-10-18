/**
 * Rendered-DOM localization probe for the organization simulator.
 * The unit tests cover the data bundle; this proves the component actually
 * renders Persian on /fa and English on /en in a real browser.
 */
import { chromium } from 'playwright';

const BASE = process.env.CAPTURE_BASE ?? 'http://127.0.0.1:3219';
const P = /[\u0600-\u06FF]/;
const fails = [];
const ok = (name, cond, detail = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
  if (!cond) fails.push(name);
};

const browser = await chromium.launch({ channel: 'msedge', headless: true });

/** goto with one retry — production runs cross a real network. */
async function goto(p, url) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      return true;
    } catch (e) {
      if (attempt === 1) console.log(`goto retry exhausted for ${url}: ${e.message.split('\n')[0]}`);
      await p.waitForTimeout(1500);
    }
  }
  return false;
}

/* ---------- FA ---------- */
{
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  if (!(await goto(p, `${BASE}/fa`))) ok('FA page load', false, 'networkidle timed out twice');

  // the SVG title/desc localized
  const title = await p.locator('svg title').first().textContent().catch(() => '');
  ok('FA svg <title> Persian', P.test(title ?? ''), (title ?? '').slice(0, 40));

  // node labels rendered inside the SVG are Persian
  const labels = await p.locator('.sim-node-label').allTextContents();
  const persianLabels = labels.filter((t) => P.test(t));
  ok('FA node labels rendered Persian', labels.length >= 20 && persianLabels.length === labels.filter((t) => t.trim() !== '' && t.trim() !== 'Slack').length, `${persianLabels.length}/${labels.length} Persian`);

  // node roles rendered Persian
  const roles = await p.locator('.sim-node-role').allTextContents();
  const persianRoles = roles.filter((t) => P.test(t));
  ok('FA node roles rendered Persian', roles.length >= 10 && persianRoles.length === roles.filter((t) => t.trim() !== '').length, `${persianRoles.length}/${roles.length}`);

  // metric labels Persian
  const railText = await p.locator('.sim-rail').innerText().catch(() => '');
  ok('FA rail has Persian metric labels', P.test(railText), railText.slice(0, 60).replace(/\n/g, ' | '));

  // send the signal via the primary CTA, then read the strip at runtime
  await p.locator('.sim-shell, [class*="sim-"]').first().scrollIntoViewIfNeeded().catch(() => {});
  await p.waitForTimeout(900);
  const cta = p.locator('.sim-cta.primary').first();
  const ctaCount = await cta.count();
  if (ctaCount > 0) await cta.click({ timeout: 8000 }).catch(() => {});
  await p.waitForTimeout(2500);
  const strip = await p.locator('.sim-strip').innerText().catch(() => '');
  ok('FA runtime strip Persian', P.test(strip), strip.slice(0, 80).replace(/\n/g, ' | '));

  // inspect a node -> dialog copy Persian, aria-label Persian
  const node = p.locator('.sim-node').first();
  const aria = await node.getAttribute('aria-label').catch(() => '');
  ok('FA node aria-label Persian', P.test(aria ?? ''), (aria ?? '').slice(0, 60));
  await node.click();
  await p.waitForTimeout(400);
  const inspect = await p.locator('.sim-inspect').innerText().catch(() => '');
  ok('FA inspection dialog Persian', P.test(inspect), inspect.slice(0, 80).replace(/\n/g, ' | '));
  await p.keyboard.press('Escape');

  // controls
  const controls = await p.locator('.sim-util').innerText().catch(() => '');
  ok('FA controls Persian', P.test(controls), controls.slice(0, 60).replace(/\n/g, ' | '));

  await p.close();
}

/* ---------- EN unchanged ---------- */
{
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  if (!(await goto(p, `${BASE}/en`))) ok('EN page load', false, 'networkidle timed out twice');
  const labels = await p.locator('.sim-node-label').allTextContents();
  const latin = labels.filter((t) => /^[A-Z]/.test(t.trim()));
  ok('EN node labels stay English', labels.length >= 20 && latin.length === labels.filter((t) => t.trim() !== '').length, `${latin.length}/${labels.length}`);
  const title = await p.locator('svg title').first().textContent().catch(() => '');
  ok('EN svg <title> English', (title ?? '').startsWith('Organization simulator'), (title ?? '').slice(0, 40));
  await p.close();
}

await browser.close();
console.log(fails.length ? `SIM DOM L10N: ${fails.length} FAIL` : 'SIM DOM L10N: ALL PASS');
process.exit(fails.length ? 1 : 0);
