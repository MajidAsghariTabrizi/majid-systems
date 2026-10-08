# JOURNEY_STORYBOARD.md — Phase 3.5

Chosen concept: **THE CONVERGENCE, ledger-native** (A+B hybrid).
One persistent SVG system graph (left/dominant) + scene stage (right/overlay).
Scroll = scene order; each scene mutates the graph; ledgers open in place.
Copy is final-on-page copy (owner voice, short, high signal).

## Global chrome

- **Persistent graph** (`<ConvergenceGraph>`): SVG, VIEW 1000×620 like hero
  sim. Layers as node clusters: TECH (00) → PRODUCT (01) → ORG (02) →
  MARKET (03) → MARKETS/DECISION (04) → AI INFRA (05) → AGENT (06) →
  LEARNING (07). Edges accumulate; complexity grows per scene. Era badge.
- **Scene stage**: text + signature interaction per scene, scroll-snapped
  sections (no global sticky-pin like hero — 11 scenes need flow, not one
  pinned frame; each scene is 100vh min with sticky-graph header pattern:
  graph pins while scene content scrolls beside it on desktop).
- **ASK THE SYSTEM** (bottom-right persistent): deterministic curated Q→A
  with evidence links to scenes/ledgers (no LLM). 10 starter prompts.
- **EXPLORE** (top-right): map overlay, jump to any node/scene; Story/Explore
  toggle. Keyboard: `←/→` scene jump, `Esc` closes overlays.
- **Escape hatch** (header): VIEW TRADITIONAL PROFILE → /profile ·
  VIEW RÉSUMÉ → /resume (print-optimized) · GitHub.
- Evidence badges: SHIPPED · PRODUCTION · OPEN SOURCE · EXPERIMENT ·
  LEARNING SYSTEM · PRODUCT IMPACT · REJECTED EXPERIMENT · NEGATIVE RESULT ·
  UNPROVEN · ABSTAINED.
- Recurring loop motif: QUESTION→BUILD→REAL CONDITIONS→MEASURE→FAIL/ABSTAIN/
  LEARN→CHANGE THE SYSTEM — rendered as a small persistent loop chip that
  advances per scene.

## Scene 00 — COLD OPEN (100vh, black)

- Beat 1 (0–1.5s): `I didn't switch careers. I kept moving one layer deeper.`
- Beat 2 (after scroll nudge): `I did not arrive here from AI. I arrived
  here from running systems that could not afford to be wrong.`
- Cue: `SCROLL TO TRACE THE SYSTEM ↓`. Single pulsing node: `TECH`.
- Reduced motion: static beats, no pulse.

## Scene 01 — TECHNOLOGY · BUILDING THE MACHINE

- Graph: TECH cluster assembles (CODE, API, DB, LINUX, GIT, CI, DEPLOY,
  OBSERVE nodes; assembly animation = components snap in).
- Copy: `Before managing products, I learned what it means to make software
  actually run.` + line on employers era (Daapapp · Infinite8 · SportMob).
- Interaction: production flow CODE→PR→CI→BUILD→DEPLOY→OBSERVE→RECOVER —
  click each stage for a one-line real application example (from Phoenix/
  majid-systems practice). Badges: SHIPPED · PRODUCTION.

## Scene 02 — PRODUCT · BUILDING THE RIGHT MACHINE

- Graph: PRODUCT cluster + CUSTOMER/MARKET/VALUE nodes; external signal
  arrows flow INTO the graph (motion: signals enter).
- Copy: `The technical system works. Then ask: but should it exist?` —
  shift line: from "Can we build it?" to "Should we build it, for whom,
  and what changes if we do?"
- Content: discovery · hypothesis · experimentation · analytics · metrics ·
  marketplace design · growth · ranking · monetization · vendor systems ·
  operational products (real-chapter framing, no skill cloud).
- Interaction: a Build/Should-build toggle flips the node emphasis
  (capability nodes dim, value nodes light).

## Scene 03 — AGILE & ORGANIZATION · THE SYSTEM THAT BUILDS THE PRODUCT

- Graph: ORG cluster — PRODUCT/ENGINEERING/DATA/BUSINESS start
  DISCONNECTED, then reorganize into a working flow (topology animation).
- Copy: `Why do good people inside good companies still build slowly or
  build the wrong things?` · `The bottleneck was not always the code.
  Sometimes it was the organization around the code.`
