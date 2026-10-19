# QA_EVIDENCE — Quantiviq V3

Date: 2026-10-18 · Branch: `v3` · Evidence collected locally before release.

## Gates (all green)

| Gate | Command | Result |
|---|---|---|
| Typecheck | `npm run typecheck` | clean |
| Unit/integration | `npm run test` | 82 pass / 0 fail (incl. new i18n parity + lead validation suites) |
| Lint | `npm run lint` | 1 pre-existing `no-page-custom-font` warning (Google Fonts link pattern, unchanged from v2) |
| Production build | `npm run build` | green; `/en/*` + `/fa/*` SSG, middleware 26.7 kB |
| Language UX Matrix | `node scripts/v3-check.mjs` | **27/27 PASS** (below) |
| Legacy DOM gates | `hero-verify` / `unify-check` / `journey-refine-check` | ALL PASS (unify updated to V3 contract: locale nav, 8 signal dots, 6 section h2s) |

## Language UX Matrix (rows from v3-check.mjs)

- R1 fresh visitor `/` → 307 `/en`, `lang=en`, EN tab active; no Accept-Language detection
- R2 `/fa` → `lang=fa dir=rtl`, FA tab active, Persian hero renders
- R3 explicit `/en` overrides remembered FA choice
- R4 root honors most recent explicit choice (cookie `qv_locale`)
- R5 EN→FA switch preserves deep route + query (`/en/contact?intent=infrastructure` ⇄ `/fa/contact?intent=infrastructure`); intent preselected; Persian form labels
- R6 mobile (390px): switcher visible without hamburger, zero horizontal scroll in RTL, Persian services page, mobile switch preserves `/services`
- R7 hreflang `en`/`fa`/`x-default` alternates + per-locale canonicals + `og:locale` (`fa_IR` on FA pages)
- R8 legacy: `/about`→308 `/en/about`; `/contact?intent=…`→308 `/en/contact?intent=…`; `/journey` untouched
- LEAD: negative submit → 4 localized inline errors; valid submit → success with `QV-…` reference; record durably in `.data/leads.jsonl` (`status:stored`, `notify:outbox_queued`); FA validation message in Persian; honeypot → fake 202 success with **nothing stored** (verified byte-identical file); burst → 429; `GET /api/lead` health → `storage:writable`, `notify:outbox`, `outboxPending` count

## Post-audit update (2026-10-18)

- Simulator localization, production Lighthouse and the full hostile-QA pass are recorded in **`QUANTIVIQ_V3_FINAL_AUDIT.md`** (repo root). Production mobile: EN 86→90/85, FA 95→81/87, TBT 95ms→0, CLS ~0; JSONs in `captures-v3-audit/lh-*-mobile*.json`. Rendered-DOM localization on the live site: `scripts/sim-dom-l10n.mjs` ALL PASS.

## Screenshots (`captures-v3/`, gitignored)

17 captures: EN home/services/system/contact desktop + sim frame, contact error/success states; FA home desktop/390/320, system/method/proof desktop, contact desktop + error state; mobile EN/FA services.

## Known limitations (stated, not hidden)

- ~~Simulator interior microcopy~~ **CLOSED (post-audit)**: fully localized on `/fa`; see `QUANTIVIQ_V3_FINAL_AUDIT.md`. The shared builder tree (journey, profile, work, notes) remains English **by design**, visibly labeled `·EN`.
- Owner notification SMTP delivery is **BLOCKED_PENDING_CONFIG** until `LEAD_NOTIFY_EMAIL` + SMTP env exist on the server; meanwhile leads are durably stored **and queued in the outbox** (nothing lost, nothing faked) (see LEAD_OPERATIONS.md).
- ~~Lighthouse: not yet run~~ **DONE (post-audit)**: production mobile before/after recorded in `QUANTIVIQ_V3_FINAL_AUDIT.md`.
- Local-only CORS console artifacts in `journey-refine-check` stem from Next serving local prefetch redirects against `localhost` while the page is loaded from `127.0.0.1`; whitelisted with an explanatory comment. Single-host production is unaffected.
