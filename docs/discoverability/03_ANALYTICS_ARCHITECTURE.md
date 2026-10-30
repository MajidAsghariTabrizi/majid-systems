# 03 — Analytics Architecture & Data Flow

```
browser ── same-origin https://quantiviq.xyz/_q/script.js (cached 1h)
        └ POST https://quantiviq.xyz/_q/api/send   (first-party, cookieless)
              └─ nginx (A, 443, fail-open 3s/10s) ── 127.0.0.1:3010
                    └─ autossh tunnel (key-restricted) ── B 127.0.0.1:3001
                          └─ Umami v3.4.1 (systemd, 500M cap) ── PG16 loopback (1G cap)
dashboard: owner SSH tunnel OR stats.quantiviq.xyz (when DNS lands) → same autossh path
```

- Tracker derivation: the Umami tracker computes its collection host from the script's own origin, so serving it from `/_q/` makes all events first-party by construction (verified against v3.4.1 tracker source).
- Site integration: `AnalyticsScript` (`next/script afterInteractive`, `data-domains=quantiviq.xyz`); if `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is absent at build, instrumentation is inert (component returns null) — analytics can never break the site. CSP already allows 'self' scripts/connect.
- The tracking wrapper (`src/lib/analytics.ts`) is the ONLY sanctioned emit path: allowlist + sanitizer + once-per-session dedupe (see 05).

## Failure semantics

| failure | effect |
|---|---|
| Umami down / tunnel down | nginx returns 5xx after 3s; tracker send fails silently; **site unaffected** |
| PG down | same as above (umami errors, systemd restarts it) |
| B reboot | autossh reconnects (Restart=always); umami/postgres enabled |
| A reboot | umami-tunnel enabled; nginx/persistent timers resume |
