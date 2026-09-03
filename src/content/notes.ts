export type Note = {
  slug: string;
  number: string;
  title: string;
  category: 'engineering' | 'product' | 'architecture' | 'ai' | 'systems';
  lede: string;
  body: string[];
  relatedProjects?: string[];
  date: string;
};

export const NOTES: Note[] = [
  {
    slug: 'reliability-beats-cleverness',
    number: '01',
    title: 'Reliability beats cleverness',
    category: 'engineering',
    lede:
      'A profitable-looking opportunity is irrelevant if the underlying state is uncertain. Phoenix exists to make that sentence structurally true.',
    body: [
      'Most trading systems optimize for one number — model spread — and treat state, providers, fees, and execution as background noise. The result is a system that is technically correct and operationally wrong.',
      'Phoenix separates the signal from the authority to act. The engine computes; the executor decides; the dual-provider agreement is the only gate that can grant execution. If the gate disagrees with itself, the system closes the door and waits for fresh evidence.',
      'Reliability is not "the system is up". Reliability is "the system never does something it cannot defend with evidence".',
    ],
    relatedProjects: ['phoenix'],
    date: '2026-09',
  },
  {
    slug: 'economic-correctness-matters',
    number: '02',
    title: 'Economic correctness matters',
    category: 'systems',
    lede:
      'A strategy can be technically correct and economically wrong. The job of an execution system is to be the second kind of correct.',
    body: [
      'Modelled spread is a number. It is not a profit. Between the model and the realized PnL sit gas, L1 data cost, flash premium, ordering cost, slippage, price impact, and an honest reserve for the things you forgot.',
      'Phoenix models every one of those, conservatively, before the engine ever asks the executor to sign. If the conservative estimate is below the retained-profit floor, the opportunity does not exist — not even as a thought experiment.',
      'A system that models only the upside is a system that will be surprised by the downside.',
    ],
    relatedProjects: ['phoenix'],
    date: '2026-09',
  },
  {
    slug: 'production-is-part-of-the-product',
    number: '03',
    title: 'Production is part of the product',
    category: 'architecture',
    lede:
      'Deployment, rollback, observability, and reconciliation are product capabilities. Without them, "live" is not a meaningful word.',
    body: [
      'A Phoenix release is not a code merge. It is a sequence: protected merge → immutable build → manifest → preflight → candidate rehearsal → evidence mode → burn-in → explicit owner activation. Each step exists because the previous step proved insufficient on its own.',
      'The cost of skipping a step is not "we might break something". The cost is that you can no longer defend the meaning of the word "live". A protected release pipeline is the difference between "running" and "production".',
    ],
    relatedProjects: ['phoenix'],
    date: '2026-09',
  },
  {
    slug: 'ai-needs-infrastructure',
    number: '04',
    title: 'AI needs infrastructure',
    category: 'ai',
    lede:
      'Models are not the product by themselves. Routing, context, evaluation, tools, and feedback loops are. Free Best Router and UEA are the same lesson at different layers.',
    body: [
      'A model is one of several things that has to be right before a user sees an answer. The other things — which model, under which prompt, with which context, with which fallback, with which observability — are infrastructure.',
      'Free Best Router treats the model layer as a routing problem: discover, score, fail over, cool down. Universal Engineering Agent treats the agent layer as a kernel problem: inspect, plan, verify, classify, recover. Both exist because the model alone is not enough.',
    ],
    relatedProjects: ['free-best-router', 'universal-engineering-agent'],
    date: '2026-09',
  },
  {
    slug: 'fail-closed-is-not-fast',
    number: '05',
    title: 'Fail-closed is different from fast',
    category: 'systems',
    lede:
      'When execution has real consequences, uncertainty must reduce authority rather than trigger action.',
    body: [
      'Most latency-driven systems are designed so uncertainty speeds things up. If you do not know what is happening, you act more aggressively before the window closes. That is correct for some systems.',
      'It is the opposite of correct for systems that move real money against real counterparties. There, uncertainty must reduce authority. The lane must disarm, the lock must hold, the executor must refuse to sign, the operator must be told.',
      'Fail-closed is not slow. Fail-closed is fast at refusing to do the wrong thing.',
    ],
    relatedProjects: ['phoenix'],
    date: '2026-09',
  },
  {
    slug: 'product-thinking-changes-engineering',
    number: '06',
    title: 'Product thinking changes engineering',
    category: 'product',
    lede:
      'Architecture should exist because of a user / business / system problem, not because a technology is fashionable.',
    body: [
      'Smart Trader started as a strategy and became a product when the constraint "must run for real every day" was added. That constraint forced the architecture to be honest: provider fallback, risk gates, additive endpoints, staged deploys, an operator dashboard that is itself a product surface.',
      'Engineering is most powerful when it is the answer to a specific question. The question is never "what is fashionable?" — it is "what does this system need to do, for whom, under what constraints, and what evidence will it produce?".',
    ],
    relatedProjects: ['smart-trader'],
    date: '2026-09',
  },
  {
    slug: 'one-stable-interface',
    number: '07',
    title: 'One stable interface in front of a churning ecosystem',
    category: 'architecture',
    lede:
      'A good abstraction absorbs change so the caller does not have to. The OpenAI-compatible surface of Free Best Router is that abstraction for free LLMs.',
    body: [
      'Free AI providers change weekly. Their catalogs change, their rate limits change, their model availability changes. If your application talks to each provider directly, every change in that ecosystem is your change.',
      'An OpenAI-compatible router in front of all of them means your application talks to one thing. The router deals with churn, scoring, failover, and cooldown. You stop caring.',
      'The discipline: design the interface around what the caller wants to say, not around what the underlying systems currently expose.',
    ],
    relatedProjects: ['free-best-router'],
    date: '2026-09',
  },
  {
    slug: 'agents-need-a-kernel',
    number: '08',
    title: 'Agents need a kernel, not a personality',
    category: 'ai',
    lede:
      'Engineering agents accumulate tribal knowledge until they are unmaintainable. The fix is a small kernel plus a project-specific profile.',
    body: [
      'Most agent prompts grow. They grow because every new lesson becomes a new instruction. Eventually the prompt is thousands of tokens of opaque context and only the author can use it.',
      'Universal Engineering Agent splits this in two. The kernel holds the universal parts — inspect, plan, implement, verify, classify, recover, test, generalize. The profile holds the project-specific parts — language, deployment policy, safety tier. Profiles are inspectable, versionable, and small.',
      'The result is an agent that survives the test of time without becoming a maintenance liability.',
    ],
    relatedProjects: ['universal-engineering-agent'],
    date: '2026-09',
  },
  {
    slug: 'trust-is-a-product',
    number: '09',
    title: 'Trust is a product',
    category: 'product',
    lede:
      'A trading system is not a strategy. It is the integration of market data, decision logic, risk gates, and a UI that lets an operator trust what the system is doing.',
    body: [
      'Operators are users. They need to answer "what is the system doing right now, and why?" in one screen. If they cannot, they will stop using the system the first time it does something unexpected.',
      'Trust is built from observable behavior: every decision has reasons, every risk gate has a state, every action has an undo path. Smart Trader treats the dashboard as a contract — once shipped, behavior changes either respect it or signal a migration.',
      'A system no one trusts is a system no one uses, no matter how good its edge is.',
    ],
    relatedProjects: ['smart-trader'],
    date: '2026-09',
  },
  {
    slug: 'small-kernel-large-surface',
    number: '10',
    title: 'Small kernel, large surface',
    category: 'architecture',
    lede:
      'The right primitive is small enough to be obviously correct and large enough to be obviously useful. Phoenix, Free Router, UEA all share this shape.',
    body: [
      'Phoenix\'s kernel is the decision pipeline (six verbs, eleven invariants). Free Best Router\'s kernel is the routing loop (discover, score, route, failover, cool down). UEA\'s kernel is the nine stages (inspect, plan, implement, verify, classify, recover, test, generalize, hygiene).',
      'Each kernel is small enough to be defended in a single document. Each system\'s surface — the lanes, the providers, the profiles — is large and grows over time. The shape is the same.',
      'If your kernel needs a paragraph to explain, it is too big. If your surface cannot grow without changing the kernel, the abstraction is wrong.',
    ],
    relatedProjects: ['phoenix', 'free-best-router', 'universal-engineering-agent'],
    date: '2026-09',
  },
];

export const NOTE_BY_SLUG = Object.fromEntries(NOTES.map((n) => [n.slug, n])) as Record<string, Note>;