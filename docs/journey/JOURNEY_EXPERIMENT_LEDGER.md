# JOURNEY_EXPERIMENT_LEDGER.md — Phase 1B

The full reconstructed lineage of personal experiments. The public page
publishes the curated subset marked `PUBLISH: YES`; the rest stays here as
the complete truth. Format: HYPOTHESIS → WHAT WAS BUILT → WHAT REALITY SAID
→ VERDICT → WHAT CHANGED NEXT.

Sources: `MISSION` owner-authored, `BRAIN-T` personal-trading pack
(OBSERVED/PRIMARY_SOURCE claims), `BRAIN-H` hub pack, `REPO` public repos,
`GH` live GitHub API.

---

## 1. Legacy Quantiviq trading system — post-mortem audit (2026-09-29)

- **Hypothesis (implicit, inherited):** the old hand-run Quantiviq trading
  system was a competent base to build on.
- **What we built:** forensic audit of `trading_data.db`: ~150k raw rows →
  5,241 true 1h candles + 1,316 reconstructed 4h candles recovered (rule:
  a true 4h candle = exactly 4 one-hour candles on the UTC grid, never 6);
  307 closed legacy trades reconstructed.
- **What reality said:** ~86% of trades ended STOP_HIT; win rate ~10.75%;
  realized historical PnL materially negative.
- **Verdict:** REJECTED — "the old system had been confidently wrong."
- **What changed next:** Sentinel was rebuilt around honest evaluation and
  candle reconstruction rules instead of inherited belief.
- **Evidence:** MISSION + BRAIN-T (1h-snapshot reconstruction rule, OBSERVED).
- **PUBLISH: YES** (own failure, owner-approved numbers).

## 2. Data-pooling experiment — "more data = more intelligence?"

- **Hypothesis:** pooling legacy 1h feature rows into current 5m training
  improves discrimination.
- **What we built:** identical schema/labeler/LGBM seed, two arms: current-only
  vs current+legacy; purged chronological holdout; paired bootstrap.
- **What reality said:** current-only AUC 0.6848 vs pooled 0.6763 (BRAIN-T:
  0.685 vs 0.676–0.683 band); legacy-only zero-shot transfers at chance
  (AUC 0.491); bar-size/era/base-rate domain shift dominates.
- **Verdict:** REJECTED — more data was not automatically better data.
- **What changed next:** page equation replaced: RELEVANT DATA + VALID
  EVALUATION = POSSIBLE LEARNING; era/domain shift became a first-class check.
- **Evidence:** MISSION + BRAIN-T (OBSERVED, CODE basis).
- **PUBLISH: YES** (both AUCs; mission-enumerated).

## 3. Quantiviq Sentinel — paper runtime generation

- **Hypothesis:** a disciplined pipeline can produce calibrated, abstaining
  paper decisions on live market data.
- **What we built:** LIVE MARKET → 1m/5m candles → feature factory →
  regime/state → prediction model → calibration → confidence/uncertainty →
  policy → abstain-or-propose → outcome ledger → research loop. One verified
  production generation: 22 base + 5 regime features → causal HMM →
  LightGBM → calibration → VON 0.60 gate → PAPER.
- **What reality said:** the loop matured 16,000+ paper outcomes; the
  challenger never beat the champion strongly enough to promote.
- **Verdict:** PARTIALLY PROVED — the discipline worked; no alpha promoted.
- **What changed next:** promotion gates formalized; capital stayed disabled.
- **Evidence:** MISSION + BRAIN-T (VON 0.60 immutable gate; paper posture).
- **PUBLISH: YES.**

## 4. The all-ABSTAIN episode

- **Hypothesis (stress test):** under live candidates with insufficient
  calibrated confidence, the system will manufacture a decision anyway?
- **What reality said:** it processed the live candidate set and returned
  ABSTAIN for every one.
- **Verdict:** PROMOTED (behavioral) — the system refused to manufacture
  confidence. "The first production behavior I trusted was not BUY or SELL.
  It was 'I don't know.'"
- **Evidence:** MISSION (OWNER).
- **PUBLISH: YES** — deliberately, as a highlight not a failure.

## 5. M16 — microstructure (Wallex)

- **Hypothesis:** local microstructure carries a tradeable directional signal.
- **What we built:** live collector around Wallex market data: raw trades,
  depth rollups, microprice, order-flow imbalance, shared receive clock,
  1m rollups.
