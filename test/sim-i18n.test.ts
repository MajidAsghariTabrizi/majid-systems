/**
 * Localization parity for the organization simulator.
 *
 * The simulator's copy is data-driven: `src/content/simulator.ts` holds the
 * structure and EN defaults, `src/content/i18n/sim.ts` holds both locales, and
 * `src/content/i18n/sim-data.ts` binds them. These tests fail if a Persian
 * visitor would see English copy because a key was missing.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import { makeSimData } from '@/content/i18n/sim-data';
import { SIM_EDGE_INFO, SIM_LAYERS, SIM_NODE_INFO } from '@/content/simulator';

const EN = makeSimData('en');
const FA = makeSimData('fa');

const PERSIAN = /[\u0600-\u06FF]/;
const hasPersian = (s: string) => PERSIAN.test(s);

/** Latin tokens that are never translated (units, ids, brand marks). */
const LATIN_ALLOWED = new Set(['1×', '2×', '00:00', '0', '2', '—', '', '~12 MIN', '4.2 DAYS', 'Slack', '· · ·']);

function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => collectStrings(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => collectStrings(v, out));
  return out;
}

test('EN bundle is the content module verbatim (no accidental rewrite)', () => {
  assert.equal(EN.controls.send, 'SEND A SIGNAL');
  assert.equal(EN.slots.why, 'WHY IT WAITED');
  assert.equal(EN.metricLabels.latency, 'COMPANY LATENCY');
  assert.equal(EN.oldMetrics.routing, 'HIGH');
  assert.equal(EN.newMetrics.knowledge, 'SHARED STATE');
  assert.equal(EN.tag, 'FROM COMPANY-AS-CHART / TO COMPANY-AS-SYSTEM');
  assert.equal(EN.totalOld, '4.2 DAYS');
  assert.equal(EN.payoff.h, 'SAME COMPANY. DIFFERENT OPERATING PHYSICS.');
  assert.equal(EN.disclosure.body, 'Conceptual simulation. Not client metrics.');
  assert.equal(EN.nodeLabel('CEO'), 'CEO');
  assert.equal(EN.edgeText('SIGNAL>EMPLOYEE'), SIM_EDGE_INFO['SIGNAL>EMPLOYEE']);
});

test('critical FA surfaces are Persian, never English fallback', () => {
  const critical: Array<[string, string]> = [
    ['controls.send', FA.controls.send],
    ['controls.rebuild', FA.controls.rebuild],
    ['controls.runAgain', FA.controls.runAgain],
    ['controls.replay', FA.controls.replay],
    ['controls.reset', FA.controls.reset],
    ['controls.showLatency', FA.controls.showLatency],
    ['controls.showHuman', FA.controls.showHuman],
    ['controls.showKnowledge', FA.controls.showKnowledge],
    ['controls.compareLeft', FA.controls.compareLeft],
    ['controls.compareRight', FA.controls.compareRight],
    ['controls.pauseHint', FA.controls.pauseHint],
    ['slots.entered', FA.slots.entered],
    ['slots.where', FA.slots.where],
    ['slots.why', FA.slots.why],
    ['slots.who', FA.slots.who],
    ['slots.changed', FA.slots.changed],
    ['slots.learned', FA.slots.learned],
    ['metricLabels.latency', FA.metricLabels.latency],
    ['metricLabels.handoffs', FA.metricLabels.handoffs],
    ['metricLabels.routing', FA.metricLabels.routing],
    ['metricLabels.knowledge', FA.metricLabels.knowledge],
    ['metricLabels.loop', FA.metricLabels.loop],
    ['oldMetrics.routing', FA.oldMetrics.routing],
    ['oldMetrics.knowledge', FA.oldMetrics.knowledge],
    ['newMetrics.routing', FA.newMetrics.routing],
    ['newMetrics.knowledge', FA.newMetrics.knowledge],
    ['newMetrics.loop', FA.newMetrics.loop],
    ['totalOld', FA.totalOld],
    ['payoff.h', FA.payoff.h],
    ['payoff.sub', FA.payoff.sub],
    ['disclosure.tag', FA.disclosure.tag],
    ['disclosure.body', FA.disclosure.body],
    ['gate.head', FA.gate.head],
    ['gate.principle', FA.gate.principle],
    ['learn.outcome', FA.learn.outcome],
    ['strip.humansRouting', FA.strip.humansRouting],
    ['strip.gateOpen', FA.strip.gateOpen],
    ['strip.structure', FA.strip.structure],
    ['strip.ready', FA.strip.ready],
    ['strip.chooseSignal', FA.strip.chooseSignal],
    ['strip.compare', FA.strip.compare],
    ['phase.traditional', FA.phase.traditional],
    ['phase.aiNative', FA.phase.aiNative],
    ['phase.restructuring', FA.phase.restructuring],
    ['phase.topologySettling', FA.phase.topologySettling],
    ['a11y.simAria', FA.a11y.simAria],
    ['a11y.rail', FA.a11y.rail],
    ['a11y.controls', FA.a11y.controls],
    ['a11y.chooseSignal', FA.a11y.chooseSignal],
    ['a11y.inspectNode', FA.a11y.inspectNode],
    ['a11y.closeInspect', FA.a11y.closeInspect],
    ['a11y.layerPanel', FA.a11y.layerPanel],
    ['inspect.becomes', FA.inspect.becomes],
    ['mobileLearnStep', FA.mobileLearnStep],
    ['exploreLayers', FA.exploreLayers],
    ['tag', FA.tag],
  ];
  for (const [name, value] of critical) {
    assert.ok(hasPersian(value), `${name} must be Persian in the FA bundle, got: ${JSON.stringify(value)}`);
  }
});

