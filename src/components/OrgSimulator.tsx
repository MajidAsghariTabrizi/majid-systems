'use client';

/**
 * Quantiviq hero — the interactive organization simulator.
 *
 * Architecture:
 *  - ONE state machine (src/lib/sim/machine.ts) powers buttons, scroll,
 *    replay, reduced-motion and comparison. React renders only on
 *    discrete state changes.
 *  - ONE rAF loop advances a local clock and paints SVG/DOM through
 *    refs — no per-frame React renders. It dispatches PHASE_END exactly
 *    once when a boundary is crossed.
 *  - ONE continuous organization model (src/lib/sim/model.ts): a single
 *    morph parameter t drives the rebuild animation, the scroll
 *    transformation and the manual comparison slider.
 */

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';

import {
  EDGES,
  EDGE_BY_ID,
  NODES,
  NODE_BY_ID,
  NEW_IDS,
  VIEW_H,
  VIEW_W,
  ambientWeight,
  clamp01,
  edgeInfoText,
  edgePath,
  edgeWeight,
  nodeLabelT,
  nodePos,
  nodeT,
  oldEdgeEndPoint,
  pointOnEdge,
  type SimNode,
} from '@/lib/sim/model';
import {
  LEARN_DURATION,
  NEW_RUN_DURATION,
  NEW_STEPS,
  OLD_DURATION,
  OLD_HOPS,
  TRANSFORM_DURATION,
  formatLatency,
  learnState,
  newFlow,
  oldFlow,
  signalEntryNote,
  transformT,
} from '@/lib/sim/timeline';
import {
  initialMachine,
  machine,
  phaseDuration,
  type MachineState,
} from '@/lib/sim/machine';
import {
  MOTION_SEMANTICS,
  SIM_BRAIN,
  SIM_CONTROLS,
  SIM_DISCLOSURE,
  SIM_GATE,
  SIM_LAYERS,
  SIM_LEARN,
  SIM_METRIC_LABELS,
  SIM_NEW_METRICS,
  SIM_NODE_INFO,
  SIM_OLD_METRICS,
  SIM_PAYOFF,
  SIM_SIGNALS,
  SIM_STRIP_SLOTS,
  SIM_TOTAL_OLD,
  SIM_TAG,
  type LayerKey,
} from '@/content/simulator';

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

const NODE_SIZE: Record<string, [number, number]> = {
  default: [112, 34],
  MEETING: [160, 58], // COMPANY BRAIN — structured institutional state
  APPROVAL: [132, 42], // AUTHORITY GATE
  CEO: [126, 38],
  ambient: [86, 24],
};

function nodeSize(n: SimNode): [number, number] {
  if (n.ambient) return NODE_SIZE.ambient;
  return NODE_SIZE[n.id] ?? NODE_SIZE.default;
}

const snap = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** deterministic context-loss fragment offsets (golden angle) */
const GOLDEN = 2.39996;
function fragOffset(i: number): { dx: number; dy: number } {
  const a = i * GOLDEN + 0.7;
  const r = 22 + (i % 3) * 8;
  return { dx: Math.cos(a) * r, dy: Math.sin(a) * r };
}

const setTxt = (el: Element | null | undefined, v: string, cache: Map<string, string>, key: string) => {
  if (!el) return;
  if (cache.get(key) === v) return;
  el.textContent = v;
  cache.set(key, v);
};

const whoActs = (stepKind: string, k = 0): string => {
  switch (stepKind) {
    case 'CONTEXT':
      return 'SYSTEM — assembly';
    case 'AGENT':
      return 'AGENT — bounded';
    case 'GATE':
      return k > 0.8 ? 'HUMAN — granted' : 'HUMAN — decides';
    case 'ACTION':
      return 'AGENT — executes';
    case 'EVAL':
      return 'SYSTEM — measures';
    case 'LEARN':
      return 'COMPANY — learns';
    case 'BRAIN':
      return 'BRAIN — retrieves';
    case 'INVESTIGATE':
      return 'SYSTEM — verifies';
    default:
      return 'SYSTEM';
  }
};

/** reduced-motion checkpoint times for the transform phase */
const MORPH_TIMES = [0.2, 0.4, 0.6, 0.8, 1].map((k) => k * TRANSFORM_DURATION * 0.999);

function lossCount(T: number): number {
  let t = 0;
  let c = 0;
  for (const h of OLD_HOPS) {
    t += h.travel;
    if (T >= t) c += h.loss;
    t += h.wait;
  }
  return Math.min(5, c);
}

function fragMeta(i: number): { x: number; y: number; dx: number; dy: number; t0: number } {
  const slack = NODE_BY_ID.SLACK.old.pos;
  const approval = NODE_BY_ID.APPROVAL.old.pos;
  let t = 0;
  let slackT = 0;
  let apprT = 0;
  for (const h of OLD_HOPS) {
    t += h.travel;
    if (h.to === 'SLACK') slackT = t;
    if (h.to === 'APPROVAL') apprT = t;
    t += h.wait;
  }
  const isSlack = i < 3;
  const at = isSlack ? slack : approval;
  const t0 = isSlack ? slackT : apprT;
  const off = fragOffset(i);
  return { x: at.x, y: at.y + 12, dx: off.dx, dy: off.dy + 12, t0 };
}

function meetingWaitK(T: number): number {
  const f = oldFlow(T);
  if (f.phase !== 'wait' || f.toNode !== 'MEETING') return 1;
  let t = 0;
  for (const h of OLD_HOPS) {
    t += h.travel;
    if (h.to === 'MEETING') break;
    t += h.wait;
  }
  return clamp01((T - t) / 3.0);
}

const VISIT_ORDER = ['SIGNAL', ...OLD_HOPS.map((h) => h.to)];

/* ================================================================== */
/* Section                                                             */
/* ================================================================== */

