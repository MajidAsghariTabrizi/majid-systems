'use client';

/**
 * LabReplay — guided, narrated walkthrough of one REAL frozen decision.
 * Values are read from the ledger row itself (decisions_rich), the outcome
 * join (outcomes_compact at t+horizon), and the error ledger. The outcome
 * and evaluation scenes render only when reached — no hindsight leakage,
 * mirroring how the system itself was allowed to see the world.
 * Controls: play/pause, prev/next, restart, keyboard arrows; reduced-motion
 * disables auto-advance.
 */

import { useEffect, useMemo, useRef, useState } from 'react';

import type { LabSnapshot, RichDecision } from '@/content/lab/types';
import { EXPERTS, GATE_KEYS } from '@/content/lab/types';
import { labDict, type LabLocale } from '@/content/lab';
import { usePrefersReducedMotion } from '@/lib/motion';
import { fmt, num, bps, utcShort, LabChip } from './bits';

const SCENE_KEYS = [
  'event', 'data', 'state', 'experts', 'fusion',
  'uncertainty', 'gates', 'decision', 'outcome', 'evaluation',
] as const;
type SceneKey = (typeof SCENE_KEYS)[number];
const OUTCOME_IDX = SCENE_KEYS.indexOf('outcome');
const SCENE_MS = 11_000;

/** default showcase decision: latest rich row where the uncertainty gate binds */
function pickDefault(snap: LabSnapshot): RichDecision {
  const rows = snap.decisions_rich;
  const gateBind = rows.find(
    (r) => r.policy?.gates && r.policy.gates.uncertainty === false && r.market_state !== 'QUIET',
  );
  return gateBind ?? rows[rows.length - 1];
}

