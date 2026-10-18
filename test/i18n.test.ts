import test from 'node:test';
import assert from 'node:assert/strict';

import { en } from '../src/content/i18n/en';
import { fa } from '../src/content/i18n/fa';

/** Recursively collect the shape (keys + array lengths) of a dict. */
function shape(v: unknown, prefix = ''): string[] {
  if (Array.isArray(v)) {
    const out = v.flatMap((item, i) => shape(item, `${prefix}[${i}]`));
    return [`${prefix}(${v.length})`, ...out];
  }
  if (v && typeof v === 'object') {
    return Object.entries(v as Record<string, unknown>).flatMap(([k, val]) => shape(val, prefix ? `${prefix}.${k}` : k));
  }
  return [prefix];
}

test('FA dictionary mirrors EN exactly (keys and array lengths)', () => {
  const enShape = shape(en);
  const faShape = shape(fa);
  assert.deepEqual(faShape, enShape);
});

test('No empty strings in the FA dictionary', () => {
  const empties: string[] = [];
  (function walk(v: unknown, p = '') {
    if (typeof v === 'string') {
      if (v.trim() === '') empties.push(p);
    } else if (Array.isArray(v)) {
      v.forEach((x, i) => walk(x, `${p}[${i}]`));
    } else if (v && typeof v === 'object') {
      for (const [k, val] of Object.entries(v)) walk(val, p ? `${p}.${k}` : k);
    }
  })(fa);
  assert.deepEqual(empties, []);
});

test('FA proof statuses stay as canonical Latin codes', () => {
  const statuses = fa.proof.items.map((i) => i.status);
  assert.deepEqual(statuses, en.proof.items.map((i) => i.status));
  assert.ok(statuses.includes('IN DAILY USE') && statuses.includes('MIT · v0.1.0'));
});

test('FA service offers keep canonical keys and intents', () => {
  assert.deepEqual(
    fa.services.offers.map((o) => [o.key, o.intent]),
    en.services.offers.map((o) => [o.key, o.intent])
  );
});

test('FA latency forms and flow match EN cardinality with bodies', () => {
  assert.equal(fa.home.latencyForms.length, 5);
  fa.home.latencyForms.forEach((f) => assert.ok(f.body.length > 20));
  assert.equal(fa.home.flow.length, 7);
  const authority = fa.home.flow.findIndex((s) => s.key === 'authority');
  const act = fa.home.flow.findIndex((s) => s.key === 'act');
  assert.ok(authority >= 0 && act > authority);
});

test('FA osLayers: eight layers with details', () => {
  assert.equal(fa.system.osLayers.length, 8);
  fa.system.osLayers.forEach((l) => assert.ok(l.detail.length > 30, `${l.num}: detail`));
});

test('FA contact success body keeps the {id} placeholder', () => {
  assert.ok(fa.contact.form.successBody.includes('{id}'));
});
