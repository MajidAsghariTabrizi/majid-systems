'use client';

/**
 * Shared primitives for the lab sections. Visual language follows the site's
 * design system (q-* classes, chips, tokens); lab-* classes live in
 * globals.css. Numbers are always Latin in mono contexts (site convention),
 * including on FA/RTL pages.
 */

import type { ReactNode } from 'react';

export function LabPanel({
  title,
  note,
  children,
  actions,
  id,
}: {
  title?: string;
  note?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  id?: string;
}) {
  return (
    <div className="lab-panel" id={id}>
      {(title || actions) && (
        <div className="lab-panel-head">
          {title && <h3 className="lab-panel-title">{title}</h3>}
          <span className="lab-panel-actions">{actions}</span>
        </div>
      )}
      {children}
      {note && <p className="lab-panel-note">{note}</p>}
    </div>
  );
}

const CHIP_KIND: Record<string, string> = {
  ok: 'chip-ok',
  warn: 'chip-warn',
  bad: 'chip-disputed',
  info: 'chip-observed',
  path: 'chip-path',
  stale: 'chip-stale',
  neutral: 'chip-unknown',
};

export function LabChip({ kind, children }: { kind: keyof typeof CHIP_KIND; children: ReactNode }) {
  return <span className={`chip ${CHIP_KIND[kind] ?? 'chip-unknown'}`}>{children}</span>;
}

export function LabStat({
  value,
  label,
  tone,
  sub,
}: {
  value: ReactNode;
  label: string;
  tone?: 'ok' | 'warn' | 'bad' | 'neutral';
  sub?: string;
}) {
  return (
    <div className={`lab-stat lab-stat-${tone ?? 'neutral'}`}>
      <span className="lab-stat-value">{value}</span>
      <span className="lab-stat-label">{label}</span>
      {sub && <span className="lab-stat-sub">{sub}</span>}
    </div>
  );
}

export function LabBar({ value, tone }: { value: number; tone?: 'ok' | 'warn' | 'bad' }) {
  const pct = Math.max(0, Math.min(100, value * 100));
  return (
    <span className="lab-bar" role="presentation">
      <span className={`lab-bar-fill lab-bar-${tone ?? 'ok'}`} style={{ width: `${pct}%` }} />
    </span>
  );
}

export function LabEmpty({ children }: { children: ReactNode }) {
  return <div className="lab-empty">{children}</div>;
}

/** interpolate {key} placeholders in dictionary strings */
export function fmt(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
}

export const num = (v: number | null | undefined, d = 3) =>
  v === null || v === undefined || Number.isNaN(v) ? '—' : v.toFixed(d);
export const pct = (v: number | null | undefined, d = 1) =>
  v === null || v === undefined || Number.isNaN(v) ? '—' : `${(v * 100).toFixed(d)}%`;
export const bps = (v: number | null | undefined, d = 1) =>
  v === null || v === undefined || Number.isNaN(v) ? '—' : v.toFixed(d);
export const utcShort = (t: number) => new Date(t * 1000).toISOString().slice(0, 16).replace('T', ' ') + 'Z';
