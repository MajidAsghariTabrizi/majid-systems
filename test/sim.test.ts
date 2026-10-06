import test from 'node:test';
import assert from 'node:assert/strict';

import {
  EDGES,
  NODES,
  NODE_BY_ID,
  NEW_IDS,
  edgeInfoText,
  nodePos,
} from '../src/lib/sim/model';
import {
  LEARN_DURATION,
  NEW_RUN_DURATION,
  NEW_STEPS,
  NEW_TOTAL_MINUTES,
  OLD_DURATION,
  OLD_TOTAL_HANDOFFS,
  OLD_TOTAL_HOURS,
  TRANSFORM_DURATION,
  formatLatency,
  learnState,
  newFlow,
  oldFlow,
  transformT,
} from '../src/lib/sim/timeline';
import { initialMachine, machine, phaseDuration } from '../src/lib/sim/machine';
import {
  MOTION_SEMANTICS,
  SIM_BRAIN,
  SIM_CONTROLS,
  SIM_DISCLOSURE,
  SIM_FINAL_CTA,
  SIM_GATE,
  SIM_LAYERS,
  SIM_LATENCY_DEF,
  SIM_LEARN,
  SIM_NODE_INFO,
  SIM_PAYOFF,
  SIM_SIGNALS,
  SIM_STRIP_SLOTS,
  SIM_TAG,
  SIM_TOTAL_OLD,
} from '../src/content/simulator';
import { HERO } from '../src/content/quantiviq';

/* ------------------------------------------------------------------ */
/* timeline — the old flow is the latency machine                      */
/* ------------------------------------------------------------------ */

test('old flow totals: 101 hours ≈ 4.2 days, 17 handoffs', () => {
  assert.equal(OLD_TOTAL_HOURS, 101);
  assert.equal(OLD_TOTAL_HANDOFFS, 17);
  assert.equal(SIM_TOTAL_OLD, '4.2 DAYS');
  assert.ok(OLD_DURATION > 20 && OLD_DURATION < 30, `OLD_DURATION in a watchable range, got ${OLD_DURATION}`);
});

test('oldFlow is pure/deterministic and latency is monotone', () => {
  const ts = [0, 0.5, 3, 7.3, 12, 19, 22.9, OLD_DURATION];
  for (const t of ts) {
    assert.deepEqual(oldFlow(t), oldFlow(t), `oldFlow(${t}) deterministic`);
  }
  let prev = -1;
  for (let t = 0; t <= OLD_DURATION; t += 0.25) {
    const f = oldFlow(t);
    assert.ok(f.latencyHours >= prev, `latency monotone at T=${t}`);
    prev = f.latencyHours;
  }
  const done = oldFlow(OLD_DURATION);
  assert.equal(done.phase, 'done');
  assert.equal(done.handoffs, 17);
  assert.equal(done.lossBits, 5);
  assert.equal(done.toNode, 'ACTION');
});

test('old flow hits every hop of the 4.2-day chain', () => {
  const chain = ['EMPLOYEE', 'MANAGER', 'SLACK', 'MEETING', 'ANALYST', 'DIRECTOR', 'APPROVAL', 'ACTION'];
  const seen = new Set<string>();
  for (let t = 0; t <= OLD_DURATION; t += 0.05) seen.add(oldFlow(t).toNode);
  for (const n of chain) assert.ok(seen.has(n), `flow must reach ${n}`);
});

test('new flow: ~12 minutes, 2 human handoffs semantics, ends back at the Brain', () => {
  assert.equal(NEW_TOTAL_MINUTES, 12);
  assert.ok(NEW_STEPS.length >= 12);
  const end = newFlow(NEW_RUN_DURATION - 0.001);
  assert.equal(end.toNode, NEW_IDS.brain, 'the loop returns to the Brain');
  assert.equal(newFlow(NEW_RUN_DURATION - 0.001).latencyMin, 12);
  assert.deepEqual(newFlow(3.7), newFlow(3.7), 'newFlow deterministic');
  const kinds = new Set(NEW_STEPS.map((s) => s.kind));
  for (const k of ['travel', 'wait', 'brain', 'investigate', 'gate', 'gate-open']) {
    assert.ok(kinds.has(k), `new flow must include a ${k} step`);
  }
});

