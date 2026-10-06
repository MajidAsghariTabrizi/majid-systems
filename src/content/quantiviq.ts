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
  eyebrow: 'AI-Native Organization Transformation',
  h1: 'Rebuild the company.',
  sub: 'AI changes the architecture of the company — not just the tools inside it.',
  body: 'Quantiviq redesigns how a function actually runs: its workflows, its decision rights, its knowledge, and its learning loop — humans and agents operating under one shared company brain. The org chart is replaced by an operating model.',
  ctaPrimary: { label: 'Explore the Organization OS', href: '#operating-model' },
  ctaSecondary: { label: 'Rebuild a function', href: '#method' },
  vizTitle: 'From company-as-chart to company-as-system',
  vizCaption:
    'A decision traveling through a traditional org — then the same company, rebuilt as one operating model.',
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

/* ================= Signature question ================= */

export const SIGNATURE = {
  question: 'If your company were founded today, with the technology that exists today… would you design it the same way?',
  answer: 'Probably not.',
  close: 'That’s the work.',
} as const;

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

/* ================= What actually changes ================= */

export const BEFORE_AFTER: { dimension: string; before: string; after: string }[] = [
  {
    dimension: 'Decision rights',
    before: 'Decisions concentrate in management layers; escalation is social.',
    after: 'Decisions distribute to the edge; humans set thresholds and policy.',
  },
  {
    dimension: 'Knowledge',
    before: 'Lives in inboxes, documents, and heads; walks out the door.',
    after: 'Lives in a company brain with explicit state: known, disputed, stale.',
  },
  {
    dimension: 'Execution',
    before: 'Routinized work is performed by humans through tools.',
    after: 'Workflows execute; humans direct, review, and intervene.',
  },
  {
    dimension: 'Exceptions',
    before: 'Every exception escalates to a human, unstructured.',
    after: 'Exceptions escalate by rule — with evidence attached.',
  },
  {
    dimension: 'Coordination',
    before: 'Meetings are the primary routing mechanism.',
    after: 'The control plane routes; meetings are for judgment and direction.',
  },
  {
    dimension: 'Improvement',
    before: 'Retros and postmortems decay into archived documents.',
    after: 'Procedures update; agents and humans inherit the change.',
  },
  {
    dimension: 'Growth',
    before: 'Every unit of scale is a hiring problem.',
    after: 'Capacity is designed — human and agent, per function.',
  },
];

/* ================= Restructuring ================= */

export const RESTRUCTURING = {
  headline: 'AI changes the architecture of the company',
  body: 'This is not tool adoption. When intelligence becomes cheap, the shape of the organization itself becomes a design decision. Things that used to require a department can become a workflow with oversight. Things that used to require a meeting can become a rule.',
  items: [
    'Functions and workflows — what the work actually is, end to end',
    'Decision rights and escalation paths — who decides, what agents may do',
    'Knowledge infrastructure — one brain instead of scattered documents',
    'Agent roles and human roles — defined against each other',
    'Meeting and communication structure — coordination as system behavior',
    'The management layer itself — from routing to direction',
  ],
  close: 'I am not starting from models. I am starting from how the company works — the flows of information, authority, and execution — and designing what it becomes.',
} as const;

/* ================= Founder ================= */

export const FOUNDER = {
  eyebrow: 'The person behind it',
  headline: 'I know organizations from the inside.',
  body: [
    'Majid Asghari — operator first, systems architect by necessity. I started in product: shipping software inside real companies, where the org chart quietly decides what the product can be. Then marketplace systems, data platforms, analytics — the parts of a company where you learn exactly how information actually flows, and where it stalls.',
    'Then I spent years building production AI: a fail-closed autonomous execution system on Arbitrum, an agent runtime in daily use, a model router routing thousands of real requests, an MIT-licensed engineering-agent kernel. Not demos — systems that must not lie about their own state.',
    'Quantiviq is those two careers converging: I have restructured functions from the inside, and I have built the machinery an AI-native company runs on.',
  ],
  link: { label: 'Builder profile — selected work', href: '/profile' },
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

/* ================= Engagement ================= */

export const ENGAGEMENT = {
  headline: 'Start with one function.',
  body: 'Not a transformation program. One function, rebuilt end to end: mapped as it actually runs, redesigned around humans, agents, workflows, and a company brain — then expanded.',
  steps: [
    { num: '01', title: 'Map the function as it actually runs', note: 'Not the org-chart version — the real path of information and decisions.' },
    { num: '02', title: 'Locate latency, routing, and decision structure', note: 'Where time dies, what is routed by humans, who actually decides.' },
    { num: '03', title: 'Design the target operation', note: 'Humans, agents, workflows, brain — one operating model with explicit authority.' },
    { num: '04', title: 'Build the domain company brain', note: 'Knowledge with state: verified, disputed, stale. Cited, not recalled.' },
    { num: '05', title: 'Deploy agents with explicit authority limits', note: 'What they may do alone, what requires approval — enforced, not implied.' },
    { num: '06', title: 'Instrument decisions and outcomes', note: 'Every automated action logged, reviewable, reversible.' },
    { num: '07', title: 'Expand to adjacent functions', note: 'The brain compounds; the next function starts ahead.' },
  ],
  cta: { label: 'Rebuild one function', href: '/contact' },
} as const;

/* ================= First use cases ================= */

export const USE_CASES = [
  {
    key: 'support',
    name: 'Support operations',
    why: 'Tier-1 volume is routinized, knowledge-bound, and measurable — the fastest place to prove latency collapse.',
  },
  {
    key: 'data',
    name: 'Data & reporting',
    why: 'Question → governed answer, with the query, the data, and the confidence attached.',
  },
  {
    key: 'sales-ops',
    name: 'Sales operations',
    why: 'Research, CRM hygiene, and follow-up drafting are context work that agents compound.',
  },
  {
    key: 'content',
    name: 'Content operations',
    why: 'Draft → review → publish is a workflow with clear decision gates and full auditability.',
  },
  {
    key: 'eng-support',
    name: 'Engineering support',
    why: 'Issue triage, test guarding, and release notes — high-volume, evidence-native work.',
  },
  {
    key: 'knowledge',
    name: 'Internal knowledge',
    why: 'Onboarding and process questions: the first function where the brain pays rent.',
  },
] as const;

/* ================= Final CTA ================= */

export const FINAL_CTA = {
  lines: ['If your company were founded today —', 'would you design it the same way?'],
  answer: 'Probably not.',
  headline: 'Rebuild the company.',
  primary: { label: 'Start an Organization Diagnostic', href: '/contact' },
  secondary: { label: 'See Majid’s previous work', href: '/profile' },
} as const;

/* ================= Commercial nav ================= */

export const ROOT_NAV = [
  { label: 'Operating Model', href: '#operating-model' },
  { label: 'Company Brain', href: '#company-brain' },
  { label: 'Method', href: '#method' },
  { label: 'Proof', href: '#proof' },
  { label: 'About', href: '/about' },
] as const;

export const ROOT_NAV_CTA = { label: 'Rebuild a Function', href: '#method' } as const;
export const BUILDER_LINK = { label: 'Builder Profile', href: '/profile' } as const;