- Content: Agile coaching · product transformation · team design ·
  cross-functional execution · operating models · feedback loops · PSM I
  (one line). Badges: PRODUCT IMPACT.

## Scene 04 — MARKETPLACE & Q-COMMERCE · WHEN PRODUCTS BECOME SYSTEMS

- Graph: MARKET cluster — catalog, inventory, vendor, search, discovery,
  pricing, promotion, order, integration, monetization, operations as an
  operating NETWORK (flows between all).
- Copy: `At marketplace scale, there is no isolated feature. Every decision
  moves through a system.` Employers line (SnappMarket · Okala · Alibaba
  Travels — names only).
- Interaction: hover/tap any domain node → it pulses its direct neighbors
  (decision propagation). Copy: end-to-end tracing, root-cause
  investigation, platform/economic thinking.
- Confidentiality note rendered as a design element: `generalized domain
  map — no employer internals`.

## Scene 05 — THE PREDICTION LAB (tallest scene, multi-part)

### 05.0 intro — the micro-server
- Visual: small compute node center; live data in; experiment generations
  appear/vanish inside; the machine gets visibly more disciplined
  (UI: chaos → gates).
- Copy: runtime had to survive feeds, persistence, restarts, inference,
  delayed outcomes, tracking, paper decisions, resource limits.

### 05A legacy audit (LEDGER #1)
- Numbers on page: 150k rows → 5,241 true 1h + 1,316 4h candles · 307
  trades · ~86% STOP_HIT · ~10.75% win · negative PnL. Verdict: REJECTED.
- Copy: `The first useful result was not a profitable model. It was
  learning that the old system had been confidently wrong.`
- Interaction: audit counter animation.

### 05B pooling experiment (LEDGER #2)
- CURRENT ONLY AUC 0.6848 vs CURRENT+LEGACY 0.6763 bars.
- Equation morph: `MORE DATA = MORE INTELLIGENCE` struck through →
  `RELEVANT DATA + VALID EVALUATION = POSSIBLE LEARNING`.

### 05C Sentinel
- Pipeline chips: LIVE→CANDLES→FEATURES→REGIME→MODEL→CALIBRATION→
  CONFIDENCE→POLICY→ABSTAIN/PROPOSE→LEDGER→RESEARCH LOOP.
- Generation: `22 base + 5 regime features → causal HMM → LightGBM →
  calibration → VON 0.60 gate → PAPER`.
- Hero moment: ALL-CANDIDATES-ABSTAIN animation.
  `The first production behavior I trusted was not BUY or SELL. It was
  "I don't know."` Badge: ABSTAINED. Plus: 16,000+ matured paper outcomes,
  challenger never promoted (champion/challenger visual).

### 05D discipline evolution
- Early chain: MODEL→SIGNAL→TRADE. Later chain (full): DATA PROVENANCE→
  FEATURE CONTRACT→TRAINING WINDOW→OOS/WALK-FORWARD→CALIBRATION→ECONOMICS→
  SHADOW→PROMOTION GATE→PAPER POLICY→OUTCOME LEDGER.
- Copy: `The models changed. The bigger change was learning how not to fool
  myself with them.` Model families as questions table.

### 05E generations (interactive scrub) — M16 · M17/M18 · M19 · lineages · Parallel Worlds
- M16: SIGNAL + → FEES/SLIPPAGE → NET EDGE −. Wallex microstructure list.
- M17/M18: NO QUALIFYING EVENTS → NO FORCED PROMOTION.
- M19: shadow context, gate stayed closed (UNPROVEN).
- Lineages: X25→state_v1→huber/mfe→calibration→fusion→policy; audit reveal:
  only TWO independent lineages (illusion exposed); horizon audit worse
  than baselines → DO NOT PROMOTE.
- Parallel Worlds: `The tests passed. The hypothesis did not.`
- Each = LEDGER card (HYPOTHESIS/BUILT/REALITY/VERDICT/NEXT).

### 05F PHOENIX — autonomy meets consequence
- Gate run animation: SIGNAL→VERIFY→ECONOMICS→RISK→AUTHORITY→EXECUTION→
  RECONCILIATION; a signal visibly stops at ECONOMICS.
- Shadow-first: LIVE_EXECUTION=false posture; engineering behaviors list.
- The five-claims ladder (interactive): THE CONTAINERS ARE UP / THE SYSTEM
  IS HEALTHY / THE SYSTEM IS READY TO ACT / THE STRATEGY HAS EDGE / THE
  BUSINESS MAKES MONEY — each separable, Phoenix proved the first two and
  not the last three: 39,538 shadow decisions · 0 executions · $0 revenue ·
  retired 2026-09-17.
