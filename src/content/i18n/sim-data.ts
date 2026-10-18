/**
 * Locale-aware view over the simulator's EN content module.
 *
 * `src/content/simulator.ts` stays the single source of *structure* and ids;
 * every user-visible string is resolved here from the bilingual label pack in
 * `sim.ts`. Nothing is invented: a missing key falls back to the EN string.
 *
 * Placeholders: `{n}` (count), `{becomes}`, `{info}`, `{evidence}`.
 */

import { simLabels } from './sim';
import {
  MOTION_SEMANTICS,
  SIM_BRAIN,
  SIM_CONTROLS,
  SIM_DISCLOSURE,
  SIM_GATE,
  SIM_LAYERS,
  SIM_LEARN,
  SIM_METRIC_LABELS,
  SIM_NEW_METRICS,
  SIM_NODE_INFO,
  SIM_OLD_METRICS,
  SIM_PAYOFF,
  SIM_SIGNALS,
  SIM_STRIP_SLOTS,
  SIM_TAG,
  SIM_TOTAL_OLD,
  type SignalKey,
} from '@/content/simulator';

export type SimLocale = 'en' | 'fa';
/** Widened dictionary: both locales' literal types are assignable. */
export type SimDict = { readonly [K in keyof (typeof simLabels)['en']]: string };

const slug = (s: string) => s.toLowerCase().replace(/[\s·/–—-]+/g, '_').replace(/[^a-z0-9_]/g, '');

/** EN label → localized node label (topology + chart nodes). */
function makeNodeLabel(d: Record<string, string>) {
  return (enLabel: string): string => d[`node_${slug(enLabel)}`] ?? enLabel;
}

/** EN role string → localized role line. */
const ROLE_ALIASES: Record<string, string> = {
  does_the_work: 'role_does_work',
  sign_off: 'role_signoff',
  decision_rights_escalation: 'role_decision_escalation',
  designed_flow_state: 'role_designed_flow',
  outcome_vs_intent: 'role_outcome_intent',
  judgment_ownership_exceptions: 'role_judgment_ownership',
  shared_knowledge_state: 'role_shared_knowledge',
  risk_permission_reversibility: 'role_risk_permission',
};

function makeNodeRole(d: Record<string, string>) {
  return (enRole: string): string => {
    const s = slug(enRole);
    return d[`role_${s}`] ?? (ROLE_ALIASES[s] ? d[ROLE_ALIASES[s]] : undefined) ?? enRole;
  };
}

/** Edge id (as used by the topology model) → dictionary key for its tooltip. */
const EDGE_KEYS: Record<string, string> = {
  'SIGNAL>EMPLOYEE': 'edge_signal_employee',
  'EMPLOYEE>MANAGER': 'edge_employee_manager',
  'MANAGER>EMPLOYEE': 'edge_manager_employee',
  'MANAGER>SLACK': 'edge_manager_slack',
  'SLACK>MEETING': 'edge_slack_meeting',
  'MEETING>ANALYST': 'edge_meeting_analyst',
  'ANALYST>DIRECTOR': 'edge_analyst_director',
  'DIRECTOR>APPROVAL': 'edge_director_approval',
  'APPROVAL>ACTION': 'edge_approval_action',
  'CEO>VP': 'edge_ceo_vp',
  'VP>DIRECTOR': 'edge_vp_director',
  'DIRECTOR>MANAGER': 'edge_director_manager',
  'SIGNAL>CONTEXT ASSEMBLY': 'edge_signal_context',
  'CONTEXT ASSEMBLY>COMPANY BRAIN': 'edge_context_brain',
  'COMPANY BRAIN>AGENTS': 'edge_brain_agents',
  'AGENTS>AUTHORITY GATE': 'edge_agents_gate',
  'AUTHORITY GATE>ENTERPRISE SYSTEMS': 'edge_gate_systems',
  'ENTERPRISE SYSTEMS>EVALUATION': 'edge_systems_evaluation',
  'EVALUATION>COMPANY BRAIN': 'edge_evaluation_brain',
  'HUMAN AUTHORITY>CONTROL PLANE': 'edge_authority_control',
  'AUTHORITY GATE>HUMANS': 'edge_gate_humans',
  'CONTROL PLANE>WORKFLOWS': 'edge_control_workflows',
  'WORKFLOWS>AGENTS': 'edge_workflows_agents',
  'CONTEXT ASSEMBLY>ENTERPRISE SYSTEMS': 'edge_context_systems',
};

/** Edge id → localized tooltip text (falls back to the generic line). */
function makeEdgeText(d: Record<string, string>) {
  return (id: string): string => {
    const key = EDGE_KEYS[id.replace(/^N:/, '')];
    return (key ? d[key] : undefined) ?? d.edge_fallback;
  };
}

