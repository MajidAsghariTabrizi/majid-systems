# JOURNEY_BUILD_REPORT.md — Final

THE CONVERGENCE shipped at `quantiviq.xyz/journey` (+ `/resume` escape hatch).
Companion docs: JOURNEY_EVIDENCE_MAP.md · JOURNEY_EXPERIMENT_LEDGER.md ·
JOURNEY_BENCHMARK.md · JOURNEY_CONCEPTS.md · JOURNEY_STORYBOARD.md (this folder).

## IMPLEMENTED

- **Cold open** (thesis lines, pulsing TECH node, scroll cue) → **11 scenes**:
  Technology (clickable CODE→…→RECOVER production flow) · Product ·
  Organization (disconnected→flow reorg animation) · Marketplace (tap-to-
  propagate operating network) · **The Prediction Lab** (micro-server survival
  list, legacy-audit counters, MORE-DATA≠MORE-INTELLIGENCE equation +
  pooling bars, Sentinel 11-stage pipeline + all-ABSTAIN replay + VON 0.60
  generation, early-vs-late discipline chains, 14 research rules, models-as-
  questions table, 8-generation experiment scrubber with ledgers, Phoenix
  gate-run + claims ladder + numbers + 8 lessons) · Router (request failover
  animation + Wilson features) · UEA (lifecycle ring with ⚡FAIL → classify →
  recover) · DSH · Brain (task-1/task-2 memory loop, 7 layer cards,
  techniques, split-brain divergence→governance) · Convergence (7 tracks →
  7-layer Quantiviq stack, graph zoom-out) · Final (mission-exact copy + 3 CTAs).
- **Persistent radial career graph** (desktop rail): 8 layer clusters
  accumulate per scene; active layer highlighted; convergence edges + center
  node at Scene 10; zoom transform.
- **ASK THE SYSTEM**: deterministic curated matcher (stopword-filtered token
  overlap over 10 evidence-linked answers); abstains on unknown — no LLM,
  no improvisation.
- **EXPLORE** map (jump anywhere, 4 groups) · résumé escape hatch in chrome.
- **Experiment Ledger** cards: HYPOTHESIS / BUILT / REALITY / VERDICT / NEXT
  with evidence badges; verdicts include REJECTED, DO NOT PROMOTE,
  NO FORCED PROMOTION, MAJOR LEARNING — scar tissue is structural.
- **Mobile**: graph rail hidden, tap interactions, ledgers single-column,
  everything verified on 390×844. **Reduced motion**: all transitions/
  animations collapsed to ~0ms. Keyboard: Escape closes panels, focus rings
  scene-wide.
- **/resume**: print-optimized traditional view (career-layers table,
  flagship systems, principles; Print → PDF).

## FILES CHANGED

- `src/content/journey.ts` — typed content model (scenes, nodes, evidence,
  experiments, all scene copy, ASK knowledge). The single source.
- `src/lib/journey/graph.ts` — pure radial layout, cumulative visibility,
  chain edges.
- `src/components/journey/JourneyExperience.tsx` — orchestrator (chrome,
  graph, scenes, ask, explore).
- `src/components/journey/widgets.tsx` — 13 interactive widgets.
- `src/app/journey/page.tsx`, `src/app/resume/page.tsx` — routes + metadata.
- `src/app/globals.css` — journey + résumé styles (tokens only, no new deps).
- `src/content/shared.ts` — NAV + Journey link.
- `test/journey.test.ts` — 22 tests. `scripts/journey-verify.mjs` — 38 live
  DOM assertions + 22 captures.
- `docs/journey/*.md` — the five planning deliverables.

## VERIFICATION

- `npm run test` 63/63 · typecheck clean · lint clean (pre-existing font
  warning only) · build success.
- `scripts/journey-verify.mjs`: **38/38 assertions**, 0 console errors —
  every interaction (flows, reorg, network, abstain, scrubber, gate, ladder,
  failover, fail/recover, memory, split-brain, convergence, ask incl.
  abstention, explore, Escape, mobile, resume, SSR/SEO).
- Captures: `captures-journey/01…22` (cold open → final → graph rail → ask →
  explore → mobile ×2 → resume). Before/after: homepage before = current
  homepage; after = homepage with Journey nav entry (captures-journey/22 +
  existing hero captures unchanged).

## PERFORMANCE

- `/journey` 22.8 kB route, **117 kB First Load JS** (homepage: 115 kB);
  `/resume` 193 B / 94.1 kB. Static prerender (SSG).
- No WebGL/Three; SVG + CSS only. Animations are scene-local, state-driven
  CSS transitions; IntersectionObserver-gated reveals; `prefers-reduced-
  motion` collapses everything. Content is server-rendered → useful text
  visible immediately, no animation gates reading.

## SECURITY / PRIVACY REVIEW

- No employer-confidential data: employer NAMES only (owner-stored list),
  zero internal architecture/metrics/incidents/vendors/hosts/role-titles
  (enforced by test `employer confidentiality`).
- Trading numbers limited to the mission-approved public subset; INTERNAL
  pack-sensitivity items (promotion-gate thresholds, barrier-geometry
  tables, VPS identifiers) excluded — see ledger appendix.
- No secrets, API keys, or credentials in content; static site, no
  server-side LLM; ASK is deterministic local data. External links: GitHub
  repos (public) only.

## UNVERIFIED

- Human eyeballing of captures (model cannot ingest images) — DOM/palette-
  level verification only; recommend a human pass over `captures-journey/`.
- Lighthouse not run headless-to-report here (bundle size + static
  prerender + zero console errors are the recorded proxies).
- Safari not tested locally (Chromium/Edge only); the stack is standard
  CSS/SVG — low residual risk.
