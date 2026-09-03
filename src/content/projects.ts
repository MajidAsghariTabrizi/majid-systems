export type ProjectCategory = 'flagship' | 'supporting' | 'fork' | 'experiment';
export type ProjectStatus =
  | 'production-live'
  | 'production-no-alpha'
  | 'active-development'
  | 'reference-implementation'
  | 'released'
  | 'fork';

export type ProjectMetric = { label: string; value: string };

export type Project = {
  slug: string;
  name: string;
  category: ProjectCategory;
  status: ProjectStatus;
  statusLabel: string;
  oneLiner: string;
  thesis: string;
  problem: string;
  whatIBuilt: string[];
  whyItMatters: string;
  hasArchitecture: boolean;
  hasPipeline: boolean;
  hasSafety: boolean;
  decisions: string[];
  whatFailed: string[];
  technicalImplementation: string[];
  productImplications: string[];
  lessons: string[];
  currentState: string;
  githubUrl: string;
  languages: string[];
  metrics?: ProjectMetric[];
  topics?: string[];
  dates: { started: string; latest?: string };
  parent?: string;
};

export const PROJECTS: Project[] = [
  {
    slug: 'phoenix',
    name: 'Phoenix',
    category: 'flagship',
    status: 'production-no-alpha',
    statusLabel: 'Production live — observing alpha',
    oneLiner:
      'Production-grade, fail-closed financial intelligence and execution system for Arbitrum.',
    thesis:
      'A profitable-looking opportunity is irrelevant if the underlying state is uncertain. Phoenix exists to keep intelligence, authority, and execution strictly separate — and to refuse action until every gate agrees.',
    problem:
      'Most on-chain trading systems are described as strategy code. In production they must coordinate real-time event ingestion, on-chain state, independent RPC evidence, exact economics, signer and nonce safety, single-transaction authority, receipts, reconciliation, monitoring, and incident recovery. Phoenix treats all of those as one product and one control system.',
    whatIBuilt: [
      'A multi-language production system across Rust (engine, executor, RPC gateway, supervisor), Go (feed ingestor, atlas observer, recorder), Python (release controller, monitoring, reporting), and Solidity (on-chain executor with minimum-profit guards).',
      'Three independently armed revenue lanes: Aave V3 liquidation, Atlas auction solver, and origin-aware DEX arbitrage research.',
      'A fail-closed decision pipeline: ingest → normalize → prefilter → exact validation → dual-provider agreement → conservative economic gate → global submission lock → single-transaction execution → receipt reconciliation → realized PnL.',
      'A protected release model with immutable image build, manifest, preflight, candidate rehearsal, evidence mode, burn-in, and explicit owner activation before any revenue lane becomes live.',
      'Production observability across release SHA, container health, provider identity, signers (without keys), controls, candidate counts, expected vs realized PnL, loss-cause ledger, and protected rollback.',
    ],
    whyItMatters:
      'The system explicitly refuses to count submission as profit. Realized net PnL after every actual cost — gas, L1 data, flash premium, ordering, slippage, model reserve — is the only authority. A healthy production system can legitimately remain in FULL_LIVE_NO_ALPHA. That honesty is the design.',
    hasArchitecture: true,
    hasPipeline: true,
    hasSafety: true,
    decisions: [
      'Strict separation of intelligence (signals) and authority (execution) — the engine computes; only the executor may sign.',
      'Conservative economics by default: every cost is modeled, including L1 data, flash premium, ordering cost, and an explicit risk reserve.',
      'Block-pinned dual-provider agreement — never trust one RPC source for a state-dependent decision.',
      'Independent revenue lanes with their own armed / kill-switch / loss-limit / floor / epoch.',
      'Integer arithmetic for token amounts, sqrt prices, ticks, liquidity, gas, and PnL.',
      'No floating-point on any on-chain quantity or opportunity accounting.',
      'Submit at most one revenue transaction at a time, regardless of lane.',
      'Protected release model: immutable build, manifest, preflight, rehearsal, evidence mode, burn-in, then explicit owner activation.',
      'Realized PnL only after receipt and balance reconciliation — never after submission.',
      'Public defaults remain safe; production secrets and activation authority live server-side.',
    ],
    whatFailed: [
      'Early prototypes signed and broadcast directly when a modelled spread crossed a threshold — model, state, pool identity, fee tier, and signer boundary were not independent. That surface had to be rebuilt from the evidence layer up.',
      'Wide initial scope (triangular routes, CEX strategies, sandwiching, blind scanning) created too much surface and too little truth. Scope was narrowed deliberately; breadth is being re-added lane-by-lane only after evidence.',
      'Long-tail residual observer was activated for LINK/WETH and similar pairs, but upstream providers in the current slot do not support debug_traceTransaction — that lane remains research until the supporting sensor is available.',
      'A healthy production system can sit in FULL_LIVE_NO_ALPHA for extended periods. That is not failure; it is the system refusing to act without authority. Recognizing this state took time.',
    ],
    technicalImplementation: [
      'Rust core (phoenix-engine, live-executor, rpc-gateway, economic-supervisor, recorder, replay, fork-sandbox) — latency-critical path contains no Python.',
      'Go services (feed-ingestor, atlas-observer, aave-liquidation-hunter, recorder, shadow-dispatcher) for ordered event normalization and observation.',
      'Python release controller, validation, monitoring, and reporting tooling.',
      'Solidity PhoenixExecutor contract with minimum-profit guards.',
      'PostgreSQL as durable control and economic truth; NATS JetStream as internal transport; Prometheus for metrics; Streamlit dashboard for bounded operator visibility.',
      'Docker Compose orchestration across ingestion, decision, execution, recorder, shadow, database, messaging, metrics, dashboard.',
      'GitHub Actions + protected release controller + immutable artifact delivery.',
      'Arbitrum One as the execution network; Aave V3 as the liquidation market and flash provider; Atlas as the auction / solver opportunity stream.',
    ],
    productImplications: [
      'A live production system may legitimately not trade. The product must communicate this honestly to operators, partners, and reviewers.',
      'Every external metric a dashboard shows — gas, latency, RPC quality — is downstream. The product is realized net PnL after reconciliation.',
      'Risk controls are not an overlay; they are the architecture. Lane isolation means a researcher lane cannot accidentally take capital from a revenue lane.',
      'A protected release pipeline is a product capability, not a CI concern. Without it, "live" is not a meaningful word.',
    ],
    lessons: [
      'Reliability beats cleverness. A profitable-looking opportunity is irrelevant if the underlying state is uncertain.',
      'Economic correctness matters more than technical correctness. A strategy can be technically correct and economically wrong.',
      'Production is part of the product. Deployment, rollback, observability, and reconciliation are product capabilities — not afterthoughts.',
      'Separate intelligence from authority. The engine should not hold the keys, and the executor should not pick the opportunity.',
      'Fail-closed is different from fast. When execution has real consequences, uncertainty must reduce authority rather than trigger action.',
      'Honest state naming matters. FULL_LIVE_NO_ALPHA is a valid terminal state. Pretending otherwise is how systems become fragile.',
    ],
    currentState:
      'Production live in observation mode. The system is running, dual-provider authority is available, and no currently observed opportunity passes every profitability and safety gate. The next legitimate terminal state is FIRST_POSITIVE_REALIZED_PNL — and that label is only applied after a real transaction is submitted, confirmed, balance-reconciled, and produces positive realized net PnL.',
    githubUrl: 'https://github.com/MajidAsghariTabrizi/anti-gravity-phoenix-v4',
    languages: ['Rust', 'Python', 'Go', 'Solidity', 'PLpgSQL', 'TypeScript', 'Shell', 'Dockerfile'],
    topics: [
      'aave-v3',
      'arbitrum',
      'atlas-auction',
      'dex-arbitrage',
      'fail-closed',
      'financial-infrastructure',
      'liquidation',
      'mev',
      'production-ready',
      'rust',
    ],
    dates: { started: '2025-11', latest: '2026-09' },
  },
  {
    slug: 'smart-trader',
    name: 'Smart Trader',
    category: 'flagship',
    status: 'active-development',
    statusLabel: 'Active development',
    oneLiner:
      'A decision-intelligence trading system: market structure, behavior signals, and explicit risk gates.',
    thesis:
      'A trading system is not a strategy. It is the integration of market data, behavior intelligence, decision logic, risk gates, and a UI that lets a human — or an automated supervisor — trust what the system is doing.',
    problem:
      'Most trading prototypes fail the same way: they conflate signal with action. Smart Trader was built to keep them apart — to model market structure honestly, to expose every decision with its reasons, to bound risk per trade and per regime, and to survive the boring parts of being a real product.',
    whatIBuilt: [
      'A FastAPI backend with a continuous trading loop, SQLite-backed durable state, and a vanilla-JS dashboard served as static files.',
      'A multi-provider market data layer with explicit fallback (Wallex → CoinGecko → CoinCap), normalized candle schema, and per-provider health.',
      'A SignalEngine that combines trend, momentum, mean-reversion, breakout channels with ADX gating, ATR-based stops, regime scaling, and behavior intelligence as an additional weighted channel.',
      'A risk model that sizes positions against equity, applies per-trade and per-regime caps, and rejects actions that would breach daily loss limits.',
      'A staged deployment (production + staging subdomains, separate systemd services, separate ports, separate databases) and a deliberate non-modification contract with the live trading engine.',
    ],
    whyItMatters:
      'Smart Trader is the project where the constraint of "must run for real, every day, with real money" stops being optional. It taught me that a clean strategy is not the deliverable — the deliverable is the system that survives contact with a live market, bad data, and an operator who has to sleep.',
    hasArchitecture: true,
    hasPipeline: false,
    hasSafety: false,
    decisions: [
      'Multi-provider market data with explicit fallback and per-provider health — never trust a single feed.',
      'Behavior intelligence as a weighted channel, not a black box override.',
      'Risk gates before every position change, not after.',
      'Regime-aware thresholds so the same signal in a high-volatility regime cannot trigger the same action as in a low-volatility one.',
      'Hard separation between strategy logic (trading_logic.py) and infrastructure (web_app.py, owner_api.py) — the strategy can be reasoned about in isolation.',
      'Staging subdomain with its own service, port, and database; no shared state with production.',
      'No silent refactors of the live engine. Add new endpoints and tables additively, never mutate the contract that production depends on.',
    ],
    whatFailed: [
      'A first dashboard tried to do too much in one screen. It was rebuilt into a layered structure: landing for first impression, dashboard for the human in operations, app for power use.',
      'Initial risk gating was per-decision only. It became clear the system needed per-day loss limits and per-regime caps — without them, a low-quality streak drained equity even when individual trades were "correct".',
      'The market data layer initially assumed one provider would always be available. The first live outage made the fallback contract non-negotiable.',
      'A version of behavior intelligence was bolted onto the engine without an interface. It became ungovernable. The new version is a bounded weighted channel with explicit scoring.',
    ],
    technicalImplementation: [
      'Python 3.12 with FastAPI for HTTP, sqlite3 for durability, vanilla JS + CSS for the UI.',
      'SignalEngine with DecisionContext, StrategyParams, Account, Position dataclasses.',
      'MarketDataProvider interface with WallexProvider as primary and HTTP-based fallback providers.',
      'Behavior engine as a separate module with explicit score, bias, and provider list fields on the decision context.',
      'systemd services: smarttrader-api (HTTP), smarttrader-bot (decision loop); staging duplicates on different ports and databases.',
      'nginx reverse proxy: /api/* → :8000, static/* served from disk, /dashboard served from disk.',
      'GitHub Actions deploy-prod / deploy-stg with rollback artifact, DB backup, schema ensure, restart, and smoke tests.',
      'Telegram integration for outbound notifications.',
    ],
    productImplications: [
      'A trading product is as much about trust as about edge. Operators must be able to answer "what is the system doing right now, and why?" in one screen.',
      'The boring parts of a trading product — observability, rollback, staged deploys, additive endpoints — are what separate a prototype from a system.',
      'Risk gates must be visible. A trade that the system did not take is more important than a trade it did.',
      'A UI is a contract. Once shipped to operators, every behavior change must respect that contract or signal a migration.',
    ],
    lessons: [
      'Product thinking changes engineering. Architecture exists because of a user, business, or system problem, not because a technology is fashionable.',
      'Behavior intelligence without an interface is technical debt waiting to happen. Every non-core module deserves a typed contract.',
      'Operators are users too. The system has to be operable, not just correct.',
      'Refusing a trade is a first-class product action, not the absence of one.',
      'Staging is a feature, not a courtesy. A second environment catches the failures you did not know to test for.',
    ],
    currentState:
      'Active development. The decision engine, provider abstraction, behavior intelligence, and UI are in production. The additive-only deployment contract with the running services is honored. The next iteration focuses on better behavior modeling, broader provider coverage, and explicit risk visualizations for operators.',
    githubUrl: 'https://github.com/MajidAsghariTabrizi/smart-trader',
    languages: ['Python', 'HTML', 'CSS', 'JavaScript', 'Shell'],
    dates: { started: '2025-11', latest: '2026-09' },
  },
  {
    slug: 'free-best-router',
    name: 'Free Best Router',
    category: 'flagship',
    status: 'released',
    statusLabel: 'MIT · v0.1.0 released',
    oneLiner:
      'One OpenAI-compatible endpoint that automatically discovers, ranks, and routes to the best available free AI model.',
    thesis:
      'Free AI models are amazing and they are a mess — unreliable, rate-limited, fragmented across many providers, and changing weekly. Hardcoding one model means accepting that model\'s failures. Routing dynamically, with explicit scoring and bounded failure, turns the mess into a stable endpoint.',
    problem:
      'Every free-model provider exposes a different catalog, a different API contract, and a different failure mode. A consumer that wants "the best answer I can get right now, from the free tier, without manual failover" has no good primitive. Free Best Router is that primitive.',
    whatIBuilt: [
      'A Node.js (≥22) OpenAI-compatible router that exposes a single /v1/chat/completions endpoint.',
      'A discovery layer that fetches each provider\'s free model catalog at startup and normalizes it.',
      'A health-check warm-up at boot and continuous runtime scoring using capability, reliability, latency, and context fit.',
      'A Wilson lower bound on success rate with Bayesian shrinkage for under-sampled candidates.',
      'Per-failure-type cooldowns (8 min for 429, 1 h for 404) with exponential backoff and per-type caps.',
      'Smart exploration: a small fraction of requests probe non-incumbent healthy candidates so the winner does not ossify.',
      'Bounded failover: up to 4 attempts per request with a hard wall-time cap, returning 502 / 429 with next_eligible_model and Retry-After when the pool is empty.',
      'DeepSeek Harness first-class integration via OpenAI-compatible provider config.',
      '52 deterministic unit tests, GitHub Actions CI, zero telemetry, self-hosted, MIT-licensed.',
    ],
    whyItMatters:
      'It removes the single biggest operational tax of using free LLMs at scale: the manual failover loop. Once you have one endpoint that picks the best currently-healthy model and degrades safely, the rest of your application stack stops caring about provider churn.',
    hasArchitecture: true,
    hasPipeline: false,
    hasSafety: false,
    decisions: [
      'OpenAI-compatible on the input, OpenAI-compatible on the output — zero lock-in for callers.',
      'Free-only by default. Paid models are opt-in, never the default.',
      'Wilson lower bound over raw success rate — prevents brand-new or rarely-used models from winning on a small sample.',
      'Exploration is bounded and observable (x-free-router-explored response header).',
      'Every completion returns x-free-router-model so the caller knows which underlying model was actually picked.',
      'Zero telemetry. The router does not phone home.',
      '52 deterministic unit tests instead of mocks against a real provider — the test surface is the routing logic itself.',
      'Self-hostable. Provider keys stay on the machine that runs the router.',
    ],
    whatFailed: [
      'A first version used a simple weighted score. Under low traffic, brand-new models with no real evidence would briefly win on capability alone. Wilson lower bound fixed that.',
      'A first version tried to remember failures globally. With many providers and many model IDs, that grew unmanageable. The new version is per-model-per-failure-type with explicit cooldowns.',
      'A first version attempted streaming passthrough naively and lost tool_calls and finish_reason. The new version preserves both end-to-end.',
    ],
    technicalImplementation: [
      'Plain Node.js ≥22, ESM modules, minimal runtime surface.',
      'Provider modules each behind a small adapter that exposes the same shape.',
      'In-memory catalog + per-model health / score / cooldown state, refreshed on demand.',
      'OpenAI-compatible request and response schema, with custom response headers (x-free-router-*) for observability.',
      'Streaming SSE passthrough with finish_reason and tool_calls captured from upstream.',
      'GitHub Actions CI running the deterministic test suite.',
      'MIT-licensed, npm-installable, ready to drop into DeepSeek Harness via a small settings.yaml snippet.',
    ],
    productImplications: [
      'One stable interface in front of a churning ecosystem is a product surface in its own right.',
      'Calling out which model actually answered is not optional — it is the difference between a debuggable system and a black box.',
      'A small test surface that exercises routing logic deterministically is more valuable than a large test surface that depends on live provider availability.',
    ],
    lessons: [
      'Abstractions earn their keep by absorbing change. The router absorbs provider churn; the caller does not have to.',
      'A score is only meaningful if you can defend it under low data. Use a confidence interval, not a point estimate.',
      'Failover has to be bounded. Without a wall-time cap, a stall in one provider cascades into a stall in your service.',
      'Telemetry is a product decision, not an engineering default. Shipping with zero telemetry is a feature when the caller is the operator.',
    ],
    currentState:
      'v0.1.0 released. Public, MIT-licensed, 52 deterministic unit tests, GitHub Actions CI green, DeepSeek Harness first-class integration shipped. Featured on the DSH "Show Your Plugins!" board.',
    githubUrl: 'https://github.com/MajidAsghariTabrizi/free-best-router',
    languages: ['JavaScript', 'TypeScript'],
    topics: [
      'ai',
      'ai-agents',
      'ai-router',
      'cerebras',
      'deepseek',
      'deepseek-harness',
      'developer-tools',
      'free-ai',
      'free-llm',
      'groq',
      'llm',
      'llm-gateway',
      'llm-router',
      'mistral',
      'model-routing',
      'openai-compatible',
      'openrouter',
    ],
    dates: { started: '2026-08', latest: '2026-09' },
  },
  {
    slug: 'universal-engineering-agent',
    name: 'Universal Engineering Agent',
    category: 'flagship',
    status: 'reference-implementation',
    statusLabel: 'MIT · reference implementation',
    oneLiner:
      'A profile-agnostic, runnable, MIT-licensed reference implementation of an engineering-agent operating-kernel contract.',
    thesis:
      'Most engineering-agent prompts grow until they are unmaintainable. The kernel of what every agent needs to ship reliable work is small. The product-specific knowledge — which language, which deployment policy, which safety tier — belongs in a profile, not in the kernel.',
    problem:
      'Engineering agents accumulate tribal knowledge in their system prompts until the prompts are 4,000 tokens of opaque context no one outside the author can reuse. The Universal Engineering Agent (UEA) is the opposite direction: it is intentionally small and intentionally profile-agnostic.',
    whatIBuilt: [
      'A 9-stage operating kernel contract: inspect → plan → implement → verify → classify → recover → test → generalize + hygiene.',
      'A staged verification runner (STATIC → UNIT → INTEGRATION → RUNTIME → DOMAIN) with stable failure classification.',
      'A 10-class error-code classifier with bounded retry and non-retryable fall-through.',
      'A checkpoint system that records objectives, known / unknown / hypotheses / decisions / files-changed / tests-run / blockers / next-action.',
      'A profile-driven runtime so the kernel stays vendor-neutral and project-specific knowledge lives in profiles.',
      'A self-contained CLI: uea inspect / plan / verify / classify / test / scan.',
      '31 self-tests for the agent\'s own code, plus a pre-publish secret / PII scanner.',
      'Documentation suite: operating kernel, architecture, missions, integration, roadmap, security.',
      'Zero runtime dependencies, plain Node.js ≥18.17, MIT-licensed.',
    ],
    whyItMatters:
      'It is the smallest possible reusable shell an LLM-driven engineering agent can sit inside and still be production-safe. It can be used standalone, alongside the DeepSeek Harness `dsh-universal-harness-core` plugin, or alongside free-best-router. It is intentionally not a product — it is a contract.',
    hasArchitecture: true,
    hasPipeline: false,
    hasSafety: false,
    decisions: [
      'Profile-agnostic on purpose. The kernel is what every agent needs; the profile is what a specific project needs.',
      'Zero runtime dependencies. Every dependency is a future maintenance liability.',
      'Self-tests are first-class — the test stage tests the agent\'s own code, the verify stage tests the user\'s code.',
      'Stable 10-class failure taxonomy so retries are bounded and fall-through is explicit.',
      'Checkpoints are JSON-lines on disk, not in a database — easy to inspect, version, and replay.',
      'A pre-publish scanner that fails the build on secrets / PII, run on every commit.',
      'No vendor SDKs, no Graphify dependency, no cloud lock-in. The production plugin in DeepSeek Harness provides those; the kernel contract does not require them.',
    ],
    whatFailed: [
      'Earlier attempts to ship "the one true agent prompt" became unmaintainable fast. The split into a small kernel + a project-specific profile was the direct response.',
      'Early failure handling tried to be clever. The classifier now returns one of ten stable codes and that is it — reasoning is bounded and explicit.',
      'A first version stored checkpoints in a database. That made "show me what the agent did yesterday" much harder than it needed to be. JSON-lines on disk are the right primitive.',
    ],
    technicalImplementation: [
      'Plain Node.js ≥18.17, ESM, no runtime dependencies.',
      'CLI bin/uea.mjs exposing inspect, plan, verify, classify, test, scan.',
      'Modular kernel with one file per stage plus a hygiene tracker.',
      'Self-tests under test/ run with node --test.',
      'Documentation under docs/ covering the operating kernel, architecture, missions, integration, roadmap, and security.',
      'Example profiles and missions under examples/ and profiles/.',
      'CI that runs the self-tests and the secret / PII scanner on every commit.',
      'MIT license, npm-installable, public registry ready.',
    ],
    productImplications: [
      'A reference implementation is a contract others can build on without asking permission.',
      'A small, well-scoped kernel with documented profiles is more useful than a large, opinionated framework.',
      'Tooling that the author themselves uses every day (a scanner, a test runner, a classify command) compounds over time.',
    ],
    lessons: [
      'Split what is universal from what is specific. Universal lives in the kernel; specific lives in the profile.',
      'A failure taxonomy is a product surface. Stable codes are how you build tooling on top of an agent.',
      'Self-tests are not optional. If you cannot test your agent\'s code, you cannot trust your agent.',
      'Documentation is part of the contract. The 9-stage pattern has a reason for every stage and that reason is written down.',
    ],
    currentState:
      'Reference implementation shipped. MIT, zero runtime deps, 31 self-tests, full docs suite. Featured on the DSH "Show Your Plugins!" board. Used as the canonical public-spec counterpart to the DeepSeek Harness `dsh-universal-harness-core` plugin.',
    githubUrl: 'https://github.com/MajidAsghariTabrizi/universal-engineering-agent',
    languages: ['JavaScript'],
    topics: [
      'agent-framework',
      'checkpoint',
      'context-engine',
      'deepseek-harness',
      'dsh',
      'engineering-agent',
      'failure-classification',
      'mission',
      'mit-license',
      'open-source',
      'profile-driven',
      'universal-engineering-agent',
      'verification',
    ],
    dates: { started: '2026-08', latest: '2026-09' },
  },
];

export const PROJECT_BY_SLUG = Object.fromEntries(PROJECTS.map((p) => [p.slug, p])) as Record<
  string,
  Project
>;

export function isFlagshipProject(slug: string): boolean {
  return PROJECT_BY_SLUG[slug]?.category === 'flagship';
}