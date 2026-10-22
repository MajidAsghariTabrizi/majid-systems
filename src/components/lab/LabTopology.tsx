'use client';

/**
 * LabTopology — interactive system topology over the sanitized snapshot.
 * Ported from the observatory's LivingBrain and upgraded for the public lab:
 * zoom (wheel), pan (drag), reset, keyboard-accessible nodes, localized
 * labels and descriptions, component status from snapshot units.
 * Edges are verified information flow (see LAB_SYSTEM_DISCOVERY.md).
 */

import { useMemo, useRef, useState } from 'react';

import type { LabSnapshot, ExpertLineage } from '@/content/lab/types';
import { EXPERTS } from '@/content/lab/types';
import { labDict, type LabLocale } from '@/content/lab';
import { LabPanel, LabChip } from './bits';

type NodeCls =
  | 'source' | 'feature' | 'state' | 'expert' | 'route' | 'fuse' | 'gate'
  | 'act' | 'ledger' | 'learn';

interface TNode {
  id: string;
  cls: NodeCls;
  x: number;
  y: number;
  lineage?: ExpertLineage;
  live?: number;
  freshnessMin?: number;
  label: string;
  detail: string;
  unit?: string; // public unit id for status
}

const CLS_COLOR: Record<NodeCls, string> = {
  source: 'var(--path)',
  feature: 'var(--ok)',
  state: 'var(--warn)',
  expert: 'var(--ok)',
  route: 'var(--path)',
  fuse: 'var(--path)',
  gate: 'var(--warn)',
  act: 'var(--ok)',
  ledger: 'var(--unknown)',
  learn: 'var(--path)',
};
const LINEAGE_RING: Record<ExpertLineage, string> = {
  huber: 'var(--ok)',
  mfe: 'var(--path)',
  spread: 'var(--warn)',
  nomodel: 'var(--superseded)',
};

