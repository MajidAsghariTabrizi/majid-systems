/**
 * THE CONVERGENCE — typed journey content model.
 *
 * Single source of truth for /journey. The visual experience renders from
 * this structured data; nothing story-critical lives in JSX.
 *
 * Evidence rule (JOURNEY_EVIDENCE_MAP.md): every claim traces to
 * MISSION (owner-authored) · REPO (majid-systems) · GH (live GitHub API,
 * verified 2026-10) · BRAIN (personal-trading / hub packs via brain_ask) ·
 * OWNER. No invented claims, no employer internals.
 */

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type EvidenceKind =
  | 'SHIPPED'
  | 'PRODUCTION'
  | 'OPEN SOURCE'
  | 'EXPERIMENT'
  | 'LEARNING SYSTEM'
  | 'PRODUCT IMPACT'
  | 'REJECTED EXPERIMENT'
  | 'NEGATIVE RESULT'
  | 'UNPROVEN'
  | 'ABSTAINED';

export type EvidenceBasis = 'MISSION' | 'REPO' | 'GH' | 'BRAIN' | 'OWNER';

export type Evidence = {
  kind: EvidenceKind;
  detail: string;
  /** One or more bases joined by ' · ' — every token must be an EvidenceBasis. */
  basis: string;
  href?: string;
};

export type Verdict =
  | 'PROVED'
  | 'PARTIALLY PROVED'
  | 'ABSTAINED'
  | 'REJECTED'
  | 'FAILED'
  | 'UNPROVEN'
  | 'PROMOTED'
  | 'NO FORCED PROMOTION'
  | 'DO NOT PROMOTE'
  | 'MAJOR LEARNING';

export type Experiment = {
  id: string;
  project: string;
  generation: string;
  hypothesis: string;
  built: string;
  reality: string;
  verdict: Verdict;
  next: string;
  badges: EvidenceKind[];
  basis: EvidenceBasis;
};

export type GraphLayerKey =
  | 'tech'
  | 'product'
  | 'org'
  | 'market'
  | 'markets'
  | 'ai'
  | 'agents'
  | 'learning';

export type Artifact = {
  label: string;
  kind: 'repo' | 'route' | 'site' | 'doc';
  href: string;
};

export type JourneyNode = {
  id: string;
  era: string;
  layer: GraphLayerKey;
  title: string;
  thesis: string;
  evidence: Evidence[];
  capabilities: string[];
  artifacts: Artifact[];
  connections: string[];
  source: string;
};

export type Stage = { k: string; note: string };

export type Scene = {
  id: string;
  index: number;
  kicker: string;
  theme: string;
  headline: string;
  body: string[];
  loopStage: string;
  layers: GraphLayerKey[];
  nodeId: string;
  source: string;
};

/* ------------------------------------------------------------------ */
/* Identity + chrome                                                   */
/* ------------------------------------------------------------------ */

export const JOURNEY_META = {
  title: 'The Convergence — Majid Asghari Tabrizi',
  description:
    'One career. Deeper layers. How 15 years of technology, product, organizations, marketplaces, decision systems, agents and learning systems converged into Quantiviq — with the experiments that failed along the way.',
  url: 'https://quantiviq.xyz/journey',
} as const;

export const JOURNEY_OPEN = {
  line1: 'I didn’t switch careers. I kept moving one layer deeper.',
  line2: 'I did not arrive here from AI. I arrived here from running systems that could not afford to be wrong.',
  cue: 'SCROLL TO TRACE THE SYSTEM ↓',
  firstNode: 'TECH',
} as const;

export const JOURNEY_LOOP = [
  'QUESTION',
  'BUILD',
  'PUT UNDER REAL CONDITIONS',
  'MEASURE',
  'FAIL / ABSTAIN / LEARN',
  'CHANGE THE SYSTEM',
] as const;

export const JOURNEY_LAYERS: Record<GraphLayerKey, { label: string; order: number }> = {
  tech: { label: 'TECHNOLOGY', order: 0 },
  product: { label: 'PRODUCT', order: 1 },
  org: { label: 'ORGANIZATION', order: 2 },
  market: { label: 'MARKETPLACE SYSTEMS', order: 3 },
  markets: { label: 'DECISION SYSTEMS', order: 4 },
  ai: { label: 'AI INFRASTRUCTURE', order: 5 },
  agents: { label: 'AGENT RUNTIME', order: 6 },
  learning: { label: 'LEARNING SYSTEMS', order: 7 },
};

export const JOURNEY_ESCAPE = {
  profile: { label: 'VIEW TRADITIONAL PROFILE', href: '/profile' },
  resume: { label: 'VIEW RÉSUMÉ', href: '/resume' },
  github: { label: 'VIEW GITHUB', href: 'https://github.com/MajidAsghariTabrizi' },
  contact: { label: 'TALK TO MAJID', href: '/contact' },
} as const;

/* ------------------------------------------------------------------ */
/* Scenes                                                              */
/* ------------------------------------------------------------------ */