test('every signal, layer, gate row, learn badge and motion caption is Persian in FA', () => {
  for (const s of FA.signals) {
    assert.ok(hasPersian(s.label), `signal ${s.key} label`);
    assert.ok(hasPersian(s.note), `signal ${s.key} note`);
  }
  for (const l of FA.layers) {
    assert.ok(hasPersian(l.label), `layer ${l.key} label`);
    assert.ok(hasPersian(l.body), `layer ${l.key} body`);
  }
  assert.equal(FA.layers.length, SIM_LAYERS.length);
  for (const row of FA.gate.rows) assert.ok(hasPersian(row.k) && hasPersian(row.v), `gate row ${row.k}`);
  assert.ok(FA.learn.update.every(hasPersian), 'learn badges');
  assert.ok(FA.brain.card.known.every(hasPersian), 'brain known lines');
  assert.ok(FA.brain.card.changed.every(hasPersian), 'brain changed lines');
  assert.ok(FA.brain.card.next.every(hasPersian), 'brain next lines');
  assert.ok(hasPersian(FA.brain.card.head) && hasPersian(FA.brain.card.changedHead) && hasPersian(FA.brain.card.nextHead));
  for (const [k, v] of Object.entries(FA.motion)) {
    assert.ok(hasPersian(v), `motion caption ${k} must be Persian, got: ${JSON.stringify(v)}`);
  }
});

test('every node label and role in the topology is Persian in FA', () => {
  const labels = [
    'SIGNAL', 'CEO', 'VP', 'DIRECTOR', 'ANALYST', 'MANAGER', 'EMPLOYEE', 'SLACK', 'MEETING',
    'DASHBOARD', 'APPROVAL', 'BACKLOG', 'ACTION',
    'HUMAN AUTHORITY', 'CONTROL PLANE', 'WORKFLOWS', 'EVALUATION', 'AGENTS',
    'CONTEXT ASSEMBLY', 'HUMANS', 'COMPANY BRAIN', 'AUTHORITY GATE', 'ENTERPRISE SYSTEMS',
  ];
  for (const label of labels) {
    const fa = FA.nodeLabel(label);
    // Tool/product names stay as-is (a Persian reader knows "Slack").
    if (label === 'SLACK') {
      assert.equal(fa, 'Slack');
      continue;
    }
    assert.ok(hasPersian(fa), `node label ${label} must be Persian in FA, got: ${JSON.stringify(fa)}`);
    assert.notEqual(fa, EN.nodeLabel(label), `node label ${label} must differ from EN`);
  }
  const roles = [
    'entry', 'command', 'coordination', 'interpretation', 'human retrieval', 'routing',
    'channel', 'does the work', 'synchronization', 'reporting', 'sign-off', 'execution', 'queue',
    'designed flow · state', 'bounded execution', 'shared knowledge state', 'systems of record',
    'decision rights · escalation', 'outcome vs intent', 'judgment · ownership · exceptions',
    'risk · permission · reversibility',
  ];
  for (const role of roles) {
    assert.ok(hasPersian(FA.nodeRole(role)), `role ${role} must be Persian in FA, got: ${JSON.stringify(FA.nodeRole(role))}`);
  }
});

