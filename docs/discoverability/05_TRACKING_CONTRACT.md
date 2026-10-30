# 05 — Tracking Contract (Phase C, taxonomy v1)

## Transport

- Tracker script: `https://quantiviq.xyz/_q/script.js` — nginx (A) proxies to Umami over an authenticated autossh tunnel (A→B), caches it, serves it same-origin. The Umami tracker derives its collection host from the script's own origin, so events POST to `https://quantiviq.xyz/_q/api/send` — first-party on every hop. No third-party script or endpoint is loaded. Blocking: `next/script afterInteractive` (non-blocking); app never depends on it (wrapper catches all failures; nginx timeouts 3s/5s fail open; tracker outage = lost analytics only).
- Native pageviews: Umami auto-track handles initial load AND SPA route changes (history API). We emit **no** custom `page_view` — no double counting.

## Event taxonomy (v1) — implementation: `src/lib/analytics.ts`

| Event | Fires when | Props (allowlisted) | Dedupe |
|---|---|---|---|
| page_view | Umami native, per route transition | — (native) | n/a |
| meet_majid_view | /meet-majid mounted | — | once/session |
| mind_session_start | first real question submitted (public mind or executive surface) | surface: public\|executive | once/session/surface |
| mind_session_complete | assistant answer completed with non-empty content (not abort/error) | surface | per completed answer |
| simulator_run | explore scenario actually selected/run | scenario key, locale | per run |
| insight_read | ≥55% scroll OR ≥25s dwell on an Insights article | slug, locale | once/slug/session |
| contact_click | intentional click on any contact-route CTA (delegated listener) | source path | 30s window |
| contact_submit_success | server-confirmed POST /api/lead success | intent, locale | per submission |
| diagnostic_request | /api/lead success with intent=diagnostic | locale | per submission |
| source_open | evidence source opened from an answer | category=source.type, sid=source id | per open |

## Data guarantees

- **Hard allowlist**: unknown event names or property keys are dropped client-side (see ALLOWED map).
- Sanitizer strips control chars, `@` (address-like content) and clamps strings to 100 chars.
- **Never collected**: prompt text, AI answer content, names, emails, phones, tokens, cookies, IPs as properties, full query strings with personal data, or any free-form user input. Mind conversations stay untracked except the three boolean-ish events above.
- Referrer/UTM: Umami-native (first-party); landing URL recorded by Umami; no user-level joins across surfaces — aggregate reporting only.
- `/meet-majid` (unlisted) counts views only; its noindex/noarchive policy is untouched.

## Privacy posture

- Umami is cookieless; no cross-site tracking, no fingerprinting.
- GDPR/ePrivacy note: cookieless first-party measurement with aggregate-only reporting is low-risk, but a privacy-policy sentence describing the anonymous measurement + an opt-out path is added to `/en|fa/privacy` (this deploy). If the owner serves EU users at scale, review with counsel.

## Historical metrics (C4)

- Pre-deployment visibility: nginx access logs on A (rotated, ~12 files) — available for HTTP-hit baselines with UA-based bot filtering. **No backfill into Umami** (would fabricate visitors). Umami data starts at deployment time.
