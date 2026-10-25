# INSIGHTS MISSION — RESUME STATE (for context compaction)

> ## ✅ MISSION COMPLETE (2026-10-24) — nothing left to do
>
> The mission finished successfully. Final state, all verified:
> - 20/20 articles written, validated (`insights-validate.mjs` ALL PASS), typecheck + build green, 103/103 existing tests green, QA suite `insights-check.mjs` 230/230, Lighthouse 97 perf / 100 SEO (index + flagship article).
> - Deployed: commit `d6c793e` (insights) → merge `2ad73ae` → report commit `233ce53` on main, pushed to origin. Live gates: 20/20 article URLs 200 with BlogPosting + BreadcrumbList + canonical + OG; RSS 20 items; JSON feed 20; sitemap + llms.txt live.
> - Receipt: PASS at `C:\Users\ma.asghari\.dsh\var\verified-completion\goal-6d130ee3-6d49-47fc-9ceb-559d4fe69f4e.json` (verify-cmd: `node scripts/insights-validate.mjs`).
> - Final report: `QUANTIVIQ_INSIGHTS_REPORT.md` (committed).
> - **One administrative item remains:** `update_goal complete` on goal `goal-6d130ee3-6d49-47fc-9ceb-559d4fe69f4e` was rejected ("requires a direct human turn") because this session ran as an autonomous continuation. On the next direct human turn, call `get_goal` then `update_goal action=complete` with the exact id/revision. Rollback if ever needed: `git revert -m 1 2ad73ae` on main, push, re-deploy.
>
> The rest of this file is historical drafting state, kept for reference.

Mission: BUILD QUANTIQ INSIGHTS — 20-article executive research publication on quantiviq.xyz/en.
Goal id: `goal-6d130ee3-6d49-47fc-9ceb-559d4fe69f4e`. Branch: `insights` (from main @90a46c0).
Baseline: `docs/INSIGHTS_BASELINE.md`. Known-good pre-insights deploy: `237a29d`.

## DONE (do not redo)
- Research ledger: `content/insights/sources.json` (23 sources, accessed 2026-10-23) + `authors.json`.
- Authoring contract: `content/insights/TEMPLATE.md` (read before writing any article).
- Content layer: `src/content/insights/index.ts` (loader, marked+gray-matter), `ui.ts` (EN/FA), `src/components/InsightsJsonLd.tsx`.
- Pages (typecheck+build GREEN with empty content): `[locale]/insights/page.tsx` (EN+FA), `[locale]/insights/[slug]/page.tsx` (EN only, FA 404, `dynamicParams=false`), `topics/[topic]`, `methodology`, `author`, `app/insights.xml/route.ts` (RSS), `app/insights.json/route.ts`.
- SEO: `src/app/sitemap.ts` updated (articles with real dates + hreflang for index/methodology/author). Nav key `insights` added to `i18n/en.ts`, `i18n/fa.ts`, `Header.tsx` (first position).
- Assets: 20 hero SVGs `public/insights/heroes/<id>.svg` + 20 OG PNGs `public/og/insights/<id>.png` (generators: `scripts/insights-heroes.mjs`, `scripts/insights-og.mjs`; titles `captures-v5/og-titles.json`).
- CSS: INSIGHTS block appended to `src/app/globals.css` (ins-* classes).
- Validator: `scripts/insights-validate.mjs` (run `node scripts/insights-validate.mjs --fix` after all 20 exist — auto-fills ledger usage).

## DRAFTING STATUS (subagent infra flaky — turns killed mid-run ~50%; primary agent drafts directly with `write` tool)
- 01 ai-adoption-is-not-ai-transformation.md — WRITTEN (subagent, 24.6KB)
- Subagents possibly still running for: 03, 04, 05, 06, 12 — CHECK `content/insights/*.md` BEFORE writing each to avoid clobbering.
- Remaining to write (primary agent): 02, 07, 08, 09, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20 (minus any subagent deliveries).