export function LabTopology({ snap, locale, live }: { snap: LabSnapshot; locale: LabLocale; live: boolean }) {
  const t = labDict(locale);
  const [sel, setSel] = useState<string | null>(null);
  const [view, setView] = useState({ k: 1, x: 0, y: 0 });
  const dragRef = useRef<{ px: number; py: number; moved: boolean } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const latest = snap.decisions_rich[snap.decisions_rich.length - 1];
  const compactNow = snap.decisions_compact[snap.decisions_compact.length - 1];
  const lastCandle = snap.market_closes_5m[snap.market_closes_5m.length - 1];
  const genMs = Date.parse(snap.meta.generated_at.replace(/([+-]\d{2}:\d{2}|Z)$/, 'Z')) || Date.now();

  const nodes = useMemo<TNode[]>(() => {
    const eOut = (latest?.expert_outputs ?? {}) as Record<string, Record<string, unknown>>;
    const expertNode = (e: (typeof EXPERTS)[number], i: number): TNode => {
      const o = eOut[e.id] ?? eOut[`EXPERT_${e.id.toUpperCase()}`] ?? {};
      const p = typeof o.p_up === 'number' ? o.p_up : typeof o.p === 'number' ? o.p : null;
      const labels = t.labels.experts[e.id as keyof typeof t.labels.experts];
      return {
        id: `expert:${e.id}`,
        cls: 'expert',
        lineage: e.lineage,
        x: 420,
        y: 60 + i * 66,
        live: p !== null ? Math.abs(p - 0.5) * 2 : 0,
        freshnessMin: compactNow ? (genMs / 1000 - compactNow[0]) / 60 : undefined,
        label: labels?.name ?? e.id,
        detail: `${labels?.role ?? ''} (lineage: ${e.lineage})`,
      };
    };
    const tn = t.topology.nodes;
    return [
      { id: 'market', cls: 'source', x: 60, y: 210, live: 1, unit: 'market-data',
        freshnessMin: lastCandle ? (genMs / 1000 - lastCandle[0]) / 60 : undefined,
        label: tn['market-data'].label, detail: tn['market-data'].detail },
      { id: 'features', cls: 'feature', x: 200, y: 150, live: 0.8, label: tn.features.label, detail: tn.features.detail,
        freshnessMin: compactNow ? (genMs / 1000 - compactNow[0]) / 60 : undefined },
      { id: 'state', cls: 'state', x: 200, y: 290, live: 0.7, label: tn.state.label, detail: tn.state.detail },
      ...EXPERTS.map(expertNode),
      { id: 'router', cls: 'route', x: 580, y: 285, live: 0.5, label: tn.router.label, detail: tn.router.detail },
      { id: 'fusion', cls: 'fuse', x: 710, y: 285, live: 0.9, label: tn.fusion.label, detail: tn.fusion.detail },
      { id: 'uncertainty', cls: 'gate', x: 830, y: 190, live: 1, label: tn.uncertainty.label, detail: tn.uncertainty.detail },
      { id: 'policy', cls: 'gate', x: 830, y: 380, live: 0.9, unit: 'decision-engine', label: tn.policy.label, detail: tn.policy.detail },
      { id: 'decision', cls: 'act', x: 970, y: 285, live: 0.8, label: tn.ledger.label, detail: tn.ledger.detail },
      { id: 'outcome', cls: 'ledger', x: 970, y: 445, live: 0.6, label: tn.outcomes.label, detail: tn.outcomes.detail },
      { id: 'attribution', cls: 'ledger', x: 830, y: 545, live: 0.5, label: tn.attribution.label, detail: tn.attribution.detail },
      { id: 'learning', cls: 'learn', x: 620, y: 545, live: 0.6, unit: 'brain-mind-cycle', label: tn.learning.label, detail: tn.learning.detail },
      { id: 'experiments', cls: 'learn', x: 420, y: 620, live: 0.4, label: tn.experiments.label, detail: tn.experiments.detail },
    ];
  }, [snap, latest, compactNow, lastCandle, genMs, t]);

  const edges: [string, string, boolean][] = useMemo(
    () => [
      ['market', 'features', true], ['market', 'state', true],
      ...EXPERTS.map((e) => ['features', `expert:${e.id}`, true] as [string, string, boolean]),
      ...EXPERTS.map((e) => ['state', `expert:${e.id}`, false] as [string, string, boolean]),
      ...EXPERTS.map((e) => [`expert:${e.id}`, 'router', true] as [string, string, boolean]),
      ['router', 'fusion', true], ['state', 'router', false],
      ['fusion', 'uncertainty', true], ['fusion', 'policy', true], ['uncertainty', 'policy', true],
      ['policy', 'decision', true], ['decision', 'outcome', true], ['outcome', 'attribution', true],
      ['attribution', 'learning', true], ['learning', 'experiments', true],
      ['experiments', 'expert:micro_direction', false],
    ],
    [],
  );

  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const selNode = sel ? byId.get(sel) : null;

  // view transform helpers ------------------------------------------------
  const onWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    setView((v) => {
      const k2 = Math.min(3, Math.max(0.55, v.k * (e.deltaY < 0 ? 1.12 : 0.89)));
      return { ...v, k: k2 };
    });
  };
  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    dragRef.current = { px: e.clientX, py: e.clientY, moved: false };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.px;
    const dy = e.clientY - d.py;
    if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
    dragRef.current = { px: e.clientX, py: e.clientY, moved: d.moved };
    setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  const unitEntries = Object.entries(snap.system.units ?? {});

  return (
    <section className="q-section" id="topology" aria-label={t.topology.h2}>
      <div className="container-wide">
        <div className="section-header">
          <div>
            <span className="eyebrow sig">{t.topology.eyebrow}</span>
            <h2 className="q-h2">{t.topology.h2}</h2>
          </div>
        </div>
        <p className="q-lede">{t.topology.lede}</p>

        <div className="lab-topo-grid">
          <div className="lab-panel lab-topo-panel">
            <div className="lab-topo-toolbar">
              <span className="lab-topo-hint">{t.topology.hint}</span>
              <span className="lab-topo-zoom">
                <button onClick={() => setView((v) => ({ ...v, k: Math.min(3, v.k * 1.2) }))} aria-label={t.topology.zoomIn}>+</button>
                <button onClick={() => setView((v) => ({ ...v, k: Math.max(0.55, v.k / 1.2) }))} aria-label={t.topology.zoomOut}>−</button>
                <button onClick={() => setView({ k: 1, x: 0, y: 0 })} aria-label={t.topology.reset}>⟲</button>
              </span>
            </div>
            <div className="lab-topo-canvas">
              <svg
                ref={svgRef}
                viewBox="0 0 1150 700"
                preserveAspectRatio="xMidYMid meet"
                role="img"
                aria-label={t.topology.h2}
                onWheel={onWheel}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
                style={{ touchAction: 'none' }}
              >
                <defs>
                  <radialGradient id="labNodeGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--ok)" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="var(--ok)" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <g transform={`translate(${view.x},${view.y}) scale(${view.k})`} style={{ transformOrigin: '575px 350px' }}>
                  {edges.map(([a, b, isLive], i) => {
                    const A = byId.get(a);
                    const B = byId.get(b);
                    if (!A || !B) return null;
                    const mx = (A.x + B.x) / 2;
                    const learning = b === 'learning' || b === 'experiments' || a === 'experiments';
                    const highlighted = sel === a || sel === b;
                    return (
                      <path
                        key={i}
                        d={`M ${A.x + 52} ${A.y} C ${mx} ${A.y}, ${mx} ${B.y}, ${B.x - 52} ${B.y}`}
                        fill="none"
                        stroke={learning ? 'rgba(138,180,248,.35)' : 'rgba(124,217,183,.25)'}
                        strokeWidth={highlighted ? 1.8 : isLive ? 1.1 : 0.7}
                        className={isLive && (A.live ?? 0) > 0.05 ? 'lab-flow-line' : undefined}
                        opacity={sel ? (highlighted ? 0.95 : 0.25) : 0.6}
                      />
                    );
                  })}
                  {nodes.map((n) => {
                    const active = sel === n.id;
                    const r = n.cls === 'expert' ? 15 : 20;
                    const col = CLS_COLOR[n.cls];
                    return (
                      <g
                        key={n.id}
                        transform={`translate(${n.x},${n.y})`}
                        tabIndex={0}
                        role="button"
                        aria-label={`${n.label}`}
                        className="lab-topo-node"
                        onClick={() => {
                          if (dragRef.current?.moved) return;
                          setSel(active ? null : n.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSel(active ? null : n.id);
                          }
                        }}
                      >
                        {(n.live ?? 0) > 0.15 && (
                          <circle r={r * 2.1} fill="url(#labNodeGlow)" opacity={Math.min(1, (n.live ?? 0) + 0.2)} />
                        )}
                        <circle r={r} fill="var(--bg-elevated)" stroke={active ? 'var(--fg)' : col} strokeWidth={active ? 2 : 1.2} />
                        {n.lineage && <circle r={r + 3.5} fill="none" stroke={LINEAGE_RING[n.lineage]} strokeWidth={0.8} opacity={0.8} />}
                        <circle r={4.5} fill={col} opacity={0.35 + 0.65 * (n.live ?? 0)} />
                        {n.freshnessMin !== undefined && n.freshnessMin > 30 && (
                          <circle cx={r - 4} cy={-(r - 4)} r={3} fill="var(--warn)" />
                        )}
                        <text y={r + 14} textAnchor="middle" className="lab-topo-label" direction={locale === 'fa' ? 'rtl' : 'ltr'}>
                          {n.label}
                        </text>
                      </g>
                    );
                  })}
                  <text x={60} y={342} className="lab-topo-section">{t.topology.sectionLabels.perception}</text>
                  <text x={905} y={660} textAnchor="end" className="lab-topo-section lab-topo-learn-label">
                    {t.topology.sectionLabels.learning}
                  </text>
                </g>
              </svg>
              {selNode && (
                <aside className="lab-topo-detail" aria-live="polite">
                  <div className="lab-topo-detail-head">
                    <strong>{selNode.label}</strong>
                    <button onClick={() => setSel(null)} aria-label="×">×</button>
                  </div>
                  {selNode.lineage && (
                    <LabChip kind={selNode.lineage === 'huber' ? 'ok' : selNode.lineage === 'mfe' ? 'path' : selNode.lineage === 'spread' ? 'warn' : 'neutral'}>
                      {t.topology.lineages[selNode.lineage]}
                    </LabChip>
                  )}
                  <p>{selNode.detail}</p>
                </aside>
              )}
            </div>
            <ul className="lab-topo-legend">
              <li>{t.topology.legend.class}</li>
              <li>{t.topology.legend.lineage}</li>
              <li>{t.topology.legend.activity}</li>
              <li>{t.topology.legend.stale}</li>
              <li>{t.topology.legend.flow}</li>
            </ul>
          </div>

          <div className="lab-topo-side">
            <LabPanel title={t.topology.lineageTitle}>
              <ul className="lab-lineage-list">
                {(Object.keys(t.topology.lineages) as (keyof typeof t.topology.lineages)[]).map((k) => (
                  <li key={k}>
                    <span className={`lab-lineage-dot lab-lineage-${k}`} aria-hidden />
                    <span>{t.topology.lineages[k]}</span>
                  </li>
                ))}
              </ul>
            </LabPanel>
            {live && (
              <LabPanel title={t.topology.statusTitle} note={t.topology.statusNote}>
                <ul className="lab-units">
                  {unitEntries.map(([id, u]) => {
                    const active = u.ActiveState === 'active';
                    return (
                      <li key={id}>
                        <span className={`lab-unit-dot ${active ? 'on' : 'off'}`} aria-hidden />
                        <span className="lab-unit-name">
                          {t.labels.units[id as keyof typeof t.labels.units] ?? id}
                        </span>
                        <LabChip kind={active ? 'ok' : 'bad'}>{active ? t.labels.active : t.labels.inactive}</LabChip>
                        {u.NRestarts !== undefined && (
                          <span className="lab-mono lab-unit-restarts">
                            {t.labels.restarts} {u.NRestarts}
                          </span>
                        )}
                      </li>
                    );
                  })}
                  <li>
                    <span className="lab-unit-dot on" aria-hidden />
                    <span className="lab-unit-name">{t.labels.systemLoad}</span>
                    <span className="lab-mono">{snap.system.load.toFixed(2)}</span>
                  </li>
                </ul>
              </LabPanel>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
