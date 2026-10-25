---
id: "10"
slug: designing-human-and-ai-product-teams
title: Designing Human + AI Product Teams
subtitle: >-
  When agents do a third of the tasks, every discipline's contract changes —
  not just engineering. The workable pattern is an explicit responsibility
  re-split and a designed human-agent interface.
excerpt: >-
  Humans own judgment, escalation, evaluation and taste; agents own throughput
  inside proven capability; the interface between them — queues, review
  protocols, eval harnesses — is a designed artifact.
pillar: ai-native-operations
tags: [team-design, human-ai-collaboration, team-topologies, product-teams, ai-squads]
author_id: quantiviq-research
published_at: "2026-10-24"
updated_at: "2026-10-24"
status: published
hero_image: /insights/heroes/10.svg
hero_alt: >-
  Conceptual mission-slice diagram: human roles and an agent fleet separated
  by a designed interface of work queues, review protocols and eval harnesses.
hero_caption: >-
  Original conceptual artwork: one outcome, one team — humans on one side,
  agents on the other, and the interface between them drawn as deliberately
  as the org chart.
seo_title: >-
  Human + AI Product Teams: The Responsibility Re-Split
seo_description: >-
  Product team contracts when agents do the throughput work: the
  keeps/delegates/supervises re-split, the designed interface, and the
  topologies that work.
primary_term: human ai product team design
secondary_terms: [ai product team roles, ai team topology, product team responsibilities ai, ai squad design]
source_ids: [dellacqua-2023, brynjolfsson-2023, msft-wti-2025, mck-2026-org]
featured: false
discussion_questions:
  - "In our last release, which tasks were inside versus outside the agents' proven capability frontier — and who decided, on what evidence?"
  - "If we wrote every team member's contract as 'keeps / delegates / supervises', how many roles would show an empty supervises column?"
  - "Where is our central AI team a bottleneck today — and which mission team could own its own agents if the platform made it safe to?"
related_article_ids: ["09", "13", "03"]
---

When agents join product delivery, the workable pattern is an explicit re-split of responsibilities: humans own judgment, escalation, evaluation and taste; agents own throughput inside the band of proven capability; and the interface between them — work queues, review protocols, evaluation harnesses — is a designed artifact, specified as carefully as the org chart ever was. Role titles mostly survive this transition; role contracts do not. Teams that make the re-split explicit get compounding throughput; teams that don't get quiet role erosion and a governance gap that surfaces at the worst moment.

The evidence base for re-splitting rather than downsizing is stronger than most AI-management commentary acknowledges. Brynjolfsson, Li and Raymond's study of 5,179 customer-support agents — a staggered-rollout quasi-experiment published as NBER Working Paper 31161 — found an AI assistant raised issues resolved per hour by about 15% on average, with the largest gains for less-experienced workers and minimal gains for the most experienced.[[2]](#ref-brynjolfsson-2023) The mechanism matters more than the average: the assistant diffused the tacit knowledge of top performers to everyone else. AI here did not replace the workforce's skill; it redistributed it. Dell'Acqua and colleagues' randomized field experiment with 758 BCG consultants found consultants with AI completing 12.2% more tasks, 25.1% faster, at over 40% higher quality — on tasks inside the AI's capability frontier, whose boundary the consultants could not reliably see.[[1]](#ref-dellacqua-2023) Together the two studies ground the whole design problem: capability is jagged, so tasks split by frontier position, not by job title; and the value flows through humans at every level, so the team design question is how to arrange the humans, not whether to keep them.

## Executive Summary

