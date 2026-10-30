# 18 — Umami MCP Agent Integration

Status: **LIVE** (2026-10-30). This agent can answer natural-language Quantiviq analytics questions via the official Umami MCP server.

## What was enabled

- `MCP_ENABLED=1` added to `/etc/umami.env` on the analytics host; `systemctl restart umami` (isolated unit — trader services untouched, verified active).
- Official endpoint `/mcp` (Streamable HTTP, stateless) — part of the deployed Umami v3.4.1 build; auth = self-hosted API key bearer (`src/lib/mcp/auth.ts`).
- Dedicated API key `agent-mcp-readonly` (umami API keys are user-scoped; MCP tools are ALL read-only and API-key use on credential/admin routes is blocked by Umami's `API_KEY_BLOCKED_PATHS`). Key: `/root/.umami-mcp-key` (600, analytics host A copy) + local `%USERPROFILE%\.dsh\var\umami-mcp.key`.
- Transport: SSH tunnel `127.0.0.1:3011 -> analytics host 127.0.0.1:3001` (key `~/.ssh/trader_vps`). Nothing public: Postgres loopback-only, umami loopback-only, API key never leaves the two servers + this workstation.

## Agent-side wiring (persists restarts)

- Query tool: `scripts/umami-mcp-query.mjs` — `node scripts/umami-mcp-query.mjs <tool> [jsonArgs]` (no args → tool list). Env fallback `MCP_TOOL`/`MCP_ARGS` for PowerShell-safe arg passing.
- Tunnel loop: `scripts/umami-mcp-tunnel.ps1` (auto-reconnect every 10s).
- Persistence: HKCU Run key `UmamiMcpTunnel` → `"C:\Program Files\PowerShell\7\pwsh.exe" -NoProfile -WindowStyle Hidden -File ...\umami-mcp-tunnel.ps1` (starts at every logon, no admin needed).
- Log: `%USERPROFILE%\.dsh\var\umami-mcp-tunnel.log`.

## Verified tool calls (2026-10-30, real data)

| MCP tool | Result |
|---|---|
| list_websites | 1 website: Quantiviq (quantiviq.xyz, id 2426…) |
| get_website_stats | today UTC: 10 pv / 1 visitor / 1 visit / 0% bounce / 54s avg |
| get_website_traffic (hour) | 13:00Z bucket: 10 pv / 1 visit |
| get_website_metrics (path) | /en, /en/mind, /en/insights, /en/about |
| get_website_metrics (referrer) | none (all direct) |
| get_realtime | 0 active visitors at probe time |
| get_event_stats | 4 events / 3 unique / 2 event-visitors |

Accuracy cross-check vs the dashboard's own REST API (same key, `/api/websites/:id/stats` + `/metrics?type=event`): **identical numbers** (10/1/1, 54s, same event counts).

## Semantics (do not confuse)

- pageviews ≠ visitors ≠ visits. Values above are Umami's definitions; path-metric values are Umami's per-path measure (not a sum of pageviews).
- Tracker crawler-filter is ON: headless-UA probes don't count as visitors (verified — only node-fetch event + normal-UA browser session recorded).
