/**
 * Timeline engine. Elapsed simulation time T (seconds) is the single
 * source of truth. position(T), latency(T), handoffs(T), contextLoss(T),
 * currentNode(T), caption(T) are PURE functions — replay always produces
 * the same result. No timers, no callbacks, no randomness.
 */

import {
  NODE_BY_ID,
  NEW_IDS,
  pointOnEdge,
  type Pt,
} from './model';
import type { SignalKey } from '@/content/simulator';

/* ------------------------------------------------------------------ */
/* OLD FLOW — the latency machine                                      */
/* ------------------------------------------------------------------ */

export type OldHop = {
  to: string;
  travel: number;
  wait: number;
  hours: number;
  handoffs: number;
  loss: number;
  note: string;
};

export const OLD_HOPS: OldHop[] = [
  { to: 'EMPLOYEE', travel: 1.0, wait: 2.2, hours: 3, handoffs: 2, loss: 0, note: 'Sees the problem. Writes it up.' },
  { to: 'MANAGER', travel: 1.0, wait: 2.6, hours: 6, handoffs: 3, loss: 0, note: 'Reviews. Asks for context.' },
  { to: 'SLACK', travel: 1.0, wait: 2.2, hours: 4, handoffs: 4, loss: 3, note: 'Thread. Four people weigh in.' },
  { to: 'MEETING', travel: 1.0, wait: 3.0, hours: 24, handoffs: 2, loss: 0, note: 'Scheduled Thursday. Everyone synchronizes.' },
  { to: 'ANALYST', travel: 1.0, wait: 2.2, hours: 18, handoffs: 2, loss: 0, note: 'Pulls the numbers. Files a new request.' },
  { to: 'DIRECTOR', travel: 1.0, wait: 2.2, hours: 20, handoffs: 2, loss: 0, note: 'Interprets. Re-frames. Schedules review.' },
  { to: 'APPROVAL', travel: 1.0, wait: 3.0, hours: 26, handoffs: 2, loss: 2, note: 'Blocked until the right authority appears.' },
  { to: 'ACTION', travel: 1.2, wait: 0, hours: 0, handoffs: 0, loss: 0, note: 'Executed — 4.2 days later.' },
];

export const OLD_TOTAL_HOURS = OLD_HOPS.reduce((s, h) => s + h.hours, 0); // 101 ≈ 4.2 days
export const OLD_TOTAL_HANDOFFS = OLD_HOPS.reduce((s, h) => s + h.handoffs, 0); // 17
export const OLD_DURATION = OLD_HOPS.reduce((s, h) => s + h.travel + h.wait, 0);

const oldEdge = (from: string, to: string) => EDGE_BOWS[`${from}>${to}`] ?? 0;
const EDGE_BOWS: Record<string, number> = {
  'SIGNAL>EMPLOYEE': 10,
  'EMPLOYEE>MANAGER': 12,
  'MANAGER>SLACK': 12,
  'SLACK>MEETING': 14,
  'MEETING>ANALYST': 14,
  'ANALYST>DIRECTOR': 14,
  'DIRECTOR>APPROVAL': 16,
  'APPROVAL>ACTION': 10,
  // new-flow edges
  'SIGNAL>SLACK': 8,
  'SLACK>MEETING:NEW': -8,
  'MEETING>MANAGER': 6,
  'MANAGER>APPROVAL': 6,
  'APPROVAL>ACTION:NEW': 6,
  'ACTION>ANALYST': 8,
};

export type OldFlowState = {
  phase: 'travel' | 'wait' | 'done';
  hopIndex: number;
  fromNode: string;
  toNode: string;
  pos: Pt;
  latencyHours: number;
  handoffs: number;
  lossBits: number;
  caption: string;
  trail: Pt[];
};

/** Old flow at sim time T (deterministic). */
export function oldFlow(T: number): OldFlowState {
  let t = 0;
  let from = 'SIGNAL';
  const trail: Pt[] = [NODE_BY_ID.SIGNAL.old.pos];
  let hours = 0;
  let handoffs = 0;
  let loss = 0;

  for (let i = 0; i < OLD_HOPS.length; i++) {
    const hop = OLD_HOPS[i];
    const to = NODE_BY_ID[hop.to].old.pos;

    // travel segment
    if (T < t + hop.travel) {
      const k = (T - t) / hop.travel;
      return {
        phase: 'travel',
        hopIndex: i,
        fromNode: from,
        toNode: hop.to,
        pos: pointOnEdge(NODE_BY_ID[from].old.pos, to, oldEdge(from, hop.to), k),
        latencyHours: hours,
        handoffs,
        lossBits: loss,
        caption: `Routing: ${from} → ${hop.to}`,
        trail: [...trail],
      };
    }
    t += hop.travel;
    trail.push(to);
    handoffs += hop.handoffs;

    // wait segment (latency accrues here)
    if (T < t + hop.wait) {
      const k = (T - t) / hop.wait;
      return {
        phase: 'wait',
        hopIndex: i,
        fromNode: from,
        toNode: hop.to,
        pos: to,
        latencyHours: hours + k * hop.hours,
        handoffs,
        lossBits: loss + Math.floor(k * 3.01) * 0, // loss spawns on arrival below
        caption: hop.note,
        trail: [...trail],
      };
    }
    t += hop.wait;
    hours += hop.hours;
    loss += hop.loss;

    from = hop.to;
  }

  return {
    phase: 'done',
    hopIndex: OLD_HOPS.length - 1,
    fromNode: 'APPROVAL',
    toNode: 'ACTION',
    pos: NODE_BY_ID.ACTION.old.pos,
    latencyHours: OLD_TOTAL_HOURS,
    handoffs: OLD_TOTAL_HANDOFFS,
    lossBits: loss,
    caption: 'Executed — 4.2 days later.',
    trail: [...trail, NODE_BY_ID.ACTION.old.pos],
  };
}

