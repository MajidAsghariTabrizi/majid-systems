// scripts/indexnow-submit.mjs — submit real content changes to IndexNow
// (Bing + Yandex + IndexNow key hosts). Usage:
//   node scripts/indexnow-submit.mjs https://quantiviq.xyz/en/insights/foo [more urls...]
// Only submit URLs whose content genuinely changed (mission rule).
import fs from 'node:fs';
import crypto from 'node:crypto';

const KEY_FILE = 'public/' + (process.env.INDEXNOW_KEY || 'a7f3c9e21b84d5f6092c7e1a4b8d36f5') + '.txt';
const key = fs.readFileSync(KEY_FILE, 'utf-8').trim();
const urls = process.argv.slice(2).filter((u) => /^https:\/\/quantiviq\.xyz\//.test(u));
if (urls.length === 0) { console.error('no valid quantiviq.xyz URLs given'); process.exit(1); }
const body = { host: 'quantiviq.xyz', key, keyLocation: 'https://quantiviq.xyz/' + KEY_FILE.split('/').pop(), urlList: urls };
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
});
console.log('IndexNow response:', res.status, urls.length + ' urls @', new Date().toISOString());
if (res.status === 202) console.log('accepted (processing async)');
process.exit(res.status >= 400 ? 1 : 0);