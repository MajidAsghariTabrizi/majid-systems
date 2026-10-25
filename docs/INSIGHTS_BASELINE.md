# Quantiviq Insights — Phase 0 Baseline Report

**Date:** 2026-10-23 · **Branch:** `insights` (from `main` @ `90a46c0`) · **Recon method:** repository read + drift probe + prior mission Lighthouse baselines.

## 1. Deployed vs repository

- `drift_probe.py`: remote HEAD `90a46c0` == local `main` == `origin/main`. **Drift zero.**
- Deploy path: `git push origin main` → `scripts/public_deploy.py` (VPS pull, `npm ci`, `next build`, pm2 restart). Nginx serves the single Next.js origin at `https://quantiviq.xyz`. TLS/DNS/proxy untouched by this mission.
- Rollback: `git revert <merge>` on `main` + re-run `public_deploy.py`; previous deploys are tagged by commit (`237a29d` = pre-insights known-good).

## 2. Route inventory

| Tree | Routes | Notes |
|---|---|---|
| `src/app/[locale]/` | `/en`, `/fa` + `/services`, `/system`, `/lab`, `/method`, `/proof`, `/leadership`, `/about`, `/contact`, `/privacy` | Commercial site, fully localized EN/FA |
| `src/app/(shared)/` | `/journey`, `/profile`, `/work`, `/work/[slug]`, `/engineering`, `/notes`, `/notes/[slug]`, `/open-source`, `/resume` | Locale-neutral English builder tree, own header nav |
| `src/app/api/` | `/api/lead`, `/api/lab`, `/api/lab/status` | Server routes |
| Metadata routes | `robots.ts` (allow all except `/.next/`, `/api/internal/`), `sitemap.ts` | Generated, no `public/robots.txt` shadow |

**No `/insights` route or asset exists — zero URL conflicts.** Nav uses `dict(locale).nav.*`; adding a key requires both locales (EN/FA parity enforced by test).

## 3. Current SEO state

- Layout: `metadataBase`, title template `%s · Quantiviq`, per-page `socialMeta()` (canonical + OG + Twitter + hreflang only where both locales exist). Organization JSON-LD site-wide; `NoteJsonLd` on notes.
- **Gaps this mission fixes:** no RSS feed; no `llms.txt`; sitemap `lastModified` for locale routes is `new Date()` (fake freshness — articles will use real dates); no publication/article schema.
- **Gaps out of scope (recorded, not silently changed):** none blocking.

## 4. Content architecture

- All content today is TS modules (`src/content/i18n/*.ts`, `projects.ts`, `notes.ts`). No markdown layer, no CMS, no DB. **Decision:** smallest maintainable file-based layer — `content/insights/*.md` (frontmatter + markdown body, inline SVG figures allowed) + `sources.json` ledger, read at build time via `gray-matter` + `marked` (new runtime deps, both MIT, no plugins), exposed through `src/content/insights/*.ts` loader. Static-params → fully SSG articles (initial HTML contains full text).

## 5. Design system

- Single `globals.css` (~6.98k lines): `q-hero`, `q-section`, `q-display` (H1 tokens), `q-h2`, `eyebrow`, `container/-wide/-narrow`, `btn`, `chip`, `q-lede`, plus V5 typography tokens (`--fs-*`, `--lh-*`). Dark theme, Inter + JetBrains Mono (EN), Estedad (FA). Insights gets a dedicated CSS block on these tokens — no framework, no new UI deps.

## 6. Performance baseline (production, 2026-10-22)

| | Perf | a11y | SEO | CLS | LCP |
|---|---|---|---|---|---|
| EN | 0.86 | 0.9 | 1.0 | 0.0005 | 3.0s |
| FA | 0.81 | 0.9 | 1.0 | 0.0000 | 3.8s |

LCP is TTFB-bound (single VPS, no CDN) — **known limitation, unchanged by this mission**; target for Insights pages is Lighthouse SEO/a11y ≥ 90 and perf parity with the above, honestly reported.

## 7. Build health

`npm run typecheck` clean · `npm run test` 99/99 · `npm run build` clean at `90a46c0` (verified this session). Playwright (msedge channel) is the browser harness used by all verify scripts.

## 8. Localization policy for the publication

EN is the publication language. Persian editions are **not** machine-published: `/fa/insights` gets a localized index (FA chrome, EN article cards, explicit "English-first research" notice) and article routes exist only under `/en` (FA article URLs 404, no fake hreflang — EN articles self-canonical only).

## 9. Proposed modifications (minimal)

1. New branch `insights` (done), merged to `main` only after full QA; deploy via existing `public_deploy.py`.
2. New files only, plus: one `NAV` dict key ×2 locales (Insights link), sitemap/robots additions (article URLs, real dates), RSS + JSON index + llms.txt routes/files, insights CSS block appended to `globals.css`.
3. No changes to: engine/simulator, existing pages, API routes, Nginx, deploy script, fonts.

**Deployment risks:** sitemap/robots regenerate server-side (verify served output); RSS route must not be cached stale; hero PNGs add ~20 assets (build size check). All covered in the QA matrix.
