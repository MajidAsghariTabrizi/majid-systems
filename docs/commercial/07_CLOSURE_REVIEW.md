# 07 — Closure Review (focused release closure, 2026-11-02)

Scope: finish the shipped commercial v2 without reopening unrelated surfaces. Prior PASS prose was treated as claims and re-verified; every repair below is backed by a failing-before/passing-after gate.

## 1. Repaired behaviors (what changed and why)

| Area | Repair |
|---|---|
| Notification pipeline | `flushOutbox` replay with dry-run, attempt accounting, ack-on-success-only, concurrency-safe rewrite preserving newly queued work; bounded SMTP timeouts (connect 8s / greeting 5s / socket 10s); `leads-tool.mjs flush [--dry-run] [--max N]`; `clear` now warns it drops jobs without delivery. At-least-once semantics documented — exactly-once email is NOT claimed. |
| Idempotency | Per-submission key (client-generated UUID) + payload fingerprint; replay returns the SAME durable reference (`idempotentReplay:true`), inconsistent reuse → 409. Network retries can no longer mint duplicate opportunities. |
| Validation contract | `solution_request` requires a known solution server-side (400 `solution.required`) and company (client + server); Persian/Arabic digits normalized before phone-shape checks; odd `source` values normalized/fallback (`unattributed`) instead of blocking inquiries; legacy contact intents keep historical optionality (regression-tested). |
| Accessible form | Real `<label htmlFor>` + ids, `aria-invalid` + `aria-describedby`, error summary `role=alert` with focus management, values preserved after failure, single optional markers, localized privacy-policy link in consent, submit disabled while busy. |
| Error mapping | 400 field errors → precise localized messages; 429 → distinct localized "wait and retry"; 409 → reload guidance; success renders ONLY with a real `QV-*` reference (`QV-ignored` honeypot excluded). |
| Finder | Complete bilingual bottleneck vocabulary (41 labels, zero raw ids), options grouped per chosen outcome with incompatible selection cleared, `aria-pressed` + labelled groups, stable comparator (score → matched-dimensions → id; no flagship bias), status badges on results, honest privacy copy (category counts only; contact data never sent pre-submit). |
| Persian search | `normalizeFa` (ZWNJ↔space, Arabic yeh/kaf, digits) + no-space matching + tiny truthful aliases; display text untouched. پیش فاکتور / پیش‌فاکتور / پیشفاکتور all find QuoteDesk. |
| Copy/mojibake | FA detail CTA repaired to the exact shared string; `Â·` separator fixed; related-research labels resolve real localized article titles via the registry (no numbered filenames); catalog FA intro typo fixed; badge selector `.flag`→`.flagship`. |
| Unqualified claims | hours-to-minutes and same-day and improves-monthly phrased as measured pilot targets with baselines; no blanket disclaimers, offering intact. |
| Sharing metadata | catalog/detail/finder/request carry their own OG/Twitter metadata via the existing `socialMeta` helper (route-truthful titles/URLs; existing artwork reused). |
| Responsive/semantics | Grid `minmax(min(100%,260px),1fr)` kills the 320px overflow; route-local gutters restored on narrow screens; nested `<main>` removed (layout owns the landmark); Mind dock hidden on request/find/contact so it never covers conversion actions. |
| Operator console | `/admin/requests` is a real (small) token-gated screen: memory-only token entry, request list, status transitions, notify/outbox visibility. No tokens in URLs/logs/storage; no lead data before auth. API-only operation still available. |
| Telemetry honesty | `qEvent` queues early-mount events (sanitized, bounded 20, 15s expiry) and flushes when the collector appears; permanently blocked collector → safe drop; app fully usable without analytics. `bottleneck` added to finder_complete; `reason` added to request_failure. |
| Test gates | New `commercial_closure_spec.py` exits non-zero on any assertion failure OR unexpected exception (proved with a deliberate failing case); the old weak spec is a loud deprecated wrapper. |

## 2. Test matrix (commands + exit codes)

