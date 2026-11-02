# C — AI Search Visibility Benchmark (QVQ-GROWTH-2026-11-02)

**Verdict: FAIL (measured) — 0/23 queries show Quantiviq. Root causes identified; primary is owner-action-fixable.**

Method: 23 declared prompts (9 topical EN, 4 buyer-intender EN, 2 article-title EN, 4 FA, 1 regional, 1 brand, 1 site:) through this agent's web-search backend (Google-index-fed), 2026-11-02T07:45-08:05Z, verbatim log in `C_AI_SEARCH_BENCHMARK_2026-11-02.json`. Single provider, one sample per query; AI answers vary run-to-run — baseline, not census. ChatGPT/Perplexity/Gemini panels NOT accessed (no authorized accounts) — those cells are not measured, per the no-invention rule.

## Findings
- **0/23 visible**, including exact brand query `quantiviq` (returned pharma lookalikes) and the operator-name query.
- Positive entity trace: external profile `himalayas.app/@majidasghari` surfaced — one independent web entity exists to consolidate.
- Observed competitor domains (per-query evidence in JSON): ibm.com, gartner.com, ey.com, accenture.com, griddynamics.com, lyzr.ai, neo4j.com, learn.microsoft.com, arxiv/ieee. Results skew to enterprise brands, dev-tool vendors, primary research.

## Root-cause hypotheses (testable)
1. **[Verified primary] Not indexed** — no GSC/Bing verification; site 3 days old; zero known backlinks; crawl != index (66 Googlebot reqs/23h, 0 indexed). Fix: owner verification (A/B) + time.
2. **[Verified secondary] Zero external citations** — no independent references found. Fix: distribution (D).
3. **[Plausible] AI-answer form mismatch** — competitors surface primary research; strengthen E-E-A-T (author entity, sources.json citations).

## Re-measurement protocol
Monthly re-run of this exact 23-prompt panel; add authorized ChatGPT/Perplexity panels per the prior mission's doc-15 protocol. Milestones: first indexed URL (GSC) -> brand-query appearance -> first topical citation.
