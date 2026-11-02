# 05 — Analytics & Distribution

## Commercial funnel (Umami allowlist v2 — verified firing in production 2026-11-02)
solutions_view, solution_view, solution_finder_start/complete, solution_request_start/success/failure, solution_related_insight_click (v1 events untouched).
Verified live today: solution_finder_start=1, solution_finder_complete=1, solution_request_start=1, solution_request_success=1 (labeled E2E).
Known caveat: early-mount events (solutions_view) can drop if the analytics script has not loaded during hydration — conversion events fire on user action (post-load) and all recorded. P2 backlog: queue-until-loaded.

## Metric ladder (never conflate)
card view < detail view < request start < persisted lead < contacted < proposal < won. Owner console = persisted-lead truth; Umami = intent signals.

## Distribution (owner-authorized only)
1. LinkedIn: QuoteDesk + Cash Recovery posts (most concrete pains), utm_source=linkedin, utm_medium=social, utm_campaign=qvq-solutions-nov26, utm_content=slug.
2. Direct B2B outreach to 5–10 distributors/manufacturers using flagship pages as CTA — after owner approves messaging.
3. Indexing remains owner-gated (GSC/Bing from growth mission) — distribution, not SEO, is the near-term demand engine.
