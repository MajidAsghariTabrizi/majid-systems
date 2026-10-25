---
id: "08"
slug: prioritizing-high-value-ai-missions
title: Prioritizing High-Value AI Missions
subtitle: >-
  Most AI portfolios fail at selection, not execution. Five scoring axes with
  numeric gates — and a 3-to-5-mission portfolio with kill criteria — beats
  twenty pilots chosen by enthusiasm.
excerpt: >-
  A five-axis scoring method (opportunity, feasibility, readiness, risk,
  payback) with explicit numeric gates, and the portfolio rule that funds 3-5
  concurrent missions with kill criteria instead of pilot sprawl.
pillar: economics-value
tags: [ai-portfolio, prioritization, opportunity-sizing, mission-selection, ai-investment]
author_id: quantiviq-research
published_at: "2026-10-24"
updated_at: "2026-10-24"
status: published
hero_image: /insights/heroes/08.svg
hero_alt: >-
  Conceptual value-versus-readiness quadrant with a small portfolio of mission
  dots: one stretch, two core, one quick win, and a kill-rule box.
hero_caption: >-
  Original conceptual artwork: missions plotted on value vs readiness with a
  deliberately small portfolio — not every good idea gets funded at once.
seo_title: >-
  Prioritizing High-Value AI Missions: 5-Axis Method
seo_description: >-
  How to select AI missions that compound: five scoring axes with numeric
  gates, opportunity-sizing arithmetic, and the 3-5 mission portfolio rule.
primary_term: prioritizing ai missions
secondary_terms: [ai use case prioritization framework, ai opportunity sizing, ai portfolio, ai project selection]
source_ids: [mit-nanda-2025, gartner-2025-agentic, bcg-2026-formula, dellacqua-2023, mck-2026-org]
featured: false
discussion_questions:
  - "Of our currently funded AI initiatives, how many would survive a written gate — minimum annual gross opportunity, named sponsor, eval feasible in two weeks, bounded blast radius?"
  - "Where did our last three AI opportunities come from, and what does that say about who we listen to when selecting?"
  - "Do we have a standing kill criterion for each AI initiative, or does every project get one more quarter by default?"
related_article_ids: ["02", "06", "12"]
---

Score candidate AI missions on five axes — opportunity size, feasibility, organizational readiness, risk, and payback speed — with explicit numeric gates, then fund a portfolio of three to five concurrent missions, each with a payback hypothesis and a pre-agreed kill criterion. That sentence is the entire method. The hard part is not the scoring; it is refusing to fund the other fifteen ideas that a large organization can always generate, and holding the kill criteria when a mission underperforms.