export const JOURNEY_SCENES: Scene[] = [
  {
    id: 'technology',
    index: 1,
    kicker: 'SCENE 01 · TECHNOLOGY',
    theme: 'BUILDING THE MACHINE',
    headline: 'First, make software actually run.',
    body: [
      'I started by building systems — APIs, databases, Linux, web systems, Git, CI/CD, deployment, production debugging, monitoring.',
      'Before managing products, I learned what it means to make software actually run.',
    ],
    loopStage: 'BUILD',
    layers: ['tech'],
    nodeId: 'n-tech',
    source: 'MISSION · REPO',
  },
  {
    id: 'product',
    index: 2,
    kicker: 'SCENE 02 · PRODUCT',
    theme: 'BUILDING THE RIGHT MACHINE',
    headline: 'The technical system works. Then ask: but should it exist?',
    body: [
      'The key shift: from “Can we build it?” to “Should we build it, for whom, and what changes if we do?”',
      'Discovery, hypothesis, experimentation, analytics, metrics, marketplace design, growth, ranking, monetization, vendor systems, operational products — learned as chapters, not as a skill cloud.',
    ],
    loopStage: 'QUESTION',
    layers: ['product'],
    nodeId: 'n-product',
    source: 'MISSION · BRAIN',
  },
  {
    id: 'organization',
    index: 3,
    kicker: 'SCENE 03 · AGILE & ORGANIZATION',
    theme: 'BUILDING THE SYSTEM THAT BUILDS THE PRODUCT',
    headline: 'Why do good people inside good companies still build slowly?',
    body: [
      'My move into Agile and transformation was not a detour. It answered a deeper question: why do good people inside good companies still build the wrong things?',
      'The bottleneck was not always the code. Sometimes it was the organization around the code.',
    ],
    loopStage: 'CHANGE THE SYSTEM',
    layers: ['org'],
    nodeId: 'n-org',
    source: 'MISSION · OWNER (PSM I)',
  },
  {
    id: 'marketplace',
    index: 4,
    kicker: 'SCENE 04 · MARKETPLACE & Q-COMMERCE',
    theme: 'WHEN PRODUCTS BECOME SYSTEMS',
    headline: 'At marketplace scale, there is no isolated feature.',
    body: [
      'Catalog, inventory, vendor, search, discovery, pricing, promotion, order, integration, monetization, operations — an operating network, not a feature list. Every decision moves through a system.',
      'This is where product, engineering and operations began converging: end-to-end tracing, root-cause investigation, data-backed decisions, platform thinking, economic thinking.',
    ],
    loopStage: 'REAL CONDITIONS',
    layers: ['market'],
    nodeId: 'n-market',
    source: 'MISSION · generalized domain map (no employer internals)',
  },
  {
    id: 'decision-systems',
    index: 5,
    kicker: 'SCENE 05 · THE PREDICTION LAB',
    theme: 'CAN A SYSTEM LEARN WHEN NOT TO ACT?',
    headline: 'Prediction is cheap. Trustworthy action is expensive.',
    body: [
      'A deliberate move: run a real prediction and research runtime on a small server — not notebooks. It had to survive live feeds, state persistence, restarts, model inference, feature generation, delayed outcomes, experiment tracking, paper decisions, evaluation, and resource limits.',
      'The recurring pattern that later appears in Phoenix, Brain and Quantiviq was forged here: evidence over confidence, abstention as a decision, economics before execution.',
    ],
    loopStage: 'MEASURE',
    layers: ['markets'],
    nodeId: 'n-markets',
    source: 'MISSION · BRAIN',
  },
  {
    id: 'router',
    index: 6,
    kicker: 'SCENE 06 · AI INFRASTRUCTURE',
    theme: 'INTELLIGENCE BECAME INFRASTRUCTURE',
    headline: 'The model is not the product.',
    body: [
      'Free Best Router — an open-source, running system that discovers, health-checks, ranks and routes across AI providers, learning reliability from live outcomes.',
      'Reliable intelligence requires routing, economics and failure handling.',
    ],
    loopStage: 'BUILD',
    layers: ['ai'],
    nodeId: 'n-ai',
    source: 'GH · REPO',
  },
  {
    id: 'agents',
    index: 7,
    kicker: 'SCENE 07 · AGENT RUNTIME',
    theme: 'FROM MODEL TO WORKER',
    headline: 'A capable model is not yet a reliable worker.',
    body: [
      'The Universal Engineering Agent is an operating kernel around an agent, not another model: staged missions, context budgeting, verification, failure classification, bounded recovery.',
    ],
    loopStage: 'FAIL / ABSTAIN / LEARN',
    layers: ['agents'],
    nodeId: 'n-agents',
    source: 'GH · REPO',
  },
  {
    id: 'harness',
    index: 8,
    kicker: 'SCENE 08 · DSH / HARNESS',
    theme: 'LONG-RUNNING INTELLIGENCE',
    headline: 'From single prompts to missions that survive their own failures.',
    body: [
      'DeepSeek Harness work: model, router, agent runtime, tools, context, checkpoints, memory, approval, verification, recovery, project profiles — the bridge between an agent and a system that can be trusted to run for hours.',
    ],
    loopStage: 'CHANGE THE SYSTEM',
    layers: ['agents'],
    nodeId: 'n-agents',
    source: 'MISSION (architecture level only)',
  },
  {
    id: 'brain',
    index: 9,
    kicker: 'SCENE 09 · THE BRAIN',
    theme: 'WHAT IF THE SYSTEM DIDN’T START FROM ZERO EVERY TIME?',
    headline: 'A persistent learning layer — governed, not magical.',
    body: [
      'Work → Observe → Understand → Act → Measure → Reflect → Learn → Reuse. The next task starts with more context than the first.',
      'Learning is governed. A model does not get to rewrite organizational truth because it generated a confident sentence.',
    ],
    loopStage: 'FAIL / ABSTAIN / LEARN',
    layers: ['learning'],
    nodeId: 'n-learning',
    source: 'MISSION · BRAIN',
  },
  {
    id: 'convergence',
    index: 10,
    kicker: 'SCENE 10 · THE CONVERGENCE',
    theme: 'THE CAREER BECOMES THE ARCHITECTURE',
    headline: 'Zoom out.',
    body: [
      'Quantiviq is not a random new direction. It is the convergence of everything that came before it.',
    ],
    loopStage: 'CHANGE THE SYSTEM',
    layers: ['tech', 'product', 'org', 'market', 'markets', 'ai', 'agents', 'learning'],
    nodeId: 'n-quantiviq',
    source: 'MISSION · live site',
  },
  {
    id: 'final',
    index: 11,
    kicker: 'SCENE 11 · FINAL',
    theme: 'ONE CAREER. DEEPER LAYERS.',
    headline: 'I build systems that learn from their own work.',
    body: [
      'Technology taught me how systems run. Product taught me what should run. Experiments taught me that a result can be technically correct and still economically useless. Failure taught me to separate what I built from what I could actually prove. Organizations taught me where decisions break. Markets taught me to measure uncertainty. AI taught me that intelligence can become infrastructure. Now I am exploring what happens when organizations themselves can learn.',
    ],
    loopStage: 'CHANGE THE SYSTEM',
    layers: ['learning'],
    nodeId: 'n-quantiviq',
    source: 'MISSION',
  },
];

/* ------------------------------------------------------------------ */
/* Nodes (career graph)                                                */
/* ------------------------------------------------------------------ */

