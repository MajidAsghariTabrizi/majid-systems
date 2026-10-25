---
id: "03"
slug: from-org-charts-to-orchestration-charts
title: From Organization Charts to Orchestration Charts
subtitle: >-
  The org chart records who reports to whom. Agents force a second question — who orchestrates what, with what autonomy, under whose approval.
excerpt: >-
  When software agents execute work, the organization chart stops describing how work flows. Draw the orchestration chart: missions, humans, agent fleet, and explicit decision rights.
pillar: transformation-strategy
tags: [operating-model, ai-agents, decision-rights, organizational-design, autonomy]
author_id: quantiviq-research
published_at: "2026-10-24"
updated_at: "2026-10-24"
status: published
hero_image: /insights/heroes/03.svg
hero_alt: >-
  Org tree morphing into a layered orchestration chart with a highlighted mission slice — conceptual diagram
hero_caption: >-
  The single reporting tree gives way to four layers — missions, humans, agents, decision rights — with one mission slice cut through them.
seo_title: >-
  From Org Charts to Orchestration Charts
seo_description: >-
  Redraw decision rights for a human-plus-agent workforce: the four-layer orchestration chart, autonomy levels, capacity planning, and where to start.
primary_term: orchestration chart
secondary_terms: [org chart vs orchestration chart, ai organizational design, decision rights, human agent workforce structure]
source_ids: [mck-2026-org, brynjolfsson-2023, msft-wti-2025]
featured: false
discussion_questions:
  - "Which approval points in our order-to-cash flow could an agent own at level 2 autonomy, and what reversibility threshold would we demand first?"
  - "If headcount no longer measures capacity, what capacity metric do we plan against next quarter — and which executive owns that number?"
  - "Which named manager is accountable for agent behavior today, and would they notice an exception queue backing up before a customer did?"
related_article_ids: ["04", "10", "20"]
---

An orchestration chart is the decision map for a workforce that includes software: it shows which missions run, which humans and agents execute them, at what autonomy level, and who approves what. The organization chart answers a different, narrower question — who reports to whom — and carries almost none of that information. As agents take on execution work, the consequential routing decisions (which agent touches which task, when a human must step in, who signs off) increasingly live on no diagram the leadership team has ever approved.

The distinction is not cosmetic. Organizations that add agents without redrawing decision rights get shadow workarounds: employees quietly overriding agent output, approvals that exist in policy but not in workflow, and capacity that no planner can see or steer. Organizations that redraw the chart get compounding throughput, because every new mission inherits explicit gates instead of renegotiating them from scratch. Apply one test to whatever diagram your leadership team calls current: if your chart can't tell you who approves an agent's action, it's incomplete.

This article defines the orchestration chart, separates what the org chart still does well from what it can no longer carry, grounds the capacity argument in field evidence, redesigns the manager's job, and gives a one-quarter way to start.

## Executive Summary

