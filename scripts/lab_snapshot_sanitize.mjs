#!/usr/bin/env node
/**
 * lab_snapshot_sanitize.mjs — build the PUBLIC lab snapshot artifact.
 *
 * Reads the raw, internal `brain_snapshot.json.gz` produced by the read-only
 * snapshot_builder.py (run on the private trading VPS) and emits a sanitized,
 * public-safe artifact for the Quantiviq Lab:
 *
 *   public/lab/snapshot.labpack   — the sanitized snapshot (gzip bytes under a
 *                                   custom extension: Next's static handler
 *                                   mis-serves .gz suffixes with 204; .labpack
 *                                   avoids that while staying a gzip payload)
 *   public/lab/manifest.json      — provenance manifest (age/status endpoint)
 *
 * Sanitization contract (see mission_quantiviq_lab/LAB_SECURITY_AND_DATA_BOUNDARIES.md):
 *   1. Internal systemd unit names      -> public service labels
 *   2. Model artifact filenames (.pkl)  -> public registry ids (short hash kept)
 *   3. brain.latest_findings texts      -> DROPPED (internal research log)
 *   4. brain.queue_latest texts         -> DROPPED (internal hypothesis texts)
 *   5. experiments.result_summary       -> parsed to structured metrics subset
 *   6. health_text ledger filenames     -> redacted to [ledger]
 *   7. HARD FAIL: if any forbidden pattern (paths, IPs, hosts, credentials,
 *      broker names) survives into the serialized output, exit 1 and write
 *      nothing. The public artifact therefore cannot ship a secret by accident.
 *
 * Usage:
 *   node scripts/lab_snapshot_sanitize.mjs [inputSnapshot.gz] [--out-dir public/lab]
 *
 * Defaults: input = ../Trade/mission_quantiviq_lab/raw/brain_snapshot.json.gz
 * (override with LAB_SNAPSHOT_INPUT env var when the Trade checkout lives elsewhere).
 */

import { createHash } from 'node:crypto';
import { gunzipSync, gzipSync } from 'node:zlib';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

// ---------- CLI ----------
const args = process.argv.slice(2);
const outDirIdx = args.indexOf('--out-dir');
const OUT_DIR = path.resolve(
  REPO_ROOT,
  outDirIdx >= 0 ? args[outDirIdx + 1] : 'public/lab',
);
const positional = args.filter((_, i) => i !== outDirIdx && i !== outDirIdx + 1);
const INPUT =
  positional[0] ??
  process.env.LAB_SNAPSHOT_INPUT ??
  'D:/PycharmProjects/pythonProject/Trade/mission_quantiviq_lab/raw/brain_snapshot.json.gz';

const SANITIZER_VERSION = 'lab_snapshot_sanitize v1.1';

// ---------- public label maps ----------
const UNIT_LABELS = {
  'trader-vnext-predict': 'decision-engine',
  'trader-market': 'market-data',
  'trader-micro': 'micro-events',
  'trader-brain': 'brain-mind-cycle',
  'trader-brain-api': 'brain-api',
  'trader-vnext-readout.timer': 'readout-timer',
};
const HEAD_LABELS = {
  'direction_multi.pkl': 'direction-head',
  'mfe_multi.pkl': 'mfe-head',
};
/** Subsets of experiment result_summary kept in the public artifact. */
const SUMMARY_KEEP = new Set([
  'n_h60',
  'logloss_challenger',
  'logloss_control',
  'brier_challenger',
  'brier_control',
  'ece_challenger',
  'ece_control',
  'mae_challenger',
  'mae_control',
  'mae_improvement_pct',
  'pinball_sum_challenger',
  'coverage80_challenger',
  'coverage80_control',
  'mean_width_challenger',
  'mean_width_control',
  'rho_track_challenger',
  'rho_track_control',
  'quartile_mean_abs_err_ratio',
  'frac_aleat2_ge_UNC_MAX',
  'control_frac_ge_UNC_MAX',
  'trades_challenger',
  'trades_control',
  'mean_p_challenger',
  'mean_p_control',
  'base_rate',
]);

