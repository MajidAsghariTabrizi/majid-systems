/**
 * ONE continuous organization model. A single morph parameter t ∈ [0,1]
 * moves every node/edge from the traditional company (t=0) to the
 * AI-native company (t=1). The same t drives:
 *   - the automatic REBUILD animation,
 *   - scroll-driven transformation,
 *   - the manual comparison slider.
 *
 * Pure data + pure functions. No React, no DOM.
 */

import type { SignalKey } from '@/content/simulator';
import { SIM_EDGE_INFO } from '@/content/simulator';

export const VIEW_W = 1000;
export const VIEW_H = 620;

export type Pt = { x: number; y: number };

export type NodeKind =
  | 'signal'
  | 'human'
  | 'system'
  | 'infra'
  | 'ambient'
  | 'brain'
  | 'gate'
  | 'agent'
  | 'enterprise';

/**
 * kind: visual family (styling only).
 * human: participates in human routing (for the human-dependency overlay).
 * morphStagger ∈ [0, 0.25]: per-node delay of the restructuring.
 * ambient nodes have weight 0 at t=1 (they collapse early).
 */
export type SimNode = {
  id: string;
  old: { pos: Pt; label: string; role: string };
  new: { pos: Pt; label: string; role: string };
  kind: NodeKind;
  human: boolean;
  ambient?: boolean;
  stagger: number;
  /** Which new-architecture layers this node belongs to (explorer). */
  layers: string[];
};

export type EdgeKind = 'hierarchy' | 'flow' | 'ambient' | 'new' | 'return';

export type SimEdge = {
  id: string;
  from: string;
  to: string;
  kind: EdgeKind;
  oldWeight: number;
  newWeight: number;
  oldMeaning: string;
  newMeaning: string;
  /** requires a human to route/synchronize/approve/translate (overlay) */
  humanDependency: boolean;
  /** part of the knowledge path (overlay) */
  knowledge?: boolean;
  bow: number;
};

/* ------------------------------------------------------------------ */
/* Nodes — traditional (t=0) → AI-native (t=1)                        */
/* ------------------------------------------------------------------ */

