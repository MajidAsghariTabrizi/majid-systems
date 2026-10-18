# EXECUTION BOARD — Quantiviq V3 — updated 2026-10-18

Legend: DONE / PARTIAL / IN_PROGRESS / BLOCKED. Docs live in `docs/quantiviq-v3/`.

| Workstream | Owner | File scope | Status | Notes |
|---|---|---|---|---|
| Orchestrator / integration | orchestrator agent (me) | whole repo, branch `v3`, merges between workstreams | IN_PROGRESS | Wave-0 docs DONE; sequencing + integration reviews ongoing. |
| Wave-0 documentation | orchestrator agent (me) | `docs/quantiviq-v3/*` | **DONE** | 9 docs: BASELINE, BENCHMARK, STRATEGY, ART_DIRECTION, I18N_PLAN, PROOF_AUDIT, LEAD_CONTRACT, LEAD_OPERATIONS, EXECUTION_BOARD. |
| Design shell | design worker | `src/app/globals.css`, `src/components/Header.tsx`, `Footer.tsx`, `LocaleSwitcher.tsx`, layout files | IN_PROGRESS | Token system + dark/mint grammar exist; locale shell (`[locale]/layout.tsx`) scaffolding in working tree, uncommitted. |
| EN content | EN content worker | `src/content/*.ts` (quantiviq, capabilities, principles, shared) | IN_PROGRESS | Six-beat narrative unified at `3c516e2`; offer-ladder copy + beat CTAs to be aligned with STRATEGY.md. |
| FA localization | FA subagent | `src/content/i18n/fa.ts` | IN_PROGRESS | `index.ts` imports `./fa` — **file does not exist yet**; build is blocked on landing it (typed parity with `en.ts` per I18N_PLAN.md). |
| Home + simulation | home worker | `src/app/[locale]/page.tsx` (pending), `src/components/OrgSimulator.tsx`, `OrgNervousSystem.tsx`, `OrgTransform.tsx` | IN_PROGRESS | Simulator + OS diagram are the strengths to preserve; homepage under `[locale]` not yet created (old root page removed in working tree). |
| Locale pages | locale-pages worker | `src/app/[locale]/{about,contact,services,method,system,proof,privacy}/` | IN_PROGRESS | Middleware 308 map already references all seven; pages themselves pending. `/en/contact` = placeholder links → becomes lead form target. |
| Lead backend + form | lead worker | `src/app/api/lead/`, `scripts/lead-e2e.mjs`, `.env.example`, `src/components/LeadForm.tsx` | IN_PROGRESS | Contract fixed in LEAD_CONTRACT.md / LEAD_OPERATIONS.md; none of the code exists yet. Notification BLOCKED_PENDING_CONFIG (SMTP unset). |
| SEO / a11y | SEO worker | `src/app/sitemap.ts`, `manifest.ts`, metadata in layouts, alt/contrast pass | IN_PROGRESS | hreflang + per-locale canonical already in `[locale]/layout.tsx`; sitemap alternates + a11y audit pending. Lighthouse never run — schedule after design shell settles. |
| QA suites | QA worker | `test/*.test.ts`, `scripts/lead-e2e.mjs`, typecheck/lint/build gates | IN_PROGRESS | Existing: content, journey, sim tests. To add: i18n key-parity test, lead contract tests, E2E. |

Cross-workstream blockers (live): FA build block above; nothing else at time of writing.
