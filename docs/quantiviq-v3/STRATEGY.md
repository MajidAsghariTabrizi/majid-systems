# STRATEGY — audiences, offer ladder, conversion — 2026-10-18

## Audiences and their questions
| Audience | The question they arrive with |
|---|---|
| **CEO / founder** | "Where is the real AI opportunity in *my* company, and what do I do first?" — wants leverage and a sequence, not tooling talk. |
| **COO / function leader** | "One of my functions is drowning in manual work. Can it actually be rebuilt, or just 'optimized'?" — wants the before/after of a working loop. |
| **CTO / technical leader** | "Is this person rigorous? Do they build real systems or slide decks?" — wants architecture, trade-offs, negative results, public code. |
| **Strategic partner** (consultancy, studio, platform) | "Is there a credible counterpart for the engineering side of what we sell?" — wants proof of delivery discipline and a clean interface to collaborate through. |

## Offer ladder
### A — AI-Native Opportunity Diagnostic
- **Who for:** CEO/founder of a 20–500-person company that suspects AI matters but has only scattered experiments.
- **Symptoms:** pilot graveyard, tool subscriptions nobody uses, board asking for "the AI plan," no shared vocabulary between leadership and builders.
- **Deliverables:** a mapped inventory of candidate loops (ranked by value/feasibility), 2–3 opportunity briefs with honest sizing, a sequenced first-90-days path, one working demonstration of the top loop.
- **Not promised:** transformation, ROI figures, vendor selection, headcount plans.
- **CTA:** "Start with the diagnostic" → contact prefilled `intent=diagnostic`.

### B — Rebuild One Function
- **Who for:** COO/function leader owning a function drowning in manual coordination (reporting, ops handoffs, intake, QA).
- **Symptoms:** the function is a spreadsheet-and-chat pipeline; every hire adds coordination cost; data exists but decisions still ride on gut feel.
- **Deliverables:** one function redesigned as an instrumented, agent-assisted loop; working software in production use by the client team; the operating doc; a handover the team can run and extend.
- **Not promised:** replacing the team, "full automation," outcomes for functions we have not examined.
- **CTA:** "Rebuild a function" → `intent=rebuild-function`.

### C — Agent & Intelligence Infrastructure
- **Who for:** CTO/technical leader who needs the substrate — routing, runtimes, evaluation, observability — not another wrapper.
- **Symptoms:** model spend opaque, agents unreliable or unauditable, eval theater, every team rebuilding the same scaffolding.
- **Deliverables:** a model-router/agent-runtime architecture fitted to the org; reference deployments wired to their real data paths; evaluation harness with baselines; runbooks and cost envelopes.
- **Not promised:** exclusive vendor lock-in, benchmark leaderboard results, tuning proprietary frontier models.
- **CTA:** "Build the infrastructure" → `intent=infrastructure`.

### D — AI Transformation Partnership
- **Who for:** CEO + leadership team committing to a multi-quarter arc across several functions; entry normally via A, B, or C.
- **Symptoms:** strategy exists on paper but the org cannot execute it; AI initiatives die between departments; leadership wants one accountable counterpart.
- **Deliverables:** rolling diagnostic→rebuild→infrastructure cycles with exit ramps at each quarter; leadership cadence (reviews, decisions, kill criteria); a growing library of the org's own working loops.
- **Not promised:** fixed-duration "transformation," guaranteed KPIs, change-management theater.
- **CTA:** "Discuss a partnership" → `intent=partnership`.

## CTA map
- **Hero** → two paths only: primary "Start with the diagnostic" (contact, `intent=diagnostic`), secondary "See the system" (scroll to simulator/OS diagram).
- **Each narrative beat** ends with one intent-prefilled contact link matched to its offer (beat about functions → B; beat about infrastructure → C; closing beat → D or A). Never a bare "Contact us."
- **Proof surfaces** (work/notes/open-source) → CTA is the offer whose evidence is on screen.
- Every contact link carries `?intent=<ladder-key>`; the lead contract (LEAD_CONTRACT.md) consumes it.

## Conversion principles
1. **Substance-first:** every screen gives something away (a model, a mechanism, a negative result) before it asks.
2. **No fake scarcity:** no countdowns, no "only 2 slots left," no inflated client counts.
3. **Honest status labels:** say what is live, what is a demonstration, what is archived (see PROOF_AUDIT.md) — the honesty is the brand.
