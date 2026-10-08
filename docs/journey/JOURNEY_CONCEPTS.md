# JOURNEY_CONCEPTS.md — Phase 3

Three genuinely different concepts (not color variations). Scored on
MEMORABILITY × CLARITY × PROOF × PERFORMANCE (0–5 each, × for product of
the four / 625).

---

## Concept A — THE CONVERGENCE (mission-native)

- **Metaphor:** one career = one system assembling itself. A persistent node
  graph gains a layer per era; at the end it zooms out and *is* the Quantiviq
  architecture. The career becomes the architecture.
- **Interaction:** scroll drives scene transitions; each scene adds graph
  layer + one signature interaction (assembly flow, market signals entering,
  topology reorg, gate rejection, route failover, memory reuse). Experiment
  ledgers open per project. Persistent ASK THE SYSTEM + EXPLORE map.
- **Opening 15s:** black screen → thesis line → single TECH node pulsing →
  scroll cue → first scene assembles the machine.
- **Chapter navigation:** Explore map (persistent, jump to any node) +
  scene progress rail; story never traps (any state reachable in 1 click).
- **Mobile:** linear narrative, simplified graph (fewer nodes, no ambient),
  tap replaces hover, ledgers become accordions.
- **Technical complexity:** medium — SVG graph + CSS/DOM scenes, no WebGL.
- **Risk:** graph must not become noise; needs careful layout budget.
- **Why it fits:** literally encodes the thesis ("deeper layers") in the
  interface; reuses proven hero-simulator engineering (rAF + refs painting).
- **Score:** MEM 5 × CLA 4 × PROOF 5 × PERF 4 = 400.

## Concept B — THE FALSIFIABLE PORTFOLIO

- **Metaphor:** the page is a lab notebook. Every claim ships with a verdict
  stamp (PROVED / REJECTED / ABSTAINED / UNPROVEN). The visitor's primary
  act is opening ledgers; the visual spine is a generations timeline of
  experiments being accepted/rejected.
- **Interaction:** claim → tap → HYPOTHESIS/METHOD/OBSERVATION/VERDICT/NEXT.
  A "referee mode" toggle shows every claim colored by evidence strength.
- **Opening 15s:** a confident claim appears, then stamps itself REJECTED,
  then the thesis line lands.
- **Mobile:** native (cards/accordions).
- **Complexity:** low-medium. **Risk:** reads as a report; weak on the
  career-arc story; less cinematic.
- **Score:** MEM 4 × CLA 5 × PROOF 5 × PERF 5 = 500 on paper, but CLARITY
  of the *career narrative* drops (it proves experiments, not the arc):
  adjusted MEM 3 → 375.

## Concept C — DEPTH STRATA

- **Metaphor:** geological descent. The visitor descends through strata —
  each era is a deeper layer of how organizations/software work. A
  cross-section "core sample" rail stays visible on the side; at the bottom,
  the core sample compresses into the Quantiviq stack.
- **Interaction:** vertical descent with parallax strata; each stratum's
  artifacts are drilled "cores".
- **Opening 15s:** surface → drill begins → first stratum lights up.
- **Mobile:** strong (vertical is native).
- **Complexity:** medium (parallax, masks). **Risk:** geology metaphor is
  evocative but less *system-literal*; gates/loops/abstention — the soul —
  have no natural home; drifts toward decorative.
- **Score:** MEM 4 × CLA 3 × PROOF 3 × PERF 4 = 144.

---

## Decision

**A + B hybrid: THE CONVERGENCE, ledger-native.** Concept A's spine and
graph, with Concept B's verdict-stamp evidence system built in as a
first-class layer (the Experiment Ledger is mandatory in the brief anyway).
Concept C's "zoom out to reveal" is already Scene 10 of A.

Rationale: highest MEMORABILITY × PROOF without sacrificing performance
(no WebGL, SVG/CSS only — same engineering family as the shipped hero
simulator); the only concept where the interface itself demonstrates the
thesis (layers accumulating into an architecture). Ledger-native means the
falsifiability identity — the actual differentiator — is structural, not
decorative.
