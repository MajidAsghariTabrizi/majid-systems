# 06 — IMPLEMENTATION CHANGELOG & ENGINEERING NOTES
_Silver Bullet execution · branch silver-bullet · all changes additive; existing functionality preserved._

## New routes (EN/FA, SSG)

| Route | What | Component |
|---|---|---|
| /[locale]/explore | Living Organization experience: role × signal entry, embedded simulator, 5 OSS source drawers, authority-gate lab (4 signals × approve/reject/evidence), transcript, exit CTAs | src/components/explore/ExploreExperience.tsx |
| /[locale]/insights/books | 10-edition library, domain filter, status per book | src/components/books/{BookCover,BookCard,BookLibrary}.tsx |
| /[locale]/insights/books/[slug] ×10 | Edition page: facts, brief, takeaway, skill-status panel, 3 ask-the-mind questions, related flow/repositories/concepts | same + page.tsx |
| /[locale]/insights/enterprise-ai-stack | 5-layer stack atlas (static route wins over [slug]), layer panels, combined 12-step story, comparison table | src/components/stack/StackAtlas.tsx |
| /[locale]/mind/flows | 12-flow atlas (card + accessible list mode), full contract dl, 11 mindsets grid | src/components/flows/FlowAtlas.tsx |

Static-route precedence verified at build: /insights/books and /insights/enterprise-ai-stack render their own pages; the insights [slug] param list is article-driven and never emits these slugs.

## Data layer (git-versioned, single source of truth)

- content/knowledge/books.json (10 editions + coverPolicy), oss.json (5 layers + combinedStory), flows.json (12 contracts ×17 fields ×2 languages), concepts.json (11 mindsets), sources.json (ledger), cover-receipts.json (verification receipts).
- src/content/knowledge/index.ts — client-safe loader: **static JSON imports** (no node:fs), exports BOOKS/BOOK_BY_SLUG/coverUrl/coverCreditUrl/COVER_VERIFIED/OSS/FLOWS/FLOW_CONTRACT_FIELDS/CONCEPTS/KNOWLEDGE_SOURCES/bi()/askMindLink(). The mind build script reads the same files (one source of truth).
- i18n: nav.explore + explore/booksPage/stackPage/flowsPage sections added to BOTH en.ts and fa.ts (parity test-asserted by existing suite).

## Mind integration

- scripts/mind-build-knowledge.mjs §6: ingests books/repos/org_flows/concepts (76 records; total corpus 715) with aliases for cross-lingual retrieval; book records embed the catalog-only status line so the model cannot imply chapter-level knowledge.
- public-mind/service/mind_service.py: SCOPE_TYPES + retrieve(..., types=) + scope parsing (absent = all — backward compatible).
- src/app/api/public-mind/chat/route.ts: scope validation + passthrough.
- Mind UI (MindFullPage + useMindChat + strings): scope chips (Everything/Library/Open-source stack/Workflow atlas/Mindsets/Insights) in both locales; scope sent with every question.

## Site integration

- Hero primary CTA → /explore ("Step inside the Living Organization" / «وارد سازمان زنده شوید»); simulator remains on the home page unchanged.
- Header nav: Explore added as first locale nav link. Sitemap: +4 page groups + 10 book details (priority 0.8/0.7).
- CSS: src/app/silver-bullet.css imported from [locale]/layout.tsx — quiet-intelligence tokens only, zero changes to existing rules except the two 320px-wrap fixes below.

## Fixes surfaced during verification

1. flows page 320px overflow (+44): long book-title chips in mindset links; fixed (white-space:normal + max-width). Now 0.
2. books pages console noise: coverless ISBNs probed the covers API per visit; fixed via COVER_VERIFIED receipt map (request skipped entirely). After: 0 console errors.
3. signal label keys used hyphens where simLabels uses underscores (production-incident); fixed with key normalization (signal_ + key with '-'→'_').
4. flows.json cross-repo refs used "openmetadata" vs layer id "open-metadata"; unified (test-asserted now).

## Known pre-existing issues (documented, not regressed)

- A1: +74px @1024 overflow on 4 legacy pages (root cause untriaged in this mission).
- A2: /en/mind +46px @320 — driver is the .mind-full-card min-content chain (probe: scripts/sb-mind320-probe.mjs). Proposal: audit .mind-full-* fixed paddings + disclosure min-content; estimated ≤1h.
- A4: one insights figure +96px @390.

## Verification commands (re-runnable)

```
npm run typecheck        # 0 errors
npm test                 # 114/114 (incl. 11 new knowledge tests)
npm run build            # 137 pages, exit 0
node scripts/sb-verify-books.mjs
node scripts/sb-mind-eval.mjs     # mock mode; needs local service (see 07)
node scripts/sb-after-capture.mjs # needs npm start -p 3219
```