| Check | Command | Result |
|---|---|---|
| TypeScript (noEmit) | `npx tsc --noEmit --skipLibCheck -p tsconfig.json` | **PASS** (exit 0, clean) |
| Unit suite (141 tests) | `node --import tsx --test test/*.test.ts` | **PASS 141/141** (exit 0) — incl. outbox replay 6/6, fa-search 4/4, analytics queue 4/4, updated lead contract |
| Production build | `npx next build` | **PASS** (exit 0) |
| Behavioral gate (fresh fixture server: isolated temp store, mock transport, rate cap env) | `python scripts/commercial_closure_spec.py` | **PASS 64/64** (exit 0) |
| Gate failure proof | `python scripts/commercial_closure_spec.py --prove-failing-gate` | **PASS** (exit 1, deliberate failure detected) |
| Narrow-screen measurements | `python scripts/_closure_measure.py` | **PASS** — 320px: submit button x=24 w=164 in-viewport; no overflow (8 route/width combos asserted in gate); finder options reachable |
| Screenshots (23 PNGs) | `python scripts/_closure_shots.py` | **CAPTURED** `docs/commercial/shots/{route}_{desktop,m390,m320}.png` — visual inspection by the owner is requested: this session's model cannot read images (verified refusal), so layout truth is carried by the programmatic measurements above, not by eyeballing |
| Outbox restart/failure/concurrency | unit tests (mock transport) | **PASS** — see lead-outbox.test.ts |
| Real SMTP delivery | — | **NOT RUN — blocked by configuration** (no SMTP credentials exist on A; see §4) |

Gate coverage detail (all asserted, all passing): 40×EN/FA detail+request routes 200; flagship indexable / scoping noindex; exact FA CTA copy with zero mojibake; registry-titled related research; 5 labeled fields with programmatic labels; aria-invalid/describedby; value preservation; finder pressed-state + clearing + 5 representative outcome paths + status badges; 3 Persian search variants; missing/unknown solution, required company, Persian-digit phone, idempotent replay (same ref) + 409 conflict + odd source; 429 + localized message; UI success with real reference; short optional need precise error; admin 401/auth GET/invalid transition/valid transition/pre-auth gating; carousel click/prev/keyboard/swipe; legacy contact empty-submit block; 320/390px overflow × 4 routes × 2 widths; og:title truthful × 4 routes; Mind dock hidden on request; zero page/hydration errors.

## 3. Operator runbook

Follow-up (browser): `/admin/requests` → enter QV_ADMIN_TOKEN (kept in memory only) → review list (date, solution, company, contact, notify state, source) → set pipeline status (new → contacted → discovery → proposal_sent → won/lost).

Follow-up (API): `curl -H "x-admin-token: $QV_ADMIN_TOKEN" https://quantiviq.xyz/api/admin/requests` (GET) and `... -X PATCH -d '{"id":"QV-...","status":"contacted"}'`.

Notification replay (SAFE DRY-RUN FIRST):
```bash
# on A, from /opt/majid-systems
node scripts/leads-tool.mjs outbox            # list queued jobs (attempts shown)
node scripts/leads-tool.mjs flush --dry-run   # sends NOTHING, mutates NOTHING
node scripts/leads-tool.mjs flush             # deliver; failures keep the job with attempts++/lastError
```
Exit codes: 0 = all sent; 1 = some failed (jobs retained — rerun later); 2 = no transport configured. `outbox --clear` DROPS jobs without delivery — reserved for discarding test noise, never a substitute for flush.

## 4. Facts kept separate (do not conflate)

- **request persisted** — leads.jsonl append (verified in production for the v2 release probe; fixture-verified 64/64 in this closure).
- **notification queued** — outbox.jsonl durable job (verified; at-least-once).
- **provider accepted** — requires SMTP credentials; NOT available yet.
- **email received** — owner-side confirmation; depends on the above; NOT claimed anywhere in this closure.

## 5. Remaining credential-dependent tasks (owner, non-secret setup)

1. SMTP: add `SMTP_HOST/PORT/USER/PASS/FROM` (Gmail app password works) to `/opt/majid-systems/.env.production`, `systemctl restart majid-systems`, then `node scripts/leads-tool.mjs flush` to drain queued jobs. Until then every request is stored and queued — nothing lost, nothing emailed.
2. Google sign-in (optional, P1): code is intentionally absent, not just unconfigured — needs owner decision + GOOGLE_CLIENT_ID/SECRET before any provider/callback work starts. Guest intake is fully independent; no broken dependency is exposed in the UI.
3. GSC/Bing verification (growth mission carry-over): owner-gated.

## 6. Deployed state

Release commit for this closure: see git log (`docs/commercial` + all code above). Deployed via the established `scripts/public_deploy.py` path; production verification of served behavior is recorded in the handoff message (og:title truth, FA CTA copy, console gating, robots/sitemap unchanged, legacy contact intact). HTTP 200 alone is not claimed as workflow proof — the 64/64 fixture gate is.
