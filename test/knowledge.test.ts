/**
 * Silver-bullet knowledge layer — books / OSS atlas / flows / concepts.
 * Guards: exact 10 editions, ISBN-13 checksum validity, EN/FA parity,
 * honest ingestion statuses, license-boundary claims, cross-link integrity.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve(process.cwd(), 'content', 'knowledge');
const books = JSON.parse(fs.readFileSync(path.join(DIR, 'books.json'), 'utf8'));
const oss = JSON.parse(fs.readFileSync(path.join(DIR, 'oss.json'), 'utf8'));
const flows = JSON.parse(fs.readFileSync(path.join(DIR, 'flows.json'), 'utf8'));
const concepts = JSON.parse(fs.readFileSync(path.join(DIR, 'concepts.json'), 'utf8'));
const sources = JSON.parse(fs.readFileSync(path.join(DIR, 'sources.json'), 'utf8'));

const ISBNS = [
  '9781394381906', '9781633697621', '9781647824198', '9780593716717', '9781647826239',
  '9781647827205', '9781098166304', '9781098107963', '9780393635829', '9780691249131',
];

function isbn13Valid(isbn: string): boolean {
  if (!/^\d{13}$/.test(isbn)) return false;
  const digits = isbn.split('').map(Number);
  const sum = digits.slice(0, 12).reduce((s, d, i) => s + d * (i % 2 === 0 ? 1 : 3), 0);
  return (10 - (sum % 10)) % 10 === digits[12];
}

/* ------------------------------- books ------------------------------- */

test('books: exactly the 10 mission editions, all ISBNs valid', () => {
  assert.equal(books.books.length, 10);
  assert.deepEqual(
    books.books.map((b: any) => b.isbn13),
    ISBNS,
  );
  for (const b of books.books) assert.ok(isbn13Valid(b.isbn13), `checksum: ${b.isbn13}`);
});

