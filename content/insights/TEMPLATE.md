# Quantiviq Insights — Article Authoring Contract

Every article is `content/insights/<id>-<slug>.md`. This contract is enforced by
`scripts/insights-validate.mjs` and an editorial review. Read it fully before writing.

## 1. Frontmatter (exact keys, same order)

```yaml
---
id: "01"                          # two digits, quoted
slug: ai-adoption-is-not-ai-transformation   # kebab-case, matches filename
title: AI Adoption Is Not AI Transformation  # exact assigned title
subtitle: >-                      # one sentence, 90-150 chars, the deck under the H1
  ...
excerpt: >-                       # 140-200 chars card blurb, standalone sentence(s)
  ...
pillar: transformation-strategy   # assigned pillar id
tags: [ai-transformation, operating-model]   # 3-5 lowercase kebab tags
author_id: quantiviq-research
published_at: "2026-10-24"        # launch batch date (do not change)
updated_at: "2026-10-24"
status: published
hero_image: /insights/heroes/01.svg   # exactly this pattern with your id
hero_alt: >-                      # descriptive alt text, 20-120 chars, describes the visual
  ...
hero_caption: >-                  # one-line caption explaining the visual concept
  ...
seo_title: >-                     # 15-62 chars, includes primary term, no clickbait
  ...
seo_description: >-               # 70-160 chars, states the article's concrete value
  ...
primary_term: ai adoption vs ai transformation   # the ONE search intent this owns
secondary_terms: [ai transformation strategy, enterprise ai adoption]
source_ids: [mck-2026-org, mck-soai-2026]   # ONLY ids that exist in sources.json
featured: false                   # true only for article 20
discussion_questions:             # exactly 3, executive-team questions, each <= 200 chars
  - "..."
related_article_ids: ["02", "05"] # assigned per article
---
```

## 2. Body structure (markdown, in this order)

1. **Answer-first opening** — 2-3 paragraphs, NO heading above them. Directly answer the
   title's question in the first two sentences. No throat-clearing, no "In today's
   rapidly evolving landscape". The reader must know the thesis by paragraph two.
2. `## Executive Summary` — 4-6 bullets, each a complete sentence a CEO could quote.
3. **4-6 analysis sections** — H2 with article-specific names (assigned in your spec).
   Use H3 subsections, markdown tables, and 1-2 inline SVG figures where they add real
   explanatory value. This is the original-synthesis core: frameworks, worked logic,
   numbers with context, trade-offs. Vary section rhythm; do not pad.
4. `## Key Takeaways` — 5-7 tight bullets (the distilled argument).
5. `## What Leaders Should Do Next` — numbered list of 4-6 concrete actions, each with
   an owner role and a timeframe in parentheses, e.g. *(VP Transformation, first 30 days)*.
6. `## References` — numbered list, one entry per source_id, in source_ids order:

```markdown
1. <a id="ref-mck-2026-org"></a>**McKinsey & Company** — *AI is changing work. Now it has to change the organization*, Oct 5, 2026. [mckinsey.com](https://www.mckinsey.com/capabilities/...) — organizational redesign argument; figures via secondary coverage where noted.
```

Entry format: number, anchor `<a id="ref-<source_id>"></a>`, **Publisher/Author**, italic
title, date, `[domain](source_url)`, one line on what it supports + any limitation.
Copy titles/URLs/dates EXACTLY from sources.json — never retype from memory.

## 3. Citations (how claims connect to references)

- After any sentence carrying an external fact or number, add a bracket link to the
  reference anchor: `...only about 6% of companies report significant financial gains[[1]](#ref-mck-soai-2026).`
- Cite the specific source, not a generic one. Every source in `source_ids` must be
  cited inline at least once.
- Quantitative claims always carry context in prose: year, who was surveyed/sample,
  and whether it is observational, experimental, or a forecast. Example:
  "In a 2023 field experiment with 758 consultants (Dell'Acqua et al., later published
  in Organization Science)..."
- If a figure comes via secondary coverage, say so: "(as reported by trade press
  covering the survey)". Never present a forecast as an observed result.
- Reasoning, frameworks, definitions, and illustrative arithmetic are YOURS — no
  citation needed, no invention of external authority.

## 4. Numbers and examples

- Real-world company examples: only with a cited public source. Otherwise use
  anonymized composites and label them: "Consider a mid-sized FMCG commercial team
  (an illustrative composite, not a specific company)..."
- Worked scenarios with invented numbers get ONE prominent label near first use:
  "(illustrative synthetic scenario — assumptions stated below)" and the assumptions
  listed explicitly.
- Arithmetic must be internally consistent — validators and reviewers recompute it.

## 5. Inline SVG figures (1-2 per article)

Raw HTML block inside the markdown:

```html
<figure>
  <svg viewBox="0 0 760 400" role="img" aria-label="<description>" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
    <!-- boxes: <rect ... rx="10" fill="#0d1420" stroke="#2a3a4c" stroke-width="2"/> -->
    <!-- labels: <text x y font-size="15" fill="#d7e0ea">...</text> -->
    <!-- arrows: <path d="M... L..." stroke="#8fa3b8" stroke-width="2" marker-end="url(#f1-arw)"/> -->
    <!-- include defs with a marker id unique to this figure, e.g. f1-arw -->
  </svg>
  <figcaption>Figure 1 — caption explaining what the diagram shows and why it matters.</figcaption>
</figure>
```

Palette (use exactly): ink `#d7e0ea`, muted `#8fa3b8`, line `#2a3a4c`, bg-panel `#0d1420`,
mint `#69deb9` (human/positive), blue `#80c9f8` (systems/agents), amber `#f5b968`
(decisions/attention), violet `#a694f7` (governance), coral `#f27e85` (risk/failure).
Rules: viewBox max 760x430; text >= 13px, never smaller; wrap long labels on two
<text> lines; every diagram must be readable standalone via the caption; NO third-party
chart reproduction — design your own.

## 6. Internal links (3-5 per article)

Link to other Insights articles with `/en/insights/<slug>` and, where genuinely
relevant, site pages: `/en/system`, `/en/method`, `/en/proof`, `/en/services`.
Use the exact slugs/titles provided in your spec. Link phrases should read naturally
("as the value ledger model argues", not "read our article about X").

## 7. Style rules

- Executive-first: the reader is a CEO/COO/CPO/CTO/transformation director. Technical
  concepts are fine; unexplained jargon is not. Define a term at first use.
- Authoritative, analytical, practical. No marketing fluff, no "AI will revolutionize
  everything", no filler adjectives, no rhetorical questions as section openers.
- Active voice. Short paragraphs (2-4 sentences). Confident but calibrated language:
  "evidence suggests", "in the firms we examined" is fine when true of the cited study.
- No first-person anecdotes, no invented client stories, no "we've seen" experiences
  that did not happen. "Quantiviq Research" voice = analysis, not memoir.
- Do not imply affiliation with or endorsement by McKinsey, BCG, Gartner, Deloitte, etc.
- Word count: 2200-3200 words (validator floor 1800, ceiling 4200). Depth over volume.
- Do not repeat generic paragraphs from other articles — each article owns its angle.
- `TODO`, `TBD`, `lorem`, placeholder text: validator fails the build on any of these.

## 8. Honest-date policy

published_at/updated_at stay at the launch values. Do not backdate.