/** EN node key → inspection card content. */
function makeNodeInfo(d: Record<string, string>) {
  const out: Record<string, { lines: string[]; latency?: string; becomes?: string }> = {};
  for (const [key, info] of Object.entries(SIM_NODE_INFO)) {
    const k = slug(key);
    out[key] = {
      lines: info.lines.map((line, i) => d[`node_info_${k}_${i + 1}`] ?? line),
      ...(info.latency ? { latency: info.latency } : {}),
      ...(info.becomes ? { becomes: makeNodeLabel(d)(info.becomes) } : {}),
    };
  }
  return out;
}

/** step kind → actor line (WHO ACTED). */
function makeWhoActs(d: Record<string, string>) {
  return (stepKind: string, k = 0): string => {
    switch (stepKind) {
      case 'CONTEXT':
        return d.who_assembly;
      case 'AGENT':
        return d.who_agent_bounded;
      case 'GATE':
        return k > 0.8 ? d.who_human_granted : d.who_human_decides;
      case 'ACTION':
        return d.who_agent_executes;
      case 'EVAL':
        return d.who_measures;
      case 'LEARN':
        return d.who_company_learns;
      case 'BRAIN':
        return d.who_brain_retrieves;
      case 'INVESTIGATE':
        return d.who_verifies;
      default:
        return d.who_system;
    }
  };
}

export type SimData = ReturnType<typeof makeSimData>;

