/**
 * Content for the interactive organization simulator (hero).
 * Copy is mission-exact where mandated; all numbers are conceptual.
 * See src/lib/sim/* for geometry and timelines; this file is voice.
 */

/* ================= Signals the visitor can inject ================= */

export type SignalKey = 'customer-issue' | 'product-signal' | 'production-incident' | 'revenue-drop';

export const SIM_SIGNALS: { key: SignalKey; label: string; note: string }[] = [
  { key: 'customer-issue', label: 'CUSTOMER ISSUE', note: 'A customer reports a repeating failure in checkout.' },
  { key: 'product-signal', label: 'PRODUCT SIGNAL', note: 'Usage telemetry shows a drop in activation.' },
  { key: 'production-incident', label: 'PRODUCTION INCIDENT', note: 'Latency alarms fire on the payments path.' },
  { key: 'revenue-drop', label: 'REVENUE DROP', note: 'Weekly revenue misses forecast in one region.' },
];

/* ================= Static labels ================= */

export const SIM_DISCLOSURE = {
  tag: 'ILLUSTRATIVE ORGANIZATION',
  body: 'Conceptual simulation. Not client metrics.',
} as const;

export const SIM_TAG = 'FROM COMPANY-AS-CHART / TO COMPANY-AS-SYSTEM' as const;

export const SIM_METRIC_LABELS = {
  latency: 'COMPANY LATENCY',
  handoffs: 'HANDOFFS',
  routing: 'HUMAN ROUTING',
  knowledge: 'KNOWLEDGE',
  loop: 'LEARNING LOOP',
} as const;

export const SIM_OLD_METRICS = {
  latency: '00:00',
  handoffs: '0',
  routing: 'HIGH',
  knowledge: 'FRAGMENTED',
  loop: 'OPEN',
} as const;

export const SIM_NEW_METRICS = {
  latency: '~12 MIN',
  handoffs: '2',
  routing: 'EXCEPTION ONLY',
  knowledge: 'SHARED STATE',
  loop: 'CLOSED',
} as const;

export const SIM_TOTAL_OLD = '4.2 DAYS' as const;

/* ================= Old-flow hop captions (WHY IT WAITED) ================= */

/** Motion semantics labels shown in the narrative strip. */
export const MOTION_SEMANTICS = {
  WAITING: 'WAITING — signal stopped. Nobody owns the next second.',
  HANDOFF: 'HANDOFF — ownership changes. The trail grows a segment.',
  CONTEXT_LOSS: 'CONTEXT LOSS — metadata falls away with every rewrite.',
  MEETING: 'MEETING — pending states synchronize. Everyone waits for Thursday.',
  APPROVAL: 'APPROVAL — blocked until the right authority appears.',
  TRAVEL: 'ROUTING — the signal moves between humans.',
  EXECUTION: 'AGENT EXECUTION — bounded, fast, inside the path.',
  RETRIEVAL: 'BRAIN RETRIEVAL — institutional knowledge activates.',
  INVESTIGATION: 'INVESTIGATION — the Brain verifies present reality.',
  AUTHORITY: 'AUTHORITY — the gate blocks, then explicitly opens.',
  OUTCOME: 'OUTCOME — the result is measured, not assumed.',
  LEARNING: 'LEARNING — the outcome returns into the Brain.',
} as const;

/* ================= Node inspection cards ================= */

export type NodeInfo = {
  /** Why this exists in the organization. Short lines. */
  lines: string[];
  /** Latency contribution in the old flow, if any. */
  latency?: string;
  /** Role in the new operating model, if any. */
  becomes?: string;
};

