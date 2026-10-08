'use client';
/**
 * THE CONVERGENCE — scene widgets. Small, self-contained, deterministic.
 * Every animation answers "what changed at this stage?"
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { EvidenceKind, Experiment, Verdict } from '@/content/journey';

/* ---------- shared ---------- */

export function useInView<T extends HTMLElement>(threshold = 0.35) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.target === el && setInView(e.isIntersecting)),
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export function Badge({ kind }: { kind: EvidenceKind }) {
  return <span className={`jv-badge b-${kind.toLowerCase().replace(/[^a-z]+/g, '-')}`}>{kind}</span>;
}

export function VerdictStamp({ v }: { v: Verdict }) {
  const tone =
    v === 'PROVED' || v === 'PROMOTED'
      ? 'ok'
      : v === 'ABSTAINED' || v === 'PARTIALLY PROVED' || v === 'MAJOR LEARNING' || v === 'NO FORCED PROMOTION'
        ? 'mid'
        : v === 'UNPROVEN' || v === 'DO NOT PROMOTE'
          ? 'warn'
          : 'bad';
  return <span className={`jv-verdict v-${tone}`}>{v}</span>;
}

export function LedgerCard({ x }: { x: Experiment }) {
  return (
    <div className="jv-ledger">
      <div className="jv-ledger-head">
        <span className="jv-ledger-gen">{x.generation}</span>
        <VerdictStamp v={x.verdict} />
      </div>
      <div className="jv-ledger-proj">{x.project}</div>
      {([
        ['HYPOTHESIS', x.hypothesis],
        ['WHAT WE BUILT', x.built],
        ['WHAT REALITY SAID', x.reality],
        ['WHAT CHANGED NEXT', x.next],
      ] as const).map(([k, v]) => (
        <p key={k} className="jv-ledger-row">
          <span className="jv-ledger-k">{k}</span>
          <span>{v}</span>
        </p>
      ))}
      <div className="jv-ledger-badges">{x.badges.map((b) => <Badge key={b} kind={b} />)}</div>
    </div>
  );
}

function RunButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="jv-run" onClick={onClick}>
      ▶ {label}
    </button>
  );
}

/* ---------- Scene 01: production flow ---------- */

export function TechFlow({ stages }: { stages: { k: string; note: string }[] }) {
  const [active, setActive] = useState(0);
  return (
    <div className="jv-flow">
      <div className="jv-flow-stages">
        {stages.map((s, i) => (
          <button
            key={s.k}
            type="button"
            className={`jv-flow-stage ${i === active ? 'on' : ''} ${i < active ? 'done' : ''}`}
            onClick={() => setActive(i)}
          >
            {s.k}
          </button>
        ))}
      </div>
      <p className="jv-flow-note" aria-live="polite">
        {stages[active].note}
      </p>
    </div>
  );
}

/* ---------- Scene 03: org topology ---------- */

export function OrgTopology({ nodes }: { nodes: readonly string[] }) {
  const [reorganized, setReorganized] = useState(false);
  return (
    <div className="jv-org">
      <div className={`jv-org-grid ${reorganized ? 'flow' : ''}`} data-n={nodes.length}>
        {nodes.map((n, i) => (
          <div key={n} className="jv-org-node" style={{ '--i': i } as React.CSSProperties}>
            <span className="jv-org-dot" />
            {n}
          </div>
        ))}
        <svg className="jv-org-svg" viewBox="0 0 300 150" aria-hidden="true">
          <path className="jv-org-path" d="M30,75 C90,75 90,35 150,35 C210,35 210,75 270,75" />
        </svg>
      </div>
      <RunButton label={reorganized ? 'DISCONNECT AGAIN' : 'REORGANIZE INTO A FLOW'} onClick={() => setReorganized((v) => !v)} />
      <p className="jv-org-note">
        {reorganized
          ? 'A working flow: ownership, feedback loops, decisions moving end to end.'
          : 'Four functions. No shared flow. Work queues at every border.'}
      </p>
    </div>
  );
}

/* ---------- Scene 04: market network ---------- */

const MARKET_EDGES: [number, number][] = [
  [0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 6], [5, 6], [6, 7], [7, 8],
  [8, 9], [9, 2], [4, 10], [10, 9], [5, 10], [0, 6], [1, 10], [3, 8],
];

