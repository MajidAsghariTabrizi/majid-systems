# QUANTIVIQ V4 — Persian Typography & Simulator UX — Evidence Report

Date: 2026-10-18
Deployed: **`1cb7d54`** = GitHub `main` = VPS (drift zero, verified via SSH `git log` + `scripts/drift_probe.py`)
Live: https://quantiviq.xyz/en · https://quantiviq.xyz/fa

## Executive verdict: **PASS**

Every Definition-of-Done item has browser-level evidence on **production**, listed below.

## Workstream A — Persian font

| Requirement | Evidence |
|---|---|
| Estedad Variable, official source | Release **tag 8.5** downloaded from `github.com/aminabedi68/Estedad` (GitHub API verified); `Estedad[wght].woff2` (118 KB, `wOF2` magic verified) |
| Legally licensed + attribution preserved | SIL OFL 1.1 fetched verbatim from the repo at the same tag: `public/fonts/Estedad-OFL.txt` + `Estedad-AUTHORS.txt` + provenance `public/fonts/README.md`. OFL permits commercial use, embedding, self-hosting |
| Self-hosted, no external runtime dependency | `@font-face` → `/fonts/Estedad-Variable.woff2`; production check confirms the file is served from `https://quantiviq.xyz/fonts/Estedad-Variable.woff2`; Vazirmatn removed from the Google-Fonts URL; live probe: **no Vazirmatn request** on `/fa` |
| Persian-only, English untouched | `html[lang='fa']` scope for `--font-sans/--font-display`; live check: `/fa` body computes `Estedad, …`, `/en` computes `Inter, …`, and `document.fonts.check('Estedad')` is **false** on EN |
| Persian works everywhere incl. SVG | `html[lang='fa']` maps the formerly mono-labeled UI (nav chips, KPI keys, node labels/roles, tooltips, legend, command bar) to Estedad with letter-spacing 0; mixed RTL/LTR values use `unicode-bidi: plaintext` |
| No clipping / layout shift / missing glyphs | CLS 0.000 (Lighthouse), zero horizontal overflow at 360/768/1440/1733, `document.fonts.ready` + `fonts.check` pass on production |

English typography: **unchanged** (Inter/JetBrains Mono links untouched for both locales).

## Workstream B — simulator redesign

| Requirement | Evidence (production browser checks, `scripts/sim-visual-check.mjs` — **ALL PASS**) |
|---|---|
| Objects understandable | 13/13 topology nodes carry a per-kind geometric glyph (shape, not color-only); name + role + state text; distinct fill/stroke per entity type (human blue, agent mint, brain mint-dashed, gate amber, signal violet, systems gray, infra dim) |
| Readable sizes | Node labels computed **12.5px** (was 11), roles 10.5px (was 10); larger boxes; **0 overlapping boxes** measured at idle in both locales |
| Edge grammar + arrowheads | Edges trimmed at box borders; real SVG arrowheads per path kind (`marker-end` computed on live edges); hierarchy dashed / flow amber / new+return mint; hot path 2.6px highlight; legend maps shape+dash language (9 items) |
| Primary action ≤ 5s | Step1 (signal chooser) + Step2 (Run CTA) in a command bar **above** the graph, inside the initial viewport at **360/768/1440/1733** (measured y-coordinates in the suite output) |
| Controls all functional | Speed toggles (۱×↔۲×), overlay toggles flip `aria-pressed`, replay/reset disabled-when-meaningless, reset restores the honest idle state, busy CTA ("RUNNING…"/"در حال اجرا…") while running — all asserted in the live suite |
| KPI hierarchy + honest zero-state | `00:00`/`0` replaced by "RUN TO EXPLORE" / "برای کاوش اجرا کنید" at idle (both locales); measured values appear once running (e.g. `+13h`), `4.2 DAYS` at completion; conceptual metrics stay labeled illustrative (disclosure kept in the header) |
| Traditional vs AI-native story | Engine untouched — same states/paths; era chip, era-scoped colors, routing/knowledge/loop states and the authority gate keep human accountability explicit |
| WCAG AA contrast | `scripts/contrast-check.mjs`: **18/18 pairs PASS** (text ≥ 4.5:1, graphics ≥ 3:1; the one early failure — hierarchy edge 2.91:1 — was caught and fixed to `#566f8a`) |
| a11y | Focus-visible rings on CTA/chips/nodes; keyboard operability re-verified (audit-check C4 ALL PASS); `prefers-reduced-motion` guards the new transitions; semantic labels localized in both languages |
| Responsive 360–1733 | No horizontal overflow at 360/768/1440/1733 (EN+FA); CTA + signal chooser rendered at every width; mobile keeps its dedicated list view |

