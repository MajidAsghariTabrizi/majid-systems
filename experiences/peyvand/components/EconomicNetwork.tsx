'use client';

import { useId, type CSSProperties } from 'react';
import { getScenario, visibleEdges, type GraphEdge, type GraphNode, type LayerId, type ScenarioId } from '../lib/model';
import './network.css';

type Props = {
  scenario: ScenarioId;
  phase: number;
  layer?: LayerId | 'all';
  selectedNode?: string;
  onSelectNode?: (id: string) => void;
  routeId?: string;
  variant?: 'hero' | 'simulator' | 'layers' | 'final';
};

const economyNodes: GraphNode[] = [
  { id: 'manufacturer', label: 'تولیدکننده', role: 'ظرفیت تولید', detail: 'ظرفیت اقتصادی فرضی', evidence: '', x: 180, y: 155 },
  { id: 'seller', label: 'فروشنده', role: 'دسترسی به بازار', detail: 'عرضه فرضی', evidence: '', x: 778, y: 155 },
  { id: 'professional', label: 'متخصص', role: 'توانایی انجام کار', detail: 'توانایی فرضی', evidence: '', x: 180, y: 488 },
  { id: 'investor', label: 'سرمایه‌گذار', role: 'علاقه به مشارکت', detail: 'نقش فرضی؛ بدون تعهد سرمایه‌گذاری', evidence: '', x: 480, y: 65 },
  { id: 'supplier', label: 'تأمین‌کننده', role: 'عرضه محصول و خدمت', detail: 'عرضه فرضی', evidence: '', x: 780, y: 488 },
  { id: 'employer', label: 'کارفرما', role: 'نیاز به همکاری', detail: 'نیاز فرضی', evidence: '', x: 480, y: 578 },
  { id: 'buyer', label: 'خریدار', role: 'تقاضای جاری', detail: 'تقاضای فرضی', evidence: '', x: 170, y: 322 },
  { id: 'service', label: 'شرکت خدماتی', role: 'ظرفیت اجرایی', detail: 'ظرفیت فرضی', evidence: '', x: 790, y: 322 },
];
const economyEdges: GraphEdge[] = [
  { id: 'e1', from: 'manufacturer', to: 'seller', layers: ['commerce'], minPhase: 2, label: 'عرضه و بازار' },
  { id: 'e2', from: 'manufacturer', to: 'buyer', layers: ['intent'], minPhase: 1, label: 'نیاز و ظرفیت' },
  { id: 'e3', from: 'professional', to: 'employer', layers: ['capability'], minPhase: 2, label: 'توانایی و نیاز' },
  { id: 'e4', from: 'seller', to: 'supplier', layers: ['commerce'], minPhase: 2, label: 'عرضه مکمل' },
  { id: 'e5', from: 'service', to: 'professional', layers: ['social'], minPhase: 3, label: 'معرفی حرفه‌ای' },
  { id: 'e6', from: 'investor', to: 'manufacturer', layers: ['trust'], minPhase: 4, label: 'بررسی شواهد پیش از مشارکت' },
  { id: 'e7', from: 'buyer', to: 'supplier', layers: ['result'], minPhase: 5, label: 'نتیجه احتمالی پس از توافق' },
  { id: 'e8', from: 'employer', to: 'service', layers: ['result'], minPhase: 5, label: 'همکاری احتمالی' },
  { id: 'e9', from: 'investor', to: 'employer', layers: ['social'], minPhase: 3, label: 'مسیر آشنایی رضایتی' },
];
const phaseNames = ['اتصال‌های پنهان', 'نیاز آشکار می‌شود', 'توانایی مرتبط پیدا می‌شود', 'مسیر معرفی روشن می‌شود', 'شواهد بررسی می‌شوند', 'نتیجه احتمالی دیده می‌شود'];