/** Context-loss fragments spawn at arrival of hops with loss > 0. */
export function lossBitsUpTo(T: number): { at: Pt; node: string }[] {
  const out: { at: Pt; node: string }[] = [];
  let t = 0;
  for (const hop of OLD_HOPS) {
    t += hop.travel;
    if (T >= t && hop.loss > 0) {
      const p = NODE_BY_ID[hop.to].old.pos;
      for (let i = 0; i < hop.loss; i++) out.push({ at: p, node: hop.to });
    }
    t += hop.wait;
  }
  return out;
}

export function formatLatency(hours: number): string {
  if (hours <= 0.01) return '00:00';
  if (hours < 24) return `+${Math.round(hours)}h`;
  return `+${(hours / 24).toFixed(1)}d`;
}

/* ------------------------------------------------------------------ */
/* TRANSFORM                                                           */
/* ------------------------------------------------------------------ */

export const TRANSFORM_DURATION = 5.2;
export const MORPH_SNAPSHOTS = [0, 0.25, 0.5, 0.75, 1];

export function transformT(T: number): number {
  const k = Math.min(1, Math.max(0, T / TRANSFORM_DURATION));
  return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
}

/* ------------------------------------------------------------------ */
/* NEW FLOW — same signal, different physics                           */
/* ------------------------------------------------------------------ */

export type NewStep =
  | { kind: 'travel'; from: string; to: string; dur: number; caption: string; bowKey?: string }
  | { kind: 'wait'; node: string; dur: number; caption: string }
  | { kind: 'brain'; dur: number; caption: string }
  | { kind: 'investigate'; dur: number; caption: string }
  | { kind: 'gate'; dur: number; caption: string }
  | { kind: 'gate-open'; dur: number; caption: string };

export const NEW_STEPS: NewStep[] = [
  { kind: 'travel', from: NEW_IDS.signal, to: NEW_IDS.context, dur: 0.8, caption: 'Signal enters the system.' },
  { kind: 'wait', node: NEW_IDS.context, dur: 1.1, caption: 'CONTEXT ASSEMBLY — collecting relevant current state.' },
  { kind: 'travel', from: NEW_IDS.context, to: NEW_IDS.brain, dur: 0.8, caption: 'Context meets institutional memory.' },
  { kind: 'brain', dur: 1.6, caption: 'COMPANY BRAIN — similar issue observed. Procedure exists.' },
  { kind: 'investigate', dur: 1.8, caption: 'Memory ≠ present reality. Verifying live state.' },
  { kind: 'wait', node: NEW_IDS.brain, dur: 0.6, caption: 'Evidence → decision.' },
  { kind: 'travel', from: NEW_IDS.brain, to: NEW_IDS.agents, dur: 0.7, caption: 'Agent takes bounded execution.' },
  { kind: 'wait', node: NEW_IDS.agents, dur: 1.0, caption: 'AGENT — analyzes, investigates, proposes.' },
  { kind: 'travel', from: NEW_IDS.agents, to: NEW_IDS.gate, dur: 0.6, caption: 'Every proposal meets explicit authority.' },
  { kind: 'gate', dur: 1.4, caption: 'AUTHORITY GATE — risk, permission, reversibility.' },
  { kind: 'gate-open', dur: 0.3, caption: 'AUTHORITY GRANTED — the gate opens.' },
  { kind: 'travel', from: NEW_IDS.gate, to: NEW_IDS.systems, dur: 0.6, caption: 'Executing in systems of record.' },
  { kind: 'wait', node: NEW_IDS.systems, dur: 0.8, caption: 'ACTION — executed where the truth lives.' },
  { kind: 'travel', from: NEW_IDS.systems, to: NEW_IDS.evaluation, dur: 0.7, caption: 'OUTCOME OBSERVED.' },
  { kind: 'wait', node: NEW_IDS.evaluation, dur: 0.8, caption: 'EVALUATION — outcome measured against intent.' },
  { kind: 'travel', from: NEW_IDS.evaluation, to: NEW_IDS.brain, dur: 1.1, caption: 'Experience returns to the Brain.' },
];

