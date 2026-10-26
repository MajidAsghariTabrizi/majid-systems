# LIVE_VS_BRANCH_COMPARISON

_2026-10-26 · comparison performed before deploy at 10:10–10:20 UTC_

## Release identities

| Target | Identity | Notes |
|---|---|---|
| Production (before deploy) | `bc48518` — "content(mind): apply independent editorial review fixes" | Next.js 14.2.18, active since prior release; 4 legacy /en,/fa routes; NO new silver-bullet routes (404) |
| Local `silver-bullet` (pre-release) | `fbb5299` → release fixes → `534a66f` | +221 files: 4 route groups, knowledge corpus, mind scopes, docs |
| Remote `origin/silver-bullet` | `534a66f` (pushed) | |
| Remote `origin/main` (before) | `0dce84c` | ancestor-chain INCLUDES production `bc48518` — production was simply behind, zero divergence |
| Merged release | `dfd1835` (merge --no-ff, no force) | pushed to origin/main; **deployed** |

## Divergence audit (the important part)

The VPS ran `bc48518` while origin/main showed `0dce84c`. Verified before deploy:

- `git merge-base --is-ancestor bc48518 dfd1835` → **true** (bc48518 is in the merged history)
- VPS repo: ahead 0 / behind only — no unpushed commits, no dirty files
- `git ls-remote origin` cross-checked: GitHub main = dfd1835 after push

Conclusion: deploying `dfd1835` moves production strictly FORWARD; **no unrelated work destroyed**.

## Content delta (production before → after)

| Area | Before (bc48518) | After (dfd1835) |
|---|---|---|
| /en/explore, /fa/explore | 404 | 200 — Living Organization experience |
| /en+fa/insights/books (+10 [slug]) | 404 | 200 — 10 editions, 7 hotlinked covers + 3 designed fallbacks |
| /en+fa/insights/enterprise-ai-stack | 404 | 200 — 5 OSS layers |
| /en+fa/mind/flows | 404 | 200 — 12 flows + 11 mindsets |
| Hero primary CTA | → #simulator anchor | → /explore |
| Mind corpus | 639 records, no scopes | 715 records, 6 scopes, catalog-only honesty lines |
| Chat | live glm-4.5-flash | **unchanged config, preserved** (verified byte-identical config before/after) |
| Legacy routes (25 checked incl. /journey, /notes/*, smart-trader) | 200 | 200 (no regressions) |
| sitemap.xml | legacy set | +9 new URL groups (14 URLs) |

## Verification instruments

- `scripts/sb-crawl.mjs` (before), `scripts/sb-after-capture.mjs`, `scripts/sb-prod-verify.mjs` (after, against https://quantiviq.xyz)
- Route sweep: 25/25 OK · console errors: 0 · broken images: 0 · sitemap: 9/9 new groups present
