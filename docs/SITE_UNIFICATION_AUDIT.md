# SITE_UNIFICATION_AUDIT.md — make Quantiviq feel like one system

## A. What the audit found

### Homepage: 13 blocks competing to explain one thesis
hero · simulator · latency-definition · signature · 01-latency · 02-OS ·
03-brain · 04-learning · 05-before/after · 06-restructuring · founder ·
07-proof · 08-method · 09-use-cases · final CTA.

### Concept duplication (violations of "introduce from zero once")
| Concept | Explained from zero in | Canonical home (after) |
|---|---|---|
| Thesis "bottleneck is the company" | HERO P1, latency-def block, SIGNATURE close, LATENCY_INTRO, OS_INTRO, RESTRUCTURING body | HERO (once) + #problem intro (once) |
| Signature question ("founded today…same way?") | SIGNATURE section **and** FINAL_CTA — verbatim twice | FINAL_CTA only |
| Company latency | latency-def section, 01-latency forms, before/after table (7 rows map 1:1) | #problem five forms |
| AI-native org / OS | 02-OS, RESTRUCTURING, BEFORE_AFTER columns | #operating-model OS diagram |
| Company Brain as product | 03-brain (standalone demo), loop compare, before/after "knowledge" row | Component of #learning system flow |
| Learning / experience compounds | 04-learning loop+compare, before/after "improvement" row, restructuring items | #learning (one flow + state view) |
| Before/after org | 05-table, 06-restructuring, simulator (interactive) | Simulator — it *shows* it; table cut |
| Biography | founder 3 paras, /about page, /journey, /resume | /journey (story) + /profile (evidence); home keeps one bridge line |

### Information architecture
- ROOT_NAV exposed internal concepts (Operating Model, Company Brain) as
  top-level. → intentions: **System · Method · Proof · Journey · About**.
- Use-cases section doesn't advance the argument → cut; one line in Method.
- #company-brain anchor disappears (Brain lives inside #learning).

## B. Implemented changes

1. **Homepage restructured to the six-beat narrative** —
   01 HERO+SIMULATION (thesis felt) → 02 PROBLEM (latency, five forms,
   tightened) → 03 SYSTEM (OS diagram — the canonical architecture) →
   04 HOW THE SYSTEM LEARNS (SIGNAL → RETRIEVE STATE → DECIDE → AUTHORITY
   CHECK → ACT → MEASURE → LEARN; BrainDemo is the RETRIEVE-STATE view,
   not a second product) → 05 PROOF (primitives + honesty + one-line
   founder bridge into Journey/Profile) → 06 METHOD+CTA
   (MAP→REDESIGN→BUILD→GOVERN→MEASURE→LEARN→EXPAND, one CTA) + FINAL
   (signature question — its only home).
2. **Removed sections:** latency-definition, signature, before/after table,
   restructuring, use-cases, 3-paragraph founder. Homepage copy cut ≈40%.
3. **Nav:** System / Method / Proof / Journey / About + REBUILD A FUNCTION.
4. **Shared visual grammar:** the signal-dot eyebrow (`sig-dot` mint pulse)
   on every home section header and journey kicker; one section rhythm
   (`--sec-pad`); OS diagram is the only architecture drawing on Home —
   Journey's convergence references it as outcome, not re-explains it.
5. **Motion grammar:** animation only for flow/state/propagation (simulator
   signal, OS pulses, learning-flow stepping, brain reveal) — already true;
   removed the old/new compare columns (static, repeated the table we cut).

## C. Page responsibilities (unchanged routes, sharpened jobs)
- **/** thesis + system. **/journey** why Majid is credible (biography
  through systems; already "what was learned" framing — untouched).
- **/profile** what he built (evidence). **/work,/engineering,/open-source**
  depth under profile. **/about** short. **/resume** print escape hatch.

## D. Verification
- content tests updated (nav, system flow, method loop, single-use of the
  signature question, buzzword ban incl. new surfaces).
- Playwright desktop+mobile pass on the rebuilt home; all anchors resolve;
  journey/profile regression green; deployed and live-verified.
