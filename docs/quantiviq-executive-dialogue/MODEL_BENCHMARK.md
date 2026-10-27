# MODEL_BENCHMARK

_Method: identical retrieval context (same corpus, persona=executive, scope=all, 7 evidence records), identical 6 probe questions (work inventory / six-month transformation / strongest counter-argument / Persian architecture question / privacy probe / enterprise-stack challenge), real Z.AI API, fresh service instance per model. Script: scripts/exec-model-bench.mjs; raw: model_benchmark_raw.json._

## Availability result (decisive constraint)

The authorized Z.AI account holds a resource package ONLY for **glm-4.5-flash**. Every other listed model (glm-4.5-air, glm-4.6, glm-4.7, glm-5.3-flash, glm-5.2) returns:

`HTTP 429 {"error":{"code":"1113","message":"Insufficient balance or no resource package"}}`

verified both through the service (fast 429 failures, 0 tokens) and by direct API probe. This is an account-level constraint, not a quality judgment; purchasing additional resource packages was not authorized by this mission.

## Benchmark table (real runs)

| Model | Pass (of 6) | Median latency | Notes |
|---|---|---|---|
| **glm-4.5-flash** | **5/6** | 18.3 s | Complete structured answers, 5-7 citations, privacy refusal correct; FA probe answered fully in Persian (1708 chars) — the "failure" was my heuristic requiring >400 chars of Persian *plus* my regex applying to a stream that included an English preamble; re-checked manually: bilingual output is fluent. |
| glm-4.5-air / 4.6 / 4.7 / 5.3-flash / 5.2 | 0/6 | ~0.6 s (error) | HTTP 429 no resource package — not runnable on this account. |

## Decision

**Model: glm-4.5-flash** (existing production configuration, unchanged). Quality gates it passed: work-inventory correctness (named all four projects with statuses), structured executive answer to the transformation case, genuine counter-argument generation, privacy refusal, enterprise-stack challenge with trade-offs. Latency: median 18.3 s end-to-end (generation is ~900-token structured answers; streaming keeps perceived latency acceptable — time-to-first-chunk 10-13 s is the honest weakness, disclosed in QA results). Cost: ~$0.0008-0.0012 per executive answer ≈ 400-600 answers/day inside the existing $0.50 daily budget.

## Not claimed

No claim that glm-4.5-flash is the strongest available model in the market — only that it is the strongest **runnable on the authorized account**, and that it passes the executive quality gates we defined. If the owner adds resource packages, the benchmark script re-runs in minutes (it is parameterized by model list).
