# VISUAL_QA_REPORT

_2026-10-26 · honesty note first: the deployed model (glm-5.3, main agent AND subagent — tested) declares no image input, so NO vision-capable model was available in this environment. Nothing below is claimed as human/vision visual approval. All visual verification is PROGRAMMATIC (browser DOM measurement, pixel capture, automated interaction)._

## Screenshots (committed evidence)

- Baseline: captures-sb/before/ (108 PNGs, 33 routes) + crawl-report.json
- Benchmark: captures-sb/benchmark/ (7/8 external sites; McKinsey 403 bot-blocked)
- Release QA: captures-sb/after/ (57 PNGs; 14 routes × {320, 390, 768, 1440} EN+FA + interaction shots) — refreshed AFTER the a11y/overflow fixes
- Production: route/functional sweep re-run against https://quantiviq.xyz (captures-sb/prod-final-report.json)

## Responsive layout (scrollWidth deltas, per width)

| Page | 320 | 390 | 768 | 1440 |
|---|---|---|---|---|
| /en/explore · /fa/explore | 0 | 0 | 0 | 0 |
| /en+fa/insights/books (+10 slugs) | 0 | 0 | 0 | 0 |
| /en+fa/insights/enterprise-ai-stack | 0 | 0 | 0 | 0 |
| /en+fa/mind/flows | 0 | 0 | 0 | 0 |
| /en/mind (pre-existing A2 defect) | **0 (FIXED this release)** | 0 | 0 | 0 |
| /en, /fa | 0 | 0 | 0 | 0 |

A2 root cause fixed in globals.css: flex-item min-content (mind-full-body container) + 280px starter grid floor.

## Accessibility — automated (axe-core 4.10 via Playwright, 9 routes EN+FA)

**Final: 0 critical / 0 serious violations across all 9 routes.** Fixed this release:
1. duplicate/nested `<main>` landmarks on all 5 new pages (layout owns main)
2. color contrast <4.5:1: 24 --fg-subtle uses in new CSS, lang-tab toggle, mind starters/disclosure(-detail), skill-state chip → raised to --fg-muted
3. heading order h1→h3 on books library → added bilingual h2 grid label
4. nested-interactive (simulator svg role=img containing focusable nodes → role=group)
5. link-in-text-block → source links underlined

Remaining moderate (accepted): explore-page complementary-landmark placement. Legacy pages retain their pre-existing design-language contrast choices (unchanged by this release except where flagged above).

## Lighthouse (local production build, msedge headless)

| Route | desktop P/A/BP/SEO | mobile P/A/BP/SEO |
|---|---|---|
| /en | 100/96/100/100 | 88/96/100/100 |
| /en/explore | 100/96/100/100 | 82/96/100/100 |
| /en/insights/books | 99/94/100/100 | 89/94/100/100 |
| /en/mind/flows | 100/96/100/100 | 80/96/100/100 |

Mobile perf 80–89 on the throttled preset (image/animation-bearing static pages); no layout-shift failures, SEO/BP perfect.

## Functional UI probes (browser-driven, production)

books filter 10→2 (Engineering) · stack tab switch (Onyx→HolmesGPT) · flows expand + accessible list mode (12 items) · explore gate outcomes change with decision (approve/reject/evidence) + timeline log · transcript + source drawers open · mind scope chips render (6) · ?q= prefill works · covers 7/7 load on prod, 3 fallback cards render · FA pages dir=rtl verified per route.
