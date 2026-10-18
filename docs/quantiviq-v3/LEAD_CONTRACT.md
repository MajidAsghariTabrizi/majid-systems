# LEAD CONTRACT — POST /api/lead — 2026-10-18

Durable-append lead capture. Success claim = **the lead is appended to the JSONL store**, nothing more. No database service.

## Request
`POST /api/lead`, `Content-Type: application/json`, body limit **8 KB** (reject larger with 400).

```jsonc
{
  "intent": "diagnostic | rebuild-function | infrastructure | partnership | other",  // required, enum
  "name": "…",            // required, ≤100 chars
  "email": "…",           // required, ≤254 chars, RFC-ish regex validation
  "org": "…",             // optional, ≤150
  "website": "…",         // optional, must be a valid URL when present
  "role": "…",            // optional, ≤100
  "message": "…",         // required, ≤5000
  "preferred": "email | linkedin",  // required, enum
  "preferredLink": "…",   // optional, valid URL (the visitor's LinkedIn/profile)
  "consent": true,        // required, must be exactly true
  "company_site": ""      // HONEYPOT — must be absent or empty; non-empty ⇒ silent reject as spam
}
```

## Responses
| Status | Body |
|---|---|
| 200 | `{ "ok": true, "id": "QV-…" }` |
| 400 | `{ "ok": false, "errors": { "<field>": "<code>" } }` — per-field codes: `required`, `too_long`, `invalid`, `unsupported` |
| 429 | rate-limited (see below), `Retry-After` header |
| 413 | body over 8 KB |

## Guards
- **Origin check:** only same-origin (and the configured site origin) requests accepted; cross-origin POSTs rejected.
- **Rate limit:** per-IP sliding window **5 requests/hour**, in-memory. Best-effort under multi-instance (single VPS deployment — acceptable).
- **Honeypot:** `company_site` filled ⇒ treat as spam (respond 200-shaped no-op or 400; never store, never notify).

## Storage
- Append-only JSONL at `QV_LEAD_DATA` (default `.data/leads.jsonl`). One JSON object per line:
  `{ id, createdAt, locale, intent, name, email, org?, website?, role?, message, preferred, preferredLink?, consent, ipHash, status: "stored", notify: "pending_config" }`
- `id` format `QV-<short-random>`; `ipHash` is a salted hash (never the raw IP).
- **No PII in server logs** — log only id, intent, outcome.
- `notify` stays `"pending_config"` until SMTP is configured (see LEAD_OPERATIONS.md); notification is a later enhancement, not part of the success claim.

## Env names (to be added to `.env.example`)
`QV_LEAD_DATA`, `LEAD_NOTIFY_EMAIL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`.

## Privacy / deletion
- Deletion on request: visitor replies referencing their lead ID; operator removes/annotates the JSONL line per LEAD_OPERATIONS.md procedure.
- Consent (`consent: true`) is required at capture; the form states what is stored and how to request deletion.