- 8 lessons + core line. Badges: PRODUCTION-ORIENTED R&D · FAIL-CLOSED ·
  UNPROVEN ECONOMIC EDGE · MAJOR LEARNING.

## Scene 06 — FREE BEST ROUTER · INTELLIGENCE BECAME INFRASTRUCTURE

- Graph: AI INFRA cluster. Interaction: a request dot routes through
  providers; one fails (red flash) → reroutes (Wilson-score rank visible).
- Pipeline: DISCOVER→NORMALIZE→HEALTH→CAPABILITY→RELIABILITY→LATENCY→
  RANK→ROUTE→OBSERVE→LEARN. Feature list (verified). Badges: OPEN SOURCE ·
  RUNNING SYSTEM (3★).
- Copy: `The model is not the product. Reliable intelligence requires
  routing, economics and failure handling.`

## Scene 07 — UEA · FROM MODEL TO WORKER

- Graph: AGENT cluster with 9-stage lifecycle ring. Interaction: FAIL button
  → classify (CONTEXT_ERROR) → recover → re-enter flow.
- Copy: `A capable model is not yet a reliable worker.` Badges: OPEN SOURCE ·
  REFERENCE IMPLEMENTATION (MIT).

## Scene 08 — DSH · LONG-RUNNING INTELLIGENCE

- Architecture diagram (11 blocks, safe level). Evolution bullets.
- Bridge copy toward Brain. Badges: ACTIVE R&D.

## Scene 09 — THE BRAIN · WHAT IF THE SYSTEM DIDN'T START FROM ZERO?

- Interaction: run TASK 1 (context = empty) → loop OBSERVE→UNDERSTAND→ACT→
  MEASURE→REFLECT→LEARN→REUSE → TASK 2 visibly starts with more context.
- Layer cards: episodic/semantic/procedural/provenance/retrieval/reflection/
  skills. Techniques list. `Learning is governed.`
- Split-brain moment: LOCAL MEMORY ≠ AUTHORITATIVE RUNTIME MEMORY → resolved
  by source-of-truth governance. Boundary honesty: research loop consults
  memory; live trading decision loop does not (shown as two distinct loops).
- Copy: `A system cannot learn reliably if it cannot answer which memory is
  true.` Badges: ACTIVE R&D · LEARNING SYSTEM.

## Scene 10 — THE CONVERGENCE

- Graph zoom-out: all clusters remain; the 8 career tracks converge
  (bracket visual) → reveal QUANTIVIQ stack (7 layers: ORGANIZATION DESIGN
  → WORKFLOW ENGINEERING → AGENT RUNTIME → MODEL ROUTER → BRAIN → TOOLS &
  CONNECTORS → EVALUATION).
- Copy: `Quantiviq is not a random new direction. It is the convergence of
  everything that came before it.`

## Scene 11 — FINAL

- `I BUILD SYSTEMS THAT LEARN FROM THEIR OWN WORK.`
- Supporting 8 lines (era → lesson, exactly as mission).
- CTAs: EXPLORE QUANTIVIQ → (#top /) · TALK TO MAJID → (mailto majid@quantiviq.xyz
  + /contact) · VIEW GITHUB → (github.com/MajidAsghariTabrizi).

## ASK THE SYSTEM (deterministic)

10 curated prompts (mission list). Each answer: 2–4 sentences + evidence
badge chips + jump links into scenes/ledgers. No LLM; retrieval over the
same typed content model. Fallback line for unmatched queries: list nearest
scenes.

## Mobile (<900px)

- Graph becomes a compact per-scene diagram (top of scene), not persistent.
- Tap = hover; ledgers = accordions; ASK = bottom sheet; Explore = drawer.
- All copy unchanged; order preserved; heavy effects (assembly particles)
  reduced to fewer nodes.

## Performance & a11y

- No WebGL. SVG + CSS + one shared rAF only during scene-local interactions;
  IntersectionObserver pauses offscreen scenes; prefers-reduced-motion =
  stepped states; keyboard: scene jump, ledger open/close, focus rings;
  SEO: server-rendered core content, semantic h1/h2 per scene, metadata,
  /journey canonical. Lighthouse target ≥90.