- The org chart answers who reports to whom; the orchestration chart answers who orchestrates what, with what autonomy, under whose approval. An enterprise needs both, and neither substitutes for the other.
- Reporting, compensation and accountability remain org-chart business. Capacity planning, handoffs and escalation have quietly broken on it, because headcount no longer measures capacity once agents execute work.
- McKinsey's People and Organizational Performance practice argues (October 2026) that work — tasks, workflows, roles — is changing faster than the organization around it, and that structures, planning, budgeting, performance management and decision rights must follow[[1]](#ref-mck-2026-org).
- An orchestration chart has four layers — missions, humans, agents, decision rights — and the fourth is where most transformations are still blank.
- Field evidence from 5,179 customer-support agents shows AI lifting issues resolved per hour by about 15% on average, concentrated among novices: capacity arrives as diffused expertise, not headcount removal[[2]](#ref-brynjolfsson-2023).
- The manager's job shifts from span of control to span of attention — dashboards, exception queues, escalation protocols. Microsoft's "agent boss" framing points the same direction, with vendor caveats attached[[3]](#ref-msft-wti-2025).

## What the org chart still does

The org chart is not wrong; it is incomplete. Three of its functions remain fully intact and should not be moved to any new artifact.

**What stays.** Reporting lines, compensation and accountability remain org-chart business. The chart still tells you who is hired, paid, promoted and answerable — and when an agent causes a regulatory breach, the org chart is what names the human who answers for it. That liability function does not transfer to software no matter how autonomous the fleet becomes.

**What breaks.** Four operating functions quietly stop working on a headcount-only chart:

- **Capacity planning.** Headcount was always a proxy for capacity; agents break the proxy. Two teams with identical headcount can differ several-fold in throughput depending on how much agent leverage each carries, so planners who model FTEs are modeling the wrong denominator.
- **Span of control.** Classic designs assume a manager attends to a bounded set of direct reports. A supervisor responsible for eight analysts and forty running agents is not managing forty-eight relationships; they are managing an attention portfolio the org chart cannot draw.
- **Handoffs.** Org-chart handoffs are human-to-human at department boundaries. Agent-to-agent and agent-to-human handoffs occur inside processes the chart does not show, which is precisely where work stalls.
- **Escalation.** The chart's escalation paths assume a human answers at every rung. When the first responder is software, "escalate to your manager" is undefined for the most common failure case.

This is the gap McKinsey's People and Organizational Performance practice describes in its October 2026 essay: work itself — tasks, workflows, roles — is changing faster than the organization around it, and the surrounding system of structures, planning, budgeting, performance management and decision rights has to be redesigned to follow[[1]](#ref-mck-2026-org). The essay's central claim is directional rather than statistical — the magnitude by which redesign-paired adopters outperform tool-only adopters sits behind the paywall — but the mechanism is visible in any operating review: the work has moved, and the chart has not.

## The orchestration chart

An orchestration chart is the companion artifact to the org chart. It is drawn as one picture with four layers, read top to bottom: the work that exists, the humans who carry it, the agents that execute parts of it, and the decision rights that govern the boundary between them.

<figure>
  <svg viewBox="0 0 760 400" role="img" aria-label="Side by side: a classic organization hierarchy tree on the left, and a four-layer orchestration chart with one mission slice highlighted on the right" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
    <defs>
      <marker id="f1-arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#8fa3b8"/>
      </marker>
    </defs>
    <text x="180" y="32" font-size="15" fill="#d7e0ea" text-anchor="middle" font-weight="600">Organization chart</text>
    <text x="180" y="50" font-size="13" fill="#8fa3b8" text-anchor="middle">who reports to whom</text>
    <rect x="140" y="64" width="80" height="30" rx="8" fill="#0d1420" stroke="#2a3a4c" stroke-width="2"/>
    <text x="180" y="84" font-size="13" fill="#d7e0ea" text-anchor="middle">COO</text>
    <path d="M 180 94 L 92 128 M 180 94 L 180 128 M 180 94 L 268 128" stroke="#2a3a4c" stroke-width="2"/>
    <rect x="54" y="128" width="76" height="28" rx="8" fill="#0d1420" stroke="#2a3a4c" stroke-width="2"/>
    <text x="92" y="147" font-size="13" fill="#d7e0ea" text-anchor="middle">Sales</text>
    <rect x="142" y="128" width="76" height="28" rx="8" fill="#0d1420" stroke="#2a3a4c" stroke-width="2"/>
    <text x="180" y="147" font-size="13" fill="#d7e0ea" text-anchor="middle">Ops</text>
    <rect x="230" y="128" width="76" height="28" rx="8" fill="#0d1420" stroke="#2a3a4c" stroke-width="2"/>
    <text x="268" y="147" font-size="13" fill="#d7e0ea" text-anchor="middle">Finance</text>
    <path d="M 92 156 L 92 192 M 180 156 L 180 192 M 268 156 L 268 192" stroke="#2a3a4c" stroke-width="2"/>
    <rect x="54" y="192" width="76" height="28" rx="8" fill="#0d1420" stroke="#2a3a4c" stroke-width="2"/>
    <text x="92" y="211" font-size="13" fill="#8fa3b8" text-anchor="middle">Reps</text>
    <rect x="142" y="192" width="76" height="28" rx="8" fill="#0d1420" stroke="#2a3a4c" stroke-width="2"/>
    <text x="180" y="211" font-size="13" fill="#8fa3b8" text-anchor="middle">Planners</text>
    <rect x="230" y="192" width="76" height="28" rx="8" fill="#0d1420" stroke="#2a3a4c" stroke-width="2"/>
    <text x="268" y="211" font-size="13" fill="#8fa3b8" text-anchor="middle">AR team</text>
    <text x="359" y="150" font-size="13" fill="#8fa3b8" text-anchor="middle">redraw</text>
    <path d="M 330 160 L 388 160" stroke="#8fa3b8" stroke-width="2" marker-end="url(#f1-arw)"/>
    <text x="560" y="32" font-size="15" fill="#d7e0ea" text-anchor="middle" font-weight="600">Orchestration chart</text>
    <text x="560" y="50" font-size="13" fill="#8fa3b8" text-anchor="middle">who orchestrates what, with what autonomy</text>
    <rect x="402" y="64" width="304" height="40" rx="10" fill="#0d1420" stroke="#8fa3b8" stroke-width="2"/>
    <text x="414" y="81" font-size="13" fill="#d7e0ea">1 · Outcomes / missions</text>
    <text x="414" y="97" font-size="13" fill="#8fa3b8">work owned end-to-end, not by department</text>
    <rect x="402" y="114" width="304" height="40" rx="10" fill="#0d1420" stroke="#69deb9" stroke-width="2"/>
    <text x="414" y="131" font-size="13" fill="#d7e0ea">2 · Humans — three working roles</text>
    <text x="414" y="147" font-size="13" fill="#8fa3b8">orchestrators · specialists · supervisors</text>
    <rect x="402" y="164" width="304" height="40" rx="10" fill="#0d1420" stroke="#80c9f8" stroke-width="2"/>
    <text x="414" y="181" font-size="13" fill="#d7e0ea">3 · Agent fleet — capability × autonomy</text>
    <text x="414" y="197" font-size="13" fill="#8fa3b8">owned and versioned like production systems</text>
    <rect x="402" y="214" width="304" height="40" rx="10" fill="#0d1420" stroke="#a694f7" stroke-width="2"/>
    <text x="414" y="231" font-size="13" fill="#d7e0ea">4 · Decision rights — gates + thresholds</text>
    <text x="414" y="247" font-size="13" fill="#8fa3b8">approval gates · reversibility thresholds</text>
    <rect x="636" y="56" width="64" height="206" rx="8" fill="#f5b968" fill-opacity="0.1" stroke="#f5b968" stroke-width="2" stroke-dasharray="5 4"/>
    <text x="560" y="280" font-size="13" fill="#f5b968" text-anchor="middle">One mission — order-to-cash — cut through all four layers</text>
    <rect x="64" y="322" width="14" height="14" rx="3" fill="#0d1420" stroke="#69deb9" stroke-width="2"/>
    <text x="86" y="334" font-size="13" fill="#8fa3b8">humans</text>
    <rect x="180" y="322" width="14" height="14" rx="3" fill="#0d1420" stroke="#80c9f8" stroke-width="2"/>
    <text x="202" y="334" font-size="13" fill="#8fa3b8">agents</text>
    <rect x="280" y="322" width="14" height="14" rx="3" fill="#0d1420" stroke="#a694f7" stroke-width="2"/>
    <text x="302" y="334" font-size="13" fill="#8fa3b8">decision rights</text>
    <rect x="460" y="322" width="14" height="14" rx="3" fill="#0d1420" stroke="#f5b968" stroke-width="2" stroke-dasharray="3 2"/>
    <text x="482" y="334" font-size="13" fill="#8fa3b8">mission slice</text>
  </svg>
  <figcaption>Figure 1 — The organization chart (left) records one reporting tree. The orchestration chart (right) stacks four layers — outcomes, humans, agents, decision rights — and cuts a single mission slice through all of them: order-to-cash work draws on every layer at once.</figcaption>
</figure>

### Layer 1: Outcomes and missions

The unit of work is the mission — an outcome owned end to end, such as "collect cash on 5,000 invoices a month" or "resolve 80% of tier-1 tickets within SLA". A mission is not a department and not a project; it is a standing outcome with exactly one accountable owner. This layer answers the question "what work exists", which the org chart answers only indirectly, through titles. How a mission is staffed and run once it leaves the whiteboard is walked through in [inside an AI-native transformation mission](/en/insights/inside-an-ai-native-transformation-mission).

### Layer 2: The humans layer

Humans appear on this chart as three working roles, not titles. Orchestrators own a mission and allocate work across humans and agents. Specialists contribute deep domain judgment and absorb the exceptions machines route to them. Supervisors watch agent behavior and own interventions — pause, correct, re-level. One person can hold several roles, and a role can be twenty percent of someone's week; what matters is that each role is named per mission. The team-design consequences of blending these roles are worked out in [designing human and AI product teams](/en/insights/designing-human-and-ai-product-teams).

### Layer 3: The agent layer

The fleet is inventoried like any production system: every agent recorded by capability (the class of tasks it performs), autonomy level (defined below), current version, owner, and the missions it serves. The inventory is not bureaucracy; it is the precondition for governance. An agent nobody registered is an approval nobody designed, and unregistered agents are where shadow workarounds begin.

### Layer 4: The decision-rights layer

For every decision point a mission touches, the chart carries three entries: the autonomy level the agent operates at, the reversibility threshold that caps it, and the named human role that holds the gate. A reversibility threshold asks a simple question: how costly or slow is it to undo this action? A draft email is reversible; a wire transfer largely is not; a customer refund sits in between. Irreversibility, not difficulty, is what should set the autonomy ceiling at each point.

<figure>
  <svg viewBox="0 0 760 430" role="img" aria-label="The autonomy ladder: five levels from assist to own outcome, each showing what the agent does, what the human approves, and the remaining gate" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
    <defs>
      <marker id="f2-arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#8fa3b8"/>
      </marker>
    </defs>
    <text x="390" y="26" font-size="15" fill="#d7e0ea" text-anchor="middle" font-weight="600">The autonomy ladder</text>
    <text x="390" y="44" font-size="13" fill="#8fa3b8" text-anchor="middle">Assign a level per decision point — reversibility sets the ceiling</text>
    <path d="M 24 356 L 24 72" stroke="#8fa3b8" stroke-width="2" marker-end="url(#f2-arw)"/>
    <text transform="translate(14 214) rotate(-90)" font-size="13" fill="#8fa3b8" text-anchor="middle">autonomy increases</text>
    <rect x="40" y="64" width="680" height="52" rx="10" fill="#0d1420" stroke="#2a3a4c" stroke-width="2"/>
    <rect x="52" y="74" width="88" height="32" rx="8" fill="#0d1420" stroke="#80c9f8" stroke-width="2"/>
    <text x="96" y="95" font-size="13" fill="#80c9f8" text-anchor="middle">Level 0</text>
    <text x="156" y="86" font-size="13" fill="#d7e0ea">Assist — agent drafts, human does the work</text>
    <text x="156" y="104" font-size="13" fill="#8fa3b8">approval: every output reviewed</text>
    <text x="708" y="95" font-size="13" fill="#f5b968" text-anchor="end">gate: everything</text>
    <rect x="40" y="124" width="680" height="52" rx="10" fill="#0d1420" stroke="#2a3a4c" stroke-width="2"/>
    <rect x="52" y="134" width="88" height="32" rx="8" fill="#0d1420" stroke="#80c9f8" stroke-width="2"/>
    <text x="96" y="155" font-size="13" fill="#80c9f8" text-anchor="middle">Level 1</text>
    <text x="156" y="146" font-size="13" fill="#d7e0ea">Recommend — agent proposes, human decides</text>
    <text x="156" y="164" font-size="13" fill="#8fa3b8">approval: every action pre-approved</text>
    <text x="708" y="155" font-size="13" fill="#f5b968" text-anchor="end">gate: every action</text>
    <rect x="40" y="184" width="680" height="52" rx="10" fill="#0d1420" stroke="#2a3a4c" stroke-width="2"/>
    <rect x="52" y="194" width="88" height="32" rx="8" fill="#0d1420" stroke="#80c9f8" stroke-width="2"/>
    <text x="96" y="215" font-size="13" fill="#80c9f8" text-anchor="middle">Level 2</text>
    <text x="156" y="206" font-size="13" fill="#d7e0ea">Bounded action — agent executes routine cases</text>
    <text x="156" y="224" font-size="13" fill="#8fa3b8">approval: exceptions only, within set bounds</text>
    <text x="708" y="215" font-size="13" fill="#f5b968" text-anchor="end">gate: exceptions</text>
    <rect x="40" y="244" width="680" height="52" rx="10" fill="#0d1420" stroke="#2a3a4c" stroke-width="2"/>
    <rect x="52" y="254" width="88" height="32" rx="8" fill="#0d1420" stroke="#80c9f8" stroke-width="2"/>
    <text x="96" y="275" font-size="13" fill="#80c9f8" text-anchor="middle">Level 3</text>
    <text x="156" y="266" font-size="13" fill="#d7e0ea">Execute and audit — agent acts, humans inspect</text>
    <text x="156" y="284" font-size="13" fill="#8fa3b8">approval: sampled audits after the fact</text>
    <text x="708" y="275" font-size="13" fill="#f5b968" text-anchor="end">gate: samples</text>
    <rect x="40" y="304" width="680" height="52" rx="10" fill="#0d1420" stroke="#2a3a4c" stroke-width="2"/>
    <rect x="52" y="314" width="88" height="32" rx="8" fill="#0d1420" stroke="#80c9f8" stroke-width="2"/>
    <text x="96" y="335" font-size="13" fill="#80c9f8" text-anchor="middle">Level 4</text>
    <text x="156" y="326" font-size="13" fill="#d7e0ea">Own outcome — agent runs the loop end to end</text>
    <text x="156" y="344" font-size="13" fill="#8fa3b8">approval: policy setting and eval design</text>
    <text x="708" y="335" font-size="13" fill="#f5b968" text-anchor="end">gate: policy + evals</text>
    <text x="390" y="392" font-size="13" fill="#f27e85" text-anchor="middle">Failure mode: autonomy creeps up a level without redrawing the gate — most governance gaps start here.</text>
  </svg>
  <figcaption>Figure 2 — The autonomy ladder. Each decision point gets a level; as autonomy rises the human gate shrinks from everything to policy and eval design. Reversibility decides how high a given decision point may go.</figcaption>
</figure>

This is the layer most organizations leave blank, and it is where the one-sentence test is won or lost: every row of a decision-rights table is an answer to "who approves this agent's action?"

## From headcount to capacity

Capacity planning is the first operating process that breaks, and the first that improves, when agents join the workforce. Planning has to count two workforces and the boundary between them. The honest evidence base for what that produces is still thin, and the best single data point is a field study rather than a survey.

Economists Erik Brynjolfsson, Danielle Li and Lindsey Raymond studied the staggered rollout of a generative-AI conversational assistant to 5,179 customer-support agents at a Fortune 500 software firm (NBER working paper, 2023, revised 2025)[[2]](#ref-brynjolfsson-2023). Because comparable agents received the tool in different months, the design supports a causal reading: issues resolved per hour rose about 15% on average. The distribution mattered more than the mean — gains were largest for the least-experienced agents, roughly 30% or more, and minimal for the most experienced. The authors attribute the value to the assistant encoding the tacit knowledge of top performers and diffusing it to everyone else.

Read as an organizational-design result rather than a productivity statistic, the study says the AI acted as a distribution mechanism for expertise: it compressed the skill curve from below. Two caveats apply before generalizing. It is one firm, in text-centric support work, so causality is strong internally and external validity is limited; and "about 15%" is an average across a rollout, not a guarantee per team.

The role-design consequences are concrete. Junior roles stop being apprenticeships solved through volume: the entry-level output floor rises toward the top-performer baseline, so juniors become supervisors of leveraged work, contributing judgment on exceptions and operating the tools themselves. Expert roles move up the stack: their scarce judgment is re-pointed at the cases agents route to them and at designing the evaluations that define what "good" looks like — the expert becomes, in part, an engineer of the agent's standards.

To see what this does to a capacity plan, consider order-to-cash collections at a mid-market distributor (an illustrative composite running a synthetic scenario — assumptions stated below). Assumptions: 5,000 invoices a month; fully manual handling averages 10 minutes per invoice, about 833 hours or 5.2 FTE at 160 hours; an invoice-matching agent at level 3 auto-clears 80% of invoices; the 1,000 exceptions take specialists 12 minutes each; sampled audits cover 5% of auto-cleared invoices at 10 minutes each; dunning drafts run at level 2 and generate about 150 exception approvals at 10 minutes; write-offs above €10,000 stay at level 0, roughly 30 controller decisions a month at 30 minutes; one orchestrator carries 80 hours.

| Mission slice | Autonomy | Human role | Hours/month |
|---|---|---|---|
| 4,000 auto-cleared invoices | L3 execute and audit | Sampled audit (200 × 10 min) | 33 |
| 1,000 exceptions | Human-led | Specialist resolution (12 min each) | 200 |
| Dunning drafts | L2 bounded action | Exception approvals (150 × 10 min) | 25 |
| Write-offs above €10,000 | L0 human decision | Controller gate (30 × 30 min) | 15 |
| Orchestration | — | Orchestrator | 80 |
| **Total human effort** | | | **353** |

Human effort on the flow falls from about 833 hours to about 353 — roughly 58% — while specialist hours concentrate entirely on exceptions and the controller keeps the irreversible decisions. The planning change matters as much as the arithmetic: agent auto-clearance rate, exception rate and audit load are now first-class inputs to the capacity model, each one an assumption to be measured and reviewed quarterly rather than a constant.

## The manager's new job description

The unit of management shifts from the direct report to the supervised queue. Span of control counts people who report to you; span of attention counts the agents, queues and humans whose behavior you must monitor and intervene on. Attention, not authority, becomes the scarce resource, and the job description changes accordingly.

Three mechanics carry it. Supervisor dashboards track per-agent and per-mission telemetry: throughput, exception rate, override rate, and breaches of autonomy bounds. Override rate is the most diagnostic number on the page — rising overrides mean either the agent is under-leveled for its gate or it is degrading, and both demand a decision. Exception queues give every level-2-and-above agent an SLA-backed queue; queue aging is a capacity signal, because a backing-up queue means the agent needs re-leveling or the human side needs reinforcement. Escalation protocols name who gets paged at which severity, including the stop switch: who can pause an agent class, how fast, and what happens to in-flight work when they do.

Microsoft's 2025 Work Trend Index gives this shift a name: the "agent boss", with every employee in its "frontier firms" effectively supervising a mix of human and agent colleagues, and org charts and work charts converging as agents enter workflows[[3]](#ref-msft-wti-2025). Treat it as a signpost, not gospel. It is vendor research — a survey of tens of thousands of workers, conducted by a company selling the agent layer — cited here via Guardian coverage of the release. The framing is still useful, because it points the same way the operating evidence does: supervising software is becoming part of ordinary management rather than a specialist function.

The redesign has a failure mode of its own: attention bankruptcy. A manager holding forty agents, two queues and no escalation protocol is worse off than one with eight reports, because failures now arrive faster than attention can. Span of attention only works when escalation design bounds it — which is why the protocol, not the dashboard, is the load-bearing artifact.

## Where to start

Start with one value stream, not with a governance program. Five moves, one quarter:

1. **Pick one value stream.** Order-to-cash is the canonical choice: measurable, approval-rich, and mostly reversible, so autonomy can be granted and withdrawn cheaply while the organization learns.
2. **Draw both charts side by side.** The org chart as it stands; the orchestration chart with missions, human roles, the agent fleet and the gates. The deltas between them are the redesign agenda.
3. **Mark every approval point.** Include the implicit ones — the informal "run it by Maria before sending" checks. Most organizations find two to three times more decision points in the flow than their policy documents show.
4. **Assign autonomy per point.** Use the ladder and the reversibility thresholds: level 0 or 1 for irreversible actions, level 2 or 3 for reversible, measured ones — and name the gate-holder and the review date for each row.
5. **Iterate quarterly.** Re-level agents using override and exception data; promote or demote autonomy deliberately; redraw as missions change. The first quarter is a calibration cycle, not a verdict, and the cadence that makes it stick is the same operating rhythm described in [the Quantiviq method](/en/method).

Before any of it, settle who owns the pen. A redrawn decision-rights table is a reallocation of power, and [who owns AI transformation](/en/insights/who-owns-ai-transformation) determines whether that reallocation happens deliberately or dies in committee. Ownership first, chart second, autonomy levels third — in that order.

## Key Takeaways

- The org chart answers who reports to whom; the orchestration chart answers who orchestrates what, with what autonomy, under whose approval. You need both, and the second is almost always missing.
- The test is one sentence: if your chart can't tell you who approves an agent's action, it's incomplete.
- Reporting, compensation and accountability stay on the org chart. Capacity planning, span of control, handoffs and escalation break on it, because headcount stopped measuring capacity.
- The orchestration chart has four layers — missions, humans, agents, decision rights — and the decision-rights layer is where governance gaps and shadow workarounds live.
- Autonomy is assigned per decision point, capped by reversibility, and reviewed quarterly; the human gate shrinks from everything to policy and eval design as levels rise.
- In the best field evidence available, a 5,179-agent rollout lifted issues per hour about 15% on average, with novice gains of 30%-plus — capacity arrives as diffused expertise, so redesign junior and expert roles, not just tooling.
- The manager's job becomes span of attention: dashboards, exception queues and escalation protocols, with override rate as the number to watch.

## What Leaders Should Do Next

1. Commission a gap audit: inventory every agent in production and every approval point it touches, and flag wherever no named human holds the gate. *(COO, first 30 days)*
2. Stand up the agent registry with autonomy levels, versions and reversibility thresholds, and make unregistered agents a policy violation rather than a faux pas. *(CTO or CIO, first 60 days)*
3. Redesign two roles explicitly: one junior role re-specified as supervisor of leveraged work, one expert role re-specified as exception handler and evaluation designer. *(CHRO, days 60-90)*
4. Wire the finance gates: map write-off, refund and payout thresholds to reversibility bands and name the controller gate for each. *(CFO, this quarter)*
5. Run the first quarterly orchestration review: override rates, exception-queue aging, autonomy promotions and demotions, and the selection of the next value stream to redraw. *(Executive committee, end of quarter one)*

## References

1. <a id="ref-mck-2026-org"></a>**McKinsey & Company (People & Organizational Performance)** — *AI is changing work. Now it has to change the organization*, Oct 5, 2026. [mckinsey.com](https://www.mckinsey.com/no/our-insights/ai-is-changing-work-now-it-has-to-change-the-organization) — the organizational-redesign argument: work is changing faster than the structures, planning, budgeting and decision rights around it; framing claims only, since exhibit magnitudes are not publicly re-quoted.
2. <a id="ref-brynjolfsson-2023"></a>**Erik Brynjolfsson, Danielle Li, Lindsey R. Raymond** — *Generative AI at Work*, Apr 2023 (revised 2025), NBER Working Paper 31161 (also arXiv:2304.11771). [nber.org](https://www.nber.org/papers/w31161) — field evidence on 5,179 support agents; causally strong within one software-support firm, limited external validity beyond text-centric work.
3. <a id="ref-msft-wti-2025"></a>**Microsoft (WorkLab)** — *Microsoft Work Trend Index 2025 — "Frontier Firms"*, Apr 24, 2025. [theguardian.com](https://www.theguardian.com/technology/2025/apr/25/microsoft-says-everyone-will-be-a-boss-in-the-future-of-ai-employees) — the "agent boss" and human-agent-team framing; vendor-sponsored research cited via Guardian coverage, directional rather than independent.
