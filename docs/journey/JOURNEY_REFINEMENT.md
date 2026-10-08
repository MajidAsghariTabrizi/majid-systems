# JOURNEY_REFINEMENT.md — UI/UX refinement pass

Scope: system map clarity, CTA hierarchy, purposeful motion. No identity change.

## 1. System map — explanatory, not decorative

**Before:** a 340px dim mini-graph with one ambiguous `.hot` node, no title,
no legend, no position context — readable only after you already understood it.

**After:**
- **Header** — `SYSTEM MAP` + sublabel `Career layers converging into
  Quantiviq`: the panel now states what it is in one glance.
- **Larger composition** — rail 340→380px, graph fills the space between
  header and footer (bigger nodes, more padding for labels).
- **Three explicit node states** — `is-active` (mint, stroked 2px, gentle
  pulse), `is-connected` (solid gray stroke, full opacity), `is-future`
  (dashed, hollow, 0.34 opacity) + **legend** keyed to those states.
- **Progress context** — `SCENE 05 / CAN A SYSTEM LEARN WHEN NOT TO ACT?` +
  mint progress bar (n/11) that advances with the story.
- **Navigation** — every layer node (and the QV center) is clickable /
  keyboard-focusable and jumps to its scene: the map is now a real
  navigation layer, not a picture.
- **Live edges** — edges carrying the active scene flow with a slow marching
  dash; settled edges stay traced and quiet.
- **Bug fixed in passing:** the graph indexed the scene off-by-one, so the
  "active" layer was actually one scene ahead of the page (product lit while
  you read Technology). Now map and story agree exactly.

## 2. CTA hierarchy — decisive primary, warm secondary, quiet tertiary

- **Primary (EXPLORE QUANTIVIQ →):** filled mint gradient, inset highlight,
  deep mint glow shadow; hover lifts 2px + brightens; pressed settles with a
  scale micro-response. Reads as the obvious single next action.
- **Secondary (TALK TO MAJID →):** warm amber outline, tinted background on
  hover — human, clearly clickable, clearly subordinate to primary.
- **Tertiary (VIEW GITHUB →):** quiet gray, lighter padding — a utility
  action, polished but lowest emphasis.
- **Typography:** 12.5px / weight 600 mono, tightened letter-spacing (0.09em),
  separated animated arrow glyph that drifts 4px on hover. All three states
  (hover / focus-visible ring / active-pressed) explicit; full-width stacked
  on small screens.
- The same hover-lift language was extended to ASK THE SYSTEM, run buttons
  and ledger cards so the whole page shares one interaction grammar.

## 3. Motion — richer, still controlled

- **Scene reveals:** kicker → theme → headline stagger in (90ms steps) as a
  scene enters; thesis/quote blocks draw their accent border after the copy
  settles; the soul box gains a whisper of mint light.
- **Cold open:** the two thesis lines and the TECH node now arrive
  sequentially — the idea is *discovered*, not splashed.
- **Graph:** edge tracing on reveal + marching flow only on the live edge +
  active-core breathing pulse.
- **Continuity:** map zoom at the convergence scene, smooth-scroll jumps from
  the map, scene-to-scene reveal timing shared across all 11 sections.
- **Reduced motion:** all of the above collapse (≈0.01ms), content is never
  hidden — verified: hidden-element opacity stays 1, animations read 1e-05s.

## Verification

- `scripts/journey-refine-check.mjs` — 22/22 (map states settled 1/4/3,
  legend, progress, click-navigation, CTA gradient/weight/lift/arrows, reveal
  mechanics, reduced-motion guarantees).
- `scripts/journey-verify.mjs` — full regression 38/38, 0 console errors.
- `npm run test` 63/63 · typecheck/lint clean.
- Before/after captures: `captures-journey/before/` (graph rail, final CTAs,
  technology scene) vs `captures-journey/after-map-decision-systems.png`,
  `after-final-ctas.png`, `after-technology.png` + the refreshed 01–22 set.
