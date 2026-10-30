# 12 — Entity Strengthening (E2)

Findings (live-verified) instead of new content churn:

- A public operator profile page ALREADY exists and is indexable: **https://quantiviq.xyz/profile** (200, self-canonical, EN legacy portfolio shell) — the earlier dead link in JSON-Ld was re-aimed to it.
- Locale pages emit an `@graph` linking Person ↔ ProfessionalService (Organization) with stable @ids (`/#founder`, `/#organization`); articles add BlogPosting + BreadcrumbList.
- `sameAs` wires GitHub + LinkedIn (operator-editable in `src/content/shared.ts`).
- EN-only legacy pages (work/notes/journey) remain honest single-locale pages.

Recommended owner follow-ups (content, not code): update /profile wording to the current Quantiviq positioning; add a FA variant if Persian entity search matters; keep LinkedIn/GitHub bios aligned for knowledge-panel consolidation.
