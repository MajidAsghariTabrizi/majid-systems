# Quantiviq — V5 Flow Intelligence UX & Persian Typography Overhaul

**Mission:** P0 graph readability + Signal Journey narrative + site-wide Persian typography, per the flow-intelligence mandate.
*"A first-time visitor must understand within 5 seconds what entered the company, where it traveled, where it stopped, who owns the next action, and how much time was lost."*

- **Deployed commit:** `9846eb5` (local = remote = production, drift zero)
- **Live target:** https://quantiviq.xyz/en + /fa
- **Verdict: PASS** — every acceptance criterion verified with browser-level evidence on production.

---

## 1. Executive summary

The simulator's core failure was mathematical, not aesthetic: an SVG viewBox of 1000×620 letterboxed into a ~940×337px stage rendered at base scale ≈ 0.47–0.54, so V4's 12.5px labels displayed at ~6–7px. V5 replaces passive fitting with a **camera system**:

- **Operational Flow (default)** fits the *actual signal path* of the active era (OLD_HOPS / NEW_STEPS node sets — derived from the engine, no invented edges) into the **visible** viewBox width (letterbox-aware), delivering camera k ≈ 1.58.
- **Full System Map** is the secondary mode (everything, whole viewBox).
- Wheel zoom-to-cursor, drag pan (5px threshold + click suppression), and a viewbar: zoom in / out / refocus path / full map / reset / fullscreen — all `aria-labelled`, FA-localized, keyboard reachable.
- Camera auto-refits on resize/fullscreen **until the user takes control** (pan/zoom marks `userCamRef`).
- Rendered node title at the default 1366×768 view: **15.3px measured** (`getScreenCTM().a × font-size`, suite-asserted ≥ 15px); roles 13.5 units → ~12.2px. Node boxes 150×46 default (up from ~120×36), icon scale 1.35.

The **Signal Journey stepper** (RECEIVED → ROUTED → WAITING → DECISION → ACTION → LEARNING) is painter-driven from the real flow state (`oldFlow(T)` / `newFlow(T)` at the rAF timeline T), shows live accumulated latency (`formatLatency`, honest 00:00 start), maps approval waits to DECISION, and never advances ahead of the engine. Unrelated nodes de-emphasize to opacity 0.55 (edges 0.28) while the signal runs, operational mode only — the traveled path stays lit.

**Site-wide Persian typography** (audit-driven, centralized tokens): `:root --fs-h1…--fs-btn` clamp() scale (44–56 / 30–40 / 22–28 / 19–22 / 16–18 / 15 buttons) with `--lh` tokens; h1–h4, `.q-display`, `.q-h2`, `.service-name`, cards, buttons, nav, and forms re-pointed; the 540px h1 cap and a privacy inline override removed; nav consolidated to one size. `html[lang='fa']`: line-height 1.75 body / 1.35 headings, zero letter-spacing on display text (cursive joining preserved), weight 700 display (800 was too heavy for Estedad), the remaining ~20 mono users that render Persian moved to Estedad (`.eyebrow`, `.lead-label`, `.sim-disclaimer`, `.q-answer`, form labels, …), 13px floor for tiny FA text. **English unchanged** (Inter + JetBrains Mono, no Estedad request on /en — suite-verified).

## 2. Acceptance criteria — evidence

| Criterion | Evidence | Result |
|---|---|---|
| Path readable at 1366×768 without zoom | `node scripts/sim-visual-check.mjs` vs prod: `v5: node label rendered >= 15px on 1366x768 — 15.3px` | **PASS (measured)** |
| 5-second comprehension | default = Operational Flow (signal path fills frame, no full-graph noise) + journey stepper row 2 + KPI in command bar; `captures-v5/after/*-idle-1366.png` | PASS |
| 4 scenarios, no regression | `node scripts/v5-scenario-matrix.mjs` (final build): **8/8** (customer-issue / product-signal / production-incident / revenue-drop × EN/FA; old KPI 4.2 DAYS / ۴٫۲ روز, both runs PASS, zero console errors) | PASS |
| Node/edge interactions meaningful | detail panels unchanged (V3/V4 verified); V5 adds no fake interactivity; mobile full-map = read-only fit view | PASS |
| All controls work | suite: viewbar 6 buttons (full-map→fit, refocus→path, zoom-in, reset each verified by transform change/restore); Run/Replay/Reset/Speed/Overlays re-verified by hero-verify + suite | PASS |
| Persian H1/H2/H3 visibly improved | prod suite: FA H1 55.99px/1.35/no-tracking/Estedad; H2 40px; eyebrow mono removed; EN H1 stays Inter; screenshots fa-desktop-idle-1366.png before/after | PASS |
| Font licensing verified | Estedad Variable, OFL 1.1 (carried from V4; license file in repo, self-hosted 118KB single WOFF2, weight axis 100–900) | PASS |
| RTL/LTR no overlap | v3-check language UX matrix: ALL PASS on final build; FA run visual (RTL journey/stepper mirror via logical properties) | PASS |
| Mobile usable | suite: journey stepper present, full-map toggle opens fit view, controls ≥ 44px (measured 44,44,44), no horizontal overflow with map open; 390×844 shots both locales | PASS |
| Before/after screenshots | `captures-v5/before/` (10, prod pre-deploy) + `captures-v5/after/` (10, final build) | PASS |
| Tests/build/browser | 99/99 unit · typecheck clean · build clean · contrast 18/18 · hero-verify · sim-dom-l10n · unify · journey-refine · audit-check · v3-check ALL PASS (local); v4-verify-live + V5 suite ALL PASS on production | PASS |
| Engine purity | `machine.ts`/`timeline.ts` untouched (git diff: only model.ts positions = presentation); full-run + matrix prove identical outputs (4.2 DAYS / +13h) | PASS |

