'use client';

/**
 * LabBrain — the knowledge system section: episodes by day, regret
 * attribution by layer, hypothesis queue stats, advisory controller
 * recommendations, and the two-loop separation explainer. Internal
 * hypothesis/research texts are withheld by the sanitizer; only counts,
 * statuses and structured advisory metadata are rendered.
 */

import type { LabSnapshot } from '@/content/lab/types';
import { labDict, type LabLocale } from '@/content/lab';
import { LabChip, LabPanel, LabStat, num, pct } from './bits';

const KIND_COLORS: Record<string, string> = {
  TRADE_DECISION: 'var(--ok)',
  RESEARCH_FINDING: 'var(--path)',
  REFLECTION: 'var(--warn)',
  ERROR_ATTRIBUTION: 'var(--stale)',
};

export function LabBrain({ snap, locale }: { snap: LabSnapshot; locale: LabLocale }) {
  const t = labDict(locale);
  const brain = snap.brain;
  const ebd = Object.entries(brain.episodes_by_day ?? {}).sort(([a], [b]) => a.localeCompare(b));
  const kinds = [...new Set(ebd.flatMap(([, d]) => Object.keys(d)))];
  const maxDay = Math.max(1, ...ebd.map(([, d]) => Object.values(d).reduce((a, b) => a + b, 0)));
  const attribution = Object.entries(brain.meta_report?.layer_attribution ?? {})
    .sort((a, b) => b[1].total_regret - a[1].total_regret)
    .slice(0, 8);
  const maxRegret = Math.max(1, ...attribution.map(([, v]) => v.total_regret));
  const recs = brain.meta_report?.controller_recommendations ?? [];
  const nErrors = brain.meta_report?.n_errors ?? 0;

  return (
    <section className="q-section" id="brain" aria-label={t.brainSection.h2}>
      <div className="container-wide">
        <div className="section-header">
          <div>
            <span className="eyebrow sig">{t.brainSection.eyebrow}</span>
            <h2 className="q-h2">{t.brainSection.h2}</h2>
          </div>
        </div>
        <p className="q-lede">{t.brainSection.lede}</p>

        <div className="lab-brain-stats">
          <LabStat value={brain.claims} label={t.hero.stats.claims} />
          <LabStat value={brain.queue_total ?? '—'} label={t.brainSection.queueTitle} tone="warn" />
          <LabStat value={nErrors} label={`${t.brainSection.attributionTitle.split('（')[0]}`} sub={`window ${brain.meta_report?.window_days ?? '—'}d`} />
          <LabStat value={brain.meta_report?.open_hypotheses ?? '—'} label="open hypotheses" tone="neutral" />
        </div>

        <div className="lab-brain-grid">
          <LabPanel title={t.brainSection.episodesTitle} note={t.brainSection.episodesNote}>
            {ebd.length === 0 ? (
              <p className="lab-empty">—</p>
            ) : (
              <div className="lab-episodes" role="img" aria-label={t.brainSection.episodesTitle}>
                {ebd.map(([day, d]) => (
                  <div key={day} className="lab-episode-day" title={day}>
                    <div className="lab-episode-stack">
                      {kinds.map((k) => {
                        const v = d[k] ?? 0;
                        return v ? (
                          <span
                            key={k}
                            style={{
                              height: `${(v / maxDay) * 64}px`,
                              background: KIND_COLORS[k] ?? 'var(--superseded)',
                            }}
                            title={`${k}: ${v}`}
                          />
                        ) : null;
                      })}
                    </div>
                    <span className="lab-mono">{day.slice(5)}</span>
                  </div>
                ))}
                <ul className="lab-episode-kinds">
                  {kinds.map((k) => (
                    <li key={k}>
                      <span style={{ background: KIND_COLORS[k] ?? 'var(--superseded)' }} aria-hidden />
                      {k}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </LabPanel>

          <LabPanel title={t.brainSection.attributionTitle} note={t.brainSection.attributionNote}>
            <ul className="lab-attribution">
              {attribution.map(([layer, v]) => (
                <li key={layer}>
                  <span className="lab-attr-layer">{layer}</span>
                  <span className="lab-bar">
                    <span
                      className="lab-bar-fill lab-bar-warn"
                      style={{ width: `${(v.total_regret / maxRegret) * 100}%` }}
                    />
                  </span>
                  <span className="lab-mono">n={v.n}</span>
                  <span className="lab-mono">R̄={num(v.mean_regret, 1)}</span>
                </li>
              ))}
            </ul>
          </LabPanel>

          <LabPanel title={t.brainSection.queueTitle} note={t.brainSection.queueNote}>
            <ul className="lab-queue">
              {Object.entries(brain.queue_by_status ?? {}).map(([k, v]) => (
                <li key={k}>
                  <span className="lab-mono">{k}</span>
                  <span className="lab-mono">{v}</span>
                </li>
              ))}
            </ul>
            <p className="lab-brain-note">{brain.queue_note}</p>
            <p className="lab-brain-note">{brain.findings_note}</p>
          </LabPanel>

          <LabPanel title={t.brainSection.recommendationsTitle} note={t.brainSection.recommendationsNote}>
            <ul className="lab-recs">
              {recs.map((r, i) => (
                <li key={i}>
                  <div className="lab-rec-head">
                    <LabChip kind="path">{r.recommendation}</LabChip>
                    <span className="lab-mono">p={num(r.priority, 2)}</span>
                  </div>
                  <div className="lab-rec-target lab-mono">{r.target}</div>
                  <div>{r.why}</div>
                  <div className="lab-rec-metric">{r.expected_metric}</div>
                  <div className="lab-rec-req">{r.requires}</div>
                </li>
              ))}
            </ul>
          </LabPanel>
        </div>

        <div className="lab-twoloops">
          <h3 className="lab-h3">{t.brainSection.twoLoopsTitle}</h3>
          <p>{t.brainSection.twoLoopsBody}</p>
          <div className="lab-twoloops-diagram" aria-hidden>
            <div className="lab-loop">
              <span className="lab-loop-title">DECISION</span>
              <span className="lab-mono">market → features → heads → fusion → policy → ledger</span>
              <span className="lab-loop-note">reads/writes Brain: never</span>
            </div>
            <span className="lab-loop-sep">⇄ owner only ⇄</span>
            <div className="lab-loop">
              <span className="lab-loop-title">LEARNING</span>
              <span className="lab-mono">outcomes → episodes → attribution → hypotheses → experiments</span>
              <span className="lab-loop-note">reaches policy only via owner + evidence</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
