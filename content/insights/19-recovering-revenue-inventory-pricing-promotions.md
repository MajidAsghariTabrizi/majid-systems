---
id: "19"
slug: recovering-revenue-inventory-pricing-promotions
title: Recovering Revenue Lost Between Inventory, Pricing and Promotions
subtitle: >-
  The revenue that leaks between the shelf, the price tag and the promotion
  calendar is the cheapest growth an FMCG commercial team will ever find —
  and the loop that closes it is agentic by nature.
excerpt: >-
  Where growth actually hides in FMCG: voids, price gaps and unearned
  promotion spend — and a worked, fully-labeled synthetic scenario of an
  integrated agent loop that recovers it.
pillar: applied-industry
tags: [revenue-growth-management, trade-promotions, pricing, oos, fmcg]
author_id: quantiviq-research
published_at: "2026-10-24"
updated_at: "2026-10-24"
status: published
hero_image: /insights/heroes/19.svg
hero_alt: >-
  Conceptual revenue waterfall rising from closed leaks: on-shelf
  availability, price-gap correction and promotion ROI, ending higher than
  the flat baseline.
hero_caption: >-
  Original conceptual artwork: revenue recovered as three closed leaks stack
  on a flat baseline — voids, price gaps, unearned promotion spend.
seo_title: >-
  Recovering Revenue Lost in Inventory, Pricing, Promotions
seo_description: >-
  The three revenue leaks between shelf, price tag and promotion calendar —
  and an integrated agentic loop that closes them, with a fully labeled
  worked scenario.
primary_term: fmcg revenue recovery inventory pricing promotions
secondary_terms: [revenue growth management, trade promotion roi, price gap analysis, on-shelf availability]
source_ids: [mck-2026-cpg, strategyand-trade, retaildetail-2026-cpg, mck-forecast-datalight]
featured: false
discussion_questions:
  - "If we summed our three leaks — void days, price-gap days, promotion spend on underperforming events — what single number would the board see, and is anyone accountable for it?"
  - "Which of the three leaks do we measure with a baseline today, and which do we only discuss anecdotally in QBRs?"
  - "What would it take, technically and politically, to move one promotion decision from post-event analysis to mid-event intervention this quarter?"
related_article_ids: ["17", "18", "06"]
---

The revenue lost between inventory, pricing and promotions in FMCG rarely appears as a line item — which is why it survives budget season after budget season. It is the void that aged from a stockout into a quarter of missing shelf presence; the price gap versus channel and competitor that persisted for six weeks because the reprice needed three approvals; the promotion that settled on shipment data with nobody checking whether it earned its discount. Each leak is individually modest, collectively the difference between flat and growing revenue in low-growth categories. Closing them is the cheapest growth a commercial team will ever find, and the loop that closes it — detect, decide, act, learn — is agentic by nature: fast signals, generated decisions, guarded actions, booked results.