- **What reality said:** real local directional information existed — but
  after transaction costs the economic edge disappeared (BRAIN-T: honest
  isotonic ceiling 0.50 vs 0.60 accept gate; every evaluated barrier
  geometry and every market cost-negative).
- **Verdict:** REJECTED — signal + fees → net edge −.
- **What changed next:** economics moved BEFORE execution in every later gate.
- **Evidence:** MISSION + BRAIN-T (edge_verdict, OBSERVED, PRIMARY_SOURCE).
- **PUBLISH: YES** (qualitative story; exact barrier-geometry counts stay internal).

## 6. M17/M18 — global context

- **Hypothesis:** external spot/perpetual fair-value and lead/impulse context
  surfaces high-edge events.
- **What we built:** global-context features + executable-price evaluation
  across short horizons (never fantasy mid-prices).
- **What reality said:** no qualifying high-edge events under the
  pre-registered economics threshold.
- **Verdict:** NO FORCED PROMOTION — the negative result was kept.
- **Evidence:** MISSION (OWNER).
- **PUBLISH: YES.**

## 7. M19 — shadow decision context

- **Hypothesis:** joining every production decision (including ABSTAIN) with
  incumbent prediction state, regime, global, microstructure and executable
  book context adds incremental net value.
- **What we built:** immutable decision-evidence store; champion untouched.
- **What reality said:** the challenger gate stayed closed; no production
  behavior changed because the experiment was interesting.
- **Verdict:** UNPROVEN / gate closed.
- **Evidence:** MISSION (OWNER).
- **PUBLISH: YES.**

## 8. Later multi-output prediction lineages

- **Hypothesis:** a multi-output stack (direction + magnitude + opportunity)
  under one policy extracts more usable evidence.
- **What we built:** candles + micro → X25 → state_v1 → huber_multi_v1 /
  mfe_multi_v1 → calibration/spread → fusion → policy → ledger.
- **What reality said (two audits):** (a) the runtime exposed multiple
  prediction "views" but only TWO genuinely independent model lineages —
  an architectural illusion; (b) one horizon audit showed prediction quality
  WORSE than simple baselines on several metrics while opportunity estimates
  were overconfident.
- **Verdict:** DO NOT PROMOTE. "Evaluation is allowed to embarrass the
  architecture."
- **What changed next:** model-diversity claims were rebuilt around genuinely
  different questions, not view count.
- **Evidence:** MISSION (OWNER).
- **PUBLISH: YES** — explicitly celebrated as discovering the illusion.

## 9. Parallel Worlds / counterfactual research

- **Hypothesis:** replaying the same decision across multiple deterministic
  scenario worlds (different assumptions) improves prediction quality.
- **What we built:** deterministic scenario-replay layer; full test suite.
- **What reality said:** implementation passed its tests; the experiment
  failed to improve prediction quality; a cost/opportunity contract
  incoherence was exposed.
- **Verdict:** REJECTED. Passing software tests proves the implementation,
  not the hypothesis.
- **Evidence:** MISSION (OWNER).
- **PUBLISH: YES.**

## 10. Smart Trader (context frame for 1–9)

- Presented as a long-running experiment in decision intelligence under
  uncertainty: Market Data → Market State → Prediction → Calibration →
  Confidence → Risk → Decision/Abstention → Outcome → Learning Evidence.
- Verified components: Python, FastAPI, event-driven runtime, market-state
  analysis, model inference, calibration, risk awareness, visualization,
  observability, production deployment. REPO + GH.
- **PUBLISH: YES.**

## 11. Phoenix — autonomy meets consequence (retired 2026-09-17)

- **Hypothesis:** fail-closed autonomous execution infrastructure can earn
  the right to act (Aave V3 liquidation, Atlas auctions, DEX arbitrage
  research on Arbitrum).
- **What we built:** Rust/Go/Python/Solidity system: SIGNAL→VERIFY→
  ECONOMICS→RISK→AUTHORITY→EXECUTION→RECONCILIATION; dual-provider
  agreement, exact economic gates, single-transaction authority, receipt and
  balance reconciliation, protected release with rehearsal/burn-in/rollback,
  deterministic fixtures, startup blocking, immutable artifacts, health
  gates. Shadow-first: LIVE_EXECUTION=false (REAL_EXECUTION=false,
  LIVE_ARMED=false; gate blocked MODE_NOT_LIVE with all preconditions true —
  BRAIN-T verified on-host).