## ARTICLE PARAMETERS (fixed)
- All: `published_at: "2026-10-24"`, `updated_at: "2026-10-24"`, `author_id: quantiviq-research`, `status: published`, `hero_image: /insights/heroes/<id>.svg`, `featured: false` (ONLY article 20 true).
- Pillars: 01-04 transformation-strategy | 05-08 economics-value | 09-12 ai-native-operations | 13-16 trust-governance | 17-20 applied-industry. Exactly 4 each (validator).
- Slugs (exact): 02 the-agentic-mission-factory, 03 from-org-charts-to-orchestration-charts, 04 who-owns-ai-transformation, 05 measuring-ai-value-beyond-productivity, 06 the-ai-transformation-value-ledger, 07 the-real-cost-of-enterprise-ai-agents, 08 prioritizing-high-value-ai-missions, 09 the-ai-native-product-operating-model, 10 designing-human-and-ai-product-teams, 11 from-ai-prototype-to-production, 12 the-90-day-ai-transformation-roadmap, 13 human-in-the-loop-vs-human-on-the-loop, 14 ai-agent-evaluation-for-business-outcomes, 15 agentic-ai-governance-by-design, 16 why-ai-transformation-fails-without-change-management, 17 agentic-ai-for-fmcg-commercial-operations, 18 ai-native-supply-chain-decision-intelligence, 19 recovering-revenue-inventory-pricing-promotions, 20 inside-an-ai-native-transformation-mission.
- Validator hard rules: ≥3 internal links `/en/...` per article; every source_id cited inline `(#ref-<id>)` + anchored `id="ref-<id>"` in References; ≥1 `<figure>`+`<svg>`; seo_title 15-62ch; seo_description 70-160ch; 2-4 discussion_questions; related_article_ids exist; word count 1800-4200 (target 2300-3200); unique primary_term per article; external links must be ledger URLs only.

## RELATED-ARTICLE MAP (frontmatter related_article_ids)
01→[02,05,16] 02→[01,08,20] 03→[04,10,20] 04→[03,06,15] 05→[01,06,07] 06→[05,07,14] 07→[05,06,08] 08→[02,06,12] 09→[10,11,03] 10→[09,13,03] 11→[09,14,12] 12→[08,11,20] 13→[14,15,10] 14→[13,06,11] 15→[13,04,16] 16→[01,12,10] 17→[18,19,05] 18→[17,19,14] 19→[17,18,06] 20→[01,02,12]

## SOURCE MAP (primary sources per article; details in sources.json)
01 mck-2026-org,mck-soai-2026,mit-nanda-2025,dellacqua-2023,gartner-2025-agentic | 02 mck-2026-org,mit-nanda-2025,bcg-2026-formula,msft-wti-2025,deloitte-google-agentic-2026 | 03 mck-2026-org,brynjolfsson-2023,msft-wti-2025 | 04 techtarget-2026-cio,bcg-2026-econ,mck-soai-2026,mck-2026-org | 05 mck-soai-2026,deloitte-roi-2026,brynjolfsson-2023,dellacqua-2023,bcg-2026-formula | 06 bcg-2026-formula,deloitte-roi-2026,mck-soai-2026,gartner-2025-agentic,mit-nanda-2025 | 07 bcg-2026-econ,gartner-2025-agentic,gartner-agent-reality,deloitte-genai-q4 | 08 mit-nanda-2025,gartner-2025-agentic,bcg-2026-formula,dellacqua-2023,mck-2026-org | 09 mck-2026-org,deloitte-google-agentic-2026,dellacqua-2023,msft-wti-2025 | 10 dellacqua-2023,brynjolfsson-2023,msft-wti-2025,mck-2026-org | 11 mit-nanda-2025,gartner-2025-agentic,gartner-agent-reality,deloitte-google-agentic-2026 | 12 mck-2026-org,bcg-2026-formula,gartner-2025-agentic,prosci-cm,mck-soai-2026 | 13 metr-2025,gartner-agent-reality,dellacqua-2023,nist-airmf-2023 | 14 bcg-2026-formula,gartner-agent-reality,metr-2025,nist-airmf-2023 | 15 nist-airmf-2023,eu-ai-act,gartner-2025-agentic,validant-2026-bcg | 16 prosci-cm,mck-2026-org,mit-nanda-2025,msft-wti-2025 | 17 mck-2026-cpg,retaildetail-2026-cpg,strategyand-trade,bcg-2026-formula | 18 mck-forecast-datalight,mck-2026-cpg,metr-2025,gartner-agent-reality | 19 mck-2026-cpg,strategyand-trade,retaildetail-2026-cpg,mck-forecast-datalight | 20 mck-2026-org,bcg-2026-formula,mck-soai-2026,nist-airmf-2023,prosci-cm

