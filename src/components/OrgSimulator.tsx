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

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
} from 'react';

import { makeSimData, type SimLocale } from '@/content/i18n/sim-data';

import {
  EDGES,
  NODES,
  NODE_BY_ID,
  NEW_IDS,
  VIEW_H,
  VIEW_W,
  ambientWeight,
  clamp01,
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
  transformT,
} from '@/lib/sim/timeline';
import {
  initialMachine,
  machine,
  phaseDuration,
  type MachineState,
} from '@/lib/sim/machine';
import { type LayerKey } from '@/content/simulator';

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

const NODE_SIZE: Record<string, [number, number]> = {
  default: [150, 46],
  MEETING: [176, 62], // COMPANY BRAIN — structured institutional state
  APPROVAL: [148, 48], // AUTHORITY GATE
  CEO: [140, 44],
  ambient: [104, 28],
};

function nodeSize(n: SimNode): [number, number] {
  if (n.ambient) return NODE_SIZE.ambient;
  return NODE_SIZE[n.id] ?? NODE_SIZE.default;
}

/**
 * Per-kind geometric glyph — entity type must be readable without color
 * (shape + stroke carry the semantics; color only reinforces them).
 */
const KIND_GLYPH: Record<string, ReactElement> = {
  signal: <path d="M0,-3.4 L3.4,0 L0,3.4 L-3.4,0 Z" fill="currentColor" />,
  human: (
    <g fill="currentColor">
      <circle r="2" cy="-1.8" />
      <path d="M-3.6,4.4 a3.6,3.6 0 0 1 7.2,0 Z" />
    </g>
  ),
  system: <rect x="-3.1" y="-3.1" width="6.2" height="6.2" rx="1" fill="none" stroke="currentColor" strokeWidth="1.1" />,
  agent: <path d="M0,-3.8 L3.3,-1.9 L3.3,1.9 L0,3.8 L-3.3,1.9 L-3.3,-1.9 Z" fill="currentColor" />,
  brain: (
    <g fill="currentColor" stroke="none">
      <circle r="1.5" cx="-2.8" cy="-1.8" />
      <circle r="1.5" cx="2.8" cy="-1.8" />
      <circle r="1.5" cx="0" cy="2.6" />
      <path d="M-2.4,-1.4 L-0.4,-0.4 M2.4,-1.4 L0.4,-0.4 M0,1.1 L0,0.4" stroke="currentColor" strokeWidth="0.8" fill="none" />
    </g>
  ),
  gate: (
    <g>
      <rect x="-3.4" y="-3.4" width="6.8" height="6.8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.1" />
      <path d="M0,-1.9 L0,1.9" stroke="currentColor" strokeWidth="1.5" />
    </g>
  ),
  enterprise: (
    <g fill="none" stroke="currentColor">
      <rect x="-3.6" y="-2.7" width="7.2" height="5.4" rx="1" strokeWidth="1" />
      <rect x="-1.9" y="-1" width="3.8" height="2" rx="0.5" strokeWidth="0.8" />
    </g>
  ),
  infra: (
    <g fill="none" stroke="currentColor" strokeWidth="0.9">
      <ellipse cx="0" cy="-2.3" rx="3.1" ry="1.25" />
      <path d="M-3.1,-2.3 V2.3 a3.1,1.25 0 0 0 6.2,0 V-2.3" />
    </g>
  ),
  ambient: <circle r="2.7" fill="none" stroke="currentColor" strokeWidth="0.9" strokeDasharray="1.6 1.6" />,
};

/* ------------------------------------------------------------------ */
/* camera — operational (signal-path focus) vs full system map         */
/* ------------------------------------------------------------------ */

type Cam = { k: number; tx: number; ty: number; mode: 'operational' | 'full' };

/** Nodes on the real signal journey per era (from OLD_HOPS / NEW_STEPS — no invented edges). */
const PATH_IDS = {
  old: ['SIGNAL', 'EMPLOYEE', 'MANAGER', 'SLACK', 'MEETING', 'ANALYST', 'DIRECTOR', 'APPROVAL', 'ACTION'],
  new: ['SIGNAL', 'SLACK', 'MEETING', 'MANAGER', 'APPROVAL', 'ACTION', 'ANALYST'],
} as const;

function regionOf(ids: readonly string[], t: 0 | 1, pad: number) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const id of ids) {
    const n = NODE_BY_ID[id];
    const p = nodePos(n, t);
    const [w, h] = nodeSize(n);
    minX = Math.min(minX, p.x - w / 2);
    maxX = Math.max(maxX, p.x + w / 2);
    minY = Math.min(minY, p.y - h / 2);
    maxY = Math.max(maxY, p.y + h / 2);
  }
  return { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 };
}

function fitCam(r: { x: number; y: number; w: number; h: number }, mode: Cam['mode'], visW = VIEW_W): Cam {
  const k = Math.min(visW / r.w, VIEW_H / r.h);
  const tx = (visW - r.w * k) / 2 - r.x * k;
  const ty = (VIEW_H - r.h * k) / 2 - r.y * k;
  return { k, tx, ty, mode };
}

function camFor(mode: Cam['mode'], era: 'old' | 'new', visW = VIEW_W): Cam {
  if (mode === 'full') {
    return fitCam({ x: 0, y: 0, w: VIEW_W, h: VIEW_H }, 'full', visW);
  }
  return fitCam(regionOf(PATH_IDS[era], era === 'new' ? 1 : 0, 18), 'operational', visW);
}

const CAM_MIN = 0.75;
const CAM_MAX = 2.6;

