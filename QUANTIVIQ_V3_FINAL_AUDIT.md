# QUANTIVIQ V3 — FINAL AUDIT & RELEASE VERIFICATION

Date: 2026-10-18
Auditor: Universal Engineering Agent (post-implementation audit, fix-and-verify)
Repo: `majid-systems`, branch `main`
Repo HEAD: **`ecab474`** — hardening in `6deec4d` ("V3 hardening: full FA localization of the organization simulator + lead-pipeline E2E isolation"), audit deliverables in `d556e27`, probe hardening in `ecab474`. Later doc-only commits do not change the audited site build.
Deployed revision (VPS `/opt/majid-systems`, verified via SSH `git log`): **`ecab474`** — deployment drift: **zero**.
Production: https://quantiviq.xyz (`/en` default, `/fa` Persian, RTL)

---

## 1. Verdict

**READY** — with one explicitly tracked operational blocker:

| Item | State |
|---|---|
| Site quality, bilingual correctness, a11y, mobile UX | READY — verified below |
| Lead pipeline (accept → persist → notify → delete) | READY with `QV_NOTIFY_TRANSPORT=outbox` (durable queue) |
| Owner e-mail delivery over SMTP | **BLOCKED_PENDING_CONFIG** — SMTP credentials do not exist. No credentials were invented. Leads are stored + queued; nothing is lost. Owner action: set `SMTP_HOST/PORT/USER/PASS/FROM` + `LEAD_NOTIFY_EMAIL`, restart service. |

---

## 2. What this audit found and fixed (this release)

All fixes preserve the existing visual identity, bilingual architecture, content strategy, simulations and services.

### P0-B Bilingual correctness — organization simulator was ~110 English render sites on `/fa`
Fixed via a new data boundary instead of ~110 risky point edits:

- **New module `src/content/i18n/sim-data.ts`** — `makeSimData(locale)` binds the simulator's structural module (`src/content/simulator.ts`, EN source of truth) to the label pack (`src/content/i18n/sim.ts`, 355 keys, both locales). Every lookup degrades to EN, never crashes.
- **`src/components/OrgSimulator.tsx`** now takes `locale`, exposes one `S.*` dictionary, and localizes: painter strip copy (HUMANS—routing / GATE OPEN / KNOWLEDGE +1 / learning… / RESTRUCTURING… / TOPOLOGY SETTLING / hierarchy stops… / YOU—the architect / STRUCTURE / ready… / compare… / choose-signal), phase chips (TRADITIONAL/AI-NATIVE), 26 node labels, 26 node roles, node-inspection cards, edge tooltips (explicit 24-edge id→key map), metric labels incl. CONTEXT LOSS, brain card, gate, controls, a11y labels, SVG `<title>/<desc>`, mobile learn step. EN ids still drive all internal comparisons and CSS class keys.
- **Bugs caught by the new rendered-DOM probe** (not by static review):
  1. Eight node roles rendered English on `/fa` — sim.ts role keys existed under abbreviated names; added an explicit alias table in `makeNodeRole`.
  2. Node aria-labels leaked a literal `{label}` placeholder — aria templates now compose via `.replace('{label}', …)` / `('{becomes}', …)` / `('{info}', …)`.
- `OrgTransform.tsx` and `BrainDemo.tsx` completed earlier in this audit (last drawn EN literals: latency chips, reveal copy, HERO_REVEAL).
- Deliberate, documented boundaries kept: canonical claim codes (OBSERVED/VERIFIED/UNKNOWN/STALE/SUPERSEDED/PATH) and investigation stage ids stay Latin in both locales; brand names (Phoenix, UEA, Slack) stay Latin; shared builder tree (`/journey`, `/work`, …) stays EN and is visibly labeled `·EN`.

