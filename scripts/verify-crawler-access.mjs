// scripts/verify-crawler-access.mjs — G5 acceptance: AI crawler policy + reachability.
// Verifies robots.txt grants OAI-SearchBot/ChatGPT-User (independently of GPTBot),
// llms.txt exists, and logs which verified AI bots actually hit the site recently
// (nginx log scan must be run on A; hint printed).
const BASE = process.argv[2] || 'https://quantiviq.xyz';
let fails = 0;
const check = (n, ok, d = '') => { console.log((ok ? 'PASS' : 'FAIL') + ' ' + n + (d ? ' — ' + d : '')); if (!ok) fails++; };
const robots = await (await fetch(BASE + '/robots.txt')).text();
check('robots allows OAI-SearchBot', /User-Agent:\s*OAI-SearchBot\s*\nAllow:\s*\//.test(robots.replace(/\r/g, '')));
check('robots allows ChatGPT-User', /User-Agent:\s*ChatGPT-User\s*\nAllow:\s*\//.test(robots.replace(/\r/g, '')));
check('GPTBot decision explicit + independent', /GPTBot/.test(robots));
check('sitemap referenced', /Sitemap: https:\/\/quantiviq\.xyz\/sitemap\.xml/.test(robots));
const llms = await fetch(BASE + '/llms.txt');
check('llms.txt served', llms.status === 200, 'HTTP ' + llms.status);
const key = await fetch(BASE + '/a7f3c9e21b84d5f6092c7e1a4b8d36f5.txt');
check('IndexNow key file served', key.status === 200);
const sm = await (await fetch(BASE + '/sitemap.xml')).text();
check('sitemap has >= 100 URLs', (sm.match(/<loc>/g) || []).length >= 100, (sm.match(/<loc>/g) || []).length + ' urls');
console.log('NOTE bot-hit evidence: run on A: grep -h -E "OAI-SearchBot|GPTBot|ChatGPT-User|Googlebot" /var/log/nginx/access.log | tail -20');
process.exit(fails ? 1 : 0);