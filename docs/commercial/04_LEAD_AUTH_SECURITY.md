# 04 — Lead, Auth & Security

## Guest request path (shipped, verified in production)
/{locale}/solutions/{slug}/request — fields exactly per owner: locked solution, name, email, company, phone (opt), need (opt), consent. NO login, NO payment, NO cart/checkout/order concepts anywhere in UI, API or store. Confirmation copy EXACT: درخواست شما ثبت شد. برای بررسی نیاز سازمان و ارائه پیشنهاد اختصاصی با شما ارتباط می‌گیریم. (EN equivalent alongside). Reference id shown.

## Pipeline (ordering FIXED per PRD: persist before notify)
request → origin/CSRF check → 8KB cap → IP-hash rate limit (5/h) → honeypot → schema validation → catalog-slug validation → DURABLE append (leads.jsonl) → notification attempt → atomic notify-state patch → reference returned.
Success = the persisted line (notify: sent / outbox_queued / notify_failed / pending). SMTP downtime cannot lose a request. Verified live: prod request QV-mvzcl11w-ddf2 stored + owner email queued to outbox in the same second.

## Owner notification
- Recipient: LEAD_NOTIFY_EMAIL=tabrizi1991@gmail.com (set in /opt/majid-systems/.env.production 2026-11-02).
- Subject: [Quantiviq request] Name — solution (locale). Body: ref, time, solution, self-declared email label, phone, org, message, source, admin pointer.
- DELIVERY STATUS: OUTBOX (durable queue) — NOT yet email-delivered. SMTP_* credentials do not exist on A. Nothing is lost; nothing is emailed until owner adds SMTP (below).

## Auth
- Google OAuth: BLOCKED — no owner Google credentials. Decision scaffolded (Auth.js, basic scopes, optional, never mandatory). Guest path fully live without it.
- Admin interim (shipped): /api/admin/requests GET/PATCH gated by QV_ADMIN_TOKEN (39-char, constant-time compare, unconfigured = closed). Pipeline: new → contacted → discovery → proposal_sent → won | lost, timestamped with actor. Token saved at C:\Users\ma.asghari\.dsh\var\qv-admin.token. Usage: curl -H "x-admin-token: <token>" https://quantiviq.xyz/api/admin/requests
- Verified: 401 with wrong/absent token (prod + local); authorized GET returns summary + requests; PATCH transition ok.

## Privacy
ipHash only (no raw IPs); honeypot swallows bots with fake 202; PII never enters analytics (allowlist: slug/locale/source only); request/admin pages noindex; local test data untracked.
