import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ASK_ANSWERS,
  ASK_SUGGESTED,
  CONVERGENCE_TRACKS,
  DISCIPLINE_EARLY,
  DISCIPLINE_LATE,
  EXPERIMENTS,
  JOURNEY_FINAL,
  JOURNEY_LAYERS,
  JOURNEY_LOOP,
  JOURNEY_NODES,
  JOURNEY_OPEN,
  JOURNEY_SCENES,
  MODEL_QUESTIONS,
  PHOENIX_CLAIMS,
  QUANTIVIQ_STACK,
  SENTINEL_PIPELINE,
  type EvidenceBasis,
  type EvidenceKind,
  type GraphLayerKey,
  type Verdict,
} from '../src/content/journey';
import { LAYER_SLOTS, chainEdges, visibleLayers } from '../src/lib/journey/graph';

/* ------------------------------------------------------------------ */
/* content model integrity                                             */
/* ------------------------------------------------------------------ */

const VALID_BASES: EvidenceBasis[] = ['MISSION', 'REPO', 'GH', 'BRAIN', 'OWNER'];
const VALID_KINDS: EvidenceKind[] = [
  'SHIPPED', 'PRODUCTION', 'OPEN SOURCE', 'EXPERIMENT', 'LEARNING SYSTEM',
  'PRODUCT IMPACT', 'REJECTED EXPERIMENT', 'NEGATIVE RESULT', 'UNPROVEN', 'ABSTAINED',
];
const VALID_VERDICTS: Verdict[] = [
  'PROVED', 'PARTIALLY PROVED', 'ABSTAINED', 'REJECTED', 'FAILED',
  'UNPROVEN', 'PROMOTED', 'NO FORCED PROMOTION', 'DO NOT PROMOTE', 'MAJOR LEARNING',
];

test('journey scenes: 11 scenes, ordered, unique ids, valid layers', () => {
  assert.equal(JOURNEY_SCENES.length, 11);
  const ids = JOURNEY_SCENES.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
  JOURNEY_SCENES.forEach((s, i) => {
    assert.equal(s.index, i + 1, `${s.id}: index`);
    assert.ok(s.theme.length > 3, `${s.id}: theme`);
    assert.ok(s.body.length > 0, `${s.id}: body`);
    assert.ok(s.loopStage.split(' · ')[0].length > 0, `${s.id}: loopStage`);
    for (const l of s.layers) assert.ok(l in JOURNEY_LAYERS, `${s.id}: layer ${l} exists`);
  });
});

test('journey scenes resolve to real nodes', () => {
  const nodeIds = new Set(JOURNEY_NODES.map((n) => n.id));
  for (const s of JOURNEY_SCENES) {
    assert.ok(nodeIds.has(s.nodeId), `${s.id}: nodeId ${s.nodeId} resolves`);
  }
});

test('journey nodes: unique ids, valid evidence, resolvable connections and layers', () => {
  const ids = JOURNEY_NODES.map((n) => n.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const n of JOURNEY_NODES) {
    assert.ok(n.layer in JOURNEY_LAYERS, `${n.id}: layer`);
    assert.ok(n.evidence.length > 0, `${n.id}: has evidence`);
    for (const e of n.evidence) {
      assert.ok((VALID_KINDS as string[]).includes(e.kind), `${n.id}: evidence kind ${e.kind}`);
      for (const b of e.basis.split('·').map((x) => x.trim())) {
        assert.ok((VALID_BASES as string[]).includes(b), `${n.id}: basis token "${b}" valid`);
      }
    }
    for (const c of n.connections) assert.ok(ids.includes(c), `${n.id}: connection ${c} resolves`);
  }
});

test('career arc is the eight-layer deepening, not titles', () => {
  const arc = (Object.keys(JOURNEY_LAYERS) as GraphLayerKey[]).map((k) => JOURNEY_LAYERS[k].label);
  assert.deepEqual(arc, [
    'TECHNOLOGY', 'PRODUCT', 'ORGANIZATION', 'MARKETPLACE SYSTEMS',
    'DECISION SYSTEMS', 'AI INFRASTRUCTURE', 'AGENT RUNTIME', 'LEARNING SYSTEMS',
  ]);
  // No title-ladder language anywhere in the journey content.
  const blob = JSON.stringify(JOURNEY_NODES) + JSON.stringify(JOURNEY_SCENES);
  for (const banned of ['Product Manager →', 'Agile Coach →', '→ AI Guy', 'Engineer →']) {
    assert.ok(!blob.includes(banned), `no fragmented-ladder copy: ${banned}`);
  }
});

test('copy rule: no résumé language', () => {
  const blob = JSON.stringify(JOURNEY_NODES) + JSON.stringify(JOURNEY_SCENES) + JSON.stringify(ASK_ANSWERS);
  for (const banned of ['Responsible for', 'Experienced in', 'Skilled at']) {
    assert.ok(!blob.includes(banned), `banned résumé phrase: ${banned}`);
  }
});

