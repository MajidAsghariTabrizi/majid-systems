# 01 — Baseline & Preservation Matrix (Commercial Platform v2, 2026-11-02)

- Base: commit d59afa6 (deployed) → release commit **d7891f3** (pushed + deployed).
- App: Next.js 14.2.18 / React 18 / TS strict, EN/FA locale routes, first-party Umami + MCP analytics. Service majid-systems on A (127.0.0.1:3000, nginx front).
- Editorial inventory verified 2026-11-02: **20 EN articles + 15 FA counterparts** (IDs 01–15 paired; 16–20 EN-only, documented), books/topics/authors/feeds untouched. **Zero editorial URL migrations.**

## Preservation matrix (verified by tests + production smoke AFTER release)

| Asset | Decision | Evidence |
|---|---|---|
| Insights URLs/bodies/sources/JSON-LD | Preserve | unchanged; bridge rendered BELOW article only; E2E asserts bridge presence; 127/127 unit tests |
| Homepage thesis/hero | Preserve | hero untouched; carousel inserted AFTER preview section |
| Services/System/Method/Proof/Explore/Mind | Preserve | routes untouched; all nav groups retained |
| /contact + LeadForm | Preserve + reuse | E2E regression gate passed; same /api/lead endpoint |
| Lead history | Preserve | production leads.jsonl intact; new records append-only |
| Analytics taxonomy v1 | Extend only | v1 events untouched; v2 additions allowlisted |
| Sitemap/robots | Extend only | solutions appended; robots crawl-allow verified post-deploy |
| SEO metadata | Extend only | canonicals/hreflang on new pages; scoping detail pages noindex |
