# BENCHMARK_MATRIX — comparative patterns (Gate A)

Captured 2026-10-26, real browser, desktop 1440×900 + mobile 390×844 (`captures-sb/benchmark/`).
These are **comparative patterns, not evidence of Quantiviq defects**. McKinsey QuantumBlack
returned 403 (bot-blocked) — patterns for that row are from prior mission notes, marked as such.

| Site | Distinct mechanism (observed) | Borrow for Quantiviq | Explicitly reject | Shot |
|---|---|---|---|---|
| Palantir AIP | Decisions bound to operational objects; human authorization as a first-class UI state; workflow trace screenshots | Signature journey: signal → context → proposal → **human gate** → action → evidence; make authority visible in the simulator | Real-time client autonomy claims; heavy 3D | palantir-aip-desktop.png |
| Linear | Quiet precision; stage-organized IA; inspectable product UI; consistent component craft | Crisp hero, staged sections, deliberate transitions, restrained motion | Internal-tool density for all visitors | linear-desktop.png |
| Stripe | Direct economic framing per audience; primary vs secondary CTA hierarchy | Say *what changes for the business*, not AI vocabulary; one primary CTA per screen | Generic payment-page aesthetics; tile sprawl | stripe-desktop.png |
| Notion AI | Capture→Find→Automate narrative; cited answers; scope selection | Mind answers with **source chips + scope selector**; receipts | "Magic AI" with hidden provenance | notion-ai-desktop.png |
| Vercel | Strong information hierarchy; builder credibility; clear dev paths | Separate Explore / Proof / Insights / Contact; minimal nav | Mega-menu sprawl | vercel-desktop.png |
| McKinsey QuantumBlack *(403 — prior notes only)* | CEO-grade transformation language; people+AI framing | Clean leadership framing, modest evidence-first claims | Pretending to be a global consultancy; invented impact | (blocked) |
| Figma | Canvas/maker interaction; interactive demos | Focused interaction explorer with optional deep-dive | Full canvas editor on a content site | figma-desktop.png |
| Anthropic | Editorial calm; explicit safety stance; limitations stated plainly | Explain limitation/authority/uncertainty without clutter; calm typography | Policy-copy-dominant hero | anthropic-desktop.png |

## Scoring (1–5, observed evidence, 2026-10-26)

| Dimension | Palantir | Linear | Stripe | Notion | Vercel | McKinsey* | Figma | Anthropic | **Quantiviq (current)** |
|---|---|---|---|---|---|---|---|---|---|
| First-screen clarity of value | 4 | 5 | 5 | 4 | 4 | n/a* | 4 | 4 | **3** (dense hero, many CTAs) |
| Interactive proof of product | 5 | 4 | 3 | 3 | 4 | n/a* | 5 | 2 | **4** (real simulator, weaker source-drawer story) |
| Provenance/citation craft | 4 | 2 | 2 | 5 | 3 | n/a* | 2 | 4 | **3** (mind cites; site content citations partial) |
| Bilingual/RTL quality | 1 | 1 | 2 | 2 | 1 | n/a* | 2 | 1 | **5** (full FA parity incl. simulator) |
| Mobile readability | 4 | 5 | 5 | 4 | 4 | n/a* | 4 | 5 | **3** (overflow at 320 on lab/mind — issue A2) |

*McKinsey not scored: 403 blocked, no live observation. Quantiviq scored from the 2026-10-26 crawl only.

## Three art directions considered

1. **"Observatory" (CHOSEN — mission §4 Quiet Intelligence):** editorial dark-ink canvas (`#0a0b0d` existing ground, close to mission's `#0C1115`), jade-teal signal accent reserved for interactive states, warm amber ONLY at human-authority moments, Estedad/Inter type pairing already licensed (OFL 1.1) and shipped. Chosen for: continuity with the live V5 craft, zero new font licensing risk, and the mission's own palette mapping within ~1–2 shades of existing tokens.
2. **"Light editorial" reading surface:** `#F4F3ED` light Insights reading mode. Rejected for now: a global dual-theme doubles QA surface (contrast + RTL) across 20 articles; mission allows dark-only with light surface optional. Logged as future option.
3. **"Instrument panel"** (high-density telemetry look). Rejected: contradicts nontechnical-first comprehension goal (mission success condition) and pushes internal-tool density onto visitors (Linear "reject" row).