export const SIM_NODE_INFO: Record<string, NodeInfo> = {
  SIGNAL: { lines: ['A real organizational signal enters the company.', 'The clock starts here.'] },
  CEO: { lines: ['Owns direction.', 'Every signal that needs judgment queues for a slice of one person’s attention.'], becomes: 'HUMAN AUTHORITY' },
  VP: { lines: ['Translates direction into pressure.', 'Adds a coordination layer between strategy and the work.'], becomes: 'CONTROL PLANE' },
  DIRECTOR: { lines: ['Interprets and re-frames.', 'Evidence becomes decks before it becomes decisions.'], becomes: 'WORKFLOWS' },
  MANAGER: {
    lines: ['Receives context.', 'Repackages context.', 'Routes decision.', 'Waits for synchronization.'],
    latency: '+6h',
    becomes: 'AGENTS',
  },
  EMPLOYEE: { lines: ['Sees the problem first.', 'Writes context by hand, for the next human.'], latency: '+3h', becomes: 'HUMANS' },
  ANALYST: { lines: ['Human retrieval engine.', 'Evidence assembled on request, per meeting.'], latency: '+18h', becomes: 'EVALUATION' },
  SLACK: { lines: ['Information exists.', 'Organizational state does not.'], latency: '+4h', becomes: 'CONTEXT ASSEMBLY' },
  MEETING: { lines: ['Synchronizes human context.', 'Cost: waiting, scheduling, information compression.'], latency: '+1d', becomes: 'COMPANY BRAIN' },
  APPROVAL: { lines: ['Authority is implicit in hierarchy.', 'The signal waits for the right person.'], latency: '+26h', becomes: 'AUTHORITY GATE' },
  ACTION: { lines: ['Finally executed.', 'The response arrives 4.2 days after the signal.'], becomes: 'ENTERPRISE SYSTEMS' },
  BACKLOG: { lines: ['Work waits in queues nobody owns end-to-end.'], latency: '+?' },
  DASHBOARD: { lines: ['Yesterday’s state, refreshed weekly.'], latency: '+?' },
  'HUMAN AUTHORITY': { lines: ['Humans own judgment: policy, thresholds, risk, exceptions.', 'Intelligence is not authority — authority stays here.'] },
  'CONTROL PLANE': { lines: ['Decision rights and escalation rules — explicit, machine-readable.', 'The org chart never said who may decide what.'] },
  WORKFLOWS: { lines: ['Work moves as designed flow with explicit state.', 'Coordination stops being human labor.'] },
  AGENTS: { lines: ['Bounded execution: investigate, propose, act.', 'Inside limits the control plane defines.'] },
  HUMANS: { lines: ['People do judgment, ownership, exception handling.', 'Humans stop being the routing layer.'] },
  'CONTEXT ASSEMBLY': { lines: ['Relevant current state, collected from systems — not memories.'] },
  'COMPANY BRAIN': { lines: ['Persistent institutional intelligence with provenance.', 'Knows what it knows, what changed, what failed, what remains unknown.'] },
  'AUTHORITY GATE': { lines: ['Every proposed action meets explicit authority.', 'Risk, permission, reversibility — checked before execution.'] },
  EVALUATION: { lines: ['Actual outcome measured against intent.', 'The company keeps score on itself.'] },
  'ENTERPRISE SYSTEMS': { lines: ['Systems of record stay the source of truth.', 'Execution happens where the truth lives.'] },
};

/* ================= Edge meanings (WHY DOES THIS CONNECTION EXIST?) ================= */

export const SIM_EDGE_INFO: Record<string, string> = {
  'SIGNAL>EMPLOYEE': 'A person has to notice first — entry depends on attention.',
  'EMPLOYEE>MANAGER': 'Work requires human routing before the next function can act.',
  'MANAGER>EMPLOYEE': 'Instructions return down the chain before work can move.',
  'MANAGER>SLACK': 'Context is posted where people are — not where work state lives.',
  'SLACK>MEETING': 'Threads that fail to converge escalate to scheduled time.',
  'MEETING>ANALYST': 'Decisions wait for human-assembled evidence.',
  'ANALYST>DIRECTOR': 'Evidence is interpreted by humans before it can count.',
  'DIRECTOR>APPROVAL': 'Sign-off lives in a person, not in the system.',
  'APPROVAL>ACTION': 'Approved intent queues for execution.',
  'CEO>VP': 'Information and authority descend the hierarchy one layer at a time.',
  'VP>DIRECTOR': 'Information and authority descend the hierarchy one layer at a time.',
  'DIRECTOR>MANAGER': 'Escalation climbs the chain one layer at a time.',
  'SIGNAL>CONTEXT ASSEMBLY': 'Every signal starts by collecting current state — automatically.',
  'CONTEXT ASSEMBLY>COMPANY BRAIN': 'Collected context meets institutional memory.',
  'COMPANY BRAIN>AGENTS': 'Agents execute with knowledge and provenance — not prompts.',
  'AGENTS>AUTHORITY GATE': 'Every proposed action meets explicit authority.',
  'AUTHORITY GATE>ENTERPRISE SYSTEMS': 'Granted actions execute in systems of record.',
  'ENTERPRISE SYSTEMS>EVALUATION': 'Outcomes are measured, not assumed.',
  'EVALUATION>COMPANY BRAIN': 'Evaluated experience updates institutional knowledge.',
  'HUMAN AUTHORITY>CONTROL PLANE': 'Humans set policy. The plane encodes and enforces it.',
  'AUTHORITY GATE>HUMANS': 'Risk or ambiguity routes to human judgment.',
  'CONTROL PLANE>WORKFLOWS': 'Decision rights define what each flow may do alone.',
  'WORKFLOWS>AGENTS': 'Flows drive agent execution — state, not status-chasing.',
  'CONTEXT ASSEMBLY>ENTERPRISE SYSTEMS': 'The Brain investigates by querying live systems of record — directly.',
};