The evidence for why selection discipline matters more than execution talent is now substantial. The MIT Media Lab / Project NANDA report of August 2025 — cited via Fortune's coverage — put about 95% of organizations' generative-AI pilots at no measurable P&L return at the time of the study, a headline figure contested in scope (it counts pilots, not all deployments) but directionally consistent with everything else measurable.[[1]](#ref-mit-nanda-2025) Gartner's June 2025 forecast that more than 40% of agentic AI projects will be canceled by end of 2027 — on escalating costs, unclear value and inadequate risk controls — describes the same selection failure one phase later, when real budgets are at stake.[[2]](#ref-gartner-2025-agentic) And BCG's 2026 agentic-AI research, as summarized by validant.ai, finds enterprises reporting roughly three times the value where they exercise systematic control and proof of value — which begins, as every portfolio manager knows, with what you let into the funnel.[[3]](#ref-bcg-2026-formula)

## Executive Summary

- AI portfolios fail at selection more often than execution: the pilot-sprawl failure mode (many small bets, no baselines, no kill criteria) is a selection-process artifact.[[1]](#ref-mit-nanda-2025)
- Opportunity sizing is arithmetic, not intuition: frequency × value per instance × addressable share — sized on the exception flow, not the task name.
- Feasibility must respect the jagged frontier: build inside proven capability bands; a 758-consultant randomized field experiment showed large gains inside the frontier and no gains outside it.[[4]](#ref-dellacqua-2023)
- Organizational readiness — a named sponsor, supervisor capacity, an adoption path — predicts outcome movement better than technical sophistication; the organization, not the tool, is what must change.[[5]](#ref-mck-2026-org)
- Fund 3-5 concurrent missions: one stretch, two core, one quick win — each with a payback hypothesis and a kill criterion agreed before funding.[[2]](#ref-gartner-2025-agentic)

## Why idea lists produce pilots, not value

Walk into any large enterprise and ask for AI ideas; you will receive forty within a week. The ideas arrive through the channels that produce ideas: vendors demonstrating to executives, front-line teams describing their pain, analysts reading competitor press releases. None of those channels optimizes for value-per-mission. They optimize for salience — what is easiest to visualize, closest to power, or most recently discussed.

Pilot portfolios assembled from salience share three structural defects. First, no baselines: pilots launch without captured "before" measurements, so no result — positive or negative — can be honestly booked later. Second, no kill criteria: every pilot acquires stakeholders who defend it, so underperforming work continues by default. Third, no capability compounding: each pilot builds its own one-off artifacts and disbands, so the fortieth pilot starts no cheaper than the first. The result is precisely the MIT NANDA pattern — tools purchased without workflow integration, poor task fit, thin measurement — repeated at scale.[[1]](#ref-mit-nanda-2025)

Selection discipline fixes all three defects at once, because a mission that passes a written bar arrives with its baseline requirement, its kill criterion and its harvest plan attached. The [mission factory model](/en/insights/the-agentic-mission-factory) supplies the operating rhythm; this article supplies the bar itself.

## Axis 1: Opportunity sizing — the arithmetic

Opportunity size is frequency × value per instance × addressable share. The discipline is sizing the *exception flow*, not the task name, because that is where volume and value concentrate.

A worked example (an illustrative synthetic scenario; assumptions stated so the arithmetic is checkable):

- A mid-sized industrial supplier processes 40,000 invoice exceptions per year — invoices that fail automated matching and require a human to reconcile against purchase orders and receipts.
- Fully loaded handling cost (human reconciliation time, downstream payment delay, supplier dispute handling): $9 per exception, measured by the finance function's own time studies.
- Addressable share: agents reliably draft the reconciliation recommendation with sources attached, humans approve; realistic capture is 40% of the gross opportunity in year one — consistent with guarded-rollout practice, not vendor claims.

The arithmetic: 40,000 × $9 × 0.40 = **$144,000 annual gross opportunity**. Now the gate does its work: if the written bar says a mission must clear $250,000 annual gross, this idea fails — despite being real, sensible and popular with the AP team — and fails in one page of writing rather than one quarter of engineering. (Whether it also fails on payback speed depends on build cost, which is the fifth axis; a $144k/year mission with a $60k build and reuse-heavy infrastructure may still earn a "quick win" slot below the main bar. The bar can price that explicitly. What the bar may not do is bend silently.)

Note what the sizing arithmetic exposes: the three levers are volume, unit value and addressable share. High-volume-low-value flows (invoice exceptions) and low-volume-high-value flows (major-deal pricing support) can both clear a bar; medium-volume-medium-value flows with low addressable share — the comfortable middle of most idea lists — usually cannot. Sizing kills the comfortable middle, which is its job.

## Axes 2-5: feasibility, readiness, risk, payback

**Feasibility — is the capability proven on our distribution?** The jagged frontier finding from Dell'Acqua and colleagues' field experiment with 758 BCG consultants is the governing evidence: consultants with AI completed 12.2% more tasks, 25.1% faster, with over 40% higher quality on tasks *inside* the AI's capability frontier — and the frontier is invisible, meaning teams misjudge which side of it they are on.[[4]](#ref-dellacqua-2023) Feasibility scoring therefore requires evidence, not vibes: has an agent of this class done this task type successfully on comparable data? Can a golden set of 200 real cases be assembled in two weeks? If the honest answer is "we'd be discovering the frontier as we go," the mission is a research project — which can be funded, but as research, with research-sized expectations.

**Organizational readiness — will the workflow actually change?** A mission needs a named sponsor with budget authority, supervisor capacity (humans whose attention the autonomy contract will consume), and an adoption path for the people whose work changes. McKinsey's October 2026 analysis argues that value depends on changing the organization around the work — planning, budgeting, performance management — and readiness scoring is simply a pre-check on whether that change has an owner.[[5]](#ref-mck-2026-org) A technically trivial mission with no sponsor is a stalled mission; a moderately hard mission with an empowered sponsor routinely ships.

**Risk — what is the blast radius?** Two variables: reversibility of the agent's actions and scale of the affected surface. An agent drafting internal recommendations is low-risk (human approves everything, errors are contained); an agent executing trades with counterparties is high-risk (irreversible, external blast radius). Risk does not disqualify; it prices the required controls — the [autonomy matrix](/en/insights/human-in-the-loop-vs-human-on-the-loop) and [governance stack](/en/insights/agentic-ai-governance-by-design) set the control cost, and the mission's economics must carry it. If control cost eats the opportunity, the mission fails on arithmetic — honestly.

**Payback speed — when does the first value book?** Time-to-first-booked-value, not time-to-demo. Quick payback missions fund credibility and the capability library; long payback missions build structural advantage. A healthy portfolio holds both, but sequences them deliberately: early payback first, structural bets second. Gartner's cancellation forecast is, at bottom, a forecast about portfolios that held neither sequencing nor the value ledger entries that make payback visible.[[2]](#ref-gartner-2025-agentic)

## The scoring gate and the portfolio

The gate is a written page: minimum annual gross opportunity ($250k, adjust to your scale), named sponsor (yes/no), golden set feasible in two weeks (yes/no), blast radius bounded with controls priced (yes/no), first booked value within two quarters (yes/no). Candidates that clear the gate then score on the five axes — 1 to 5 each, with the scoring *evidence* attached, not just the number — and the portfolio funds from the top.

The portfolio rule is the counterweight to the gate: **fund three to five concurrent missions, no more.** One stretch mission (high value, harder feasibility, sized to learn), two core missions (clear value, proven capability, sponsor ready), one quick win (modest value, fast payback, adoption momentum). Every funded mission carries: a baseline captured before launch, a payback hypothesis with dates, and a kill criterion — written before funding, honored after it.

Why so few? Because supervision capacity, evaluation engineering and sponsor attention are the binding constraints, and each is consumed by every live mission. A portfolio of twenty small bets does not spread risk; it spreads attention until nothing is supervised properly and every mission's autonomy contract decays into rubber-stamping. Concentration is not aggression — it is the control that BCG's ~3x finding rewards.[[3]](#ref-bcg-2026-formula)

<figure>
  <svg viewBox="0 0 760 340" role="img" aria-label="Value versus readiness quadrant showing a small portfolio: one stretch mission, two core missions, one quick win, and a rejected backlog with a kill-rule box" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
    <line x1="380" y1="50" x2="380" y2="270" stroke="#2a3a4c" stroke-width="2"/>
    <line x1="90" y1="160" x2="670" y2="160" stroke="#2a3a4c" stroke-width="2"/>
    <text x="380" y="36" text-anchor="middle" font-size="14" font-weight="700" fill="#d7e0ea">Value</text>
    <text x="700" y="164" text-anchor="middle" font-size="14" font-weight="700" fill="#d7e0ea">Readiness</text>
    <circle cx="560" cy="90" r="16" fill="#a694f7" opacity="0.9"/>
    <text x="560" y="62" text-anchor="middle" font-size="13" fill="#a694f7">stretch</text>
    <circle cx="520" cy="215" r="16" fill="#69deb9" opacity="0.9"/>
    <circle cx="590" cy="235" r="16" fill="#69deb9" opacity="0.9"/>
    <text x="555" y="270" text-anchor="middle" font-size="13" fill="#69deb9">core x2</text>
    <circle cx="200" cy="240" r="14" fill="#f5b968" opacity="0.9"/>
    <text x="200" y="268" text-anchor="middle" font-size="13" fill="#f5b968">quick win</text>
    <circle cx="180" cy="90" r="9" fill="#3d5166"/>
    <circle cx="260" cy="115" r="9" fill="#3d5166"/>
    <circle cx="150" cy="125" r="9" fill="#3d5166"/>
    <text x="196" y="66" text-anchor="middle" font-size="13" fill="#8fa3b8">high value, low readiness: not now</text>
    <rect x="470" y="292" width="260" height="36" rx="8" fill="none" stroke="#f27e85" stroke-width="2"/>
    <text x="600" y="314" text-anchor="middle" font-size="13" fill="#f27e85">kill rule: 2 quarters below threshold, wind down</text>
  </svg>
  <figcaption>Figure 1 — The portfolio on one page: fund one stretch, two core and one quick-win mission; the high-value-low-readiness backlog waits for a later cycle, and every funded mission carries its kill rule.</figcaption>
</figure>

## What not to pick first

Three exclusions deserve their own line, because they are the most seductive bad choices:

- **High-blast-radius, irreversible decisions.** Agents making irreversible external commitments (pricing to customers, contract terms, capital allocation) before evaluation discipline exists anywhere in the organization. These are the missions that end programs.
- **Thin-data domains.** Workflows where the historical record is too sparse to build a golden set: no eval, no definition of working, no mission — regardless of how strategic the domain feels.
- **Vanity automation.** Demos that impress visitors but touch no measurable flow. The exception that proves the rule: one *visible* quick win is legitimate adoption marketing, deliberately chosen and labeled as such — as long as it books real, if modest, value.

The composite industrial-supplier example above is deliberately mundane: invoice exceptions, not innovation theater. Portfolios that start in the back office learn evaluation, supervision and harvest on low-blast-radius ground, then carry that discipline to the customer-facing missions where the larger value sits — a sequencing choice the [90-day roadmap](/en/insights/the-90-day-ai-transformation-roadmap) develops fully.

## Key Takeaways

- Selection discipline beats execution talent: pilot sprawl is a selection-process artifact, and the written bar eliminates doomed efforts at one page of cost.[[1]](#ref-mit-nanda-2025)
- Size the exception flow with arithmetic — frequency × unit value × addressable share — and let the gate kill the comfortable middle of the idea list.
- Feasibility means proven capability on your distribution: the jagged frontier punished teams that guessed, and rewards teams that check.[[4]](#ref-dellacqua-2023)
- Readiness (sponsor, supervisors, adoption path) predicts outcome movement better than technical sophistication; risk prices the controls, payback sequences the bets.[[5]](#ref-mck-2026-org)
- Fund 3-5 concurrent missions with baselines, payback hypotheses and pre-agreed kill criteria; concentration of attention is the control that the ~3x systematic-control finding rewards.[[3]](#ref-bcg-2026-formula)

## What Leaders Should Do Next

1. **Write the gate this week.** (Transformation lead + CFO office, week one.) One page, five yes/no checks plus the opportunity floor. Publishing the bar is itself a signal: every subsequent rejection cites a rule, not a person.
2. **Re-score the existing portfolio against the five axes.** (Transformation office, first 30 days.) Attach evidence to each score; expect the honest survivor count to be small. Document closures in the value ledger — negative bookings build credibility.[[3]](#ref-bcg-2026-formula)
3. **Size the next ten candidate ideas with the frequency × value × share arithmetic.** (Finance business partners, first 30 days.) No idea enters scoring without its arithmetic page; this single requirement removes most advocacy-driven selection.
4. **Set the portfolio cap and publish it.** (Executive committee, first 60 days.) Three to five concurrent missions, with the quick-win/stretch/core mix stated. A published cap turns "why not us?" into "what would we stop?" — the right question.
5. **Pre-agree kill criteria at funding, and honor the first one publicly.** (Sponsors + review board, first 90 days.) The first mission killed cleanly, on its written criterion, teaches the organization more about the program's seriousness than any success.

## References

1. <a id="ref-mit-nanda-2025"></a>**MIT Media Lab / Project NANDA** — *The GenAI Divide: State of AI in Business 2025*, Aug 18, 2025; cited via Fortune's coverage. [fortune.com](https://fortune.com/2025/08/18/mit-report-95-percent-generative-ai-pilots-at-companies-failing-cfo/) — ~95% pilot non-return (scope-contested) and organizational failure causes; secondary coverage.
2. <a id="ref-gartner-2025-agentic"></a>**Gartner** — *Over 40% of Agentic AI Projects Will Be Canceled by End of 2027*, Jun 25, 2025. [gartner.com](https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027) — analyst forecast; causes include unclear value and inadequate risk controls.
3. <a id="ref-bcg-2026-formula"></a>**Boston Consulting Group** — *The Formula for Agentic AI Value*, Sep 30, 2026; ~3x systematic-control multiplier as analyzed by validant.ai. [bcg.com](https://www.bcg.com/publications/2026/the-formula-for-agentic-ai-value) — figures via secondary summary.
4. <a id="ref-dellacqua-2023"></a>**Dell'Acqua et al.** — *Navigating the Jagged Technological Frontier*, HBS WP 24-013 (2023), Organization Science (2025), 10.1287/orsc.2025.21838. [pubsonline.informs.org](https://pubsonline.informs.org/doi/10.1287/orsc.2025.21838) — 758-consultant randomized field experiment; frontier-dependent gains.
5. <a id="ref-mck-2026-org"></a>**McKinsey & Company** — *AI is changing work. Now it has to change the organization*, Oct 5, 2026. [mckinsey.com](https://www.mckinsey.com/no/our-insights/ai-is-changing-work-now-it-has-to-change-the-organization) — organizational redesign as the precondition for AI value.