## INTERNAL LINK RULE
Use exact slugs above; prefer links to the related articles + optionally /en/system, /en/method, /en/proof, /en/services. ≥3 per article.

## AFTER ALL 20 EXIST
1. `node scripts/insights-validate.mjs --fix` → must print ALL PASS.
2. `npm run typecheck && npm run build` (must stay green).
3. Generate llms.txt: `node scripts/gen-llms.mjs` (imports TS loader — if node fails on .ts import, hand-write public/llms.txt from article list).
4. QA: kill port 3219, `npx next start -H 127.0.0.1 -p 3219` background; write/run `scripts/insights-check.mjs` playwright suite (routes 200/404, SSR content, sitemap/RSS/JSON-LD/canonical, internal links resolve, images exist, FA index notice, OG tags) + screenshots desktop/mobile EN/FA + Lighthouse insights pages (≥90 SEO+perf target).
5. Run existing suites for regressions (npm test, audit-check etc.).
6. Commit (explicit paths — NEVER `git add -A`; leave captures-lab/prodaudit-results.json uncommitted), merge insights→main, deploy: `$env:SSH_PASSWORD=(Get-Content "$env:TEMP\.qsession_pw" -Raw).Trim(); python scripts/public_deploy.py` (exit 1 + "PUBLIC DEPLOY COMPLETE" = success), drift probe, live gates.
7. Final report `QUANTIVIQ_INSIGHTS_REPORT.md` (EXECUTIVE VERDICT + 20 URLs + source coverage + SEO + perf + limitations) + receipt: `python D:\PycharmProjects\pythonProject\Benchmark\harness-evolve\issue_receipt.py goal-6d130ee3-6d49-47fc-9ceb-559d4fe69f4e --verify-cmd "..." --evidence f1 f2 f3` (ONE --evidence flag, all files after it), then update_goal complete.

## ARTICLE-SPEC NOTES (16-20, specs not yet sent)
- 16: change management as the real bottleneck; Prosci sponsorship+structure evidence; MIT failure causes; adoption = product problem; manager enablement; link 01, 12, 10.
- 17: FMCG commercial operations (planning/promotions/pricing/retail execution) — McKinsey CPG growth payoff; trade-promotion historical baseline (Strategy& 2013, dated); agents across commercial cycle; link 18, 19, 05.
- 18: supply chain decision intelligence — AI forecasting error reduction 20-50% (McKinsey-reported range, caveat), exception-centric ops, data-light environments, human override design; link 17, 19, 14.
- 19: revenue leakage between inventory/pricing/promotions — needs PROMINENT illustrative synthetic scenario label (worked FMCG retailer example with stated assumptions); trade-spend scale; integrated agents closing the loop; link 17, 18, 06.
- 20: Quantiviq's reference mission blueprint — ORIGINAL model (12-week mission lifecycle, gates, artifacts, roles); explicitly labeled as Quantiviq's reference model, no fake client claims; featured: true; link 01, 02, 12, 15 + /en/system + /en/proof.