- Split tasks by frontier position, not job title: inside proven capability, agents take throughput; at or beyond the boundary, humans keep the work and agents assist.[[1]](#ref-dellacqua-2023)
- Every discipline's contract changes — discovery, research, design, engineering, QA, release, monitoring — not just engineering's.
- The human-agent interface (work queues, review protocols, escalation paths, eval ownership) is a designed artifact with named owners; left undesigned, it decays into shadow queues and rubber-stamped approvals.
- The tacit-knowledge diffusion finding reframes junior roles: novices become supervisors of leveraged work, and the diffusion effect — largest gains for the least experienced — is a structural argument for staffing teams with them.[[2]](#ref-brynjolfsson-2023)
- Team topologies that work: platform team for shared capability, mission teams owning outcomes with their own agent fleets, governance embedded per mission. The anti-pattern is the central AI team that owns every agent and becomes the organization's new bottleneck.[[4]](#ref-mck-2026-org)

## The evidence for re-splitting, honestly read

Two field studies, read together, define the design space.

The **support-agent study** (5,179 agents, staggered rollout, one firm, text-centric work) showed ~15% average productivity gains with a novice-skewed distribution: the newest workers improved most, because the assistant encoded what the best workers already knew.[[2]](#ref-brynjolfsson-2023) External validity has limits — one company, one task type, one assistant — but the internal mechanism (knowledge diffusion) travels well: wherever tacit expertise exists and newcomers struggle to acquire it, a well-built assistant compresses the learning curve.

The **consulting experiment** (758 consultants, randomized, 18 realistic tasks) showed large gains inside the frontier and, critically, that consultants *misjudged* where the frontier was — sometimes abandoning sound judgment for AI suggestions outside the capability band, sometimes failing to use AI where it would have helped.[[1]](#ref-dellacqua-2023) The experiment also surfaced two integration patterns that predicted different outcomes: "centaurs," who split tasks between self and AI by capability, and "cyborgs," who interleaved deeply. For team design, the finding is uncomfortable and useful: the frontier is invisible to the people working at it, so task assignment by frontier position must be an *organizational* act — probed with evaluation evidence and written into the mission's autonomy contract — rather than left to individual judgment in the flow of work.

## Discipline by discipline: the contract changes

The re-split per discipline, in the format *was → now*, with what agents take and what humans keep:

| Discipline | Was | Now | Agents take | Humans keep |
| --- | --- | --- | --- | --- |
| Product discovery | Stakeholder interviews, market reads, roadmap | Outcome ownership with authority over the producing system | Research synthesis, usage-pattern analysis, competitor scans | Outcome selection, trade-off judgment, stakeholder trust |
| User research | Study design, interviews, reports | Study design + signal architecture; AI drafts, humans verify | Transcription, clustering, draft findings | Study design, interpretation, the ethics of what to ask |
| Design | Wireframes, prototypes, specs | Direction + taste; agents produce variants | Variant generation, layout drafts, copy options | Aesthetic judgment, brand voice, accessibility calls |
| Engineering | Implementation | Fleet engineering: prompts, tools, orchestration, evals | Boilerplate, tests, migrations, first drafts | Architecture, review of agent output, hard problems |
| QA | Manual checklists | Evaluation engineering: golden sets, rubrics, regression | Test execution, grading where reliable | Distribution design, rubric honesty, sampled verification |
| Release | Release train, checklists | Guarded rollout policy: traffic ramps, holdouts, rollback | Deployment mechanics, dashboard assembly | Risk calls, promotion decisions, rollback triggers |
| Monitoring | Uptime, error rates | Behavior drift: input/output distribution, override rate, cost per outcome | Anomaly detection, alert drafting | Triage judgment, escalation, the decision to kill |

Two rows deserve comment. **Design** is the discipline where "agents take throughput" is weakest and most contested — variant generation is genuinely useful, but taste, brand voice and accessibility judgment are exactly the kind of contextual, high-stakes judgment the jagged frontier warns about; the table's split (agents produce, humans choose) is the defensible line. **QA → evaluation engineering** is the row with the largest skill upgrade: from executing checklists to designing statistical distributions, which is a promotion of the discipline's craft, developed fully in the [evaluation framework](/en/insights/ai-agent-evaluation-for-business-outcomes).

## The designed interface

The interface is where human-agent teams live or die, and it has four named components:

<figure>
  <svg viewBox="0 0 760 330" role="img" aria-label="Mission slice diagram: human roles on the left, a designed interface column in the middle with work queues, review protocols, escalation paths and eval ownership, and the agent fleet on the right" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
    <defs>
      <marker id="f10-arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill="#8fa3b8"/>
      </marker>
    </defs>
    <text x="380" y="34" text-anchor="middle" font-size="15" font-weight="700" fill="#d7e0ea">One outcome, one mission slice: the designed interface</text>
    <rect x="30" y="70" width="180" height="220" rx="12" fill="#0d1420" stroke="#69deb9" stroke-width="2"/>
    <text x="120" y="96" text-anchor="middle" font-size="14" font-weight="700" fill="#69deb9">Humans</text>
    <text x="120" y="126" text-anchor="middle" font-size="13" fill="#d7e0ea">mission lead</text>
    <text x="120" y="150" text-anchor="middle" font-size="13" fill="#d7e0ea">domain experts</text>
    <text x="120" y="174" text-anchor="middle" font-size="13" fill="#d7e0ea">eval engineer</text>
    <text x="120" y="198" text-anchor="middle" font-size="13" fill="#d7e0ea">governance partner</text>
    <text x="120" y="236" text-anchor="middle" font-size="13" fill="#8fa3b8">judgment · escalation</text>
    <text x="120" y="256" text-anchor="middle" font-size="13" fill="#8fa3b8">evaluation · taste</text>
    <rect x="280" y="70" width="200" height="220" rx="12" fill="#0d1420" stroke="#f5b968" stroke-width="2"/>
    <text x="380" y="96" text-anchor="middle" font-size="14" font-weight="700" fill="#f5b968">Interface</text>
    <text x="380" y="126" text-anchor="middle" font-size="13" fill="#d7e0ea">work queues</text>
    <text x="380" y="150" text-anchor="middle" font-size="13" fill="#d7e0ea">review protocols</text>
    <text x="380" y="174" text-anchor="middle" font-size="13" fill="#d7e0ea">escalation paths</text>
    <text x="380" y="198" text-anchor="middle" font-size="13" fill="#d7e0ea">eval harness</text>
    <text x="380" y="236" text-anchor="middle" font-size="13" fill="#8fa3b8">named owners</text>
    <text x="380" y="256" text-anchor="middle" font-size="13" fill="#8fa3b8">latency targets</text>
    <rect x="550" y="70" width="180" height="220" rx="12" fill="#0d1420" stroke="#80c9f8" stroke-width="2"/>
    <text x="640" y="96" text-anchor="middle" font-size="14" font-weight="700" fill="#80c9f8">Agent fleet</text>
    <text x="640" y="126" text-anchor="middle" font-size="13" fill="#d7e0ea">analysis agents</text>
    <text x="640" y="150" text-anchor="middle" font-size="13" fill="#d7e0ea">drafting agents</text>
    <text x="640" y="174" text-anchor="middle" font-size="13" fill="#d7e0ea">monitoring agents</text>
    <text x="640" y="236" text-anchor="middle" font-size="13" fill="#8fa3b8">throughput inside</text>
    <text x="640" y="256" text-anchor="middle" font-size="13" fill="#8fa3b8">proven capability</text>
    <line x1="210" y1="160" x2="278" y2="160" stroke="#8fa3b8" stroke-width="2" marker-end="url(#f10-arw)"/>
    <line x1="480" y1="160" x2="548" y2="160" stroke="#8fa3b8" stroke-width="2" marker-end="url(#f10-arw)"/>
    <line x1="480" y1="210" x2="548" y2="210" stroke="#f27e85" stroke-width="2" marker-end="url(#f10-arw)"/>
    <text x="514" y="232" text-anchor="middle" font-size="13" fill="#f27e85">overrides</text>
  </svg>
  <figcaption>Figure 1 — The mission slice: humans own judgment, escalation, evaluation and taste; agents own throughput inside proven capability; the interface between them — queues, protocols, escalation, eval ownership — is drawn as deliberately as the org chart.</figcaption>
</figure>

**Work queues.** Every agent action class routes somewhere: autonomous (no queue), sampled review (a sample lands in the review queue), full approval (every action queues). Queue depth and latency are team metrics — a review queue growing without bound is a design failure, not a work ethic. The [supervision-design analysis](/en/insights/human-in-the-loop-vs-human-on-the-loop) covers the autonomy assignment; the team-design point is that queue ownership is a named role, usually the senior specialist on the mission.

**Review protocols.** Sample rates set by risk tier and adjusted by observed error rate; review latency targets with escalation on breach; inter-rater checks when rubric grading is distributed. The deadly failure is rubber-stamping under load — approvals that take eight seconds each are not reviews. Protocols should include a "review quality" spot check by a second reviewer on a small sample, precisely because rubber-stamping is invisible in the approval counts.

**Escalation paths.** Agents flag uncertainty; queues timeout to humans; humans can pull the kill switch. The path must survive the org chart's off-hours: who is the named approver at 2am, and do they have the authority the runbook claims they have?

**Eval harness ownership.** The golden set, the rubric, the regression suite — owned by the evaluation engineer (the QA role's successor), graded with domain experts on a weekly cadence. This is the artifact that makes the frontier visible in *your* data, which is the only place it is visible at all.[[1]](#ref-dellacqua-2023)

Microsoft's Work Trend Index 2025 calls the resulting role for everyone "agent boss" — every employee supervising AI collaborators — inside what it brands "frontier firms." It is vendor-sponsored research with a product agenda behind it; use it as a directional signpost that mainstream organizations are being told to expect exactly this supervisory skill at every level, and design for the real version rather than the branding.[[3]](#ref-msft-wti-2025)

## Team topologies that work

Three team types, one anti-pattern:

**The platform team** builds shared capability: the agent infrastructure, the eval tooling, the connector library, the governance rails. It is measured by how little each mission team must build. **Mission teams** own outcomes — one outcome each, with their own agent fleets, their own golden sets, their own review protocols, drawing on platform capability. **The governance partner** is embedded part-time across missions rather than sitting in a central approval committee; the [governance-by-design model](/en/insights/agentic-ai-governance-by-design) details the controls this role operates.

The anti-pattern is the **central AI team** that owns every agent, every eval set and every deployment. It starts innocently (capability concentration, quality control) and ends as the organization's new bottleneck: a queue in front of every mission, with the domain experts who know what "good" looks like structurally separated from the engineers who build toward it. McKinsey's October 2026 argument — that the organization around the work must change, or the work's gains stay local — describes this failure precisely: capability concentrated in one team is an organizational design choice, and the wrong one for compounding.[[4]](#ref-mck-2026-org) The [orchestration-chart analysis](/en/insights/from-org-charts-to-orchestration-charts) develops the structural view; the team-level rule of thumb is: if a mission cannot ship a prompt change without a central team's ticket, the topology is wrong.

## Key Takeaways

- Split tasks by frontier position, not job title — and make the assignment organizational (probed, written, contracted) because the frontier is invisible to the people at it.[[1]](#ref-dellacqua-2023)
- The novice-skewed diffusion finding is a staffing argument: build teams where less-experienced members supervise leveraged work and learn faster for it.[[2]](#ref-brynjolfsson-2023)
- Each discipline's contract changes along keeps/delegates/supervises lines; QA's shift to evaluation engineering is the largest skill upgrade.
- The interface — queues, protocols, escalation, eval ownership — is a designed artifact with named owners and its own metrics, including review quality.
- Platform team for capability, mission teams for outcomes, embedded governance; the central-AI-team anti-pattern is a bottleneck wearing a quality badge.[[4]](#ref-mck-2026-org)

## What Leaders Should Do Next

1. **Write the keeps/delegates/supervises contract for one mission team.** (Mission lead + team, first 30 days.) One page per role; empty "supervises" columns are the diagnostic — someone supervises every autonomous action class, or it is not autonomous.
2. **Run a frontier probe on the team's current task set.** (Evaluation engineer, first 30 days.) A few hundred real tasks against the fleet; the result is the task-split evidence the autonomy contract cites.[[1]](#ref-dellacqua-2023)
3. **Stand up the interface artifacts.** (Mission lead, first 60 days.) Queues with owners and latency targets, review protocols with risk-tiered sampling, escalation runbook with named off-hours approvers, eval harness under the evaluation engineer.
4. **Add interface metrics to the team's weekly review.** (Team leads, first 60 days.) Queue depth, review latency, override rate, sampled review-quality checks — next to the outcome metric, not instead of it.
5. **Audit the platform boundary.** (CTO, first 90 days.) List everything a mission team cannot change without a central ticket; each item is either a justified safety rail or a bottleneck to remove. Publish the list and the decision for each.

## References

1. <a id="ref-dellacqua-2023"></a>**Dell'Acqua et al.** — *Navigating the Jagged Technological Frontier*, HBS WP 24-013 (2023), Organization Science (2025), 10.1287/orsc.2025.21838. [pubsonline.informs.org](https://pubsonline.informs.org/doi/10.1287/orsc.2025.21838) — 758-consultant randomized field experiment; frontier-dependent gains, invisible boundary.
2. <a id="ref-brynjolfsson-2023"></a>**Brynjolfsson, Li & Raymond** — *Generative AI at Work*, NBER Working Paper 31161 (2023, revised). [nber.org](https://www.nber.org/papers/w31161) — 5,179 support agents, staggered rollout; ~15% average gain, novice-skewed; one firm.
3. <a id="ref-msft-wti-2025"></a>**Microsoft** — *Work Trend Index 2025 ("Frontier Firms")*, Apr 24, 2025; cited via Guardian coverage. [theguardian.com](https://www.theguardian.com/technology/2025/apr/25/microsoft-says-everyone-will-be-a-boss-in-the-future-of-ai-employees) — vendor-sponsored research; directional signpost on supervision-as-skill.
4. <a id="ref-mck-2026-org"></a>**McKinsey & Company** — *AI is changing work. Now it has to change the organization*, Oct 5, 2026. [mckinsey.com](https://www.mckinsey.com/no/our-insights/ai-is-changing-work-now-it-has-to-change-the-organization) — organizational redesign as the precondition for compounding value.