test('transformT is bounded and monotone (one continuous morph)', () => {
  assert.equal(transformT(0), 0);
  assert.equal(transformT(TRANSFORM_DURATION), 1);
  let prev = -1;
  for (let t = 0; t <= TRANSFORM_DURATION; t += 0.1) {
    const m = transformT(t);
    assert.ok(m >= prev && m <= 1, `morph monotone/bounded at t=${t}`);
    prev = m;
  }
  assert.equal(nodePos(NODES[0], 0).x, NODES[0].old.pos.x);
  assert.equal(nodePos(NODES[0], 1).x, NODES[0].new.pos.x);
});

test('learnState: KNOWN 31→32, UNKNOWN 4→3, loop closes', () => {
  const s0 = learnState(0);
  assert.equal(s0.knownAdded, false);
  const s1 = learnState(LEARN_DURATION);
  assert.equal(s1.knownAdded, true);
  assert.equal(s1.unknownReduced, true);
  assert.equal(s1.showBadges, true);
  assert.equal(s1.loopClosed, true);
});

test('formatLatency renders clock time then compact hours/days', () => {
  assert.equal(formatLatency(0), '00:00');
  assert.equal(formatLatency(7), '+7h');
  assert.equal(formatLatency(100), '+4.2d');
  for (let h = 0; h <= 101; h += 7) {
    assert.match(formatLatency(h), /^(\d{2}:\d{2}|\+\d+h|\+\d+(\.\d)?d)$/);
  }
});

/* ------------------------------------------------------------------ */
/* model integrity                                                     */
/* ------------------------------------------------------------------ */

test('model integrity: unique ids, resolvable refs, layers wired', () => {
  const nodeIds = NODES.map((n) => n.id);
  assert.equal(new Set(nodeIds).size, nodeIds.length, 'node ids unique');
  const edgeIds = EDGES.map((e) => e.id);
  assert.equal(new Set(edgeIds).size, edgeIds.length, `edge ids unique (old/new collisions namespaced) — got ${edgeIds.length - new Set(edgeIds).size} dupes`);
  for (const e of EDGES) {
    assert.ok(e.from in NODE_BY_ID, `${e.id}: from resolves`);
    assert.ok(e.to in NODE_BY_ID, `${e.id}: to resolves`);
  }
  for (const key of Object.values(NEW_IDS)) assert.ok(key in NODE_BY_ID, `NEW_IDS.${key} resolves`);
  for (const n of NODES) {
    if (n.ambient || n.id === 'SIGNAL') continue;
    assert.ok(n.layers.length > 0, `${n.id}: wired to at least one layer`);
  }
  const layerKeys = new Set(SIM_LAYERS.map((l) => l.key));
  const usedLayers = new Set(NODES.flatMap((n) => n.layers));
  for (const k of layerKeys) assert.ok(usedLayers.has(k), `layer ${k} is used by at least one node`);
});

test('every edge has a human explanation', () => {
  for (const e of EDGES) {
    const txt = edgeInfoText(e);
    assert.ok(typeof txt === 'string' && txt.length > 10, `${e.id}: explanation present`);
  }
});

/* ------------------------------------------------------------------ */
/* machine — the single source of truth                                */
/* ------------------------------------------------------------------ */

const walk = (events: Parameters<typeof machine>[1][]) => events.reduce(machine, initialMachine);