export const JOURNEY_NODES: JourneyNode[] = [
  {
    id: 'n-tech',
    era: '2008–2014',
    layer: 'tech',
    title: 'TECHNOLOGY',
    thesis: 'How software works — and how it survives contact with production.',
    evidence: [
      { kind: 'SHIPPED', detail: 'Production systems across backend, frontend, APIs, databases, Linux, Git, CI/CD, deployment, monitoring', basis: 'REPO' },
      { kind: 'PRODUCTION', detail: 'Deployment, rollback, observability treated as product capabilities ever since', basis: 'REPO' },
    ],
    capabilities: ['APIs', 'databases', 'Linux', 'web systems', 'Git · GitFlow', 'CI/CD', 'deployment', 'production debugging', 'monitoring', 'system reliability'],
    artifacts: [],
    connections: [],
    source: 'Employers of the era: Daapapp · Infinite8 · SportMob (owner-stored list; no role invention).',
  },
  {
    id: 'n-product',
    era: '2014–2018',
    layer: 'product',
    title: 'PRODUCT',
    thesis: 'How products create value — for whom, and what changes if you build it.',
    evidence: [
      { kind: 'PRODUCT IMPACT', detail: 'Discovery, experimentation, analytics, metrics, marketplace design, growth, ranking, monetization', basis: 'MISSION' },
    ],
    capabilities: ['discovery', 'hypothesis', 'experimentation', 'analytics', 'metrics', 'marketplace design', 'growth', 'ranking', 'monetization', 'vendor systems', 'operational products'],
    artifacts: [],
    connections: ['n-tech'],
    source: 'MISSION · BRAIN (self-stated career narrative).',
  },
  {
    id: 'n-org',
    era: '2018–2020',
    layer: 'org',
    title: 'AGILE & ORGANIZATION',
    thesis: 'How teams create products — the system around the code.',
    evidence: [
      { kind: 'PRODUCT IMPACT', detail: 'Agile coaching, product transformation, team design, operating models, feedback loops', basis: 'OWNER' },
      { kind: 'SHIPPED', detail: 'PSM I', basis: 'OWNER' },
    ],
    capabilities: ['Agile coaching', 'product transformation', 'team design', 'cross-functional execution', 'delivery systems', 'ownership', 'operating models', 'feedback loops'],
    artifacts: [],
    connections: ['n-product'],
    source: 'MISSION (PSM I owner-asserted; no client specifics).',
  },
  {
    id: 'n-market',
    era: '2020–2023',
    layer: 'market',
    title: 'MARKETPLACE SYSTEMS',
    thesis: 'How organizations operate — every decision propagates.',
    evidence: [
      { kind: 'PRODUCT IMPACT', detail: 'Marketplace / Q-commerce operating network: catalog → operations', basis: 'MISSION' },
    ],
    capabilities: ['catalog', 'inventory', 'vendor', 'search', 'discovery', 'pricing', 'promotion', 'order', 'integration', 'monetization', 'operations', 'end-to-end tracing', 'root-cause investigation', 'platform thinking', 'economic thinking'],
    artifacts: [],
    connections: ['n-org', 'n-product'],
    source: 'SnappMarket · Okala · Alibaba Travels (names only; generalized domain map — no employer internals).',
  },
  {
    id: 'n-markets',
    era: '2023–2026',
    layer: 'markets',
    title: 'DECISION SYSTEMS',
    thesis: 'How complex systems make decisions — under uncertainty, with consequences.',
    evidence: [
      { kind: 'EXPERIMENT', detail: 'Quantiviq Sentinel: live paper runtime, 16,000+ matured outcomes, champion/challenger, VON 0.60 gate', basis: 'MISSION · BRAIN' },
      { kind: 'NEGATIVE RESULT', detail: 'Legacy audit: 307 trades, ~86% STOP_HIT, ~10.75% win rate — confidently wrong', basis: 'MISSION · BRAIN' },
      { kind: 'REJECTED EXPERIMENT', detail: 'M16 microstructure: signal existed, fees killed the edge', basis: 'MISSION · BRAIN' },
    ],
    capabilities: ['market state', 'prediction', 'calibration', 'uncertainty gates', 'policy', 'abstention', 'outcome ledgers', 'walk-forward evaluation', 'promotion gates', 'net economics'],
    artifacts: [
      { label: 'smart-trader (repo)', kind: 'repo', href: 'https://github.com/MajidAsghariTabrizi/smart-trader' },
    ],
    connections: ['n-market', 'n-tech'],
    source: 'MISSION · BRAIN-T (personal-trading pack, verified).',
  },
  {
    id: 'n-ai',
    era: '2025',
    layer: 'ai',
    title: 'AI INFRASTRUCTURE',
    thesis: 'Intelligence became infrastructure — routed, ranked, budgeted.',
    evidence: [
      { kind: 'OPEN SOURCE', detail: 'Free Best Router: OpenAI-compatible router, Wilson lower bound, time-decay, exploration, cooldowns, bounded failover, zero telemetry', basis: 'GH' },
    ],
    capabilities: ['provider discovery', 'health checks', 'capability ranking', 'reliability scoring', 'latency budgeting', 'bounded failover', 'streaming', 'local models'],
    artifacts: [
      { label: 'free-best-router (repo)', kind: 'repo', href: 'https://github.com/MajidAsghariTabrizi/free-best-router' },
    ],
    connections: ['n-markets', 'n-tech'],
    source: 'GH live-verified (3★, JavaScript).',
  },
  {
    id: 'n-agents',
    era: '2025–2026',
    layer: 'agents',
    title: 'AGENT RUNTIME',
    thesis: 'From model to worker — governed execution, recovery, verification.',
    evidence: [
      { kind: 'OPEN SOURCE', detail: 'Universal Engineering Agent: MIT reference implementation of the operating-kernel contract', basis: 'GH' },
      { kind: 'PRODUCTION', detail: 'Phoenix: fail-closed autonomous execution architecture on Arbitrum — retired with a proven negative result', basis: 'REPO · GH · BRAIN' },
    ],
    capabilities: ['9-stage lifecycle', 'context budgeting', 'staged missions', 'tool hygiene', 'failure classification', 'bounded retries', 'checkpoints', 'bounded authority'],
    artifacts: [
      { label: 'universal-engineering-agent (repo)', kind: 'repo', href: 'https://github.com/MajidAsghariTabrizi/universal-engineering-agent' },
      { label: 'anti-gravity-phoenix-v4 (repo)', kind: 'repo', href: 'https://github.com/MajidAsghariTabrizi/anti-gravity-phoenix-v4' },
    ],
    connections: ['n-ai', 'n-markets'],
    source: 'GH live-verified.',
  },
  {
    id: 'n-learning',
    era: '2026',
    layer: 'learning',
    title: 'LEARNING SYSTEMS',
    thesis: 'What if the system didn’t start from zero every time?',
    evidence: [
      { kind: 'LEARNING SYSTEM', detail: 'Brain: episodic/semantic/procedural memory with provenance, governed writes, decay, rollback, abstention', basis: 'MISSION · BRAIN' },
      { kind: 'NEGATIVE RESULT', detail: 'Split-brain: local memory ≠ authoritative runtime memory — source-of-truth governance became the lesson', basis: 'MISSION · BRAIN' },
    ],
    capabilities: ['episodic memory', 'semantic knowledge', 'procedural memory', 'evidence provenance', 'retrieval', 'reflection', 'skill formation', 'shadow evaluation', 'decay / staleness', 'rollback / rejection'],
    artifacts: [],
    connections: ['n-agents', 'n-markets'],
    source: 'MISSION · BRAIN (boundary honesty: research loop consults memory; live trading decision loop does not).',
  },
  {
    id: 'n-quantiviq',
    era: 'NOW',
    layer: 'learning',
    title: 'QUANTIVIQ',
    thesis: 'AI-native operating systems — the convergence of every layer.',
    evidence: [
      { kind: 'SHIPPED', detail: 'This site: the hero simulator, the operating-model layering, the deployment pipeline', basis: 'REPO' },
    ],
    capabilities: ['organization design', 'workflow engineering', 'agent runtime', 'model router', 'brain', 'tools & connectors', 'evaluation'],
    artifacts: [
      { label: 'quantiviq.xyz', kind: 'site', href: 'https://quantiviq.xyz' },
      { label: 'The hero simulator (route)', kind: 'route', href: '/#simulator' },
    ],
    connections: ['n-tech', 'n-product', 'n-org', 'n-market', 'n-markets', 'n-ai', 'n-agents', 'n-learning'],
    source: 'Live site.',
  },
];

