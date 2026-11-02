// scripts/umami-mcp-report.mjs — full-analytics report driver (official MCP tools only)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const ENDPOINT = process.env.UMAMI_MCP_URL || 'http://127.0.0.1:3011/mcp';
const KEY = fs.readFileSync(path.join(os.homedir(), '.dsh', 'var', 'umami-mcp.key'), 'utf-8').trim();
let id = 0;
async function rpc(method, params) {
  const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream', authorization: 'Bearer ' + KEY }, body: JSON.stringify({ jsonrpc: '2.0', id: ++id, method, params }) });
  const text = await res.text();
  if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + text.slice(0, 120));
  const line = text.split('\n').find((l) => l.startsWith('data:'));
  const payload = JSON.parse(line ? line.slice(5).trim() : text);
  if (payload.error) throw new Error(JSON.stringify(payload.error));
  const r = payload.result;
  if (r && r.isError) throw new Error('tool: ' + (r.content || []).map((c) => c.text).join(' ').slice(0, 150));
  return r;
}
async function call(name, args) { const r = await rpc('tools/call', { name, arguments: args }); const t = (r.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n'); try { return JSON.parse(t); } catch { return t; } }
const WID = '24264632-11ad-4bcf-a899-82ebbe58f77a';
const full = { websiteId: WID, startAt: '2026-10-30T00:00:00.000Z', endAt: '2026-10-30T23:59:59.999Z' };
const out = {};
const safe = async (k, f) => { try { out[k] = await f(); } catch (e) { out[k] = { ERROR: String(e.message).slice(0, 140) }; } };
await safe('daterange', () => call('get_website_daterange', { websiteId: WID }));
await safe('stats', () => call('get_website_stats', full));
await safe('realtime', () => call('get_realtime', { websiteId: WID }));
await safe('session_stats', () => call('get_session_stats', full));
await safe('event_stats', () => call('get_event_stats', full));
for (const t of ['path', 'entry', 'exit', 'title', 'referrer', 'channel', 'country', 'browser', 'os', 'device', 'language', 'event']) {
  await safe('m_' + t, () => call('get_website_metrics', { ...full, type: t }));
}
await safe('funnels', () => call('list_funnels', { websiteId: WID }));
await safe('journey', () => call('run_journey', { ...full }));
await safe('goals', () => call('get_goals', { websiteId: WID, ...full }));
await safe('sessions', () => call('get_sessions', { ...full, page: 1, pageSize: 10 }));
await safe('events', () => call('get_events', { ...full, page: 1, pageSize: 10 }));
console.log(JSON.stringify(out, null, 1));