# RELEASE_READINESS

_Verdict: READY — all critical gates green. Deployed 2026-10-26 10:26 UTC as `dfd1835`._

| Gate | Requirement | Result | Evidence |
|---|---|---|---|
| Static | TypeScript typecheck | ✅ 0 errors | `npm run typecheck` on merged main |
| Build | Production build | ✅ exit 0, 137 routes | build log; VPS build in deploy output |
| Tests | Unit/integration | ✅ 114/114 (incl. 11 knowledge tests) | `npm test` |
| E2E/functional | routes + interactions | ✅ all probes green (local + production) | sb-after-capture.mjs, sb-prod-verify.mjs |
| New routes | 14 new URLs EN/FA | ✅ 25/25 route sweep 200 | prod-final-report.json |
| Bilingual | EN/FA + RTL/LTR | ✅ dict parity (type-enforced), dir=rtl verified per FA route | i18n suite + sweep |
| Responsive | no overflow 320–1440 | ✅ 0px everywhere incl. fixed A2 | overflow probes |
| Accessibility | axe-core critical/serious | ✅ 0 on 9 routes (5 defect classes fixed) | sb-axe-sweep.mjs |
| Assets | covers | ✅ 7/7 hotlinked covers + 3 designed fallbacks on prod | prod sweep |
| Mind compatibility | existing chat unbroken | ✅ config byte-identical, live GLM answers | release-mind-deploy.py gates |
| Real-model grounding | live LLM + citations | ✅ 8/8 local + production gateway gates | MIND_REAL_EVAL.md |
| Secrets | none exposed | ✅ no keys in repo/logs; env 0600 on VPS; key never printed | deploy transcripts |
| Rollback | tested procedure | ✅ backup taken + rollback scripted | DEPLOY_AND_ROLLBACK_PLAN.md |

## P0/P1 defects found and FIXED this release

1. 5 new pages wrapped in `<main>` inside the layout's `<main>` → duplicate/nested landmarks (removed)
2. 24 sub-4.5:1 contrast uses in new CSS + 3 pre-existing low-contrast rules (lang-tab, mind disclosure ×2) → raised to AA
3. heading-order skip on books library → bilingual h2 added
4. simulator svg role=img with focusable children → role=group
5. source links indistinguishable in text → underlined
6. **pre-existing A2**: /en/mind +46px overflow @320 → root-caused (flex min-content + 280px grid floor) and FIXED
7. signal label key mismatch (hyphen/underscore) in explore — fixed pre-merge

## Known limitations (disclosed, none blocking)

- No vision-capable model existed in this environment (glm-5.3 has no image input; subagent confirmed) → visual QA is programmatic-only
- 3 of 10 books have no Open Library cover asset → designed text cards by policy (never wrong-edition art); re-run `scripts/sb-verify-books.mjs` to pick them up later
- Legacy A1 (+74px @1024 on 4 legacy pages) / A4 (one insights figure @390) remain as before (out of scope, unchanged, documented)
- Mobile Lighthouse perf 80–89 (throttled) — acceptable for static image-bearing pages; not a regression
