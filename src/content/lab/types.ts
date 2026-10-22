/**
 * Typed contract for the PUBLIC sanitized lab snapshot.
 * Source of truth: scripts/lab_snapshot_sanitize.mjs (output shape) which
 * itself documents snapshot_builder.py on the private trading VPS.
 * Internal identifiers are pre-sanitized; these types describe the public shape.
 */

export interface SnapshotMeta {
  generated_at: string;
  be_log_bps: number;
  safety: { live_execution: string; live_capital: string; mode: string };
  exp004_gate: string;
  exp004_protection: string;
  window_days: number;
  /** public registry ids: direction-head / mfe-head -> short hash */
  frozen_heads: Record<string, string>;
  data_class: 'PUBLIC_SANITIZED';
  sanitize_note: string;
}

export interface SystemInfo {
  /** public service labels: decision-engine, market-data, micro-events,
   *  brain-mind-cycle, brain-api, readout-timer */
  units: Record<string, Record<string, string>>;
  failed_units: string[];
  load: number;
  utc_now: string;
}

/** [t, horizon, pUp, pBig, eAbs, q10, q90, aleatoric, epistemic, evLong, action, state, gateMask, costBps] */
export type CompactDecision = [
  number, number, number, number, number, number, number, number, number,
  number, number, number, number, number,
];

export interface RichDecision {
  t: number;
  timestamp?: string;
  decision_id: string;
  horizon: number;
  authority: string;
  market_state: string;
  fused: {
    P_UP?: number;
    P_DOWN?: number;
    P_MOVE_GT_BE?: number;
    expected_signed_move?: number;
    expected_abs_move?: number;
    move_quantiles?: Record<string, number>;
    expected_upside?: number;
    expected_downside?: number;
    execution_cost_bps?: number;
    uncertainty?: { epistemic?: number; aleatoric?: number; overall?: number };
    expert_disagreement?: number;
    sources?: Record<string, string[]>;
  };
  policy: {
    EV_LONG?: number;
    EV_SELL?: number;
    EV_FLAT?: number;
    selected_action?: string;
    position_size_proposed?: number;
    reason_codes?: string[];
    policy_version?: string;
    gates?: Record<string, boolean>;
    inventory_units?: number;
  };
  expert_outputs?: Record<string, Record<string, unknown>>;
  expert_weights?: Record<string, number>;
  explanation?: string;
  feature_version?: string;
  model_versions?: Record<string, string>;
  freeze_ref?: string;
  policy_version?: string;
}

/** [t, horizon, Y, realizedReturn60, costIfTradeable] */
export type CompactOutcome = [number, number, number | null, number | null, number | null];

export interface BrainSnapshot {
  claims: number;
  evidence_ledger: number;
  episodes_by_day?: Record<string, Record<string, number>>;
  findings_note: string;
  queue_total?: number;
  queue_by_status?: Record<string, number>;
  queue_note: string;
  meta_report?: {
    generated_at: string;
    meta_version: string;
    window_days: number;
    n_errors: number;
    n_credited: number;
    layer_attribution?: Record<
      string,
      { n: number; total_regret: number; missed_opp: number; false_pos: number; good: number; mean_regret: number }
    >;
    router_scorecard?: {
      state: string;
      n: number;
      router_dir_acc: number;
      equal_weight_acc: number;
      best_expert_in_hindsight_acc: number;
    }[];
    state_scorecard?: { state: string; n: number; mean_regret_bps: number; beat_rate: number; dir_acc: number }[];
    gate_accounting?: {
      missed_opportunities_by_gate?: Record<string, number>;
      correct_abstentions_by_gate?: Record<string, number>;
    };
    controller_recommendations?: {
      recommendation: string;
      target: string;
      why: string;
      expected_metric: string;
      priority: number;
      authority: string;
      requires: string;
    }[];
    open_hypotheses?: number;
  };
}

export interface ExperimentResult {
  ran_at?: string;
  eval_rows?: number;
  elapsed_s?: number;
  verdict?: string;
  gates?: Record<string, boolean>;
  summary?: Record<string, number>;
}

export interface ExperimentInfo {
  title?: string;
  one_change?: string;
  registered_at?: string;
  forward_rows?: number;
  forward_first_utc?: string;
  forward_last_utc?: string;
  protected?: boolean;
  events: { event: string; at: string; verdict?: string }[];
  result?: ExperimentResult | null;
}

