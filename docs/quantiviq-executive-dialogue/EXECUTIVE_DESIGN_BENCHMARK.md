# EXECUTIVE_DESIGN_BENCHMARK

## Reference matrix (studied before implementation)

| Reference | What was taken | What was rejected |
|---|---|---|
| Linear | Restraint, one accent, 8pt rhythm, focus states, near-invisible chrome | Its cold blue/gray identity and app-shell density |
| Perplexity | Grounded answers with inline citation chips; related-question follow-ups; source list beside the answer | Its consumer search framing; logo-forward branding |
| Notion AI | Readable long-form organization: short paragraphs, bolded judgments, clear sectioning | Card grids; playful illustrations |
| Stripe | Executive information hierarchy: confident headline scale, generous whitespace, precise typography | Gradient hero marketing; pricing-page patterns |
| High-end editorial portfolios (Monocle/FT-style) | Ivory paper, ink text, hairline rules, serif display + humanist sans, muted brass/green accents, asymmetry | Anything neon, glassmorphic, glowing, futuristic |

## Three directions considered

**A. "Boardroom Ivory" (editorial print)**
Ivory paper (#f7f4ec), deep ink (#1d1a16), forest green accent (#1f5c45), brass hairlines (#a8894f). Serif display (Playfair/Lora) for headlines, humanist sans (Public Sans/Inter) for UI. One column, generous margins, citation chips as footnotes. Subtle fade/rise only.
+ Most distinct from the main site; reads "senior publication". − Serif-heavy Persian needs Vazirmatn pairing discipline.

**B. "Quiet Console" (warm dark tool)**
Warm charcoal canvas, ivory text, jade accent, mono details — a "thinking instrument" look.
+ Feels like a professional tool. − Close to the existing Quantiviq dark palette the mission explicitly differentiates from; dark long-form reading is more fatiguing for long answers.

**C. "Paper Ledger" (split canvas)**
Ivory canvas with a fixed right-hand "evidence ledger" column styled like a legal margin: numbered sources, brass index tabs.
+ Evidence-first metaphor is memorable. − On mobile the ledger collapses anyway; the split fights the conversation on <1024px.

## Selection (explicit criteria, not taste)

| Criterion (weight) | A | B | C |
|---|---|---|---|
| Differentiation from main site (25%) | 5 | 2 | 4 |
| Executive credibility/maturity (25%) | 5 | 3 | 4 |
| Long-answer readability (20%) | 5 | 3 | 4 |
| EN+FA typeset quality incl. RTL (15%) | 4 | 4 | 4 |
| Mobile simplicity (15%) | 4 | 4 | 2 |
| **Weighted** | **4.7** | **3.1** | **3.7** |

**Selected: A — Boardroom Ivory**, borrowing C's evidence-as-footnote idea (sources render as a collapsible evidence drawer on mobile, a margin column on ≥1280px). Animation: 160ms ease fade/rise on message entry only; no parallax, no glow, no gradients.

Fonts: Vazirmatn (Persian-first, excellent Latin) + optional serif display via system Georgia/Iowan for EN headlines — self-hosted Vazirmatn variable (already used for FA on main site? verified: main site uses Inter+JetBrains; Vazirmatn must be added under (exec) only).
