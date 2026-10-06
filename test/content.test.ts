import test from 'node:test';
import assert from 'node:assert/strict';

import { PROJECTS } from '../src/content/projects';
import { NOTES } from '../src/content/notes';
import { CAPABILITIES } from '../src/content/capabilities';
import { PRINCIPLES } from '../src/content/principles';
import { SITE, NAV, ROOT_NAV } from '../src/content/shared';
import {
  BRAND,
  LATENCY_FORMS,
  OS_LAYERS,
  PRIMITIVES,
  ENGAGEMENT,
  USE_CASES,
  BEFORE_AFTER,
} from '../src/content/quantiviq';

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

/* ============ Quantiviq commercial homepage ============ */

test('BRAND constants are well-formed', () => {
  assert.equal(BRAND.wordmark, 'QUANTIVIQ');
  assert.ok(BRAND.title.length > 10);
  assert.ok(BRAND.description.length > 40);
  assert.match(BRAND.ogImage, /^\/og-quantiviq\.svg$/);
});

test('ROOT_NAV covers the commercial sections and About', () => {
  const labels = ROOT_NAV.map((n) => n.label);
  for (const expected of ['Operating Model', 'Company Brain', 'Method', 'Proof', 'About']) {
    assert.ok(labels.includes(expected), `missing ROOT_NAV entry: ${expected}`);
  }
  for (const n of [...ROOT_NAV]) {
    assert.ok(n.href.length > 0, `${n.label}: href`);
  }
});

test('Latency forms: five, each with question and body', () => {
  assert.equal(LATENCY_FORMS.length, 5);
  for (const f of LATENCY_FORMS) {
    assert.ok(f.name, 'name');
    assert.ok(f.question.endsWith('?'), `${f.name}: question`);
    assert.ok(f.body.length > 40, `${f.name}: body`);
  }
});

test('OS layers: exactly eight, each with role and detail', () => {
  assert.equal(OS_LAYERS.length, 8);
  const keys = new Set<string>();
  for (const l of OS_LAYERS) {
    assert.ok(!keys.has(l.key), `duplicate os layer key: ${l.key}`);
    keys.add(l.key);
    assert.ok(l.name, `${l.key}: name`);
    assert.ok(l.role, `${l.key}: role`);
    assert.ok(l.detail.length > 40, `${l.key}: detail`);
  }
});

test('PRIMITIVES exclude Smart Trader and carry honest status', () => {
  for (const p of PRIMITIVES) {
    assert.ok(p.name, 'name');
    assert.ok(p.oneLiner, `${p.name}: oneLiner`);
    assert.ok(p.proof, `${p.name}: proof`);
    assert.ok(p.status, `${p.name}: status`);
    assert.ok(p.href.length > 0, `${p.name}: href`);
  }
  const names = PRIMITIVES.map((p) => p.name.toLowerCase());
  assert.ok(
    !names.includes('smart trader'),
    'Smart Trader must not appear as a primitive (frozen data)'
  );
});

test('ENGAGEMENT has seven ordered steps', () => {
  assert.equal(ENGAGEMENT.steps.length, 7);
  ENGAGEMENT.steps.forEach((s, i) => {
    assert.equal(s.num, String(i + 1).padStart(2, '0'), `step numbering at ${i}`);
    assert.ok(s.title, `${s.num}: title`);
    assert.ok(s.note, `${s.num}: note`);
  });
});

test('USE_CASES and BEFORE_AFTER are structurally sound', () => {
  assert.ok(USE_CASES.length >= 6);
  for (const u of USE_CASES) {
    assert.ok(u.name, 'use case name');
    assert.ok(u.why.length > 20, `${u.name}: why`);
  }
  assert.ok(BEFORE_AFTER.length >= 6);
  for (const r of BEFORE_AFTER) {
    assert.ok(r.dimension, 'dimension');
    assert.ok(r.before, `${r.dimension}: before`);
    assert.ok(r.after, `${r.dimension}: after`);
  }
});

test('Commercial copy avoids the banned buzzword list', () => {
  const banned = /\b(unlock|revolutioni[sz]e|supercharge|cutting-edge|seamless|ai-powered|next-generation)\b/i;
  const surfaces = [
    BRAND.description,
    LATENCY_FORMS.map((f) => `${f.name} ${f.question} ${f.body}`).join(' '),
    OS_LAYERS.map((l) => `${l.name} ${l.role} ${l.detail}`).join(' '),
    PRIMITIVES.map((p) => `${p.oneLiner} ${p.proof}`).join(' '),
    ENGAGEMENT.body,
    ENGAGEMENT.steps.map((s) => `${s.title} ${s.note}`).join(' '),
    USE_CASES.map((u) => `${u.name} ${u.why}`).join(' '),
    BEFORE_AFTER.map((r) => `${r.dimension} ${r.before} ${r.after}`).join(' '),
  ];
  surfaces.forEach((text, i) => {
    assert.ok(!banned.test(text), `buzzword found in surface ${i}: ${text.slice(0, 80)}`);
  });
});

test('Smart Trader is archived, never presented as live', () => {
  const st = PROJECTS.find((p) => p.slug === 'smart-trader');
  assert.ok(st);
  assert.equal(st.status, 'archived');
  assert.match(st.statusLabel, /archived/i);
  assert.match(st.currentState, /2026-09-23/, 'currentState names the freeze date');
  const liveClaims = /\b(live market|is live|currently live|active development)\b/i;
  assert.ok(
    !liveClaims.test(st.currentState),
    'currentState must not claim a live market'
  );
});

test('All project statuses belong to the declared union', () => {
  const allowed = new Set([
    'production-live',
    'production-no-alpha',
    'active-development',
    'archived',
    'reference-implementation',
    'released',
    'fork',
  ]);
  for (const p of PROJECTS) {
    assert.ok(
      allowed.has(p.status),
      `${p.slug}: status "${p.status}" not in union`
    );
  }
});