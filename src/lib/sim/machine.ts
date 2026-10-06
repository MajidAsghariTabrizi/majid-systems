/**
 * The simulator state machine — SINGLE SOURCE OF TRUTH.
 * Pure reducer. The same machine powers buttons, scroll progression,
 * replay, reduced-motion mode and comparison mode.
 *
 * The machine owns DISCRETE state. Continuous time T lives in the machine
 * but is advanced by the runtime loop, which dispatches PHASE_END exactly
 * once when a boundary is crossed — so React never re-renders per frame.
 *
 * Semantic states:  IDLE_OLD → SIGNAL_OLD → OLD_COMPLETE → TRANSFORMING
 *                   → IDLE_NEW → SIGNAL_NEW → LEARNING → COMPARISON
 * Semantic events:  SEND_SIGNAL, NODE_INSPECT, REBUILD, RUN_AGAIN,
 *                   SET_COMPARE_POSITION, REPLAY, RESET
 * Internal events:  PHASE_END, SEEK, PAUSE, RESUME, SET_SPEED, SET_SIGNAL,
 *                   CLEAR_INSPECT, EDGE_INSPECT, SET_LAYER, TOGGLE_OVERLAY,
 *                   MANUAL_LOCK
 */

import type { LayerKey, SignalKey } from '@/content/simulator';
import { LEARN_DURATION, NEW_RUN_DURATION, OLD_DURATION, TRANSFORM_DURATION } from './timeline';

export type SimPhase =
  | 'IDLE_OLD'
  | 'SIGNAL_OLD'
  | 'OLD_COMPLETE'
  | 'TRANSFORMING'
  | 'IDLE_NEW'
  | 'SIGNAL_NEW'
  | 'LEARNING'
  | 'COMPARISON';

export type Overlays = { latency: boolean; human: boolean; knowledge: boolean };

export type MachineState = {
  phase: SimPhase;
  /** committed morph value t ∈ [0,1] (slider sets it; TRANSFORMING commits 1) */
  morphT: number;
  /** elapsed simulation seconds within the current phase */
  T: number;
  signal: SignalKey;
  selectedNode: string | null;
  selectedEdge: string | null;
  paused: boolean;
  speed: 1 | 2;
  layer: LayerKey | null;
  overlays: Overlays;
  /** scroll-driven control disabled after first manual interaction */
  manualLock: boolean;
  /** AI-native topology has been reached at least once (layer explorer) */
  reachedNew: boolean;
  /** learning completed — comparison + payoff unlocked */
  completed: boolean;
  /** increments on REPLAY/RESET — deterministic run identity */
  runId: number;
};

export const initialMachine: MachineState = {
  phase: 'IDLE_OLD',
  morphT: 0,
  T: 0,
  signal: 'customer-issue',
  selectedNode: null,
  selectedEdge: null,
  paused: false,
  speed: 1,
  layer: null,
  overlays: { latency: false, human: false, knowledge: false },
  manualLock: false,
  reachedNew: false,
  completed: false,
  runId: 0,
};

export type SimEvent =
  | { type: 'PHASE_END' }
  | { type: 'SEND_SIGNAL'; signal?: SignalKey }
  | { type: 'NODE_INSPECT'; id: string }
  | { type: 'EDGE_INSPECT'; id: string }
  | { type: 'CLEAR_INSPECT' }
  | { type: 'REBUILD' }
  | { type: 'RUN_AGAIN' }
  | { type: 'SET_COMPARE_POSITION'; t: number }
  | { type: 'REPLAY' }
  | { type: 'RESET' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'SET_SPEED'; speed: 1 | 2 }
  | { type: 'SET_SIGNAL'; signal: SignalKey }
  | { type: 'SET_LAYER'; layer: LayerKey | null }
  | { type: 'TOGGLE_OVERLAY'; key: keyof Overlays }
  | { type: 'SEEK'; progress: number }
  | { type: 'MANUAL_LOCK' };

export function phaseDuration(phase: SimPhase): number {
  switch (phase) {
    case 'SIGNAL_OLD':
      return OLD_DURATION;
    case 'TRANSFORMING':
      return TRANSFORM_DURATION;
    case 'SIGNAL_NEW':
      return NEW_RUN_DURATION;
    case 'LEARNING':
      return LEARN_DURATION;
    default:
      return Infinity;
  }
}

