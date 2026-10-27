'use client';

/**
 * OrgTransform — the hero visualization.
 *
 * A deterministic, time-driven Canvas animation:
 *   1. TRADITIONAL — an org chart with friction metrics
 *   2. SIGNAL      — one decision travels employee → manager → Slack →
 *                    meeting → analyst → approval → action, latency accumulating
 *   3. TRANSFORM   — the chart collapses into the target topology
 *   4. NATIVE      — the same decision runs through the operating model
 *   5. REVEAL      — "Same company. Different operating physics."
 *
 * Engineering notes:
 * - pauses when offscreen or tab hidden (IntersectionObserver + visibilitychange)
 * - prefers-reduced-motion renders the final state statically
 * - mobile gets a reduced-node vertical layout, no horizontal overflow
 * - no random values: every frame is a pure function of elapsed time
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { simLabels } from '@/content/i18n/sim';
import { FRICTION_METRICS, SIGNAL_HOPS, TOPOLOGY_LAYERS } from '@/content/quantiviq';
import { useInView, usePrefersReducedMotion } from '@/lib/motion';

type Phase = 0 | 1 | 2 | 3 | 4;
type Locale = 'en' | 'fa';
/** Widened dictionary view: both locales' literal types are assignable. */
type SimT = { readonly [K in keyof (typeof simLabels)['en']]: string };

/** Phase names stay Latin (ids); display labels come from the dictionary. */
const PHASE_KEYS = ['ot_phase_1', 'ot_phase_2', 'ot_phase_3', 'ot_phase_4', 'ot_phase_5'] as const;
const PHASE_DUR = [3000, 6400, 3200, 4200, 3400];

const TOTAL = PHASE_DUR.reduce((a, p) => a + p, 0);

const C = {
  // Boardroom Ivory canvas palette (2026-10-26 design migration).
  // Canvas API takes literal colors only - no CSS vars here.
  edge: 'rgba(29, 26, 22, 0.30)',
  edgeSoft: 'rgba(29, 26, 22, 0.16)',
  nodeFill: '#fdfbf6',
  nodeBorder: 'rgba(29, 26, 22, 0.35)',
  nodeText: '#1d1a16',
  muted: '#665d4f',
  path: '#1f5c45',
  warn: '#a8894f',
  ok: '#1f5c45',
  bandFill: 'rgba(29, 26, 22, 0.04)',
  text: '#1d1a16',
};