## 3. Key engineering decisions

1. **Camera, not layout rewrite.** The engine's coordinates are presentation data; a camera layer (transform on one `<g>`) achieves readability with zero engine risk and no new dependencies (React Flow/ELK explicitly avoided).
2. **Visible-width fitting.** Fitting to the viewBox width wasted the letterbox surplus; `visW = stageW / min(stageW/1000, stageH/620)` (clamped 1.5×) lets the height-bound stage use its extra width — the single biggest readability lever (13.5 → 17.6px at equal font size).
3. **Painter-driven journey.** The rAF loop advances T imperatively (refs only, no per-frame React renders); a render-time stepper froze at T=0. The journey therefore derives in the painter from `oldFlow/newFlow` at the same T the strip uses — single source of truth, zero re-renders.
4. **Chrome density at 1366×768.** The stage is height-bound; flattening the controls to one row (fixed a `flex-direction: column` inheritance), tightening gaps/padding, and 17-unit labels landed 15.3px measured (target ≥ 15).
5. **Tokens, not point fixes.** All type sizes re-pointed at 9 `:root` tokens; future scale changes are one-line edits. FA gets metrics overrides, not a parallel stylesheet.

## 4. Typography benchmark (mission requirement)

**Estedad (chosen) vs Vazirmatn:** Estedad Variable — one 118KB WOFF2 (wght 100–900), OFL 1.1, bilingual Latin coverage, x-height and contrast closer to Inter's rhythm, variable axis lets FA headings drop 800→700 without a second file. Vazirmatn — 5 subsets ≈ 159KB for equivalent coverage, no variable axis in the free static build used for comparison. Both OFL; Estedad wins on bytes, weight flexibility, and Latin harmony. Carried unchanged from V4; V5's contribution is the site-wide scale/line-height/tracking/mono-purge on top of it.

## 5. Accessibility

- Journey = `role="group"` + `aria-label` (no aria-live spam; the strip remains the live region); current step carries `aria-current="step"`.
- Viewbar: `role="toolbar"`, every button `aria-label` + `title`, localized; `:focus-visible` outline (2px `--sq-human`).
- Status never color-only: glyphs on every node (13/13), journey dots + text weight + `aria-current`, de-emphasis pairs opacity with the trail path.
- Mobile touch targets 44px minimum (measured); reduced-motion kills the camera transition; `maximumScale: 5` preserved (200% text resize usable — rem-token body).
- Lighthouse prod: a11y 0.9 (EN & FA).

## 6. Performance (Lighthouse, production)

| | EN perf | FA perf | a11y | SEO | CLS | LCP |
|---|---|---|---|---|---|---|
| V4 baseline (EN) | 0.79 | — | — | — | 0.0000 | — |
| **V5** | **0.86** | **0.81** | 0.9 | 1.0 | 0.0005 / 0.0000 | 3.0s / 3.8s |

No regression; EN perf improved (camera adds no layout cost; type tokens removed render-blocking variance).

## 7. Remaining risks / explicitly unverified

1. **"5-second comprehension" is a design judgment** supported by structure + screenshots, not a measured user-study number.
2. Long FA role strings (e.g. "قضاوت · مالکیت · استثناها") can slightly overhang node boxes on the operational view at max zoom-out — text remains on the dark stage background, contrast-checked, but not box-contained.
3. Lighthouse LCP 3.0–3.8s is hosting/TTFB-bound (single VPS, no CDN) — unchanged from V4, out of mission scope.
4. `sj-lat` shows `00:00` at run start before the first wait accrues — honest (latency accrues in waits), may read as "stuck" for ~2s at 1×.
5. Mobile full-map is a static fit view (no pan/zoom) — intentional (list is the primary mobile surface); touch pan/zoom can be added later from the same camera code.

## 8. Artifacts

- Code: `9846eb5` — `src/components/OrgSimulator.tsx` (camera + viewbar + journey + mobile), `src/lib/sim/model.ts` (2 presentation nudges), `src/content/i18n/sim{,-data}.ts` (+26 keys ×2 locales), `src/app/globals.css` (V4 block label bump + V5/V5b blocks ≈ 640 lines), `src/app/[locale]/privacy/page.tsx` (inline style removal).
- Probes: `scripts/sim-visual-check.mjs` (extended with v5 + FA typography + mobile checks), `scripts/v5-scenario-matrix.mjs`, `scripts/v5-shots.mjs`, `verify-v5-live.cmd` (production receipt gate).
- Evidence: `captures-v5/{before,after}/` (10 each), `captures-v5/lh-{en,fa}-prod-v5.json`, `captures-v5/smoke*.png`.
