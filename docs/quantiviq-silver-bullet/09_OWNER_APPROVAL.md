# 09 — OWNER APPROVAL REQUEST & DEPLOYMENT RUNBOOK
**No production deployment has been performed.** All work is local on branch
`silver-bullet`; `main` is untouched at 0dce84c. The live site at
https://quantiviq.xyz is unchanged.

## What is ready (verified locally)

- typecheck 0 errors · 114/114 tests · production build 137 pages exit 0
- 14 pages × 4 widths captured (captures-sb/after/, 57 files) · 0 console errors,
  0 broken images, 0 overflow on every NEW page (EN+FA)
- 7/10 covers verified live + 3 designed fallbacks (receipts committed)
- Mind corpus 715 records · scope filter verified · grounding eval 44/44 (mock)
- Docs 00–09 (this set) with per-gate verdicts

## Owner decisions requested

1. **Deploy the silver-bullet branch to production** (runbook below) — YES/NO.
2. **Z.AI chat activation** — the Mind remains retrieval-only until the account
   billing is fixed (your action, upstream 429 code 1113). Chat disabled state is
   preserved exactly as before.
3. Optional follow-ups (est. ≤2h total): pre-existing A1/A2/A4 overflow fixes on
   legacy pages; adding the 3 missing covers later if Open Library gains them
   (re-run `node scripts/sb-verify-books.mjs` + rebuild).

## Deployment runbook (after approval only)

```bash
# 0. prerequisites: branch silver-bullet checked out, clean tree
npm run typecheck && npm test && npm run build      # all green at time of writing

# 1. rebuild the public mind corpus (committed artifact is current; rebuild is idempotent)
node --experimental-strip-types --import ./scripts/mind-register-loader.mjs scripts/mind-build-knowledge.mjs

# 2. ship to the VPS using the existing, owner-controlled script
python scripts/public_deploy.py

# 3. post-deploy verification (against https://quantiviq.xyz)
#    - /en/explore, /fa/explore, /en/insights/books (+ one slug), /en/insights/enterprise-ai-stack, /en/mind/flows → 200
#    - CAPTURE_BASE=https://quantiviq.xyz node scripts/sb-after-capture.mjs
#    - confirm hero CTA → /explore, sitemap.xml contains the 14 new URLs
#    - confirm /api/public-mind/chat still returns 503 disabled (chat unchanged)
```

## Rollback

`git revert` the branch merge on main and re-run `python scripts/public_deploy.py`;
the deploy script targets the same VPS path, so the previous build is restored on
the next push. No database migrations are involved (the SQLite knowledge DB is
a build-time artifact, gitignored; it is regenerated from the committed JSON by
step 1 of the runbook).