export const NODES: SimNode[] = [
  {
    id: 'SIGNAL',
    old: { pos: { x: 95, y: 430 }, label: 'SIGNAL', role: 'entry' },
    new: { pos: { x: 72, y: 300 }, label: 'SIGNAL', role: 'entry' },
    kind: 'signal',
    human: false,
    stagger: 0.08,
    layers: [],
  },
  {
    id: 'CEO',
    old: { pos: { x: 430, y: 62 }, label: 'CEO', role: 'command' },
    new: { pos: { x: 500, y: 62 }, label: 'HUMAN AUTHORITY', role: 'policy · risk · judgment' },
    kind: 'human',
    human: true,
    stagger: 0.0,
    layers: ['org-design', 'authority'],
  },
  {
    id: 'VP',
    old: { pos: { x: 430, y: 152 }, label: 'VP', role: 'coordination' },
    new: { pos: { x: 500, y: 165 }, label: 'CONTROL PLANE', role: 'decision rights · escalation' },
    kind: 'system',
    human: false,
    stagger: 0.05,
    layers: ['org-design', 'model-router'],
  },
  {
    id: 'DIRECTOR',
    old: { pos: { x: 430, y: 242 }, label: 'DIRECTOR', role: 'interpretation' },
    new: { pos: { x: 250, y: 240 }, label: 'WORKFLOWS', role: 'designed flow · state' },
    kind: 'system',
    human: true,
    stagger: 0.1,
    layers: ['org-design', 'workflows', 'model-router'],
  },
  {
    id: 'ANALYST',
    old: { pos: { x: 770, y: 242 }, label: 'ANALYST', role: 'human retrieval' },
    new: { pos: { x: 815, y: 400 }, label: 'EVALUATION', role: 'outcome vs intent' },
    kind: 'human',
    human: true,
    stagger: 0.14,
    layers: ['evaluation'],
  },
  {
    id: 'MANAGER',
    old: { pos: { x: 430, y: 345 }, label: 'MANAGER', role: 'routing' },
    new: { pos: { x: 320, y: 475 }, label: 'AGENTS', role: 'bounded execution' },
    kind: 'agent',
    human: false,
    stagger: 0.15,
    layers: ['agents', 'model-router', 'workflows'],
  },
  {
    id: 'SLACK',
    old: { pos: { x: 770, y: 345 }, label: 'SLACK', role: 'channel' },
    new: { pos: { x: 235, y: 372 }, label: 'CONTEXT ASSEMBLY', role: 'state collector' },
    kind: 'infra',
    human: false,
    stagger: 0.12,
    layers: ['tools', 'company-brain'],
  },
  {
    id: 'BACKLOG',
    old: { pos: { x: 215, y: 345 }, label: 'BACKLOG', role: 'queue' },
    new: { pos: { x: 215, y: 345 }, label: 'BACKLOG', role: 'queue' },
    kind: 'ambient',
    human: false,
    ambient: true,
    stagger: 0.0,
    layers: [],
  },
  {
    id: 'EMPLOYEE',
    old: { pos: { x: 430, y: 448 }, label: 'EMPLOYEE', role: 'does the work' },
    new: { pos: { x: 560, y: 478 }, label: 'HUMANS', role: 'judgment · ownership · exceptions' },
    kind: 'human',
    human: true,
    stagger: 0.2,
    layers: ['org-design', 'authority'],
  },
  {
    id: 'MEETING',
    old: { pos: { x: 770, y: 448 }, label: 'MEETING', role: 'synchronization' },
    new: { pos: { x: 500, y: 300 }, label: 'COMPANY BRAIN', role: 'shared knowledge state' },
    kind: 'brain',
    human: false,
    stagger: 0.18,
    layers: ['company-brain'],
  },
  {
    id: 'DASHBOARD',
    old: { pos: { x: 215, y: 448 }, label: 'DASHBOARD', role: 'reporting' },
    new: { pos: { x: 215, y: 448 }, label: 'DASHBOARD', role: 'reporting' },
    kind: 'ambient',
    human: false,
    ambient: true,
    stagger: 0.0,
    layers: [],
  },
  {
    id: 'APPROVAL',
    old: { pos: { x: 430, y: 548 }, label: 'APPROVAL', role: 'sign-off' },
    new: { pos: { x: 655, y: 300 }, label: 'AUTHORITY GATE', role: 'risk · permission · reversibility' },
    kind: 'gate',
    human: false,
    stagger: 0.22,
    layers: ['authority'],
  },
  {
    id: 'ACTION',
    old: { pos: { x: 700, y: 552 }, label: 'ACTION', role: 'execution' },
    new: { pos: { x: 780, y: 500 }, label: 'ENTERPRISE SYSTEMS', role: 'systems of record' },
    kind: 'enterprise',
    human: false,
    stagger: 0.24,
    layers: ['tools'],
  },
];

export const NODE_BY_ID: Record<string, SimNode> = Object.fromEntries(NODES.map((n) => [n.id, n]));

/** Morph ids used by the flow logic (new labels of morphed nodes). */
export const NEW_IDS = {
  signal: 'SIGNAL',
  context: 'SLACK',
  brain: 'MEETING',
  agents: 'MANAGER',
  gate: 'APPROVAL',
  systems: 'ACTION',
  evaluation: 'ANALYST',
  authority: 'CEO',
  control: 'VP',
  workflows: 'DIRECTOR',
  humans: 'EMPLOYEE',
} as const;

/* ------------------------------------------------------------------ */
/* Edges                                                              */
/* ------------------------------------------------------------------ */

const E = (
  from: string,
  to: string,
  kind: EdgeKind,
  oldWeight: number,
  newWeight: number,
  oldMeaning: string,
  newMeaning: string,
  humanDependency: boolean,
  bow = 0,
  knowledge = false,
): SimEdge => ({
  // new-architecture edges are namespaced so they never collide with
  // old edges that connect the same node pair (e.g. SLACK>MEETING).
  id: `${kind === 'new' || kind === 'return' ? 'N:' : ''}${from}>${to}`,
  from,
  to,
  kind,
  oldWeight,
  newWeight,
  oldMeaning,
  newMeaning,
  humanDependency,
  knowledge,
  bow,
});

