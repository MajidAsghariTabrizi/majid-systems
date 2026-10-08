# JOURNEY_EVIDENCE_MAP.md — Phase 1

Every claim the /journey experience will make, with source, confidence, and
public-safety verdict. Rule: **public proof > claims; owner-approved mission
numbers > nothing; nothing invented.**

Legend — Source: `MISSION` (owner-authored mission text), `REPO` (majid-systems
content layer, already public), `GH` (GitHub API, live-verified 2026-10),
`BRAIN-T` (personal-trading pack, read via brain_ask), `BRAIN-H` (hub pack),
`OWNER` (owner-asserted, not independently verifiable). Safe?: `YES` publish /
`GENERALIZE` (publish generalized, no employer specifics) / `NO` (internal —
ledger only).

## Scene 00 — Cold open

| Claim | Source | Confidence | Safe? | Artifact |
|---|---|---|---|---|
| "I didn't switch careers. I kept moving one layer deeper." | MISSION | owner voice | YES | — |
| "I did not arrive here from AI. I arrived here from running systems that could not afford to be wrong." | MISSION | owner voice | YES | — |

## Scene 01 — Technology (BUILDING THE MACHINE)

| Claim | Source | Confidence | Safe? | Artifact |
|---|---|---|---|---|
| Software engineering foundation: APIs, databases, Linux, web systems, Git, CI/CD, deployment, production debugging, monitoring | MISSION + REPO (principles.ts "boring parts", projects' technicalImplementation) | high | YES (generalized, no employer names) | repo READMEs |
| Production flow CODE→PR→CI→BUILD→DEPLOY→OBSERVE→RECOVER | MISSION + REPO (Phoenix protected-release model, majid-systems deploy pipeline) | high | YES | public_deploy.py, CI in repos |
| "Before managing products, I learned what it means to make software actually run." | MISSION | owner voice | YES | — |
| Early employers: Daapapp, Infinite8, SportMob (software/product engineering era) | BRAIN-H employer_history (PRIOR/OWNER) | medium — titles not stored | GENERALIZE — list names only, no role invention | — |

## Scene 02 — Product (BUILDING THE RIGHT MACHINE)

| Claim | Source | Confidence | Safe? | Artifact |
|---|---|---|---|---|
| Progression into product: discovery, hypothesis, experimentation, analytics, metrics | MISSION + BRAIN-H career_narrative ("Product to Data to Systems to AI…") | high | YES | quantiviq.xyz |
| Growth, ranking, monetization, vendor systems, customer behavior, operational products at marketplace scale | MISSION (owner-approved framing) | high as framing | GENERALIZE — industry-standard domains only, zero SnappMarket internals | — |
| Shift "Can we build it?" → "Should it exist, for whom, what changes?" | MISSION | owner voice | YES | — |
| "A product without engineering discipline is a sketch; an engineering effort without product discipline is a hobby" | BRAIN-H (self-stated, already public) | high | YES | quantiviq.xyz copy |

## Scene 03 — Agile & Organization

| Claim | Source | Confidence | Safe? | Artifact |
|---|---|---|---|---|
| Agile coaching, product transformation, team design, operating models, feedback loops | MISSION | OWNER | GENERALIZE (no client/employer specifics) | — |
| PSM I certification | MISSION ("include where appropriate") | OWNER | YES — one line, no emphasis | — |
| "Why do good people inside good companies still build slowly or build the wrong things?" | MISSION | owner voice | YES | — |
| Bottleneck line ("not always the code") | MISSION | owner voice | YES | — |

## Scene 04 — Marketplace / Q-commerce

| Claim | Source | Confidence | Safe? | Artifact |
|---|---|---|---|---|
| Marketplace/q-commerce operating domains: catalog, inventory, vendor, search, discovery, pricing, promotion, order, integration, monetization, operations | MISSION + public industry knowledge | high (generalized) | GENERALIZE — domain map only, no employer architecture/metrics/incidents/vendors | — |
| SnappMarket + Okala in employer history | BRAIN-H employer_history | medium | GENERALIZE — names may appear in employer list; zero internal detail | — |
| End-to-end tracing, root-cause investigation, data-backed decisions, platform + economic thinking developed at marketplace scale | MISSION | OWNER framing | YES as personal-capability claim | — |
| Alibaba Travels Co. in employer history (marketplace era) | BRAIN-H | medium | GENERALIZE | — |

## Scene 05 — Decision systems / markets (deep chapter)

| Claim | Source | Confidence | Safe? | Artifact |
|---|---|---|---|---|
| Micro-server experiment: real prediction runtime on small VPS — live feeds, persistence, restarts, inference, features, delayed outcomes, experiment tracking, paper decisions, evaluation, resource limits | MISSION + BRAIN-T (VPS 87.107.152.67 runtime, PAPER mode) | VERIFIED for posture | YES (no host IPs on page) | smart-trader repo |
| Legacy audit: ~150k raw rows; 5,241 true 1h candles + 1,316 reconstructed 4h recovered; 307 closed trades; ~86% STOP_HIT; ~10.75% win rate; materially negative PnL | MISSION (owner-approved numbers) + BRAIN-T corroborates candle-reconstruction rule and audit existence | high | YES — mission enumerates these as publishable "subject to final public-safety review"; they reveal only the owner's own failed system | — |
| "First useful result was not a profitable model. It was learning the old system had been confidently wrong." | MISSION | owner voice | YES | — |
| Data-pooling: current-only AUC 0.6848 vs current+legacy 0.6763 | MISSION + BRAIN-T (0.685 vs 0.676–0.683; legacy-only zero-shot 0.491 = chance; domain shift dominates) | VERIFIED | YES | — |
| Sentinel pipeline: live market → 1m/5m candles → feature factory → regime → model → calibration → confidence → policy → abstain/propose → outcome ledger → research loop | MISSION + BRAIN-T | high | YES | — |
| One production generation: 22 base + 5 regime features → causal HMM → LightGBM → calibration → VON 0.60 gate → PAPER | MISSION + BRAIN-T (VON gate 0.60 immutable) | VERIFIED | YES | — |
| All-ABSTAIN episode on live candidates | MISSION | OWNER | YES — behavioral, not performance claim | — |
| 16,000+ matured paper outcomes; challenger never beat champion strongly enough to promote | MISSION + BRAIN-T (M24-style promotion gates exist and were NOT granted) | high | YES | — |
| Research-discipline evolution: persist decisions incl. ABSTAIN, delayed outcomes, champion/challenger, frozen incumbent, walk-forward, calibration, selective precision/coverage, net economics, baselines, promotion gates, capital disabled, negative results terminate | MISSION + BRAIN-T | VERIFIED pattern | YES | — |
| Model families as questions (HMM/LightGBM/calibration/Huber/MFE/fusion/uncertainty gate) | MISSION | OWNER | YES | — |
| M16 microstructure: Wallex raw trades, depth rollups, microprice, OFI, shared receive clock, 1m rollups; local directional info died after transaction costs | MISSION + BRAIN-T (isotonic ceiling 0.50 vs 0.60 gate; all barrier geometries cost-negative; no cost-adjusted edge on Wallex TMN 5m) | VERIFIED | YES — own experiment, public Wallex is a public exchange name already used in repo topics | — |
| M17/M18 global context: spot/perp fair-value, lead/impulse, executable-price evaluation; no qualifying high-edge events under pre-registered threshold; NO FORCED PROMOTION | MISSION | OWNER | YES | — |
| M19 shadow decision context: decisions incl. ABSTAIN joined w/ incumbent/regime/global/micro/book context, immutable; challenger gate stayed closed | MISSION | OWNER | YES | — |
| Later lineages: candles+micro → X25 → state_v1 → huber_multi_v1/mfe_multi_v1 → calibration/spread → fusion → policy → ledger | MISSION | OWNER | YES | — |
| Audit: many "views" but only TWO genuinely independent model lineages (architectural illusion) | MISSION | OWNER | YES | — |
| Horizon audit: worse than simple baselines on several metrics; opportunity estimates overconfident; DO NOT PROMOTE | MISSION | OWNER | YES | — |
| Parallel Worlds: deterministic scenario replays; implementation passed tests; hypothesis still failed; rejected after cost/opportunity contract incoherence | MISSION | OWNER | YES | — |
| Smart Trader as decision-intelligence experiment: Python, FastAPI, event-driven runtime, market-state analysis, inference, calibration, risk, visualization, observability, deployment | MISSION + REPO (smart-trader project entry) + GH | VERIFIED | YES | github.com/MajidAsghariTabrizi/smart-trader |

### Scene 05F — Phoenix

| Claim | Source | Confidence | Safe? | Artifact |
|---|---|---|---|---|
| Flow SIGNAL→VERIFY→ECONOMICS→RISK→AUTHORITY→EXECUTION→RECONCILIATION | REPO (projects.ts phoenix pipeline) | VERIFIED | YES | repo |
| Stack: Rust, Go, Python, Solidity, PostgreSQL, NATS JetStream, Prometheus, Docker, GitHub Actions, Arbitrum, Aave, provider/RPC validation, protected execution, fail-closed, economic gates, receipt/balance reconciliation, controlled release/rollback | REPO + GH (languages live-verified) | VERIFIED | YES | anti-gravity-phoenix-v4 |
| Shadow-first: LIVE_EXECUTION=false explicit safety posture (REAL_EXECUTION=false, LIVE_ARMED=false; gate blocked MODE_NOT_LIVE with all preconditions true) | MISSION + BRAIN-T (verified on-host) | VERIFIED | YES | — |
| Engineering behaviors: deterministic fixtures, startup blocking on invalid deps, immutable/versioned artifacts, migration/state checks, health gates, rollback, manual-only live transition | REPO (projects.ts decisions/whatIBuilt) | VERIFIED | YES | — |
| Zero realized revenue at mature snapshot; disarmed control plane; observer with no actionable bids; deployment succeeded while readiness=false (rate-limited provider) | MISSION + BRAIN-H (39,538 shadow decisions, 0 executions, $0 revenue; proven negative re sub-cent arbitrage on efficient Arbitrum pools) | VERIFIED | YES | — |
| RETIRED 2026-09-17 as disciplined shutdown | BRAIN-H | VERIFIED | YES — journey presents Phoenix as retired with verdict badges (site-wide /work status fix is out of scope here; journey page carries the correct story) | — |
| 8 lessons + core line ("how much structure must exist before autonomy deserves authority") | MISSION | owner voice | YES | — |

## Scene 06 — Free Best Router

| Claim | Source | Confidence | Safe? | Artifact |
|---|---|---|---|---|
| Decision model DISCOVER→NORMALIZE→HEALTH→CAPABILITY→RELIABILITY→LATENCY→RANK→ROUTE→OBSERVE→LEARN | MISSION + GH desc | high | YES | free-best-router |
| Features: OpenAI-compatible endpoint, multi-provider (OpenRouter/Groq/Cerebras/Mistral/DeepSeek), auto discovery, health checks, capability-aware ranking, runtime stats, Wilson lower bound, time-decay, exploration, cooldowns, bounded fallback, streaming, local models, DSH integration, zero telemetry | MISSION + BRAIN-H (verified repo description) | VERIFIED | YES | 3★ public repo |

## Scene 07 — UEA

| Claim | Source | Confidence | Safe? | Artifact |
|---|---|---|---|---|
| Operating kernel, not a model; 9-stage lifecycle INSPECT→PLAN→IMPLEMENT→VERIFY→CLASSIFY→RECOVER→TEST→GENERALIZE | MISSION + GH desc ("profile-agnostic operating-kernel contract") | VERIFIED | YES | universal-engineering-agent (MIT) |
| Context budgeting, staged missions, tool hygiene, verification stages, failure classification, bounded retries, checkpoints, self-tests, profile-agnostic, vendor-independent | MISSION + REPO/README | high | YES | — |

## Scene 08 — DSH

| Claim | Source | Confidence | Safe? | Artifact |
|---|---|---|---|---|
| Architecture: MODEL/ROUTER/AGENT RUNTIME/TOOLS/CONTEXT/CHECKPOINTS/MEMORY/APPROVAL/VERIFICATION/RECOVERY/PROJECT PROFILE | MISSION | OWNER | YES (no private code/ops data) | — |
| Evolution: single prompts → long missions, tool execution, provider abstraction, checkpoints, context management, model independence, bounded authority, failure recovery, reusable roles | MISSION + BRAIN-H (DSH plugin ecosystem forks public) | OWNER | YES | — |

## Scene 09 — Brain

| Claim | Source | Confidence | Safe? | Artifact |
|---|---|---|---|---|
| Mechanism: OBSERVE→UNDERSTAND→ACT→MEASURE→REFLECT→LEARN→REUSE; next task starts with more context | MISSION | OWNER | YES | — |
| Layers: episodic / semantic / procedural memory, evidence-provenance, retrieval, reflection, skill formation | MISSION + brain skill/contract (public DSH tooling) | high | YES | — |
| Techniques: lexical/semantic/graph retrieval, provenance, controlled writes, reflection candidates, procedure→skill, shadow evaluation, reinforcement, decay/staleness, rollback/rejection, abstention | MISSION | OWNER | YES | — |
| "Learning is governed" | MISSION | owner voice | YES | — |
| Split-brain failure: local snapshot vs VPS brain diverged; only one authoritative (M4 cutover 2026-09-30; local learn disabled) | MISSION + BRAIN-T (verified two-layer naming + authority) | VERIFIED | YES — generalized, no host paths on page | — |
| Boundary honesty: research loop consults prior trajectories (do_not_retry_conditions) while live trading decision loop does NOT consume Brain memory | MISSION + BRAIN-T (verified: zero Brain imports in trading decision loop) | VERIFIED | YES | — |

## Scene 10 — Convergence

| Claim | Source | Confidence | Safe? | Artifact |
|---|---|---|---|---|
| Quantiviq architecture stack (7 layers) + "career becomes the architecture" | MISSION + live site | VERIFIED | YES | quantiviq.xyz |

## Cross-cutting

| Item | Decision |
|---|---|
| Résumé escape hatch | No binary résumé exists; build print-optimized `/resume` route (server-rendered, printable to PDF) + link to existing `/profile` |
| Employer confidentiality | Employer NAMES allowed (owner-stored list); zero internal architecture, metrics, incidents, vendors, hosts, or role titles not publicly stated |
| INTERNAL-sensitivity brain claims (e.g., exact promotion-gate thresholds post-cutover, barrier-geometry counts) | NOT published; stay in this ledger |
| Evidence badges | SHIPPED / PRODUCTION / OPEN SOURCE / EXPERIMENT / LEARNING SYSTEM / PRODUCT IMPACT / REJECTED EXPERIMENT / NEGATIVE RESULT / UNPROVEN / ABSTAINED |
| Anti-invention rule | Any number shown on the page must trace to MISSION enumeration, REPO, live GH API, or BRAIN-T corroboration — otherwise it does not ship |