test('machine walks the full mission arc', () => {
  const s1 = machine(initialMachine, { type: 'SEND_SIGNAL' });
  assert.equal(s1.phase, 'SIGNAL_OLD');
  assert.equal(s1.manualLock, false, 'SEND_SIGNAL before lock stays scroll-owned');
  const s2 = machine(s1, { type: 'PHASE_END' });
  assert.equal(s2.phase, 'OLD_COMPLETE');
  const s3 = machine(s2, { type: 'REBUILD' });
  assert.equal(s3.phase, 'TRANSFORMING');
  assert.equal(s3.morphT, 0);
  const s4 = machine(s3, { type: 'PHASE_END' });
  assert.equal(s4.phase, 'IDLE_NEW');
  assert.equal(s4.morphT, 1);
  assert.equal(s4.reachedNew, true);
  const s5 = machine(s4, { type: 'RUN_AGAIN' });
  assert.equal(s5.phase, 'SIGNAL_NEW');
  const s6 = machine(s5, { type: 'PHASE_END' });
  assert.equal(s6.phase, 'LEARNING');
  const s7 = machine(s6, { type: 'PHASE_END' });
  assert.equal(s7.phase, 'COMPARISON');
  assert.equal(s7.completed, true);
  assert.equal(s7.morphT, 1);
});

test('REPLAY is deterministic — identical scripts produce identical traces', () => {
  const script = (): Parameters<typeof machine>[1][] => [
    { type: 'SEND_SIGNAL' },
    { type: 'PHASE_END' },
    { type: 'REBUILD' },
    { type: 'PHASE_END' },
    { type: 'RUN_AGAIN' },
    { type: 'PHASE_END' },
    { type: 'PHASE_END' },
    { type: 'REPLAY' },
    { type: 'PHASE_END' },
    { type: 'PHASE_END' },
    { type: 'PHASE_END' },
    { type: 'PHASE_END' },
  ];
  const strip = (s: ReturnType<typeof walk>) => ({
    phase: s.phase,
    morphT: s.morphT,
    completed: s.completed,
    reachedNew: s.reachedNew,
  });
  const traceA: unknown[] = [];
  let a: ReturnType<typeof walk> = initialMachine;
  for (const ev of script()) {
    a = machine(a, ev);
    traceA.push(strip(a));
  }
  const traceB: unknown[] = [];
  let b: ReturnType<typeof walk> = machine(initialMachine, { type: 'RESET' });
  for (const ev of script()) {
    b = machine(b, ev);
    traceB.push(strip(b));
  }
  assert.deepEqual(traceA, traceB);
});

test('RESET preserves signal, manualLock, reachedNew, completed, overlays', () => {
  let s = walk([
    { type: 'MANUAL_LOCK' },
    { type: 'TOGGLE_OVERLAY', key: 'latency' },
    { type: 'SET_SIGNAL', signal: 'revenue-drop' },
    { type: 'SEND_SIGNAL' },
    { type: 'PHASE_END' },
    { type: 'REBUILD' },
    { type: 'PHASE_END' },
    { type: 'RUN_AGAIN' },
    { type: 'PHASE_END' },
    { type: 'PHASE_END' },
  ]);
  s = machine(s, { type: 'RESET' });
  assert.equal(s.phase, 'IDLE_OLD');
  assert.equal(s.morphT, 0);
  assert.equal(s.T, 0);
  assert.equal(s.manualLock, true);
  assert.equal(s.reachedNew, true);
  assert.equal(s.completed, true);
  assert.equal(s.signal, 'revenue-drop');
  assert.deepEqual(s.overlays, { latency: true, human: false, knowledge: false });
});

test('SET_COMPARE_POSITION only in COMPARISON, clamped to [0,1]', () => {
  const fresh = machine(initialMachine, { type: 'SET_COMPARE_POSITION', t: 0.7 });
  assert.equal(fresh.phase, 'IDLE_OLD', 'no compare before the arc completes');
  let s = walk([
    { type: 'SEND_SIGNAL' },
    { type: 'PHASE_END' },
    { type: 'REBUILD' },
    { type: 'PHASE_END' },
    { type: 'RUN_AGAIN' },
    { type: 'PHASE_END' },
    { type: 'PHASE_END' },
  ]);
  s = machine(s, { type: 'SET_COMPARE_POSITION', t: 1.4 });
  assert.equal(s.morphT, 1);
  s = machine(s, { type: 'SET_COMPARE_POSITION', t: -0.2 });
  assert.equal(s.morphT, 0);
  s = machine(s, { type: 'SET_COMPARE_POSITION', t: 0.5 });
  assert.equal(s.morphT, 0.5);
});

