import test from 'node:test';
import assert from 'node:assert/strict';
import { lifecycleBase, canAdvanceLifecycle, advanceLifecycle } from '../lib/simulation-state';

test('discovery and route filtering cannot present an introduction before explicit acceptance', () => {
  assert.equal(lifecycleBase(0), 0);
  assert.equal(lifecycleBase(1), 0);
  for (const phase of [2, 3, 4, 5]) assert.equal(lifecycleBase(phase), 1);
  for (const phase of [0, 1, 2, 3, 4]) {
    assert.equal(canAdvanceLifecycle(phase, true, true), false);
    assert.equal(advanceLifecycle(5, phase, true, true), lifecycleBase(phase));
  }
});

test('both consent and sufficient example evidence are required, not one or the other', () => {
  for (const [consent, evidence] of [[false, false], [false, true], [true, false]]) {
    assert.equal(canAdvanceLifecycle(5, consent, evidence), false);
    assert.equal(advanceLifecycle(4, 5, consent, evidence), 1);
  }
  assert.equal(canAdvanceLifecycle(5, true, true), true);
});

test('accepted introduction, conversation, agreement and outcome require separate explicit advances', () => {
  let life = lifecycleBase(5);
  const reached: number[] = [];
  for (let action = 0; action < 4; action++) {
    life = advanceLifecycle(life, 5, true, true);
    reached.push(life);
  }
  assert.deepEqual(reached, [2, 3, 4, 5]);
  assert.equal(advanceLifecycle(life, 5, true, true), 5);
});

test('revoked consent or a conditional replacement route removes stale outcome progress', () => {
  assert.equal(advanceLifecycle(5, 5, false, true), 1);
  assert.equal(advanceLifecycle(5, 5, true, false), 1);
  assert.equal(advanceLifecycle(5, 0, false, false), 0);
  assert.equal(advanceLifecycle(Number.NaN, 5, true, true), 2);
});