export function LabReplay({ snap, locale }: { snap: LabSnapshot; locale: LabLocale }) {
  const t = labDict(locale);
  const reduced = usePrefersReducedMotion();
  const [decIdx, setDecIdx] = useState<number>(() => {
    const d = pickDefault(snap);
    return Math.max(0, snap.decisions_rich.findIndex((r) => r.t === d.t && r.horizon === d.horizon));
  });
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(!reduced);
  const startRef = useRef(Date.now());
  const [progress, setProgress] = useState(0);

  const dec = snap.decisions_rich[decIdx] ?? pickDefault(snap);

  const outcome = useMemo(
    () => snap.outcomes_compact.find((o) => o[0] === dec.t && o[1] === dec.horizon) ?? null,
    [snap, dec],
  );
  const errRow = useMemo(
    () =>
      (snap.errors_latest as { decision_id?: string; taxonomy?: string[] }[] | undefined)?.find(
        (e) => e.decision_id === dec.decision_id,
      ) ?? null,
    [snap, dec],
  );

  // auto-advance
  useEffect(() => {
    if (!playing) return;
    startRef.current = Date.now();
    setProgress(0);
    const id = setInterval(() => {
      const el = Date.now() - startRef.current;
      setProgress(Math.min(1, el / SCENE_MS));
      if (el >= SCENE_MS) {
        setIdx((i) => (i + 1 < SCENE_KEYS.length ? i + 1 : i));
        startRef.current = Date.now();
        if (idx + 1 >= SCENE_KEYS.length) setPlaying(false);
      }
    }, 120);
    return () => clearInterval(id);
  }, [playing, idx]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { setIdx((i) => Math.min(SCENE_KEYS.length - 1, i + 1)); }
      if (e.key === 'ArrowLeft') { setIdx((i) => Math.max(0, i - 1)); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const sc = t.replay.scenes;
  const be = snap.meta.be_log_bps ?? 34.77;
  const stateLabel = t.labels.states[dec.market_state as keyof typeof t.labels.states] ?? dec.market_state;
  const actionLabel = t.labels.actions[(dec.policy?.selected_action ?? 'NO_TRADE') as keyof typeof t.labels.actions]
    ?? dec.policy?.selected_action ?? 'NO_TRADE';
  const gates: { key: string; label: string; pass: boolean }[] = useMemo(() => {
    const g = dec.policy?.gates;
    return GATE_KEYS.map((k) => ({
      key: k,
      label: t.labels.gates[k],
      pass: g ? g[k] === true : true,
    }));
  }, [dec, t]);
  const binding = gates.filter((g) => !g.pass);
  const reasons = (dec.policy?.reason_codes ?? []).join(', ') || '—';
  const y = outcome ? outcome[2] : null;

  const expertRows = useMemo(() => {
    const out = (dec.expert_outputs ?? {}) as Record<string, Record<string, unknown>>;
    const w = dec.expert_weights ?? {};
    return EXPERTS.map((e) => {
      const o = out[e.id] ?? out[`EXPERT_${e.id.toUpperCase()}`] ?? {};
      const p = typeof o.p_up === 'number' ? o.p_up : typeof o.p === 'number' ? o.p : null;
      return { id: e.id, p, weight: w[e.id] ?? null };
    });
  }, [dec]);

  const vars: Record<SceneKey, Record<string, string>> = {
    event: { time: utcShort(dec.t) },
    data: {},
    state: { state: stateLabel },
    experts: {},
    fusion: {
      pUp: num(dec.fused?.P_UP, 4),
      pBig: num(dec.fused?.P_MOVE_GT_BE, 4),
      eAbs: bps(dec.fused?.expected_abs_move, 1),
      be: bps(be, 1),
    },
    uncertainty: {
      aleatoric: num(dec.fused?.uncertainty?.aleatoric, 2),
      epistemic: num(dec.fused?.uncertainty?.epistemic, 2),
    },
    gates: { bindingGates: binding.map((g) => g.label).join(' · ') || '—' },
    decision: { action: actionLabel, reasons },
    outcome: { y: y === null || y === undefined ? '—' : `${y > 0 ? '+' : ''}${y.toFixed(1)}` },
    evaluation: { taxonomy: errRow?.taxonomy?.join(', ') ?? '—' },
  };

  const visibleBig = idx >= OUTCOME_IDX;

  return (
    <section className="q-section" id="replay" aria-label={t.replay.h2}>
      <div className="container-wide">
        <div className="section-header">
          <div>
            <span className="eyebrow sig">{t.replay.eyebrow}</span>
            <h2 className="q-h2">{t.replay.h2}</h2>
          </div>
          <LabChip kind="path">{t.replay.epochTag}</LabChip>
        </div>
        <p className="q-lede">{t.replay.lede}</p>

        <div className="lab-replay">
          {/* stage */}
          <div className="lab-replay-stage" data-scene={SCENE_KEYS[idx]}>
            <div className="lab-replay-title">
              <span className="lab-replay-idx">{String(idx + 1).padStart(2, '0')}</span>
              <h3>{sc[SCENE_KEYS[idx]].title}</h3>
            </div>
            <p className="lab-replay-narration">{fmt(sc[SCENE_KEYS[idx]].body, vars[SCENE_KEYS[idx]])}</p>

            <div className="lab-replay-visual" aria-hidden={false}>
              {SCENE_KEYS[idx] === 'event' && (
                <div className="lab-rv-event">
                  <span className="lab-mono">{utcShort(dec.t)}</span>
                  <span className="lab-rv-h">{dec.horizon}m</span>
                  <span className="lab-rv-id">{dec.decision_id}</span>
                </div>
              )}
              {SCENE_KEYS[idx] === 'data' && (
                <div className="lab-rv-kv">
                  <div><span>BTCTMN 5m grid</span><span className="lab-mono">{snap.market_closes_5m.length} pts</span></div>
                  <div><span>features</span><span className="lab-mono">×25 std</span></div>
                  <div><span>freeze</span><span className="lab-mono">{dec.freeze_ref ?? '—'}</span></div>
                  <div><span>feature set</span><span className="lab-mono">{dec.feature_version ?? '—'}</span></div>
                </div>
              )}
              {SCENE_KEYS[idx] === 'state' && (
                <div className="lab-rv-state">
                  <span className="lab-rv-state-word">{stateLabel}</span>
                  <span className="lab-mono">{dec.market_state}</span>
                </div>
              )}
              {SCENE_KEYS[idx] === 'experts' && (
                <ul className="lab-rv-experts">
                  {expertRows.map((e) => {
                    const lb = t.labels.experts[e.id as keyof typeof t.labels.experts];
                    return (
                      <li key={e.id}>
                        <span className="lab-rv-ename">{lb?.name ?? e.id}</span>
                        <span className="lab-mono">P(up) {e.p === null ? 'N/A' : num(e.p, 3)}</span>
                        <span className="lab-mono">w {e.weight === null ? '—' : e.weight.toFixed(2)}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
              {SCENE_KEYS[idx] === 'fusion' && (
                <div className="lab-rv-kv">
                  <div><span>P(up)</span><span className="lab-mono">{num(dec.fused?.P_UP, 4)}</span></div>
                  <div><span>P(&gt;BE)</span><span className="lab-mono">{num(dec.fused?.P_MOVE_GT_BE, 4)}</span></div>
                  <div><span>E|move|</span><span className="lab-mono">{bps(dec.fused?.expected_abs_move, 1)} bps</span></div>
                  <div><span>cost</span><span className="lab-mono">{bps(dec.fused?.execution_cost_bps ?? (dec as { costBps?: number }).costBps, 1)} bps</span></div>
                </div>
              )}
              {SCENE_KEYS[idx] === 'uncertainty' && (
                <div className="lab-rv-unc">
                  <div className="lab-rv-unc-row"><span>aleatoric</span><span className="lab-bar"><span className="lab-bar-fill lab-bar-warn" style={{ width: `${(dec.fused?.uncertainty?.aleatoric ?? 0) * 100}%` }} /></span><span className="lab-mono">{num(dec.fused?.uncertainty?.aleatoric, 2)}</span></div>
                  <div className="lab-rv-unc-row"><span>epistemic</span><span className="lab-bar"><span className="lab-bar-fill lab-bar-ok" style={{ width: `${(dec.fused?.uncertainty?.epistemic ?? 0) * 100}%` }} /></span><span className="lab-mono">{num(dec.fused?.uncertainty?.epistemic, 2)}</span></div>
                </div>
              )}
              {SCENE_KEYS[idx] === 'gates' && (
                <ul className="lab-rv-gates">
                  {gates.map((g) => (
                    <li key={g.key} className={g.pass ? 'pass' : 'bind'}>
                      <span>{g.label}</span>
                      <LabChip kind={g.pass ? 'ok' : 'bad'}>{g.pass ? t.labels.passing : t.labels.binding}</LabChip>
                    </li>
                  ))}
                </ul>
              )}
              {SCENE_KEYS[idx] === 'decision' && (
                <div className="lab-rv-decision">
                  <span className="lab-rv-action">{actionLabel}</span>
                  <span className="lab-mono">{dec.policy?.reason_codes?.join(' · ')}</span>
                  <span className="lab-mono">authority {dec.authority}</span>
                </div>
              )}
              {SCENE_KEYS[idx] === 'outcome' && visibleBig && (
                <div className={`lab-rv-outcome ${y !== null && y < 0 ? 'neg' : 'pos'}`}>
                  <span className="lab-rv-y">{y === null || y === undefined ? '—' : `${y > 0 ? '+' : ''}${y.toFixed(1)}`} bps</span>
                  <span className="lab-mono">@ maturity +{dec.horizon}m</span>
                </div>
              )}
              {SCENE_KEYS[idx] === 'evaluation' && (
                <div className="lab-rv-kv">
                  <div><span>taxonomy</span><span className="lab-mono">{errRow?.taxonomy?.join(' · ') ?? '—'}</span></div>
                  <div><span>error ledger</span><span className="lab-mono">{snap.errors_latest.length} latest rows</span></div>
                </div>
              )}
            </div>

            {/* controls */}
            <div className="lab-replay-controls">
              <div className="lab-replay-dots" role="tablist" aria-label={t.replay.controls.scene}>
                {SCENE_KEYS.map((k, i) => (
                  <button
                    key={k}
                    role="tab"
                    aria-selected={i === idx}
                    aria-label={`${t.replay.controls.scene} ${i + 1} — ${sc[k].title}`}
                    className={i === idx ? 'on' : i < idx ? 'seen' : ''}
                    onClick={() => { setIdx(i); startRef.current = Date.now(); }}
                  />
                ))}
              </div>
              <div className="lab-replay-btns">
                <button onClick={() => setIdx((i) => Math.max(0, i - 1))} aria-label={t.replay.controls.prev}>◀</button>
                <button className="lab-replay-play" onClick={() => setPlaying((p) => !p)}>
                  {playing ? `❚❚ ${t.replay.controls.pause}` : `▶ ${t.replay.controls.play}`}
                </button>
                <button onClick={() => setIdx((i) => Math.min(SCENE_KEYS.length - 1, i + 1))} aria-label={t.replay.controls.next}>▶</button>
                <button onClick={() => { setIdx(0); startRef.current = Date.now(); setPlaying(!reduced); }} aria-label={t.replay.controls.restart}>⟲</button>
              </div>
              <span className="lab-mono lab-replay-counter">
                {t.replay.controls.scene} {idx + 1} {t.replay.controls.of} {SCENE_KEYS.length}
              </span>
            </div>
            <div className="lab-replay-progress" role="presentation">
              <span style={{ width: `${((idx + progress) / SCENE_KEYS.length) * 100}%` }} />
            </div>
          </div>

          {/* decision picker */}
          <div className="lab-replay-picker">
            <label htmlFor="lab-replay-select" className="lab-replay-pick-label">
              {t.replay.pick}
            </label>
            <select
              id="lab-replay-select"
              value={decIdx}
              onChange={(e) => {
                setDecIdx(Number(e.target.value));
                setIdx(0);
                startRef.current = Date.now();
              }}
            >
              {[...snap.decisions_rich]
                .map((r, i) => ({ r, i }))
                .reverse()
                .slice(0, 120)
                .map(({ r, i }) => {
                  const om = snap.outcomes_compact.find((o) => o[0] === r.t && o[1] === r.horizon);
                  const yv = om && om[2] !== null ? om[2] : null;
                  return (
                    <option key={i} value={i}>
                      {utcShort(r.t).slice(5)} h{r.horizon} · {r.market_state} ·{' '}
                      {yv === null ? '…' : `${yv > 0 ? '+' : ''}${yv.toFixed(0)}bps`}
                    </option>
                  );
                })}
            </select>
            <p className="lab-replay-pick-hint">{t.replay.pickHint}</p>
            <p className="lab-replay-footer">{t.replay.footerNote}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
