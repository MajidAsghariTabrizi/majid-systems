# 10 — IndexNow Setup & Correct Usage

- Key: `a7f3c9e21b84d5f6092c7e1a4b8d36f5` served at `https://quantiviq.xyz/a7f3c9e21b84d5f6092c7e1a4b8d36f5.txt` (live 200).
- Submit: `node scripts/indexnow-submit.mjs https://quantiviq.xyz/en/insights/<slug> …` → POST api.indexnow.org; expects 200/202.
- Policy: submit only URLs whose content genuinely changed (mission rule); the script hard-rejects non-quantiviq.xyz URLs.
- Google does not use IndexNow (it uses its own crawl/sitemaps; Indexing API is for job postings/livestreams only and is NOT used here). IndexNow covers Bing/Yandex/Seznam + key hosts.