/** zoom by factor around a viewBox point (defaults to stage center) */
function zoomCam(c: Cam, factor: number, px = VIEW_W / 2, py = VIEW_H / 2): Cam {
  const k = Math.min(CAM_MAX, Math.max(CAM_MIN, c.k * factor));
  const wx = (px - c.tx) / c.k;
  const wy = (py - c.ty) / c.k;
  return { ...c, k, tx: px - wx * k, ty: py - wy * k };
}

function clampPan(c: Cam): Cam {
  const tx = Math.min(VIEW_W * 0.9, Math.max(VIEW_W * 0.1 - VIEW_W * c.k, c.tx));
  const ty = Math.min(VIEW_H * 0.9, Math.max(VIEW_H * 0.1 - VIEW_H * c.k, c.ty));
  return { ...c, tx, ty };
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

/** Actor lines come from the dictionary (S.whoActs), not from this module. */

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

export function OrgSimulatorSection({ locale = 'en' }: { locale?: SimLocale }) {
  const S = useMemo(() => makeSimData(locale), [locale]);
  const [state, dispatch] = useReducer(machine, initialMachine);
  const [isMobile, setIsMobile] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [edgeTip, setEdgeTip] = useState<{ id: string; x: number; y: number } | null>(null);
  const [cam, setCam] = useState<Cam>(() => camFor('operational', 'old'));
  const [mobileMapOpen, setMobileMapOpen] = useState(false);
  const camRef = useRef(cam);
  camRef.current = cam;
  const stageBoxRef = useRef<HTMLDivElement | null>(null);
  const panRef = useRef<{ id: number; sx: number; sy: number; tx: number; ty: number; moved: boolean } | null>(null);
  const suppressClickRef = useRef(false);

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
    let latencyTxt: string = era === 'new' ? S.newMetrics.latency : S.oldMetrics.latency;
    let handoffTxt: string = era === 'new' ? S.newMetrics.handoffs : S.oldMetrics.handoffs;
    let lossTxt = '—';

    if (st.phase === 'IDLE_OLD') {
      // honest zero-state: nothing has run yet, so there is nothing to measure
      latencyTxt = S.kpiIdle;
      handoffTxt = S.kpiIdle;
      lossTxt = S.kpiIdle;
    } else if (st.phase === 'SIGNAL_OLD' || st.phase === 'OLD_COMPLETE') {
      const f = oldFlow(st.phase === 'OLD_COMPLETE' ? OLD_DURATION : T);
      activeNodeId = f.toNode;
      latencyTxt = st.phase === 'OLD_COMPLETE' ? S.totalOld : formatLatency(f.latencyHours);
      handoffTxt = String(f.handoffs);
      lossTxt = String(f.lossBits);
      hotEdgeId = `${f.fromNode}>${f.toNode}`;
      whereTxt = S.nodeLabel(NODE_BY_ID[f.toNode].old.label);
      whoTxt = S.strip.humansRouting;
      const to = f.toNode;
      if (f.phase === 'wait') {
        whyTxt =
          to === 'SLACK' ? S.motion.CONTEXT_LOSS
          : to === 'MEETING' ? S.motion.MEETING
          : to === 'APPROVAL' ? S.motion.APPROVAL
          : S.motion.WAITING;
        const hop = OLD_HOPS[f.hopIndex];
        changedTxt = hop && hop.hours > 0 ? `+${hop.hours}h` : '';
      } else {
        whyTxt = S.motion.TRAVEL;
      }
    } else if (st.phase === 'SIGNAL_NEW' || st.phase === 'LEARNING') {
      const f = newFlow(st.phase === 'LEARNING' ? NEW_RUN_DURATION : T);
      activeNodeId = f.toNode;
      latencyTxt = st.phase === 'LEARNING' ? S.newMetrics.latency : `~${f.latencyMin} MIN`;
      handoffTxt = S.newMetrics.handoffs;
      lossTxt = '0';
      whereTxt = S.nodeLabel(NODE_BY_ID[f.toNode]?.new.label ?? '');
      const step = f.step;
      if (step.kind === 'wait') {
        const lbl = NODE_BY_ID[step.node].new.label;
        whoTxt =
          lbl === 'CONTEXT ASSEMBLY' ? S.whoActs('CONTEXT')
          : lbl === 'AGENTS' ? S.whoActs('AGENT')
          : lbl === 'ENTERPRISE SYSTEMS' ? S.whoActs('ACTION')
          : lbl === 'EVALUATION' ? S.whoActs('EVAL')
          : S.whoActs('BRAIN');
        whyTxt =
          lbl === 'AGENTS' ? S.motion.EXECUTION
          : lbl === 'COMPANY BRAIN' ? S.motion.RETRIEVAL
          : lbl === 'EVALUATION' ? S.motion.OUTCOME
          : S.motion.TRAVEL;
      } else if (step.kind === 'brain') {
        whoTxt = S.whoActs('BRAIN');
        whyTxt = S.motion.RETRIEVAL;
      } else if (step.kind === 'investigate') {
        whoTxt = S.whoActs('INVESTIGATE');
        whyTxt = S.motion.INVESTIGATION;
      } else if (step.kind === 'gate') {
        whoTxt = S.whoActs('GATE', f.gateK ?? 0);
        whyTxt = S.motion.AUTHORITY;
      } else if (step.kind === 'gate-open') {
        whoTxt = S.whoActs('GATE', 1);
        whyTxt = S.motion.AUTHORITY;
        changedTxt = S.strip.gateOpen;
      } else {
        whoTxt = S.whoActs('SYSTEM');
        whyTxt = S.motion.TRAVEL;
      }
      hotEdgeId =
        step.kind === 'travel'
          ? `N:${step.from}>${step.to}`
          : step.kind === 'investigate'
            ? `N:${NEW_IDS.brain}>${NEW_IDS.systems}`
            : null;
      if (st.phase === 'LEARNING') {
        const L = learnState(T);
        whereTxt = S.nodeLabel('COMPANY BRAIN');
        whoTxt = S.whoActs('LEARN');
        whyTxt = S.motion.LEARNING;
        changedTxt = S.strip.knowledgePlus;
        learnedTxt = L.showBadges ? S.strip.learnedCombo : S.strip.learningBusy;
      }
    } else if (st.phase === 'TRANSFORMING') {
      whereTxt = morph < 0.5 ? S.strip.restructuringEllipsis : S.phase.topologySettling;
      whyTxt = S.strip.hierarchyStops;
      whoTxt = S.strip.youArchitect;
      changedTxt = S.strip.structure;
    } else if (st.phase === 'IDLE_NEW') {
      whereTxt = S.phase.aiNative;
      latencyTxt = S.oldMetrics.latency;
      handoffTxt = S.oldMetrics.handoffs;
      whyTxt = S.strip.ready;
    } else if (st.phase === 'COMPARISON') {
      whereTxt = era === 'new' ? S.phase.aiNative : S.phase.traditional;
      latencyTxt = era === 'new' ? S.newMetrics.latency : S.totalOld;
      handoffTxt = era === 'new' ? S.newMetrics.handoffs : S.oldMetrics.handoffs;
      whyTxt = S.strip.compare;
      learnedTxt = S.learn.update[0];
    } else {
      whereTxt = S.phase.traditional;
      whyTxt = S.strip.chooseSignal;
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
      // stop the visible edge at the target box border so arrowheads stay readable
      const halfW = nodeSize(NODE_BY_ID[e.to])[0] / 2 + 6;
      const dist = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      const bDrawn = pointOnEdge(a, b, e.bow, Math.max(0.45, 1 - halfW / dist));
      path.setAttribute('d', edgePath(a, bDrawn, e.bow));

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
    setTxt(lossRef.current, /\d/.test(lossTxt) ? `${lossTxt} BITS` : lossTxt, cache, 'loss');
    const routingTxt = era === 'new' ? S.newMetrics.routing : S.oldMetrics.routing;
    const knowTxt = era === 'new' ? S.newMetrics.knowledge : S.oldMetrics.knowledge;
    const loopTxt =
      st.phase === 'LEARNING' || st.phase === 'COMPARISON' ? S.newMetrics.loop : S.oldMetrics.loop;
    setTxt(stripRefs.current.routing, routingTxt, cache, 'routing');
    setTxt(stripRefs.current.knowledge, knowTxt, cache, 'know');
    setTxt(stripRefs.current.loop, loopTxt, cache, 'loop');

    /* ---- signal journey stepper (painter-driven: T advances via rAF) ---- */
    {
      let idx = -1;
      let lat = '';
      if (st.phase === 'SIGNAL_OLD') {
        const f = oldFlow(T);
        lat = formatLatency(f.latencyHours);
        if (f.phase === 'travel') idx = f.hopIndex === 0 ? 0 : 1;
        else if (f.phase === 'wait') idx = f.toNode === 'APPROVAL' ? 3 : 2;
        else idx = 4;
      } else if (st.phase === 'OLD_COMPLETE') {
        idx = 4;
        lat = S.totalOld;
      } else if (st.phase === 'SIGNAL_NEW') {
        const f = newFlow(T);
        lat = `${f.latencyMin} MIN`;
        const k = f.step.kind;
        if (k === 'travel') idx = f.stepIndex === 0 ? 0 : 1;
        else if (k === 'wait') {
          idx = f.step.node === 'ACTION' || f.step.node === 'MANAGER' ? 4 : f.step.node === 'SLACK' ? 1 : 3;
        } else if (k === 'gate' || k === 'gate-open') {
          idx = 3;
        } else {
          idx = 1; // brain / investigate — knowledge routing
        }
      } else if (st.phase === 'LEARNING' || st.phase === 'COMPARISON') {
        idx = 5;
        lat = S.newMetrics.latency;
      } else if (st.phase === 'TRANSFORMING' || st.phase === 'IDLE_NEW') {
        lat = '—';
      }
      journeyRefs.current.forEach((el, i) => {
        if (!el) return;
        const cls = `sj-step${i === idx ? ' on' : ''}${idx >= 0 && i < idx ? ' done' : ''}${idx < 0 ? ' idle' : ''}`;
        if (cache.get(`jc${i}`) !== cls) {
          cache.set(`jc${i}`, cls);
          el.className = cls;
          if (i === idx) el.setAttribute('aria-current', 'step');
          else el.removeAttribute('aria-current');
        }
      });
      if (journeyLatRef.current) setTxt(journeyLatRef.current, lat, cache, 'jlat');
    }

    /* ---- narrative strip ---- */
    setTxt(stripRefs.current.entered, S.signals.find((s) => s.key === st.signal)?.label ?? '', cache, 'entered');
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
        const cm = camRef.current;
        brainCardRef.current.style.left = `${(((cm.tx + (bp.x + 95) * cm.k) / VIEW_W)) * 100}%`;
        brainCardRef.current.style.top = `${(((cm.ty + (bp.y - 130) * cm.k) / VIEW_H)) * 100}%`;
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
        const cm = camRef.current;
        gateCardRef.current.style.left = `${(((cm.tx + (gp.x + 60) * cm.k) / VIEW_W)) * 100}%`;
        gateCardRef.current.style.top = `${(((cm.ty + (gp.y - 128) * cm.k) / VIEW_H)) * 100}%`;
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
      String(S.brain.counters.known + (L?.knownAdded ? 1 : 0)),
      cache,
      'b-known',
    );
    setTxt(
      brainCountRefs.current.unknown,
      String(S.brain.counters.unknown - (L?.unknownReduced ? 1 : 0)),
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
  }, [S, cam]);

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

  /* ---------------- camera: refocus on era flip, wheel zoom, drag pan ---------------- */

  const era = state.morphT > 0.5 ? 'new' : 'old';
  const eraRef = useRef(era);
  useEffect(() => {
    if (eraRef.current !== era) {
      eraRef.current = era;
      // operational mode follows the active signal path of the new era
      setCam((c) => (c.mode === 'operational' ? camFor('operational', era, visWRef.current) : c));
    }
  }, [era]);

  /** client px -> viewBox units (accounts for preserveAspectRatio letterboxing) */
  const toViewCoords = useCallback((clientX: number, clientY: number) => {
    const svg = stageBoxRef.current?.querySelector('svg');
    if (!svg) return { x: VIEW_W / 2, y: VIEW_H / 2 };
    const r = svg.getBoundingClientRect();
    const s = Math.min(r.width / VIEW_W, r.height / VIEW_H);
    const ox = (r.width - VIEW_W * s) / 2;
    const oy = (r.height - VIEW_H * s) / 2;
    return { x: (clientX - r.left - ox) / s, y: (clientY - r.top - oy) / s };
  }, []);

  /** visible viewBox width (stage is usually height-bound; the extra width is usable) */
  const measureVisW = useCallback(() => {
    const box = stageBoxRef.current;
    if (!box) return VIEW_W;
    const h = box.clientHeight;
    const w = box.clientWidth;
    if (!h || !w) return VIEW_W;
    const s = Math.min(w / VIEW_W, h / VIEW_H);
    return Math.min(w / s, (VIEW_W * 3) / 2);
  }, []);
  const visWRef = useRef(VIEW_W);
  visWRef.current = measureVisW();
  const [visW, setVisW] = useState(VIEW_W);
  const userCamRef = useRef(false);
  useEffect(() => {
    const update = () => setVisW(measureVisW());
    update();
    window.addEventListener('resize', update);
    document.addEventListener('fullscreenchange', update);
    return () => {
      window.removeEventListener('resize', update);
      document.removeEventListener('fullscreenchange', update);
    };
  }, [measureVisW]);
  // keep the automatic framing correct when the stage box changes size,
  // until the user takes manual control of the camera
  useEffect(() => {
    if (!userCamRef.current) {
      setCam((c) => camFor(c.mode, state.morphT > 0.5 ? 'new' : 'old', visW));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visW]);

  useEffect(() => {
    const box = stageBoxRef.current;
    if (!box || isMobile) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      userCamRef.current = true;
      const p = toViewCoords(e.clientX, e.clientY);
      const factor = e.deltaY < 0 ? 1.18 : 1 / 1.18;
      setCam((c) => clampPan(zoomCam(c, factor, p.x, p.y)));
    };
    box.addEventListener('wheel', onWheel, { passive: false });
    return () => box.removeEventListener('wheel', onWheel);
  }, [isMobile, toViewCoords]);

  const onStagePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (isMobile || e.button !== 0) return;
    if ((e.target as Element).closest('.sim-viewbar')) return;
    panRef.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, tx: cam.tx, ty: cam.ty, moved: false };
  };

  const onStagePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const pan = panRef.current;
    if (!pan || pan.id !== e.pointerId) return;
    const svg = stageBoxRef.current?.querySelector('svg');
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const s = Math.min(r.width / VIEW_W, r.height / VIEW_H);
    const dx = (e.clientX - pan.sx) / s;
    const dy = (e.clientY - pan.sy) / s;
    if (!pan.moved && Math.hypot(e.clientX - pan.sx, e.clientY - pan.sy) > 5) {
      pan.moved = true;
      suppressClickRef.current = true;
      try {
        stageBoxRef.current?.setPointerCapture(pan.id);
      } catch {
        /* noop */
      }
    }
    if (pan.moved) {
      userCamRef.current = true;
      setCam((c) => clampPan({ ...c, tx: pan.tx + dx, ty: pan.ty + dy }));
    }
  };

  const onStagePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (panRef.current?.id === e.pointerId) {
      panRef.current = null;
      // let the suppressed click pass once, then restore
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 60);
    }
  };

  const onStageClickCapture = (e: ReactMouseEvent) => {
    if (suppressClickRef.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const setCamMode = (mode: Cam['mode']) => {
    userCamRef.current = true;
    setCam(camFor(mode, era, visWRef.current));
  };

  const toggleFullscreen = () => {
    const el = stageBoxRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen().catch(() => {
        /* denied — button stays honest */
      });
    }
  };

  useEffect(() => {
    const onFs = () => setCam((c) => ({ ...c })); // re-render on fullscreenchange for correct letterbox math
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
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

  const signalLabel = S.signals.find((s) => s.key === state.signal)?.label ?? '';
  const info = state.selectedNode ? S.nodeInfo[state.selectedNode] : null;
  const nodeLabel = state.selectedNode
    ? S.nodeLabel(
        (state.morphT > 0.5
          ? NODE_BY_ID[state.selectedNode]?.new.label
          : NODE_BY_ID[state.selectedNode]?.old.label) ?? ''
      )
    : '';
  const edgeInfo = state.selectedEdge ? S.edgeText(state.selectedEdge) : null;
  const layerBody = state.layer ? S.layers.find((l) => l.key === state.layer)?.body : null;

  const mainAction: { label: string; run: () => void; primary?: boolean } | null =
    state.phase === 'IDLE_OLD'
      ? { label: S.controls.send, run: () => dispatch({ type: 'SEND_SIGNAL' }), primary: true }
      : state.phase === 'OLD_COMPLETE'
        ? { label: S.controls.rebuild, run: () => dispatch({ type: 'REBUILD' }), primary: true }
        : state.phase === 'IDLE_NEW'
          ? { label: S.controls.runAgain, run: () => dispatch({ type: 'RUN_AGAIN' }), primary: true }
          : state.phase === 'COMPARISON'
            ? { label: S.controls.runAgain, run: () => dispatch({ type: 'RUN_AGAIN' }) }
            : null;

  /** busy CTA: visible, disabled, honest — the user always sees the primary slot */
  const primaryCta =
    mainAction !== null ? (
      <button
        className={`sim-cta ${mainAction.primary ? 'primary' : ''}`}
        onClick={() => manual(mainAction.run)}
      >
        {mainAction.label}
      </button>
    ) : (
      <button className="sim-cta primary is-busy" disabled aria-disabled="true">
        {S.ctaRunning}
      </button>
    );

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
      role="group"
      aria-label={S.a11y.simAria}
      onClick={(e) => {
        if ((e.target as Element).classList.contains('sim-bg') && inspecting) {
          dispatch({ type: 'CLEAR_INSPECT' });
        }
      }}
    >
      <title>{S.a11y.simTitle}</title>
      <desc>{S.a11y.simDesc}</desc>
      <defs>
        {/*
          Arrowheads per path semantics (color never the only cue — the legend
          also maps dash/solid language to meaning).
        */}
        <marker id="arr-base" viewBox="0 0 8 8" refX="6.4" refY="4" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
          <path d="M0,0.6 L7.2,4 L0,7.4 Z" className="mk-base" />
        </marker>
        <marker id="arr-warm" viewBox="0 0 8 8" refX="6.4" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0.6 L7.2,4 L0,7.4 Z" className="mk-warm" />
        </marker>
        <marker id="arr-mint" viewBox="0 0 8 8" refX="6.4" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0.6 L7.2,4 L0,7.4 Z" className="mk-mint" />
        </marker>
        <marker id="arr-hot-warm" viewBox="0 0 8 8" refX="6.4" refY="4" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M0,0.6 L7.2,4 L0,7.4 Z" className="mk-hot-warm" />
        </marker>
        <marker id="arr-hot-mint" viewBox="0 0 8 8" refX="6.4" refY="4" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M0,0.6 L7.2,4 L0,7.4 Z" className="mk-hot-mint" />
        </marker>
      </defs>
      <rect className="sim-bg" x="0" y="0" width={VIEW_W} height={VIEW_H} fill="transparent" tabIndex={-1} aria-hidden="true" />

      <g
        className="sim-viewport"
        transform={`translate(${cam.tx.toFixed(2)} ${cam.ty.toFixed(2)}) scale(${cam.k.toFixed(4)})`}
      >
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
          aria-label={S.a11y.connection.replace('{info}', S.edgeText(e.id ?? ''))}
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
            aria-label={
              n.new.label !== n.old.label
                ? S.a11y.inspectNodeBecomes.replace('{label}', S.nodeLabel(n.old.label)).replace('{becomes}', S.nodeLabel(n.new.label))
                : S.a11y.inspectNode.replace('{label}', S.nodeLabel(n.old.label))
            }
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
            <rect className="sim-node-box" x={-w / 2} y={-h / 2} width={w} height={h} rx="10" />
            <g
              className={`sim-node-ico k-${n.kind}`}
              transform={`translate(${-w / 2 + 15} ${-h / 2 + 15}) scale(1.35)`}
              aria-hidden="true"
            >
              {KIND_GLYPH[n.kind] ?? KIND_GLYPH.system}
            </g>
            <text ref={(el) => { labelOldRefs.current[n.id] = el; }} className="sim-node-label old" y={-3} textAnchor="middle">
              {S.nodeLabel(n.old.label)}
            </text>
            <text ref={(el) => { labelNewRefs.current[n.id] = el; }} className="sim-node-label new" y={-3} textAnchor="middle" opacity="0">
              {S.nodeLabel(n.new.label)}
            </text>
            <text ref={(el) => { roleOldRefs.current[n.id] = el; }} className="sim-node-role old" y={h / 2 - 8} textAnchor="middle">
              {S.nodeRole(n.old.role)}
            </text>
            <text ref={(el) => { roleNewRefs.current[n.id] = el; }} className="sim-node-role new" y={h / 2 - 8} textAnchor="middle" opacity="0">
              {S.nodeRole(n.new.role)}
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
                        {S.brain.counters[key]}
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
      </g>
    </svg>
  );

  const stage = (
    <div
      className="sim-stage"
      ref={(el) => {
        frameRef.current = el;
        stageBoxRef.current = el;
      }}
      data-era="old"
      onPointerDownCapture={() => manual()}
      onPointerDown={onStagePointerDown}
      onPointerMove={onStagePointerMove}
      onPointerUp={onStagePointerUp}
      onPointerCancel={onStagePointerUp}
      onClickCapture={onStageClickCapture}
      onKeyDown={(ev) => {
        if (ev.key === 'Escape' && (state.selectedNode || state.selectedEdge)) {
          ev.stopPropagation();
          dispatch({ type: 'CLEAR_INSPECT' });
        }
      }}
    >
      {stageSvg}

      <div className="sim-viewbar" role="toolbar" aria-label={S.maps.operational}>
        <button
          className="vb-btn"
          onClick={() => {
            userCamRef.current = true;
            setCam((c) => clampPan(zoomCam(c, 1.25)));
          }}
          aria-label={S.view.zoomIn}
          title={S.view.zoomIn}
        >
          +
        </button>
        <button
          className="vb-btn"
          onClick={() => {
            userCamRef.current = true;
            setCam((c) => clampPan(zoomCam(c, 1 / 1.25)));
          }}
          aria-label={S.view.zoomOut}
          title={S.view.zoomOut}
        >
          −
        </button>
        <button
          className={`vb-btn ${cam.mode === 'operational' ? 'on' : ''}`}
          onClick={() => setCamMode('operational')}
          aria-label={S.view.refocus}
          title={S.view.refocus}
        >
          <span className="vb-ico vb-target" aria-hidden="true" />
        </button>
        <button
          className={`vb-btn ${cam.mode === 'full' ? 'on' : ''}`}
          onClick={() => setCamMode('full')}
          aria-label={S.view.fit}
          title={S.view.fit}
        >
          <span className="vb-ico vb-map" aria-hidden="true" />
        </button>
        <button
          className="vb-btn"
          onClick={() => setCam(camFor(cam.mode, era, visWRef.current))}
          aria-label={S.view.reset}
          title={S.view.reset}
        >
          <span className="vb-ico vb-reset" aria-hidden="true" />
        </button>
        <button
          className="vb-btn"
          onClick={toggleFullscreen}
          aria-label={S.view.fullscreen}
          title={S.view.fullscreen}
        >
          <span className="vb-ico vb-full" aria-hidden="true" />
        </button>
      </div>

      <div ref={brainCardRef} className="sim-brain-card" aria-hidden="true">
        <div className="sbc-head">{S.brain.card.head} — {S.nodeLabel('COMPANY BRAIN')}</div>
        <div className="sbc-sec">{S.brain.card.head}</div>
        {S.brain.card.known.map((k) => (
          <div key={k} className="sbc-known">
            {k}
          </div>
        ))}
        <div className="sbc-sec">{S.brain.card.changedHead}</div>
        {S.brain.card.changed.map((c) => (
          <div key={c} className="sbc-changed">
            {c}
          </div>
        ))}
        <div className="sbc-sec">{S.brain.card.nextHead}</div>
        {S.brain.card.next.map((nn) => (
          <div key={nn} className="sbc-next">
            {nn}
          </div>
        ))}
        <div className="sbc-iv" data-iv="">
          · · ·
        </div>
      </div>

      <div ref={gateCardRef} className="sim-gate-card" aria-hidden="true">
        <div className="sgc-head">{S.gate.head}</div>
        {S.gate.rows.map((r) => (
          <div key={r.k} className="sgc-row" data-gate-row="">
            <span>{r.k}</span>
            <span>{r.v}</span>
          </div>
        ))}
        <div className="sgc-principle">{S.gate.principle}</div>
      </div>

      <div ref={learnBadgeRef} className="sim-learn-badge" aria-hidden="true">
        {S.learn.update.map((u) => (
          <div key={u}>{u}</div>
        ))}
      </div>

      {edgeTip && (
        <div
          className="sim-edge-tip"
          style={{ position: 'fixed', left: edgeTip.x + 14, top: edgeTip.y + 14 }}
          role="tooltip"
        >
          <div className="set-k">{S.edgeHead}</div>
          <div className="set-v">{S.edgeText(edgeTip.id)}</div>
        </div>
      )}
    </div>
  );

  const rail = (
    <aside className="sim-rail" aria-label={S.a11y.rail}>
      <div className="sim-metrics">
        <div className="sm-row sm-big">
          <span className="sm-k">{S.metricLabels.latency}</span>
          <span className="sm-v" ref={latencyRef}>
            {S.kpiIdle}
          </span>
        </div>
        <div className="sm-row">
          <span className="sm-k">{S.metricLabels.handoffs}</span>
          <span className="sm-v" ref={handoffRef}>
            {S.kpiIdle}
          </span>
        </div>
        <div className="sm-row">
          <span className="sm-k">{S.metricLabels.routing}</span>
          <span className="sm-v" ref={(el) => { stripRefs.current.routing = el; }}>
            {S.oldMetrics.routing}
          </span>
        </div>
        <div className="sm-row">
          <span className="sm-k">{S.metricLabels.knowledge}</span>
          <span className="sm-v" ref={(el) => { stripRefs.current.knowledge = el; }}>
            {S.oldMetrics.knowledge}
          </span>
        </div>
        <div className="sm-row">
          <span className="sm-k">{S.metricLabels.loop}</span>
          <span className="sm-v" ref={(el) => { stripRefs.current.loop = el; }}>
            {S.oldMetrics.loop}
          </span>
        </div>
        <div className="sm-row sm-loss">
          <span className="sm-k">{S.metricLabels.contextLoss}</span>
          <span className="sm-v" ref={lossRef}>
            {S.kpiIdle}
          </span>
        </div>
      </div>

      {info && (
        <div className="sim-inspect" role="dialog" aria-label={`${S.a11y.inspectionDialog}: ${nodeLabel}`}>
          <div className="si-head">
            <span className="si-title">{nodeLabel}</span>
            <button
              className="si-close"
              onClick={() => manual(() => dispatch({ type: 'CLEAR_INSPECT' }))}
              aria-label={S.a11y.closeInspect}
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
              {S.inspect.latencyContribution} <span>{info.latency}</span>
            </p>
          )}
          {info.becomes && (
            <p className="si-becomes">
              {S.inspect.becomes} <span>{info.becomes}</span>
            </p>
          )}
          <p className="si-hint">{S.controls.pauseHint}</p>
        </div>
      )}

      {edgeInfo && !info && (
        <div className="sim-inspect" role="dialog" aria-label={S.a11y.connectionInspection}>
          <div className="si-head">
            <span className="si-title">{state.selectedEdge?.replace(/^N:/, '').replace('>', ' → ')}</span>
            <button
              className="si-close"
              onClick={() => manual(() => dispatch({ type: 'CLEAR_INSPECT' }))}
              aria-label={S.a11y.closeInspect}
            >
              ✕
            </button>
          </div>
          <p className="si-line">{edgeInfo}</p>
          <p className="si-hint">{S.controls.pauseHint}</p>
        </div>
      )}

      {layerBody && (
        <div className="sim-layer-panel" role="region" aria-label={S.a11y.layerPanel}>
          <div className="si-head">
            <span className="si-title">{S.layers.find((l) => l.key === state.layer)?.label}</span>
            <button
              className="si-close"
              onClick={() => dispatch({ type: 'SET_LAYER', layer: null })}
              aria-label={S.a11y.closeLayer}
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
        <div className="sim-layers" aria-label={S.a11y.layersRegion}>
          <span className="sm-k">{S.exploreLayers}</span>
          <div className="sim-layer-chips">
            {S.layers.map((l) => (
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

  /** Step 1 + Step 2: the scenario controls, at the top near the graph title. */
  const commandBar = (
    <div className="sim-command">
      <div className="cmd-step cmd-choose">
        <span className="cmd-k">{S.cmd.step1}</span>
        <div className="sim-signals" role="group" aria-label={S.a11y.chooseSignal}>
          {S.signals.map((s) => (
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
      <div className="cmd-step cmd-run">
        <span className="cmd-k">{S.cmd.step2}</span>
        <div className="sim-main-actions">{primaryCta}</div>
      </div>
    </div>
  );

  /** Node/edge semantics — shape and text carry the meaning, color reinforces it. */
  const legendBar = (
    <div className="sim-legend">
      <span className="lg-item"><i className="lg-mark lg-human" aria-hidden="true" />{S.legend.human}</span>
      <span className="lg-item"><i className="lg-mark lg-agent" aria-hidden="true" />{S.legend.agent}</span>
      <span className="lg-item"><i className="lg-mark lg-brain" aria-hidden="true" />{S.legend.brain}</span>
      <span className="lg-item"><i className="lg-mark lg-gate" aria-hidden="true" />{S.legend.gate}</span>
      <span className="lg-item"><i className="lg-mark lg-signal" aria-hidden="true" />{S.legend.signal}</span>
      <span className="lg-item"><i className="lg-mark lg-system" aria-hidden="true" />{S.legend.system}</span>
      <span className="lg-item"><i className="lg-line lg-flow" aria-hidden="true" />{S.legend.flow}</span>
      <span className="lg-item"><i className="lg-line lg-wait" aria-hidden="true" />{S.legend.wait}</span>
      <span className="lg-item"><i className="lg-line lg-active" aria-hidden="true" />{S.legend.active}</span>
    </div>
  );

  /* ---- Signal Journey: live narrative, painter-driven (refs, like the strip) ---- */
  const journeyRefs = useRef<(HTMLLIElement | null)[]>([]);
  const journeyLatRef = useRef<HTMLSpanElement | null>(null);
  const journeySteps = [
    S.journey.received,
    S.journey.routed,
    S.journey.waiting,
    S.journey.decision,
    S.journey.action,
    S.journey.learning,
  ];
  const journeyBar = (
    <div className="sim-journey" role="group" aria-label={S.cmd.step3}>
      <span className="sj-k">{S.cmd.step3}</span>
      <ol className="sj-steps">
        {journeySteps.map((label, i) => (
          <li
            key={label}
            ref={(el) => {
              journeyRefs.current[i] = el;
            }}
            className="sj-step idle"
            data-step={i}
          >
            <span className="sj-dot" aria-hidden="true" />
            {label}
          </li>
        ))}
      </ol>
      <span className="sj-lat" ref={journeyLatRef} />
    </div>
  );

  /** Replay / speed / layers stay accessible but secondary, below the stage. */
  const controls = (
    <div className="sim-controls">
      <div className="sim-ctl-row">
        <div className="sim-util" role="group" aria-label={S.a11y.controls}>
          <button
            className={`chip util ${state.speed === 2 ? 'on' : ''}`}
            onClick={() => manual(() => dispatch({ type: 'SET_SPEED', speed: state.speed === 1 ? 2 : 1 }))}
            aria-label={`Playback speed, currently ${state.speed} times`}
          >
            {state.speed === 1 ? S.controls.speed1 : S.controls.speed2}
          </button>
          <button
            className="chip util"
            onClick={() => manual(() => dispatch({ type: 'REPLAY' }))}
            disabled={state.phase === 'IDLE_OLD' && !state.completed}
          >
            {S.controls.replay}
          </button>
          <button className="chip util" onClick={() => manual(() => dispatch({ type: 'RESET' }))}>
            {S.controls.reset}
          </button>
        </div>
      </div>

      <div className="sim-ctl-row sim-toggles">
        <button
          className={`chip tog ${state.overlays.latency ? 'on' : ''}`}
          aria-pressed={state.overlays.latency}
          onClick={() => manual(() => dispatch({ type: 'TOGGLE_OVERLAY', key: 'latency' }))}
        >
          {S.controls.showLatency}
        </button>
        <button
          className={`chip tog ${state.overlays.human ? 'on' : ''}`}
          aria-pressed={state.overlays.human}
          onClick={() => manual(() => dispatch({ type: 'TOGGLE_OVERLAY', key: 'human' }))}
        >
          {S.controls.showHuman}
        </button>
        <button
          className={`chip tog ${state.overlays.knowledge ? 'on' : ''}`}
          aria-pressed={state.overlays.knowledge}
          onClick={() => manual(() => dispatch({ type: 'TOGGLE_OVERLAY', key: 'knowledge' }))}
        >
          {S.controls.showKnowledge}
        </button>
        {state.phase === 'COMPARISON' && (
          <div className="sim-compare" aria-label={S.a11y.compareGroup}>
            <span className="sc-l">{S.controls.compareLeft}</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={state.morphT}
              aria-label={S.a11y.compareSlider}
              aria-valuetext={state.morphT < 0.5 ? 'Traditional organization' : 'AI-native organization'}
              onChange={(e) => manual(() => dispatch({ type: 'SET_COMPARE_POSITION', t: parseFloat(e.target.value) }))}
              onPointerDown={() => manual()}
              onKeyDown={() => manual()}
            />
            <span className="sc-r">{S.controls.compareRight}</span>
          </div>
        )}
      </div>
    </div>
  );

  const strip = (
    <div className="sim-strip" role="status" aria-live="polite">
      {(
        [
          ['entered', S.slots.entered, signalLabel],
          ['where', S.slots.where, S.phase.traditional],
          ['why', S.slots.why, S.strip.chooseSignal],
          ['who', S.slots.who, '—'],
          ['changed', S.slots.changed, '—'],
          ['learned', S.slots.learned, '—'],
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
        <span className="sm-k">{S.metricLabels.latency}</span>
        <span className="sm-v" ref={latencyRef}>
          {S.kpiIdle}
        </span>
        <span className="sm-k">·</span>
        <span className="sm-k">{S.metricLabels.handoffs}</span>
        <span className="sm-v" ref={handoffRef}>
          {S.kpiIdle}
        </span>
        <span className="sm-k">·</span>
        <span className="sm-k">{S.metricLabels.loop}</span>
        <span className="sm-v" ref={(el) => { stripRefs.current.loop = el; }}>
          {S.oldMetrics.loop}
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
              aria-label={S.a11y.inspectNode.replace('{label}', S.nodeLabel(NODE_BY_ID[id].old.label))}
            >
              <span className="sms-label">{S.nodeLabel(NODE_BY_ID[id].old.label)}</span>
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
              aria-label={S.a11y.inspectNode.replace('{label}', S.nodeLabel(NODE_BY_ID[id].new.label))}
            >
              <span className="sms-label">{S.nodeLabel(NODE_BY_ID[id].new.label)}</span>
            </button>
          ))}
          <div className="sim-m-step learn">
            <span className="sms-label">{S.mobileLearnStep}</span>
          </div>
        </div>
      </div>
      {info && (
        <div className="sim-inspect" role="dialog" aria-label={`${S.a11y.inspectionDialog}: ${nodeLabel}`}>
          <div className="si-head">
            <span className="si-title">{nodeLabel}</span>
            <button
              className="si-close"
              onClick={() => manual(() => dispatch({ type: 'CLEAR_INSPECT' }))}
              aria-label={S.a11y.closeInspect}
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
              {S.inspect.latencyContribution} <span>{info.latency}</span>
            </p>
          )}
          {info.becomes && (
            <p className="si-becomes">
              {S.inspect.becomes} <span>{info.becomes}</span>
            </p>
          )}
        </div>
      )}
      <p className="sim-m-note">{S.signals.find((s) => s.key === state.signal)?.note ?? ''}</p>
      <div className="sim-m-ctas">
        <button
          className="chip util"
          onClick={() => manual(() => dispatch({ type: 'REPLAY' }))}
          disabled={state.phase === 'IDLE_OLD' && !state.completed}
        >
          {S.controls.replay}
        </button>
        <button className="chip util" onClick={() => manual(() => dispatch({ type: 'RESET' }))}>
          {S.controls.reset}
        </button>
        <button
          className="chip util sim-m-mapbtn"
          aria-expanded={mobileMapOpen}
          onClick={() => {
            const next = !mobileMapOpen;
            setMobileMapOpen(next);
            if (next) setCam(camFor('full', state.morphT > 0.5 ? 'new' : 'old'));
          }}
        >
          {S.mobileFullMap}
        </button>
      </div>
      {mobileMapOpen && (
        <div className="sim-m-fullmap">
          {stageSvg}
          <p className="sim-m-map-hint">{S.mobileFullMapHint}</p>
        </div>
      )}
    </div>
  );

  return (
    <section
      id="simulator"
      ref={scrollRef}
      className={`sim-scroll ${isMobile ? 'no-sticky' : ''} ${reduced ? 'reduced' : ''}`}
      aria-label={S.a11y.section}
    >
      <div className="sim-sticky">
        <div
          className={`sim-frame phase-${state.phase.toLowerCase().replace('_', '-')} cam-${cam.mode} ${inspecting ? 'inspecting' : ''} ${running ? 'running' : ''}`}
        >
          <header className="sim-head">
            <div className="sim-head-l">
              <span className="sim-tag">{S.tag}</span>
            </div>
            <div className="sim-head-r">
              <span className={`sim-phase era-${phaseLabel === 'TRADITIONAL' ? 'old' : phaseLabel === 'RESTRUCTURING' ? 'mid' : 'new'}`}>
                {phaseLabel === 'TRADITIONAL'
                  ? S.phase.traditional
                  : phaseLabel === 'RESTRUCTURING'
                    ? S.phase.restructuring
                    : S.phase.aiNative}
              </span>
              <span className="sim-disclosure">
                <strong>{S.disclosure.tag}</strong> {S.disclosure.body}
              </span>
            </div>
          </header>

          {commandBar}
          {journeyBar}
          {legendBar}

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
            <p className="sp-h">{S.payoff.h}</p>
            <p className="sp-sub">{S.payoff.sub}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