/* ------------------------------------------------------------------ */
/* Scene 01 — production flow                                          */
/* ------------------------------------------------------------------ */

export const TECH_FLOW: Stage[] = [
  { k: 'CODE', note: 'The commit is the unit of truth — every later system of mine is reproducible from source.' },
  { k: 'PR', note: 'Small, reviewable diffs. On majid-systems, content changes ship through the same review discipline as code.' },
  { k: 'CI', note: 'node --test content-integrity suite: claims about projects are checked like code. Tests on this very site.' },
  { k: 'BUILD', note: 'Immutable artifacts — Phoenix built versioned images with manifests; a deployment is a thing you can point at.' },
  { k: 'DEPLOY', note: 'The site you are reading deploys through a scripted pipeline with health gates — not a manual copy.' },
  { k: 'OBSERVE', note: 'Observability is a product feature: Phoenix exposed release SHA, provider identity, expected vs realized PnL.' },
  { k: 'RECOVER', note: 'Rollback is designed before launch: protected release, rehearsal, burn-in, manual-only authority transitions.' },
];

/* ------------------------------------------------------------------ */
/* Scene 03 — org topology                                             */
/* ------------------------------------------------------------------ */

export const ORG_NODES = ['PRODUCT', 'ENGINEERING', 'DATA', 'BUSINESS'] as const;

/* ------------------------------------------------------------------ */
/* Scene 05 — the prediction lab                                       */
/* ------------------------------------------------------------------ */

export const LAB_SURVIVAL = [
  'continuous live market feeds',
  'state persistence',
  'process restarts',
  'model inference',
  'feature generation',
  'delayed outcomes',
  'experiment tracking',
  'paper decisions',
  'evaluation',
  'resource constraints',
] as const;

export const LEGACY_AUDIT = {
  rawRows: '150K RAW ROWS',
  candles: '5,241 TRUE 1H CANDLES · 1,316 RECONSTRUCTED 4H',
  trades: '307 CLOSED LEGACY TRADES',
  stopHit: '~86% ENDED IN STOP_HIT',
  winRate: '~10.75% WIN RATE',
  pnl: 'REALIZED HISTORICAL PnL: MATERIALLY NEGATIVE',
  verdict: 'REJECTED',
  line: 'The first useful result was not a profitable model. It was learning that the old system had been confidently wrong.',
} as const;

export const POOLING = {
  currentOnly: 'CURRENT ONLY AUC 0.6848',
  pooled: 'CURRENT + LEGACY AUC 0.6763',
  wrong: 'MORE DATA = MORE INTELLIGENCE',
  right: 'RELEVANT DATA + VALID EVALUATION = POSSIBLE LEARNING',
  line: 'More data was not automatically better data.',
} as const;

export const SENTINEL_PIPELINE = [
  'LIVE MARKET',
  '1m / 5m CANDLES',
  'FEATURE FACTORY',
  'REGIME / STATE',
  'PREDICTION MODEL',
  'CALIBRATION',
  'CONFIDENCE / UNCERTAINTY',
  'POLICY',
  'ABSTAIN OR PROPOSE',
  'OUTCOME LEDGER',
  'RESEARCH LOOP',
] as const;

export const SENTINEL_GENERATION =
  '22 base features + 5 regime features → causal HMM → LightGBM → calibration → VON 0.60 gate → PAPER';

export const SENTINEL_ABSTAIN = {
  headline: 'ALL LIVE CANDIDATES → ABSTAIN',
  line: 'The first production behavior I trusted was not BUY or SELL. It was “I don’t know.”',
  verdict: 'ABSTAINED',
} as const;

export const SENTINEL_OUTCOMES = {
  matured: '16,000+ OUTCOMES MATURED, PAPER-ONLY',
  champion: 'THE CHALLENGER STILL DID NOT BEAT THE CHAMPION STRONGLY ENOUGH TO PROMOTE',
} as const;

export const DISCIPLINE_EARLY = ['MODEL', 'SIGNAL', 'TRADE'] as const;

export const DISCIPLINE_LATE = [
  'DATA PROVENANCE',
  'FEATURE CONTRACT',
  'TRAINING WINDOW',
  'OOS / WALK-FORWARD',
  'CALIBRATION',
  'ECONOMICS',
  'SHADOW',
  'PROMOTION GATE',
  'PAPER POLICY',
  'OUTCOME LEDGER',
] as const;

export const DISCIPLINE_RULES = [
  'persist every decision, including ABSTAIN',
  'attach delayed outcomes after the fact',
  'preserve counterfactual evidence where possible',
  'separate champion from challenger',
  'freeze the incumbent during an experiment',
  'retrain challengers slowly, not continuously mutate production',
  'walk-forward / out-of-sample evaluation',
  'measure calibration, not just classification accuracy',
  'measure selective precision and coverage',
  'evaluate net economics after fees and slippage',
  'compare against simple baselines',
  'require promotion gates',
  'keep live capital disabled until evidence justifies authority',
  'allow a negative result to terminate an experiment',
] as const;

export const DISCIPLINE_LINE =
  'The models changed. The bigger change was learning how not to fool myself with them.';