// ---------- forbidden-pattern gate ----------
const FORBIDDEN = [
  { re: /\/opt\/trader|\/var\/lib|\/root\/|\/tmp\//i, why: 'internal filesystem path' },
  { re: /\b(?:\d{1,3}\.){3}\d{1,3}\b/, why: 'IPv4 literal' },
  { re: /root@|ssh -i|BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/i, why: 'credential or ssh material' },
  { re: /password|passwd|api[_-]?key|secret|token\s*[:=]/i, why: 'credential-shaped string' },
  { re: /wallex|nobitex|ramzinex|binance/i, why: 'exchange/broker name' },
  { re: /trader-vnext-predict|trader-vnext-readout|trader-market\b|trader-micro\b|trader-brain\b|trader-brain-api/i, why: 'internal systemd unit name' },
];

function assertClean(serialized) {
  const offenders = [];
  for (const { re, why } of FORBIDDEN) {
    const m = serialized.match(re);
    if (m) offenders.push(`${why}: ${String(m[0]).slice(0, 40)}`);
  }
  if (offenders.length) {
    console.error('✖ SANITIZER REFUSED TO EMIT — forbidden pattern(s) in output:');
    for (const o of offenders) console.error('   -', o);
    process.exit(1);
  }
}

// ---------- transforms ----------
const pick = (obj, keys) =>
  Object.fromEntries(keys.filter((k) => obj && obj[k] !== undefined && obj[k] !== null).map((k) => [k, obj[k]]));

function sanitizeMeta(meta) {
  const heads = {};
  for (const [k, v] of Object.entries(meta.frozen_heads ?? {})) {
    heads[HEAD_LABELS[k] ?? k.replace(/\.pkl$/, '')] = v;
  }
  return {
    generated_at: meta.generated_at,
    be_log_bps: meta.be_log_bps,
    safety: meta.safety,
    exp004_gate: meta.exp004_gate,
    exp004_protection: meta.exp004_protection,
    window_days: meta.window_days,
    frozen_heads: heads,
    data_class: 'PUBLIC_SANITIZED',
    sanitize_note:
      'Internal identifiers renamed, internal free-text research logs removed. Metrics, decisions, outcomes, audits and experiment registries are unmodified measurements.',
  };
}

function sanitizeSystem(system) {
  const units = {};
  for (const [k, v] of Object.entries(system.units ?? {})) {
    units[UNIT_LABELS[k] ?? 'internal-withheld'] = v;
  }
  return {
    units,
    failed_units: (system.failed_units ?? []).filter((u) => u && u !== '●').map((u) => UNIT_LABELS[u] ?? 'internal-withheld'),
    load: system.load,
    utc_now: system.utc_now,
  };
}

function sanitizeBrain(brain) {
  // learning_graph node.artifact carries internal absolute paths -> keep basename only
  const lg = brain.learning_graph;
  const learning_graph =
    lg && Array.isArray(lg.nodes)
      ? {
          nodes: lg.nodes.map((n) =>
            typeof n.artifact === 'string'
              ? { ...n, artifact: n.artifact.split('/').filter(Boolean).pop() }
              : n,
          ),
          edges: lg.edges,
        }
      : undefined;
  return {
    claims: brain.claims,
    evidence_ledger: brain.evidence_ledger,
    episodes_by_day: brain.episodes_by_day ?? {},
    // Internal research/hypothesis free text is intentionally NOT published.
    // Counts and statuses remain (activity metrics, not content).
    queue_total: brain.queue_total,
    queue_by_status: brain.queue_by_status ?? {},
    findings_note: 'internal research log withheld from the public artifact',
    queue_note: 'hypothesis texts withheld; counts and statuses only',
    meta_report: brain.meta_report ?? null,
    learning_graph,
  };
}

function sanitizeExperiments(experiments) {
  const out = {};
  for (const [id, e] of Object.entries(experiments ?? {})) {
    if (!e || id === 'null') continue; // drop null/consolidation marker entries
    let parsed = null;
    if (typeof e.result_summary === 'string') {
      const full = lenientParse(e.result_summary);
      if (full) {
        parsed = {
          ran_at: full.ran_at,
          eval_rows: full.eval_rows,
          elapsed_s: full.elapsed_s,
          verdict: full.verdict,
          gates: full.gates ?? null,
          summary: full.summary ? pick(full.summary, [...SUMMARY_KEEP]) : null,
        };
      }
    }
    out[id] = {
      title: e.title,
      one_change: e.one_change,
      registered_at: e.registered_at,
      forward_rows: e.forward_rows,
      forward_first_utc: e.forward_first_utc,
      forward_last_utc: e.forward_last_utc,
      protected: e.protected,
      events: (e.events ?? []).map((ev) => pick(ev, ['event', 'at', 'verdict'])),
      result: parsed,
    };
  }
  return out;
}

/**
 * The snapshot builder caps result_summary strings at 600 chars, which can cut
 * a JSON object mid-token ("…\"brier2_"). Strict JSON.parse then fails and the
 * verdict/gates would be lost. Repair strategy: walk cut-points back to the
 * last comma, strip the dangling separator, and re-close any open braces.
 * Returns the first candidate that parses, else null.
 */
function lenientParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    /* fall through to repair */
  }
  for (let cut = s.length; cut > 0; cut--) {
    if (s[cut - 1] !== ',') continue;
    const cand = s.slice(0, cut - 1).replace(/,\s*$/, '');
    const open = (cand.match(/\{/g) ?? []).length;
    const close = (cand.match(/\}/g) ?? []).length;
    const repaired = cand + '}'.repeat(Math.max(0, open - close));
    try {
      return JSON.parse(repaired);
    } catch {
      /* try earlier cut */
    }
  }
  return null;
}

