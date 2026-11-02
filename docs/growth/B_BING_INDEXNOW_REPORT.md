# B — Bing Webmaster + IndexNow (QVQ-GROWTH-2026-11-02)

**Verdict: PARTIAL PASS — IndexNow executed with receipt; account-gated items BLOCKED (owner action).**

## Executed today
- **IndexNow submission: HTTP 202 accepted, 8 URLs, 2026-11-02T07:49:38Z** (genuinely-changed URLs from the Oct-30 deploy). Key file live 200. No mass resubmission.
- bingbot present but sparse (1 request/23h); `site:quantiviq.xyz` independent probe -> 0 results -> **NOT INDEXED** in Bing either.
- States distinguished: URLs are **submitted** (queued for evaluation). NOT discovered/indexed — no such claim.

## Blocked (owner action)
1. https://www.bing.com/webmasters -> import from GSC after GSC verifies (fastest), or add site + CNAME/TXT.
2. Then submit sitemap; review Site Explorer/URL Inspection on the 8 submitted URLs.