export interface AuditReports {
  fusion_invariants?: { generated_at?: string; rows?: number; violations?: number; checks?: unknown[] };
  uncertainty_audit?: {
    generated_at?: string;
    rows_h60?: number;
    aleatoric?: { definition?: string; saturated_ge_0_99?: number; mean?: number; exactly_1_0_fraction?: number };
    interval_width_logbps?: { '2xBE'?: number; fraction_width_ge_2xBE?: number; mean?: number };
    epistemic_by_state?: Record<string, { n: number; mean: number }>;
    gate_fail_rate?: Record<string, number>;
    reason_codes_top?: Record<string, number>;
    note?: string;
  };
  expert_correlation?: {
    generated_at?: string;
    rows_h60?: number;
    top_abs_correlations?: { a: string; b: string; rho: number }[];
  };
  router_ablation?: {
    generated_at?: string;
    rows_h60?: number;
    method?: string;
    variants?: Record<
      string,
      {
        max_abs_dP_UP: number;
        nonzero_dP_UP_rows: number;
        max_abs_dP_MOVE_GT_BE: number;
        nonzero_dP_BIG_rows: number;
        action_flips_vs_V0: number;
        max_abs_dEV_long: number;
      }
    >;
    V0_reference?: { P_UP_range?: number[]; P_MOVE_GT_BE_range?: number[] };
    reading?: string;
  };
  forward_validity?: {
    generated_at?: string;
    BE_log_bps?: number;
    caveat?: string;
    per_horizon?: Record<
      string,
      {
        n_joined: number;
        direction?: { sign_accuracy_at_p_check?: number; rank_auc_P_UP_vs_signY?: number; note?: string };
        opportunity?: {
          auc_P_MOVE_GT_BE_vs_absY_gt_BE?: number;
          brier?: number;
          base_rate_absY_gt_BE?: number;
          mean_predicted_p_big?: number;
          calibration_deciles?: { bin_p_mean: number; freq_big: number; n: number }[];
        };
        magnitude?: { spearman_E_abs_vs_absY?: number; mean_E_abs?: number; mean_absY?: number };
        uncertainty?: { spearman_unc_vs_abs_signed_error?: number };
        cost?: { mean_cost_bps?: number; cost_vs_BE_ratio?: number };
      }
    >;
  };
}

export interface LabSnapshot {
  meta: SnapshotMeta;
  system: SystemInfo;
  decisions_compact: CompactDecision[];
  decisions_rich: RichDecision[];
  decision_gate_keys: string[];
  decision_state_codes: Record<string, number>;
  decision_action_codes: Record<string, number>;
  outcomes_compact: CompactOutcome[];
  errors_by_day: Record<string, Record<string, number>>;
  errors_latest: Record<string, unknown>[];
  market_closes_5m: [number, number][];
  brain: BrainSnapshot;
  experiments: Record<string, ExperimentInfo>;
  audits: AuditReports;
  health_text: string;
}

export const GATE_KEYS = ['ev_margin', 'uncertainty', 'quiet_veto', 'not_stressed', 'magnitude_clears'] as const;
export const STATE_NAMES = ['QUIET', 'NORMAL', 'TRENDING', 'VOLATILE', 'LIQUIDITY_STRESSED', 'MICRO_EVENT'] as const;
export const ACTION_NAMES = ['NO_TRADE', 'BUY', 'SELL', 'SELL_EXISTING_INVENTORY'] as const;

/** The nine experts — ids are stable public identifiers from the decision ledger. */
export const EXPERTS = [
  { id: 'micro_direction', lineage: 'huber' },
  { id: 'return_surface', lineage: 'huber' },
  { id: 'magnitude', lineage: 'huber' },
  { id: 'large_move', lineage: 'mfe' },
  { id: 'path', lineage: 'mfe' },
  { id: 'execution', lineage: 'spread' },
  { id: 'global_dislocation', lineage: 'nomodel' },
  { id: 'event_l2', lineage: 'nomodel' },
  { id: 'maker_fill', lineage: 'nomodel' },
] as const;

export type ExpertLineage = 'huber' | 'mfe' | 'spread' | 'nomodel';
