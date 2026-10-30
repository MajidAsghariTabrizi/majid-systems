# 14 — Search Visibility Evaluation Plan

- Baseline captured 2026-10-30 (`scripts/visibility-benchmark.mjs` → 16_VISIBILITY_BASELINE.json): sitemap 101; canonical 103/104; hreflang 82/104 (correct — remainder are EN-only legacy + unlisted); AI-crawler grants 4/4; llms.txt coverage 60 urls.
- Bing `site:` SERP scrape returned 0 from this vantage (bot-walled or pending indexing) → **INDEXING PENDING until webmaster evidence** (GSC/Bing portals — owner gated, see 09).
- Measurement cadence after GSC: coverage count, per-article impressions/CTR, brand vs non-brand queries — all from GSC API (owner-gated). The benchmark script is the reproducible non-authenticated layer.