export const MODEL_QUESTIONS = [
  { model: 'HMM / STATE', question: 'What market regime are we in?' },
  { model: 'LIGHTGBM / DIRECTION', question: 'Is there directional evidence?' },
  { model: 'CALIBRATION', question: 'Does 70% confidence actually behave like 70%?' },
  { model: 'HUBER MULTI-OUTPUT', question: 'What is the likely move / magnitude under noisy targets?' },
  { model: 'MFE / OPPORTUNITY', question: 'How much favorable excursion is realistically available?' },
  { model: 'FUSION / POLICY', question: 'Even if models disagree, is there enough evidence to act?' },
  { model: 'UNCERTAINTY GATE', question: 'Should the system abstain?' },
] as const;

export const EXPERIMENTS: Experiment[] = [
  {
    id: 'x-legacy',
    project: 'Legacy Quantiviq trading system',
    generation: 'POST-MORTEM AUDIT',
    hypothesis: 'The old system was a competent base to build on.',
    built: 'Forensic audit of the legacy database: candle reconstruction (a true 4h candle = exactly 4 one-hour candles), 307 closed trades reconstructed.',
    reality: '~86% of trades ended STOP_HIT · ~10.75% win rate · realized PnL materially negative. The old system had been confidently wrong.',
    verdict: 'REJECTED',
    next: 'Sentinel rebuilt around honest evaluation and reconstruction rules instead of inherited belief.',
    badges: ['NEGATIVE RESULT'],
    basis: 'MISSION',
  },
  {
    id: 'x-pooling',
    project: 'Sentinel',
    generation: 'DATA POOLING',
    hypothesis: 'Pooling legacy data into current training improves discrimination.',
    built: 'Identical schema, labeler and seed — two arms: current-only vs current + legacy, purged chronological holdout.',
    reality: 'CURRENT ONLY AUC 0.6848 vs CURRENT + LEGACY 0.6763. Legacy-only zero-shot transfers at chance. Domain shift dominates.',
    verdict: 'REJECTED',
    next: 'Relevance and evaluation validity became first-class checks. More data ≠ more intelligence.',
    badges: ['NEGATIVE RESULT'],
    basis: 'MISSION',
  },
  {
    id: 'x-sentinel',
    project: 'Quantiviq Sentinel',
    generation: 'PAPER RUNTIME',
    hypothesis: 'A disciplined pipeline can produce calibrated, abstaining paper decisions on live data.',
    built: 'Live market → candles → features → regime → model → calibration → confidence → policy → abstain or propose → outcome ledger → research loop. VON 0.60 gate, paper-only.',
    reality: '16,000+ outcomes matured. At one point the system processed live candidates and chose ABSTAIN for all of them. The challenger never beat the champion strongly enough to promote.',
    verdict: 'PARTIALLY PROVED',
    next: 'Promotion gates formalized; live capital stayed disabled.',
    badges: ['EXPERIMENT', 'ABSTAINED'],
    basis: 'MISSION',
  },
  {
    id: 'x-m16',
    project: 'M16 — MICROSTRUCTURE',
    generation: 'LIVE COLLECTOR',
    hypothesis: 'Local microstructure carries a tradeable directional signal.',
    built: 'Live collector around Wallex market data: raw trades, depth rollups, microprice, order-flow imbalance, shared receive clock, 1m rollups.',
    reality: 'Real local directional information existed. After actual transaction costs, the economic edge disappeared. SIGNAL + → FEES / SLIPPAGE → NET EDGE −.',
    verdict: 'REJECTED',
    next: 'Economics moved before execution in every later gate.',
    badges: ['REJECTED EXPERIMENT', 'NEGATIVE RESULT'],
    basis: 'MISSION',
  },
  {
    id: 'x-m17',
    project: 'M17 / M18 — GLOBAL CONTEXT',
    generation: 'CONTEXT EXPANSION',
    hypothesis: 'External spot/perpetual fair-value and lead/impulse context surfaces high-edge events.',
    built: 'Global-context features with executable-price evaluation across short future horizons — never fantasy mid-prices.',
    reality: 'No qualifying high-edge events under the pre-registered economics threshold.',
    verdict: 'NO FORCED PROMOTION',
    next: 'When the event you hoped existed does not appear, keep the negative result.',
    badges: ['NEGATIVE RESULT'],
    basis: 'MISSION',
  },
  {
    id: 'x-m19',
    project: 'M19 — SHADOW DECISION CONTEXT',
    generation: 'IMMUTABLE EVIDENCE',
    hypothesis: 'Joining every production decision (including ABSTAIN) with richer context adds incremental net value.',
    built: 'Decisions joined with incumbent prediction state, regime, global, microstructure and executable-book context, stored as immutable decision evidence. Champion untouched.',
    reality: 'The challenger gate stayed closed. No production behavior changed merely because the experiment was interesting.',
    verdict: 'UNPROVEN',
    next: 'The question stayed open; the champion stayed frozen.',
    badges: ['UNPROVEN'],
    basis: 'MISSION',
  },
  {
    id: 'x-lineages',
    project: 'LATER MODEL LINEAGES',
    generation: 'MULTI-OUTPUT STACK',
    hypothesis: 'A multi-output stack under one policy extracts more usable evidence.',
    built: 'candles + micro → X25 → state_v1 → huber_multi_v1 / mfe_multi_v1 → calibration / spread → fusion → policy → ledger.',
    reality: 'Audit one: the runtime exposed multiple prediction “views” but only two genuinely independent model lineages — an architectural illusion. Audit two: a horizon audit showed prediction quality worse than simple baselines on several metrics, with overconfident opportunity estimates.',
    verdict: 'DO NOT PROMOTE',
    next: 'Evaluation is allowed to embarrass the architecture. Model diversity rebuilt around genuinely different questions.',
    badges: ['NEGATIVE RESULT'],
    basis: 'MISSION',
  },
  {
    id: 'x-worlds',
    project: 'PARALLEL WORLDS / COUNTERFACTUAL',
    generation: 'SCENARIO REPLAY',
    hypothesis: 'Replaying the same decision across deterministic scenario worlds improves prediction quality.',
    built: 'A deterministic multi-world replay layer. The implementation passed its full test suite.',
    reality: 'The experiment failed to improve prediction quality; a cost/opportunity contract incoherence was exposed.',
    verdict: 'REJECTED',
    next: 'Passing software tests proves the implementation. It does not prove the hypothesis.',
    badges: ['REJECTED EXPERIMENT'],
    basis: 'MISSION',
  },
  {
    id: 'x-phoenix',
    project: 'Phoenix',
    generation: 'PRODUCTION-ORIENTED R&D · RETIRED 2026-09-17',
    hypothesis: 'Fail-closed autonomous execution infrastructure can earn the right to act.',
    built: 'Rust/Go/Python/Solidity on Arbitrum: signal → verify → economics → risk → authority → execution → reconciliation. Dual-provider agreement, exact economic gates, single-transaction authority, receipt and balance reconciliation, protected release, deterministic fixtures, health gates, rollback.',
    reality: 'At a mature snapshot the containers were up and monitoring was live — with $0 realized revenue, parts of the control plane disarmed by design, an observer producing no actionable bids, and one deployment succeeding while execution readiness stayed false because a provider was rate-limited. 39,538 shadow decisions. 0 executions. Retired as a disciplined shutdown.',
    verdict: 'MAJOR LEARNING',
    next: 'Architecture is not edge. Live ≠ ready. Autonomy requires authority boundaries. Production discipline was built before permission to risk capital — and that discipline is the reusable asset.',
    badges: ['PRODUCTION', 'REJECTED EXPERIMENT', 'UNPROVEN', 'NEGATIVE RESULT'],
    basis: 'MISSION',
  },
  {
    id: 'x-brain',
    project: 'Brain',
    generation: 'SOURCE-OF-TRUTH GOVERNANCE',
    hypothesis: 'A persistent learning layer makes the system smarter without becoming untrustworthy.',
    built: 'Episodic / semantic / procedural memory with provenance, controlled writes, reflection, procedure → skill projection, shadow evaluation, decay, rollback, abstention.',
    reality: 'A local memory snapshot and the authoritative runtime memory diverged — two stores drifting toward different truths. Resolved by explicit source-of-truth governance.',
    verdict: 'PARTIALLY PROVED',
    next: 'A system cannot learn reliably if it cannot answer which memory is true.',
    badges: ['LEARNING SYSTEM', 'NEGATIVE RESULT'],
    basis: 'MISSION',
  },
  {
    id: 'x-router',
    project: 'Free Best Router',
    generation: 'RELIABILITY LEARNING',
    hypothesis: 'Intelligence routing should be learned from live outcomes, not configured once.',
    built: 'Open-source OpenAI-compatible router: discovery, health, capability, reliability (Wilson lower bound), latency, ranking, routing, outcome observation — zero telemetry.',
    reality: 'Running open-source system. Requests visibly reroute when a provider degrades.',
    verdict: 'PROVED',
    next: 'The same reliability-thinking now routes agent work in DSH.',
    badges: ['OPEN SOURCE', 'SHIPPED'],
    basis: 'GH',
  },
];