export const NEW_RUN_DURATION = NEW_STEPS.reduce((s, st) => s + st.dur, 0);
export const NEW_TOTAL_MINUTES = 12; // conceptual

const newStepStarts: number[] = (() => {
  const arr: number[] = [];
  let t = 0;
  for (const st of NEW_STEPS) {
    arr.push(t);
    t += st.dur;
  }
  return arr;
})();

export type NewFlowState = {
  stepIndex: number;
  step: NewStep;
  stepK: number;
  pos: Pt;
  latencyMin: number;
  caption: string;
  /** investigate sub-phase position k ∈ [0,1] out-and-back */
  investigateK: number | null;
  gateK: number | null;
  fromNode: string;
  toNode: string;
};

function travelKey(from: string, to: string): number {
  if (from === NEW_IDS.signal && to === NEW_IDS.context) return 8;
  if (from === NEW_IDS.context && to === NEW_IDS.brain) return -8;
  if (from === NEW_IDS.brain && to === NEW_IDS.agents) return 6;
  if (from === NEW_IDS.agents && to === NEW_IDS.gate) return 6;
  if (from === NEW_IDS.gate && to === NEW_IDS.systems) return 6;
  if (from === NEW_IDS.systems && to === NEW_IDS.evaluation) return 8;
  if (from === NEW_IDS.evaluation && to === NEW_IDS.brain) return -18;
  return 0;
}

/** New flow at sim time T (deterministic). All nodes at their t=1 positions. */
export function newFlow(T: number): NewFlowState {
  let idx = NEW_STEPS.length - 1;
  for (let i = 0; i < NEW_STEPS.length; i++) {
    const start = newStepStarts[i];
    const end = start + NEW_STEPS[i].dur;
    if (T < end) {
      idx = i;
      break;
    }
  }
  const step = NEW_STEPS[idx];
  const k = Math.min(1, (T - newStepStarts[idx]) / step.dur);
  const progress = Math.min(1, T / NEW_RUN_DURATION);

  let pos: Pt = { x: 0, y: 0 };
  let fromNode = '';
  let toNode = '';

  if (step.kind === 'travel') {
    fromNode = step.from;
    toNode = step.to;
    pos = pointOnEdge(NODE_BY_ID[step.from].new.pos, NODE_BY_ID[step.to].new.pos, travelKey(step.from, step.to), k);
  } else if (step.kind === 'wait') {
    fromNode = toNode = step.node;
    pos = NODE_BY_ID[step.node].new.pos;
  } else if (step.kind === 'brain') {
    fromNode = toNode = NEW_IDS.brain;
    pos = NODE_BY_ID[NEW_IDS.brain].new.pos;
  } else if (step.kind === 'investigate') {
    fromNode = toNode = NEW_IDS.brain;
    // out to systems and back: k ∈ [0, 0.5) out, [0.5, 1] back
    const outK = k < 0.5 ? k * 2 : (1 - k) * 2;
    pos = pointOnEdge(NODE_BY_ID[NEW_IDS.brain].new.pos, NODE_BY_ID[NEW_IDS.systems].new.pos, -20, outK);
  } else {
    fromNode = toNode = NEW_IDS.gate;
    pos = NODE_BY_ID[NEW_IDS.gate].new.pos;
  }

  return {
    stepIndex: idx,
    step,
    stepK: k,
    pos,
    latencyMin: Math.round(progress * NEW_TOTAL_MINUTES),
    caption: step.caption,
    investigateK: step.kind === 'investigate' ? k : null,
    gateK: step.kind === 'gate' || step.kind === 'gate-open' ? k : null,
    fromNode,
    toNode,
  };
}

/* ------------------------------------------------------------------ */
/* LEARNING                                                            */
/* ------------------------------------------------------------------ */

export const LEARN_DURATION = 2.6;

export type LearnState = {
  knownAdded: boolean;
  unknownReduced: boolean;
  showBadges: boolean;
  loopClosed: boolean;
  returnK: number;
};

export function learnState(T: number): LearnState {
  const k = Math.min(1, T / LEARN_DURATION);
  return {
    knownAdded: k > 0.25,
    unknownReduced: k > 0.4,
    showBadges: k > 0.5,
    loopClosed: k > 0.8,
    returnK: Math.min(1, k / 0.3),
  };
}

/* ------------------------------------------------------------------ */
/* Signal selection (same engine for all signals — captions differ)     */
/* ------------------------------------------------------------------ */

export function signalEntryNote(key: SignalKey): string {
  switch (key) {
    case 'customer-issue':
      return 'A customer reports a repeating failure in checkout.';
    case 'product-signal':
      return 'Usage telemetry shows a drop in activation.';
    case 'production-incident':
      return 'Latency alarms fire on the payments path.';
    case 'revenue-drop':
      return 'Weekly revenue misses forecast in one region.';
  }
}
