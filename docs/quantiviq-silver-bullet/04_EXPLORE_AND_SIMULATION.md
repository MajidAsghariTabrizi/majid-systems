# 04 — EXPLORE EXPERIENCE & ORGANIZATIONAL SIMULATION
_The "Living Organization" interactive layer (mission §3): /{en,fa}/explore._

## Journey structure (top → bottom)

1. **Role entry** — four persona chips (CEO / Product Lead / CTO / Practitioner).
   Each sets context copy and highlights the signals that persona owns. Roles are
   perspectives, not gates: nothing is locked.
2. **Signal choice** — the four simulator scenarios (customer issue, product
   signal, production incident, revenue drop) as chips; choosing one embeds the
   SAME OrgSimulator the home page uses (single engine: src/lib/sim/*).
3. **The stack behind it** — five OSS source drawers (Onyx, OpenMetadata, WrenAI,
   Graphiti, HolmesGPT) with license, inputs/outputs, guard, when-NOT-to-use and
   an explicit "EXAMPLE STATUS" chip: research references, not deployed services.
4. **Authority-gate lab** — four business signals × three decisions
   (approve / reject / ask-for-evidence). Each combination shows the organizational
   consequence text + a compact timeline log. Fully client-side, deterministic,
   labeled "interactive synthetic demonstration" — no fabricated client data.
5. **Transcript** — a static `<details>` with the before/after hops (OLD_HOPS 8
   hops / 101h / 17 handoffs vs NEW_STEPS 16 steps / 12 min conceptual) so the
   claim is inspectable without running anything.
6. **Exit CTAs** — books library, workflow atlas, mind (with prefilled question).

## Honest-framing rules (on-page, not just docs)

- Simulator numbers are the existing conceptual model (101h→12min), unchanged.
- The gate lab outcomes are illustrative synthetic texts; the page says so.
- OSS drawers state boundaries (e.g. HolmesGPT Operator-Mode write caveat,
  WrenAI 2026 consolidation) right where a reader would act on them.

## Verification (after-report.json)

- Role × signal selection works (CTO + PRODUCTION INCIDENT → correct sim embed)
- Gate outcome changes with decision (approve ≠ reject ≠ evidence), log renders
- Transcript and source drawers open; all three exit CTAs present
- 0 overflow 320→1440, 0 console errors, both locales, RTL on FA
