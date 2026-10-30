# 08 — robots.txt & Sitemap Changes (D3/D4)

## robots.txt (deployed, live)

- `*` group: allow /, disallow `/.next/ /api/internal/ /api/public-mind/ /smart-trader/ /api/lead`.
- Explicit AI-crawler groups (each an independent decision): **OAI-SearchBot allow**, **ChatGPT-User allow**, GPTBot allow, ClaudeBot allow.
- `/meet-majid` is deliberately NOT in robots.txt — a Disallow would hide its noindex meta from crawlers; meta robots + X-Robots-Tag enforce exclusion (crawlable but never indexed). This is also asserted by the repo's own test suite ('no public page links to /meet-majid').
- `Host:` + `Sitemap:` lines present.

## Sitemap

- 101 URLs; bilingual clusters with en/fa/x-default alternates for locale-paired routes; legacy EN-only portfolio routes (work/notes/journey/profile/open-source/engineering/resume) correctly have no hreflang (no FA counterpart exists).
- `lastModified`: articles use real `updated_at`; static routes use build-time `now` — flagged as minor debt (G6 note); real per-route lastmod would require a content-git map (owner can request as follow-up).

## Corrections logged (honesty)

- Initial probe reported 'zero hreflang in HTML' — that was an audit-tool bug (React emits `hrefLang`, match is case-insensitive). Re-probe: 82/104 html-200 pages carry hreflang clusters; the 22 without are the EN-only legacy pages + the noindex unlisted route, which is CORRECT.