export function EconomicNetwork({ scenario, phase, layer = 'all', selectedNode, onSelectNode, routeId, variant = 'simulator' }: Props) {
  const uid = useId().replace(/:/g, '');
  const item = getScenario(scenario);
  const overview = variant === 'hero' || variant === 'final';
  const nodes = overview ? economyNodes : item.nodes;
  const edges = overview ? economyEdges : item.edges;
  const safePhase = Math.max(0, Math.min(5, Math.floor(phase)));
  const effectivePhase = variant === 'final' ? 5 : variant === 'layers' ? 5 : safePhase;
  const shown = overview ? edges.filter((edge) => edge.minPhase <= effectivePhase && (layer === 'all' || edge.layers.includes(layer))) : visibleEdges(scenario, effectivePhase, layer);
  const shownIds = new Set(shown.map((edge) => edge.id));
  const route = effectivePhase >= 4 ? item.routes.find((r) => r.id === routeId) : undefined;
  const routeNodes = new Set(route?.nodeIds ?? []);
  const activeNodes = new Set(shown.flatMap((edge) => [edge.from, edge.to]));
  if (effectivePhase > 0 && !overview) activeNodes.add(nodes[0].id);
  const selected = nodes.find((node) => node.id === selectedNode);
  const inspectionHint = overview ? 'هر نقش، بخشی از یک فرصت بالقوه'
    : !onSelectNode ? 'یک لایه را انتخاب کنید؛ ارتباط‌های مرتبط روشن می‌شوند.'
    : selected ? `در حال بررسی: ${selected.label}`
    : 'روی یک موجودیت بزنید؛ دلیل پیشنهاد را بررسی کنید.';

  const point = (id: string) => nodes.find((node) => node.id === id)!;
  const path = (edge: GraphEdge) => {
    const a = point(edge.from), b = point(edge.to);
    const cx = ((a.x + b.x) / 2 + 480) / 2, cy = ((a.y + b.y) / 2 + 320) / 2;
    return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
  };

  return (
    <div className={`pv-network pv-network--${variant}`} data-phase={effectivePhase} data-layer={layer}>
      <div className="pv-network-meta">
        <span><i aria-hidden="true" />{variant === 'final' ? 'تصویر یک امکان؛ نه عملکرد واقعی' : 'شبکه شبیه‌سازی‌شده'}</span>
        <span className="pv-network-state" aria-live="polite">{variant === 'layers' ? 'یک شبکه، با رابطه‌های متفاوت' : phaseNames[effectivePhase]}</span>
      </div>
      <div className="pv-network-canvas">
        <svg className="pv-network-svg" viewBox="0 0 960 640" fill="none" aria-hidden="true" focusable="false">
          <defs>
            <radialGradient id={`${uid}glow`}><stop stopColor="#eda06d" stopOpacity=".16" /><stop offset="1" stopColor="#eda06d" stopOpacity="0" /></radialGradient>
            <linearGradient id={`${uid}line`} x1="100" y1="100" x2="820" y2="540" gradientUnits="userSpaceOnUse"><stop stopColor="#dcb77b" /><stop offset=".5" stopColor="#f0af83" /><stop offset="1" stopColor="#8f6a54" /></linearGradient>
            <filter id={`${uid}blur`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3" /></filter>
          </defs>
          <circle cx="480" cy="320" r="290" fill={`url(#${uid}glow)`} />
          <g className="pv-network-orbits"><ellipse cx="480" cy="320" rx="348" ry="235" /><ellipse cx="480" cy="320" rx="265" ry="183" /><circle cx="480" cy="320" r="128" /><path d="M 480 20 V 620 M 40 320 H 920" /></g>
          {edges.map((edge, index) => {
            const visible = shownIds.has(edge.id);
            const inRoute = routeNodes.size > 0 && routeNodes.has(edge.from) && routeNodes.has(edge.to);
            const connectedToSelected = selectedNode === edge.from || selectedNode === edge.to;
            return <g key={edge.id} className={`pv-network-edge${visible ? ' is-visible' : ''}${inRoute ? ' is-route' : ''}${connectedToSelected ? ' is-related' : ''}`} style={{ '--edge-delay': `${index * 80}ms` } as CSSProperties}>
              <path className="pv-network-edge-glow" d={path(edge)} stroke={`url(#${uid}line)`} filter={`url(#${uid}blur)`} />
              <path className="pv-network-edge-line" d={path(edge)} stroke={`url(#${uid}line)`} />
              {visible && <path className="pv-network-edge-flow" d={path(edge)} stroke="#f8d9c5" />}
            </g>;
          })}
          <g className={`pv-network-core${effectivePhase > 0 ? ' is-awake' : ''}`}>
            <circle cx="480" cy="320" r="88" /><circle cx="480" cy="320" r="75" /><circle cx="480" cy="320" r="63" />
            <path d="M 453 311 L 467 297 L 480 310 L 493 297 L 507 311 L 493 325 L 480 312 L 467 325 Z" />
            <text x="480" y="359" textAnchor="middle">پیوند</text>
          </g>
          {nodes.map((node) => <g key={node.id} className={`pv-network-point${activeNodes.has(node.id) ? ' is-active' : ''}${node.id === selectedNode ? ' is-selected' : ''}`}><circle cx={node.x} cy={node.y} r="10" /><circle cx={node.x} cy={node.y} r="5" /><text className="pv-network-mini-label" x={node.x} y={node.y + 30} textAnchor="middle" direction="rtl">{node.label}</text></g>)}
        </svg>
        <div className="pv-network-node-controls" role="group" aria-label={overview ? 'نقش‌های اقتصادی در شبکه فرضی' : onSelectNode ? 'موجودیت‌های سناریو؛ برای بررسی یک مورد را انتخاب کنید' : 'موجودیت‌های مرتبط با لایه انتخاب‌شده در شبکه فرضی'}>
          {nodes.map((node) => (
            <button type="button" key={node.id}
              className={`pv-network-node${activeNodes.has(node.id) ? ' is-active' : ''}${selectedNode === node.id ? ' is-selected' : ''}${routeNodes.has(node.id) ? ' is-route' : ''}`}
              style={{ '--node-x': `${node.x / 9.6}%`, '--node-y': `${node.y / 6.4}%` } as CSSProperties}
              disabled={!onSelectNode}
              onClick={() => onSelectNode?.(node.id)} aria-pressed={selectedNode === node.id}
              aria-label={`${node.label}؛ ${node.role}${!overview && node.id === item.nodes[0].id && effectivePhase > 0 ? '؛ نیاز فعال' : ''}`}>
              <span className="pv-network-node-dot" aria-hidden="true" />
              <span className="pv-network-node-copy"><strong>{node.label}</strong><small>{node.role}</small></span>
              {!overview && node.id === item.nodes[0].id && effectivePhase > 0 && <span className="pv-network-intent">نیاز فعال</span>}
              {!overview && <span className="pv-network-node-action" aria-hidden="true">↙</span>}
            </button>
          ))}
        </div>
      </div>
      <div className="pv-network-bottom"><span>{inspectionHint}</span><span>{new Intl.NumberFormat('fa-IR').format(shown.length)} ارتباط نمایشی</span></div>
    </div>
  );
}
