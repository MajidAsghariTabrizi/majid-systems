'use client';

/**
 * LabExperiments — the pre-registered experiment ladder: verdicts, gates,
 * one-change statements, forward rows, spec hashes, event timelines.
 * Rejections are first-class evidence; nothing is hidden.
 */

import type { LabSnapshot } from '@/content/lab/types';
import { labDict, type LabLocale } from '@/content/lab';
import { LabChip, LabPanel, num } from './bits';

export function LabExperiments({ snap, locale }: { snap: LabSnapshot; locale: LabLocale }) {
  const t = labDict(locale);
  const entries = Object.entries(snap.experiments).filter(([id]) => id.startsWith('EXP-'));

  return (
    <section className="q-section" id="experiments" aria-label={t.experimentsSection.h2}>
      <div className="container-wide">
        <div className="section-header">
          <div>
            <span className="eyebrow sig">{t.experimentsSection.eyebrow}</span>
            <h2 className="q-h2">{t.experimentsSection.h2}</h2>
          </div>
        </div>
        <p className="q-lede">{t.experimentsSection.lede}</p>

        <div className="lab-experiments">
          {entries.map(([id, e]) => {
            const verdict =
              e.protected
                ? 'COLLECTING'
                : e.result?.verdict ??
                  e.events.find((v) => v.event === 'RUN')?.verdict ??
                  'PENDING';
            const chip = verdict === 'REJECT' ? 'bad' : verdict === 'CONTINUE_SHADOW' ? 'ok' : 'neutral';
            const label =
              t.experimentsSection.verdictLabels[verdict as keyof typeof t.experimentsSection.verdictLabels] ?? verdict;
            const gates = e.result?.gates ?? null;
            return (
              <LabPanel
                key={id}
                title={id}
                actions={<LabChip kind={chip}>{label}</LabChip>}
              >
                <div className="lab-exp-body">
                  <p className="lab-exp-onechange">
                    <strong>{t.experimentsSection.oneChange}:</strong> <span className="lab-mono">{e.one_change ?? '—'}</span>
                  </p>
                  {e.result?.summary && (
                    <ul className="lab-exp-metrics lab-mono">
                      {(
                        [
                          ['logloss', 'logloss_challenger', 'logloss_control'],
                          ['brier', 'brier_challenger', 'brier_control'],
                          ['ece', 'ece_challenger', 'ece_control'],
                        ] as const
                      ).map(([name, cKey, kKey]) =>
                        e.result!.summary![cKey] !== undefined ? (
                          <li key={name}>
                            <span>{name}</span>
                            <span className={better(e.result!.summary![cKey], e.result!.summary![kKey], false)}>
                              {num(e.result!.summary![cKey], 4)}
                            </span>
                            <span className="lab-exp-vs">vs</span>
                            <span>{num(e.result!.summary![kKey], 4)}</span>
                          </li>
                        ) : null,
                      )}
                    </ul>
                  )}
                  {gates && (
                    <ul className="lab-exp-gates">
                      {Object.entries(gates).map(([g, passed]) => (
                        <li key={g}>
                          <span className="lab-mono">{g}</span>
                          <LabChip kind={passed ? 'ok' : 'bad'}>{passed ? '✓' : '✗'}</LabChip>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="lab-exp-meta lab-mono">
                    {e.forward_rows !== undefined && (
                      <span>{t.experimentsSection.forwardRows}: {e.forward_rows}</span>
                    )}
                    {e.result?.ran_at && <span>ran {e.result.ran_at.slice(0, 16)}Z</span>}
                    {e.result?.eval_rows !== undefined && <span>eval rows {e.result.eval_rows}</span>}
                  </div>
                  <div className="lab-exp-timeline">
                    <span className="lab-exp-tl-title">{t.experimentsSection.timeline}</span>
                    <ol className="lab-exp-events">
                      {e.events.map((ev, i) => (
                        <li key={i}>
                          <span className="lab-mono">{ev.at?.slice(0, 16) ?? '—'}Z</span>
                          <span className="lab-ev">{ev.event}</span>
                          {ev.verdict && <LabChip kind={ev.verdict.includes('REJECT') ? 'bad' : 'ok'}>{ev.verdict}</LabChip>}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </LabPanel>
            );
          })}
        </div>
        <p className="lab-exp-negative-note">{t.experimentsSection.negativeNote}</p>
      </div>
    </section>
  );
}

function better(a: number, b: number | undefined, higherIsBetter: boolean): string {
  if (b === undefined) return '';
  if (a === b) return '';
  const good = higherIsBetter ? a > b : a < b;
  return good ? 'lab-exp-better' : 'lab-exp-worse';
}
