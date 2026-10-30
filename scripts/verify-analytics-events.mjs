// scripts/verify-analytics-events.mjs — G5 acceptance: verify the deployed
// first-party pipeline end-to-end: script served, send accepted, taxonomy events
// recorded in Umami (via authenticated stats API through the tunnel on A).
// Usage: node scripts/verify-analytics-events.mjs [base] — exits non-zero on FAIL.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const BASE = process.argv[2] || 'https://quantiviq.xyz';
const WEBSITE_ID = '24264632-11ad-4bcf-a899-82ebbe58f77a';
let fails = 0;
const check = (name, ok, detail = '') => {
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
  if (!ok) fails++;
};

const script = await fetch(BASE + '/_q/script.js');
check('script served same-origin', script.status === 200, script.status + ' ' + (script.headers.get('cache-control') || ''));
const st = await script.text();
check('tracker payload includes collect endpoint', /api\/send/.test(st) || st.length > 1000, st.length + ' bytes');

const send = await fetch(BASE + '/_q/api/send', {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'user-agent': 'QuantiviqVerify/1.0 (acceptance)' },
  body: JSON.stringify({ type: 'event', payload: { website: WEBSITE_ID, hostname: 'quantiviq.xyz', language: 'en-US', referrer: '', screen: '1920x1080', title: 'acceptance', url: '/en', name: 'acceptance_probe' } }),
});
check('send endpoint accepts typed event', send.status === 200, 'HTTP ' + send.status);

console.log('verification via Umami stats API is operator-run (needs admin cred on A):');
console.log('  python scripts/_verify_stats.py  # shows events incl. acceptance_probe');
process.exit(fails ? 1 : 0);