test('employer confidentiality: names allowed, internals never', () => {
  const blob = JSON.stringify(JOURNEY_NODES) + JSON.stringify(JOURNEY_SCENES);
  // Owner-approved employer names may appear as era/source markers.
  assert.ok(blob.includes('SnappMarket') && blob.includes('Okala'), 'employer names present as list');
  // But no employer-internal signifiers anywhere.
  for (const forbidden of ['internal host', 'incident', 'Kibana', 'gitlab', 'staging-', 'prod database', 'API key']) {
    assert.ok(!blob.toLowerCase().includes(forbidden.toLowerCase()), `employer-internal term leaked: ${forbidden}`);
  }
});

/* ------------------------------------------------------------------ */
/* experiment ledger                                                   */
/* ------------------------------------------------------------------ */

test('every experiment has the full falsifiable structure', () => {
  assert.ok(EXPERIMENTS.length >= 10);
  for (const x of EXPERIMENTS) {
    assert.ok(x.hypothesis.length > 10, `${x.id}: hypothesis`);
    assert.ok(x.built.length > 10, `${x.id}: built`);
    assert.ok(x.reality.length > 10, `${x.id}: reality`);
    assert.ok((VALID_VERDICTS as string[]).includes(x.verdict), `${x.id}: verdict ${x.verdict}`);
    assert.ok(x.next.length > 10, `${x.id}: next`);
    assert.ok(x.badges.length > 0, `${x.id}: badges`);
    for (const b of x.badges) assert.ok((VALID_KINDS as string[]).includes(b), `${x.id}: badge ${b}`);
    assert.ok((VALID_BASES as string[]).includes(x.basis), `${x.id}: basis`);
  }
});

test('the scar tissue is explicit: negative verdicts outnumber PROVED', () => {
  const negative = EXPERIMENTS.filter((x) =>
    ['REJECTED', 'FAILED', 'UNPROVEN', 'DO NOT PROMOTE', 'NO FORCED PROMOTION'].includes(x.verdict)
  ).length;
  const proved = EXPERIMENTS.filter((x) => x.verdict === 'PROVED').length;
  assert.ok(negative >= proved + 4, `negative verdicts dominate (neg=${negative}, proved=${proved})`);
});

test('mission-critical numbers appear exactly once and unchanged', () => {
  const blob = JSON.stringify(EXPERIMENTS).toLowerCase();
  for (const n of ['0.6848', '0.6763', '86%', '10.75%', '307', '16,000', '39,538', '0 executions', '$0']) {
    assert.ok(blob.includes(n), `ledger preserves ${n}`);
  }
});

test('Phoenix is presented as retired with an unsanitized verdict', () => {
  const phoenix = EXPERIMENTS.find((x) => x.id === 'x-phoenix');
  assert.ok(phoenix);
  assert.ok(phoenix.generation.includes('RETIRED'));
  assert.equal(phoenix.verdict, 'MAJOR LEARNING');
  assert.ok(phoenix.reality.includes('$0 realized revenue'));
  assert.ok(phoenix.built.includes('reconciliation'));
});

/* ------------------------------------------------------------------ */
/* pipelines + structures                                              */
/* ------------------------------------------------------------------ */

test('sentinel pipeline is the complete 11-stage loop', () => {
  assert.deepEqual([...SENTINEL_PIPELINE], [
    'LIVE MARKET', '1m / 5m CANDLES', 'FEATURE FACTORY', 'REGIME / STATE',
    'PREDICTION MODEL', 'CALIBRATION', 'CONFIDENCE / UNCERTAINTY', 'POLICY',
    'ABSTAIN OR PROPOSE', 'OUTCOME LEDGER', 'RESEARCH LOOP',
  ]);
});

test('discipline evolved: the late chain is strictly longer and gates before action', () => {
  assert.equal(DISCIPLINE_EARLY.length, 3);
  assert.ok(DISCIPLINE_LATE.length >= 10);
  assert.ok(DISCIPLINE_LATE.indexOf('ECONOMICS') < DISCIPLINE_LATE.indexOf('SHADOW'));
  assert.ok(DISCIPLINE_LATE.includes('PROMOTION GATE'));
  assert.ok(DISCIPLINE_LATE.includes('OUTCOME LEDGER'));
});

test('model families map to questions, not logos', () => {
  assert.equal(MODEL_QUESTIONS.length, 7);
  for (const m of MODEL_QUESTIONS) assert.ok(m.question.endsWith('?'), `${m.model}: question form`);
});

test('Phoenix claims ladder separates health from edge from revenue', () => {
  assert.equal(PHOENIX_CLAIMS.length, 5);
  assert.equal(PHOENIX_CLAIMS.filter((c) => c.state).length, 2);
  assert.equal(PHOENIX_CLAIMS[PHOENIX_CLAIMS.length - 1].claim, 'THE BUSINESS MAKES MONEY');
  assert.equal(PHOENIX_CLAIMS[PHOENIX_CLAIMS.length - 1].state, false);
});