export function makeSimData(locale: SimLocale = 'en') {
  const d = simLabels[locale] as unknown as Record<string, string>;
  const nodeLabel = makeNodeLabel(d);
  const nodeRole = makeNodeRole(d);

  return {
    locale,
    dict: d,
    nodeLabel,
    nodeRole,
    edgeText: makeEdgeText(d),
    edgeHead: d.edge_tooltip_head,
    edgeFallback: d.edge_fallback,
    nodeInfo: makeNodeInfo(d),
    whoActs: makeWhoActs(d),

    controls: {
      ...SIM_CONTROLS,
      send: d.run_send,
      rebuild: d.run_rebuild,
      runAgain: d.run_again,
      replay: d.run_replay,
      reset: d.run_reset,
      speed1: d.speed_1,
      speed2: d.speed_2,
      showLatency: d.overlay_latency,
      showHuman: d.overlay_human,
      showKnowledge: d.overlay_knowledge,
      compareLeft: d.compare_left,
      compareRight: d.compare_right,
      pauseHint: d.inspect_hint,
    },

    slots: {
      entered: d.slot_entered ?? SIM_STRIP_SLOTS.entered,
      where: d.slot_where ?? SIM_STRIP_SLOTS.where,
      why: d.slot_why ?? SIM_STRIP_SLOTS.why,
      who: d.slot_who ?? SIM_STRIP_SLOTS.who,
      changed: d.slot_changed ?? SIM_STRIP_SLOTS.changed,
      learned: d.slot_learned ?? SIM_STRIP_SLOTS.learned,
    },

    metricLabels: {
      latency: d.metric_latency ?? SIM_METRIC_LABELS.latency,
      handoffs: d.metric_handoffs ?? SIM_METRIC_LABELS.handoffs,
      routing: d.metric_routing ?? SIM_METRIC_LABELS.routing,
      knowledge: d.metric_knowledge ?? SIM_METRIC_LABELS.knowledge,
      loop: d.metric_loop ?? SIM_METRIC_LABELS.loop,
      contextLoss: d.metric_context_loss ?? 'CONTEXT LOSS',
    },

    oldMetrics: {
      ...SIM_OLD_METRICS,
      latency: d.metric_old_latency ?? SIM_OLD_METRICS.latency,
      handoffs: d.metric_old_handoffs ?? SIM_OLD_METRICS.handoffs,
      routing: d.metric_old_routing ?? SIM_OLD_METRICS.routing,
      knowledge: d.metric_old_knowledge ?? SIM_OLD_METRICS.knowledge,
      loop: d.metric_old_loop ?? SIM_OLD_METRICS.loop,
    },

    newMetrics: {
      ...SIM_NEW_METRICS,
      latency: d.metric_new_latency ?? SIM_NEW_METRICS.latency,
      handoffs: d.metric_new_handoffs ?? SIM_NEW_METRICS.handoffs,
      routing: d.metric_new_routing ?? SIM_NEW_METRICS.routing,
      knowledge: d.metric_new_knowledge ?? SIM_NEW_METRICS.knowledge,
      loop: d.metric_new_loop ?? SIM_NEW_METRICS.loop,
    },

    signals: SIM_SIGNALS.map((s) => ({
      key: s.key as SignalKey,
      label: d[`signal_${slug(s.key)}`] ?? s.label,
      note: d[`signal_note_${slug(s.key)}`] ?? s.note,
    })),

    brain: {
      counters: SIM_BRAIN.counters,
      card: {
        head: d.brain_what_we_know,
        known: [d.brain_known_issue, d.brain_known_procedure],
        changedHead: d.brain_what_changed,
        changed: [d.brain_changed_env],
        nextHead: d.brain_next,
        next: [d.brain_next_investigate],
      },
      investigatePath: SIM_BRAIN.investigatePath,
    },

    gate: {
      head: d.gate_head,
      rows: [
        { k: d.gate_row_risk, v: d.gate_value_low },
        { k: d.gate_row_reversible, v: d.gate_value_yes },
        { k: d.gate_row_authority, v: d.gate_value_granted },
      ],
      principle: d.gate_principle ?? SIM_GATE.principle,
    },

    learn: {
      outcome: d.learn_outcome ?? SIM_LEARN.outcome,
      update: [
        d.learn_new_knowledge ?? SIM_LEARN.update[0],
        d.learn_procedure_confidence ?? SIM_LEARN.update[1],
        d.learn_loop_closed ?? SIM_LEARN.update[2],
      ],
    },

    layers: SIM_LAYERS.map((l) => {
      const k = slug(l.key);
      return {
        key: l.key,
        label: d[`layer_${k}`] ?? l.label,
        body: d[`layer_${k}_body`] ?? l.body,
      };
    }),

    motion: Object.fromEntries(
      Object.entries(MOTION_SEMANTICS).map(([k, v]) => [k, d[`motion_${slug(k)}`] ?? v])
    ) as Record<keyof typeof MOTION_SEMANTICS, string>,

    disclosure: {
      tag: d.disclosure_tag ?? SIM_DISCLOSURE.tag,
      body: d.disclosure_body ?? SIM_DISCLOSURE.body,
    },
    payoff: { h: d.payoff_head ?? SIM_PAYOFF.h, sub: d.payoff_sub ?? SIM_PAYOFF.sub },
    tag: d.tag_from_chart ?? SIM_TAG,
    totalOld: d.total_old_latency ?? SIM_TOTAL_OLD,

    /* narrative-strip literals produced by the painter */
    phase: {
      traditional: d.phase_traditional,
      aiNative: d.phase_ai_native,
      restructuring: d.where_restructuring,
      topologySettling: d.where_topology_settling,
    },
    strip: {
      humansRouting: d.who_humans_routing,
      gateOpen: d.changed_gate_open,
      knowledgePlus: d.changed_knowledge,
      learnedCombo: d.learn_combo ?? SIM_LEARN.update.join(' · '),
      learningBusy: d.learning_busy ?? 'learning…',
      hierarchyStops: d.why_hierarchy_stops,
      youArchitect: d.who_you_architect,
      structure: d.changed_structure,
      ready: d.why_ready,
      compare: d.why_compare,
      chooseSignal: d.why_choose_signal,
      restructuringEllipsis: d.where_restructuring,
    },

    /* accessibility strings */
    a11y: {
      section: d.a11y_section,
      simAria: d.a11y_sim_aria,
      simTitle: d.a11y_sim_title,
      simDesc: d.a11y_sim_desc,
      rail: d.a11y_rail,
      chooseSignal: d.a11y_choose_signal,
      controls: d.a11y_controls,
      playbackSpeed: d.a11y_playback_speed,
      inspectNode: d.a11y_inspect_node,
      inspectNodeBecomes: d.a11y_inspect_node_becomes,
      connection: d.a11y_connection,
      inspectionDialog: d.a11y_inspection_dialog,
      connectionInspection: d.a11y_connection_inspection,
      closeInspect: d.a11y_close_inspect,
      closeLayer: d.a11y_close_layer,
      layerPanel: d.a11y_layer_panel,
      layersRegion: d.a11y_layers_region,
      compareGroup: d.a11y_compare_group,
      compareSlider: d.a11y_compare_slider,
      compareTraditional: d.a11y_compare_traditional,
      compareNative: d.a11y_compare_native,
    },

    inspect: {
      latencyContribution: d.inspect_latency_contribution,
      becomes: d.inspect_becomes,
    },
    mobileLearnStep: d.mobile_learn_step,
    exploreLayers: d.explore_layers,
  };
}

/** Backwards-compatible EN bundle for any non-localized caller. */
export const SIM_DATA_EN = makeSimData('en');