export const VERDICTS_SHOWN: Verdict[] = [
  'PROVED',
  'PARTIALLY PROVED',
  'ABSTAINED',
  'REJECTED',
  'FAILED',
  'UNPROVEN',
  'PROMOTED',
];

/* ------------------------------------------------------------------ */
/* Scene 05F — Phoenix                                                 */
/* ------------------------------------------------------------------ */

export const PHOENIX_FLOW = [
  'SIGNAL',
  'VERIFY',
  'ECONOMICS',
  'RISK',
  'AUTHORITY',
  'EXECUTION',
  'RECONCILIATION',
] as const;

export const PHOENIX_STACK = [
  'Rust', 'Go', 'Python', 'Solidity', 'PostgreSQL', 'NATS JetStream',
  'Prometheus', 'Docker', 'GitHub Actions', 'Arbitrum', 'Aave',
] as const;

export const PHOENIX_POSTURE = [
  'deterministic fixtures for profitable / non-profitable / unsupported / incomplete / duplicate conditions',
  'startup blocking when critical dependencies are not real or valid',
  'immutable / versioned build artifacts',
  'migration and state checks',
  'health gates before release',
  'rollback paths',
  'manual-only transition to live authority',
] as const;

export const PHOENIX_CLAIMS = [
  { claim: 'THE CONTAINERS ARE UP', state: true },
  { claim: 'THE SYSTEM IS HEALTHY', state: true },
  { claim: 'THE SYSTEM IS READY TO ACT', state: false },
  { claim: 'THE STRATEGY HAS EDGE', state: false },
  { claim: 'THE BUSINESS MAKES MONEY', state: false },
] as const;

export const PHOENIX_NUMBERS = [
  '39,538 SHADOW DECISIONS',
  '0 EXECUTIONS',
  '$0 REALIZED REVENUE',
  'RETIRED 2026-09-17',
] as const;

export const PHOENIX_LESSONS = [
  'Architecture is not edge.',
  'Live is not the same as ready.',
  'Autonomy requires authority boundaries.',
  'Fail-closed is a product decision.',
  'Economic gates belong before execution.',
  'Reconciliation is part of execution.',
  'Productionization can reveal that the hypothesis itself is weak.',
  'Technical difficulty is not commercial validation.',
] as const;

export const PHOENIX_LINE =
  'Phoenix did not teach me how to automate risk. It taught me how much structure must exist before autonomy deserves authority.';

export const PHOENIX_LIVE_NOTE =
  'LIVE_EXECUTION=false was not an inconvenience to hide; it was an explicit safety posture while feed correctness, math parity, execution semantics, provider behavior, economic validity and reconciliation were still being proven.';

/* ------------------------------------------------------------------ */
/* Scene 06 — Router                                                   */
/* ------------------------------------------------------------------ */

export const ROUTER_PIPELINE = [
  'DISCOVER', 'NORMALIZE', 'HEALTH', 'CAPABILITY', 'RELIABILITY',
  'LATENCY', 'RANK', 'ROUTE', 'OBSERVE OUTCOME', 'LEARN',
] as const;

export const ROUTER_FEATURES = [
  'OpenAI-compatible endpoint', 'multiple providers', 'automatic model discovery',
  'health checks', 'capability-aware ranking', 'runtime statistics',
  'Wilson lower bound / reliability scoring', 'time-decay', 'exploration',
  'cooldowns', 'bounded fallback', 'streaming', 'local models',
  'DSH integration', 'privacy-first / zero telemetry',
] as const;

export const ROUTER_LINE =
  'The model is not the product. Reliable intelligence requires routing, economics and failure handling.';

export const ROUTER_PROVIDERS = ['OPENROUTER', 'GROQ', 'CEREBRAS', 'MISTRAL', 'DEEPSEEK', 'LOCAL'] as const;

/* ------------------------------------------------------------------ */
/* Scene 07 — UEA                                                      */
/* ------------------------------------------------------------------ */

export const UEA_LIFECYCLE = [
  'INSPECT', 'PLAN', 'IMPLEMENT', 'VERIFY', 'CLASSIFY FAILURE',
  'RECOVER', 'TEST', 'GENERALIZE',
] as const;

