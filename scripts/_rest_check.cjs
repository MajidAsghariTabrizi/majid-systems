const fs = require('node:fs');
const KEY = fs.readFileSync(process.env.USERPROFILE + '\\.dsh\\var\\umami-mcp.key', 'utf-8').trim();
const WID = '24264632-11ad-4bcf-a899-82ebbe58f77a';
const startAt = new Date('2026-10-30T00:00:00Z').getTime();
const endAt = new Date('2026-10-30T23:59:59.999Z').getTime();
async function j(p) { const r = await fetch('http://127.0.0.1:3011/api' + p, { headers: { authorization: 'Bearer ' + KEY, 'x-umami-api-key': KEY } }); return { s: r.status, d: await r.json().catch(() => null) }; }
(async () => {
  console.log('stats:', JSON.stringify(await j('/websites/' + WID + '/stats?startAt=' + startAt + '&endAt=' + endAt)));
  console.log('events:', JSON.stringify(await j('/websites/' + WID + '/metrics?startAt=' + startAt + '&endAt=' + endAt + '&type=event')).slice(0, 400));
  console.log('url:', JSON.stringify(await j('/websites/' + WID + '/metrics?startAt=' + startAt + '&endAt=' + endAt + '&type=url')).slice(0, 600));
  console.log('ref:', JSON.stringify(await j('/websites/' + WID + '/metrics?startAt=' + startAt + '&endAt=' + endAt + '&type=referrer')).slice(0, 200));
  console.log('evtstats:', JSON.stringify(await j('/websites/' + WID + '/event-stats?startAt=' + startAt + '&endAt=' + endAt)).slice(0, 400));
})().catch((e) => console.log('ERR', e.message));