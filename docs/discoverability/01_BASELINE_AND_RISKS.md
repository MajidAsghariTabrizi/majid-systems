# 01 — Baseline and Risks (Phase A)

Generated: 2026-10-30 (all evidence live, two vantages: local workstation + Server A `curl --resolve` loop).

## 1. Servers (read-only audit, no changes made)

| | Server A — website | Server B — trading/research |
|---|---|---|
| Host | `171.22.24.45` (srv8097843611) | `87.107.152.67` (vm39513-58596.mobinhost.com) |
| OS | Ubuntu 24.04.3, kernel 6.8.0-101 | Ubuntu 24.04, kernel 6.8.0-31 |
| CPU / RAM | **1 vCPU** / 961 MB (525 MB available) | 12 vCPU / 24,030 MB (19,332 MB available) |
| Disk / IO | 24 GB (14 GB free), %util ~0 | 197 GB (164 GB free), vda %util 0.26, await <1ms |
| Load | 0.00/0.02/0.00 (uptime 212d) | 2.18/1.59/1.28 (sar 10-min avg ~1.0 on 12 cores) |
| OOM 14d | n/a (no kernel OOM check on A yet) | **0** |
| Docker | **not installed** | **not installed** |
| Firewall | UFW inactive, iptables INPUT ACCEPT | UFW active, only `22/tcp LIMIT` |
| Key services | `majid-systems` (Next :3000), `public-mind`, `smarttrader-api/-bot` (+stg), nginx 1.24, certbot timer | 7 trader services all `active` + 11+ evaluation timers (15–60 min cadence) |
| SSH | root + password (authorized deploy credential) | root + Ed25519 key only (password refused, negative-tested historically) |
| TLS | quantiviq.xyz + www valid to 2026-12-02 (33d; `certbot.timer` active). **stg + docs-market certs EXPIRED** (out of scope, flagged) | no nginx |
| Analytics today | **none** (no tracking script/service anywhere) | none |

Server-to-server: A→B direct routed via public gateway (RTT 3.4–7.7 ms). **No private tunnel exists.**

## 2. Application

- Repo: `github.com/MajidAsghariTabrizi/majid-systems` (main). Production `/opt/majid-systems` at `b72cf7f` (chat remediation) — local HEAD `662d608` (evidence-only delta).
- Next.js App Router, nginx reverse proxy on A (`/_next/static`, `/`, `/smart-trader/*`), systemd unit `majid-systems`, port 3000. `public-mind` service serves the AI backend.
- Deploy mechanism: `scripts/public_deploy.py` (paramiko, git pull + build + restart), used again in this mission.

## 3. Route registry (full data: `07_SEO_ROUTE_AUDIT.csv`, raw: `07_route_probe_raw.json`)

112 routes probed (101 sitemap + 11 extras). Summary:

- `/` → **307** → `/en` (locale middleware redirect; consistent both vantages).
- All intended-public pages: **200, index,follow, self-canonical, localized titles/descriptions** present. `lang`/`dir` correct (fa rtl).
- Articles: `BlogPosting` + `BreadcrumbList` JSON-LD (en+fa); insights hub adds `Blog`.
- **`/meet-majid`: noindex, nofollow, noarchive (meta + X-Robots-Tag)** — intentional unlisted executive experience, PRESERVED.
- 404 extras (correct hard-404s, no soft-404): `/en/profile`, `/fa/profile`, `/en/journey`, `/en/simulator`, `/feed.xml`.

### Confirmed defects (to fix in Phase D/E)

| # | Finding | Evidence |
|---|---|---|
| F1 | ~~Zero hreflang~~ **RETRACTED 2026-10-30**: audit-regex case bug (React emits `hrefLang`); re-probe shows full clusters on all locale-paired routes | re-probe in 07_ROUTE_INDEXABILITY_MATRIX.md |
| F2 | `/en/mind` + `/fa/mind` are CSR shells — 437/438 chars of unhydrated text while `index,follow` | probe textChars |
| F3 | Person↔Organization `@graph` JSON-Ld EXISTS on locale pages; the real defect was `Person.url → /profile` … actually `/profile` EXISTS (200) — link valid; fixed a transient mis-aim to `/en/about` then restored to `/profile` | JsonLd.tsx + live probe |
| F4 | robots.txt has no AI-crawler-specific policy statements (all allowed by `*` today) and no OAI-SearchBot/GPTBot distinction | 110-byte robots |
| F5 | `/en/about` thin-ish (1,293 chars) as the de-facto public operator profile | probe |
| F6 | No webmaster-tool verification records (GSC/Bing) discoverable on host | cert/HTML scan |

### Crawler baseline (nginx access log, current rotation, last ~50k lines)

| UA | hits | notes |
|---|---|---|
| Googlebot | 19 (today, 10:43–10:59 UTC) | IPs 192.178.4.196/.197 — legitimate Google ranges; crawling insights articles + JS chunks (rendering-capable) |
| ChatGPT-User | 5 | user-initiated retrieval |
| OAI-SearchBot | 3 | **already crawling** |
| Bingbot | 0 in current file | check rotated logs in Phase E |

## 4. Architecture decision (evidence-based)

- **Docker on B: REJECTED.** No Docker present; installing a daemon on the trading host risks iptables/nft and systemd behavior changes beside a fail-closed watchdog and dense eval timers (mission gate §2).
- **Umami on A: REJECTED.** A has 961 MB RAM / 1 vCPU with ~525 MB available and already runs site + AI backend + smarttrader; Umami+Postgres (~400–700 MB) risks the *website* itself — mission says the website must never depend on analytics.
- **CHOSEN: native (non-Docker) Umami + PostgreSQL on Server B**, systemd-isolated with hard resource ceilings, DB on loopback only; **A→B transport = SSH tunnel (autossh, key-restricted)** — encrypted + authenticated, no new listening ports on B (ingress stays UFW 22 LIMIT), no kernel/Docker changes on either host. `stats.quantiviq.xyz` TLS terminates on A (nginx server block ready; DNS is an owner item, see below).

## 5. Risks / owner actions

| Risk | Mitigation |
|---|---|
| Analytics outage must never break the site | first-party proxy on A with short timeouts, `proxy_next_upener off`-style fail-open; tracking script loaded `defer` and non-blocking |
| Resource contention with trading | systemd `MemoryMax`/`CPUQuota` ceilings measured against the 19 GB free baseline; analytics-only restart tests with before/after trader health snapshots |
| Trading backups contamination | analytics backups in separate `/var/backups/umami` + weekly copy to A; never touch `/opt/trader` or existing backup paths |
| **DNS for `stats.quantiviq.xyz`** | **OWNER ACTION (BLOCKED):** add `A stats 171.22.24.45` in Parspack DNS (`grass/river.parspack.net`). Everything else is deployed and verified via the authenticated tunnel meanwhile. |
| GSC/Bing ownership | requires owner Google/Microsoft accounts — owner item with exact steps in `09_WEBMASTER_VERIFICATION.md` |
