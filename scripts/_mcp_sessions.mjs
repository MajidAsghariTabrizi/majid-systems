import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const ENDPOINT = 'http://127.0.0.1:3011/mcp';
const KEY = fs.readFileSync(path.join(os.homedir(), '.dsh', 'var', 'umami-mcp.key'), 'utf-8').trim();
let id = 0;
async function rpc(method, params) {
  const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream', authorization: 'Bearer ' + KEY }, body: JSON.stringify({ jsonrpc: '2.0', id: ++id, method, params }) });
  const text = await res.text();
  if (!res.ok) throw new Error('HTTP ' + res.status + ' ' + text.slice(0, 100));
  const line = text.split('\n').find((l) => l.startsWith('data:'));
  const p = JSON.parse(line ? line.slice(5).trim() : text);
  if (p.error) throw new Error(JSON.stringify(p.error));
  return p.result;
}
async function call(name, args) { const r = await rpc('tools/call', { name, arguments: args }); const t = (r.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n'); try { return JSON.parse(t); } catch { return t; } }
const WID = '24264632-11ad-4bcf-a899-82ebbe58f77a';
const range = { websiteId: WID, startAt: '2026-10-30T00:00:00.000Z', endAt: '2026-11-03T00:00:00.000Z' };
const out = {};
out.sessions = await call('get_sessions', { ...range, pageSize: 50 });
out.sessionDetails = [];
for (const s of out.sessions.sessions || []) {
  try { out.sessionDetails.push(await call('get_session', { websiteId: WID, sessionId: s.id })); }
  catch (e) { out.sessionDetails.push({ id: s.id, ERROR: String(e.message).slice(0, 120) }); }
}
out.events = await call('get_events', { ...range, pageSize: 50 });
console.log(JSON.stringify(out, null, 1));