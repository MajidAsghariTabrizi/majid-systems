/**
 * Derivations over the public lab snapshot — deterministic, client-safe.
 * Ported from the observatory's derive.ts (same math), trimmed to what the
 * public lab renders. Every metric computed here discloses its inputs.
 */

import type { CompactDecision, LabSnapshot } from '@/content/lab/types';
import { GATE_KEYS } from '@/content/lab/types';

export interface JoinedRow {
  t: number;
  horizon: number;
  pUp: number;
  pBig: number;
  eAbs: number;
  q10: number;
  q90: number;
  aleatoric: number;
  epistemic: number;
  evLong: number;
  action: number;
  state: number;
  gateMask: number;
  costBps: number;
  y: number | null;
}

export function joinOutcomes(snap: LabSnapshot): JoinedRow[] {
  const omap = new Map<string, number | null>();
  for (const o of snap.outcomes_compact) omap.set(`${o[0]}:${o[1]}`, o[2]);
  const out: JoinedRow[] = [];
  for (const d of snap.decisions_compact) {
    out.push({
      t: d[0], horizon: d[1], pUp: d[2], pBig: d[3], eAbs: d[4], q10: d[5], q90: d[6],
      aleatoric: d[7], epistemic: d[8], evLong: d[9], action: d[10], state: d[11],
      gateMask: d[12], costBps: d[13],
      y: omap.get(`${d[0]}:${d[1]}`) ?? null,
    });
  }
  return out.sort((a, b) => a.t - b.t);
}

export const dayKey = (t: number) => new Date(t * 1000).toISOString().slice(0, 10);

export function auc(scores: number[], labels: number[]): number | null {
  const pos = labels.filter((l) => l === 1).length;
  const neg = labels.length - pos;
  if (!pos || !neg) return null;
  const idx = scores.map((s, i) => i).sort((a, b) => scores[a] - scores[b]);
  const ranks = new Array<number>(scores.length);
  let i = 0;
  while (i < idx.length) {
    let j = i;
    while (j < idx.length && scores[idx[j]] === scores[idx[i]]) j++;
    const avg = (i + 1 + j) / 2;
    for (let k = i; k < j; k++) ranks[idx[k]] = avg;
    i = j;
  }
  let s = 0;
  for (let k = 0; k < scores.length; k++) if (labels[k] === 1) s += ranks[k];
  return (s - (pos * (pos + 1)) / 2) / (pos * neg);
}

export function brier(p: number[], y: number[]): number {
  return p.reduce((acc, v, i) => acc + (v - y[i]) ** 2, 0) / p.length;
}

export function logloss(p: number[], y: number[]): number {
  const e = 1e-9;
  return (
    -p.reduce((acc, v, i) => acc + y[i] * Math.log(v + e) + (1 - y[i]) * Math.log(1 - v + e), 0) / p.length
  );
}

export function topDecileLift(p: number[], y: number[]): number | null {
  const pos = y.reduce((a, v) => a + v, 0);
  if (!pos) return null;
  const order = p.map((s, i) => i).sort((a, b) => p[b] - p[a]);
  const top = order.slice(0, Math.max(1, Math.floor(order.length / 10)));
  const topRate = top.reduce((a, i) => a + y[i], 0) / top.length;
  const base = pos / y.length;
  return base ? topRate / base : null;
}

export interface CalibrationBin {
  pMean: number;
  freq: number;
  n: number;
}

export function calibration(p: number[], y: number[], bins = 10): CalibrationBin[] {
  const order = p.map((s, i) => i).sort((a, b) => p[a] - p[b]);
  const out: CalibrationBin[] = [];
  const per = Math.ceil(order.length / bins);
  for (let b = 0; b < bins; b++) {
    const idx = order.slice(b * per, b === bins - 1 ? undefined : (b + 1) * per);
    if (!idx.length) continue;
    out.push({
      pMean: idx.reduce((a, i) => a + p[i], 0) / idx.length,
      freq: idx.reduce((a, i) => a + y[i], 0) / idx.length,
      n: idx.length,
    });
  }
  return out;
}

export function gateStats(rows: CompactDecision[]) {
  const totals = new Array(GATE_KEYS.length).fill(0);
  for (const d of rows) for (let i = 0; i < GATE_KEYS.length; i++) if (d[12] & (1 << i)) totals[i]++;
  return GATE_KEYS.map((k, i) => ({ gate: k, passRate: rows.length ? totals[i] / rows.length : 0 }));
}

/** Snapshot clock discipline: state ages against the snapshot's own generation
 *  time; the VIEW age against wall clock. The lab surfaces both. */
export const snapClock = (snap: { meta: { generated_at: string } }) =>
  (Date.parse(snap.meta.generated_at.replace(/([+-]\d{2}:\d{2}|Z)$/, 'Z')) || Date.now()) / 1000;

export const viewAgeH = (snap: { meta: { generated_at: string } }) =>
  (Date.now() - snapClock(snap) * 1000) / 3600000;

export const utc = (t: number) => new Date(t * 1000).toISOString().slice(0, 19).replace('T', ' ');

export const fmtNum = (v: number | null | undefined, d = 3) =>
  v === null || v === undefined || Number.isNaN(v) ? '—' : v.toFixed(d);
export const fmtPct = (v: number | null | undefined, d = 1) =>
  v === null || v === undefined || Number.isNaN(v) ? '—' : `${(v * 100).toFixed(d)}%`;
export const fmtBps = (v: number | null | undefined, d = 1) =>
  v === null || v === undefined || Number.isNaN(v) ? '—' : v.toFixed(d);
