'use client';

/**
 * LabDecisions — prediction & expert intelligence browser over the 240 most
 * recent rich ledger rows. Every displayed value is a measured field from the
 * sanitized snapshot; limitations copy is fixed by the dictionary so no view
 * can imply more skill than the evidence shows.
 */

import { useMemo, useState } from 'react';

import type { LabSnapshot, RichDecision } from '@/content/lab/types';
import { EXPERTS, GATE_KEYS } from '@/content/lab/types';
import { labDict, type LabLocale } from '@/content/lab';
import { utcShort, num, bps, LabChip, LabPanel } from './bits';

export function LabDecisions({ snap, locale }: { snap: LabSnapshot; locale: LabLocale }) {
  const t = labDict(locale);
  const [sel, setSel] = useState<number>(snap.decisions_rich.length - 1);
  const rows = snap.decisions_rich;
  const dec: RichDecision | undefined = rows[sel];
  const be = snap.meta.be_log_bps ?? 34.77;

  const outcome = useMemo(
    () => (dec ? snap.outcomes_compact.find((o) => o[0] === dec.t && o[1] === dec.horizon) : null),
    [snap, dec],
  );
  if (!dec) return null;

  const f = t.decisions.fields;
  const yv = outcome && outcome[2] !== null ? outcome[2] : null;
  const eOut = (dec.expert_outputs ?? {}) as Record<string, Record<string, unknown>>;
  const weights = dec.expert_weights ?? {};
  const mv = dec.model_versions ?? {};

  return (
    <section className="q-section" id="decisions" aria-label={t.decisions.h2}>
      <div className="container-wide">
        <div className="section-header">
          <div>
            <span className="eyebrow sig">{t.decisions.eyebrow}</span>
            <h2 className="q-h2">{t.decisions.h2}</h2>
          </div>
        </div>
        <p className="q-lede">{t.decisions.lede}</p>

        <div className="lab-decisions">
          <div className="lab-dec-list">
            <h3 className="lab-h3">{t.decisions.listTitle}</h3>
            <p className="lab-dec-hint">{t.decisions.pickHint}</p>
            <ul className="lab-dec-rows" aria-label={t.decisions.listTitle}>
              {[...rows]
                .map((r, i) => ({ r, i }))
                .reverse()
                .slice(0, 120)
                .map(({ r, i }) => {
                  const om = snap.outcomes_compact.find((o) => o[0] === r.t && o[1] === r.horizon);
                  const y2 = om && om[2] !== null ? om[2] : null;
                  return (
                    <li key={i}>
                      <button
                        aria-pressed={sel === i}
                        className={sel === i ? 'on' : ''}
                        onClick={() => setSel(i)}
                     >
                        <span className="lab-mono">{utcShort(r.t).slice(5)}</span>
                        <span className="lab-mono">h{r.horizon}</span>
                        <span className="lab-dec-state">{r.market_state}</span>
                        <span
                          className={`lab-mono lab-dec-y ${y2 === null ? '' : y2 > 0 ? 'pos' : 'neg'}`}
                        >
                          {y2 === null ? '…' : `${y2 > 0 ? '+' : ''}${y2.toFixed(0)}`}
                        </span>
                      </button>
                    </li>
                  );
                })}
            </ul>
          </div>

          <LabPanel title={`${utcShort(dec.t)} · h${dec.horizon} · ${dec.market_state}`} >
            <div className="lab-dec-anatomy">
              <dl className="lab-dec-kv">
                <div>
                  <dt>{f.freshness}</dt>
                  <dd className="lab-mono">{utcShort(dec.t)}Z · inputs ≤ {dec.horizon}m before</dd>
                </div>
                <div>
                  <dt>{f.model}</dt>
                  <dd className="lab-mono">
                    {Object.entries(mv).map(([k, v]) => `${k}=${v}`).join(' · ') || '—'}
                  </dd>
                </div>
                <div>
                  <dt>{f.prediction}</dt>
                  <dd className="lab-mono">
                    P(up) {num(dec.fused?.P_UP, 4)} · P(&gt;BE) {num(dec.fused?.P_MOVE_GT_BE, 4)} · E|move|{' '}
                    {bps(dec.fused?.expected_abs_move, 1)} bps
                  </dd>
                </div>
                <div>
                  <dt>{f.uncertainty}</dt>
                  <dd className="lab-mono">
                    alea {num(dec.fused?.uncertainty?.aleatoric, 2)} · epis {num(dec.fused?.uncertainty?.epistemic, 2)}
                    {dec.fused?.expert_disagreement !== undefined &&
                      ` · ${f.disagreement.toLowerCase()} ${num(dec.fused.expert_disagreement, 3)}`}
                  </dd>
                </div>
                <div>
                  <dt>{f.cost}</dt>
                  <dd className="lab-mono">
                    {bps(dec.fused?.execution_cost_bps, 1)} bps · BE {bps(be, 1)} bps
                  </dd>
                </div>
                <div>
                  <dt>EV</dt>
                  <dd className="lab-mono">
                    {f.evLong} {bps(dec.policy?.EV_LONG, 1)} · {f.evSell} {bps(dec.policy?.EV_SELL, 1)}
                  </dd>
                </div>
                <div>
                  <dt>{f.action}</dt>
                  <dd>
                    <LabChip kind={dec.policy?.selected_action === 'NO_TRADE' ? 'warn' : 'ok'}>
                      {t.labels.actions[(dec.policy?.selected_action ?? 'NO_TRADE') as keyof typeof t.labels.actions] ??
                        dec.policy?.selected_action}
                    </LabChip>
                    <span className="lab-mono lab-dec-reasons">{dec.policy?.reason_codes?.join(' · ')}</span>
                  </dd>
                </div>
                <div>
                  <dt>{f.outcome}</dt>
                  <dd className={`lab-mono ${yv === null ? '' : yv > 0 ? 'pos' : 'neg'}`}>
                    {yv === null ? t.decisions.noOutcome : `${yv > 0 ? '+' : ''}${yv.toFixed(1)} bps`}
                  </dd>
                </div>
              </dl>

              <div className="lab-dec-gates">
                {GATE_KEYS.map((k) => {
                  const pass = dec.policy?.gates ? dec.policy.gates[k] === true : null;
                  return (
                    <span key={k} className="lab-dec-gate">
                      <LabChip kind={pass === null ? 'neutral' : pass ? 'ok' : 'bad'}>
                        {t.labels.gates[k]}
                      </LabChip>
                    </span>
                  );
                })}
              </div>

              <ul className="lab-dec-experts">
                {EXPERTS.map((e) => {
                  const o = eOut[e.id] ?? eOut[`EXPERT_${e.id.toUpperCase()}`] ?? {};
                  const p = typeof o.p_up === 'number' ? o.p_up : typeof o.p === 'number' ? o.p : null;
                  const lb = t.labels.experts[e.id as keyof typeof t.labels.experts];
                  const w = weights[e.id];
                  const participating = w !== undefined && w !== null && w > 0;
                  return (
                    <li key={e.id} className={participating ? '' : 'mute'}>
                      <span className="lab-dec-ename">{lb?.name ?? e.id}</span>
                      <span className="lab-mono">{p === null ? 'N/A' : num(p, 3)}</span>
                      <span className="lab-mono">w {w === undefined || w === null ? '—' : w.toFixed(2)}</span>
                    </li>
                  );
                })}
              </ul>

              <p className="lab-dec-evidence">
                <strong>{f.evidence}:</strong> {t.decisions.evidenceBody}
              </p>
              <p className="lab-dec-limits">
                <strong>{f.limits}:</strong> {t.decisions.limitsBody}
              </p>
            </div>
          </LabPanel>
        </div>
      </div>
    </section>
  );
}