function sanitizeHealthText(text) {
  if (!text) return 'no health report in snapshot';
  return text
    .replace(/[\w./-]+\.jsonl/g, '[ledger]')
    .replace(/[\w./-]+\.pkl/g, '[model-artifact]')
    .replace(/\/[\w./-]+/g, (m) => (m.includes('[') ? m : '[path]'));
}

// ---------- main ----------
function main() {
  if (!existsSync(INPUT)) {
    console.error(`✖ input snapshot not found: ${INPUT}`);
    console.error('  pass a path argument or set LAB_SNAPSHOT_INPUT');
    process.exit(1);
  }
  const rawGz = readFileSync(INPUT);
  const sourceSha = createHash('sha256').update(rawGz).digest('hex');
  const snap = JSON.parse(gunzipSync(rawGz).toString('utf8'));

  const sanitized = {
    meta: sanitizeMeta(snap.meta),
    system: sanitizeSystem(snap.system),
    decisions_compact: snap.decisions_compact,
    decisions_rich: snap.decisions_rich,
    decision_gate_keys: snap.decision_gate_keys,
    decision_state_codes: snap.decision_state_codes,
    decision_action_codes: snap.decision_action_codes,
    outcomes_compact: snap.outcomes_compact,
    errors_by_day: snap.errors_by_day,
    errors_latest: snap.errors_latest,
    market_closes_5m: snap.market_closes_5m,
    brain: sanitizeBrain(snap.brain),
    experiments: sanitizeExperiments(snap.experiments),
    audits: snap.audits,
    health_text: sanitizeHealthText(snap.health_text),
  };

  const serialized = JSON.stringify(sanitized);
  assertClean(serialized);

  mkdirSync(OUT_DIR, { recursive: true });
  const gz = gzipSync(Buffer.from(serialized, 'utf8'), { level: 9 });
  writeFileSync(path.join(OUT_DIR, 'snapshot.labpack'), gz);

  const manifest = {
    artifact: 'quantiviq-lab-snapshot',
    schema: 1,
    sanitizer: SANITIZER_VERSION,
    generated_at: sanitized.meta.generated_at,
    sanitized_at: new Date().toISOString(),
    source_sha256: sourceSha,
    artifact_sha256: createHash('sha256').update(gz).digest('hex'),
    bytes_gz: gz.length,
    safety: sanitized.meta.safety,
    counts: {
      decisions: sanitized.decisions_compact.length,
      rich_decisions: sanitized.decisions_rich.length,
      outcomes: sanitized.outcomes_compact.length,
      market_points: sanitized.market_closes_5m.length,
      experiments: Object.keys(sanitized.experiments).length,
      brain_claims: sanitized.brain.claims,
    },
    window_days: sanitized.meta.window_days,
  };
  writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

  console.log('✔ sanitized lab snapshot emitted');
  console.log(`  source   : ${INPUT}`);
  console.log(`  snapshot : ${path.join(OUT_DIR, 'snapshot.labpack')} (${gz.length.toLocaleString()} bytes gz)`);
  console.log(`  manifest : ${path.join(OUT_DIR, 'manifest.json')}`);
  console.log(`  source sha256 : ${sourceSha.slice(0, 16)}…`);
}

main();
