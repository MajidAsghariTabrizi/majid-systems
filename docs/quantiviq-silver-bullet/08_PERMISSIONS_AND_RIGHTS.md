# 08 — PERMISSIONS & RIGHTS MATRIX
_Who may touch what. Honest defaults; nothing was ingested or deployed without an explicit basis._

## Book corpus rights

| Object | Right holder | What Quantiviq does | Basis |
|---|---|---|---|
| Book texts (all 10) | Publishers/authors | **NOT ingested.** No chapter/page text exists in repo, corpus, or model context | No license found. book-to-skill tool not installed on this machine (verified: filesystem + Personal Brain search, 0 book syntheses) |
| Bibliographic metadata (title/author/ISBN/publisher/year) | Facts, not copyrightable | Displayed, bilingual editorial briefs are original | Standard bibliographic practice; publisher pages cited per edition |
| Cover images | Open Library / publishers | **Hotlinked with credit**, never copied/stored | Open Library Covers API public terms; covers.openlibrary.org/b/isbn/… + credit link under each cover |
| Editorial briefs/takeaways | Majid Asghari (site owner) | Original 2-3 sentence summaries, owner-authored | Owner content |
| Skill modules ("book-to-skill") | — | **all 10 = not-generated**; UI says so explicitly | Requires licensed ingestion pipeline + owner decision (books/source_manifest.yaml) |

## Tooling license vs content license

The book-to-skill generator referenced by the mission is MIT-licensed **as a tool**;
that grants zero rights over the books it would process. The manifest
(`books/source_manifest.yaml`) records per-book: dedup=0 bytes, tool_license=MIT,
content_rights=publisher, status=catalog-only. Any future ingestion requires the
owner to (a) hold or obtain rights, (b) re-run scripts/mind-build-knowledge.mjs,
(c) flip sourceStatus — never the other way around.

## Open-source stack layers

| Layer | License noted | Boundary facts recorded |
|---|---|---|
| Onyx | Apache-2.0 (CE) | Enterprise Edition features are commercial; CE ≠ EE |
| OpenMetadata | Apache-2.0 | — |
| WrenAI | Apache-2.0 | May 2026: Wren Engine consolidated into main repo; legacy/v1 repos unmaintained, no new security fixes |
| Graphiti (Zep) | Apache-2.0 | — |
| HolmesGPT | Apache-2.0 | CNCF Sandbox (sandbox maturity ≠ graduated); not all features are read-only — Operator Mode can write back (guard stated on-page) |

All five are **research/recommendation references, not deployed Quantiviq services** —
stated on the stack page, inside every Mind record, and test-asserted.

## Mind / corpus / deployment

| Action | Authority |
|---|---|
| public-mind corpus rebuild (public sources only) | Agent (done; script committed) |
| Private Brain / hub mutation | **Forbidden to the agent** — untouched this mission |
| Z.AI chat activation (billing) | **Owner only** — chat stays disabled in prod |
| Production deploy to VPS 171.22.24.45 | **Owner approval required** (09) — NOT performed |

## Organizational flows & simulator

All 12 flows are owner-authored **generic templates** (publicSafe=true, no client
names/data). The simulator and explore interactions are labeled "interactive
synthetic demonstration"; numbers (101h→12min etc.) come from the existing
sim model, not client measurements.
