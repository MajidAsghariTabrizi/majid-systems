# 03 — BILINGUAL ARCHITECTURE & CONTENT SYSTEM
_EN/FA parity is structural, not aspirational — enforced by types and tests._

## Content pipeline

```
content/knowledge/*.json  (git-versioned, reviewed, bilingual per field)
        │
        ├── src/content/knowledge/index.ts  (static JSON imports → client-safe loader)
        │         └── pages: books, stack, flows, explore (+ i18n dict copy)
        │
        └── scripts/mind-build-knowledge.mjs §6  (mind corpus records en/fa)
                  └── public-mind/build/public-knowledge.sqlite (715 records)
```

One source of truth: the same JSON renders the public pages, feeds the Mind
retrieval corpus, and is validated by test/knowledge.test.ts (11 tests) —
including full EN/FA parity of every contract field of all 12 flows and every
brief/takeaway/question set of all 10 books.

## i18n mechanics (unchanged pattern, extended)

- Dictionary: `src/content/i18n/{en,fa}.ts` — `Dict = typeof en` so any missing FA
  key is a compile error. New sections: `explore`, `booksPage`, `stackPage`,
  `flowsPage` + `nav.explore` — added to BOTH locales (existing parity suite green).
- Knowledge content is bilingual **inside the JSON** (`{en, fa}` on every field) —
  not via the dictionary — so the data stays self-describing for the Mind build.
- Persian is native editorial Iranian Persian (no translationese); Persian digits
  appear in FA copy where the existing site uses them. RTL verified per route.
- Mind records carry cross-lingual aliases (FA record lists EN title + authors)
  so a Persian question about an English-titled book retrieves it (eval fa-g01…g05).

## Sitemap & SEO

14 new URLs added to `src/app/sitemap.ts` (4 page groups ×2 locales + 10 book
details, priority 0.8 pages / 0.7 books). Static routes (insights/books,
insights/enterprise-ai-stack) correctly take precedence over the insights
[slug] dynamic segment — verified in the build output route table.
