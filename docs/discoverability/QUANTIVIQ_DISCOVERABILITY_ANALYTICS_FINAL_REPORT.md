# QUANTIVIQ — Discoverability & Analytics Mission — FINAL REPORT

Mission: production analytics, search indexability & AI discoverability. Executed as full production engineering on both VPS servers, 2026-10-30. Deployed commits: 23be7ae (mission code) → 187ea41 (hydration fix).

## A. Production Analytics — Umami (self-hosted, first-party)

| Item | Result | Verdict |
|---|---|---|
| Umami v3.4.1 (pinned tag, source build) + PostgreSQL 16 on Server B, systemd-isolated (MemoryMax 500M/1G, CPUQuota 40%), loopback-only DB, no Docker anywhere | deployed, heartbeat 200 | **PASS** |
| First-party endpoints on A: /_q/script.js (cached, noindex) + /_q/api/send via key-restricted autossh tunnel | live 200 + browser-verified event recorded | **PASS** |
| Dashboard access | SSH tunnel now; stats.quantiviq.xyz block staged — DNS record is an owner action | **BLOCKED (owner DNS)** |
| Backups: daily B-local (30 kept) + nightly A-copy via forced-command key; restore drill to isolated DB restored 27 tables | executed and verified | **PASS** |
| Trading safety: all trader services active before/during/after; resource ceilings; no firewall/kernel/Docker changes | snapshots logged | **PASS** |

## B. Tracking (taxonomy v1)

Typed allowlisted wrapper (src/lib/analytics.ts): 10 events, no PII, no prompt/answer content, once-per-session dedupe, fail-open by construction. Privacy disclosure added to /privacy (en+fa). **PASS** (verify-analytics-events.mjs 3/3).

## C. Search indexability

- Route matrix: 112 routes audited from two vantages — canonicals, hreflang clusters, robots meta, JSON-Ld, localized metadata all correct (full CSV + doc 07). **PASS**
- /en|fa/mind CSR shells enriched with server-rendered descriptive block (790+ chars) — after fixing an invalid ul-in-p hydration mismatch it introduced. **PASS**
- robots.txt: AI-crawler policy explicit (OAI-SearchBot, ChatGPT-User, GPTBot, ClaudeBot allowed; each independently flippable); /meet-majid noindex PRESERVED (meta+header, deliberately not robots-disallowed). **PASS**
- llms.txt deployed; IndexNow key + submit script deployed. **PASS**
- GSC/Bing verification + stats DNS: **BLOCKED on owner** (exact steps in 09).
- Indexing claims: none made — status INDEXING PENDING (verified crawl hits ≠ index inclusion).

## D. AI discoverability

- OAI-SearchBot access independent of GPTBot: **PASS** (robots + live log hits).
- Entity graph (Person↔Organization @graph, BlogPosting/Breadcrumb on articles, sameAs) verified. **PASS**.
- Public operator profile = existing indexable /profile (+ /en/about); /meet-majid remains unlisted. **PASS**.
- AI-answer citation measurement: protocol defined (doc 15), **NOT MEASURED** (operator accounts) — no claims made.

## E. QA & verification (FINAL, 2026-10-30 post-deploy 187ea41)

- npm test 126/126; typecheck clean; hydration issue caught by Mind regression and fixed (invalid ul inside p in the new /mind SSR block triggered React #418; restructured; re-verified live with zero page errors).
- Mind chat regression (21-check paced-streaming spec) re-run against production after the final deploy: ALL PASS (S1-S15b incl. FA + touch/keyboard interrupt + floating panel + owned labels).
- G5 acceptance scripts: audit-public-routes.mjs (112 routes, 2 vantages), verify-analytics-events.mjs 3/3, verify-crawler-access.mjs 8/8, visibility-benchmark.mjs (16_VISIBILITY_BASELINE.json), check-dual-vps-safety.py (6/6 trader services active before/during/after; umami 292MB under its 500MB cap; A site 200).
- Analytics-outage fail-open: nginx 3s/10s timeouts; tracker non-blocking; build without env-id renders instrumentation inert — live-tested (404 script refused execution, zero UI impact).

## Verdict matrix (summary)

| Area | Verdict |
|---|---|
| Analytics deployment (B) | PASS |
| First-party transport + endpoints | PASS |
| stats DNS + webmaster verification | BLOCKED — owner actions (DNS A record; GSC/Bing signup) |
| Tracking contract + privacy | PASS |
| Indexability repairs | PASS |
| AI crawler access | PASS |
| AI visibility measurement | READY / NOT MEASURED (owner-run protocol) |
| Site/Mind regression | **PASS** — chat-remediation-spec ALL PASS (S1–S15b) against production after all changes |

## Owner actions (exact)

1. Parspack DNS: add `stats.quantiviq.xyz A 171.22.24.45` (then TLS on A: `certbot --nginx -d stats.quantiviq.xyz`).
2. GSC Domain property + TXT (steps in 09).
3. Bing Webmaster (import from GSC).
4. Optional: run doc-15 AI evaluation monthly.
