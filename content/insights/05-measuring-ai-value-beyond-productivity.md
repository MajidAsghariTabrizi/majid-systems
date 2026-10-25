---
id: "05"
slug: measuring-ai-value-beyond-productivity
title: Measuring AI Value Beyond Productivity
subtitle: >-
  Productivity is the input; AI value is measured in seven outcome layers, each needing its own baseline, attribution method, and confidence level.
excerpt: >-
  80% of employees report AI productivity gains; only about 6% of companies see significant financial gains. Here is the seven-layer framework that closes the gap.
pillar: economics-value
tags: [ai-roi, value-measurement, unit-economics, enterprise-ai]
author_id: quantiviq-research
published_at: "2026-10-24"
updated_at: "2026-10-24"
status: published
hero_image: /insights/heroes/05.svg
hero_alt: >-
  Value waterfall flowing from a productivity input metric into seven AI outcome layers
hero_caption: >-
  Original diagram: time saved enters as an input metric and converts, through baselines and attribution, into seven measurable outcome layers.
seo_title: >-
  Measuring AI Value Beyond Productivity
seo_description: >-
  A CFO-ready framework for measuring AI value in seven outcome layers, with the baselines, attribution methods, and evidence standards boards require.
primary_term: measuring ai value
secondary_terms: [ai roi framework, ai value beyond productivity, ebit ai impact, ai unit economics]
source_ids: [mck-soai-2026, deloitte-roi-2026, brynjolfsson-2023, dellacqua-2023, bcg-2026-formula]
featured: false
discussion_questions:
  - "Which of the seven value layers do we measure today with a credible baseline and counterfactual — and which are we reporting on faith?"
  - "What would a 10% matched holdout in our next AI rollout cost, and which decision would the resulting evidence change?"
  - "How many AI value claims in our last board update would survive the evidence-quality ladder, and at which rung does each sit?"
related_article_ids: ["01", "06", "07"]
---