test('SEEK: scroll owns the story until first manual interaction — then is a permanent no-op', () => {
  let s = machine(initialMachine, { type: 'SEEK', progress: 0.5 });
  assert.equal(s.phase, 'TRANSFORMING');
  assert.ok(s.morphT > 0, 'scroll drives the morph');
  s = machine(s, { type: 'SEEK', progress: 0.1 });
  assert.equal(s.phase, 'IDLE_OLD', 'scroll can scrub backward while unlocked');
  s = machine(s, { type: 'SEEK', progress: 0.95 });
  assert.equal(s.phase, 'SIGNAL_NEW');
  s = machine(s, { type: 'MANUAL_LOCK' });
  s = machine(s, { type: 'SEEK', progress: 0.05 });
  assert.equal(s.phase, 'SIGNAL_NEW', 'manual interaction permanently disables scroll control');
});

test('inspection pauses but never corrupts the arc', () => {
  let s = machine(initialMachine, { type: 'SEND_SIGNAL' });
  s = machine(s, { type: 'NODE_INSPECT', id: 'MEETING' });
  assert.equal(s.selectedNode, 'MEETING');
  assert.equal(s.phase, 'SIGNAL_OLD');
  s = machine(s, { type: 'CLEAR_INSPECT' });
  assert.equal(s.selectedNode, null);
  s = machine(s, { type: 'PHASE_END' });
  assert.equal(s.phase, 'OLD_COMPLETE');
});

test('only running phases have finite durations (no per-frame machine events)', () => {
  for (const p of ['IDLE_OLD', 'OLD_COMPLETE', 'IDLE_NEW', 'COMPARISON'] as const) {
    assert.equal(Number.isFinite(phaseDuration(p)), false, `${p} has no runtime clock`);
  }
  for (const p of ['SIGNAL_OLD', 'TRANSFORMING', 'SIGNAL_NEW', 'LEARNING'] as const) {
    assert.ok(Number.isFinite(phaseDuration(p)), `${p} runs on the single rAF clock`);
  }
});

/* ------------------------------------------------------------------ */
/* content — mission-exact copy                                        */
/* ------------------------------------------------------------------ */

test('hero copy is mission-exact', () => {
  assert.equal(HERO.tag, 'FROM COMPANY-AS-CHART / TO COMPANY-AS-SYSTEM');
  assert.equal(HERO.h1, 'REBUILD THE COMPANY.');
  assert.equal(HERO.sub, 'For an era where intelligence is no longer exclusively human.');
  assert.equal(
    HERO.bodyP1,
    'Most companies added AI to the old operating model. The bottleneck is still the company itself.'
  );
  assert.equal(
    HERO.bodyP2,
    'Quantiviq redesigns how work, decisions, knowledge and authority move — so humans and agents operate as one learning system.'
  );
  assert.equal(HERO.ctaPrimary.label, 'EXPLORE THE SYSTEM');
  assert.equal(HERO.ctaSecondary.label, 'REBUILD A FUNCTION');
  assert.equal(HERO.ctaPrimary.href, '#simulator');
});

test('payoff, latency definition and final CTA are mission-exact', () => {
  assert.equal(SIM_PAYOFF.h, 'SAME COMPANY. DIFFERENT OPERATING PHYSICS.');
  assert.equal(SIM_PAYOFF.sub, 'The model was never the bottleneck. The company was.');
  assert.equal(
    SIM_LATENCY_DEF.body,
    'The time between a signal entering the organization and the organization producing the right response — and learning from the outcome.'
  );
  assert.equal(SIM_LATENCY_DEF.head, 'COMPANY LATENCY');
  assert.equal(SIM_FINAL_CTA.label, 'EXPLORE THE ORGANIZATION OS');
  assert.equal(SIM_TAG, 'FROM COMPANY-AS-CHART / TO COMPANY-AS-SYSTEM');
  assert.ok(SIM_DISCLOSURE.tag.includes('ILLUSTRATIVE ORGANIZATION'));
  assert.ok(SIM_DISCLOSURE.body.length > 0);
});

