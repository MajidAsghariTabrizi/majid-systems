# EXECUTIVE_DIALOGUE_ARCHITECTURE

_Audit-based reuse map for the unlisted Executive Dialogue experience at /meet-majid. Written before implementation (2026-10-26); verified against the deployed service, gateway and corpus._

## What exists and is REUSED unchanged

| Component | Location | Role here |
|---|---|---|
| Public Mind service | public-mind/service/mind_service.py on the VPS (systemd public-mind, 127.0.0.1:8210) | THE single intelligence: retrieval, generation, budgets, limits, SSE. Not forked, not duplicated. |
| Same-origin gateway | src/app/api/public-mind/chat/route.ts | The ONLY public entry. Adds persona pass-through (validated), keeps SSE passthrough, no secrets. |
| Knowledge corpus | public-mind/build/public-knowledge.sqlite — 715 records: 600 insight chunks (20 articles), 24 org_flows, 22 concepts, 20 books (catalog-only), 10 repos, 10 principles, 7 identity, 4 projects (Phoenix, Smart Trader, Free Best Router, Universal Engineering Agent), 4 leadership, 4 evidence, 4 capability, 2 offering/framework/architecture | Sole grounding evidence. Executive answers cite exactly these records. |
| Retrieval | retrieve(): FTS5, 3 query variants merged, locale soft-boost, insight diversity cap, scope type filter | Reused; executive persona requests top_k 7 (vs 5) — same function. |
| Streaming protocol | SSE events: sources → delta{text} → done{status, usage} | Reused verbatim by the new surface. |
| Safety rails | URL allowlist sanitize_output, evidence-as-data injection guard, budget + session limits + killswitch, read-only DB, loopback bind | Reused; executive persona inherits all. |
| useMindChat patterns | src/components/mind/useMindChat.ts | Behavioral contract copied into a new executive hook (separate state, persona field, cancel via AbortController, error-not-in-history). |

## Capability gaps found → minimal extensions (backward compatible)

1. **Persona.** The service had one system prompt tuned for the public mind panel. Executive Dialogue needs a different voice/structure (executive judgment first; documented vs hypothetical separation; challenge assumptions; deeper strategy scaffolding; longer budget for complex questions). → New optional request field persona: "default" | "executive". Absent field = "default" = byte-identical existing behavior for every existing client.
2. **Depth of retrieval for work questions.** top_k 5 is tuned for short panel answers. → persona executive retrieves 7 records. Same retrieve() function.
3. **Session limit.** 6 questions/hour fits the public panel; an executive inspection conversation needs more turns. → persona executive raises the per-session-hour limit to 24 (still budget-capped). Default persona unchanged.
4. **Frontend isolation.** No route existed outside the two public shells. → New route group (exec) with its own layout: no Header/Footer/QuantiviqMind, own fonts/stylesheet, noindex metadata, X-Robots-Tag header, absent from sitemap and every public navigation list.

## What is deliberately NOT built

- No second service, no second database, no fork of mind_service.py, no separate model key.
- No new auth tier: the route is UNLISTED, not private. Anyone with the link can use it; it carries no confidential material (all evidence is already-published site content). Documented on the page itself.
- No multi-agent orchestration, no vector DB, no reranker service — the FTS5 corpus is 715 records; measured retrieval (44/44 + 8/8 real-model evals) already grounds these volumes.

## Request contract (v2, additive)

POST /api/public-mind/chat { session, locale, scope?, persona?: "default"|"executive", messages } → SSE as today. persona invalid/absent → "default".

## Isolation & privacy mechanics

- Route: src/app/(exec)/meet-majid — outside [locale] and (shared) shells; middleware pass-through verified (no locale redirect for non-legacy top-level paths).
- metadata: robots { index: false, follow: false, archive: false }, plus X-Robots-Tag: noindex, nofollow, noarchive response header.
- Not linked from any public page, nav, footer, or sitemap; excluded from site search corpus.
- Page-level disclosure: "unlisted, not private".
- Sessions: client-side sessionStorage id, server-side usage counters only (no conversation persistence server-side).