export function machine(s: MachineState, ev: SimEvent): MachineState {
  switch (ev.type) {
    /** runtime loop crossed the current phase's end (dispatched once) */
    case 'PHASE_END':
      switch (s.phase) {
        case 'SIGNAL_OLD':
          return { ...s, T: OLD_DURATION, phase: 'OLD_COMPLETE' };
        case 'TRANSFORMING':
          return { ...s, T: 0, morphT: 1, phase: 'IDLE_NEW', reachedNew: true };
        case 'SIGNAL_NEW':
          return { ...s, T: 0, phase: 'LEARNING' };
        case 'LEARNING':
          return { ...s, T: LEARN_DURATION, phase: 'COMPARISON', completed: true };
        default:
          return s;
      }

    case 'SEND_SIGNAL':
      if (s.phase !== 'IDLE_OLD' && s.phase !== 'OLD_COMPLETE') return s;
      return {
        ...s,
        phase: 'SIGNAL_OLD',
        T: 0,
        signal: ev.signal ?? s.signal,
        selectedNode: null,
        selectedEdge: null,
        paused: false,
        layer: null,
      };

    case 'NODE_INSPECT':
      // inspection pauses the timeline without losing state
      return { ...s, selectedNode: ev.id, selectedEdge: null };

    case 'EDGE_INSPECT':
      return { ...s, selectedEdge: ev.id, selectedNode: null };

    case 'CLEAR_INSPECT':
      return { ...s, selectedNode: null, selectedEdge: null };

    case 'REBUILD':
      if (s.phase !== 'OLD_COMPLETE' && s.phase !== 'SIGNAL_OLD') return s;
      return { ...s, phase: 'TRANSFORMING', T: 0, morphT: 0, paused: false, selectedNode: null, selectedEdge: null };

    case 'RUN_AGAIN':
      if (s.phase !== 'IDLE_NEW' && s.phase !== 'COMPARISON') return s;
      return { ...s, phase: 'SIGNAL_NEW', T: 0, paused: false, selectedNode: null, selectedEdge: null };

    case 'SET_COMPARE_POSITION':
      if (s.phase !== 'COMPARISON') return s;
      return { ...s, morphT: Math.min(1, Math.max(0, ev.t)) };

    case 'REPLAY':
      // deterministic replay of the current scenario
      switch (s.phase) {
        case 'SIGNAL_OLD':
        case 'OLD_COMPLETE':
          return { ...s, phase: 'SIGNAL_OLD', T: 0, selectedNode: null, selectedEdge: null, runId: s.runId + 1 };
        case 'TRANSFORMING':
        case 'IDLE_NEW':
        case 'SIGNAL_NEW':
        case 'LEARNING':
          return { ...s, phase: 'TRANSFORMING', T: 0, morphT: 0, selectedNode: null, selectedEdge: null, runId: s.runId + 1 };
        case 'COMPARISON':
          return { ...s, phase: 'SIGNAL_NEW', T: 0, morphT: 1, selectedNode: null, selectedEdge: null, runId: s.runId + 1 };
        default:
          return s;
      }

    case 'RESET':
      return {
        ...initialMachine,
        signal: s.signal,
        manualLock: s.manualLock,
        reachedNew: s.reachedNew,
        completed: s.completed,
        overlays: s.overlays,
        runId: s.runId + 1,
      };

    case 'PAUSE':
      return { ...s, paused: true };

    case 'RESUME':
      return { ...s, paused: false, selectedNode: null, selectedEdge: null };

    case 'SET_SPEED':
      // speed changes the elapsed-time multiplier; it never skips states
      return { ...s, speed: ev.speed };

    case 'SET_SIGNAL':
      if (s.phase !== 'IDLE_OLD' && s.phase !== 'OLD_COMPLETE') return s;
      return { ...s, signal: ev.signal };

    case 'SET_LAYER':
      return { ...s, layer: ev.layer };

    case 'TOGGLE_OVERLAY':
      return { ...s, overlays: { ...s.overlays, [ev.key]: !s.overlays[ev.key] } };

    case 'MANUAL_LOCK':
      return s.manualLock ? s : { ...s, manualLock: true };

    case 'SEEK': {
      // scroll progression — dispatches through the SAME machine.
      // Manual interaction permanently wins: after manualLock, scroll is a no-op.
      if (s.manualLock) return s;
      // While !manualLock scroll owns the whole story and may scrub it in
      // BOTH directions — the phases below were set by SEEK itself.
      const p = Math.min(1, Math.max(0, ev.progress));
      if (p < 0.2) return { ...s, phase: 'IDLE_OLD', T: 0, morphT: 0, selectedNode: null, selectedEdge: null };
      if (p < 0.4) return { ...s, phase: 'SIGNAL_OLD', T: ((p - 0.2) / 0.2) * OLD_DURATION * 0.999, morphT: 0, selectedNode: null, selectedEdge: null };
      if (p < 0.6) {
        const tt = ((p - 0.4) / 0.2) * TRANSFORM_DURATION * 0.999;
        const k = Math.min(1, tt / TRANSFORM_DURATION);
        const eased = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        return { ...s, phase: 'TRANSFORMING', T: tt, morphT: eased, selectedNode: null, selectedEdge: null };
      }
      if (p < 0.8) return { ...s, phase: 'IDLE_NEW', T: 0, morphT: 1, reachedNew: true, selectedNode: null, selectedEdge: null };
      const k = (p - 0.8) / 0.2;
      const total = k * (NEW_RUN_DURATION + LEARN_DURATION);
      if (total < NEW_RUN_DURATION * 0.999)
        return { ...s, phase: 'SIGNAL_NEW', T: total, morphT: 1, reachedNew: true, selectedNode: null, selectedEdge: null };
      if (total < NEW_RUN_DURATION + LEARN_DURATION * 0.98)
        return { ...s, phase: 'LEARNING', T: total - NEW_RUN_DURATION, morphT: 1, reachedNew: true, selectedNode: null, selectedEdge: null };
      return { ...s, phase: 'COMPARISON', T: LEARN_DURATION, morphT: 1, reachedNew: true, completed: true, selectedNode: null, selectedEdge: null };
    }

    default:
      return s;
  }
}
