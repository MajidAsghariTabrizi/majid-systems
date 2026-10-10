/**
 * Content for the Quantiviq commercial homepage (AI-native organization
 * transformation). Copy is operator + systems-architect voice: no buzzwords,
 * no invented client outcomes, structural claims only.
 */

export const BRAND = {
  name: 'Quantiviq',
  wordmark: 'QUANTIVIQ',
  tagline: 'AI-native organization transformation',
  title: 'Quantiviq — Rebuild the Company for the Agentic Era',
  description:
    'AI-native organization design: structure, workflows, agents, decision systems and a persistent company brain engineered as one operating model.',
  ogImage: '/og-quantiviq.svg',
} as const;

/* ================= Hero ================= */

export const HERO = {
  tag: 'FROM COMPANY-AS-CHART / TO COMPANY-AS-SYSTEM',
  h1: 'REBUILD THE COMPANY.',
  sub: 'For an era where intelligence is no longer exclusively human.',
  bodyP1: 'Most companies added AI to the old operating model. The bottleneck is still the company itself.',
  bodyP2:
    'Quantiviq redesigns how work, decisions, knowledge and authority move — so humans and agents operate as one learning system.',
  ctaPrimary: { label: 'EXPLORE THE SYSTEM', href: '#simulator' },
  ctaSecondary: { label: 'REBUILD A FUNCTION', href: '#method' },
} as const;

/** Friction metrics shown in the "traditional organization" phase (illustrative). */
export const FRICTION_METRICS = [
  { label: 'DECISION LATENCY', value: '4.2 DAYS' },
  { label: 'HANDOFFS', value: '17' },
  { label: 'MEETINGS', value: '31/WEEK' },
  { label: 'HUMAN ROUTING', value: '84%' },
  { label: 'KNOWLEDGE', value: 'FRAGMENTED' },
  { label: 'LEARNING LOOP', value: 'OPEN' },
] as const;

/** The traveling event: one decision through the traditional machine. */
export const SIGNAL_HOPS = [
  { node: 'EMPLOYEE', note: 'Sees the problem. Writes it up.', latency: '+3h' },
  { node: 'MANAGER', note: 'Reviews. Asks for context.', latency: '+1.1d' },
  { node: 'SLACK', note: 'Thread. Four people weigh in.', latency: '+0.6d' },
  { node: 'MEETING', note: 'Scheduled Thursday.', latency: '+1.2d' },
  { node: 'ANALYST', note: 'Pulls the numbers. New request.', latency: '+0.8d' },
  { node: 'APPROVAL', note: 'Signed off. Queued.', latency: '+0.5d' },
  { node: 'ACTION', note: 'Finally executed.', latency: '' },
] as const;

/** Target topology layer labels. */
export const TOPOLOGY_LAYERS = [
  { label: 'HUMAN AUTHORITY', note: 'sets policy, thresholds, direction' },
  { label: 'ORGANIZATION CONTROL PLANE', note: 'decision rights, escalation rules' },
  { label: 'HUMANS · AGENTS · WORKFLOWS', note: 'execution at the edge' },
  { label: 'COMPANY BRAIN', note: 'shared knowledge state' },
  { label: 'ENTERPRISE SYSTEMS', note: 'source-of-truth systems of record' },
] as const;

export const HERO_REVEAL = 'Same company. Different operating physics.' as const;

/* ================= How the system learns ================= */

/** The canonical system flow — one loop, authority inside it. */
export const SYSTEM_FLOW = [
  { key: 'signal', label: 'SIGNAL', note: 'event, question, incident' },
  { key: 'state', label: 'RETRIEVE STATE', note: 'what the company already knows' },
  { key: 'decide', label: 'DECIDE', note: 'against explicit decision rights' },
  { key: 'authority', label: 'AUTHORITY CHECK', note: 'act alone, or human approval' },
  { key: 'act', label: 'ACT', note: 'humans + agents execute' },
  { key: 'measure', label: 'MEASURE', note: 'outcome recorded as evidence' },
  { key: 'learn', label: 'LEARN', note: 'brain state updates' },
] as const;

export const SYSTEM_FLOW_CAPTION =
  'Signals become decisions. Decisions become actions. Actions create evidence. Evidence updates what the company knows. The company learns.' as const;