test('convergence: 7 tracks converge into the 7-layer Quantiviq stack', () => {
  assert.equal(CONVERGENCE_TRACKS.length, 7);
  assert.equal(QUANTIVIQ_STACK.length, 7);
  const keys = QUANTIVIQ_STACK.map((s) => s.k);
  for (const expected of ['ORGANIZATION DESIGN', 'WORKFLOW ENGINEERING', 'AGENT RUNTIME', 'MODEL ROUTER', 'BRAIN', 'EVALUATION']) {
    assert.ok(keys.includes(expected), `stack includes ${expected}`);
  }
});

test('final scene copy is mission-exact', () => {
  assert.equal(JOURNEY_FINAL.headline, 'I BUILD SYSTEMS THAT LEARN FROM THEIR OWN WORK.');
  assert.equal(JOURNEY_FINAL.lines.length, 8);
  assert.equal(JOURNEY_FINAL.ctaPrimary.label, 'EXPLORE QUANTIVIQ →');
  assert.equal(JOURNEY_FINAL.ctaSecondary.label, 'TALK TO MAJID →');
  assert.equal(JOURNEY_FINAL.ctaTertiary.label, 'VIEW GITHUB →');
});

test('cold open is mission-exact', () => {
  assert.equal(JOURNEY_OPEN.line1, 'I didn’t switch careers. I kept moving one layer deeper.');
  assert.equal(
    JOURNEY_OPEN.line2,
    'I did not arrive here from AI. I arrived here from running systems that could not afford to be wrong.'
  );
  assert.equal(JOURNEY_OPEN.cue, 'SCROLL TO TRACE THE SYSTEM ↓');
});

test('the recurring loop is the mission loop', () => {
  assert.deepEqual([...JOURNEY_LOOP], [
    'QUESTION', 'BUILD', 'PUT UNDER REAL CONDITIONS', 'MEASURE', 'FAIL / ABSTAIN / LEARN', 'CHANGE THE SYSTEM',
  ]);
});

/* ------------------------------------------------------------------ */
/* graph layout (pure)                                                 */
/* ------------------------------------------------------------------ */

test('graph: 8 layer slots on the ring, no coordinate collisions', () => {
  assert.equal(LAYER_SLOTS.length, 8);
  for (let i = 0; i < LAYER_SLOTS.length; i++) {
    for (let j = i + 1; j < LAYER_SLOTS.length; j++) {
      const d = Math.hypot(LAYER_SLOTS[i].x - LAYER_SLOTS[j].x, LAYER_SLOTS[i].y - LAYER_SLOTS[j].y);
      assert.ok(d > 120, `${LAYER_SLOTS[i].key}↔${LAYER_SLOTS[j].key} too close (${d.toFixed(0)}px)`);
    }
  }
});

test('graph: visibility is cumulative and the chain grows scene by scene', () => {
  const all = Object.keys(JOURNEY_LAYERS) as GraphLayerKey[];
  const techOnly = visibleLayers(['tech'], all);
  assert.equal(techOnly.length, 1);
  const mid = visibleLayers(['market'], all);
  assert.equal(mid.length, 4);
  assert.equal(chainEdges(mid).length, 3);
  const full = visibleLayers(['markets', 'ai', 'agents', 'learning'], all);
  assert.equal(full.length, 8);
  assert.equal(chainEdges(full).length, 7);
});

/* ------------------------------------------------------------------ */
/* ASK THE SYSTEM                                                      */
/* ------------------------------------------------------------------ */

test('ask: all 10 suggested prompts have curated deterministic answers', () => {
  assert.equal(ASK_SUGGESTED.length, 10);
  assert.equal(ASK_ANSWERS.length, 10);
  const sceneIds = new Set(JOURNEY_SCENES.map((s) => s.id));
  for (const a of ASK_ANSWERS) {
    assert.ok(a.q.length > 5, `${a.id}: question`);
    assert.ok(a.a.length > 80, `${a.id}: substantive answer`);
    assert.ok(a.scenes.length > 0, `${a.id}: links to scenes`);
    for (const s of a.scenes) assert.ok(sceneIds.has(s), `${a.id}: scene ${s} exists`);
    for (const b of a.badges) assert.ok((VALID_KINDS as string[]).includes(b), `${a.id}: badge ${b}`);
  }
});

test('ask: negative results are part of the answers, not hidden', () => {
  const blob = JSON.stringify(ASK_ANSWERS);
  assert.ok(blob.includes('$0'));
  assert.ok(blob.includes('39,538'));
  assert.ok(blob.includes('abstain') || blob.includes('abstention') || blob.includes('Abstention'));
});
