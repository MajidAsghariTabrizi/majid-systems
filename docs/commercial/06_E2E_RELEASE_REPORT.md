# 06 — E2E Release Report

Release: **d7891f3** (pushed to main; deployed 2026-11-02 ~14:15Z via public_deploy.py; majid-systems service active; trading/Umami hosts untouched — Umami B realtime healthy via MCP).

## Gates
- typecheck: CLEAN. Unit: **127/127 pass** (incl. new solution-request validation + notification render tests).
- Build: success; catalog/find/request + 40 detail routes x2 locales prerendered.
- Local E2E (Playwright vs next start): **19/19 PASS** — catalog 40 cards, search, category filter (Finance=7), flagship CTA/FAQ/indexable, scoping noindex, request lock + invalid-blocked + valid (ref QV-mvzc9l20-feb1), FA exact confirmation copy, finder results with why-matches, carousel 8 cards + nav buttons, bridge registry-driven, admin 401, legacy contact form intact.
- Admin positive path: token GET (total/byStatus/outbox) + PATCH new→contacted OK.

## Production verification (live, 2026-11-02T14:21Z)
- Routes 200: /en/solutions, /fa/solutions, /en/solutions/quote-desk, /fa/solutions/quote-desk, /find, /en. FA flagship carries FA copy (RTL).
0
**Labeled production request AGENT E2E TEST → ref QV-mvzcl11w-ddf2**:
persisted in /opt/majid-systems/.data/leads.jsonl (solution=quote-desk, source=solutions, pipeline=new); owner email rendered + queued to outbox; admin API shows it with outboxPending=1. Not emailed (SMTP absent — doc 04).
- FA homepage carousel renders 8 cards; FA article bridge renders on article 07; finder returns 3 results for knowledge/enterprise.
- Umami events recorded: finder start/complete, request start/success.
- Screenshots: docs/commercial/shots/ (8 PNGs: catalog EN/FA desktop+mobile full-page, detail EN desktop+mobile, home carousel, request page). Note: the release-verifying model could not view images this session; DOM assertions + FA-content checks carried QA; owner should eyeball the PNGs.

## Rollback
git revert d7891f3 (or redeploy d59afa6) + rerun public_deploy.py. leads.jsonl is append-only and unaffected; no DB migrations; env vars harmless without the new code.

## Blockers (honest)
1. SMTP credentials → real email delivery to tabrizi1991@gmail.com (outbox queues durably meanwhile). Owner: add SMTP_HOST/PORT/USER/PASS/FROM to /opt/majid-systems/.env.production (Gmail app password works) + systemctl restart majid-systems; then flush the outbox via scripts/leads-tool.mjs.
2. Google OAuth (customer accounts) — needs owner GOOGLE_CLIENT_ID/SECRET. Guest path fully live without it.
3. GSC/Bing indexing (growth mission) — still owner-gated.
