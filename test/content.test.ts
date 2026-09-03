import test from 'node:test';
import assert from 'node:assert/strict';

import { PROJECTS } from '../src/content/projects';
import { NOTES } from '../src/content/notes';
import { CAPABILITIES } from '../src/content/capabilities';
import { PRINCIPLES } from '../src/content/principles';
import { SITE, NAV } from '../src/content/shared';

test('SITE constants are present and well-formed', () => {
  assert.equal(typeof SITE.name, 'string');
  assert.ok(SITE.name.length > 0);
  assert.match(SITE.canonicalUrl, /^https:\/\//);
  assert.match(SITE.githubUrl, /^https:\/\/(?:[\w-]+\.)?github\.com\//);
  assert.match(SITE.linkedinUrl, /^https:\/\/www\.linkedin\.com\//);
  assert.ok(Array.isArray(NAV) && NAV.length > 0);
});

test('PROJECTS contains the four flagship entries', () => {
  const slugs = PROJECTS.map((p) => p.slug);
  assert.ok(slugs.includes('phoenix'));
  assert.ok(slugs.includes('smart-trader'));
  assert.ok(slugs.includes('free-best-router'));
  assert.ok(slugs.includes('universal-engineering-agent'));
});

test('Every flagship project has all required fields', () => {
  const flagship = PROJECTS.filter((p) => p.category === 'flagship');
  for (const p of flagship) {
    assert.ok(p.name, `${p.slug}: name`);
    assert.ok(p.oneLiner, `${p.slug}: oneLiner`);
    assert.ok(p.thesis, `${p.slug}: thesis`);
    assert.ok(p.problem, `${p.slug}: problem`);
    assert.ok(Array.isArray(p.whatIBuilt) && p.whatIBuilt.length > 0, `${p.slug}: whatIBuilt`);
    assert.ok(Array.isArray(p.decisions) && p.decisions.length > 0, `${p.slug}: decisions`);
    assert.ok(Array.isArray(p.whatFailed) && p.whatFailed.length > 0, `${p.slug}: whatFailed`);
    assert.ok(
      Array.isArray(p.technicalImplementation) && p.technicalImplementation.length > 0,
      `${p.slug}: technicalImplementation`
    );
    assert.ok(Array.isArray(p.lessons) && p.lessons.length > 0, `${p.slug}: lessons`);
    assert.ok(p.currentState, `${p.slug}: currentState`);
    assert.match(p.githubUrl, /^https:\/\/github\.com\//, `${p.slug}: githubUrl`);
    assert.ok(Array.isArray(p.languages) && p.languages.length > 0, `${p.slug}: languages`);
    assert.ok(p.dates?.started, `${p.slug}: dates.started`);
  }
});

test('Phoenix never claims fabricated metrics', () => {
  const phoenix = PROJECTS.find((p) => p.slug === 'phoenix');
  assert.ok(phoenix);
  assert.ok(
    !/\$\d|\d+\s*(usd|dollars|eth)/i.test(phoenix.currentState),
    'no fabricated currency claims in currentState'
  );
  assert.ok(
    !/\$\d|\d+\s*(usd|dollars|eth)/i.test(phoenix.thesis),
    'no fabricated currency claims in thesis'
  );
});

test('NOTES are well-formed and unique', () => {
  assert.ok(NOTES.length >= 8);
  const slugs = new Set();
  for (const n of NOTES) {
    assert.ok(n.slug, 'slug present');
    assert.ok(!slugs.has(n.slug), `duplicate note slug: ${n.slug}`);
    slugs.add(n.slug);
    assert.ok(n.title, `${n.slug}: title`);
    assert.ok(n.lede, `${n.slug}: lede`);
    assert.ok(Array.isArray(n.body) && n.body.length > 0, `${n.slug}: body`);
  }
});

test('CAPABILITIES groups cover product/ai/systems/engineering', () => {
  const cats = CAPABILITIES.map((c) => c.category);
  for (const expected of ['product', 'ai', 'systems', 'engineering']) {
    assert.ok(cats.includes(expected), `missing capability category: ${expected}`);
  }
  for (const c of CAPABILITIES) {
    assert.ok(c.title, 'capability title');
    assert.ok(c.items.length > 0, `${c.title}: items`);
  }
});

test('PRINCIPLES are non-empty', () => {
  assert.ok(PRINCIPLES.length >= 8);
  for (const p of PRINCIPLES) {
    assert.ok(p.title, 'principle title');
    assert.ok(p.body, `${p.title}: body`);
  }
});