export const UEA_IDEAS = [
  'context budgeting', 'staged missions', 'tool hygiene',
  'static / unit / integration verification', 'failure classification',
  'bounded retries', 'checkpoints', 'self-tests', 'profile-agnostic behavior',
  'vendor independence',
] as const;

export const UEA_LINE = 'A capable model is not yet a reliable worker.';

/* ------------------------------------------------------------------ */
/* Scene 08 — DSH                                                      */
/* ------------------------------------------------------------------ */

export const DSH_BLOCKS = [
  'MODEL', 'ROUTER', 'AGENT RUNTIME', 'TOOLS', 'CONTEXT', 'CHECKPOINTS',
  'MEMORY', 'APPROVAL', 'VERIFICATION', 'RECOVERY', 'PROJECT PROFILE',
] as const;

export const DSH_EVOLUTION = [
  'single prompts → long-running missions',
  'tool execution with bounded authority',
  'provider abstraction → model independence',
  'checkpoints and context management',
  'failure recovery and reusable agent roles',
] as const;

/* ------------------------------------------------------------------ */
/* Scene 09 — Brain                                                    */
/* ------------------------------------------------------------------ */

export const BRAIN_LOOP = [
  'OBSERVE', 'UNDERSTAND', 'ACT', 'MEASURE', 'REFLECT', 'LEARN', 'REUSE',
] as const;

export const BRAIN_LAYERS = [
  { k: 'EPISODIC MEMORY', q: 'What happened?' },
  { k: 'SEMANTIC KNOWLEDGE', q: 'What do we know?' },
  { k: 'PROCEDURAL MEMORY', q: 'What has worked repeatedly?' },
  { k: 'EVIDENCE / PROVENANCE', q: 'Why do we believe this?' },
  { k: 'RETRIEVAL', q: 'What matters for this task?' },
  { k: 'REFLECTION', q: 'What changed after the outcome?' },
  { k: 'SKILL FORMATION', q: 'Can a successful procedure become reusable capability?' },
] as const;

export const BRAIN_TECHNIQUES = [
  'lexical retrieval', 'semantic retrieval', 'graph retrieval', 'provenance',
  'controlled learning writes', 'episodic / semantic / procedural separation',
  'reflection candidates', 'procedure → skill projection', 'shadow evaluation',
  'reinforcement', 'decay / staleness', 'rollback / rejection',
  'abstention when evidence is insufficient',
] as const;

export const BRAIN_GOVERNED =
  'Learning is governed. A model does not get to rewrite organizational truth because it generated a confident sentence.';

export const BRAIN_SPLIT = {
  left: 'LOCAL MEMORY',
  right: 'AUTHORITATIVE RUNTIME MEMORY',
  resolve: 'Resolved by source-of-truth governance.',
  line: 'A system cannot learn reliably if it cannot answer which memory is true.',
} as const;

export const BRAIN_BOUNDARY =
  'The research loop consults prior trajectories and avoids repeating failed branches. The live trading decision loop still does not directly consume Brain memory. Two loops, honestly separated — not a self-learning trader.';

/* ------------------------------------------------------------------ */
/* Scene 10 — Convergence                                              */
/* ------------------------------------------------------------------ */

export const CONVERGENCE_TRACKS = [
  'TECHNOLOGY', 'PRODUCT', 'ORGANIZATION', 'MARKETPLACES',
  'DECISION SYSTEMS', 'AGENTS', 'LEARNING',
] as const;

export const QUANTIVIQ_STACK = [
  { k: 'ORGANIZATION DESIGN', v: 'roles / authority / economics' },
  { k: 'WORKFLOW ENGINEERING', v: 'processes / events / orchestration' },
  { k: 'AGENT RUNTIME', v: 'DSH / harness / specialists' },
  { k: 'MODEL ROUTER', v: 'cost / intelligence / latency' },
  { k: 'BRAIN', v: 'knowledge / learning / evidence' },
  { k: 'TOOLS & CONNECTORS', v: 'code / DB / BI / CRM / ERP / APIs' },
  { k: 'EVALUATION', v: 'quality / cost / latency / outcomes' },
] as const;

export const CONVERGENCE_LINE =
  'Quantiviq is not a random new direction. It is the convergence of everything that came before it.';

/* ------------------------------------------------------------------ */
/* Scene 11 — Final                                                    */
/* ------------------------------------------------------------------ */

export const JOURNEY_FINAL = {
  headline: 'I BUILD SYSTEMS THAT LEARN FROM THEIR OWN WORK.',
  lines: [
    'Technology taught me how systems run.',
    'Product taught me what should run.',
    'Experiments taught me that a result can be technically correct and still economically useless.',
    'Failure taught me to separate what I built from what I could actually prove.',
    'Organizations taught me where decisions break.',
    'Markets taught me to measure uncertainty.',
    'AI taught me that intelligence can become infrastructure.',
    'Now I am exploring what happens when organizations themselves can learn.',
  ],
  ctaPrimary: { label: 'EXPLORE QUANTIVIQ →', href: '/' },
  ctaSecondary: { label: 'TALK TO MAJID →', href: '/contact' },
  ctaTertiary: { label: 'VIEW GITHUB →', href: 'https://github.com/MajidAsghariTabrizi' },
} as const;

export const JOURNEY_SOUL =
  'I keep building systems that force me to learn what I did not yet understand.';

/* ------------------------------------------------------------------ */
/* ASK THE SYSTEM — deterministic curated knowledge                     */
/* ------------------------------------------------------------------ */

export type AskAnswer = {
  id: string;
  q: string;
  a: string;
  scenes: string[];
  badges: EvidenceKind[];
  links?: { label: string; href: string }[];
};

export const ASK_SUGGESTED = [
  'Why did you move from engineering to product?',
  'Why did Agile matter?',
  'Show me a production system you built.',
  'How does the Brain actually learn?',
  'What did Phoenix teach you about autonomous systems?',
  'What makes your AI work different from wrappers?',
  'Why are you interested in Zero-to-One AI?',
  'What would you build first inside an AI Factory?',
  'Show only your Product experience.',
  'Show only your technical work.',
] as const;

