'use client';

/**
 * LabModels — model registry, frozen audits, the evidence matrix, and
 * calibration. Distinguishes historical training (hash-pinned artifacts),
 * frozen audits (dated windows), and live forward shadow — never blending
 * epochs inside one number.
 */

import { useMemo } from 'react';

import type { LabSnapshot } from '@/content/lab/types';
import { labDict, type LabLocale } from '@/content/lab';
import { fmt, num, pct, bps, LabChip, LabPanel } from './bits';

type VerdictKey = 'VALIDATED' | 'PARTIAL' | 'DATA_LIMITED' | 'NOT_ESTABLISHED' | 'STRUCTURAL' | 'REJECTED';
const VERDICT_CHIP: Record<VerdictKey, 'ok' | 'path' | 'warn' | 'bad' | 'neutral'> = {
  VALIDATED: 'ok',
  PARTIAL: 'path',
  DATA_LIMITED: 'warn',
  NOT_ESTABLISHED: 'warn',
  STRUCTURAL: 'neutral',
  REJECTED: 'bad',
};

export function LabModels({ snap, locale }: { snap: LabSnapshot; locale: LabLocale }) {
  const t = labDict(locale);
  const fv = snap.audits.forward_validity;
  const h60 = fv?.per_horizon?.['60'];
  const ua = snap.audits.uncertainty_audit;
  const ec = snap.audits.expert_correlation;
  const ra = snap.audits.router_ablation;
  const fi = snap.audits.fusion_invariants;
  const latest = snap.decisions_rich[snap.decisions_rich.length - 1];
  const mv = latest?.model_versions ?? {};

  const e4 = snap.experiments['EXP-004-BIG-BASERATE'];
  const e4s = e4?.result?.summary ?? {};

  // today's abstention + binding gates from compact rows
  const stats = useMemo(() => {
    const lastDay = snap.decisions_compact[snap.decisions_compact.length - 1];
    if (!lastDay) return null;
    const day = new Date(lastDay[0] * 1000).toISOString().slice(0, 10);
    const rows = snap.decisions_compact.filter((d) => new Date(d[0] * 1000).toISOString().slice(0, 10) === day);
    const noTrade = rows.filter((d) => d[10] === 0).length;
    const uncBind = rows.filter((d) => !(d[12] & (1 << 1))).length;
    const alea1 = rows.filter((d) => d[7] >= 0.999).length;
    return { day, n: rows.length, noTrade, uncBind, alea1 };
  }, [snap]);

  const matrixValues: string[] = useMemo(() => {    const be = snap.meta.be_log_bps ?? 34.77;
    const val = (i: number): string => {
      switch (i) {
        case 0:
          return `h60 rank AUC ${num(h60?.direction?.rank_auc_P_UP_vs_signY, 3)} · ${t.models.audits.forwardValidity.title.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? ''} · n=${h60?.n_joined ?? '—'}`;
        case 1:
          return `h60 AUC ${num(h60?.opportunity?.auc_P_MOVE_GT_BE_vs_absY_gt_BE, 3)} · base ${pct(h60?.opportunity?.base_rate_absY_gt_BE, 1)}`;
        case 2:
          return `mean P(BE+) ${num(h60?.opportunity?.mean_predicted_p_big, 3)} vs base ${pct(h60?.opportunity?.base_rate_absY_gt_BE, 1)}`;
        case 3:
          return `logloss ${num(e4s.logloss_challenger, 3)} vs control ${num(e4s.logloss_control, 3)} · Brier ${num(e4s.brier_challenger, 3)} vs ${num(e4s.brier_control, 3)} · ${e4?.forward_rows ?? '—'} forward rows`;
        case 4:
          return `h60 Spearman ρ ${num(h60?.magnitude?.spearman_E_abs_vs_absY, 3)}`;
        case 5:
          return `aleatoric = 1.0 on ${stats ? pct(stats.alea1 / stats.n, 0) : '—'} of ${stats?.n ?? 0} rows (${stats?.day ?? ''})`;
        case 6:
          return stats ? `${pct(stats.noTrade / stats.n, 1)} NO_TRADE · uncertainty gate binds ${pct(stats.uncBind / stats.n, 0)} (${stats.day})` : '—';
        case 7:
          return `top pair ρ = ${num(ec?.top_abs_correlations?.[0]?.rho, 3)} (${ec?.top_abs_correlations?.[0]?.a} × ${ec?.top_abs_correlations?.[0]?.b}) · n=${ec?.rows_h60 ?? '—'}`;
        case 8:
          return `ablation ${ra?.generated_at?.slice(0, 10) ?? ''} · n=${ra?.rows_h60 ?? '—'} · action flips: ${Object.values(ra?.variants ?? {}).map((v) => v.action_flips_vs_V0).join('/')}`;
        case 9:
          return `trades executed: 0 · fills: 0 · authority: NONE_PAPER_SHADOW`;
        case 10:
          return `replay 2026-10-04: 480 decisions · live shadow ${snap.decisions_compact.length} rows / ${snap.meta.window_days}d`;
        default:
          return `BE ${bps(be, 1)} bps`;
      }
    };
    return t.models.matrixRows.map((_, i) => val(i));
  }, [snap, h60, e4, e4s, ec, ra, stats, t]);

  const calBins = h60?.opportunity?.calibration_deciles ?? [];

  return (
    <section className="q-section" id="models" aria-label={t.models.h2}>
      <div className="container-wide">
        <div className="section-header">
          <div>
            <span className="eyebrow sig">{t.models.eyebrow}</span>
            <h2 className="q-h2">{t.models.h2}</h2>
          </div>
        </div>
        <p className="q-lede">{t.models.lede}</p>

        <div className="lab-models-grid">
          <LabPanel title={t.models.registryTitle} note={t.models.registryNote}>
            <ul className="lab-registry">
              {Object.entries(mv).map(([k, v]) => (
                <li key={k}>
                  <span className="lab-registry-key">{k}</span>
                  <span className="lab-mono">{v}</span>
                </li>
              ))}
              {Object.entries(snap.meta.frozen_heads).map(([k, v]) => (
                <li key={k}>
                  <span className="lab-registry-key">{k} (hash)</span>
                  <span className="lab-mono">{v}</span>
                </li>
              ))}
            </ul>
          </LabPanel>

          <LabPanel title={t.models.trainVsLiveTitle}>
            <p>{t.models.trainVsLiveBody}</p>
          </LabPanel>

          <LabPanel title={t.models.matrixTitle} note={t.models.matrixNote} id="evidence-matrix">
            <ul className="lab-matrix">
              {t.models.matrixRows.map((row, i) => (
                <li key={i}>
                  <span className="lab-matrix-claim">{row.claim}</span>
                  <span className="lab-matrix-value lab-mono">{matrixValues[i]}</span>
                  <LabChip kind={VERDICT_CHIP[row.verdict as VerdictKey]}>
                    {t.models.verdicts[row.verdict as VerdictKey]}
                  </LabChip>
                </li>
              ))}
            </ul>
          </LabPanel>

          {calBins.length > 0 && (
            <LabPanel title={t.models.calibrationTitle} note={t.models.calibrationNote}>
              <div className="lab-cal">
                <svg viewBox="0 0 240 200" className="lab-cal-plot" role="img" aria-label={t.models.calibrationTitle}>
                  <line x1={30} y1={180} x2={225} y2={180} stroke="var(--border-strong)" />
                  <line x1={30} y1={12} x2={30} y2={180} stroke="var(--border-strong)" />
                  <line x1={30} y1={180} x2={225} y2={12} stroke="var(--fg-subtle)" strokeDasharray="3 4" />
                  {calBins.map((b, i) => {
                    const cx = 30 + b.bin_p_mean * 195;
                    const cy = 180 - b.freq_big * 168;
                    const px = i > 0 ? 30 + calBins[i - 1].bin_p_mean * 195 : null;
                    const py = i > 0 ? 180 - calBins[i - 1].freq_big * 168 : null;
                    return (
                      <g key={i}>
                        {px !== null && py !== null && (
                          <line x1={px} y1={py} x2={cx} y2={cy} stroke="var(--path)" strokeWidth={1} opacity={0.6} />
                        )}
                        <circle cx={cx} cy={cy} r={3.4} fill="var(--path)">
                          <title>{`p̄ ${b.bin_p_mean.toFixed(2)} → ${b.freq_big.toFixed(2)} · n=${b.n}`}</title>
                        </circle>
                      </g>
                    );
                  })}
                  <text x={127} y={196} textAnchor="middle" className="lab-cal-axis">predicted P(move&gt;BE)</text>
                  <text x={12} y={96} className="lab-cal-axis" transform="rotate(-90 12 96)">observed freq</text>
                </svg>
                <p className="lab-cal-note lab-mono">
                  h60 · n={h60?.n_joined ?? '—'} · {fv?.generated_at?.slice(0, 10) ?? ''} · control fusion
                </p>
              </div>
            </LabPanel>
          )}

          <div className="lab-audit-cards">
            {(Object.keys(t.models.audits) as (keyof typeof t.models.audits)[]).map((k) => (
              <div key={k} className="lab-audit-card">
                <h4>{t.models.audits[k].title}</h4>
                <p>{t.models.audits[k].body}</p>
              </div>
            ))}
          </div>

          <div className="lab-quality">
            <h3 className="lab-h3">{t.models.qualityTitle}</h3>
            <p>{t.models.qualityBody}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