- **What reality said:** at a mature snapshot — containers up, monitoring
  live, controls armed-ready — realized revenue was $0. Control-plane parts
  explicitly disarmed/fail-closed. An observer ran with no actionable bids.
  A deployment succeeded while execution readiness stayed false because an
  external provider was rate-limited. 39,538 shadow decisions, 0 executions
  (BRAIN-H). Retired as a disciplined shutdown with a rigorously proven
  negative result about sub-cent arbitrage on efficient Arbitrum pools.
- **Verdict:** MAJOR LEARNING / REJECTED as business — architecture is not
  edge; live ≠ ready; autonomy requires authority boundaries; fail-closed is
  a product decision; economic gates before execution; reconciliation is part
  of execution; productionization can expose a weak hypothesis; technical
  difficulty is not commercial validation.
- **Evidence:** MISSION + REPO + GH + BRAIN-T + BRAIN-H.
- **PUBLISH: YES** — unsanitized. Badges: PRODUCTION-ORIENTED R&D ·
  FAIL-CLOSED · UNPROVEN ECONOMIC EDGE · MAJOR LEARNING.

## 12. Brain — split brain and governed learning

- **Hypothesis:** a persistent learning layer makes the system smarter over
  time without becoming untrustworthy.
- **What we built:** episodic/semantic/procedural memory with provenance,
  controlled writes, reflection, procedure→skill projection, shadow
  evaluation, decay, rollback, abstention.
- **What reality said (failure mode):** a local Brain snapshot and the VPS
  Brain diverged while only one was authoritative (M4 cutover 2026-09-30;
  local writer disabled). Two stores can drift into different truths.
  Also: the research loop consults prior trajectories and avoids repeating
  failed branches (do_not_retry_conditions) while the live trading decision
  loop still does NOT consume Brain memory — an honest boundary, not a
  self-learning trader.
- **Verdict:** PARTIALLY PROVED — mechanism works; source-of-truth
  governance is the hard problem. "A system cannot learn reliably if it
  cannot answer which memory is true."
- **Evidence:** MISSION + BRAIN-T (two-layer authority verified; zero Brain
  imports in the trading decision loop, verified).
- **PUBLISH: YES** (generalized; no host paths).

## 13. Free Best Router — reliability learning in production

- **Hypothesis:** intelligence routing should be learned from live outcomes
  (reliability, latency, capability), not configured once.
- **What we built:** DISCOVER→NORMALIZE→HEALTH→CAPABILITY→RELIABILITY→
  LATENCY→RANK→ROUTE→OBSERVE→LEARN; Wilson lower bound, time-decay,
  exploration, cooldowns, bounded failover; zero telemetry.
- **Verdict:** SHIPPED — open source, 3★, running system.
- **Evidence:** GH + BRAIN-H.
- **PUBLISH: YES.**

## 14. UEA + DSH — from model to worker to long-running intelligence

- UEA: 9-stage operating kernel (INSPECT→PLAN→IMPLEMENT→VERIFY→CLASSIFY
  FAILURE→RECOVER→TEST→GENERALIZE), checkpoints, bounded retries, profiles.
  SHIPPED as MIT reference implementation.
- DSH: long-mission harness — provider abstraction, model independence,
  checkpoints, context management, bounded authority, recovery. Active R&D.
- **PUBLISH: YES** (architecture level only).

## Internal-only appendix (NOT published)

- Post-cutover promotion-gate threshold specifics (e.g., M24-style ≥7d /
  ≥100 realized >BE / both-halves capture / rho>0 / precision@20 gate, NOT
  granted at deployment) — sensitivity INTERNAL; page shows gates exist and
  stayed closed, not the thresholds.
- Exact barrier-geometry counts and per-market cost tables for the Wallex
  verdict — page shows the qualitative verdict.
- Any VPS host addresses, paths, or runtime identifiers — never on the page.

**Public-page subset rule:** an experiment ships to the page only with
(HYPOTHESIS → METHOD → OBSERVATION → VERDICT → NEXT CHANGE) all present.
Vague success claims are not allowed on this page.