export const EDGES: SimEdge[] = [
  /* hierarchy — old backbone, collapses first */
  E('CEO', 'VP', 'hierarchy', 1, 0, 'Authority descends one layer at a time.', 'Policy is encoded once, enforced everywhere.', true, -12),
  E('VP', 'DIRECTOR', 'hierarchy', 1, 0, 'Authority descends one layer at a time.', 'Decision rights are explicit and machine-readable.', true, -12),
  E('DIRECTOR', 'MANAGER', 'hierarchy', 1, 0, 'Escalation climbs the chain, one layer at a time.', 'Flow replaces escalation.', true, -12),
  E('MANAGER', 'EMPLOYEE', 'hierarchy', 1, 0, 'Instructions return down the chain before work can move.', 'Work arrives with state, not instructions.', true, -14),

  /* old signal path — the latency machine */
  E('SIGNAL', 'EMPLOYEE', 'flow', 1, 0, 'A person notices first.', 'The system notices first.', true, 10),
  E('EMPLOYEE', 'MANAGER', 'flow', 1, 0, 'Work requires human routing before the next function can act.', 'Context assembles itself.', true, 12),
  E('MANAGER', 'SLACK', 'flow', 1, 0, 'Context is posted where people are — not where work state lives.', 'Context lives in assembled state.', true, 12),
  E('SLACK', 'MEETING', 'flow', 1, 0, 'Threads that fail to converge escalate to scheduled time.', 'Convergence is a workflow, not a calendar.', true, 14),
  E('MEETING', 'ANALYST', 'flow', 1, 0, 'Decisions wait for human-assembled evidence.', 'Evidence is queried from systems.', true, 14),
  E('ANALYST', 'DIRECTOR', 'flow', 1, 0, 'Evidence is interpreted by humans before it can count.', 'Interpretation carries provenance.', true, 14),
  E('DIRECTOR', 'APPROVAL', 'flow', 1, 0, 'Sign-off lives in a person, not in the system.', 'Sign-off lives in a gate with explicit rights.', true, 16),
  E('APPROVAL', 'ACTION', 'flow', 1, 0, 'Approved intent queues for execution.', 'Granted actions execute immediately.', true, 10),

  /* ambient */
  E('MANAGER', 'BACKLOG', 'ambient', 1, 0, 'Work waits in queues nobody owns end-to-end.', 'Queues become flow state.', false, -10),
  E('ANALYST', 'DASHBOARD', 'ambient', 1, 0, 'Yesterday’s state, refreshed weekly.', 'Live state is queried on demand.', false, -10),

  /* new architecture — emerges late */
  E('SIGNAL', 'SLACK', 'new', 0, 1, '', 'Every signal starts by collecting current state — automatically.', false, 8, true),
  E('SLACK', 'MEETING', 'new', 0, 1, '', 'Collected context meets institutional memory.', false, -8, true),
  E('MEETING', 'MANAGER', 'new', 0, 1, '', 'Agents execute with knowledge and provenance — not prompts.', false, 6, true),
  E('MANAGER', 'APPROVAL', 'new', 0, 1, '', 'Every proposed action meets explicit authority.', false, 6, true),
  E('APPROVAL', 'ACTION', 'new', 0, 1, '', 'Granted actions execute in systems of record.', false, 6),
  E('ACTION', 'ANALYST', 'new', 0, 1, '', 'Outcomes are measured, not assumed.', false, 8, true),
  E('ANALYST', 'MEETING', 'return', 0, 1, '', 'Evaluated experience updates institutional knowledge.', false, -18, true),
  E('CEO', 'VP', 'new', 0, 1, '', 'Humans set policy. The plane encodes and enforces it.', true, 12),
  E('VP', 'DIRECTOR', 'new', 0, 1, '', 'Decision rights define what each flow may do alone.', false, -8),
  E('DIRECTOR', 'MANAGER', 'new', 0, 1, '', 'Flows drive agent execution — state, not status-chasing.', false, 8),
  E('APPROVAL', 'EMPLOYEE', 'new', 0, 1, '', 'Risk or ambiguity routes to human judgment.', true, -10),
  E('SLACK', 'ACTION', 'new', 0, 1, '', 'Investigation reads live state from systems of record.', false, -16, true),
];

export const EDGE_BY_ID: Record<string, SimEdge> = Object.fromEntries(EDGES.map((e) => [e.id, e]));

