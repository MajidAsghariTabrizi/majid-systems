# 06 — Privacy Evaluation (C6)

- Umami is cookieless; no cross-site identifiers, no fingerprinting; IP hashed into first-party sessions (CRAWLER_CHECK on).
- Event taxonomy is closed (10 events) with per-event property allowlists; a sanitizer strips control chars and `@`, clamps length. **No free-form user input is ever an event property.**
- Mind conversations are never recorded (only start/complete booleans per surface). Meet-majid counts a view, nothing else.
- `/en|fa/privacy` now disclose the anonymous measurement explicitly (new 'Anonymous site measurement' section, bilingual).
- Data residency: all analytics data stays on the operator's own two servers (Iranian hosting — Parspack/Mobinnet). No third-party processors.
- Retention: analytics DB is backed up with 30-day local + 14-day cross-host rotation; pageview rows live until the operator prunes them (Umami default: unlimited) — documented for owner decision.
- Recommendation: if EU traffic becomes material, obtain counsel review; cookieless aggregate measurement generally avoids consent-banner duties (ePrivacy 'strictly necessary' vs stats is jurisdiction-dependent).