/* ================= Company latency ================= */

export const LATENCY_INTRO =
  'In the traditional company, information travels at the speed of meetings. In the AI-native company, it travels at the speed of the system.' as const;

export type LatencyForm = {
  key: string;
  name: string;
  question: string;
  body: string;
};

export const LATENCY_FORMS: LatencyForm[] = [
  {
    key: 'decision',
    name: 'Decision latency',
    question: 'How long from an important question to a confident answer?',
    body: 'Answers are assembled by hand — reports, decks, meetings — and routed through management layers to reach a decision point that could have been instrumented.',
  },
  {
    key: 'context',
    name: 'Context latency',
    question: 'How long before the people — or agents — doing the work have what they need?',
    body: 'Knowledge lives fragmented across inboxes, documents, and heads. Every task starts with a hunt for context that the company already paid to create once.',
  },
  {
    key: 'coordination',
    name: 'Coordination latency',
    question: 'How much of the work is work about the work?',
    body: 'Dependencies between teams are scheduled by meetings and managed by status-chasing. Coordination is treated as human labor instead of system behavior.',
  },
  {
    key: 'execution',
    name: 'Execution latency',
    question: 'How long from a decision to the work actually being done?',
    body: 'Approved intent queues behind busy humans. The routinized middle of the workflow — where most delay lives — is exactly the part machines execute best.',
  },
  {
    key: 'learning',
    name: 'Learning latency',
    question: 'How long until an outcome changes future behavior?',
    body: 'Every incident, deal, and decision produces experience — which evaporates in retros and documents instead of updating how the company operates.',
  },
];

/* ================= Organization OS ================= */

export const OS_INTRO =
  'Most companies adopt AI at the tool layer and hope the org absorbs it. The AI-native company runs on an operating system: structure, workflows, agents, and decision systems engineered as one model. Not a chart. A nervous system.' as const;

export type OsLayer = {
  key: string;
  num: string;
  name: string;
  role: string;
  detail: string;
};

export const OS_LAYERS: OsLayer[] = [
  {
    key: 'governance',
    num: '01',
    name: 'Governance & Access',
    role: 'what agents may do alone',
    detail:
      'Decision rights are explicit and machine-readable: which actions agents take autonomously, which require human approval, which are forbidden. Authority is a policy artifact, not a tribal understanding.',
  },
  {
    key: 'authority',
    num: '02',
    name: 'Human Authority',
    role: 'direction, judgment, thresholds',
    detail:
      'Humans set objectives, constraints, and escalation thresholds — then spend their time on judgment, negotiation, and direction instead of routing information.',
  },
  {
    key: 'control-plane',
    num: '03',
    name: 'Organization Control Plane',
    role: 'decision rights, escalation rules',
    detail:
      'The layer that routes work and decisions by rule: what escalates, to whom, with what evidence attached. Coordination becomes system behavior you can inspect instead of meetings you can attend.',
  },
  {
    key: 'workflows',
    num: '04',
    name: 'Workflow Layer',
    role: 'processes as executable flows',
    detail:
      'Company processes exist as executable, observable workflows — not diagrams in a wiki. Each step is performed by a human, an agent, or a system, with state and handoffs you can audit.',
  },
  {
    key: 'agents',
    num: '05',
    name: 'Agent Runtime',
    role: 'where agents live and act',
    detail:
      'Agents run in a governed runtime: scheduled, scoped to explicit tools and data, logged decision-by-decision. They inherit procedure from the brain and authority from the control plane.',
  },
  {
    key: 'brain',
    num: '06',
    name: 'Company Brain',
    role: 'persistent knowledge state',
    detail:
      'A shared memory that knows what the company knows — with epistemic state. Every claim carries support, counter-evidence, and freshness. Agents and humans reason over the same state.',
  },
  {
    key: 'data',
    num: '07',
    name: 'Data Plane',
    role: 'events, metrics, documents',
    detail:
      'The observable record of the company: streams of events, metrics, and documents that the brain cites and the workflows act on. One substrate instead of per-team exports.',
  },
  {
    key: 'tools',
    num: '08',
    name: 'Tool Layer',
    role: 'internal systems and APIs',
    detail:
      'Enterprise systems of record — CRM, ERP, billing, support — exposed through governed interfaces so workflows and agents act on the real systems, not copies.',
  },
];

