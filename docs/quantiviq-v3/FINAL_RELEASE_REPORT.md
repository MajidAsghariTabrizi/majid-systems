# FINAL RELEASE REPORT — Quantiviq V3

Date: 2026-10-18 · Branch flow: `v3` (`6e6cf90`, `e92c950`) → merged → `main` → deployed via `scripts/public_deploy.py`.

> **POST-AUDIT FINAL STATE (2026-10-18):** the post-implementation audit closed this report's open items — the full audit, test matrix and production Lighthouse are in **`QUANTIVIQ_V3_FINAL_AUDIT.md`** (repo root), verdict **READY**, deployed `619532f`, drift zero. The "known limitations" below were re-checked: limitation 1 (simulator English) and 3 (no Lighthouse) are **closed**; limitation 2 (SMTP) remains the sole owner action.

## VERDICT: READY_WITH_CONFIG_BLOCKER → superseded by READY (see audit)

The bilingual site, locale routing, RTL Persian experience, services ladder, honest proof labels and the complete lead pipeline are **live on quantiviq.xyz and verified**. The single blocking configuration item: **owner notification of new leads is BLOCKED_PENDING_CONFIG** — no SMTP/CRM transport exists on the server yet. Leads are durably stored (`/home` app `.data/leads.jsonl`, writable confirmed via live health probe `{"ok":true,"storage":"writable","notify":"pending_config"}`) and never lost; provisioning steps are in LEAD_OPERATIONS.md.

## Deployed architecture

- `/en/*` (default) + `/fa/*` with full route parity for the commercial tree: home, services, system, method, proof, about, contact, privacy — all SSG, per-locale `<html lang dir>`.
- Multiple root layouts: `app/[locale]/` (locale tree) + `app/(shared)/` (journey, profile, work, notes, engineering, open-source, resume — locale-neutral English builder content).
- Middleware: `/` → 307 `/en` (or `/fa` when the explicit `qv_locale` cookie says so; **no** Accept-Language/geolocation detection ever); legacy `/about`, `/contact`, `/services`, `/method`, `/system`, `/proof`, `/privacy` → 308 to `/en/*` preserving query; explicit URLs always override cookies.
- Locale switcher: segmented `[ English | فارسی ]` in the global header on desktop **and** mobile (never hamburger-only), swaps the locale segment preserving deep route + query, ≥42px touch targets.
- RTL: `dir="rtl"` + Vazirmatn + logical CSS properties; zero horizontal overflow verified at 320/390/1440px.
- SEO: per-locale canonicals, hreflang `en`/`fa`/`x-default`, sitemap alternates, `og:locale` (`fa_IR`), `robots.ts`.
- Lead pipeline: `POST /api/lead` — origin check, 8KB body cap, required-field + format validation (shared module, unit-tested), honeypot (`company_site`), per-IP sliding-window rate limit (5/hour, 429s), durable JSONL append as the only success condition, generated `QV-*` reference shown to the submitter, localized inline errors in both languages, `GET /api/lead` health probe.
- Content honesty: four-offer ladder with explicit "what is NOT promised" per offer; proof page labels evidence levels (PUBLICLY VERIFIED / OWNER-ATTESTED / DEMONSTRATION / ARCHIVED); Smart Trader stays archived with the freeze date stated; simulator framed as "Conceptual simulation — not measured client results" in both languages.

## Verification evidence (summaries; details in QA_EVIDENCE.md)

- 82/82 unit tests (incl. EN⇄FA key parity, status-code preservation, lead validation table).
- Build/typecheck/lint green; 1 pre-existing lint warning.
- Language UX Matrix: **27/27 PASS** locally (`scripts/v3-check.mjs`), covering every mission gate row: fresh-root EN default, explicit `/en`, explicit `/fa`, tabs desktop+mobile, deep-route preservation, persistence, RTL, metadata parity, contact form in both languages.
- Legacy gates all PASS: hero-verify, unify-check (updated to V3 contract), journey-refine-check.
- Live checks on quantiviq.xyz: `/` → `/en`; `/fa` serves RTL Persian hero; `/about` → 308; `/journey` 200 untouched; hreflang + sitemap alternates present; switcher markup in served HTML; live test lead `QV-mvdn5vy3-55dc` accepted and stored.
- 17 before/after-adjacent screenshots in `captures-v3/` (EN + FA, desktop/mobile incl. 320px).

## Language UX Matrix (final, live)

| Row | Status |
|---|---|
| Fresh visitor at root (no cookie) → EN | PASS (live) |
| Explicit `/en/...` deep route | PASS |
| Explicit `/fa/...` deep route | PASS |
| Switcher always visible (desktop + mobile, no hamburger) | PASS |
| Switch preserves deep route + query | PASS (both directions, desktop + mobile) |
| Choice persisted (cookie honored at root) | PASS |
| Fresh visitor → LTR correct; FA → RTL correct, no overflow | PASS |
| Per-locale metadata + hreflang + canonical | PASS |
| Contact form fully localized + functional in both | PASS (live submit verified) |
| Legacy URLs preserved (301/308) | PASS |

## Known limitations (accepted)

1. ~~Simulator interior microcopy and the shared builder tree (journey, profile, work, notes, engineering) remain English~~ — **CLOSED by the post-implementation audit**: the organization simulator is now fully localized on `/fa` (labels, roles, inspection cards, edge tooltips, painter copy, a11y) via `src/content/i18n/sim-data.ts`; zero EN display-copy leaks enforced by `test/sim-i18n.test.ts` and proven in the live DOM by `scripts/sim-dom-l10n.mjs`. The shared builder tree remains English by design, visibly labeled `·EN`.
2. Owner notification BLOCKED_PENDING_CONFIG (above) — still the sole open item; leads are durably stored and queued in the outbox (`notify=outbox`), nothing is lost.
3. ~~Lighthouse not yet run against production~~ — **CLOSED**: production mobile runs recorded before/after in `QUANTIVIQ_V3_FINAL_AUDIT.md` and `captures-v3-audit/lh-*-mobile*.json` (EN 86→90/85, FA 95→81/87, TBT 95ms→0, CLS ~0).
4. `smart-trader` subapp and `/resume` print sheet remain as-is (out of V3 scope).

## Post-release checklist for the owner

1. Configure `LEAD_NOTIFY_EMAIL` + SMTP_* (see LEAD_OPERATIONS.md) → drains the durable outbox; flips notification from `outbox` to real e-mail delivery.
2. ~~Run Lighthouse~~ — done (see the audit).
3. Review `docs/quantiviq-v3/BENCHMARK.md` items flagged "borrow" for the next iteration.
4. Optional cosmetic: dedupe X-Frame-Options / X-Content-Type-Options / Referrer-Policy (nginx and Next both emit them).