function clamp01(x: number) {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}
function easeInOut(x: number) {
  const t = clamp01(x);
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function mix(alpha: number) {
  return clamp01(alpha);
}

type Pt = { x: number; y: number };
type Rect = { x: number; y: number; w: number; h: number };

function roundRect(ctx: CanvasRenderingContext2D, r: Rect, rad = 7) {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(r.x, r.y, r.w, r.h, rad);
    return;
  }
  // manual fallback for engines without CanvasRenderingContext2D.roundRect
  const { x, y, w, h } = r;
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function drawLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  size = 11,
  align: CanvasTextAlign = 'center'
) {
  ctx.font = `500 ${size}px "JetBrains Mono", ui-monospace, monospace`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

export function OrgTransform({ locale = 'en' }: { locale?: Locale }) {
  const T: SimT = simLabels[locale];
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { ref: ioRef, inView } = useInView<HTMLDivElement>('80px');
  const reduced = usePrefersReducedMotion();
  const [phaseLabel, setPhaseLabel] = useState<string>(T.ot_phase_1);
  const [cycle, setCycle] = useState(0);

  const running = inView && !reduced;

  const drawStatic = useCallback((ctx: CanvasRenderingContext2D, W: number, H: number) => {
    // Reduced-motion static equivalent: final topology, fully labeled.
    drawScene(ctx, W, H, { phase: 3, t: 1, elapsed: TOTAL, mobile: W < 720 }, 1, T);
    drawScene(ctx, W, H, { phase: 4, t: 1, elapsed: TOTAL, mobile: W < 720 }, 1, T);
  }, [T]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let dpr = 1;
    let W = 0;
    let H = 0;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(320, Math.floor(rect.width));
      H = Math.max(300, Math.floor(rect.height));
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduced) drawStatic(ctx, W, H);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    if (reduced) {
      setPhaseLabel(T.ot_static);
      return () => ro.disconnect();
    }

    let start = performance.now();
    let lastPhase = -1;
    let lastCycle = -1;
    void cycle; // cycle changes force this effect to re-run => clock restart (replay)

    const frame = (now: number) => {
      const hidden = document.hidden;
      if (!hidden && inView) {
        const elapsed = (now - start) % TOTAL;
        const cyc = Math.floor((now - start) / TOTAL);
        if (cyc !== lastCycle) {
          lastCycle = cyc;
          setCycle(cyc);
        }
        let acc = 0;
        let phase: Phase = 0;
        for (let i = 0; i < PHASE_DUR.length; i++) {
          if (elapsed < acc + PHASE_DUR[i]) {
            phase = i as Phase;
            break;
          }
          acc += PHASE_DUR[i];
        }
        if (phase !== lastPhase) {
          lastPhase = phase;
          setPhaseLabel(T[PHASE_KEYS[phase]]);
        }
        ctx.clearRect(0, 0, W, H);
        drawScene(ctx, W, H, { phase, t: (elapsed - acc) / PHASE_DUR[phase], elapsed, mobile: W < 720 }, cyc, T);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [inView, reduced, drawStatic, cycle, T]);

  return (
    <div className="orgviz" ref={ioRef}>
      <div className="orgviz-head">
        <span className="orgviz-phase" aria-live="polite">{phaseLabel}</span>
        <button
          type="button"
          className="orgviz-replay"
          onClick={() => {
            const canvas = canvasRef.current;
            const wrap = wrapRef.current;
            if (!canvas || !wrap) return;
            const ctx = canvas.getContext('2d');
            if (!ctx || reduced) return;
            const rect = wrap.getBoundingClientRect();
            ctx.clearRect(0, 0, rect.width, rect.height);
            // force the effect to restart the clock
            setCycle((c) => c + 1);
          }}
        >
          ↻ {T.ot_replay.replace('↻ ', '')}
        </button>
      </div>
      <div className="orgviz-stage" ref={wrapRef}>
        <canvas ref={canvasRef} role="img" aria-label={T.ot_canvas_aria} />
      </div>
      <p className="visually-hidden">
        {T.ot_sr_equivalent
          .replace('{hops}', SIGNAL_HOPS.map((h) => localizedNode(h.node, T).toLowerCase()).join(' → '))
          .replace(
            '{hop_latencies}',
            SIGNAL_HOPS.filter((h) => h.latency)
              .map((h) => `${localizedNode(h.node, T).toLowerCase()} ${h.latency}`)
              .join(', ')
          )
          .replace('{layers}', topologyLabels(T).join(' → '))}
      </p>
    </div>
  );
}

/* ---------------------- localized label lookups ---------------------- */

/** node id → localized node label (falls back to the canonical EN label). */
function localizedNode(node: string, T: SimT): string {
  const id = node.toLowerCase().replace(/\s+/g, '_');
  const key = `node_${id}` as keyof SimT;
  return T[key] ?? node;
}

/** friction metric label → localized. */
function localizedMetricLabel(label: string, T: SimT): string {
  const key = `fm_${label.toLowerCase().replace(/[\s./]+/g, '_')}` as keyof SimT;
  return T[key] ?? label;
}

/** friction metric value → localized where the value has a key. */
function localizedMetricValue(label: string, value: string, T: SimT): string {
  const slug = label.toLowerCase().replace(/[\s./]+/g, '_');
  if (slug === 'decision_latency') return T.total_old_latency;
  const key = `fm_v_${slug}` as keyof SimT;
  return T[key] ?? value;
}

/** five canonical topology bands, in TOPOLOGY_LAYERS order. */
const BAND_KEYS = [
  'tl_human_authority',
  'tl_org_control_plane',
  'tl_execution_edge',
  'tl_company_brain',
  'tl_enterprise',
] as const;
const BAND_NOTE_KEYS = [
  'tl_note_authority',
  'tl_note_control_plane',
  'tl_note_execution',
  'tl_note_company_brain',
  'tl_note_enterprise',
] as const;

/** topology layer label → localized (index-based, mirrors TOPOLOGY_LAYERS order). */
function topologyLabels(T: SimT): string[] {
  return TOPOLOGY_LAYERS.map((l, i) => T[BAND_KEYS[i]] ?? l.label);
}

/* ============================== drawing ============================== */

type SceneState = {
  phase: Phase;
  t: number; // 0..1 within phase
  elapsed: number;
  mobile: boolean;
};

type Layout = {
  tree: { label: string; x: number; y: number; w: number; h: number }[];
  edges: [Pt, Pt][];
  stations: { label: string; x: number; y: number; w: number }[];
  metrics: { label: string; value: string; x: number; y: number }[];
  bands: { label: string; note: string; y: number; h: number; color: string }[];
  counter: Pt;
};

function buildLayout(W: number, H: number, mobile: boolean, T: SimT): Layout {
  const P = 18;
  if (mobile) {
    // Vertical: compact tree on top, stations zigzag below, metrics bottom.
    const cx = W / 2;
    const tree: Layout['tree'] = [
      { label: localizedNode('CEO', T), x: cx - 42, y: 14, w: 84, h: 20 },
      { label: localizedNode('VP', T), x: cx - 42 - 70, y: 48, w: 64, h: 19 },
      { label: localizedNode('VP', T), x: cx - 42 + 70, y: 48, w: 64, h: 19 },
      { label: localizedNode('DIRECTOR', T), x: cx - 42 - 105, y: 82, w: 62, h: 18 },
      { label: localizedNode('DIRECTOR', T), x: cx - 42, y: 82, w: 62, h: 18 },
      { label: localizedNode('DIRECTOR', T), x: cx - 42 + 105, y: 82, w: 62, h: 18 },
    ];
    const edges: [Pt, Pt][] = [
      [tree[0], tree[1]].map(n => ({ x: n.x + n.w / 2, y: n.y + n.h })) as [Pt, Pt],
      [tree[0], tree[2]].map(n => ({ x: n.x + n.w / 2, y: n.y + n.h })) as [Pt, Pt],
      [tree[1], tree[3]].map(n => ({ x: n.x + n.w / 2, y: n.y + n.h })) as [Pt, Pt],
      [tree[1], tree[4]].map(n => ({ x: n.x + n.w / 2, y: n.y + n.h })) as [Pt, Pt],
      [tree[2], tree[5]].map(n => ({ x: n.x + n.w / 2, y: n.y + n.h })) as [Pt, Pt],
    ];
    const zw = Math.min(W - 2 * P, 170);
    const zx = (W - zw) / 2;
    const stations = SIGNAL_HOPS.map((h, i) => ({
      label: localizedNode(h.node, T),
      x: i % 2 === 0 ? zx - 8 : zx + zw + 8 - zw,
      y: 132 + i * 30,
      w: zw,
    }));
    const mPer = 3;
    const mw = (W - 2 * P - 12) / mPer - 8;
    const metrics = FRICTION_METRICS.map((m, i) => ({
      label: localizedMetricLabel(m.label, T),
      value: localizedMetricValue(m.label, m.value, T),
      x: P + (i % mPer) * (mw + 8),
      y: H - 64 + Math.floor(i / mPer) * 26,
    })).slice(0, 6);
    const bands = TOPOLOGY_LAYERS.map((l, i) => ({
      label: T[BAND_KEYS[i]] ?? l.label,
      note: T[BAND_NOTE_KEYS[i]] ?? l.note,
      y: 26 + i * 60,
      h: 46,
      color: layerColor(i),
    }));
    return { tree, edges, stations, metrics, bands, counter: { x: W - P, y: 10 } };
  }

  // Desktop: tree left, metrics column right.
  const chartR = W - Math.min(260, W * 0.26) - 30;
  const tree: Layout['tree'] = [
    { label: localizedNode('CEO', T), x: chartR / 2 - 46, y: 22, w: 92, h: 24 },
    { label: localizedNode('VP', T), x: chartR / 4 - 56, y: 74, w: 84, h: 22 },
    { label: localizedNode('VP', T), x: (chartR * 3) / 4 - 40, y: 74, w: 84, h: 22 },
    { label: localizedNode('DIRECTOR', T), x: chartR / 8 - 46, y: 128, w: 92, h: 22 },
    { label: localizedNode('DIRECTOR', T), x: chartR / 2 - 46, y: 128, w: 92, h: 22 },
    { label: localizedNode('DIRECTOR', T), x: (chartR * 7) / 8 - 46, y: 128, w: 92, h: 22 },
    { label: localizedNode('MANAGER', T), x: chartR / 8 - 44, y: 182, w: 88, h: 22 },
    { label: localizedNode('MANAGER', T), x: chartR / 2 - 44, y: 182, w: 88, h: 22 },
    { label: localizedNode('MANAGER', T), x: (chartR * 7) / 8 - 44, y: 182, w: 88, h: 22 },
  ];
  const edges: [Pt, Pt][] = [
    [0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [2, 5], [3, 6], [4, 7], [5, 8],
  ].map(([a, b]) => [
    { x: tree[a].x + tree[a].w / 2, y: tree[a].y + tree[a].h },
    { x: tree[b].x + tree[b].w / 2, y: tree[b].y },
  ]) as [Pt, Pt][];

  // Hop stations: an arc across the chart, employee (bottom-left) → action (bottom-right).
  const stX = (f: number) => 30 + f * (chartR - 60);
  const stations = SIGNAL_HOPS.map((h, i) => {
    const fr = [0.04, 0.16, 0.32, 0.5, 0.68, 0.84, 0.96][i];
    const yTop = [258, 214, 236, 208, 214, 172, 258][i];
    const w = Math.max(74, Math.min(120, chartR / 8));
    return { label: localizedNode(h.node, T), x: Math.min(stX(fr), chartR - w - 4), y: yTop, w };
  });

  const mx = chartR + 26;
  const mw = W - mx - P;
  const metrics = FRICTION_METRICS.map((m, i) => ({
    label: localizedMetricLabel(m.label, T),
    value: localizedMetricValue(m.label, m.value, T),
    x: mx,
    y: 24 + i * 42,
  }));
  void mw;

  const bandTop = 26;
  const bandH = Math.min(64, (H - 64) / 5 - 10);
  const bands = TOPOLOGY_LAYERS.map((l, i) => ({
    label: T[BAND_KEYS[i]] ?? l.label,
    note: T[BAND_NOTE_KEYS[i]] ?? l.note,
    y: bandTop + i * (bandH + 12),
    h: bandH,
    color: layerColor(i),
  }));
  return { tree, edges, stations, metrics, bands, counter: { x: W - P, y: 12 } };
}

function layerColor(i: number): string {
  return [C.warn, C.path, C.nodeText, C.ok, C.muted][i] ?? C.muted;
}

function drawScene(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  s: SceneState,
  _cycle: number,
  T: SimT
) {
  const L = buildLayout(W, H, s.mobile, T);

  // Global fade envelope for traditional vs native content.
  const fadeIn = easeInOut(s.phase === 0 ? s.t * 1.6 : 1);
  const tradAlpha =
    s.phase === 0 ? mix(fadeIn) : s.phase === 1 ? 1 : s.phase === 2 ? mix(1 - easeInOut(s.t)) : 0;
  const nativeAlpha =
    s.phase === 2 ? mix(easeInOut(s.t)) : s.phase === 3 || s.phase === 4 ? 1 : 0;

  /* ---- traditional layer ---- */
  if (tradAlpha > 0.01) {
    ctx.globalAlpha = tradAlpha;

    // tree edges
    ctx.strokeStyle = C.edge;
    ctx.lineWidth = 1;
    for (const [a, b] of L.edges) {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(a.x, (a.y + b.y) / 2);
      ctx.lineTo(b.x, (a.y + b.y) / 2);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    // tree nodes
    for (const n of L.tree) {
      ctx.fillStyle = C.nodeFill;
      ctx.strokeStyle = C.nodeBorder;
      roundRect(ctx, n, 6);
      ctx.fill();
      ctx.stroke();
      drawLabel(ctx, n.label, n.x + n.w / 2, n.y + n.h / 2 + 1, C.nodeText, 10.5);
    }

    // hop stations + route polyline
    const route: Pt[] = L.stations.map((st) => ({ x: st.x + st.w / 2, y: st.y + 11 }));
    ctx.setLineDash([3, 5]);
    ctx.strokeStyle = C.edgeSoft;
    ctx.beginPath();
    route.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.stroke();
    ctx.setLineDash([]);

    // station reveal: during phase 1 stations light up as the dot arrives
    const hopProgress = s.phase === 1 ? s.t * (SIGNAL_HOPS.length - 1) : s.phase >= 2 ? SIGNAL_HOPS.length - 1 : -1;
    L.stations.forEach((st, i) => {
      const arrived = hopProgress >= i - 1e-6;
      const active = s.phase === 1 && Math.floor(hopProgress) === i;
      ctx.fillStyle = active ? 'rgba(138,180,248,0.14)' : C.nodeFill;
      ctx.strokeStyle = active ? C.path : arrived ? 'rgba(240,168,104,0.55)' : C.nodeBorder;
      roundRect(ctx, { x: st.x, y: st.y, w: st.w, h: 22 }, 5);
      ctx.fill();
      ctx.stroke();
      drawLabel(ctx, st.label, st.x + st.w / 2, st.y + 11, arrived ? C.nodeText : C.muted, 10);

      // latency chip after arrival
      const hop = SIGNAL_HOPS[i];
      if (hop.latency && arrived && s.phase >= 1) {
        const chipW = ctx.measureText(hop.latency).width + 14;
        ctx.fillStyle = 'rgba(240,168,104,0.10)';
        ctx.strokeStyle = 'rgba(240,168,104,0.4)';
        roundRect(ctx, { x: st.x + st.w / 2 - chipW / 2, y: st.y - 17, w: chipW, h: 14 }, 4);
        ctx.fill();
        ctx.stroke();
        drawLabel(ctx, hop.latency, st.x + st.w / 2, st.y - 10, C.warn, 9);
      }
    });

    // traveling dot during SIGNAL
    if (s.phase === 1) {
      const p = dotOnRoute(route, hopProgress);
      ctx.fillStyle = C.path;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      // cumulative counter
      const totalDays = cumulativeDays(hopProgress);
      drawLabel(ctx, T.ot_latency_accumulated.replace('{n}', totalDays.toFixed(1)), L.counter.x, L.counter.y, C.warn, 10, 'right');
    } else if (tradAlpha > 0.5) {
      drawLabel(ctx, T.ot_latency_accumulated.replace('{n}', '4.2'), L.counter.x, L.counter.y, C.warn, 10, 'right');
    }

    // friction metrics
    const showMetrics = s.phase === 0 ? easeInOut(clamp01((s.t - 0.35) * 2.2)) : 1;
    if (showMetrics > 0.01) {
      ctx.globalAlpha = tradAlpha * showMetrics;
      for (const m of L.metrics) {
        ctx.fillStyle = 'rgba(29, 26, 22, 0.045)';
        ctx.strokeStyle = C.edge;
        roundRect(ctx, { x: m.x, y: m.y, w: W - m.x - 18, h: s.mobile ? 22 : 30 }, 6);
        ctx.fill();
        ctx.stroke();
        if (s.mobile) {
          drawLabel(ctx, `${m.label} ${m.value}`, m.x + (W - m.x - 18) / 2, m.y + 11, C.warn, 8.5);
        } else {
          drawLabel(ctx, m.label, m.x + 12, m.y + 10, C.muted, 8.5, 'left');
          drawLabel(ctx, m.value, m.x + 12, m.y + 21, C.warn, 11, 'left');
        }
      }
      ctx.globalAlpha = tradAlpha;
    }
    ctx.globalAlpha = 1;
  }

  /* ---- native layer ---- */
  if (nativeAlpha > 0.01) {
    ctx.globalAlpha = nativeAlpha;

    const fullW = s.mobile ? W - 36 : W - 36;
    for (const b of L.bands) {
      ctx.fillStyle = C.bandFill;
      ctx.strokeStyle = C.edge;
      roundRect(ctx, { x: 18, y: b.y, w: fullW, h: b.h }, 8);
      ctx.fill();
      ctx.stroke();
      // left accent
      ctx.fillStyle = b.color;
      ctx.globalAlpha = nativeAlpha * 0.85;
      roundRect(ctx, { x: 18, y: b.y, w: 3, h: b.h }, 2);
      ctx.fill();
      ctx.globalAlpha = nativeAlpha;
      drawLabel(ctx, b.label, s.mobile ? 30 : 34, b.y + b.h / 2 - (s.mobile ? 0 : 1), C.text, s.mobile ? 10 : 12, 'left');
      if (!s.mobile) {
        drawLabel(ctx, b.note, 34 + 320, b.y + b.h / 2 - 1, C.muted, 9.5, 'left');
      }
    }

    // fast signal: EVENT → agent band → brain → control plane → agent → ACTION
    if (s.phase === 3) {
      const brain = L.bands[3];
      const ctrl = L.bands[1];
      const workers = L.bands[2];
      const wpts: Pt[] = [
        { x: 26, y: workers.y + workers.h / 2 },
        { x: fullW * 0.3, y: brain.y + brain.h / 2 },
        { x: fullW * 0.55, y: ctrl.y + ctrl.h / 2 },
        { x: fullW * 0.78, y: workers.y + workers.h / 2 },
        { x: 18 + fullW - 10, y: workers.y + workers.h / 2 },
      ];
      const pr = easeInOut(s.t);
      const p = dotOnRoute(wpts, pr * (wpts.length - 1));
      ctx.strokeStyle = 'rgba(138,180,248,0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      wpts.forEach((q, i) => (i === 0 ? ctx.moveTo(q.x, q.y) : ctx.lineTo(q.x, q.y)));
      ctx.stroke();
      ctx.fillStyle = C.path;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      // brain pulse
      const pulse = 0.5 + 0.5 * Math.sin(s.elapsed / 260);
      ctx.strokeStyle = `rgba(124,217,183,${0.25 + 0.45 * pulse})`;
      roundRect(ctx, { x: 18, y: brain.y, w: fullW, h: brain.h }, 8);
      ctx.stroke();
      if (s.t > 0.85) {
        drawLabel(ctx, T.ot_latency_native, L.counter.x, L.counter.y, C.ok, 10, 'right');
      }
    }
    if (s.phase === 4) {
      drawLabel(ctx, T.ot_latency_native, L.counter.x, L.counter.y, C.ok, 10, 'right');
    }
    ctx.globalAlpha = 1;
  }

  /* ---- reveal text ---- */
  if (s.phase === 4) {
    const a = easeInOut(clamp01((s.t - 0.15) * 2));
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(10,11,13,0.72)';
    ctx.fillRect(0, 0, W, H);
    ctx.font = `600 ${Math.min(26, W / 22)}px Inter, system-ui, sans-serif`;
    ctx.fillStyle = C.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lines = splitLines(T.ot_reveal, W * 0.86);
    lines.forEach((ln, i) => ctx.fillText(ln, W / 2, H / 2 - (lines.length - 1) * 14 + i * 28));
    ctx.globalAlpha = 1;
  }
}

function splitLines(text: string, maxWidth: number): string[] {
  const approx = Math.max(14, Math.floor(maxWidth / 11));
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > approx) {
      lines.push(cur.trim());
      cur = w;
    } else {
      cur += ` ${w}`;
    }
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines;
}

function dotOnRoute(route: Pt[], progress: number): Pt {
  const i = Math.max(0, Math.min(route.length - 1 - 1e-9, progress));
  const i0 = Math.floor(i);
  const i1 = Math.min(route.length - 1, i0 + 1);
  const f = i - i0;
  return { x: lerp(route[i0].x, route[i1].x, easeInOut(f)), y: lerp(route[i0].y, route[i1].y, easeInOut(f)) };
}

/** Cumulative days from hop progress, hitting 4.2 at the end. */
function cumulativeDays(hopProgress: number): number {
  const hops = SIGNAL_HOPS.map((h) => parseFloat(h.latency?.replace('+', '').replace('d', '')) || 0);
  const total = hops.reduce((a, b) => a + b, 0);
  const i = Math.max(0, Math.min(hops.length - 1, hopProgress));
  let acc = 0;
  for (let k = 0; k <= Math.floor(i); k++) acc += hops[k];
  acc -= (Math.floor(i) - i) * hops[Math.floor(i)];
  return acc * (4.2 / total);
}