test('books: unique slugs/isbns and required bibliographic fields', () => {
  const slugs = new Set(books.books.map((b: any) => b.slug));
  const isbns = new Set(books.books.map((b: any) => b.isbn13));
  assert.equal(slugs.size, 10);
  assert.equal(isbns.size, 10);
  for (const b of books.books) {
    assert.ok(b.title.en && b.title.fa, `title bilingual: ${b.slug}`);
    assert.ok(b.brief.en && b.brief.fa, `brief bilingual: ${b.slug}`);
    assert.ok(b.takeaway.en && b.takeaway.fa, `takeaway bilingual: ${b.slug}`);
    assert.ok(b.authors.length > 0 && b.publisher && b.year && b.edition);
    assert.match(b.officialSourceUrl, /^https:\/\//);
    assert.equal(b.questions.en.length, 3);
    assert.equal(b.questions.fa.length, 3);
    assert.ok(b.domains.length > 0);
    assert.ok(b.mindConcepts.length > 0);
  }
});

test('books: honest ingestion status — all catalog-only, no fake skills', () => {
  for (const b of books.books) {
    assert.equal(b.sourceStatus, 'catalog-only');
    assert.equal(b.skillStatus.state, 'not-generated');
    assert.ok(/authorized|full text/i.test(b.skillStatus.note));
  }
});

test('books: cover policy is hotlink-with-credit, never local copies', () => {
  assert.match(books.coverPolicy.primaryPattern, /covers\.openlibrary\.org\/b\/isbn\/\{isbn13\}-L\.jpg/);
  assert.match(books.coverPolicy.creditPattern, /openlibrary\.org\/isbn\/\{isbn13\}/);
  assert.ok(books.coverPolicy.fallback.includes('text-only'));
});

/* -------------------------------- OSS -------------------------------- */

test('oss: five layers in the mission order with boundaries', () => {
  assert.equal(oss.layers.length, 5);
  assert.deepEqual(oss.layers.map((l: any) => l.id), ['onyx', 'open-metadata', 'wren-ai', 'graphiti', 'holmesgpt']);
  for (const l of oss.layers) {
    assert.ok(l.brief.en && l.brief.fa, `brief bilingual: ${l.id}`);
    assert.ok(l.inputs.en && l.outputs.en && l.guard.en && l.whenNot.en);
    assert.ok(l.inputs.fa && l.outputs.fa && l.guard.fa && l.whenNot.fa);
    assert.match(l.githubUrl, /github\.com/);
    assert.ok(l.license.label.length > 0 && l.license.note.length > 40);
  }
});

test('oss: 2026 boundary facts are stated (WrenAI merge/legacy, Holmes write-mode, Onyx EE)', () => {
  const wren = oss.layers.find((l: any) => l.id === 'wren-ai')!;
  assert.ok(/May 2026/.test(wren.license.note), 'Wren Engine merge month');
  assert.ok(/legacy\/v1/.test(wren.license.note) && /not receive new security fixes/i.test(wren.license.note));
  const holmes = oss.layers.find((l: any) => l.id === 'holmesgpt')!;
  assert.ok(/Operator Mode|write back|remediate/i.test(holmes.license.note), 'Holmes write caveat');
  assert.ok(/not all holmesgpt features are read-only/i.test(holmes.license.note));
  const onyx = oss.layers.find((l: any) => l.id === 'onyx')!;
  assert.ok(/Enterprise Edition/i.test(onyx.license.note), 'Onyx EE distinction');
});

test('oss: explicitly research status, not deployed services', () => {
  assert.match(oss.status, /not deployed/i);
  assert.ok(oss.combinedStory.steps.length >= 10);
  for (const s of oss.combinedStory.steps) assert.ok(s.en && s.fa);
});

/* ------------------------------- flows ------------------------------- */

const CONTRACT_FIELDS = [
  'inputTrigger', 'actors', 'accountableOwner', 'decisionRights', 'policies', 'prerequisites',
  'evidenceSources', 'steps', 'dataAssets', 'tools', 'metrics', 'outcomes', 'humanGates',
  'failureModes', 'rollback', 'observability', 'lessons',
];

test('flows: 12 archetypes, full bilingual contract, unique ids', () => {
  assert.equal(flows.flows.length, 12);
  const ids = new Set(flows.flows.map((f: any) => f.id));
  assert.equal(ids.size, 12);
  for (const f of flows.flows) {
    for (const k of CONTRACT_FIELDS) {
      assert.ok(f[k]?.en, `flow ${f.id}.${k}.en`);
      assert.ok(f[k]?.fa, `flow ${f.id}.${k}.fa`);
    }
    assert.equal(f.publicSafe, true);
    assert.ok(f.version && f.approvedStatus);
  }
});

test('flows: cross-links resolve to real books/repos', () => {
  const bookSlugs = new Set(books.books.map((b: any) => b.slug));
  const repoIds = new Set(oss.layers.map((l: any) => l.id));
  for (const f of flows.flows) {
    for (const s of f.relatedBooks) assert.ok(bookSlugs.has(s), `flow ${f.id} -> book ${s}`);
    for (const r of f.relatedRepos) assert.ok(repoIds.has(r), `flow ${f.id} -> repo ${r}`);
  }
});

/* ----------------------------- concepts ------------------------------ */

test('concepts: at least 10 mindsets, bilingual', () => {
  assert.ok(concepts.concepts.length >= 10);
  const ids = new Set(concepts.concepts.map((c: any) => c.id));
  assert.equal(ids.size, concepts.concepts.length);
  for (const c of concepts.concepts) {
    assert.ok(c.name.en && c.name.fa && c.body.en && c.body.fa, `concept bilingual: ${c.id}`);
  }
});

/* ----------------------------- sources ------------------------------- */

test('sources: ledger covers every book reference and all five repos', () => {
  const urls = new Set(sources.sources.map((s: any) => s.url));
  for (const b of books.books) assert.ok(urls.has(b.officialSourceUrl), `source ledger: ${b.slug}`);
  for (const l of oss.layers) assert.ok(urls.has(l.githubUrl), `source ledger: ${l.id}`);
  assert.ok(urls.has('https://openlibrary.org/dev/docs/api/covers'));
});
