# 11 — AI Search Integration (E1)

- **OAI-SearchBot allowed, independently of GPTBot** (separate robots group; flipping either is one line). ChatGPT-User (user-initiated fetch) allowed. GPTBot allowed by deliberate owner-aligned choice (published Insights are meant to be cited).
- Verification of real hits (anti-spoof): nginx access log on A records UA + source IP. Verified Google traffic today from 192.178.4.196/.197 (legit Google range, rendering-capable: JS chunk fetches). OAI-SearchBot: 3 hits, ChatGPT-User: 5 hits in current rotation. IP reverse-verification for OAI bots: `host <ip>` must land in `openai.com` (official published ranges) — scripted in Phase E follow-up; spoofed UAs are not counted.
- `llms.txt` deployed at https://quantiviq.xyz/llms.txt (existing, verified): site map + representative articles + policy notes. No content fabrication.
- `/meet-majid` remains noindex/nofollow/noarchive (meta + header) — re-verified live after deploy.