test('authority gate and learning copy are mission-exact', () => {
  assert.equal(SIM_GATE.principle, 'INTELLIGENCE IS NOT AUTHORITY.');
  assert.deepEqual(SIM_GATE.rows, [
    { k: 'RISK', v: 'LOW' },
    { k: 'REVERSIBLE', v: 'YES' },
    { k: 'AUTHORITY', v: 'GRANTED' },
  ]);
  assert.ok(SIM_LEARN.update.includes('NEW KNOWLEDGE +1'));
  assert.ok(SIM_LEARN.update.includes('LEARNING LOOP CLOSED'));
});

test('brain counters are 31/4/3/1/12 and the investigation path is exact', () => {
  assert.deepEqual(SIM_BRAIN.counters, { known: 31, unknown: 4, stale: 3, disputed: 1, procedures: 12 });
  assert.deepEqual(SIM_BRAIN.investigatePath, ['BRAIN', 'INVESTIGATE', 'ENTERPRISE SYSTEM', 'EVIDENCE', 'BRAIN', 'DECISION']);
  assert.equal(SIM_BRAIN.card.head, 'WHAT WE KNOW');
  assert.equal(SIM_BRAIN.card.changedHead, 'WHAT CHANGED');
  assert.ok(SIM_BRAIN.card.known.length >= 2);
});

test('controls, strip slots and signals are complete', () => {
  assert.equal(SIM_CONTROLS.send, 'SEND A SIGNAL');
  assert.equal(SIM_CONTROLS.rebuild, 'REBUILD THIS COMPANY');
  assert.equal(SIM_CONTROLS.runAgain, 'RUN THE SAME SIGNAL');
  assert.equal(SIM_CONTROLS.showLatency, 'SHOW LATENCY');
  assert.equal(SIM_CONTROLS.showHuman, 'SHOW HUMAN DEPENDENCY');
  assert.equal(SIM_CONTROLS.showKnowledge, 'SHOW KNOWLEDGE FLOW');
  assert.equal(SIM_CONTROLS.replay, 'REPLAY');
  assert.equal(SIM_CONTROLS.reset, 'RESET');
  assert.deepEqual(SIM_STRIP_SLOTS, {
    entered: 'WHAT ENTERED',
    where: 'WHERE IT IS',
    why: 'WHY IT WAITED',
    who: 'WHO ACTED',
    changed: 'WHAT CHANGED',
    learned: 'WHAT WAS LEARNED',
  });
  assert.equal(SIM_SIGNALS.length, 4);
  for (const k of ['WAITING', 'HANDOFF', 'CONTEXT_LOSS', 'MEETING', 'APPROVAL'] as const) {
    assert.ok(MOTION_SEMANTICS[k], `motion semantics include ${k}`);
  }
});

test('layer explorer has the 8 layers after the transformation', () => {
  assert.equal(SIM_LAYERS.length, 8);
  const labels = SIM_LAYERS.map((l) => l.label);
  for (const expected of ['ORGANIZATION DESIGN', 'AUTHORITY', 'COMPANY BRAIN', 'EVALUATION']) {
    assert.ok(labels.includes(expected), `layer ${expected} present`);
  }
});

test('no node boxes overlap at either end-state (readable labels)', () => {
  for (const t of [0, 1] as const) {
    const pts = NODES.filter((n) => !n.ambient).map((n) => ({ id: n.id, p: nodePos(n, t) }));
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].p.x - pts[j].p.x;
        const dy = pts[i].p.y - pts[j].p.y;
        const dist = Math.hypot(dx, dy);
        assert.ok(dist >= 58, `t=${t}: ${pts[i].id}↔${pts[j].id} too close (${dist.toFixed(0)}px)`);
      }
    }
  }
});

test('every non-ambient node has inspection copy', () => {
  for (const n of NODES) {
    if (n.ambient) continue;
    const info = SIM_NODE_INFO[n.id];
    assert.ok(info, `${n.id}: SIM_NODE_INFO entry`);
    assert.ok(info.lines.length >= 2, `${n.id}: at least two explanation lines`);
  }
});
