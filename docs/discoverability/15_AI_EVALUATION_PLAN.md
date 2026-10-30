# 15 — AI Visibility Evaluation Plan (operator-run)

Per the mission truth contract, ChatGPT/Perplexity 'recommendations' are **never claimed without recorded transcripts**.

Protocol (repeatable, denominators explicit):

1. Panel of N=20 questions (10 brand: 'Quantiviq', 'Majid Asghari Tabrizi', 'quantiviq.xyz', Quantiviq Mind…; 10 non-brand topical: 'AI adoption vs transformation', 'cost of enterprise AI agents', 'AI-native organization design'…).
2. Ask each in a fresh logged-out chat (ChatGPT + Perplexity); record: cited any quantiviq.xyz URL? which URL? rank position among cited sources?
3. Metrics: `ai_citation_rate = cited_answers / 20` per engine; `ai_url_coverage = distinct_quantiviq_urls_cited / 101`.
4. Re-run monthly; after content changes.

Current status: **NOT MEASURED — operator account required.** Infrastructure is ready (llms.txt, OAI-SearchBot access, clean crawlable corpus).
