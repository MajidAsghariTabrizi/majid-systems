# BASELINE — Quantiviq V3 site, as of 2026-10-18

Branch `v3` (HEAD `3c516e2`). Repo: MajidAsghariTabrizi/majid-systems. Deployed to quantiviq.xyz.

## Stack
- Next.js **14.2.18** (App Router), React **18.3.1**, TypeScript 5.5.3. No UI libraries — hand-rolled components only.
- Design tokens: CSS custom properties in `src/app/globals.css` (`:root`, lines 6–32). Dark canvas `--bg: #0a0b0d`, mint accent `--accent: #7cd9b7` (+ `--accent-warm: #f0a868` for human emphasis). Fonts: Inter (sans/display), JetBrains Mono (mono).
- Playwright (dev dep) available for capture/E2E; analytics: optional Plausible (`.env.example`).

## Commands
| Purpose | Command |
|---|---|
| Unit tests | `npm run test` → `node --import tsx --test test/*.test.ts` |
| Typecheck | `npm run typecheck` → `tsc --noEmit` |
| Lint | `npm run lint` → `next lint` |
| Production build | `npm run build` → `next build` |
| Dev server | `npm run dev` (port 3000) |

Existing tests: `test/content.test.ts`, `test/journey.test.ts`, `test/sim.test.ts`.

## Route map (committed at HEAD)
`/` (homepage), `/about`, `/contact`, `/engineering`, `/journey`, `/notes`, `/notes/[slug]`, `/open-source`, `/profile`, `/resume`, `/work`, `/work/[slug]`.

`/contact` is a placeholder — links out to LinkedIn/GitHub, no form.

**Working tree (uncommitted, v3 in progress):** locale migration scaffolded — pages moved into `src/app/(shared)/` (journey, profile, work, notes, engineering, open-source, resume); `src/app/[locale]/layout.tsx` added; `src/middleware.ts` added (`/` → 307 to `/en` (or `/fa` if `qv_locale` cookie), legacy `/about` `/contact` etc. → 308 to `/en/...`, no Accept-Language detection); `LocaleSwitcher` component and `src/content/i18n/{en,index}.ts` exist but `fa.ts` and all `[locale]` pages are not yet written. Implementation is IN_PROGRESS.

## Deploy pipeline
`git push` → `scripts/public_deploy.py` runs on the 1GB VPS: installs production deps, `npm run build` on the VPS, uploads `nginx/quantiviq.conf` + reloads nginx, certbot cert management; env `NEXT_PUBLIC_SITE_URL=https://quantiviq.xyz`. Post-deploy verify: load quantiviq.xyz and check the new build is served.

## Current state — honest assessment
- **English-only.** No i18n shipped (scaffold in working tree only). No lead form anywhere.
- **Known strengths:** interactive organization simulator (homepage hero, `OrgSimulator` — company-as-chart → company-as-system); the OS / nervous-system diagram (`OrgNervousSystem`); unified six-beat homepage narrative after commit `3c516e2` (13 blocks → 6 beats); cinematic `/journey` experience.
- **Known gaps:** no lead capture (contact is outbound links only); no FA localization; `/contact` is a placeholder; Lighthouse **has not been run** — no performance/accessibility/SEO scores exist yet and none should be quoted; locale pages (`/en/*`, `/fa/*`) not yet implemented.

Wave-0 docs (this directory) define the target; see EXECUTION_BOARD.md for workstream status.