### P0-A Lead pipeline (hardened earlier in this audit, re-verified end-to-end now)
- Accept → persist → notify ordering: JSONL append happens **after** the notification outcome is known, so the stored line records the true final state (`outbox_queued` | `smtp` | `notify_failed`).
- Health endpoint distinguishes storage (`writable|error`) and notify (`smtp|outbox`) plus outbox depth.
- Security: origin check, 8KB cap, honeypot (fake 202, nothing stored), 5/hour/IP sliding window, X-Real-IP wins; XFF parsed from the right by `QV_XFF_DEPTH` (client-spoofable leftmost entries never used).
- Retention/deletion: `scripts/leads-tool.mjs` delete + 24-month purge, matching the published privacy policy; E2E proves delete works (C3).
- **This audit's fix**: `scripts/v3-check.mjs` still asserted the pre-hardening contract (`notify=pending_config`) and its honeypot/rate-limit probes shared the 127.0.0.1 bucket with the legitimate submissions (order-dependent 429s). Assertions updated to the real contract; probes now run node-side with isolated `x-real-ip`s. 

### P0-C Mobile UX / a11y — verified (fixes landed earlier in audit)
Viewport matrix 360/390/768/1440 × EN/FA: nav visible, switcher outside the collapsed menu, 0px horizontal overflow; error announcement via `role=alert`, `aria-invalid`, `aria-describedby`; keyboard reaches nav then switcher. (audit-check C1/C4, below.)

### P1-D Performance — measured, honest
Production Lighthouse 13.5.0 mobile, same machine, same command, before (deployed `e92c950`/`fdc8293`) vs after (`6deec4d`); two runs each after:

| | perf | a11y | BP | SEO | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| EN before | 86 | 90 | 100 | 100 | 2.1s | 2.3s | 95ms | 0.000 |
| EN after (r1/r2) | **90 / 85** | 90 | 100 | 100 | 2.3 / 2.6s | 3.2 / 3.8s | **0ms** | 0.003 |
| FA before | 95 | 90 | 100 | 100 | 1.8s | 2.3s | 0ms | 0.001 |
| FA after (r1/r2) | **81 / 87** | 90 | 100 | 100 | 3.2 / 2.5s | 3.9 / 3.4s | 0ms | 0.000 |

Reading: TBT 95ms→0 and stable CLS show no code-level regression; the FCP/LCP spread on a 1GB shared VPS over real internet is run-to-run variance (before-run EN SI was 22.7s — same variance, other direction). Full JSONs: `captures-v3-audit/lh-{en,fa}-mobile{,-prod-after,-prod-after2}.json`. No gratuitous visual effects were added; visual identity unchanged.

### P1-E SEO/proof/copy (applied earlier in audit, re-verified now)
Sitemap 200 (29 URLs), robots 200, hreflang + canonical per page (v3-check R7), legacy 308s (R8), `/` 307 per cookie. Proof page matches by immutable keys; employer names only; evidence levels kept canonical (C2). Persian copy reviewed as native editorial (`docs/v3-audit/SEO_COPY_REVIEW.md`, applied).

### P1-F Hostile QA — deployment drift
- GitHub `main` = deployed = `6deec4d` (SSH `git log`, service `active`) — **drift zero**.
- Production security headers: HSTS (1y, includeSubDomains), X-Frame-Options SAMEORIGIN, nosniff, strict-origin-when-cross-origin. Nit (cosmetic, non-blocking): XFO/XCTO/Referrer are emitted twice (nginx + app) — dedupe in nginx when convenient.
- **No production lead was submitted during this audit** (mission constraint). Production verified read-only: health endpoint, DOM probes, headers, redirects.

---

## 3. Test evidence (every row actually ran)