Productivity is an input metric, not a value metric. Hours saved, tasks accelerated, and adoption rates prove that AI is being used; they say nothing about whether the business is better off. The 2026 survey evidence makes the gap hard to ignore: roughly 80% of employees report productivity gains from AI, but only about 37% of companies report revenue improvement, and only about 6% report significant financial gains[[1]](#ref-mck-soai-2026). Those figures come from secondary coverage of McKinsey's State of AI survey, so treat them as directional magnitudes rather than precise benchmarks — but the shape is consistent across every serious dataset: individual productivity is up, enterprise value mostly is not.

The reason is definitional, not technical. AI value shows up in seven outcome layers — EBIT, revenue, gross margin, cost-to-serve, cycle time, customer impact, and unit economics — and each layer needs its own baseline, its own attribution method, and its own confidence level. Productivity belongs to none of the seven; it feeds them. An executive who reports only time saved is reporting an input to value and calling it value.

The remedy is a measurement contract, definable in two sentences: a value claim is defensible when it states a baseline (what the metric would have done without AI), a counterfactual (the comparison group or projected trend standing in for "no AI"), an attribution method (the design that assigns the measured delta to AI rather than to everything else changing at once), and a confidence level (the class of evidence behind the claim). A number that cannot answer all four is not a value measurement; it is a usage statistic with better branding.

## Executive Summary

- Productivity metrics are input measures: they cannot defend an AI budget because they never touch the P&L lines where boards judge value.
- The measurement gap is visible at scale: in 2026 survey coverage, roughly 80% of employees report AI productivity gains while only about 37% of companies report revenue improvement and about 6% report significant financial gains[[1]](#ref-mck-soai-2026).
- AI value lands in seven outcome layers — EBIT, revenue, gross margin, cost-to-serve, cycle time, customer impact, and unit economics — and each needs its own baseline, attribution method, and stated confidence.
- Evidence quality is a ladder, not a binary: the strongest enterprise field evidence available (5,179 support agents[[3]](#ref-brynjolfsson-2023); 758 consultants[[4]](#ref-dellacqua-2023)) came from comparison designs, not surveys.
- Attribution without a counterfactual is self-deception; matched holdouts and phased rollouts are affordable, and systematic control of AI agents is associated with roughly three times the reported value[[5]](#ref-bcg-2026-formula).
- Deloitte's 2026 analysis reaches the same verdict: rising investment with elusive returns is a measurement failure, and baselines, attribution, and benefits tracking separate the programs that can prove value from those that cannot[[2]](#ref-deloitte-roi-2026).

## The Productivity Trap

The trap has a mechanical cause: time saved is capacity, and capacity becomes value only when something downstream changes — more output sold, lower cost paid, shorter cycle, happier customer, or a redeployed resource. If none of those move, the saved time is simply absorbed. Three failure modes account for most of the distance between a green productivity dashboard and a flat P&L.

- **Absorbed capacity.** Freed hours disappear into existing backlogs and "other duties." No cost line moves, no headcount is redeployed, and the saving never compounds into anything an accountant can see.
- **Unchanged throughput.** Many processes are constrained by demand, approvals, or handoffs rather than task speed. Accelerating a step that is not the constraint moves end-to-end throughput by nothing.
- **Unmeasured quality.** Quality effects are real but invisible until someone measures them. In the Dell'Acqua et al. field experiment, consultants with AI produced more than 40% higher-quality work than controls on tasks inside the AI's capability frontier[[4]](#ref-dellacqua-2023) — an effect no time-saved dashboard would surface, and one that quietly reverses outside that frontier.

Measure only the input, and the macro numbers are the mirror image. In McKinsey's 2026 State of AI survey — as reported by ET CIO, ANI, and Jornal Económico, since the primary survey page was not directly retrievable — roughly 80% of employees report productivity gains from AI, while only about 37% of companies report revenue improvement and only about 6% report significant financial gains[[1]](#ref-mck-soai-2026). Deloitte names the same pattern from the budget side: AI investment keeps rising while measurable returns stay concentrated in a minority of programs — the paradox of rising investment and elusive returns[[2]](#ref-deloitte-roi-2026). Deloitte's diagnosis is the operating thesis of this article: disciplined measurement — baselines, attribution, benefits tracking — is what separates programs that report value from programs that cannot.

Usage dashboards compound the problem because they measure adoption, and adoption is not transformation: as the [AI adoption vs AI transformation analysis](/en/insights/ai-adoption-is-not-ai-transformation) argues, deploying tools and rebuilding how the organization works are different achievements. A transformation office can post excellent adoption statistics for quarters while all seven outcome layers stay untouched.

## The Seven Outcome Layers

A defensible AI value claim names its layer. The seven below cover where AI value can realistically land; each has a natural metric, a typical attribution method, and a ceiling on the confidence an honest analyst can claim. The confidence column deliberately speaks the language of the evidence ladder developed in the next section.

| Layer | Example metric | Where AI shows up | Typical attribution method | Confidence you can claim |
|---|---|---|---|---|
| EBIT | Net P&L delta vs plan or counterfactual | Cross-layer: margin, cost, cycle effects netted | Driver-tree decomposition closed by finance | Directional until finance signs the bridge |
| Revenue | Incremental conversion, win rate, basket size | Recommendations, pricing, lead scoring, content generation | A/B test or matched segment holdout | High under randomization; directional otherwise |
| Gross margin | COGS per unit; scrap and yield rates | Demand forecasting, defect detection, procurement support | Seasonality-adjusted before/after vs comparable lines | Moderate with clean baselines |
| Cost-to-serve | Cost per ticket, per order, per customer | Service assistants, document processing, back-office automation | Holdout queues or staggered teams vs matched teams | Moderate to high with holdouts |
| Cycle time | Order-to-cash days; approval lead time | Triage and routing agents, document extraction | Process-mining timestamps vs a parallel process | Moderate; watch for handoff shifts |
| Customer impact | NPS, retention, first-contact resolution, error rate | Resolution assistants, personalization, proactive detection | Randomized exposure or matched cohorts, lagged read | High under experiments; lagging otherwise |
| Unit economics | Contribution margin per order, ticket, transaction | All of the above, netted per unit of work | Finance-led unit P&L with agreed AI cost allocation | Directional until cost allocation is agreed |

### EBIT: the bridge finance has to close

EBIT is where the layers meet, and the bridge from productivity to EBIT is where most AI value quietly dies. Consider a shared-services organization of 2,000 FTE at a fully loaded $70,000 per FTE-year — an illustrative synthetic scenario (assumptions stated in-line), not a specific company. The annual cost pool is $140M. An AI assistant covers 40% of the work and saves 20% of task time in scope. Input value: 0.20 × 0.40 × $140M = $11.2M of annualized capacity. What the P&L records depends entirely on conversion. With volumes and headcount unchanged, captured value on day one is $0 — the $11.2M is absorbed capacity. Assume 60% of freed capacity is redeployable within the year, and about half of redeployed hours convert into cashable savings on overtime and contractors: captured value is $11.2M × 0.60 × 0.50 ≈ $3.4M, a conversion of roughly 30% from input value to P&L. That conversion ratio — not the 20% time saving — is the number a CFO can defend, and it only exists if someone builds the bridge.

### Unit economics: the layer that integrates the rest

Contribution margin per unit of work — per order, ticket, or transaction — is the CFO's integrator. It is scale-free, it exposes mix effects that averages hide, and it forces AI's own running costs (licenses, inference, human review labor) inside the unit cost instead of letting them hide in a technology budget. A program can cut handling time 20% and still worsen unit economics once review labor and inference costs land per ticket; the analysis of [the real cost of enterprise AI agents](/en/insights/the-real-cost-of-enterprise-ai-agents) details why gross value claims fail this test. The reporting rule is blunt: unit economics net of AI cost, or no claim.

### Customer impact: the layer that leads revenue

Customer metrics lead revenue: NPS, retention, first-contact resolution, and error rates move before the sales line does, which makes them the earliest defensible signal of revenue-layer value. They also carry the clearest measured quality effect in the field evidence — the >40% quality advantage for AI-assisted consultants on in-frontier tasks[[4]](#ref-dellacqua-2023) is a customer-impact result even though the study measured task quality, not customers. Read such signals with a lag and a confirmation plan: leading indicators justify continued investment, and revenue confirmation closes the loop.

## The Evidence Quality Ladder

The credibility of a value claim is a property of its evidence design, not of the size of its number. Enterprises work with four rungs, each adding a stronger counterfactual at higher cost and design effort.

<figure>
  <svg viewBox="0 0 760 430" role="img" aria-label="Evidence-quality ladder with four rungs from self-reported gains to randomized rollout; credibility rises with cost and design effort" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
    <defs>
      <marker id="f1-arw" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" fill="#8fa3b8"/>
      </marker>
    </defs>
    <path d="M 50 380 L 50 72" stroke="#8fa3b8" stroke-width="2" marker-end="url(#f1-arw)" fill="none"/>
    <path d="M 50 380 L 736 380" stroke="#8fa3b8" stroke-width="2" marker-end="url(#f1-arw)" fill="none"/>
    <text x="58" y="90" font-size="13" fill="#8fa3b8">Credibility of</text>
    <text x="58" y="108" font-size="13" fill="#8fa3b8">the value claim</text>
    <text x="736" y="406" font-size="13" fill="#8fa3b8" text-anchor="end">Cost &amp; design effort</text>
    <rect x="70" y="330" width="150" height="50" rx="10" fill="#0d1420" stroke="#f27e85" stroke-width="2"/>
    <text x="145" y="351" font-size="14" fill="#d7e0ea" text-anchor="middle">1 · Self-report</text>
    <text x="145" y="369" font-size="13" fill="#8fa3b8" text-anchor="middle">surveys, anecdotes</text>
    <rect x="245" y="270" width="150" height="110" rx="10" fill="#0d1420" stroke="#f5b968" stroke-width="2"/>
    <text x="320" y="292" font-size="14" fill="#d7e0ea" text-anchor="middle">2 · Before / after</text>
    <text x="320" y="310" font-size="13" fill="#8fa3b8" text-anchor="middle">dashboards vs baseline</text>
    <text x="320" y="328" font-size="13" fill="#8fa3b8" text-anchor="middle">seasonality confounds</text>
    <rect x="420" y="200" width="150" height="180" rx="10" fill="#0d1420" stroke="#80c9f8" stroke-width="2"/>
    <text x="495" y="222" font-size="14" fill="#d7e0ea" text-anchor="middle">3 · Matched holdout</text>
    <text x="495" y="240" font-size="13" fill="#8fa3b8" text-anchor="middle">treated vs comparable</text>
    <text x="495" y="258" font-size="13" fill="#8fa3b8" text-anchor="middle">untreated units</text>
    <text x="495" y="276" font-size="13" fill="#69deb9" text-anchor="middle">first causal rung</text>
    <rect x="595" y="120" width="140" height="260" rx="10" fill="#0d1420" stroke="#69deb9" stroke-width="2.5"/>
    <text x="665" y="142" font-size="14" fill="#d7e0ea" text-anchor="middle">4 · Randomized rollout</text>
    <text x="665" y="160" font-size="13" fill="#8fa3b8" text-anchor="middle">random assignment,</text>
    <text x="665" y="178" font-size="13" fill="#8fa3b8" text-anchor="middle">staggered waves,</text>
    <text x="665" y="196" font-size="13" fill="#8fa3b8" text-anchor="middle">preregistered metrics</text>
    <text x="665" y="214" font-size="13" fill="#69deb9" text-anchor="middle">the gold standard</text>
    <path d="M 228 322 L 585 112" stroke="#8fa3b8" stroke-width="2" marker-end="url(#f1-arw)" fill="none"/>
    <text x="400" y="95" font-size="13" fill="#8fa3b8" text-anchor="middle">every rung adds a stronger counterfactual</text>
  </svg>
  <figcaption>Figure 1 — The evidence-quality ladder. Each rung adds a stronger counterfactual at higher cost and design effort; budget-defensible value claims start at rung 3, and most AI value reporting today sits on rungs 1 and 2.</figcaption>
</figure>

**Rung 1 — self-report.** Surveys and anecdotes: no counterfactual, exposed to enthusiasm and social-desirability bias. Most employee productivity figures — including the ~80% gain statistic above[[1]](#ref-mck-soai-2026) — sit here. Useful for sentiment; useless for budget defense.

**Rung 2 — before/after.** Dashboards compared to a baseline period. Better, but confounded by seasonality, demand shifts, and everything else the organization changed at the same time.

**Rung 3 — matched holdout.** Treated units compared with comparable untreated units over the same window. The first rung that supports causal language.

**Rung 4 — randomized rollout.** Random assignment, staged waves, preregistered metrics. The strongest internal validity available outside a laboratory.

Two studies define what the top rungs look like in practice. Brynjolfsson, Li, and Raymond's *Generative AI at Work* is the operations reference point: a staggered rollout of an AI conversational assistant to 5,179 customer-support agents at one software firm increased issues resolved per hour by about 15% on average, with gains of roughly 30% or more for novice agents and minimal effects for the most experienced — evidence that the assistant worked by diffusing top performers' tacit knowledge to the rest of the floor[[3]](#ref-brynjolfsson-2023). The design is quasi-experimental, exploiting rollout timing, and the setting is a single firm with text-centric tasks: causality is strong internally, while extrapolation to other functions is not automatic.

Dell'Acqua and colleagues set the randomized standard for knowledge work: a preregistered field experiment with 758 BCG consultants across 18 realistic tasks — later published in *Organization Science* — found that consultants with AI completed 12.2% more tasks, 25.1% faster, with more than 40% higher quality than the control group, on tasks inside the AI's capability frontier[[4]](#ref-dellacqua-2023). The same study mapped the "jagged frontier": performance degraded on tasks just outside it, which is why value measurement must be task-scoped rather than program-scoped.

Neither study measured EBIT, and neither claims to. Their lesson is design, not magnitude: staged rollouts with matched holdouts reach rung 3 at modest cost, and holding out even 10% of units for one quarter buys a defensible causal estimate for every layer metric the rollout touches.

## Attribution Without Self-Deception

Attribution is counterfactual reasoning under discipline, and three designs cover nearly every executive need in ascending order of strength.

**Trend line versus intervention.** The cheapest and weakest design: project the metric's own pre-AI trend forward and compare. Honest only when the pre-trend is stable and seasonality is modeled; self-deceptive when the line was already rising for reasons unrelated to AI.

**Matched holdout.** Keep a comparable set of units untreated for the measurement window; the difference between the treated and untreated deltas is the attribution. This is rung 3, and it is the minimum bar for "proven value" language.

**Phased rollout as natural experiment.** Staggering waves creates internal comparisons — early waves versus not-yet-treated units — which is precisely the design behind the strongest field evidence in the literature[[3]](#ref-brynjolfsson-2023).

<figure>
  <svg viewBox="0 0 760 430" role="img" aria-label="Three attribution designs: trend line versus intervention, matched holdout, and phased rollout, compared by counterfactual strength" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
    <defs>
      <marker id="f2-arw" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" fill="#f27e85"/>
      </marker>
    </defs>
    <text x="140" y="50" font-size="15" fill="#d7e0ea" text-anchor="middle">1 · Trend line vs intervention</text>
    <text x="380" y="50" font-size="15" fill="#d7e0ea" text-anchor="middle">2 · Matched holdout units</text>
    <text x="620" y="50" font-size="15" fill="#d7e0ea" text-anchor="middle">3 · Phased rollout</text>
    <rect x="30" y="64" width="220" height="276" rx="10" fill="#0d1420" stroke="#2a3a4c" stroke-width="2"/>
    <rect x="270" y="64" width="220" height="276" rx="10" fill="#0d1420" stroke="#2a3a4c" stroke-width="2"/>
    <rect x="510" y="64" width="220" height="276" rx="10" fill="#0d1420" stroke="#2a3a4c" stroke-width="2"/>
    <path d="M 60 316 L 60 92" stroke="#2a3a4c" stroke-width="2" fill="none"/>
    <path d="M 60 316 L 240 316" stroke="#2a3a4c" stroke-width="2" fill="none"/>
    <path d="M 72 296 L 138 262" stroke="#8fa3b8" stroke-width="2.5" fill="none"/>
    <path d="M 138 96 L 138 316" stroke="#2a3a4c" stroke-width="1.5" stroke-dasharray="4 4" fill="none"/>
    <text x="144" y="108" font-size="13" fill="#8fa3b8">AI starts</text>
    <path d="M 138 262 L 230 252" stroke="#8fa3b8" stroke-width="2" stroke-dasharray="5 4" fill="none"/>
    <path d="M 138 262 L 230 208" stroke="#69deb9" stroke-width="2.5" fill="none"/>
    <path d="M 222 250 L 222 216" stroke="#f27e85" stroke-width="2" marker-end="url(#f2-arw)" fill="none"/>
    <text x="228" y="238" font-size="15" fill="#f27e85">Δ</text>
    <path d="M 300 316 L 300 92" stroke="#2a3a4c" stroke-width="2" fill="none"/>
    <path d="M 300 316 L 480 316" stroke="#2a3a4c" stroke-width="2" fill="none"/>
    <path d="M 312 298 L 472 212" stroke="#69deb9" stroke-width="2.5" fill="none"/>
    <path d="M 312 298 L 472 284" stroke="#8fa3b8" stroke-width="2.5" fill="none"/>
    <path d="M 478 282 L 478 220" stroke="#f27e85" stroke-width="2" marker-end="url(#f2-arw)" fill="none"/>
    <text x="484" y="256" font-size="15" fill="#f27e85">Δ</text>
    <rect x="312" y="100" width="9" height="9" fill="#69deb9"/>
    <text x="327" y="109" font-size="13" fill="#d7e0ea">treated</text>
    <rect x="312" y="120" width="9" height="9" fill="#8fa3b8"/>
    <text x="327" y="129" font-size="13" fill="#d7e0ea">holdout</text>
    <path d="M 540 316 L 540 92" stroke="#2a3a4c" stroke-width="2" fill="none"/>
    <path d="M 540 316 L 720 316" stroke="#2a3a4c" stroke-width="2" fill="none"/>
    <path d="M 552 300 L 604 300 L 604 274 L 656 274 L 656 246 L 704 246" stroke="#69deb9" stroke-width="2.5" fill="none"/>
    <path d="M 552 300 L 704 266" stroke="#8fa3b8" stroke-width="2" stroke-dasharray="5 4" fill="none"/>
    <text x="578" y="334" font-size="13" fill="#8fa3b8" text-anchor="middle">W1</text>
    <text x="630" y="334" font-size="13" fill="#8fa3b8" text-anchor="middle">W2</text>
    <text x="686" y="334" font-size="13" fill="#8fa3b8" text-anchor="middle">W3</text>
    <text x="140" y="372" font-size="13" fill="#f27e85" text-anchor="middle">risk: trend pre-dates AI</text>
    <text x="380" y="372" font-size="13" fill="#8fa3b8" text-anchor="middle">same market, same window</text>
    <text x="620" y="372" font-size="13" fill="#8fa3b8" text-anchor="middle">waves create internal comparisons</text>
    <text x="380" y="402" font-size="13" fill="#8fa3b8" text-anchor="middle">The stronger the comparison group, the stronger the value claim.</text>
  </svg>
  <figcaption>Figure 2 — Three attribution designs. A trend line needs a stable pre-AI trend; a matched holdout compares treated and untreated units in the same window; a phased rollout turns the staging itself into evidence. State confidence at the strength of the weakest design link.</figcaption>
</figure>

Directional evidence is acceptable — when labeled. A before/after gross-margin improvement against a clean seasonal baseline can justify scaling a deployment; it cannot support "proven EBIT impact" in a board deck. Report the evidence rung beside the number: "cost per ticket down 12% versus matched holdout" is a sentence finance can underwrite; "AI saves 30%" is not. A value ledger makes this operational — the [initiative-level accounting model](/en/insights/the-ai-transformation-value-ledger) records each claim's layer, baseline, and evidence rung so the whole portfolio can be audited line by line.

Three self-deception patterns recur in AI portfolios. Proxy drift: the team optimizes the productivity proxy while the value metric stays flat. Survivorship: only pilots that worked get measured, so the portfolio looks better than its parts. Aggregation: averaging gains across units hides that value concentrated in two processes and never appeared anywhere else. Each is an attribution failure wearing a success story.

The discipline scales to agents. BCG's *Formula for Agentic AI Value* frames value capture as a multi-step formula — five steps in secondary summaries — for moving agentic AI from productivity proof to P&L proof[[5]](#ref-bcg-2026-formula). BCG's survey of several hundred executives (roughly 398 respondents per secondary summaries) found about half of enterprises reporting measurable value from AI, and enterprises exercising systematic control over agents — governance, evaluation, proof of value — reported on the order of three times the value of uncontrolled deployments. Attribute the multiplier carefully: it is BCG research as analyzed by validant.ai, with the primary exhibit values not directly retrieved[[5]](#ref-bcg-2026-formula). The direction, however, matches everything above: control and measurement discipline are not overhead on AI value; they are the mechanism by which value becomes reportable.

Deloitte's 2026 ROI analysis closes the argument from the CFO's side of the table: what distinguishes the programs that report value is not model choice but baselines, attribution, and benefits tracking[[2]](#ref-deloitte-roi-2026). Attribution without a counterfactual is not conservative measurement — it is self-deception with a dashboard.

## Key Takeaways

- Productivity is an input metric; value is measured in seven outcome layers — EBIT, revenue, gross margin, cost-to-serve, cycle time, customer impact, and unit economics.
- Every value claim needs the four-part measurement contract: baseline, counterfactual, attribution method, and a stated confidence level.
- The survey evidence — roughly 80% employee productivity gains against about 37% revenue improvement and about 6% significant financial gains — is the productivity trap at national scale[[1]](#ref-mck-soai-2026).
- Evidence quality comes in rungs; "proven" language starts at matched holdouts, and the strongest field evidence (5,179 agents; 758 consultants) used comparison designs, not surveys[[3]](#ref-brynjolfsson-2023)[[4]](#ref-dellacqua-2023).
- Most value dies in the productivity-to-EBIT bridge: in the illustrative scenario, $11.2M of input capacity converted to about $3.4M of P&L effect — roughly 30%.
- Report unit economics net of AI's own running costs, or the layer metrics will overstate value.
- Measurement discipline correlates with reported value — about 3x for controlled agent deployments, per BCG research as analyzed by validant.ai[[5]](#ref-bcg-2026-formula) — so treat measurement as the mechanism, not the overhead.

## What Leaders Should Do Next

1. *(CFO office, next 30 days)* Build the baseline pack before the next AI initiative is funded: for each of the seven layers, the metric definition, current baseline value, data owner, and refresh cadence.
2. *(Chief Data/Analytics Officer, first 60 days)* Stand up the value ledger: every AI initiative logged with its target layer, metric, baseline, evidence rung, and owner, with rung-3 evidence as the entry condition for "value proven" language.
3. *(COO and business-unit owners, next quarter)* Design the next rollout with a 10% matched holdout and preregistered metrics; agree the analysis plan before launch, not the narrative after results arrive.
4. *(Transformation office, next two quarters)* Re-score every live AI initiative against the evidence ladder; kill or redesign anything still claiming value at rungs 1-2, and redirect funding toward layers that actually moved.
5. *(CFO and CIO, next budget cycle)* Move AI's running costs — licenses, inference, review labor — into unit-economics reporting so contribution margin per unit of work is net of AI cost, not gross.

## References

1. <a id="ref-mck-soai-2026"></a>**McKinsey & Company (survey); Economic Times CIO, ANI, Jornal Económico (coverage)** — *The State of AI, 2026 survey (as reported by ET CIO / ANI / Jornal Económico)*, Oct 16, 2026. [cio.economictimes.indiatimes.com](https://cio.economictimes.indiatimes.com/news/artificial-intelligence/only-6-of-companies-see-significant-financial-gains-from-ai/134990221) — the ~80% / ~37% / ~6% figures and the productivity-to-profit gap; a global enterprise survey read through independent secondary coverage, so magnitudes are directional.
2. <a id="ref-deloitte-roi-2026"></a>**Deloitte Insights** — *AI ROI: The paradox of rising investment and elusive returns*, 2026. [deloitte.com](https://www.deloitte.com/it/it/issues/generative-ai/ai-roi-the-paradox-of-rising-investment-and-elusive-returns.html) — rising investment against concentrated returns, and measurement discipline (baselines, attribution, benefits tracking) as the differentiator; consultancy analysis, exhibit specifics not retrieved.
3. <a id="ref-brynjolfsson-2023"></a>**Erik Brynjolfsson, Danielle Li, Lindsey R. Raymond** — *Generative AI at Work*, Apr 2023 (revised 2025). [nber.org](https://www.nber.org/papers/w31161) — staggered rollout to 5,179 support agents, ~15% more issues resolved per hour, ~30%+ for novices; quasi-experimental, single firm, text-centric tasks.
4. <a id="ref-dellacqua-2023"></a>**Fabrizio Dell'Acqua, Edward McFowland III, Ethan Mollick, Raffaella Sadun, Lisa Kishore, Willy C. Jiang, Kai Zhang, Letian Larcom, Alex 'Sandy' Pentland, Daniel Rock** — *Navigating the Jagged Technological Frontier: Field Experimental Evidence of the Effects of AI on Knowledge Worker Productivity and Quality*, Sep 2023 (working paper); journal version 2025. [pubsonline.informs.org](https://pubsonline.informs.org/doi/10.1287/orsc.2025.21838) — preregistered randomized field experiment, 758 consultants: +12.2% tasks, 25.1% faster, >40% quality inside the frontier; single firm, one model generation.
5. <a id="ref-bcg-2026-formula"></a>**BCG (Applied AI / GAMMA)** — *The Formula for Agentic AI Value*, Sep 30, 2026. [bcg.com](https://www.bcg.com/publications/2026/the-formula-for-agentic-ai-value) — proof-of-value formula moving agentic AI from productivity proof to P&L proof; the ~3x control multiplier and ~398-respondent survey base come via validant.ai's secondary analysis and other secondary summaries.
