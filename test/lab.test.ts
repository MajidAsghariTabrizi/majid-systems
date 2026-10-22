/**
 * Lab artifact invariants — the public snapshot must be present, structurally
 * valid, and provably free of internal identifiers. These tests gate the
 * release: if the sanitizer ever leaks an internal name, path, host or
 * credential-shaped string, the suite fails.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gunzipSync } from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';

const LAB_DIR = path.resolve(process.cwd(), 'public', 'lab');
const SNAP = path.join(LAB_DIR, 'snapshot.labpack');
const MANIFEST = path.join(LAB_DIR, 'manifest.json');

const FORBIDDEN: [RegExp, string][] = [
  [/\/opt\/trader|\/var\/lib|\/root\/|\/tmp\//i, 'internal filesystem path'],
  [/\b(?:\d{1,3}\.){3}\d{1,3}\b/, 'IPv4 literal'],
  [/root@|ssh -i|BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/i, 'credential or ssh material'],
  [/password|passwd|api[_-]?key|secret|token\s*[:=]/i, 'credential-shaped string'],
  [/wallex|nobitex|ramzinex|binance/i, 'exchange/broker name'],
  [/trader-vnext-predict|trader-market\b|trader-micro\b|trader-brain\b|trader-brain-api/i, 'internal systemd unit'],
  [/\.pkl\b/, 'model artifact filename'],
];

function loadSnapshot(): Record<string, unknown> {
  assert.ok(fs.existsSync(SNAP), 'public/lab/snapshot.labpack must exist (run scripts/lab_snapshot_sanitize.mjs)');
  return JSON.parse(gunzipSync(fs.readFileSync(SNAP)).toString('utf8'));
}

test('lab: manifest exists and is self-describing', () => {
  assert.ok(fs.existsSync(MANIFEST), 'public/lab/manifest.json must exist');
  const m = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  assert.equal(m.artifact, 'quantiviq-lab-snapshot');
  assert.equal(m.schema, 1);
  assert.ok(typeof m.generated_at === 'string' && m.generated_at.length > 10);
  assert.ok(typeof m.sanitized_at === 'string');
  assert.match(m.artifact_sha256, /^[0-9a-f]{64}$/);
  assert.ok(m.safety && m.safety.live_execution === 'OFF');
  assert.ok(m.counts && m.counts.decisions > 0);
});

test('lab: snapshot is sanitized (no internal identifiers anywhere)', () => {
  const raw = fs.readFileSync(SNAP);
  const text = gunzipSync(raw).toString('utf8');
  for (const [re, why] of FORBIDDEN) {
    const m = text.match(re);
    assert.equal(m, null, `forbidden pattern (${why}) leaked into public artifact: ${m?.[0]}`);
  }
});

test('lab: snapshot structure matches the public contract', () => {
  const snap = loadSnapshot() as {
    meta: { data_class: string; safety: { live_execution: string; live_capital: string; mode: string }; window_days: number };
    decisions_compact: unknown[][];
    decisions_rich: unknown[];
    outcomes_compact: unknown[];
    experiments: Record<string, { result?: { verdict?: string } }>;
    brain: { claims: number };
    system: { units: Record<string, unknown> };
  };
  assert.equal(snap.meta.data_class, 'PUBLIC_SANITIZED');
  assert.equal(snap.meta.safety.live_execution, 'OFF');
  assert.ok(snap.decisions_compact.length > 1000, 'compact decisions present');
  assert.ok(snap.decisions_rich.length >= 100, 'rich decisions present');
  assert.ok(snap.outcomes_compact.length > 1000, 'outcomes present');
  assert.ok(snap.brain.claims > 0);
  assert.ok(snap.meta.window_days >= 7);

  // internal research free-text must be withheld
  const brain = snap.brain as unknown as { latest_findings?: unknown; queue_latest?: unknown };
  assert.equal(brain.latest_findings, undefined, 'brain.latest_findings must be dropped');
  assert.equal(brain.queue_latest, undefined, 'brain.queue_latest must be dropped');

  // public unit labels only
  const allowedUnits = ['decision-engine', 'market-data', 'micro-events', 'brain-mind-cycle', 'brain-api', 'readout-timer'];
  for (const k of Object.keys(snap.system.units)) {
    assert.ok(allowedUnits.includes(k), `unexpected unit key ${k}`);
  }

  // the flagship experiment verdict is present post-gate
  const e4 = snap.experiments['EXP-004-BIG-BASERATE'];
  assert.ok(e4, 'EXP-004 present');
  assert.equal(e4.result?.verdict, 'CONTINUE_SHADOW');
});

test('lab: nine experts with stable public ids in rich rows', () => {
  const snap = loadSnapshot() as { decisions_rich: { expert_outputs?: Record<string, unknown> }[] };
  const last = snap.decisions_rich[snap.decisions_rich.length - 1];
  const ids = Object.keys(last?.expert_outputs ?? {});
  const expected = [
    'micro_direction', 'return_surface', 'magnitude', 'large_move', 'path',
    'execution', 'global_dislocation', 'event_l2', 'maker_fill',
  ];
  for (const e of expected) {
    assert.ok(ids.includes(e) || ids.includes(`EXPERT_${e.toUpperCase()}`), `expert ${e} missing from rich row`);
  }
});