export function MarketNetwork({ domains }: { domains: string[] }) {
  const [hot, setHot] = useState<number | null>(null);
  const pts = domains.map((_, i) => {
    const cols = 4;
    const col = i % cols;
    const row = Math.floor(i / cols);
    return { x: 60 + col * 130, y: 60 + row * 120 };
  });
  const isHot = (i: number) => hot !== null && MARKET_EDGES.some(([a, b]) => (a === hot && b === i) || (b === hot && a === i));
  return (
    <div className="jv-net">
      <svg viewBox="0 0 520 400" role="img" aria-label="Marketplace operating network — every domain connects">
        {MARKET_EDGES.map(([a, b], i) => (
          <line
            key={i}
            x1={pts[a].x} y1={pts[a].y} x2={pts[b].x} y2={pts[b].y}
            className={`jv-net-edge ${hot !== null && (a === hot || b === hot) ? 'hot' : ''}`}
          />
        ))}
        {domains.map((d, i) => (
          <g
            key={d}
            className={`jv-net-node ${hot === i ? 'on' : ''} ${isHot(i) ? 'near' : ''}`}
            transform={`translate(${pts[i].x},${pts[i].y})`}
            onClick={() => setHot(hot === i ? null : i)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setHot(hot === i ? null : i)}
            tabIndex={0}
            role="button"
            aria-label={`${d} — show connected domains`}
          >
            <circle r="9" />
            <text y="-16" textAnchor="middle">{d}</text>
          </g>
        ))}
      </svg>
      <p className="jv-net-note">{hot === null ? 'Tap a domain — watch the decision propagate.' : `${domains[hot]} moves; the system responds.`}</p>
    </div>
  );
}

/* ---------- Scene 05A: audit counters ---------- */