/** Human explanation for an edge — old edges by node ids, new edges by new labels. */
export function edgeInfoText(e: SimEdge): string {
  if (e.oldWeight === 0 && e.newWeight === 1) {
    const key = `${NODE_BY_ID[e.from].new.label}>${NODE_BY_ID[e.to].new.label}`;
    return SIM_EDGE_INFO[key] ?? e.newMeaning ?? 'Structural connection of the current organization design.';
  }
  return SIM_EDGE_INFO[e.id] ?? e.oldMeaning;
}

/* ------------------------------------------------------------------ */
/* Morph math — pure                                                  */
/* ------------------------------------------------------------------ */

export const easeInOutCubic = (x: number): number =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

export const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x);

const STAGGER_WINDOW = 0.78; // node motion spans [stagger, stagger + 0.78]

/** Per-node morph progress in [0,1] for global morph t. */
export function nodeT(n: SimNode, t: number): number {
  return easeInOutCubic(clamp01((t - n.stagger) / STAGGER_WINDOW));
}

/** Ambient nodes exit early: weight 1 → 0 over t ∈ [0.15, 0.4]. */
export function ambientWeight(t: number): number {
  return 1 - clamp01((t - 0.15) / 0.25);
}

export function lerp(a: number, b: number, k: number): number {
  return a + (b - a) * k;
}

export function lerpPt(a: Pt, b: Pt, k: number): Pt {
  return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) };
}

/** Node position at morph t. */
export function nodePos(n: SimNode, t: number): Pt {
  return lerpPt(n.old.pos, n.new.pos, nodeT(n, t));
}

/** Node label/role crossfade: labels transition after movement begins. */
export function nodeLabelT(n: SimNode, t: number): number {
  return clamp01((nodeT(n, t) - 0.35) / 0.3);
}

/** Edge opacity weight at morph t. Old edges collapse early; new emerge late. */
export function edgeWeight(e: SimEdge, t: number): number {
  if (e.kind === 'hierarchy' || e.kind === 'ambient') {
    // coordination edges shrink/fade first
    return e.oldWeight * (1 - clamp01((t - 0.05) / 0.3));
  }
  if (e.kind === 'flow') {
    // human routing collapses toward origin as restructuring proceeds
    return e.oldWeight * (1 - clamp01((t - 0.25) / 0.3));
  }
  // new edges emerge late — draw outward, never crossfade
  return e.newWeight * clamp01((t - 0.55) / 0.35);
}

/** Quadratic path between two points with a perpendicular bow. */
export function edgePath(a: Pt, b: Pt, bow: number): string {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const cx = mx - (dy / len) * bow;
  const cy = my + (dx / len) * bow;
  return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}

/** Point at fraction k along the bowed edge (quadratic bezier). */
export function pointOnEdge(a: Pt, b: Pt, bow: number, k: number): Pt {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const cx = (a.x + b.x) / 2 - (dy / len) * bow;
  const cy = (a.y + b.y) / 2 + (dx / len) * bow;
  const u = 1 - k;
  return {
    x: u * u * a.x + 2 * u * k * cx + k * k * b.x,
    y: u * u * a.y + 2 * u * k * cy + k * k * b.y,
  };
}

/**
 * Where an old-flow edge endpoint sits at morph t: old edges collapse
 * toward their ORIGIN as t grows (the endpoint is pulled back into the
 * source node), so routing visibly retracts instead of dissolving.
 */
export function oldEdgeEndPoint(e: SimEdge, t: number): Pt {
  const a = nodePos(NODE_BY_ID[e.from], t);
  const b = nodePos(NODE_BY_ID[e.to], t);
  const collapse = clamp01((t - 0.25) / 0.3);
  return lerpPt(b, a, collapse * 0.85);
}

/* ------------------------------------------------------------------ */
/* Signals                                                            */
/* ------------------------------------------------------------------ */

export type SignalDef = { key: SignalKey; label: string; note: string };

export const SIGNAL_DEFS: SignalDef[] = [
  { key: 'customer-issue', label: 'CUSTOMER ISSUE', note: 'A customer reports a repeating failure in checkout.' },
  { key: 'product-signal', label: 'PRODUCT SIGNAL', note: 'Usage telemetry shows a drop in activation.' },
  { key: 'production-incident', label: 'PRODUCTION INCIDENT', note: 'Latency alarms fire on the payments path.' },
  { key: 'revenue-drop', label: 'REVENUE DROP', note: 'Weekly revenue misses forecast in one region.' },
];