/* ================= Company Brain demo ================= */

export const BRAIN_DEMO = {
  title: 'Ask the company a question',
  query: 'Why did checkout conversion drop yesterday?',
  sections: [
    {
      heading: 'What we know',
      items: [
        {
          state: 'OBSERVED',
          text: 'Checkout conversion −18% vs 7-day baseline, concentrated 23:40–02:10 UTC.',
          evidence: 'funnel events, warehouse table checkout_daily',
        },
        {
          state: 'VERIFIED',
          text: 'Payment provider p95 latency rose 4.1s → 11.8s in the same window.',
          evidence: 'provider status page incident #48271, confirmed by two probes',
        },
        {
          state: 'OBSERVED',
          text: 'Card-form abandonment +31%; exit-to-status-page sessions up 9×.',
          evidence: 'session replays sample, n=214',
        },
      ],
    },
    {
      heading: 'What we don’t know',
      items: [
        {
          state: 'UNKNOWN',
          text: 'Whether the latency spike caused the drop — correlation only; no experiment has run.',
          evidence: 'no causal test on file',
        },
        {
          state: 'UNKNOWN',
          text: 'Segment impact by device and region is not yet computed.',
          evidence: 'breakdown query not run',
        },
      ],
    },
    {
      heading: 'Current state of prior claims',
      items: [
        {
          state: 'STALE',
          text: 'Support tickets tagged “checkout” were last triaged 14h ago.',
          evidence: 'ticket queue export',
        },
        {
          state: 'SUPERSEDED',
          text: 'Earlier hypothesis: pricing-page A/B test — ruled out; the test ended Sep 12.',
          evidence: 'experiment log',
        },
      ],
    },
    {
      heading: 'Next action',
      items: [
        {
          state: 'PATH',
          text: 'Reconstruct the funnel by latency bucket; if confirmed, attach evidence to the incident and arm a rollback rule at p95 > 8s.',
          evidence: 'proposed — awaiting owner approval',
        },
      ],
    },
  ],
  legend: [
    { state: 'OBSERVED', meaning: 'measured, not yet explained' },
    { state: 'VERIFIED', meaning: 'confirmed against independent evidence' },
    { state: 'UNKNOWN', meaning: 'explicitly open question' },
    { state: 'STALE', meaning: 'was true; freshness expired' },
    { state: 'SUPERSEDED', meaning: 'replaced by a better claim' },
    { state: 'PATH', meaning: 'proposed next action' },
  ],
  caption:
    'A company brain is not a chatbot over documents. It is a system that remembers what the company knows, how sure it is, and what would change its mind.',
} as const;

/* ================= Learning loop ================= */

export const LOOP_STEPS = [
  { key: 'observe', label: 'OBSERVE', note: 'events and outcomes' },
  { key: 'understand', label: 'UNDERSTAND', note: 'interpret against memory' },
  { key: 'decide', label: 'DECIDE', note: 'choose under explicit rights' },
  { key: 'act', label: 'ACT', note: 'humans + agents execute' },
  { key: 'measure', label: 'MEASURE', note: 'outcomes recorded' },
  { key: 'learn', label: 'LEARN', note: 'procedures update' },
] as const;

export const LOOP_OLD = {
  title: 'Old company — experience evaporates',
  steps: [
    'Q3 incident happens',
    'Postmortem written',
    'Document filed',
    'Folder archived',
    'Next quarter: same incident',
  ],
} as const;

export const LOOP_NATIVE = {
  title: 'AI-native company — experience compounds',
  steps: [
    'Incident happens',
    'Brain records claim + evidence',
    'Procedure updated',
    'Agents inherit the change',
    'Next incident: different',
  ],
} as const;

export const LOOP_CAPTION =
  'The difference between a company that learns and a company that remembers nothing is infrastructure.' as const;

/* ================= Founder bridge (one line — story lives in /journey) ================= */

export const PROOF_BRIDGE = {
  eyebrow: 'The person behind it',
  line: 'Operator first, systems architect by necessity — two careers, restructured companies from the inside and built the machinery an AI-native company runs on.',
  journey: { label: 'Why this thesis → the journey', href: '/journey' },
  profile: { label: 'What he actually built', href: '/profile' },
} as const;