export function OrgSimulatorSection() {
  const [state, dispatch] = useReducer(machine, initialMachine);
  const [isMobile, setIsMobile] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [edgeTip, setEdgeTip] = useState<{ id: string; x: number; y: number } | null>(null);

  const stateRef = useRef(state);
  stateRef.current = state;
  const tRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastTsRef = useRef<number | null>(null);
  const endSentRef = useRef(false);
  const stepAccRef = useRef(0);
  const paintCache = useRef(new Map<string, string>());
  const frameRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLElement | null>(null);
  const inViewRef = useRef(true);
  const hiddenRef = useRef(false);
  const mobileRef = useRef(false);
  const reducedRef = useRef(false);
  mobileRef.current = isMobile;
  reducedRef.current = reduced;

  const nodeRefs = useRef<Record<string, SVGGElement | null>>({});
  const labelOldRefs = useRef<Record<string, SVGTextElement | null>>({});
  const labelNewRefs = useRef<Record<string, SVGTextElement | null>>({});
  const roleOldRefs = useRef<Record<string, SVGTextElement | null>>({});
  const roleNewRefs = useRef<Record<string, SVGTextElement | null>>({});
  const brainGroupRef = useRef<SVGGElement | null>(null);
  const edgeRefs = useRef<Record<string, SVGPathElement | null>>({});
  const signalRef = useRef<SVGGElement | null>(null);
  const trailRef = useRef<SVGPolylineElement | null>(null);
  const fragRefs = useRef<(SVGRectElement | null)[]>([]);
  const ghostRefs = useRef<(SVGCircleElement | null)[]>([]);
  const latencyRef = useRef<HTMLSpanElement | null>(null);
  const handoffRef = useRef<HTMLSpanElement | null>(null);
  const lossRef = useRef<HTMLSpanElement | null>(null);
  const stripRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const brainCountRefs = useRef<Record<string, SVGTSpanElement | null>>({});
  const brainCardRef = useRef<HTMLDivElement | null>(null);
  const gateCardRef = useRef<HTMLDivElement | null>(null);
  const learnBadgeRef = useRef<HTMLDivElement | null>(null);
  const mStepRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  /* ---------------- paint: refs only, cached writes ---------------- */

  const paint = useCallback((st: MachineState, T: number) => {
    const cache = paintCache.current;
    const morph = st.phase === 'TRANSFORMING' ? transformT(T) : st.morphT;
    const era = morph > 0.5 ? 'new' : 'old';
    if (frameRef.current) frameRef.current.dataset.era = era;

    /* ---- nodes ---- */
    for (const n of NODES) {
      const g = nodeRefs.current[n.id];
      if (!g) continue;
      const nt = nodeT(n, morph);
      const p = nodePos(n, morph);
      const brainGrow = n.id === NEW_IDS.brain ? 0.85 + 0.3 * clamp01((morph - 0.5) / 0.35) : 1;
      const ambientK = n.ambient ? 0.45 + 0.55 * ambientWeight(morph) : 1;
      const scale = (0.88 + 0.12 * nt) * ambientK * brainGrow;
      g.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${scale.toFixed(3)})`);
      let o = n.ambient ? 0.3 + 0.55 * ambientWeight(morph) : 0.55 + 0.45 * nt;
      if (st.layer && !n.layers.includes(st.layer)) o *= 0.22;
      if (n.id === st.selectedNode) o = 1;
      g.style.opacity = o.toFixed(3);
      const lt = nodeLabelT(n, morph);
      const lo = labelOldRefs.current[n.id];
      const ln = labelNewRefs.current[n.id];
      const ro = roleOldRefs.current[n.id];
      const rn = roleNewRefs.current[n.id];
      if (lo) lo.style.opacity = (1 - lt).toFixed(2);
      if (ln) ln.style.opacity = lt.toFixed(2);
      if (ro) ro.style.opacity = (1 - lt).toFixed(2);
      if (rn) rn.style.opacity = lt.toFixed(2);
    }
    if (brainGroupRef.current) {
      brainGroupRef.current.style.opacity = clamp01((morph - 0.72) / 0.2).toFixed(2);
    }

    /* ---- flow derivation ---- */
    let hotEdgeId: string | null = null;
    let activeNodeId: string | null = null;
    let whereTxt = '';
    let whyTxt = '';
    let whoTxt = '—';
    let changedTxt = '';
    let learnedTxt = '—';
    let latencyTxt: string = era === 'new' ? SIM_NEW_METRICS.latency : SIM_OLD_METRICS.latency;
    let handoffTxt: string = era === 'new' ? SIM_NEW_METRICS.handoffs : SIM_OLD_METRICS.handoffs;
    let lossTxt = '0';

    if (st.phase === 'SIGNAL_OLD' || st.phase === 'OLD_COMPLETE') {
      const f = oldFlow(st.phase === 'OLD_COMPLETE' ? OLD_DURATION : T);
      activeNodeId = f.toNode;
      latencyTxt = st.phase === 'OLD_COMPLETE' ? SIM_TOTAL_OLD : formatLatency(f.latencyHours);
      handoffTxt = String(f.handoffs);
      lossTxt = String(f.lossBits);
      hotEdgeId = `${f.fromNode}>${f.toNode}`;
      whereTxt = NODE_BY_ID[f.toNode].old.label;
      whoTxt = 'HUMANS — routing';
      const to = f.toNode;
      if (f.phase === 'wait') {
        whyTxt =
          to === 'SLACK' ? MOTION_SEMANTICS.CONTEXT_LOSS
          : to === 'MEETING' ? MOTION_SEMANTICS.MEETING
          : to === 'APPROVAL' ? MOTION_SEMANTICS.APPROVAL
          : MOTION_SEMANTICS.WAITING;
        const hop = OLD_HOPS[f.hopIndex];
        changedTxt = hop && hop.hours > 0 ? `+${hop.hours}h` : '';
      } else {
        whyTxt = MOTION_SEMANTICS.TRAVEL;
      }
    } else if (st.phase === 'SIGNAL_NEW' || st.phase === 'LEARNING') {
      const f = newFlow(st.phase === 'LEARNING' ? NEW_RUN_DURATION : T);
      activeNodeId = f.toNode;
      latencyTxt = st.phase === 'LEARNING' ? SIM_NEW_METRICS.latency : `~${f.latencyMin} MIN`;
      handoffTxt = SIM_NEW_METRICS.handoffs;
      lossTxt = '0';
      whereTxt = NODE_BY_ID[f.toNode]?.new.label ?? '';
      const step = f.step;
      if (step.kind === 'wait') {
        const lbl = NODE_BY_ID[step.node].new.label;
        whoTxt =
          lbl === 'CONTEXT ASSEMBLY' ? whoActs('CONTEXT')
          : lbl === 'AGENTS' ? whoActs('AGENT')
          : lbl === 'ENTERPRISE SYSTEMS' ? whoActs('ACTION')
          : lbl === 'EVALUATION' ? whoActs('EVAL')
          : whoActs('BRAIN');
        whyTxt =
          lbl === 'AGENTS' ? MOTION_SEMANTICS.EXECUTION
          : lbl === 'COMPANY BRAIN' ? MOTION_SEMANTICS.RETRIEVAL
          : lbl === 'EVALUATION' ? MOTION_SEMANTICS.OUTCOME
          : MOTION_SEMANTICS.TRAVEL;
      } else if (step.kind === 'brain') {
        whoTxt = whoActs('BRAIN');
        whyTxt = MOTION_SEMANTICS.RETRIEVAL;
      } else if (step.kind === 'investigate') {
        whoTxt = whoActs('INVESTIGATE');
        whyTxt = MOTION_SEMANTICS.INVESTIGATION;
      } else if (step.kind === 'gate') {
        whoTxt = whoActs('GATE', f.gateK ?? 0);
        whyTxt = MOTION_SEMANTICS.AUTHORITY;
      } else if (step.kind === 'gate-open') {
        whoTxt = whoActs('GATE', 1);
        whyTxt = MOTION_SEMANTICS.AUTHORITY;
        changedTxt = 'GATE OPEN';
      } else {
        whoTxt = whoActs('SYSTEM');
        whyTxt = MOTION_SEMANTICS.TRAVEL;
      }
      hotEdgeId =
        step.kind === 'travel'
          ? `N:${step.from}>${step.to}`
          : step.kind === 'investigate'
            ? `N:${NEW_IDS.brain}>${NEW_IDS.systems}`
            : null;
      if (st.phase === 'LEARNING') {
        const L = learnState(T);
        whereTxt = 'COMPANY BRAIN';
        whoTxt = whoActs('LEARN');
        whyTxt = MOTION_SEMANTICS.LEARNING;
        changedTxt = 'KNOWLEDGE +1';
        learnedTxt = L.showBadges ? 'NEW KNOWLEDGE +1 · LOOP CLOSED' : 'learning…';
      }
    } else if (st.phase === 'TRANSFORMING') {
      whereTxt = morph < 0.5 ? 'RESTRUCTURING…' : 'TOPOLOGY SETTLING';
      whyTxt = 'hierarchy stops routing the work';
      whoTxt = 'YOU — the architect';
      changedTxt = 'STRUCTURE';
    } else if (st.phase === 'IDLE_NEW') {
      whereTxt = 'AI-NATIVE';
      latencyTxt = SIM_OLD_METRICS.latency;
      handoffTxt = SIM_OLD_METRICS.handoffs;
      whyTxt = 'ready — run the same signal';
    } else if (st.phase === 'COMPARISON') {
      whereTxt = era === 'new' ? 'AI-NATIVE' : 'TRADITIONAL';
      latencyTxt = era === 'new' ? SIM_NEW_METRICS.latency : SIM_TOTAL_OLD;
      handoffTxt = era === 'new' ? SIM_NEW_METRICS.handoffs : SIM_OLD_METRICS.handoffs;
      whyTxt = 'compare the operating physics';
      learnedTxt = 'NEW KNOWLEDGE +1';
    } else {
      whereTxt = 'TRADITIONAL';
      whyTxt = 'choose a signal and send it';
    }

    /* node classes */
    const isRunPhase =
      st.phase === 'SIGNAL_OLD' || st.phase === 'OLD_COMPLETE' || st.phase === 'SIGNAL_NEW' || st.phase === 'LEARNING';
    for (const n of NODES) {
      const g = nodeRefs.current[n.id];
      if (!g) continue;
      const isActive = isRunPhase && n.id === activeNodeId;
      const cls = [
        'sim-node',
        `k-${n.kind}`,
        isActive ? 'is-active' : '',
        n.id === st.selectedNode ? 'is-selected' : '',
        n.human ? 'is-human' : '',
      ]
        .filter(Boolean)
        .join(' ');
      const ck = `nodecls:${n.id}`;
      if (cache.get(ck) !== cls) {
        g.setAttribute('class', cls);
        cache.set(ck, cls);
      }
    }

    /* ---- edges ---- */
    for (const e of EDGES) {
      const path = edgeRefs.current[e.id];
      if (!path) continue;
      const a = nodePos(NODE_BY_ID[e.from], morph);
      let b = nodePos(NODE_BY_ID[e.to], morph);
      let w = edgeWeight(e, morph);

      if (e.oldWeight === 1 && e.newWeight === 0) {
        b = oldEdgeEndPoint(e, morph);
      } else if (e.oldWeight === 0 && e.newWeight === 1) {
        const k = clamp01((morph - 0.55) / 0.35);
        b = pointOnEdge(a, b, e.bow, k * k);
      }
      path.setAttribute('d', edgePath(a, b, e.bow));

      let o = w;
      let sw = e.kind === 'flow' || e.kind === 'new' || e.kind === 'return' ? 1.6 : 1;
      let cls = `sim-edge k-${e.kind}`;

      if (e.id === hotEdgeId) {
        o = 1;
        sw = 2.4;
        cls += ' is-hot';
      }
      if (e.id === st.selectedEdge) {
        o = 1;
        sw = 2.4;
        cls += ' is-selected';
      } else if (st.selectedNode && (e.from === st.selectedNode || e.to === st.selectedNode)) {
        o = Math.max(o, 0.9);
        sw = 2;
        cls += ' is-related';
      }
      if (st.overlays.human && e.humanDependency) {
        cls += ' is-human-dep';
        o = Math.max(o, 0.85);
      }
      if (st.overlays.knowledge) {
        if (e.knowledge) {
          cls += ' is-knowledge';
          o = 1;
          sw = 2.2;
        } else o *= 0.12;
      }
      if (st.layer) {
        const inLayer =
          NODE_BY_ID[e.from].layers.includes(st.layer) && NODE_BY_ID[e.to].layers.includes(st.layer);
        if (!inLayer) o *= 0.12;
        else {
          o = 1;
          sw = 2.2;
          cls += ' is-layer';
        }
      }
      path.style.opacity = o.toFixed(3);
      path.setAttribute('stroke-width', sw.toFixed(1));
      const ck = `edgecls:${e.id}`;
      if (cache.get(ck) !== cls) {
        path.setAttribute('class', cls);
        cache.set(ck, cls);
      }
    }

    /* ---- signal dot + trail ---- */
    const sg = signalRef.current;
    if (sg) {
      let pos = nodePos(NODE_BY_ID.SIGNAL, morph);
      let visible = true;
      if (st.phase === 'SIGNAL_OLD') {
        pos = oldFlow(T).pos;
      } else if (st.phase === 'OLD_COMPLETE') {
        visible = false;
      } else if (st.phase === 'SIGNAL_NEW') {
        pos = newFlow(T).pos;
      } else if (st.phase === 'LEARNING') {
        pos = nodePos(NODE_BY_ID[NEW_IDS.brain], 1);
        visible = T < LEARN_DURATION * 0.35;
      } else if (st.phase === 'COMPARISON') {
        visible = false;
      }
      sg.setAttribute('transform', `translate(${pos.x.toFixed(1)} ${pos.y.toFixed(1)})`);
      sg.style.opacity = visible ? '1' : '0';
      const ck = 'signode';
      const cls = `sim-signal era-${era}`;
      if (cache.get(ck) !== cls) {
        sg.setAttribute('class', cls);
        cache.set(ck, cls);
      }
    }
    if (trailRef.current) {
      if (st.phase === 'SIGNAL_OLD') {
        const f = oldFlow(T);
        trailRef.current.setAttribute(
          'points',
          [...f.trail, f.pos].map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '),
        );
        trailRef.current.style.opacity = '0.5';
      } else {
        trailRef.current.style.opacity = '0';
      }
    }

    /* ---- context-loss fragments ---- */
    const fragCount =
      st.phase === 'SIGNAL_OLD' || st.phase === 'OLD_COMPLETE'
        ? lossCount(st.phase === 'OLD_COMPLETE' ? OLD_DURATION : T)
        : 0;
    fragRefs.current.forEach((fr, i) => {
      if (!fr) return;
      if (i < fragCount) {
        const meta = fragMeta(i);
        const drift = clamp01((T - meta.t0) / 1.1) * 10;
        fr.setAttribute('x', (meta.x + meta.dx + drift * Math.sign(meta.dx || 1) * 0.4).toFixed(1));
        fr.setAttribute('y', (meta.y + meta.dy + drift * Math.sign(meta.dy || 1) * 0.4).toFixed(1));
        fr.style.opacity = clamp01((T - meta.t0) / 0.35).toFixed(2);
      } else {
        fr.style.opacity = '0';
      }
    });

    /* ---- meeting ghosts ---- */
    const inMeeting = st.phase === 'SIGNAL_OLD' && oldFlow(T).phase === 'wait' && oldFlow(T).toNode === 'MEETING';
    if (inMeeting) {
      const node = NODE_BY_ID.MEETING.old.pos;
      const wk = meetingWaitK(T);
      const offs = [
        { dx: -46, dy: -20 },
        { dx: 48, dy: 16 },
      ];
      ghostRefs.current.forEach((g, i) => {
        if (!g) return;
        const o = offs[i];
        g.setAttribute('cx', (node.x + o.dx * (1 - wk)).toFixed(1));
        g.setAttribute('cy', (node.y + o.dy * (1 - wk)).toFixed(1));
        g.style.opacity = '0.5';
      });
    } else {
      ghostRefs.current.forEach((g) => g && (g.style.opacity = '0'));
    }

    /* ---- metrics ---- */
    setTxt(latencyRef.current, latencyTxt, cache, 'lat');
    setTxt(handoffRef.current, handoffTxt, cache, 'hoffs');
    setTxt(lossRef.current, `${lossTxt} BITS`, cache, 'loss');
    const routingTxt = era === 'new' ? SIM_NEW_METRICS.routing : SIM_OLD_METRICS.routing;
    const knowTxt = era === 'new' ? SIM_NEW_METRICS.knowledge : SIM_OLD_METRICS.knowledge;
    const loopTxt =
      st.phase === 'LEARNING' || st.phase === 'COMPARISON' ? SIM_NEW_METRICS.loop : SIM_OLD_METRICS.loop;
    setTxt(stripRefs.current.routing, routingTxt, cache, 'routing');
    setTxt(stripRefs.current.knowledge, knowTxt, cache, 'know');
    setTxt(stripRefs.current.loop, loopTxt, cache, 'loop');

    /* ---- narrative strip ---- */
    setTxt(stripRefs.current.entered, SIM_SIGNALS.find((s) => s.key === st.signal)?.label ?? '', cache, 'entered');
    setTxt(stripRefs.current.where, whereTxt, cache, 'where');
    setTxt(stripRefs.current.why, whyTxt, cache, 'why');
    setTxt(stripRefs.current.who, whoTxt, cache, 'who');
    setTxt(stripRefs.current.changed, changedTxt || '—', cache, 'changed');
    setTxt(stripRefs.current.learned, learnedTxt, cache, 'learned');

    /* ---- brain card ---- */
    if (brainCardRef.current) {
      const stp = st.phase === 'SIGNAL_NEW' ? newFlow(T).step : null;
      const show = !!(stp && (stp.kind === 'brain' || stp.kind === 'investigate'));
      brainCardRef.current.style.opacity = show ? '1' : '0';
      brainCardRef.current.style.visibility = show ? 'visible' : 'hidden';
      if (show && stp) {
        const bp = nodePos(NODE_BY_ID[NEW_IDS.brain], 1);
        brainCardRef.current.style.left = `${((bp.x + 95) / VIEW_W) * 100}%`;
        brainCardRef.current.style.top = `${((bp.y - 130) / VIEW_H) * 100}%`;
        if (stp.kind === 'investigate') {
          const k = newFlow(T).investigateK ?? 0;
          setTxt(brainCardRef.current.querySelector('[data-iv]'), k < 0.5 ? '→ INVESTIGATE' : '← EVIDENCE', cache, 'iv');
        } else {
          setTxt(brainCardRef.current.querySelector('[data-iv]'), '· · ·', cache, 'iv');
        }
      }
    }

    /* ---- gate card ---- */
    if (gateCardRef.current) {
      const stp = st.phase === 'SIGNAL_NEW' ? newFlow(T).step : null;
      const show = !!(stp && (stp.kind === 'gate' || stp.kind === 'gate-open'));
      gateCardRef.current.style.opacity = show ? '1' : '0';
      gateCardRef.current.style.visibility = show ? 'visible' : 'hidden';
      if (show && stp) {
        const gp = nodePos(NODE_BY_ID[NEW_IDS.gate], 1);
        gateCardRef.current.style.left = `${((gp.x + 60) / VIEW_W) * 100}%`;
        gateCardRef.current.style.top = `${((gp.y - 128) / VIEW_H) * 100}%`;
        const k = newFlow(T).gateK ?? 0;
        const rows = gateCardRef.current.querySelectorAll('[data-gate-row]');
        rows.forEach((r, i) => {
          const th = [0.12, 0.38, 0.78][i] ?? 1;
          r.classList.toggle('on', k >= th);
        });
        gateCardRef.current.classList.toggle('open', stp.kind === 'gate-open' || k >= 0.78);
      }
    }

    /* ---- brain counters + learn badges ---- */
    const L =
      st.phase === 'LEARNING' || st.phase === 'COMPARISON'
        ? learnState(st.phase === 'COMPARISON' ? LEARN_DURATION : T)
        : null;
    setTxt(
      brainCountRefs.current.known,
      String(SIM_BRAIN.counters.known + (L?.knownAdded ? 1 : 0)),
      cache,
      'b-known',
    );
    setTxt(
      brainCountRefs.current.unknown,
      String(SIM_BRAIN.counters.unknown - (L?.unknownReduced ? 1 : 0)),
      cache,
      'b-unknown',
    );
    if (learnBadgeRef.current) {
      learnBadgeRef.current.style.opacity = L?.showBadges ? '1' : '0';
    }

    /* ---- mobile steps ---- */
    if (mobileRef.current) {
      if (st.phase === 'SIGNAL_OLD' || st.phase === 'OLD_COMPLETE') {
        const f = oldFlow(st.phase === 'OLD_COMPLETE' ? OLD_DURATION : T);
        const visited = VISIT_ORDER.slice(0, f.trail.length);
        for (const id of VISIT_ORDER) {
          const b = mStepRefs.current[`old:${id}`];
          if (b) {
            const ds = id === f.toNode ? 'active' : visited.includes(id) ? 'done' : '';
            if (b.dataset.state !== ds) b.dataset.state = ds;
          }
        }
      } else if (st.phase === 'SIGNAL_NEW' || st.phase === 'LEARNING') {
        const f = newFlow(st.phase === 'LEARNING' ? NEW_RUN_DURATION : T);
        for (const id of VISIT_ORDER) {
          const b = mStepRefs.current[`old:${id}`];
          if (b && b.dataset.state !== '') b.dataset.state = '';
        }
        const newOrder = [NEW_IDS.signal, NEW_IDS.context, NEW_IDS.brain, NEW_IDS.agents, NEW_IDS.gate, NEW_IDS.systems, NEW_IDS.evaluation];
        for (const id of newOrder) {
          const b = mStepRefs.current[`new:${id}`];
          if (b) {
            const ds = id === f.toNode ? 'active' : '';
            if (b.dataset.state !== ds) b.dataset.state = ds;
          }
        }
      }
    }
  }, []);

  /* ---------------- repaint on every machine change ---------------- */

  useEffect(() => {
    tRef.current = state.T;
    endSentRef.current = false;
    stepAccRef.current = 0;
    paint(state, state.T);
  }, [state, paint]);

  /* ---------------- runtime loop ---------------- */

  useEffect(() => {
    const st0 = stateRef.current;
    const dur = phaseDuration(st0.phase);
    const activeStart =
      st0.manualLock &&
      Number.isFinite(dur) &&
      !st0.paused &&
      !st0.selectedNode &&
      !st0.selectedEdge;
    if (!activeStart) return;

    const checkpoints = (): number[] => {
      const ph = stateRef.current.phase;
      if (ph === 'SIGNAL_OLD') {
        const arr: number[] = [];
        let t = 0;
        for (const h of OLD_HOPS) {
          t += h.travel;
          arr.push(t);
          t += h.wait;
          arr.push(t);
        }
        return arr;
      }
      if (ph === 'TRANSFORMING') return MORPH_TIMES;
      if (ph === 'SIGNAL_NEW') {
        const arr: number[] = [];
        let t = 0;
        for (const s of NEW_STEPS) {
          t += s.dur;
          arr.push(t);
        }
        return arr;
      }
      if (ph === 'LEARNING') {
        const L = LEARN_DURATION;
        return [L * 0.25, L * 0.4, L * 0.5, L * 0.8, L];
      }
      return [];
    };

    const frame = (ts: number) => {
      const st = stateRef.current;
      const d = phaseDuration(st.phase);
      const active =
        st.manualLock &&
        Number.isFinite(d) &&
        !st.paused &&
        !st.selectedNode &&
        !st.selectedEdge &&
        inViewRef.current &&
        !hiddenRef.current;
      if (active && lastTsRef.current != null) {
        const dt = Math.min(0.05, (ts - lastTsRef.current) / 1000);
        if (reducedRef.current) {
          stepAccRef.current += dt * st.speed;
          if (stepAccRef.current >= 1.25) {
            stepAccRef.current = 0;
            const cps = checkpoints();
            const next = cps.find((c) => c > tRef.current + 0.001);
            tRef.current = next ?? d;
          }
        } else {
          tRef.current += dt * st.speed;
        }
        if (tRef.current >= d) {
          if (!endSentRef.current) {
            endSentRef.current = true;
            tRef.current = d;
            paint(st, d);
            dispatch({ type: 'PHASE_END' });
          }
        } else {
          paint(st, tRef.current);
        }
      }
      lastTsRef.current = ts;
      rafRef.current = requestAnimationFrame(frame);
    };

    lastTsRef.current = null;
    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [
    state.phase,
    state.manualLock,
    state.paused,
    state.selectedNode,
    state.selectedEdge,
    state.speed,
    paint,
  ]);

  /* ---------------- environment ---------------- */

  useEffect(() => {
    const mqMobile = window.matchMedia('(max-width: 899px)');
    const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      setIsMobile(mqMobile.matches);
      setReduced(mqReduced.matches);
    };
    apply();
    mqMobile.addEventListener('change', apply);
    mqReduced.addEventListener('change', apply);
    return () => {
      mqMobile.removeEventListener('change', apply);
      mqReduced.removeEventListener('change', apply);
    };
  }, []);

  useEffect(() => {
    try {
      if (sessionStorage.getItem('qv-sim-manual') === '1') dispatch({ type: 'MANUAL_LOCK' });
    } catch {
      /* private mode */
    }
  }, []);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        inViewRef.current = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.04 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [isMobile]);

  useEffect(() => {
    const onVis = () => {
      hiddenRef.current = document.hidden;
    };
    document.addEventListener('visibilitychange', onVis);

    let scrollRaf = 0;
    const onScroll = () => {
      if (mobileRef.current) return;
      const sec = scrollRef.current;
      if (!sec) return;
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        const rect = sec.getBoundingClientRect();
        const vh = window.innerHeight;
        const total = rect.height - vh;
        const p = total > 0 ? snap(-rect.top / total, 0, 1) : 0;
        dispatch({ type: 'SEEK', progress: p });
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('scroll', onScroll);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
    };
  }, []);

  const manual = useCallback((fn?: () => void) => {
    dispatch({ type: 'MANUAL_LOCK' });
    try {
      sessionStorage.setItem('qv-sim-manual', '1');
    } catch {
      /* ignore */
    }
    fn?.();
  }, []);

  /* ---------------- derived UI ---------------- */

  const signalLabel = SIM_SIGNALS.find((s) => s.key === state.signal)?.label ?? '';
  const info = state.selectedNode ? SIM_NODE_INFO[state.selectedNode] : null;
  const nodeLabel = state.selectedNode
    ? state.morphT > 0.5
      ? NODE_BY_ID[state.selectedNode]?.new.label
      : NODE_BY_ID[state.selectedNode]?.old.label
    : '';
  const edgeInfo = state.selectedEdge
    ? edgeInfoText(EDGE_BY_ID[state.selectedEdge] ?? EDGES.find((e) => e.id === state.selectedEdge))
    : null;
  const layerBody = state.layer ? SIM_LAYERS.find((l) => l.key === state.layer)?.body : null;

  const mainAction: { label: string; run: () => void; primary?: boolean } | null =
    state.phase === 'IDLE_OLD'
      ? { label: SIM_CONTROLS.send, run: () => dispatch({ type: 'SEND_SIGNAL' }), primary: true }
      : state.phase === 'OLD_COMPLETE'
        ? { label: SIM_CONTROLS.rebuild, run: () => dispatch({ type: 'REBUILD' }), primary: true }
        : state.phase === 'IDLE_NEW'
          ? { label: SIM_CONTROLS.runAgain, run: () => dispatch({ type: 'RUN_AGAIN' }), primary: true }
          : state.phase === 'COMPARISON'
            ? { label: SIM_CONTROLS.runAgain, run: () => dispatch({ type: 'RUN_AGAIN' }) }
            : null;

  const running =
    state.phase === 'SIGNAL_OLD' ||
    state.phase === 'TRANSFORMING' ||
    state.phase === 'SIGNAL_NEW' ||
    state.phase === 'LEARNING';
  const inspecting = !!(state.selectedNode || state.selectedEdge);

  const phaseLabel =
    state.phase === 'TRANSFORMING'
      ? 'RESTRUCTURING'
      : state.phase === 'IDLE_OLD' || state.phase === 'SIGNAL_OLD' || state.phase === 'OLD_COMPLETE'
        ? 'TRADITIONAL'
        : 'AI-NATIVE';

  /* ================================================================ */
  /* RENDER                                                            */
  /* ================================================================ */

  const stageSvg = (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="sim-svg"
      role="img"
      aria-label="Interactive organization simulator: send a signal through a traditional company, rebuild it, and run the same signal through the AI-native operating model."
      onClick={(e) => {
        if ((e.target as Element).classList.contains('sim-bg') && inspecting) {
          dispatch({ type: 'CLEAR_INSPECT' });
        }
      }}
    >
      <title>Organization simulator — traditional company vs AI-native company</title>
      <desc>
        A miniature organization. Send a signal, watch it wait inside hierarchy, inspect where latency is created, rebuild the company, run the same signal again and watch it learn.
      </desc>
      <rect className="sim-bg" x="0" y="0" width={VIEW_W} height={VIEW_H} fill="transparent" tabIndex={-1} aria-hidden="true" />

      {EDGES.map((e) => (
        <path
          key={e.id}
          ref={(el) => {
            edgeRefs.current[e.id] = el;
          }}
          className={`sim-edge k-${e.kind}`}
          d="M 0 0"
          tabIndex={0}
          role="button"
          aria-label={`Connection: ${edgeInfoText(e)}`}
          onClick={(ev) => {
            ev.stopPropagation();
            manual(() => dispatch({ type: 'EDGE_INSPECT', id: e.id }));
          }}
          onMouseEnter={(ev) => setEdgeTip({ id: e.id, x: ev.clientX, y: ev.clientY })}
          onMouseMove={(ev) => setEdgeTip({ id: e.id, x: ev.clientX, y: ev.clientY })}
          onMouseLeave={() => setEdgeTip(null)}
          onKeyDown={(ev) => {
            if (ev.key === 'Enter' || ev.key === ' ') {
              ev.preventDefault();
              manual(() => dispatch({ type: 'EDGE_INSPECT', id: e.id }));
            }
          }}
        />
      ))}

      {OLD_HOPS.map((h, i) => {
        const from = i === 0 ? 'SIGNAL' : OLD_HOPS[i - 1].to;
        const e = EDGES.find((x) => x.from === from && x.to === h.to && x.oldWeight === 1);
        if (!e || h.hours === 0) return null;
        const mid = pointOnEdge(NODE_BY_ID[from].old.pos, NODE_BY_ID[h.to].old.pos, e.bow, 0.5);
        return (
          <text key={`lat-${e.id}`} className={`sim-latency ${state.overlays.latency ? 'on' : ''}`} x={mid.x} y={mid.y - 7} textAnchor="middle">
            +{h.hours}h
          </text>
        );
      })}

      {Array.from({ length: 5 }).map((_, i) => (
        <rect
          key={`frag-${i}`}
          ref={(el) => {
            fragRefs.current[i] = el;
          }}
          className="sim-frag"
          width="5"
          height="5"
          opacity="0"
        />
      ))}

      {[0, 1].map((i) => (
        <circle
          key={`ghost-${i}`}
          ref={(el) => {
            ghostRefs.current[i] = el;
          }}
          className="sim-ghost"
          r="4"
          opacity="0"
        />
      ))}

      <polyline ref={trailRef} className="sim-trail" points="" opacity="0" />

      {NODES.map((n) => {
        const [w, h] = nodeSize(n);
        const isBrain = n.id === NEW_IDS.brain;
        return (
          <g
            key={n.id}
            ref={(el) => {
              nodeRefs.current[n.id] = el;
            }}
            className={`sim-node k-${n.kind} ${n.human ? 'is-human' : ''}`}
            data-node={n.id}
            transform={`translate(${n.old.pos.x} ${n.old.pos.y})`}
            tabIndex={0}
            role="button"
            aria-label={`Inspect ${n.old.label}${n.new.label !== n.old.label ? ` — becomes ${n.new.label}` : ''}`}
            onClick={(ev) => {
              ev.stopPropagation();
              manual(() => dispatch({ type: 'NODE_INSPECT', id: n.id }));
            }}
            onKeyDown={(ev) => {
              if (ev.key === 'Enter' || ev.key === ' ') {
                ev.preventDefault();
                ev.stopPropagation();
                manual(() => dispatch({ type: 'NODE_INSPECT', id: n.id }));
              }
            }}
          >
            <rect className="sim-node-box" x={-w / 2} y={-h / 2} width={w} height={h} rx="7" />
            <text ref={(el) => { labelOldRefs.current[n.id] = el; }} className="sim-node-label old" y={-3} textAnchor="middle">
              {n.old.label}
            </text>
            <text ref={(el) => { labelNewRefs.current[n.id] = el; }} className="sim-node-label new" y={-3} textAnchor="middle" opacity="0">
              {n.new.label}
            </text>
            <text ref={(el) => { roleOldRefs.current[n.id] = el; }} className="sim-node-role old" y={h / 2 - 8} textAnchor="middle">
              {n.old.role}
            </text>
            <text ref={(el) => { roleNewRefs.current[n.id] = el; }} className="sim-node-role new" y={h / 2 - 8} textAnchor="middle" opacity="0">
              {n.new.role}
            </text>
            {isBrain && (
              <g ref={brainGroupRef} className="sim-brain-counters" opacity="0">
                {(
                  [
                    ['KNOWN', 'known'],
                    ['UNK', 'unknown'],
                    ['STALE', 'stale'],
                    ['DISP', 'disputed'],
                    ['PROC', 'procedures'],
                  ] as const
                ).map(([lbl, key], i) => (
                  <g key={key} transform={`translate(${(i - 2) * 30} ${h / 2 + 12})`}>
                    <text className="bc-k" y="0" textAnchor="middle">
                      {lbl}
                    </text>
                    <text className="bc-v" y="11" textAnchor="middle">
                      <tspan
                        ref={(el) => {
                          brainCountRefs.current[key] = el;
                        }}
                      >
                        {SIM_BRAIN.counters[key]}
                      </tspan>
                    </text>
                  </g>
                ))}
              </g>
            )}
            {n.id === NEW_IDS.gate && (
              <text className="sim-gate-motto" y={-h / 2 - 9} textAnchor="middle">
                INTELLIGENCE IS NOT AUTHORITY
              </text>
            )}
          </g>
        );
      })}

      <g
        ref={signalRef}
        className="sim-signal era-old"
        transform={`translate(${NODE_BY_ID.SIGNAL.old.pos.x} ${NODE_BY_ID.SIGNAL.old.pos.y})`}
        aria-hidden="true"
      >
        <circle r="7" className="sim-signal-ring" />
        <circle r="3.4" className="sim-signal-core" />
      </g>
    </svg>
  );

  const stage = (
    <div
      className="sim-stage"
      ref={frameRef}
      data-era="old"
      onPointerDownCapture={() => manual()}
      onKeyDown={(ev) => {
        if (ev.key === 'Escape' && (state.selectedNode || state.selectedEdge)) {
          ev.stopPropagation();
          dispatch({ type: 'CLEAR_INSPECT' });
        }
      }}
    >
      {stageSvg}

      <div ref={brainCardRef} className="sim-brain-card" aria-hidden="true">
        <div className="sbc-head">COMPANY BRAIN — STATE</div>
        <div className="sbc-sec">{SIM_BRAIN.card.head}</div>
        {SIM_BRAIN.card.known.map((k) => (
          <div key={k} className="sbc-known">
            {k}
          </div>
        ))}
        <div className="sbc-sec">{SIM_BRAIN.card.changedHead}</div>
        {SIM_BRAIN.card.changed.map((c) => (
          <div key={c} className="sbc-changed">
            {c}
          </div>
        ))}
        <div className="sbc-sec">{SIM_BRAIN.card.nextHead}</div>
        {SIM_BRAIN.card.next.map((nn) => (
          <div key={nn} className="sbc-next">
            {nn}
          </div>
        ))}
        <div className="sbc-iv" data-iv="">
          · · ·
        </div>
      </div>

      <div ref={gateCardRef} className="sim-gate-card" aria-hidden="true">
        <div className="sgc-head">{SIM_GATE.head}</div>
        {SIM_GATE.rows.map((r) => (
          <div key={r.k} className="sgc-row" data-gate-row="">
            <span>{r.k}</span>
            <span>{r.v}</span>
          </div>
        ))}
        <div className="sgc-principle">{SIM_GATE.principle}</div>
      </div>

      <div ref={learnBadgeRef} className="sim-learn-badge" aria-hidden="true">
        {SIM_LEARN.update.map((u) => (
          <div key={u}>{u}</div>
        ))}
      </div>

      {edgeTip && (
        <div
          className="sim-edge-tip"
          style={{ position: 'fixed', left: edgeTip.x + 14, top: edgeTip.y + 14 }}
          role="tooltip"
        >
          <div className="set-k">WHY DOES THIS CONNECTION EXIST?</div>
          <div className="set-v">
            {edgeTip.id in EDGE_BY_ID
              ? edgeInfoText(EDGE_BY_ID[edgeTip.id])
              : 'Structural connection of the current organization design.'}
          </div>
        </div>
      )}
    </div>
  );

  const rail = (
    <aside className="sim-rail" aria-label="Simulation metrics and inspection">
      <div className="sim-metrics">
        <div className="sm-row sm-big">
          <span className="sm-k">{SIM_METRIC_LABELS.latency}</span>
          <span className="sm-v" ref={latencyRef}>
            {SIM_OLD_METRICS.latency}
          </span>
        </div>
        <div className="sm-row">
          <span className="sm-k">{SIM_METRIC_LABELS.handoffs}</span>
          <span className="sm-v" ref={handoffRef}>
            {SIM_OLD_METRICS.handoffs}
          </span>
        </div>
        <div className="sm-row">
          <span className="sm-k">{SIM_METRIC_LABELS.routing}</span>
          <span className="sm-v" ref={(el) => { stripRefs.current.routing = el; }}>
            {SIM_OLD_METRICS.routing}
          </span>
        </div>
        <div className="sm-row">
          <span className="sm-k">{SIM_METRIC_LABELS.knowledge}</span>
          <span className="sm-v" ref={(el) => { stripRefs.current.knowledge = el; }}>
            {SIM_OLD_METRICS.knowledge}
          </span>
        </div>
        <div className="sm-row">
          <span className="sm-k">{SIM_METRIC_LABELS.loop}</span>
          <span className="sm-v" ref={(el) => { stripRefs.current.loop = el; }}>
            {SIM_OLD_METRICS.loop}
          </span>
        </div>
        <div className="sm-row sm-loss">
          <span className="sm-k">CONTEXT LOSS</span>
          <span className="sm-v" ref={lossRef}>
            0 BITS
          </span>
        </div>
      </div>

      {info && (
        <div className="sim-inspect" role="dialog" aria-label={`Inspection: ${nodeLabel}`}>
          <div className="si-head">
            <span className="si-title">{nodeLabel}</span>
            <button
              className="si-close"
              onClick={() => manual(() => dispatch({ type: 'CLEAR_INSPECT' }))}
              aria-label="Close inspection and resume"
            >
              ✕
            </button>
          </div>
          {info.lines.map((l) => (
            <p key={l} className="si-line">
              {l}
            </p>
          ))}
          {info.latency && (
            <p className="si-lat">
              LATENCY CONTRIBUTION <span>{info.latency}</span>
            </p>
          )}
          {info.becomes && (
            <p className="si-becomes">
              BECOMES <span>{info.becomes}</span>
            </p>
          )}
          <p className="si-hint">{SIM_CONTROLS.pauseHint}</p>
        </div>
      )}

      {edgeInfo && !info && (
        <div className="sim-inspect" role="dialog" aria-label="Connection inspection">
          <div className="si-head">
            <span className="si-title">{state.selectedEdge?.replace(/^N:/, '').replace('>', ' → ')}</span>
            <button
              className="si-close"
              onClick={() => manual(() => dispatch({ type: 'CLEAR_INSPECT' }))}
              aria-label="Close inspection and resume"
            >
              ✕
            </button>
          </div>
          <p className="si-line">{edgeInfo}</p>
          <p className="si-hint">{SIM_CONTROLS.pauseHint}</p>
        </div>
      )}

      {layerBody && (
        <div className="sim-layer-panel" role="region" aria-label="Layer explorer">
          <div className="si-head">
            <span className="si-title">{SIM_LAYERS.find((l) => l.key === state.layer)?.label}</span>
            <button
              className="si-close"
              onClick={() => dispatch({ type: 'SET_LAYER', layer: null })}
              aria-label="Close layer panel"
            >
              ✕
            </button>
          </div>
          <p className="si-line" style={{ whiteSpace: 'pre-line' }}>
            {layerBody}
          </p>
        </div>
      )}

      {state.reachedNew && !layerBody && !info && !edgeInfo && (
        <div className="sim-layers" aria-label="Organization layers">
          <span className="sm-k">EXPLORE THE LAYERS</span>
          <div className="sim-layer-chips">
            {SIM_LAYERS.map((l) => (
              <button
                key={l.key}
                className={`chip ${state.layer === l.key ? 'on' : ''}`}
                onClick={() =>
                  manual(() =>
                    dispatch({ type: 'SET_LAYER', layer: state.layer === l.key ? null : (l.key as LayerKey) }),
                  )
                }
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );

  const controls = (
    <div className="sim-controls">
      <div className="sim-ctl-row">
        <div className="sim-signals" role="group" aria-label="Choose an organizational signal">
          {SIM_SIGNALS.map((s) => (
            <button
              key={s.key}
              className={`chip sig ${state.signal === s.key ? 'on' : ''}`}
              disabled={!['IDLE_OLD', 'OLD_COMPLETE'].includes(state.phase)}
              aria-pressed={state.signal === s.key}
              onClick={() => manual(() => dispatch({ type: 'SET_SIGNAL', signal: s.key }))}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="sim-main-actions">{mainAction && (
          <button className={`sim-cta ${mainAction.primary ? 'primary' : ''}`} onClick={() => manual(mainAction.run)}>
            {mainAction.label}
          </button>
        )}</div>
        <div className="sim-util" role="group" aria-label="Simulation controls">
          <button
            className={`chip util ${state.speed === 2 ? 'on' : ''}`}
            onClick={() => manual(() => dispatch({ type: 'SET_SPEED', speed: state.speed === 1 ? 2 : 1 }))}
            aria-label={`Playback speed, currently ${state.speed} times`}
          >
            {state.speed === 1 ? SIM_CONTROLS.speed1 : SIM_CONTROLS.speed2}
          </button>
          <button
            className="chip util"
            onClick={() => manual(() => dispatch({ type: 'REPLAY' }))}
            disabled={state.phase === 'IDLE_OLD' && !state.completed}
          >
            {SIM_CONTROLS.replay}
          </button>
          <button className="chip util" onClick={() => manual(() => dispatch({ type: 'RESET' }))}>
            {SIM_CONTROLS.reset}
          </button>
        </div>
      </div>

      <div className="sim-ctl-row sim-toggles">
        <button
          className={`chip tog ${state.overlays.latency ? 'on' : ''}`}
          aria-pressed={state.overlays.latency}
          onClick={() => manual(() => dispatch({ type: 'TOGGLE_OVERLAY', key: 'latency' }))}
        >
          {SIM_CONTROLS.showLatency}
        </button>
        <button
          className={`chip tog ${state.overlays.human ? 'on' : ''}`}
          aria-pressed={state.overlays.human}
          onClick={() => manual(() => dispatch({ type: 'TOGGLE_OVERLAY', key: 'human' }))}
        >
          {SIM_CONTROLS.showHuman}
        </button>
        <button
          className={`chip tog ${state.overlays.knowledge ? 'on' : ''}`}
          aria-pressed={state.overlays.knowledge}
          onClick={() => manual(() => dispatch({ type: 'TOGGLE_OVERLAY', key: 'knowledge' }))}
        >
          {SIM_CONTROLS.showKnowledge}
        </button>
        {state.phase === 'COMPARISON' && (
          <div className="sim-compare" aria-label="Compare traditional and AI-native organization">
            <span className="sc-l">{SIM_CONTROLS.compareLeft}</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={state.morphT}
              aria-label="Organization structure, traditional to AI-native"
              aria-valuetext={state.morphT < 0.5 ? 'Traditional organization' : 'AI-native organization'}
              onChange={(e) => manual(() => dispatch({ type: 'SET_COMPARE_POSITION', t: parseFloat(e.target.value) }))}
              onPointerDown={() => manual()}
              onKeyDown={() => manual()}
            />
            <span className="sc-r">{SIM_CONTROLS.compareRight}</span>
          </div>
        )}
      </div>
    </div>
  );

  const strip = (
    <div className="sim-strip" role="status" aria-live="polite">
      {(
        [
          ['entered', SIM_STRIP_SLOTS.entered, signalLabel],
          ['where', SIM_STRIP_SLOTS.where, 'TRADITIONAL'],
          ['why', SIM_STRIP_SLOTS.why, 'choose a signal and send it'],
          ['who', SIM_STRIP_SLOTS.who, '—'],
          ['changed', SIM_STRIP_SLOTS.changed, '—'],
          ['learned', SIM_STRIP_SLOTS.learned, '—'],
        ] as const
      ).map(([k, label, init]) => (
        <div key={k} className={`strip-cell ${k === 'why' || k === 'where' ? 'wide' : ''}`}>
          <span className="strip-k">{label}</span>
          <span
            className="strip-v"
            ref={(el) => {
              stripRefs.current[k] = el;
            }}
          >
            {init}
          </span>
        </div>
      ))}
    </div>
  );

  const oldList = ['SIGNAL', 'EMPLOYEE', 'MANAGER', 'SLACK', 'MEETING', 'ANALYST', 'DIRECTOR', 'APPROVAL', 'ACTION'];
  const newList = [NEW_IDS.signal, NEW_IDS.context, NEW_IDS.brain, NEW_IDS.agents, NEW_IDS.gate, NEW_IDS.systems, NEW_IDS.evaluation];
  const latByNode: Record<string, string> = {
    EMPLOYEE: '+3h',
    MANAGER: '+6h',
    SLACK: '+4h',
    MEETING: '+1d',
    ANALYST: '+18h',
    DIRECTOR: '+20h',
    APPROVAL: '+26h',
    ACTION: '4.2 DAYS',
  };

  const mobile = (
    <div className="sim-mobile" ref={frameRef} data-era={state.morphT > 0.5 ? 'new' : 'old'}>
      <div className="sim-m-metrics">
        <span className="sm-k">{SIM_METRIC_LABELS.latency}</span>
        <span className="sm-v" ref={latencyRef}>
          00:00
        </span>
        <span className="sm-k">·</span>
        <span className="sm-k">{SIM_METRIC_LABELS.handoffs}</span>
        <span className="sm-v" ref={handoffRef}>
          0
        </span>
        <span className="sm-k">·</span>
        <span className="sm-k">{SIM_METRIC_LABELS.loop}</span>
        <span className="sm-v" ref={(el) => { stripRefs.current.loop = el; }}>
          OPEN
        </span>
      </div>
      <div className="sim-m-flow" data-era={state.morphT > 0.5 ? 'new' : 'old'}>
        <div className="sim-m-col old">
          {oldList.map((id) => (
            <button
              key={id}
              ref={(el) => {
                mStepRefs.current[`old:${id}`] = el;
              }}
              className="sim-m-step"
              onClick={() => manual(() => dispatch({ type: 'NODE_INSPECT', id }))}
              aria-label={`Inspect ${NODE_BY_ID[id].old.label}`}
            >
              <span className="sms-label">{NODE_BY_ID[id].old.label}</span>
              {latByNode[id] && <span className="sms-lat">{latByNode[id]}</span>}
            </button>
          ))}
        </div>
        <div className="sim-m-col new">
          {newList.map((id) => (
            <button
              key={id}
              ref={(el) => {
                mStepRefs.current[`new:${id}`] = el;
              }}
              className="sim-m-step"
              onClick={() => manual(() => dispatch({ type: 'NODE_INSPECT', id }))}
              aria-label={`Inspect ${NODE_BY_ID[id].new.label}`}
            >
              <span className="sms-label">{NODE_BY_ID[id].new.label}</span>
            </button>
          ))}
          <div className="sim-m-step learn">
            <span className="sms-label">LEARN · NEW KNOWLEDGE +1</span>
          </div>
        </div>
      </div>
      {info && (
        <div className="sim-inspect" role="dialog" aria-label={`Inspection: ${nodeLabel}`}>
          <div className="si-head">
            <span className="si-title">{nodeLabel}</span>
            <button
              className="si-close"
              onClick={() => manual(() => dispatch({ type: 'CLEAR_INSPECT' }))}
              aria-label="Close inspection and resume"
            >
              ✕
            </button>
          </div>
          {info.lines.map((l) => (
            <p key={l} className="si-line">
              {l}
            </p>
          ))}
          {info.latency && (
            <p className="si-lat">
              LATENCY CONTRIBUTION <span>{info.latency}</span>
            </p>
          )}
          {info.becomes && (
            <p className="si-becomes">
              BECOMES <span>{info.becomes}</span>
            </p>
          )}
        </div>
      )}
      <p className="sim-m-note">{signalEntryNote(state.signal)}</p>
      <div className="sim-m-ctas">
        {mainAction && (
          <button className={`sim-cta ${mainAction.primary ? 'primary' : ''}`} onClick={() => manual(mainAction.run)}>
            {mainAction.label}
          </button>
        )}
        <button className="chip util" onClick={() => manual(() => dispatch({ type: 'REPLAY' }))}>
          {SIM_CONTROLS.replay}
        </button>
      </div>
      <div className="sim-signals">
        {SIM_SIGNALS.map((s) => (
          <button
            key={s.key}
            className={`chip sig ${state.signal === s.key ? 'on' : ''}`}
            disabled={!['IDLE_OLD', 'OLD_COMPLETE'].includes(state.phase)}
            aria-pressed={state.signal === s.key}
            onClick={() => manual(() => dispatch({ type: 'SET_SIGNAL', signal: s.key }))}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <section
      id="simulator"
      ref={scrollRef}
      className={`sim-scroll ${isMobile ? 'no-sticky' : ''} ${reduced ? 'reduced' : ''}`}
      aria-label="Interactive organization simulator"
    >
      <div className="sim-sticky">
        <div
          className={`sim-frame phase-${state.phase.toLowerCase().replace('_', '-')} ${inspecting ? 'inspecting' : ''} ${running ? 'running' : ''}`}
        >
          <header className="sim-head">
            <div className="sim-head-l">
              <span className="sim-tag">{SIM_TAG}</span>
            </div>
            <div className="sim-head-r">
              <span className={`sim-phase era-${phaseLabel === 'TRADITIONAL' ? 'old' : phaseLabel === 'RESTRUCTURING' ? 'mid' : 'new'}`}>
                {phaseLabel}
              </span>
              <span className="sim-disclosure">
                <strong>{SIM_DISCLOSURE.tag}</strong> {SIM_DISCLOSURE.body}
              </span>
            </div>
          </header>

          {isMobile ? (
            mobile
          ) : (
            <div className="sim-body">
              {stage}
              {rail}
            </div>
          )}

          {!isMobile && strip}
          {!isMobile && controls}

          <div
            className={`sim-payoff ${state.phase === 'COMPARISON' && state.morphT >= 0.999 ? 'on' : ''}`}
            aria-hidden={!(state.phase === 'COMPARISON' && state.morphT >= 0.999)}
          >
            <p className="sp-h">{SIM_PAYOFF.h}</p>
            <p className="sp-sub">{SIM_PAYOFF.sub}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
