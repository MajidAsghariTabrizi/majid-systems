# 09 — Webmaster Verification (OWNERSHIP GATED)

**Status: BLOCKED on owner accounts (not on engineering).** Everything server-side is ready.

## Google Search Console — exact owner steps

1. Sign in at https://search.google.com/search-console with the owner Google account.
2. Add property → **Domain** → `quantiviq.xyz` → it shows a TXT record `_google-site-verification=…`.
3. In Parspack DNS panel (NS: grass/river.parspack.net) add: `@ TXT "<the value>"` (TTL 3600).
4. Verify (DNS propagation may take minutes-hours). Then submit `https://quantiviq.xyz/sitemap.xml`.

## Bing Webmaster + IndexNow

1. Sign in at https://www.bing.com/webmasters → import from GSC (after GSC verifies) or add site `https://quantiviq.xyz`.
2. Verification via CNAME/TXT (Parspack, same flow) or the meta tag (can be added to the app layout on request).
3. IndexNow: key file already deployed at https://quantiviq.xyz/a7f3c9e21b84d5f6092c7e1a4b8d36f5.txt (verified 200). Submit URLs only on real content changes: `node scripts/indexnow-submit.mjs <urls…>`.

## Truth contract

- Until the above happens: indexing status for every URL is **TECHNICALLY READY / OWNERSHIP BLOCKED / INDEXING PENDING**. Observed crawler hits (Googlebot 19, OAI-SearchBot 3, ChatGPT-User 5 in the current nginx rotation) prove crawl access, NOT index inclusion.
