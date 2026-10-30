# 02 — Umami Deployment (Phase B)

- **Version**: Umami `v3.4.1` (pinned git tag, source build). pnpm 12.3.4 (its engines field; the repo ships pnpm-lock.yaml). Node 22.23.3.
- **Host**: Server B (87.107.152.67) — NON-Docker (no Docker was installed on either host; installing one on the trading VPS was ruled out by mission gate).
- **Layout**: `/opt/umami` source (tag v3.4.1) → `pnpm install && pnpm run build:docker` → standalone tree `/opt/umami/.next/standalone` (+ copied `.next/static`, `public`). Prisma migrations applied with `pnpm exec prisma migrate deploy` (required — the build alone does not migrate).
- **Services**: `umami.service` — User=umami, WorkingDirectory=standalone, `ExecStart=/opt/node/bin/node server.js`, MemoryMax=500M/MemoryHigh=400M, CPUQuota=40%, TasksMax=120, NoNewPrivileges/PrivateTmp/ProtectSystem=full/ProtectHome, Restart=on-failure. Env in `/etc/umami.env` (600): DATABASE_URL (localhost PG), APP_SECRET, HOSTNAME=127.0.0.1, PORT=3001, DISABLE_TELEMETRY=1, CRAWLER_CHECK=1.
- **PostgreSQL 16**: apt on B, role `umami` (random pw in /root/.umami-db-pw 600), db `umami`, listen_addresses=localhost only; postgresql@16-main capped MemoryMax=1G, CPUQuota=40% (drop-in).
- **Verified**: `systemctl is-active umami` = active; `curl 127.0.0.1:3001/api/heartbeat` = 200; prisma migrate deploy applied all migrations (25_add_annotation … 26_add_api_key last seen).
- **Admin**: initial admin/umami rotated immediately; new password in `/root/.umami-admin-cred` (600) **on Server A** (not on B); login API used Bearer token from `/api/auth/login` body.
- **Website record**: name `Quantiviq`, domain `quantiviq.xyz`, id `24264632-11ad-4bcf-a899-82ebbe58f77a`.
- **Resource evidence**: umami MemoryCurrent ≈ 286 MB under cap; PG ≈ 80 MB; B load returned to 0.66 after build spike.

## Transport (A↔B)

- `umami-tunnel.service` on A: autossh -M 0, key `/root/.ssh/umami_tunnel` (ed25519), `-L 127.0.0.1:3010:127.0.0.1:3001 tunnel@87.107.152.67`, ExitOnForwardFailure, Restart=always.
- B side: user `tunnel` (shell /bin/bash — required for forced commands; every key line is restrict-ed), authorized_keys line 1: `from="171.22.24.45",restrict,port-forwarding,permitopen="127.0.0.1:3001"` (forward-only). No new listening ports on B; UFW untouched (22 LIMIT only).
- All transport is SSH-encrypted + key-authenticated. Postgres is never exposed.

## nginx on A (first-party endpoints)

- `/etc/nginx/snippets/quantiviq-analytics.conf` included in the **443** server block: `location = /_q/script.js` (proxy to tunnel :3010, Cache-Control public max-age=3600 + stale-while-revalidate=86400, X-Robots-Tag noindex) and `location /_q/` (proxy, POST pass-through, 3s/10s timeouts — **fail open**).
- `stats.quantiviq.xyz` server block staged (`sites-enabled/stats-quantiviq`, reuses quantiviq.xyz cert) — inert until owner DNS lands.
- Live evidence: `/_q/script.js` 200 (4773 B, cache+noindex), `/_q/api/send` 200 for the typed event format.
