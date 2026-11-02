# E — Conversion Measurement (QVQ-GROWTH-2026-11-02)

**Verdict: PASS — instrumentation verified end-to-end live; funnels specified; baselines captured.**

## Event dictionary (code-audited + live-verified 2026-11-02)

| page_view | Umami auto (SPA-aware) | native | none sent |
| mind_session_start | first Mind send | sessionStorage per persona | no prompt/answer content |
| mind_session_complete | clean non-empty answer | once/session | no answer body |
| insight_read | >=55% scroll OR >=25s dwell | once/slug/session | slug+locale only |
| simulator_run | scenario chip select | none (intentful) | scenario key only |
| contact_click | any contact-link click | 30s window | none |
| contact_submit_success | server-confirmed /api/lead 200 | once/session | intent+locale only |
| diagnostic_request | server-confirmed diagnostic intent | once/session | same |

## Funnel specs (ordered, session-scoped, 30-min window)
1. organic landing -> engaged content (insight_read OR mind_start) -> services/about view -> contact_click
2. homepage -> mind_session_start -> mind_session_complete -> contact_click
3. insight_read -> internal nav to service/about -> contact_click -> contact_submit_success
4. simulator_run -> /contact view -> diagnostic_request (server-confirmed)

Definitions: click != lead; lead = contact_submit_success/diagnostic_request only. Missing referrer = **unknown**, not direct.

## Live verification (labeled INTERNAL SYNTHETIC TEST, 2026-11-02)
- Positive: mind_start, mind_complete, contact_click, insight_read, simulator_run — each exactly once, no duplicates; browser -> nginx 200 -> Umami chain confirmed.
- Negative: invalid form submit -> **no** contact_submit_success (server-confirmed-only design).
- Inbox isolation: success events verified at server-boundary code level (fire only on /api/lead 200) — no real lead inbox touched.
- Backlog notes: 25s-boundary dwell events can be lost if the visitor leaves within ~1s (sendBeacon hardening, P2); explore role/scenario chips share CSS classes (test-selector ambiguity only).

## Baseline (2026-11-02T07:50Z — E_ANALYTICS_BASELINE_2026-11-02.json)
10 sessions / 20 pageviews / 8 events lifetime; 2 human-organic sessions (1 Google-referred); funnel conversions 0 (expected: no indexed acquisition yet). Native Umami funnels: none saved (creation UI-gated in v3.4.1); reproducible MCP queries documented.