export function AuditCounters({ items }: { items: { k: string; v: string }[] }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  return (
    <div ref={ref} className="jv-audit">
      {items.map((it, i) => (
        <div
          key={it.k}
          className={`jv-audit-row ${inView ? 'in' : ''}`}
          style={{ transitionDelay: `${inView ? i * 160 : 0}ms` }}
        >
          <span className="jv-audit-k">{it.k}</span>
          <span className="jv-audit-v">{it.v}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- Scene 05B: pooling bars ---------- */

export function PoolingBars({ a, b, line }: { a: string; b: string; line: string }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  return (
    <div ref={ref} className="jv-pool">
      <div className="jv-pool-row">
        <span className="jv-pool-k">{a}</span>
        <div className="jv-pool-bar"><i style={{ width: inView ? '100%' : '0%' }} /></div>
      </div>
      <div className="jv-pool-row">
        <span className="jv-pool-k">{b}</span>
        <div className="jv-pool-bar"><i style={{ width: inView ? '98.7%' : '0%' }} /></div>
      </div>
      <p className="jv-pool-line">{line}</p>
    </div>
  );
}

/* ---------- Scene 05C: abstain moment ---------- */

export function AbstainMoment({ n = 5 }: { n?: number }) {
  const [state, setState] = useState<'idle' | 'run' | 'done'>('idle');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const run = useCallback(() => {
    timers.current.forEach(clearTimeout);
    setState('run');
    timers.current = [setTimeout(() => setState('done'), 220 * n + 500)];
  }, [n]);
  return (
    <div className="jv-abstain">
      <div className="jv-cands">
        {Array.from({ length: n }, (_, i) => (
          <span
            key={i}
            className="jv-cand"
            style={{ transitionDelay: `${i * 220}ms` }}
            data-stamp={state === 'done' ? 'ABSTAIN' : ''}
          >
            CANDIDATE {String(i + 1).padStart(2, '0')}
          </span>
        ))}
      </div>
      <RunButton label="RUN LIVE CANDIDATES" onClick={run} />
      <p className="jv-abstain-note" aria-live="polite">
        {state === 'idle' && 'Live candidates arrive. The calibrated gate decides.'}
        {state === 'run' && 'Evaluating… calibrated confidence below the VON 0.60 gate.'}
        {state === 'done' && 'The system refused to manufacture confidence. That is the behavior working.'}
      </p>
    </div>
  );
}

/* ---------- Scene 05D: discipline chains ---------- */

export function ChainRow({ items, tone }: { items: readonly string[]; tone: 'early' | 'late' }) {
  return (
    <div className={`jv-chain jv-chain-${tone}`} data-len={items.length}>
      {items.map((it, i) => (
        <span key={it} className="jv-chain-chip" style={{ '--i': i } as React.CSSProperties}>{it}</span>
      ))}
    </div>
  );
}

/* ---------- Scene 05E: generation scrubber ---------- */

export function GenerationScrubber({ experiments }: { experiments: Experiment[] }) {
  const [i, setI] = useState(0);
  return (
    <div className="jv-scrub">
      <div className="jv-scrub-tabs" role="tablist" aria-label="Experiment generations">
        {experiments.map((x, k) => (
          <button
            key={x.id}
            role="tab"
            aria-selected={k === i}
            type="button"
            className={`jv-scrub-tab ${k === i ? 'on' : ''}`}
            onClick={() => setI(k)}
          >
            {x.project.split('—')[0].trim()}
          </button>
        ))}
      </div>
      <LedgerCard x={experiments[i]} />
    </div>
  );
}

/* ---------- Scene 05F: gate run ---------- */

export function GateRun({ stages }: { stages: readonly string[] }) {
  const [pos, setPos] = useState(-1); // -1 idle, else stage index reached; execution blocked at ECONOMICS (idx 2)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const run = useCallback(() => {
    timers.current.forEach(clearTimeout);
    setPos(0);
    for (let s = 1; s <= 2; s++) {
      timers.current.push(setTimeout(() => setPos(s), 650 * s));
    }
    timers.current.push(setTimeout(() => setPos(3), 650 * 2 + 900)); // stopped marker on ECONOMICS
  }, []);
  const blocked = pos === 3;
  return (
    <div className="jv-gate">
      <div className="jv-gate-stages">
        {stages.map((s, i) => (
          <div
            key={s}
            className={`jv-gate-stage ${pos > i || (pos >= i && i < 2 && pos >= 2) ? 'passed' : ''} ${pos === i && i < 2 ? 'at' : ''} ${blocked && i === 2 ? 'blocked' : ''}`}
          >
            {s}
            {blocked && i === 2 && <span className="jv-gate-x">✖ STOP</span>}
          </div>
        ))}
      </div>
      <RunButton label="SEND A SIGNAL" onClick={run} />
      <p className="jv-gate-note" aria-live="polite">
        {blocked
          ? 'A technically valid signal stopped at the economic gate. Execution never happened. By design.'
          : 'Every signal must pass verification, economics, risk and authority before anything moves.'}
      </p>
    </div>
  );
}

/* ---------- Scene 05F: claims ladder ---------- */

export function ClaimsLadder({ claims }: { claims: readonly { claim: string; state: boolean }[] }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  return (
    <div ref={ref} className="jv-ladder">
      {claims.map((c, i) => (
        <div key={c.claim} className={`jv-ladder-row ${inView ? 'in' : ''}`} style={{ transitionDelay: `${inView ? 300 + i * 260 : 0}ms` }}>
          <span className={`jv-ladder-mark ${c.state ? 't' : 'f'}`}>{c.state ? '✓ PROVED' : '✗ NOT PROVED'}</span>
          <span className="jv-ladder-claim">{c.claim}</span>
        </div>
      ))}
      <p className="jv-ladder-note">They are not the same claim. Phoenix proved the first two — and only the first two.</p>
    </div>
  );
}

/* ---------- Scene 06: route failover ---------- */

export function RouteFailover({ providers }: { providers: readonly string[] }) {
  const [phase, setPhase] = useState(0); // 0 idle · 1 to B · 2 fail · 3 rerouted
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const run = useCallback(() => {
    timers.current.forEach(clearTimeout);
    setPhase(1);
    timers.current.push(setTimeout(() => setPhase(2), 1100));
    timers.current.push(setTimeout(() => setPhase(3), 2000));
  }, []);
  const y = (i: number) => 36 + i * 34;
  return (
    <div className="jv-route">
      <svg viewBox="0 0 560 250" role="img" aria-label="A request reroutes when a provider fails">
        <text x="16" y="24" className="jv-route-l">REQUEST</text>
        <circle cx="30" cy="130" r="8" className={`jv-route-dot ${phase === 1 ? 'to-b' : phase === 3 ? 'to-d' : ''}`} />
        <path id="jvpb" d="M42,130 C160,130 170,36 250,36" className={`jv-route-path ${phase >= 1 ? 'on' : ''} ${phase >= 2 ? 'fail' : ''}`} fill="none" />
        <path id="jvpd" d="M42,130 C170,130 190,172 260,172" className={`jv-route-path ${phase === 3 ? 'on' : ''}`} fill="none" />
        {providers.map((p, i) => (
          <g key={p} transform={`translate(290,${y(i)})`} className={`jv-route-prov ${phase === 2 && i === 1 ? 'down' : ''} ${phase === 3 && i === 3 ? 'up' : ''}`}>
            <rect x="0" y="-13" width="180" height="26" rx="6" />
            <text x="14" y="4">{p}</text>
            {phase === 2 && i === 1 && <text x="150" y="4" className="jv-route-err">✖ 500</text>}
            {phase === 3 && i === 3 && <text x="132" y="4" className="jv-route-ok">✓ 200</text>}
          </g>
        ))}
      </svg>
      <RunButton label="SEND REQUEST" onClick={run} />
      <p className="jv-route-note" aria-live="polite">
        {phase === 2 && 'Provider failed. Cooldown starts; Wilson score drops.'}
        {phase === 3
          ? 'Rerouted within the bounded-fallback budget. The caller never noticed.'
          : phase < 2
            ? 'The router ranks providers by learned reliability, not by config.'
            : ''}
      </p>
    </div>
  );
}

/* ---------- Scene 07: lifecycle ring ---------- */

export function LifecycleRing({ stages }: { stages: readonly string[] }) {
  const [failAt, setFailAt] = useState<number | null>(null); // stage index 2 = IMPLEMENT
  const [mode, setMode] = useState<'idle' | 'normal' | 'failing' | 'recovered'>('idle');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const step = (fail: boolean) => {
    timers.current.forEach(clearTimeout);
    setFailAt(fail ? 2 : null);
    setMode(fail ? 'failing' : 'normal');
    if (fail) {
      timers.current.push(setTimeout(() => setMode('recovered'), 1600));
    }
  };
  const stageState = (i: number) => {
    if (mode === 'idle') return '';
    if (mode === 'normal') return 'done';
    if (mode === 'failing') return i < 2 ? 'done' : i === 2 ? 'fail' : '';
    return i === 2 || i === 3 ? 'fixed' : 'done';
  };
  const n = stages.length;
  const pos = (i: number) => {
    const a = (-90 + (360 / n) * i) * (Math.PI / 180);
    return { x: 160 + Math.cos(a) * 108, y: 160 + Math.sin(a) * 108 };
  };
  return (
    <div className="jv-ring">
      <svg viewBox="0 0 320 320" role="img" aria-label="Agent lifecycle: inspect, plan, implement, verify, classify, recover, test, generalize">
        <circle cx="160" cy="160" r="108" className="jv-ring-track" />
        {stages.map((s, i) => {
          const p = pos(i);
          return (
            <g key={s} transform={`translate(${p.x},${p.y})`} className={`jv-ring-stage ${stageState(i)}`}>
              <circle r="21" />
              <text y="4" textAnchor="middle">{i + 1}</text>
              <text y="40" textAnchor="middle" className="jv-ring-lbl">{s}</text>
            </g>
          );
        })}
        <text x="160" y="152" textAnchor="middle" className="jv-ring-core">
          {mode === 'failing' ? 'CLASSIFY: CONTEXT_ERROR' : mode === 'recovered' ? 'RECOVERED → RE-VERIFY' : 'KERNEL'}
        </text>
        <text x="160" y="176" textAnchor="middle" className="jv-ring-core2">
          {mode === 'failing' ? 'bounded retry · checkpoint restored' : mode === 'recovered' ? 'flow re-enters at VERIFY' : '9-stage lifecycle'}
        </text>
      </svg>
      <div className="jv-ring-btns">
        <RunButton label="RUN MISSION" onClick={() => step(false)} />
        <button type="button" className="jv-run jv-run-fail" onClick={() => step(true)}>
          ⚡ FAIL
        </button>
      </div>
    </div>
  );
}

/* ---------- Scene 09: memory loop ---------- */

export function MemoryLoop({ loop }: { loop: readonly string[] }) {
  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const run = useCallback(() => {
    timers.current.forEach(clearTimeout);
    setPhase(1);
    timers.current.push(setTimeout(() => setPhase(2), 3600));
  }, []);
  const ctxFill = phase === 0 ? 12 : phase === 1 ? 34 : 88;
  return (
    <div className="jv-mem">
      <div className="jv-mem-tasks">
        <div className={`jv-mem-task ${phase >= 1 ? 'done' : phase === 0 ? 'on' : ''}`}>
          <span className="jv-mem-t">TASK 1</span>
          <div className="jv-mem-ctx"><i style={{ width: `${phase === 0 ? 12 : 34}%` }} /></div>
          <span className="jv-mem-ctx-k">CONTEXT</span>
        </div>
        <div className={`jv-mem-task ${phase === 2 ? 'on' : ''}`}>
          <span className="jv-mem-t">TASK 2</span>
          <div className="jv-mem-ctx"><i style={{ width: `${ctxFill}%`, transitionDelay: phase === 2 ? '200ms' : '0ms' }} /></div>
          <span className="jv-mem-ctx-k">CONTEXT</span>
        </div>
      </div>
      <div className={`jv-mem-loop ${phase >= 1 ? 'on' : ''}`}>
        {loop.map((s, i) => (
          <span key={s} className="jv-mem-step" style={{ transitionDelay: `${i * 380}ms` }}>{s}</span>
        ))}
      </div>
      <RunButton label="RUN THE WORK" onClick={run} />
      <p className="jv-mem-note" aria-live="polite">
        {phase === 2 ? 'Task 2 begins with more context than Task 1. The work taught the system something it now reuses.' : 'The same loop, governed: every write carries provenance; insufficient evidence abstains.'}
      </p>
    </div>
  );
}

/* ---------- Scene 09: split brain ---------- */

export function SplitBrain({ left, right, resolve }: { left: string; right: string; resolve: string }) {
  const [state, setState] = useState<0 | 1 | 2>(0);
  return (
    <div className="jv-split">
      <div className={`jv-split-boxes ${state >= 1 ? 'diverge' : ''} ${state === 2 ? 'resolve' : ''}`}>
        <div className="jv-split-box a">{left}</div>
        <div className="jv-split-neq">≠</div>
        <div className="jv-split-box b">{right}</div>
      </div>
      <RunButton label={state === 2 ? 'DIVERGE AGAIN' : state === 0 ? 'SYNC' : 'GOVERN'} onClick={() => setState(((state + 1) % 3) as 0 | 1 | 2)} />
      <p className="jv-split-note" aria-live="polite">
        {state === 0 && 'Two stores, one truth — until they drift.'}
        {state === 1 && 'Divergence: the local snapshot and the runtime memory disagree. Which is authoritative?'}
        {state === 2 && resolve}
      </p>
    </div>
  );
}

/* ---------- Scene 10: convergence stack ---------- */

export function ConvergenceStack({
  tracks,
  stack,
}: {
  tracks: readonly string[];
  stack: readonly { k: string; v: string }[];
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  return (
    <div ref={ref} className={`jv-conv ${inView ? 'in' : ''}`}>
      <div className="jv-conv-tracks">
        {tracks.map((t, i) => (
          <div key={t} className="jv-conv-track" style={{ transitionDelay: `${i * 120}ms` }}>
            <span className="jv-conv-tline" />
            {t}
          </div>
        ))}
        <div className="jv-conv-node" style={{ transitionDelay: `${tracks.length * 120}ms` }}>CONVERGENCE</div>
      </div>
      <div className="jv-conv-stack">
        {stack.map((s, i) => (
          <div key={s.k} className="jv-conv-layer" style={{ transitionDelay: `${400 + i * 140}ms` }}>
            <span className="jv-conv-lk">{s.k}</span>
            <span className="jv-conv-lv">{s.v}</span>
          </div>
        ))}
        <div className="jv-conv-q" style={{ transitionDelay: `${400 + stack.length * 140}ms` }}>QUANTIVIQ</div>
      </div>
    </div>
  );
}
