# 02 — Commercial IA & Content Bridges

## IA (canonical namespace: /{locale}/solutions — no competing /marketplace)

- /en/solutions, /fa/solutions — catalog: search + 6 category filters + 40 cards (indexable).
- /{locale}/solutions/{slug} — detail x40 (flagship indexable; scoping noindex until depth).
- /{locale}/solutions/{slug}/request — guest request form (noindex, nofollow).
- /{locale}/solutions/find — deterministic 3-question finder (noindex, follow).
- /admin/requests — owner console (noindex; API token-gated).

## Navigation

- Header: new first-class **Solutions** group (All solutions / Find your solution) before Approach; all existing groups retained; mobile sheet inherits automatically.
- Footer: Solutions link beside Services.
- Homepage: Featured Solutions carousel (8 flagships) after the preview section + links to catalog and finder.

## Relation registry (single source: solution.articles in src/content/solutions)

| Article | Solutions | Why |
|---|---|---|
| 07 real cost of enterprise AI agents | private-knowledge-ai, workflow-orchestration | cost diligence → deployment engagement |
| 08 prioritizing high-value AI missions | finder link (no card) | prioritization → guided finder |
| 12 90-day roadmap | business-continuity | roadmap → continuity as scoped first step |
| 13 human-in/on-the-loop | quote-desk, invoice-extraction, complaint-resolution | human-approval emphasis |
| 17 FMCG commercial ops | quote-desk, omnichannel-sales, pricing-intelligence, sales-forecasting | commercial ops cluster |
| 18 supply-chain decision intel | inventory-sync-monitor, supplier-intelligence, order-exception-desk | supply chain cluster |
| 19 recovering revenue | financial-reconciliation, pricing-intelligence, commission-audit | revenue cluster |

Bridge renders ONE panel below the article (registry-driven). No banners inside body text.
