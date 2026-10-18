/** Dump non-Persian node labels/roles rendered on /fa (diagnostic probe). */
import { chromium } from 'playwright';

const BASE = process.env.CAPTURE_BASE ?? 'http://127.0.0.1:3219';
const P = /[\u0600-\u06FF]/;

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(`${BASE}/fa`, { waitUntil: 'networkidle', timeout: 45000 });
await p.waitForTimeout(800);

const labels = await p.locator('.sim-node-label').allTextContents();
const roles = await p.locator('.sim-node-role').allTextContents();
const aria = await p.locator('.sim-node').first().getAttribute('aria-label');

console.log('NON-PERSIAN LABELS:', JSON.stringify(labels.filter((t) => t.trim() && !P.test(t))));
console.log('NON-PERSIAN ROLES:', JSON.stringify(roles.filter((t) => t.trim() && !P.test(t))));
console.log('ARIA SAMPLE:', aria);

await p.close();
await browser.close();