export const ASK_ANSWERS: AskAnswer[] = [
  {
    id: 'a-eng-to-product',
    q: 'Why did you move from engineering to product?',
    a: 'Because “can we build it” stopped being the interesting question. Once I could make software run, the harder question was whether it should exist — for whom, and what changes if it does. Product is where I learned to treat value as something you discover under real conditions, not something you assert.',
    scenes: ['product', 'technology'],
    badges: ['PRODUCT IMPACT'],
    links: [{ label: 'Scene 02 · Product', href: '/journey#product' }],
  },
  {
    id: 'a-agile',
    q: 'Why did Agile matter?',
    a: 'Agile answered a question code could not: why do good people inside good companies still build slowly or build the wrong things? The bottleneck was not always the code — sometimes it was the organization around it. That insight runs straight into Quantiviq: organizations are systems, and systems can be redesigned.',
    scenes: ['organization'],
    badges: ['PRODUCT IMPACT'],
    links: [{ label: 'Scene 03 · Organization', href: '/journey#organization' }],
  },
  {
    id: 'a-production-system',
    q: 'Show me a production system you built.',
    a: 'Phoenix: a fail-closed autonomous execution architecture on Arbitrum across Rust, Go, Python and Solidity — dual-provider verification, exact economic gates, single-transaction authority, receipt and balance reconciliation, protected release with rollback. It ran 39,538 shadow decisions, executed zero, earned $0, and was retired with a proven negative result. The containers being up was never the same as being ready to act — and that discipline is the artifact I reuse everywhere.',
    scenes: ['decision-systems'],
    badges: ['PRODUCTION', 'REJECTED EXPERIMENT', 'NEGATIVE RESULT'],
    links: [
      { label: 'Scene 05F · Phoenix', href: '/journey#phoenix' },
      { label: 'anti-gravity-phoenix-v4', href: 'https://github.com/MajidAsghariTabrizi/anti-gravity-phoenix-v4' },
    ],
  },
  {
    id: 'a-brain',
    q: 'How does the Brain actually learn?',
    a: 'Work happens → the system observes, understands, acts, measures, reflects — and only then writes, under governance. Memory is split into episodes (what happened), semantics (what we know), procedures (what repeatedly worked), each with provenance. Lessons decay, get rejected, or get rolled back; evidence-insufficient questions abstain. The next task starts with more context than the first — and the system can always answer which memory is true.',
    scenes: ['brain'],
    badges: ['LEARNING SYSTEM'],
    links: [{ label: 'Scene 09 · The Brain', href: '/journey#brain' }],
  },
  {
    id: 'a-phoenix',
    q: 'What did Phoenix teach you about autonomous systems?',
    a: 'That intelligence must not silently inherit permission to execute. Phoenix forced the question: what has to exist between an intelligent signal and irreversible action? Verification, economics, risk, authority, execution, reconciliation — in that order, fail-closed. It also taught me that architecture is not edge: technical seriousness without economic evidence is still zero. Autonomy deserves authority only after structure earns it.',
    scenes: ['decision-systems'],
    badges: ['PRODUCTION', 'UNPROVEN', 'NEGATIVE RESULT'],
    links: [{ label: 'Scene 05F · Phoenix', href: '/journey#phoenix' }],
  },
  {
    id: 'a-wrappers',
    q: 'What makes your AI work different from wrappers?',
    a: 'I build the layers wrappers skip: routing with learned reliability (Free Best Router — Wilson-scored, failover-aware, zero telemetry), agent runtimes with verification and bounded recovery (UEA), long-mission harnesses with checkpoints and approval boundaries (DSH), and governed persistent memory (Brain). The model is one component; the operating discipline around it is the product.',
    scenes: ['router', 'agents', 'harness', 'brain'],
    badges: ['OPEN SOURCE', 'LEARNING SYSTEM'],
    links: [
      { label: 'free-best-router', href: 'https://github.com/MajidAsghariTabrizi/free-best-router' },
      { label: 'universal-engineering-agent', href: 'https://github.com/MajidAsghariTabrizi/universal-engineering-agent' },
    ],
  },
  {
    id: 'a-zero-to-one',
    q: 'Why are you interested in Zero-to-One AI?',
    a: 'Because the interesting failure of my last decade is technical difficulty without commercial validation. Phoenix was technically serious and economically unproven — that changed what I optimize for: who needs this, what value does it create, and what evidence proves it. Zero-to-one AI is where product discipline and system discipline have to be the same discipline.',
    scenes: ['decision-systems', 'convergence'],
    badges: ['NEGATIVE RESULT'],
    links: [{ label: 'Scene 05F · Phoenix', href: '/journey#phoenix' }],
  },
  {
    id: 'a-ai-factory',
    q: 'What would you build first inside an AI Factory?',
    a: 'The evaluation loop, not the agents. Everything I learned from markets says: persist every decision, attach delayed outcomes, separate champion from challenger, gate promotion on net economics, and keep authority disabled until evidence justifies it. An AI factory that cannot measure whether its agents create value is just a more expensive rumor mill.',
    scenes: ['decision-systems', 'convergence'],
    badges: ['EXPERIMENT'],
    links: [{ label: 'Scene 05 · The Prediction Lab', href: '/journey#decision-systems' }],
  },
  {
    id: 'a-product-only',
    q: 'Show only your Product experience.',
    a: 'Discovery → experimentation → analytics → metrics at product scale; marketplace design, growth, ranking, monetization, vendor systems and operational products at marketplace scale; then product transformation and operating models as an Agile coach. Product was never a title change — it was learning to make “should this exist?” falsifiable.',
    scenes: ['product', 'marketplace', 'organization'],
    badges: ['PRODUCT IMPACT'],
    links: [
      { label: 'Scene 02 · Product', href: '/journey#product' },
      { label: 'Scene 04 · Marketplace systems', href: '/journey#marketplace' },
    ],
  },
  {
    id: 'a-technical-only',
    q: 'Show only your technical work.',
    a: 'From production software engineering (APIs, databases, Linux, CI/CD, deployment, monitoring) to Python/FastAPI decision runtimes, Rust/Go/Solidity fail-closed execution infrastructure, an OpenAI-compatible reliability-learning router in JavaScript, and agent kernels with staged verification. Every piece is connected to a real system, and the strongest evidence is the negative results I can prove.',
    scenes: ['technology', 'decision-systems', 'router', 'agents'],
    badges: ['SHIPPED', 'PRODUCTION', 'OPEN SOURCE'],
    links: [
      { label: 'Scene 01 · Technology', href: '/journey#technology' },
      { label: 'smart-trader', href: 'https://github.com/MajidAsghariTabrizi/smart-trader' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Derived                                                             */
/* ------------------------------------------------------------------ */

export const SCENE_BY_ID = Object.fromEntries(JOURNEY_SCENES.map((s) => [s.id, s])) as Record<string, Scene>;
export const NODE_BY_ID = Object.fromEntries(JOURNEY_NODES.map((n) => [n.id, n])) as Record<string, JourneyNode>;
export const EXPERIMENT_BY_ID = Object.fromEntries(EXPERIMENTS.map((x) => [x.id, x])) as Record<string, Experiment>;
