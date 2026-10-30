# 07 — Route Indexability Audit (Full Matrix)

Raw evidence: `07_SEO_ROUTE_AUDIT.csv` (all 112 probes) + `07_route_probe_raw.json` (fields: status/redirect/title/desc/canonical/hreflang/robots/x-robots/JSON-LD/OG/lang/dir/text-size). Vantages: workstation + Server-A loopback (`curl --resolve`), 2026-10-30.

## Registry summary

| Cluster | Count | Status | Canonical | hreflang | Notes |
|---|---|---|---|---|---|
| Locale pages (en/fa home, services, system, lab, method, proof, about, contact, privacy, explore, mind, mind/flows) | 26 | 200 index,follow | self ✓ | cluster ✓ | EN+FA pairs |
| Insights articles (en+fa) | 34 | 200 | self ✓ | cluster ✓ | BlogPosting + BreadcrumbList JSON-LD |
| Insights hubs, topics, books, methodology, author | ~20 | 200 | self ✓ | cluster ✓ | Blog JSON-Ld on hub |
| Legacy EN-only portfolio (/profile /journey /work/* /notes/* /engineering /open-source /resume) | ~22 | 200 | self ✓ | — (correct: no FA pair) | kept as honest single-locale pages |
| `/meet-majid` | 1 | 200 **noindex,nofollow,noarchive** (meta+header) | — | — | unlisted executive experience, PRESERVED |
| `/` | 1 | 307 → /en | — | — | locale redirect (consistent both vantages) |
| hard-404 probes (/en/profile /fa/profile /en/journey /en/simulator /feed.xml) | 5 | 404 | — | — | no soft-404s |
| robots.txt / sitemap.xml / llms.txt / key file | 4 | 200 | — | — | infrastructure files |

## Verdicts

- Every intended-public route: indexable, self-canonical, localized title+description, correct lang/dir, OG tags. **PASS**.
- `/en/mind` shell was 437 chars unhydrated (CSR shell) → fixed with a server-rendered `.mind-seo` block (now 790+ chars static). **PASS (after fix)**.
- hreflang: present on all locale-paired routes (initial 'missing' finding was an audit-regex case bug — corrected and re-probed). **PASS**.
- `/meet-majid` noindex preserved. **PASS**.

## Indexing status (truth contract)

All URLs: **TECHNICALLY READY / OWNERSHIP BLOCKED / INDEXING PENDING** until GSC+Bing verification (owner action, see 09). Verified crawler ACCESS exists (Googlebot/OAI-SearchBot/ChatGPT-User hits logged), which is NOT index inclusion.
