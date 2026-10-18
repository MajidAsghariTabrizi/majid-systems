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
- E2E against a running server: `node scripts/lead-e2e.mjs` — posts valid + invalid + honeypot + rate-limit-exceeding sequences and asserts the JSONL contents and status codes.

## BLOCKED_PENDING_CONFIG — notification
- Until SMTP env vars are set, every stored lead records `notify: "pending_config"` and **no email is sent**. The pipeline is not broken; notification is pending config.
- Health endpoint and lead file remain authoritative. Enable notification by setting `LEAD_NOTIFY_EMAIL` + `SMTP_*` and restarting; new leads then attempt notify (old `pending_config` lines are swept on next deploy or manually).