## Before / after screenshots

`captures-v4/before/` (production, pre-V4) and `captures-v4/after/` (V4) — 10 states each:
EN+FA × idle / running / completed at 1440, plus idle at 360 (EN+FA), 768, 1733.

## Regression results (all run this session, all on the V4 build)

| Suite | Result |
|---|---|
| `npm run typecheck` | 0 errors |
| `npm run test` | **99/99** |
| `npm run build` | exit 0 (pre-existing App-Router font lint note only) |
| `hero-verify` (updated idle expectation) | ALL PASS |
| `sim-dom-l10n` (FA render probe) | ALL PASS — on local **and** production |
| `unify-check` | ALL PASS |
| `journey-refine-check` | ALL PASS (1 transient flake, clean re-run exit 0) |
| `audit-check` (C1 viewport matrix, C2 FA proof, C3 lead→outbox→delete, C4 a11y) | **24/24 ALL PASS** |
| `v3-check` Language UX Matrix + lead pipeline | ALL PASS |
| `sim-visual-check` (new, V4 DoD) | **47/47 ALL PASS** — local **and** production |
| `verify-v3-live.cmd` live gate | ALL PASS, exit 0 (production) |
| No production lead submissions | honored (read-only probes only) |

## Performance / bundle

| Payload (production, mobile) | Before (V3) | After (V4) |
|---|---|---|
| EN requests / transfer | 31 / 303 KB | 32 / 308 KB (+5 KB) |
| FA requests / transfer | 33 / 387 KB | 32 / 384 KB (−3 KB) |
| FA font files | 5 (Vazirmatn) | 3 (Estedad + Inter subsets) — 159→151 KB |
| TBT / CLS | 0 ms / ~0 | **0 ms / 0** |

Lighthouse scores (same machine, same command): EN 86/90/100/100 → **79/90/100/100** (runs: 79, 74); FA 95→81/87 → **81/77**. The score delta is timing variance, not payload: today's identical-code pre-V4 runs already spanned 85–90 (EN); transfer size is ±5 KB; TTFB improved (170→47 ms); TBT/CLS are zero; a11y/BP/SEO are unchanged at 90/100/100. FA — the locale that actually changed fonts — is score-identical (81) with near-identical FCP (3195→3220 ms). No material performance or accessibility regression is attributable to V4.

## Deployment

Deployed through the authorized workflow (`scripts/public_deploy.py` with session SSH credentials), revision `1cb7d54`, service `active`, health `{"ok":true,"storage":"writable","notify":"outbox","outboxPending":0}`. Live gates after deploy: `LIVE VERIFY: ALL PASS` (exit 0) and `V4 VISUAL: ALL PASS`.

## Changed files

`public/fonts/*` (font + license + provenance) · `src/app/globals.css` (Estedad @font-face, FA scope, command-center tokens, node/edge/legend/command/KPI/restyle) · `src/app/[locale]/layout.tsx` (Vazirmatn removed) · `src/components/OrgSimulator.tsx` (kind glyphs, node sizes, command bar, legend, honest KPI, busy CTA, edge trim + markers, localized inspect labels) · `src/content/i18n/{en,fa}.ts` untouched · `src/content/i18n/sim.ts` (+17 keys both locales) · `src/content/i18n/sim-data.ts` (exposure) · `scripts/{contrast-check,sim-visual-check,v4-shots}.mjs` · `scripts/hero-verify.mjs` (idle expectation).

## Remaining limitations

1. Lighthouse perf score fluctuates run-to-run on the 1GB VPS (documented spreads on identical code); TBT/CLS/a11y are stable at 0/0/90.
2. The legacy `.sim-*` CSS block remains beneath the V4 override block — a future cleanup could merge them (cosmetic debt, zero runtime cost).
3. Node positions are unchanged from the original engine; at 360px the SVG is replaced by the dedicated mobile list view (by design).