test('every edge tooltip is Persian in FA and matches the EN edge set', () => {
  const edgeIds = Object.keys(SIM_EDGE_INFO);
  // The component only ever renders edges that exist in the content module.
  assert.ok(edgeIds.length >= 20, `expected the full edge set, got ${edgeIds.length}`);
  for (const id of edgeIds) {
    const fa = FA.edgeText(id);
    assert.ok(hasPersian(fa), `edge ${id} must be Persian in FA, got: ${JSON.stringify(fa)}`);
    assert.notEqual(fa, FA.edgeFallback, `edge ${id} fell back to the generic line`);
  }
  // Unknown / synthetic ids fall back to the localized generic line, not to EN.
  assert.equal(FA.edgeText('NOPE>NOWHERE'), FA.edgeFallback);
  assert.ok(hasPersian(FA.edgeFallback));
});

test('aria templates compose without leaking {label}/{info} placeholders', () => {
  assert.ok(FA.a11y.inspectNode.includes('{label}'), 'inspectNode keeps its {label} slot');
  assert.ok(hasPersian(FA.a11y.inspectNode.replace('{label}', 'مدیرعامل')));
  assert.ok(!FA.a11y.inspectNodeBecomes.replace('{label}', 'x').replace('{becomes}', 'y').includes('{'));
  assert.ok(!FA.a11y.connection.replace('{info}', 'x').includes('{'));
  assert.ok(hasPersian(FA.a11y.connection.replace('{info}', 'اطلاعات')));
});

test('node inspection cards keep their line counts and are Persian in FA', () => {
  for (const [id, info] of Object.entries(SIM_NODE_INFO)) {
    const fa = FA.nodeInfo[id];
    assert.ok(fa, `missing FA node info for ${id}`);
    assert.equal(fa.lines.length, info.lines.length, `line count for ${id}`);
    for (const line of fa.lines) assert.ok(hasPersian(line), `node info line for ${id}: ${JSON.stringify(line)}`);
    if (info.becomes) {
      assert.ok(fa.becomes && hasPersian(fa.becomes), `becomes for ${id} must be Persian`);
    }
  }
});

test('every user-visible simulator string is translated in FA (zero EN leaks)', () => {
  /*
   * Structural ids are deliberately excluded: signal keys (`customer-issue`),
   * layer keys (`model-router`), latency numbers (`+6h`) and the canonical
   * Latin claim/stage codes (BRAIN, INVESTIGATE, EVIDENCE, DECISION) are ids,
   * not copy — the same convention the rest of the site uses for OBSERVED /
   * VERIFIED / UNKNOWN and for CSS-driven class names.
   */
  const display: string[] = [
    ...collectStrings(FA.controls),
    ...collectStrings(FA.slots),
    ...collectStrings(FA.metricLabels),
    ...collectStrings(FA.oldMetrics),
    ...collectStrings(FA.newMetrics),
    ...collectStrings(FA.strip),
    ...collectStrings(FA.phase),
    ...collectStrings(FA.payoff),
    ...collectStrings(FA.disclosure),
    ...collectStrings(FA.gate),
    ...collectStrings(FA.learn),
    ...collectStrings(FA.a11y),
    ...collectStrings(FA.inspect),
    ...collectStrings(FA.brain.card),
    ...collectStrings(FA.motion),
    ...FA.signals.flatMap((s) => [s.label, s.note]),
    ...FA.layers.flatMap((l) => [l.label, l.body]),
    ...Object.values(FA.nodeInfo).flatMap((i) => [...i.lines, ...(i.becomes ? [i.becomes] : [])]),
    ...Object.keys(SIM_EDGE_INFO).map((id) => FA.edgeText(id)),
    FA.totalOld,
    FA.tag,
    FA.edgeHead,
    FA.edgeFallback,
    FA.mobileLearnStep,
    FA.exploreLayers,
  ];
  const untranslated = display.filter((s) => !hasPersian(s) && !LATIN_ALLOWED.has(s));
  assert.deepEqual(untranslated, [], `untranslated FA display copy: ${JSON.stringify(untranslated.slice(0, 12))}`);
  assert.ok(display.length > 200, `expected a broad census, got ${display.length} strings`);
});

test('both bundles expose the same shape (locale cannot half-exist)', () => {
  const shape = (v: unknown): unknown =>
    Array.isArray(v) ? v.map(shape) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shape(x)])) : typeof v;
  const strip = (o: Record<string, unknown>) => {
    const { dict: _d, locale: _l, ...rest } = o;
    return rest;
  };
  assert.deepEqual(shape(strip(FA as unknown as Record<string, unknown>)), shape(strip(EN as unknown as Record<string, unknown>)));
});