/* ================= Company Brain moment ================= */

export const SIM_BRAIN = {
  counters: { known: 31, unknown: 4, stale: 3, disputed: 1, procedures: 12 },
  card: {
    head: 'WHAT WE KNOW',
    known: ['✓ Similar issue observed before', '✓ Resolution procedure exists'],
    changedHead: 'WHAT CHANGED',
    changed: ['? Current environment not verified'],
    nextHead: 'NEXT',
    next: ['→ Investigate live state'],
  },
  investigatePath: ['BRAIN', 'INVESTIGATE', 'ENTERPRISE SYSTEM', 'EVIDENCE', 'BRAIN', 'DECISION'],
} as const;

export const SIM_GATE = {
  head: 'AGENT DECISION',
  rows: [
    { k: 'RISK', v: 'LOW' },
    { k: 'REVERSIBLE', v: 'YES' },
    { k: 'AUTHORITY', v: 'GRANTED' },
  ],
  principle: 'INTELLIGENCE IS NOT AUTHORITY.',
} as const;

export const SIM_LEARN = {
  outcome: 'OUTCOME OBSERVED',
  update: ['NEW KNOWLEDGE +1', 'PROCEDURE CONFIDENCE ↑', 'LEARNING LOOP CLOSED'],
} as const;

/* ================= Layer explorer ================= */

export type LayerKey =
  | 'org-design'
  | 'authority'
  | 'workflows'
  | 'agents'
  | 'model-router'
  | 'company-brain'
  | 'tools'
  | 'evaluation';

export const SIM_LAYERS: { key: LayerKey; label: string; body: string }[] = [
  { key: 'org-design', label: 'ORGANIZATION DESIGN', body: 'Structure is designed around decision rights and flow — not around a reporting chart.' },
  {
    key: 'authority',
    label: 'AUTHORITY',
    body: 'Intelligence is not authority.\n\nAgents can reason broadly.\nExecution rights remain explicit.',
  },
  { key: 'workflows', label: 'WORKFLOWS', body: 'Work follows designed flow with explicit state. Coordination stops being human labor.' },
  { key: 'agents', label: 'AGENTS', body: 'Bounded execution entities: investigate, propose, act — inside limits the control plane defines.' },
  { key: 'model-router', label: 'MODEL ROUTER', body: 'Each task is routed to the right model or tool by capability, cost and risk — a decision the org chart never made.' },
  {
    key: 'company-brain',
    label: 'COMPANY BRAIN',
    body: 'Persistent institutional intelligence.\n\nThe organization knows:\nwhat it knows\nwhy it knows it\nwhat changed\nwhat failed\nwhat worked\nwhat remains unknown',
  },
  { key: 'tools', label: 'TOOLS', body: 'Enterprise systems remain the source of truth. Agents act in them through explicit interfaces.' },
  { key: 'evaluation', label: 'EVALUATION', body: 'Intent is compared to actual outcome. The company measures itself.' },
];

/* ================= View modes / controls ================= */

export const SIM_CONTROLS = {
  send: 'SEND A SIGNAL',
  rebuild: 'REBUILD THIS COMPANY',
  runAgain: 'RUN THE SAME SIGNAL',
  replay: 'REPLAY',
  reset: 'RESET',
  speed1: '1×',
  speed2: '2×',
  showLatency: 'SHOW LATENCY',
  showHuman: 'SHOW HUMAN DEPENDENCY',
  showKnowledge: 'SHOW KNOWLEDGE FLOW',
  compareLeft: 'TRADITIONAL',
  compareRight: 'AI-NATIVE',
  pauseHint: 'Click a node to inspect. Click empty space to resume.',
} as const;

/* ================= Narrative strip slots ================= */

export const SIM_STRIP_SLOTS = {
  entered: 'WHAT ENTERED',
  where: 'WHERE IT IS',
  why: 'WHY IT WAITED',
  who: 'WHO ACTED',
  changed: 'WHAT CHANGED',
  learned: 'WHAT WAS LEARNED',
} as const;

/* ================= Payoff ================= */

export const SIM_PAYOFF = {
  h: 'SAME COMPANY. DIFFERENT OPERATING PHYSICS.',
  sub: 'The model was never the bottleneck. The company was.',
} as const;

export const SIM_LATENCY_DEF = {
  head: 'COMPANY LATENCY',
  body: 'The time between a signal entering the organization and the organization producing the right response — and learning from the outcome.',
} as const;

export const SIM_FINAL_CTA = { label: 'EXPLORE THE ORGANIZATION OS', href: '#operating-model' } as const;
