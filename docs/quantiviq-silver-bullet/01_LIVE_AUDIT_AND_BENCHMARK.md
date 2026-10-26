# 01 — Live Audit & Benchmark (Gate A)

**Audit date:** 2026-10-26 · **Auditor:** autonomous agent (silver-bullet mission)
**Live target:** https://quantiviq.xyz (production, nginx → next-server loopback :3000)
**Method:** real-browser Playwright crawl (`scripts/sb-crawl.mjs`, msedge channel, headless) +
HTTP probes. Raw data: `captures-sb/crawl-report.json`. Screenshots: `captures-sb/before/` (108 files).

## 1. Verified route inventory (live, from sitemap.xml + crawl)

| Route | Status | In sitemap | Notes |
|---|---|---|---|
| `/en`, `/fa` | 200 | ✓ | home + hero simulator (V5 flow intelligence) |
| `/en|fa/services|system|lab|method|proof|about|contact|privacy|mind` | 200 | ✓ | 9 routes × 2 locales |
| `/en|fa/insights` + 20 article slugs × 2 locales | 200 | ✓ | 20 EN + 20 FA articles |
| `/en|fa/insights/topics/{pillar}` (5) | 200 | ✓ | pillar hubs |
| `/journey /notes /open-source /work /resume /engineering /profile` | 200 | ✗ (legacy shared) | confirmed 200 at root; my initial /en-prefixed probes 404 — **crawl-list error, not a site defect** |
| `/api/lab/status`, `/api/lead`, `/api/public-mind/chat` | live | — | lab status OK; mind chat gateway deployed |

**Total crawled:** 33 locale routes, 0 broken images, 0 failed asset requests, 0 JS console errors on all sitemap routes.

## 2. Baseline issues found (real, measured)

| # | Issue | Evidence | Severity |
|---|---|---|---|
| A1 | Horizontal overflow **+74px at 1024px** on /en, /en/insights, /en/lab, /en/mind (EN only; FA clean) | `crawl-report.json` `overflow` field, scrollWidth−clientWidth per width | Medium — content clipped off-canvas at tablet width |
| A2 | Overflow at **320px**: /en/lab +51, /fa/lab +42, /en/mind +46, /fa/mind +36 | same | Medium |
| A3 | One insight article overflows **+96px at 390px** (`who-owns-ai-transformation`) — wide figure/SVG not scaled | same | Low-Medium |
| A4 | Reported "EN Insights image/wall collision" **did not reproduce** at 1440/1024/768/390/320 (programmatic bounding-box overlap probe found 0 collisions ≥24px) | `insightsCollisionProbe: []` | Resolved/not reproduced |
| A5 | Public Mind chat **intentionally disabled** in production (503 + bilingual notice) — Z.AI standard-endpoint balance missing (429 code 1113); UI, streaming, retrieval, budgets all deployed | prior reports + live 200 pages | Known blocker (owner billing action) |
| A6 | No books / OSS atlas / workflow atlas / explore routes exist yet — all NEW scope of this mission | sitemap | This mission |

## 3. Agent Mind (existing) — verified in code

- Gateway `src/app/api/public-mind/chat/route.ts` → loopback `127.0.0.1:8210` (SSE passthrough, validation, no secrets).
- Service `public-mind/service/mind_service.py`: stdlib Python + SQLite FTS5 retrieval over a sanitized **public** snapshot (639 records; site content + public GitHub only); GLM streaming with endpoint-adaptive thinking; budgets $0.50/day, $10/month, 6/session; kill switch; mock mode = deterministic retrieval-only answers.
- Knowledge builder `scripts/mind-build-knowledge.mjs`: ingests insights articles (EN+FA), principles, capabilities, projects, dict prose, identity, GitHub repos → `public-knowledge.sqlite` + manifest. Secret/PII scan before write.
- UI: floating widget site-wide + full `/en|fa/mind` pages (`MindFullPage`, `useMindChat`, `?q=` deep-link, starters, sources, RTL).
- **Conclusion: EXTEND, do not rebuild** (mission §5.1). Corpus gains new record types; service gains an optional scope filter behind the same contract.

## 4. Book-to-Skill / prior corpus — verified ABSENT

- Filesystem search (D:\, C:\Users\ma.asghari, depth 3): **no book-to-skill installation found**.
- Personal Brain (C:\Users\ma.asghari\.dsh\personal-brain\data\brain.sqlite3): 4,536 semantic facts; **0 book-synthesis facts** (1 incidental policy mention). The "58-book owner synthesis corpus" referenced by the mission is **not present on this machine** → status `blocked/not-found`.
- Consequence (per mission §6): all 10 books ship as **catalog-only** bibliographic records + owner-authored editorial briefs (provided in the mission text). No book full text is ingested; no `book_skills` records are generated; skill status explicitly "not generated — no authorized source text". Upstream tool verified by reference: https://github.com/virgiliojr94/book-to-skill (MIT tool license ≠ book-content rights).

## 5. External benchmark (8 sites)

Captured 2026-10-26 via `scripts/sb-benchmark.mjs` → `captures-sb/benchmark/` (desktop 1440 + mobile 390), report `captures-sb/benchmark-report.json`.

| Site | HTTP | Title captured | Screenshot |
|---|---|---|---|
| Palantir AIP | 200 | "Palantir Artificial Intelligence Platform" | palantir-aip-{desktop,mobile}.png |
| Linear | 200 | "Linear – The system for product development" | linear-*.png |
| Stripe | 200 | "Stripe | Financial Infrastructure…" | stripe-*.png |
| Notion AI | 200 | "Meet your AI team | Notion" | notion-ai-*.png |
| Vercel | 200 | "Agentic Infrastructure - Vercel" | vercel-*.png |
| McKinsey QuantumBlack | **403 (bot-blocked)** | — | none — recorded as blocked |
| Figma | 200 | "Figma: The collaborative canvas…" | figma-*.png |
| Anthropic | 200 | "Home | Anthropic" | anthropic-*.png |

Full adopt/reject analysis: see `BENCHMARK_MATRIX.md`.

## 6. Assumption status ledger (mission §1.5)

| Assumption | Status | Source |
|---|---|---|
| quantiviq.xyz live & serving | verified-live (HTTP 200, 2026-10-26) | crawl |
| 33-route inventory above | verified-live | sitemap + crawl |
| Simulator = V5 flow-intelligence (4 scenarios, camera, journey stepper, gate) | verified-code + verified-live | src/content/simulator.ts, OrgSimulator.tsx, V5 report, crawl shots |
| Mind deployed; chat disabled pending billing | verified-code + historical-report | code + 15_ACTIVATION_FINAL_REPORT.md |
| 58-book corpus exists | **blocked/not-found** | filesystem + Brain DB search |
| book-to-skill installed | **blocked/not-found** | filesystem search |
| Open Library covers available for all 10 ISBNs | to-verify (script pending) | §Gate C |
| McKinsey benchmark page content | blocked (403 bot-block; screenshot unavailable) | benchmark-report.json |