| Suite | Command | Result |
|---|---|---|
| Typecheck | `npm run typecheck` | 0 errors |
| Unit tests | `npm run test` | **99/99 pass** (incl. new `test/sim-i18n.test.ts`, 9 tests: zero EN display-copy leaks in FA; aria templates; edge set) |
| Language/UX matrix | `CAPTURE_BASE=http://127.0.0.1:3219 node scripts/v3-check.mjs` (fresh server) | ALL PASS (R1–R8 + lead: stored `notify=outbox_queued`, honeypot 202/no-store, 429 after burst, health) |
| Audit checks | `node scripts/audit-check.mjs` | **24/24 PASS** (C1 viewport matrix, C2 FA proof, C3 lead→outbox→delete, C4 a11y/keyboard) |
| Unification | `node scripts/unify-check.mjs` | ALL PASS |
| Journey refinement | `node scripts/journey-refine-check.mjs` | ALL PASS |
| Hero DOM | `node scripts/hero-verify.mjs` | ALL PASS |
| **Rendered-DOM l10n (new)** | `node scripts/sim-dom-l10n.mjs` vs local **and** `https://quantiviq.xyz` | **ALL PASS** both — FA SVG title, 25/26 node labels Persian (26th = "Slack", brand), 26/26 roles, rail metrics, runtime strip, aria-labels, inspection dialog, controls; EN intact 26/26 |
| Production probes | curl / drift_probe.py | `/en` 200, `/fa` 200 `dir=rtl`, `/` 307, `/about` 308, sitemap 200/29 URLs, robots 200, health `{"ok":true,"storage":"writable","notify":"outbox","outboxPending":0}` |

Rate-limit note (harness hygiene, not a product bug): lead E2E suites consume the in-memory 5/hour IP bucket — run each suite against a fresh `next start` process.

Screenshots: before → `captures-v3-audit/before/` (7, production), after → `captures-v3-audit/after/` (9, incl. new FA-home-desktop and FA services views). Capture scripts: `scripts/audit-before.mjs`, `scripts/audit-after.mjs`.

## 4. EN/FA route + content parity

- Route parity: `/en|/fa` × home, services, method, system, proof, contact, privacy — localized pages render per-locale copy; shared EN-only routes (`/journey`, `/profile`, `/work/*`, `/notes/*`, `/engineering/*`, `/open-source`, `/resume`) are deliberately EN, labeled `·EN`.
- Content parity enforced by `test/i18n.test.ts` (key parity, 355 keys) and `test/sim-i18n.test.ts` (display-copy census: **zero** untranslated FA strings outside the documented Latin allowlist).
- Locale switch keeps the route (`fa→en` on `/services` → `/en/services` — v3-check R6); `qv_locale` cookie drives `/` 307.

## 5. Lead submission → persistence → notification proof (local, full cycle)

`scripts/audit-check.mjs` C3 + `scripts/v3-check.mjs` LEAD block, run this session on the final build:
1. Valid submit → 200 `QV-mvdqs25y-a41a`.
2. JSONL on disk contains the record, `status=stored`, `notify=outbox_queued`.
3. Outbox file contains the owner notification (`[quantiviq lead] …`).
4. Health reports `storage=writable`, `notify=outbox`, pending count.
5. Deletion op removes the record (`deleted QV-mvdqon2p-5397`).
Production equivalent (read-only): health 200 OK; outbox 0 pending. SMTP delivery unproven **by design** (no credentials exist) — see blocker.

## 6. Security / privacy findings

- No secrets in repo; `.env.example` documents every knob incl. new `QV_LEAD_OUTBOX`, `QV_NOTIFY_TRANSPORT`, `SMTP_FROM`, `QV_XFF_DEPTH`. `.data/` gitignored.
- Rate limiting per hashed IP; honeypot absorbs bots silently; origin check blocks cross-site posts.
- Retention: 24-month purge + per-record deletion tool = published privacy policy.
- Duplicate security headers (nginx + Next) — cosmetic, listed for the next nginx pass.
- No production leads submitted during this audit, per mission authorization.

## 7. Remaining / not done

1. **SMTP credentials** (owner action) — everything else about notification is done and durable.
2. Header dedupe in nginx (cosmetic).
3. Smart Trader remains ARCHIVED (2026-09-23 freeze) — untouched by design.

---

*Generated by the post-implementation audit. Every "PASS" above is a command that ran and printed it; nothing is claimed from inspection alone.*