The strategic framing comes from the current research cycle: McKinsey's October 2026 analysis argues the real agentic-AI payoff for CPG companies is growth, with commercial operations — planning, promotions, pricing, retail execution — as the terrain, and the industry's cost-only AI habit as the reason revenue stays unrealized.[[1]](#ref-mck-2026-cpg) European retail coverage of the same analysis made it blunt: FMCG leaves money on the table.[[3]](#ref-retaildetail-2026-cpg) This article is the worked version of that claim: the three leaks specified, an integrated agent loop that closes them, and the measurement discipline that turns recovered revenue into a booked, defensible number.

## Executive Summary

- Three leaks drain FMCG revenue between the shelf, the price tag and the promotion calendar: aging availability voids, persistent price gaps, and promotion spend that never earns its discount.[[1]](#ref-mck-2026-cpg)
- Each leak is a loop problem, not an analytics problem: the signals exist, but the actions they imply die in handoffs — which is precisely the gap agents close.[[1]](#ref-mck-2026-cpg)
- Trade promotion is the anchor leak: the largest discretionary spend in CPG (historically ~15-20%+ of gross revenue) with a documented measurement-discipline gap — a 2013 baseline, dated, but the discipline gap it documents is the persistent part.[[2]](#ref-strategyand-trade)
- The integrated loop — detect from retailer and market signals, decide with guardrailed agent proposals, act through approval gates, learn from outcomes — is the operating pattern; the worked scenario below is illustrative and fully labeled as such.
- Recovery is claimed with [ledger discipline](/en/insights/the-ai-transformation-value-ledger): baselines per leak, attribution stated, confidence graded — the growth argument survives a CFO only when booked.[[4]](#ref-mck-forecast-datalight)

## The three leaks, specified

The three leaks stack on a flat baseline — each closed leak is recovered revenue that never needed a new product, a new market or a new customer:

<figure>
  <svg viewBox="0 0 760 320" role="img" aria-label="Revenue waterfall: a flat baseline bar, then three stacked recovered-leak bars for voids closed, price gaps corrected and promotion spend redirected, ending at a higher total revenue" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
    <text x="380" y="32" text-anchor="middle" font-size="15" font-weight="700" fill="#d7e0ea">Revenue recovered as leaks close (illustrative)</text>
    <line x1="60" y1="270" x2="700" y2="270" stroke="#2a3a4c" stroke-width="2"/>
    <rect x="90" y="190" width="100" height="80" rx="6" fill="#141f2b" stroke="#2a3a4c" stroke-width="2"/>
    <text x="140" y="236" text-anchor="middle" font-size="13" fill="#8fa3b8">baseline</text>
    <text x="140" y="290" text-anchor="middle" font-size="13" fill="#8fa3b8">today</text>
    <rect x="240" y="150" width="100" height="120" rx="6" fill="#0d1420" stroke="#69deb9" stroke-width="2"/>
    <text x="290" y="196" text-anchor="middle" font-size="13" fill="#69deb9">+ voids</text>
    <text x="290" y="216" text-anchor="middle" font-size="13" fill="#69deb9">closed</text>
    <text x="290" y="290" text-anchor="middle" font-size="13" fill="#8fa3b8">leak 1</text>
    <rect x="390" y="110" width="100" height="160" rx="6" fill="#0d1420" stroke="#f5b968" stroke-width="2"/>
    <text x="440" y="156" text-anchor="middle" font-size="13" fill="#f5b968">+ price gaps</text>
    <text x="440" y="176" text-anchor="middle" font-size="13" fill="#f5b968">corrected</text>
    <text x="440" y="290" text-anchor="middle" font-size="13" fill="#8fa3b8">leak 2</text>
    <rect x="540" y="70" width="100" height="200" rx="6" fill="#0d1420" stroke="#a694f7" stroke-width="2"/>
    <text x="590" y="116" text-anchor="middle" font-size="13" fill="#a694f7">+ promotion</text>
    <text x="590" y="136" text-anchor="middle" font-size="13" fill="#a694f7">spend earned</text>
    <text x="590" y="290" text-anchor="middle" font-size="13" fill="#8fa3b8">leak 3</text>
    <path d="M140,190 L290,150 L440,110 L590,70" fill="none" stroke="#d7e0ea" stroke-width="2" stroke-dasharray="5 6"/>
    <text x="380" y="308" text-anchor="middle" font-size="13" fill="#8fa3b8">each closed leak compounds on the last — none required new products or new customers</text>
  </svg>
  <figcaption>Figure 1 — The recovery waterfall: closing each leak stacks revenue on the unchanged baseline. The heights are illustrative; the mechanism — detect, decide, act, learn — is the subject of this article.</figcaption>
</figure>

**Leak one: voids that age.** A stockout that lasts three days is a logistics event; a distribution void that lasts three months is a revenue decision nobody made. The leak is the aging: every day a void persists in a store where the SKU earns its shelf is lost velocity compounding quietly. The signals exist (retailer availability data, image recognition, field audits); what is missing is the prioritized action — which voids, which stores, in what order, based on revenue at stake — pushed to whoever can fix it, with the fix tracked to closure.

**Leak two: price gaps that persist.** Price positioning versus channel and competitor drifts constantly; the gap detection that runs monthly finds in week four what a daily signal would find in week one. The leak is persistence: every week a gap stands beyond policy is margin or share conceded without a decision being made. The fix is not faster humans alone; it is guardrailed repricing proposals — within encoded policy floors, ceilings and move limits — waiting at a gate for a one-look approval.

**Leak three: promotions that never earn their spend.** The trade-spend anchor: Strategy&'s cross-client analysis (2013 — a dated baseline; current averages differ by market and category, but the documented discipline gap is the point) found trade promotion among CPG's largest discretionary spends at commonly ~15-20%+ of gross revenue, most promotions historically failing to break even, and post-event analysis rare.[[2]](#ref-strategyand-trade) A decade of RGM analytics improved the rearview mirror; the leak persists because intervention is manual — the event is designed, funded, executed and settled with the analysis arriving after the money moved.

## Why the loop is agentic by nature

All three leaks share one structure: the signal exists, the analysis is possible, and the action — the reprice, the void chase, the mid-event correction — dies in the gap between the analyst who sees it and the process that could act on it. That is the definition of a loop problem, and loops are what agents are: systems that detect, decide within guardrails, and act under supervision, on a cadence the market sets rather than a calendar the organization sets.[[1]](#ref-mck-2026-cpg)

The loop has four stations, and this publication has built each in depth: **detect** — retailer POS and availability data, market pricing feeds, promotion sell-through, per the [signal architecture](/en/insights/ai-native-supply-chain-decision-intelligence); **decide** — agent proposals with the trade-offs quantified, inside guardrails encoded from commercial policy, per the [autonomy matrix](/en/insights/human-in-the-loop-vs-human-on-the-loop); **act** — approval gates where money moves, autonomous execution where policy already permits, per the [governance stack](/en/insights/agentic-ai-governance-by-design); **learn** — outcomes booked, overrides logged, golden sets refreshed, per the [evaluation framework](/en/insights/ai-agent-evaluation-for-business-outcomes).

## A worked scenario — illustrative synthetic, labeled and stated

> **This scenario is an illustrative synthetic scenario.** It is a composite constructed for this article to demonstrate the loop's mechanics and arithmetic. It is not a client case, not a specific company, and its numbers are stated assumptions — chosen to be realistic for a mid-sized FMCG supplier, not measured from any real one. Every figure below follows from the assumptions listed; the point is the mechanism, not the amounts.

**Setup.** A mid-sized FMCG supplier — 120 active SKUs, three channels (modern grocery, discount, e-commerce), revenue ~$400M — runs the three leaks at these stated baseline rates, measured from its own data over four quarters: void-aging at an average of 34 days for the worst decile of SKUs; price-gap persistence averaging 23 days beyond policy for the 15% of SKUs tracked as gap-prone; and promotion spend of $28M/year (7% of revenue) with post-event analysis covering the top 20 events only.

**The loop, over two quarters, one category (30 SKUs, ~$60M revenue):**

- **Detect.** Availability agents ingest retailer data daily; 410 store-SKU voids flagged, revenue-weighted; pricing agents ingest channel and competitor feeds daily; 9 persistent gaps beyond policy flagged. Promotion agents track the category's two live events against baseline sell-through.
- **Decide.** Void actions prioritized into the field team's queue by revenue at stake; the top 60 voids (62% of at-stake revenue) proposed for action this week. Repricing proposals generated within guardrails for the 9 gaps: 6 within authority bands, 3 queued for the pricing lead with the elasticity implication attached. Mid-event, one promotion shows sell-through 31% below plan at week three; the agent drafts two interventions (reallocation of the remaining spend to the performing retailer channels; targeted price support) with the arithmetic for each.
- **Act.** Field actions executed on the 60 voids; 41 close within 10 days. The 6 in-band reprices execute; the pricing lead approves 2 of 3 queued within 48 hours. The commercial lead takes the spend-reallocation option; settlement validates on performance data, not shipment alone.
- **Learn.** The quarter's bookings, against the stated baselines: void recovery ~$610k annualized (41 of 60 top voids closed, at-stake velocity restored); price-gap correction ~$340k annualized (8 of 9 gaps closed at a mean 14 days faster than baseline); promotion intervention saves ~$180k of the underperforming event's remaining spend and lifts its ROI to near-plan. Total booked, confidence-graded B on the [evidence ladder](/en/insights/measuring-ai-value-beyond-productivity) (before/after with trend adjustment, no randomized holdout in the retailer relationships): **~$1.1M annualized on a $60M category — roughly 1.9 points of revenue**.

The scenario's honest annotations: recovery rates are assumptions (void closure at 68%, gap days cut 60%); the attribution is before/after, not holdout — a B-grade claim, stated as such; and the $1.1M excludes the compounding effect on the next planning cycle, which the ledger would book separately as the capability matures. Any real deployment would start smaller (one channel, one event, per the [mission bar](/en/insights/prioritizing-high-value-ai-missions)) and book its own numbers, which is precisely the discipline the scenario exists to demonstrate.

## The measurement discipline that makes recovery real

The scenario's credibility rests entirely on the measurement machinery around it, and that machinery is not synthetic — it is the publication's standing framework. Baselines per leak, captured before the loop ships. Bookings with attribution method and confidence grade, in the [value ledger](/en/insights/the-ai-transformation-value-ledger). Holdout design where the retailer relationship allows it; honest before/after where it does not. And the forecast layer that the detection agents run on — including, where category history is thin, the external-signal forecasting that McKinsey's data-light research validates at 20-50% error-reduction ranges (benchmarks, not guarantees).[[4]](#ref-mck-forecast-datalight)

This is also where the growth argument becomes a board argument: McKinsey's CPG analysis says the payoff is growth; the ledger says *this much, from these leaks, at this confidence*.[[1]](#ref-mck-2026-cpg) The second sentence funds the next mission; the first alone funds a slide. RetailDetail's coverage of the same research noted that the sector's restraint is a choice — cost programs are measured, so they get funded; revenue loops were unmeasured, so they stayed exotic.[[3]](#ref-retaildetail-2026-cpg) Measurement is the unlock.

## Key Takeaways

- The three leaks — aging voids, persistent price gaps, unearned promotion spend — are loop problems: signals exist, actions die in handoffs; agents are loop-closers.[[1]](#ref-mck-2026-cpg)
- Trade promotion anchors the opportunity: largest discretionary spend, documented measurement gap — dated baseline, persistent discipline problem.[[2]](#ref-strategyand-trade)
- The integrated loop (detect, decide, act, learn) reuses the publication's operating framework end to end — supervision matrix, governance gates, evaluation cycle, value ledger.
- The worked scenario is illustrative synthetic, fully labeled, assumptions stated: ~1.9 points of category revenue from the three leaks at B-grade confidence — the mechanism, not a promise.
- Recovery becomes fundable when booked: baselines, attribution, confidence grades — measurement is the unlock for the growth budget.[[3]](#ref-retaildetail-2026-cpg)

## What Leaders Should Do Next

1. **Baseline the three leaks this quarter, before any agent ships.** (RGM + finance, first 30 days.) Void-aging curves, price-gap persistence, promotion ROI coverage — four quarters of history, per category; the baselines are the mission's measurement floor and its before-picture.
2. **Run one void-chase mission first.** (Commercial lead + retail team, days 30-60.) Lowest risk, fastest feedback: daily availability signals, revenue-weighted prioritization, field execution tracked to closure — booked against the void baseline within one quarter.
3. **Encode pricing policy as guardrails, then unleash proposals within them.** (Pricing lead + governance partner, days 30-90.) Floors, ceilings, move limits, channel constraints — written as execution-layer constraints; in-band reprices autonomous, out-of-band at the gate with elasticity attached.[[1]](#ref-mck-2026-cpg)
4. **Take one live promotion to mid-event intervention.** (Commercial lead, next event cycle.) The settlement rule (performance, not shipment), the mid-event flag, the two-option intervention draft — the single highest-leverage political and technical step in the whole program.[[2]](#ref-strategyand-trade)
5. **Book the results in the ledger, confidence-graded, and fund the next category from the arithmetic.** (CFO office, day 90.) The worked-scenario discipline applied with real numbers: attribution stated, grades honest — the growth budget follows the bookings, quarter after quarter.[[4]](#ref-mck-forecast-datalight)

## References

1. <a id="ref-mck-2026-cpg"></a>**McKinsey & Company** — *For CPG companies, agentic AI's real payoff is growth*, Oct 9, 2026. [mckinsey.com](https://www.mckinsey.com/industries/consumer-packaged-goods/our-insights/for-cpg-companies-agentic-ais-real-payoff-is-growth) — growth payoff across commercial operations; cost-only AI critique.
2. <a id="ref-strategyand-trade"></a>**Strategy& (PwC)** — *Boosting the Bottom Line Through Trade Promotion Management*, 2013. [strategyand.pwc.com](https://www.strategyand.pwc.com/gx/en/insights/2002-2013/boosting-the-bottom-line/strategyand-boosting-the-bottom.pdf) — trade promotion ~15-20%+ of gross revenue; weak measurement discipline; dated (2013) baseline — use for the discipline gap, not current benchmarks.
3. <a id="ref-retaildetail-2026-cpg"></a>**RetailDetail** — *FMCG laat omzet liggen: AI kan méér doen dan kosten besparen* (dossier AI & retail), Oct 2026. [retaildetail.be](https://www.retaildetail.be/nl/news/retaildossier/dossier-ai-retail-fmcg-laat-omzet-liggen-ai-kan-meer-doen-dan-kosten-besparen/) — independent European coverage of the McKinsey CPG analysis; secondary trade press.
4. <a id="ref-mck-forecast-datalight"></a>**McKinsey & Company (Operations)** — *AI-driven operations forecasting in data-light environments*, 2021 (research series). [mckinsey.com](https://www.mckinsey.com/~/media/mckinsey/business%20functions/operations/our%20insights/ai%20driven%20operations%20forecasting%20in%20data%20light%20environments/ai-driven-operations-forecasting-in-data-light-environments_vf.pdf) — 20-50% forecast-error reduction benchmarks including data-light contexts; consultancy benchmark range.
