import test from 'node:test';
import assert from 'node:assert/strict';
import { SCENARIOS, LAYERS, getRoutes, getScenario, visibleEdges } from '../lib/model';

test('each fictional route and relationship resolves to entities in the same shared scenario', () => {
  assert.equal(SCENARIOS.length, 3);
  for (const scenario of SCENARIOS) {
    const ids = new Set(scenario.nodes.map((node) => node.id));
    assert.equal(ids.size, 5);
    for (const edge of scenario.edges) {
      assert.ok(ids.has(edge.from), `unknown source ${edge.id}`);
      assert.ok(ids.has(edge.to), `unknown destination ${edge.id}`);
      assert.notEqual(edge.from, edge.to);
      assert.ok(edge.minPhase >= 1 && edge.minPhase <= 5);
    }
    for (const route of scenario.routes) {
      assert.ok(route.nodeIds.every((id) => ids.has(id)));
      assert.ok(route.reason.length > 20);
      assert.ok(route.evidence.length >= 2);
      assert.ok(route.steps.length >= 4);
    }
  }
});

test('requiring evidence does not silently admit conditional alternatives or mutate source routes', () => {
  for (const scenario of SCENARIOS) {
    const baseline = JSON.stringify(scenario);
    const all = getRoutes(scenario.id, false);
    const evidenceReady = getRoutes(scenario.id, true);
    assert.ok(all.some((route) => !route.evidenceReady));
    assert.ok(evidenceReady.length > 0 && evidenceReady.length < all.length);
    assert.ok(evidenceReady.every((route) => route.evidenceReady));
    assert.equal(JSON.stringify(scenario), baseline);
    assert.deepEqual(getRoutes(scenario.id, true), evidenceReady);
  }
});

test('discovery starts disconnected, remains monotone and exposes only requested relationship layers', () => {
  for (const scenario of SCENARIOS) {
    assert.equal(visibleEdges(scenario.id, 0).length, 0);
    assert.equal(visibleEdges(scenario.id, -20).length, 0);
    assert.deepEqual(visibleEdges(scenario.id, 100), scenario.edges);
    for (let phase = 1; phase <= 5; phase++) {
      const previous = visibleEdges(scenario.id, phase - 1);
      const current = visibleEdges(scenario.id, phase);
      assert.ok(previous.every((edge) => current.includes(edge)));
    }
    for (const layer of LAYERS) {
      const edges = visibleEdges(scenario.id, 5, layer.id);
      assert.ok(edges.length > 0, `${scenario.id} missing ${layer.id}`);
      assert.ok(edges.every((edge) => edge.layers.includes(layer.id)));
    }
  }
});

test('entity and layer copy is Persian and does not contain fabricated numerical trust scores', () => {
  assert.equal(new Set(LAYERS.map((layer) => layer.id)).size, 6);
  const visibleCopy = [
    ...LAYERS.flatMap((layer) => [layer.title, layer.question, layer.description]),
    ...SCENARIOS.flatMap((scenario) => [scenario.title, scenario.need,
      ...scenario.nodes.flatMap((node) => [node.label, node.role, node.detail, node.evidence]),
      ...scenario.routes.flatMap((route) => [route.title, route.reason, ...route.steps, ...route.evidence])]),
  ];
  for (const copy of visibleCopy) {
    assert.match(copy, /[\u0600-\u06ff]/);
    assert.doesNotMatch(copy, /[A-Za-z]/);
    assert.doesNotMatch(copy, /[0-9۰-۹]\s*(?:درصد|امتیاز اعتماد)/);
  }
});

test('an unknown scenario fails explicitly instead of silently showing another economic need', () => {
  assert.throws(() => getScenario('unknown' as never), /سناریو/);
});
