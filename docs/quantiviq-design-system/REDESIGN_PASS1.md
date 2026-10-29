# QUANTIVIQ - Complete Redesign, Pass 1 (2026-10-29)

Deploy: main edc514d -> https://quantiviq.xyz | build 0 errors | 126/126 tests | /meet-majid unchanged (200, noindex).

## Audit reproduction - all confirmed against production before coding
1. Times New Roman body/headings sitewide (EN) - REAL. Root cause: the previous token migration dropped ~20 tokens from :root (--font-sans, --fs-h1..h4, --fs-body/btn/support, --max/-wide/-narrow, --font-mono, --header-h). Persian had its own rule, masking it. FIXED: complete token system restored (Inter/Estedad, fluid clamp scale hero 40-76px, containers 1200/1280/720, semantic state tokens). Verified in production: h1=Inter 56px, FA=Estedad.
2. Featured Insights card dark-on-dark - REAL (title rgb(29,26,22) on gradient ending rgb(10,13,18)). FIXED: light editorial gradient.
3. 10 top-level nav links + 26px-high hidden horizontal strip on mobile - REAL. FIXED: new SiteHeader - 5 entries (Approach, Services, Evidence, Insights, About) + locale + one CTA. Dropdowns: Enter/Arrow/Escape, focus return, aria-expanded/current. Mobile: dialog sheet (role=dialog, aria-modal, focus trap, Escape, scroll-lock, focus return, 15 destinations, visible close). Verified by keyboard probe.
4. Phoenix PRODUCTION on /proof while retired - REAL (two data sources disagreed). FIXED: canonical projects.ts status honored; badge now RETIRED 2026-09-17; remaining PRODUCTION chip is Agent Runtime (truthful).
5. Explore double scenario state - REAL. FIXED: OrgSimulatorSection accepts controlled signal; one state drives picker/sim/gate/transcript; verified outer click -> inner follows.
6. Contact form - REAL. FIXED: core fields first; LinkedIn URL only for channel=linkedin; org/role/website behind details; aria-invalid/describedby everywhere; focus-first-invalid; backend contract unchanged; intent prefill via ?intent=canonical-key.
7. FA accessibility labels - skip link localized; nav2/mobile-menu strings FA.

## Homepage re-narrative
Hero (2-col + signature IntelligenceMap SVG: knowledge hub, human authority, bounded agents, signal->learning loop, reduced-motion-safe) -> Problem (3 symptoms + details for full taxonomy) -> Compact simulation preview (full sim moved to /explore) -> System in 3 groups + route to 8-layer model -> Services (4 offers, NEW section, per-offer Discuss-this-path -> contact?intent=) -> Evidence -> Method (3 phases + link to full 7) -> founder bridge (hiring link moved here) -> final CTA. Hero CTAs: Start a conversation / Explore the living organization.

## Route coverage
All 114 known public routes preserved - no route renamed, removed or redirected; nav regrouping only. Legacy EN tree (journey, profile, work+4 cases, engineering, notes+10, open-source, resume) uses the same header (builder variant). Locale routes x2.

## Verification
- Build 0 errors; typecheck clean; 126/126 tests.
- axe (21 combos): 4 critical/serious = the same 4 pre-existing nested-interactive (lab x1, journey x2); 0 color-contrast violations.
- Viewport sweep (120 combos): 320px header overflow FIXED (CTA yields to burger under 620px); article tables fixed. RESIDUAL: lab (18-39px) and work/profile (18px) at 320px only - same geometry as pre-redesign baseline; root cause not yet isolated; documented.
- Local CORS errors on journey/work/profile are local-preview-only; same-origin in production (pre-existing).

## Honest limitations
- Lighthouse not re-measured after this pass (CSS/token changes only, no new JS weight; last measured perf 99 / a11y 100).
- Not implemented (pass-2 candidates): Insights index search/filter (#18), floating-assistant launcher (#12), locale-switch context preservation into the shared EN tree (#17 partial), vision review (no vision-capable model here).
- GoTribal used only as a quality benchmark; nothing copied.