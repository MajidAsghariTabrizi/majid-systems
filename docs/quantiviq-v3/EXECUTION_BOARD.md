# EXECUTION BOARD — Quantiviq V3 — updated 2026-10-18 (implementation complete)

Legend: DONE / PARTIAL / IN_PROGRESS / BLOCKED. Docs live in `docs/quantiviq-v3/`.

| Workstream | Owner | File scope | Status | Notes |
|---|---|---|---|---|
| Orchestrator / integration | orchestrator agent | whole repo, branch `v3` (merged `v3` → `main` at `e92c950`) | **DONE** | All workstreams integrated; four DOM gates + unit/build/lint green before merge. |
| Wave-0 documentation | orchestrator + docs worker | `docs/quantiviq-v3/*` | **DONE** | 9 docs at Wave-0; QA_EVIDENCE.md added at release; FINAL_RELEASE_REPORT.md closes the mission. |
| Design shell | orchestrator | `globals.css` (V3 block), `Header.tsx`, `Footer.tsx`, `LocaleSwitcher.tsx`, both root layouts | **DONE** | Segmented EN\|فارسی switcher outside collapsible nav (visible mobile), Vazirmatn for RTL, logical CSS properties. |
| EN content | orchestrator | `src/content/i18n/en.ts` (canonical UI surface), existing `quantiviq.ts`/`shared.ts` reused | **DONE** | Offer ladder, six-beat home, system/method/proof/about/contact/privacy all in dict. |
| FA localization | FA editorial subagent + owner | `src/content/i18n/fa.ts` | **DONE** | Editorial-quality Persian verified by owner; osLayers details, latency bodies and flow steps translated by owner (added after subagent draft); key parity enforced by `test/i18n.test.ts`. |
| Home + simulation | orchestrator | `src/app/[locale]/page.tsx`, `OrgSimulator.tsx`, `OrgNervousSystem.tsx` (layers prop), `LearningLoop.tsx` (steps prop) | **DONE** | Six-beat structure preserved; simulator/OS/flow components accept localized data. Simulator interior microcopy stays EN (documented limitation). |
| Locale pages | orchestrator | `src/app/[locale]/{services,system,method,proof,about,contact,privacy}/` | **DONE** | All SSG'd for en+fa; contact hosts the real lead form with `?intent=` preselect. |
| Lead backend + form | orchestrator | `src/app/api/lead/route.ts`, `src/lib/lead/validate.ts`, `src/lib/lead/store.ts`, `src/lib/lead/notify.ts`, `src/components/LeadForm.tsx`, `.env.example` | **DONE** | Origin check, 8KB cap, honeypot, 5/h per-IP window (X-Real-IP wins; `QV_XFF_DEPTH` for XFF), notify-before-persist, durable JSONL append + durable outbox, health probe (`storage`/`notify`/`outboxPending`), retention + deletion tool (`scripts/leads-tool.mjs`). SMTP delivery **BLOCKED_PENDING_CONFIG** (no credentials on server) — leads stored and queued meanwhile. |
| SEO / a11y | orchestrator | `sitemap.ts` (locale alternates), `robots.ts` (new), per-page canonicals/hreflang, 44px+ targets, aria-live form errors | **DONE** | Post-release Lighthouse recorded in `QUANTIVIQ_V3_FINAL_AUDIT.md` + `captures-v3-audit/lh-*-mobile*.json` (EN 86→90/85, FA 95→81/87, TBT 95ms→0). |
| QA suites | orchestrator | `test/{i18n,lead-store,sim-i18n}.test.ts`, `scripts/v3-check.mjs` (Language UX Matrix + lead E2E), `scripts/v3-shots.mjs` | **DONE** | 99/99 unit (post-audit); 27/27 matrix rows + hardened lead contract checks; screenshots in `captures-v3/` + `captures-v3-audit/{before,after}/`; legacy gates (hero/unify/journey) all PASS. |

Residual known gaps (accepted, documented in QA_EVIDENCE.md): simulator interior + shared builder tree (journey/profile/work/notes) in English; owner notification pending config; Lighthouse pending post-release run.
