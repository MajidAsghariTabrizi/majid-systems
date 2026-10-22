'use client';

/**
 * LabApp — client orchestrator for every data-driven lab section.
 * Loads the sanitized snapshot artifact (static asset, no runtime coupling),
 * fetches the same-origin status manifest for Live mode freshness stamps,
 * and composes the section components. If the artifact cannot load, it
 * renders an explicit unavailability state — never substitute data.
 */

import { useEffect, useMemo, useState } from 'react';

import type { LabSnapshot } from '@/content/lab/types';
import { labDict, type LabLocale } from '@/content/lab';
import { loadLabData, fetchStatus, type LabStatus } from '@/lib/lab/load';
import { viewAgeH } from '@/lib/lab/derive';

import { LabTopology } from './LabTopology';
import { LabReplay } from './LabReplay';
import { LabDecisions } from './LabDecisions';
import { LabBrain } from './LabBrain';
import { LabModels } from './LabModels';
import { LabExperiments } from './LabExperiments';
import { LabChip } from './bits';

function Stat({ value, label, tone }: { value: string; label: string; tone?: 'ok' | 'warn' | 'bad' | 'neutral' }) {
  return (
    <div className={`lab-estat lab-estat-${tone ?? 'neutral'}`}>
      <span className="lab-estat-value lab-mono">{value}</span>
      <span className="lab-estat-label">{label}</span>
    </div>
  );
}

export function LabApp({ locale }: { locale: LabLocale }) {
  const t = labDict(locale);
  const [snap, setSnap] = useState<LabSnapshot | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [status, setStatus] = useState<LabStatus | null>(null);
  const [mode, setMode] = useState<'guided' | 'live'>('guided');
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let alive = true;
    loadLabData().then((r) => {
      if (!alive) return;
      if (r.kind === 'snapshot') setSnap(r.data);
      else setFailed(r.reason);
    });
    fetchStatus().then((s) => alive && setStatus(s));
    return () => {
      alive = false;
    };
  }, []);

  // Live mode: tick the age stamps once a minute.
  useEffect(() => {
    if (mode !== 'live') return;
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, [mode]);

  // 'now' is a deliberate dependency: the tick recomputes the visible age.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ageH = useMemo(() => (snap ? viewAgeH(snap) : null), [snap, now]);

  if (failed) {
    return (
      <div className="lab-offline" role="alert">
        <h3>{t.modes.offlineTitle}</h3>
        <p>{t.modes.offlineBody}</p>
      </div>
    );
  }
  if (!snap) {
    return (
      <div className="lab-loading" aria-busy="true" role="status">
        <span className="lab-loading-dot" aria-hidden />
        <span>LAB</span>
      </div>
    );
  }

  const stale = ageH !== null && ageH > 72;

  return (
    <div className="lab-app">
      {/* mode switch + provenance strip */}
      <div className="lab-strip" role="region" aria-label={t.modes.label}>
        <div className="lab-mode-switch" role="tablist" aria-label={t.modes.label}>
          <button
            role="tab"
            aria-selected={mode === 'guided'}
            className={`chip ${mode === 'guided' ? 'on' : ''}`}
            onClick={() => setMode('guided')}
          >
            {t.modes.guided.label}
          </button>
          <button
            role="tab"
            aria-selected={mode === 'live'}
            className={`chip ${mode === 'live' ? 'on' : ''}`}
            onClick={() => setMode('live')}
          >
            {t.modes.live.label}
          </button>
        </div>
        <p className="lab-mode-hint">
          {mode === 'guided' ? t.modes.guided.hint : t.modes.live.hint}
        </p>
        <div className="lab-provenance">
          <span className="lab-prov-item">
            {t.modes.generatedAt}: <span className="lab-mono">{snap.meta.generated_at.slice(0, 16)}Z</span>
          </span>
          {mode === 'live' && (
            <>
              <span className="lab-prov-item">
                {t.modes.snapshotAge}:{' '}
                <span className={`lab-mono ${stale ? 'lab-stale-text' : 'lab-ok-text'}`}>
                  {ageH !== null ? `${ageH.toFixed(1)}h` : '—'} {stale ? `· ${t.modes.stale}` : `· ${t.modes.fresh}`}
                </span>
              </span>
              {status && (
                <span className="lab-prov-item">
                  {t.dataNote.artifactHash}:{' '}
                  <span className="lab-mono">{status.artifact_sha256.slice(0, 12)}…</span>
                </span>
              )}
              {stale && <span className="lab-prov-note">{t.modes.staleHint}</span>}
            </>
          )}
          <span className="lab-prov-item">
            <LabChip kind="ok">{snap.meta.safety.mode}</LabChip>
            <LabChip kind="neutral">{snap.meta.data_class}</LabChip>
          </span>
        </div>
      </div>

      {/* executive stat strip */}
      <div className="lab-stats" role="group" aria-label="laboratory key figures">
        <Stat value={snap.decisions_compact.length.toLocaleString('en-US')} label={t.hero.stats.decisions} />
        <Stat value={snap.outcomes_compact.length.toLocaleString('en-US')} label={t.hero.stats.outcomes} />
        <Stat
          value={(() => {
            const last = snap.decisions_compact[snap.decisions_compact.length - 1];
            if (!last) return '—';
            const day = new Date(last[0] * 1000).toISOString().slice(0, 10);
            const rows = snap.decisions_compact.filter((d) => new Date(d[0] * 1000).toISOString().slice(0, 10) === day);
            const nt = rows.filter((d) => d[10] === 0).length;
            return rows.length ? `${((nt / rows.length) * 100).toFixed(1)}%` : '—';
          })()}
          label={t.hero.stats.noTrade}
          tone="warn"
        />
        <Stat value={String(Object.keys(snap.experiments).filter((k) => k.startsWith('EXP-')).length)} label={t.hero.stats.experiments} />
        <Stat value={String(snap.brain.claims)} label={t.hero.stats.claims} />
        <Stat value={t.hero.zeroValue} label={t.hero.stats.zero} tone="ok" />
      </div>

      <LabTopology snap={snap} locale={locale} live={mode === 'live'} />
      <LabReplay snap={snap} locale={locale} />
      <LabDecisions snap={snap} locale={locale} />
      <LabBrain snap={snap} locale={locale} />
      <LabModels snap={snap} locale={locale} />
      <LabExperiments snap={snap} locale={locale} />
    </div>
  );
}
