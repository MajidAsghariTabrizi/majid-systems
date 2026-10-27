# KNOWLEDGE_COVERAGE_AND_PROVENANCE

_The Executive Dialogue answers ONLY from the authorized Public Mind corpus (715 records). This document maps executive question domains → record types → provenance, and states the honest gaps._

## Corpus inventory (what grounds the experience)

| Domain (mission §6) | Record types | Count | Provenance |
|---|---|---|---|
| Product Leadership | insight chunks (marketplace/commerce articles), identity, principle | 600 insight chunks total across 20 bilingual articles + 10 principles | quantiviq.xyz/en/insights articles (owner-published) |
| Technology & Systems | project records ×4 (Phoenix, Smart Trader, Free Best Router, Universal Engineering Agent), repo records ×10 | 4 + 10 | /work pages + github.com/MajidAsghariTabrizi (public repos) |
| Applied AI | concepts ×22, insight articles (RAG, routing, context engineering, evaluation), architecture ×2 | 22 + article chunks | quantiviq.xyz/en/insights + /en/insights/enterprise-ai-stack |
| Organizational Transformation | org_flow ×24 (12 flows EN+FA), framework ×2, capability ×4, evidence ×4 | 24+ | /en/mind/flows + method/system pages |
| Verified Professional Identity | identity ×7 (identity-core, about, leadership-contact EN/FA) | 7 | /about, /profile, contact pages |
| Books (context only) | book ×20 — CATALOG-ONLY records (title/thesis/why-it-matters). Full text never ingested; the service prompt forbids presenting them as full-text knowledge | 20 | /en/insights/books |

## Provenance rules enforced mechanically

1. Every cited URL must match ALLOWED_URL_RE (quantiviq.xyz | github.com/MajidAsghariTabrizi) — sanitize_output strips anything else.
2. Evidence classes are carried end-to-end (VERIFIED_FACT / PUBLISHED_VIEWPOINT / DEMONSTRATION / OWNER_ATTESTED labels visible in the evidence drawer).
3. The corpus builder's sanitizer (secret scan, allow-listed emails) ran at build; DB is opened read-only by the service.
4. No Personal Brain or private store is reachable from the service — verified by architecture (public-knowledge.sqlite is the only DB the service opens).

## Known coverage gaps (stated on-record, not hidden)

- **Employer-internal work**: deliberately absent (confidentiality). Career narrative is limited to what the owner published on /about, /profile, /journey. The AI says so when asked.
- **Client outcomes**: no client names or NDA-bound results exist in the corpus; questions probing them are answered as "not published."
- **Marketplace product career specifics**: covered at the level the owner published (operator role framing, product-thinking articles) — not with internal metrics, roadmaps or team data.
- **Aspirations vs shipped**: the four project records carry explicit status (Phoenix retired with public negative result; Smart Trader decision-intelligence system; Free Best Router live OSS; UEA reference implementation) and the executive prompt requires DOCUMENTED vs INTERPRETATION separation.

## Verification of this document

- Corpus counts: sqlite query 2026-10-26 (see EXECUTIVE_DIALOGUE_ARCHITECTURE.md).
- The 105-question real-model eval (EXECUTIVE_QA_RESULTS.md) tests each domain above plus privacy-boundary probes; groundedness failures are listed per category.