/* ================= Primitives ================= */

export type Primitive = {
  key: string;
  name: string;
  oneLiner: string;
  proof: string;
  status: string;
  statusKind: 'ok' | 'path' | 'warn' | 'unknown';
  href: string;
};

export const PRIMITIVES: Primitive[] = [
  {
    key: 'company-brain',
    name: 'Company Brain',
    oneLiner: 'Persistent organizational memory with epistemic state.',
    proof: 'A personal-brain instance is in daily operational use — claims carry evidence, sensitivity, and supersession history.',
    status: 'IN DAILY USE',
    statusKind: 'ok',
    href: '/contact',
  },
  {
    key: 'agent-runtime',
    name: 'Agent Runtime',
    oneLiner: 'Governed environment where agents are scheduled, scoped, and logged.',
    proof: 'DeepSeek Harness deployment running multi-stage missions with checkpoints, budgets, and classification of every failure.',
    status: 'PRODUCTION',
    statusKind: 'ok',
    href: '/engineering',
  },
  {
    key: 'model-router',
    name: 'Model Router',
    oneLiner: 'OpenAI-compatible router across free model providers with health scoring.',
    proof: 'free-best-router — MIT-licensed, deterministic test suite, CI green.',
    status: 'MIT · v0.1.0',
    statusKind: 'path',
    href: '/work/free-best-router',
  },
  {
    key: 'phoenix',
    name: 'Phoenix',
    oneLiner: 'Fail-closed autonomous execution: intelligence, authority, and execution strictly separated.',
    proof: 'Multi-language production system on Arbitrum with protected release model and receipt-level reconciliation.',
    status: 'PRODUCTION',
    statusKind: 'ok',
    href: '/work/phoenix',
  },
  {
    key: 'uea',
    name: 'Universal Engineering Agent',
    oneLiner: 'A profile-agnostic operating kernel contract for engineering agents.',
    proof: 'MIT-licensed reference implementation: staged verification, failure classification, checkpointing.',
    status: 'MIT · REFERENCE',
    statusKind: 'path',
    href: '/work/universal-engineering-agent',
  },
];

export const PRIMITIVES_NOTE =
  'The primitives were built before the thesis had a name.' as const;

export const PRIMITIVES_HONESTY =
  'One system is deliberately absent from this list: Smart Trader. Its market data stream froze on 2026-09-23; until it is verifiably live again, it stays archived under the builder profile — not presented as evidence.' as const;

/* ================= Engagement — the method loop ================= */

export const ENGAGEMENT = {
  headline: 'Start with one function.',
  body: 'Not a transformation program. One function, rebuilt end to end — then expanded. This is the entire method:',
  steps: [
    { num: '01', title: 'MAP', note: 'the function as it actually runs — not the org-chart version' },
    { num: '02', title: 'REDESIGN', note: 'humans, agents, workflows, brain — one operating model, explicit authority' },
    { num: '03', title: 'BUILD', note: 'the domain company brain and governed agents — knowledge with state, authority enforced' },
    { num: '04', title: 'GOVERN', note: 'what agents may do alone, what needs approval — logged, reviewable, reversible' },
    { num: '05', title: 'MEASURE', note: 'decisions and outcomes instrumented against the latency baseline' },
    { num: '06', title: 'LEARN', note: 'evidence updates procedures; agents and humans inherit the change' },
    { num: '07', title: 'EXPAND', note: 'the brain compounds; the next function starts ahead' },
  ],
  close: 'Support, data & reporting, sales operations — routinized, knowledge-bound, measurable functions are the fastest place to prove latency collapse.',
  cta: { label: 'Rebuild one function', href: '/contact' },
} as const;

/* ================= Final CTA — the signature question lives here, once ================= */

export const FINAL_CTA = {
  lines: ['If your company were founded today —', 'would you design it the same way?'],
  answer: 'Probably not.',
  headline: 'Rebuild the company.',
  primary: { label: 'Start an Organization Diagnostic', href: '/contact' },
  secondary: { label: 'Why this thesis — the journey', href: '/journey' },
} as const;
