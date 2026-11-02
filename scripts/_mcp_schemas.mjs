import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const ENDPOINT = process.env.UMAMI_MCP_URL || 'http://127.0.0.1:3011/mcp';
const KEY = fs.readFileSync(path.join(os.homedir(), '.dsh', 'var', 'umami-mcp.key'), 'utf-8').trim();
let id = 0;
async function rpc(method, params) {
  const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream', authorization: 'Bearer ' + KEY }, body: JSON.stringify({ jsonrpc: '2.0', id: ++id, method, params }) });
  const text = await res.text();
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const line = text.split('\n').find((l) => l.startsWith('data:'));
  const p = JSON.parse(line ? line.slice(5).trim() : text);
  if (p.error) throw new Error(JSON.stringify(p.error));
  return p.result;
}
const tools = (await rpc('tools/list', {})).tools;
for (const n of ['get_sessions', 'get_session', 'get_events']) {
  const t = tools.find((x) => x.name === n);
  console.log('== ' + n + ' schema: ' + JSON.stringify(t.inputSchema).slice(0, 600));
}