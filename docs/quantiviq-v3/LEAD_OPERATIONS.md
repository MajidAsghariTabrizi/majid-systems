# LEAD OPERATIONS — runbook — 2026-10-18

## Provisioning (one-time on the VPS)
1. Create the data dir writable by the node process: `mkdir -p .data && chown <node-user> .data`.
2. Set env (via the deploy env mechanism): `QV_LEAD_DATA=/path/to/.data/leads.jsonl`, and when notification is enabled: `LEAD_NOTIFY_EMAIL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (names already reserved in `.env.example`).
3. Restart the app (`systemctl restart` per the deploy setup / re-run `scripts/public_deploy.py`).

## Health check
`GET /api/lead` → `{ "ok": true, "storage": "writable" }` or `{ "ok": true, "storage": "error" }` (storage probe = append-test or write-probe on `QV_LEAD_DATA`). Monitor this endpoint; `storage: "error"` means leads are being rejected, not silently dropped.

## Retention
- Leads kept **24 months** from `createdAt`, then eligible for pruning during periodic review (manual; the append-only file is never auto-deleted mid-incident).

## Anti-spam stack
1. Honeypot field `company_site` (silent reject).
2. Per-IP sliding-window rate limit 5/hour (in-memory).
3. Origin check + 8 KB body limit.
No CAPTCHA — friction stays near zero for humans.

## Recovery / backup
- The JSONL store is **append-only**; backup = copy the file (`cp .data/leads.jsonl backups/leads-$(date +%F).jsonl`). No database to restore. One damaged line never affects the others.

## Deletion procedure (privacy requests)
1. Locate lines by lead ID (`grep '"id":"QV-…"' .data/leads.jsonl`).
2. Rewrite the file without those lines (or annotate `status: "deleted"` keeping no PII fields), verify line count.
3. Reply to the requester from the lead email confirming deletion; record the action outside the PII store.

## Test commands
- Unit/contract: `npm test` (payload validation, honeypot, rate-limit window logic).
- E2E against a running server: `node scripts/v3-check.mjs` (lead block: valid, invalid, FA, honeypot, rate-limit, health — run against a **fresh** `next start` so the in-memory 5/hour IP bucket is empty) and `node scripts/audit-check.mjs` (C3: accept → outbox → delete).

## BLOCKED_PENDING_CONFIG — SMTP delivery (outbox is live)
- Without SMTP env vars, every accepted lead is **durably stored and its owner notification is queued in the outbox** (`notify: "outbox_queued"`; health reports `notify: "outbox"` + `outboxPending`). The transport is `QV_NOTIFY_TRANSPORT` (`smtp` default / `test` = outbox only).
- The pipeline is not broken: nothing is lost and nothing pretends to be delivered. Drain the outbox after provisioning by setting `LEAD_NOTIFY_EMAIL` + `SMTP_*` (+ optional `SMTP_FROM`) and restarting; `scripts/leads-tool.mjs` lists/flushes/deletes records and purges past the 24-month retention window.
