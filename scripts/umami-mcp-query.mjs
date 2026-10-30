// scripts/umami-mcp-query.mjs — official Umami MCP client for this agent.
// Transport: local SSH tunnel (127.0.0.1:3011 -> analytics host :3001 /mcp)
// Auth: dedicated read API key in %USERPROFILE%\.dsh\var\umami-mcp.key
// Usage: node scripts/umami-mcp-query.mjs <tool> [jsonArgs]   (no args -> list tools)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ENDPOINT = process.env.UMAMI_MCP_URL || 'http://127.0.0.1:3011/mcp';
const keyFile = path.join(os.homedir(), '.dsh', 'var', 'umami-mcp.key');
const KEY = fs.readFileSync(keyFile, 'utf-8').trim();
let id = 0;
async function rpc(method, params) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream', authorization: 'Bearer ' + KEY },
    body: JSON.stringify({ jsonrpc: '2.0', id: ++id, method, params }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + text.slice(0, 200));
  // SSE-framed or plain JSON — accept both
  const line = text.split('\n').find((l) => l.startsWith('data:'));
  const payload = JSON.parse(line ? line.slice(5).trim() : text);
  if (payload.error) throw new Error(JSON.stringify(payload.error));
  return payload.result;
}

const [toolArg, argsJson] = process.argv.slice(2);
// PowerShell mangles inline JSON quotes, so also accept tool/args via env (MCP_TOOL / MCP_ARGS).
const tool = toolArg || process.env.MCP_TOOL;
const argsSrc = argsJson || process.env.MCP_ARGS;
if (!tool) {
  const r = await rpc('tools/list', {});
  console.log(r.tools.map((t) => t.name).join('\n'));
} else {
  const r = await rpc('tools/call', { name: tool, arguments: argsSrc ? JSON.parse(argsSrc) : {} });
  const text = (r.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n');
  console.log(r.isError ? 'TOOL_ERROR: ' + text : text);
}