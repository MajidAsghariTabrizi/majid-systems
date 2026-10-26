/**
 * Quantiviq Mind — public knowledge package builder.
 * Sources: ALREADY-PUBLISHED site content + public GitHub metadata only
 * (PUBLIC_VERIFIED by provenance). Default-deny for everything else.
 * Outputs: public-mind/build/public-knowledge.sqlite + manifest.json
 * Usage: node --experimental-strip-types --import ./scripts/mind-register-loader.mjs scripts/mind-build-knowledge.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT_DIR = path.join(ROOT, 'public-mind', 'build');
const DB = path.join(OUT_DIR, 'public-knowledge.sqlite');
const MANIFEST = path.join(OUT_DIR, 'manifest.json');

const SITE = 'https://quantiviq.xyz';
const now = new Date().toISOString();
const commit = execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim();

/** @param {string} s */
const sha = (s) => crypto.createHash('sha256').update(s, 'utf8').digest('hex').slice(0, 16);

/** Chunk markdown by ## headings, keeping frontmatter context. */
function chunkMarkdown(md, maxChars = 1400) {
  const lines = md.split('\n');
  const chunks = [];
  let title = '';
  let buf = [];
  const flush = () => {
    const text = buf.join('\n').trim();
    if (text.length > 120) chunks.push({ heading: title, text });
    buf = [];
  };
  for (const l of lines) {
    if (l.startsWith('## ')) { flush(); title = l.slice(3).trim(); }
    buf.push(l);
    if (buf.join('\n').length > maxChars) flush();
  }
  flush();
  return chunks;
}

const records = [];
/**
 * @param {object} r
 */
function add(r) {
  records.push({
    evidence_class: 'VERIFIED_FACT',
    confidence: 'high',
    publication_status: 'PUBLIC_VERIFIED',
    publication_approval: 'published-on-quantiviq.xyz',
    verified_at: now,
    updated_at: now,
    related_entities: [],
    related_frameworks: [],
    source_type: 'site',
    ...r,
  });
}

/* ---------- 1. Insights articles (EN + FA) ---------- */
const INS_DIR = path.join(ROOT, 'content', 'insights');
const INS_FA = path.join(INS_DIR, 'fa');
function ingestArticles(dir, locale) {
  let n = 0;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.md')).sort()) {
    const raw = fs.readFileSync(path.join(dir, f), 'utf8').replace(/\r\n/g, '\n');
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n/);
    if (!fmMatch) continue;
    const fm = fmMatch[1];
    const get = (k) => (fm.match(new RegExp(`^${k}: "?([^"\\n]+)`, 'm')) || [])[1] || '';
    const id = get('id'), slug = get('slug'), title = get('title');
    if (!slug) continue;
    const body = raw.slice(fmMatch[0].length);
    const url = locale === 'en' ? `${SITE}/en/insights/${slug}` : `${SITE}/fa/insights/${slug}`;
    // canonical evidence id is locale-independent so EN/FA copies share identity
    const canon = `insight-${id}-${slug}`;
    const chunks = chunkMarkdown(body);
    chunks.forEach((c, i) => {
      add({
        id: `${canon}-c${i}-${locale}`,
        canonical_id: canon,
        type: 'insight',
        title: `${title}${c.heading ? ' — ' + c.heading : ''}`,
        language: locale,
        content: c.text,
        source_url: url,
        source_hash: sha(c.text),
        related_frameworks: [get('pillar') || 'transformation-strategy'],
      });
    });
    n++;
  }
  return n;
}
const nEn = ingestArticles(INS_DIR, 'en');
const nFa = ingestArticles(INS_FA, 'fa');

/* ---------- 2. Structured site content via TS imports ---------- */
const { pathToFileURL } = await import('node:url');
const loadTs = async (rel) => import(pathToFileURL(path.join(ROOT, rel)).href);
const [princ, caps, projs, shared] = await Promise.all([
  loadTs('src/content/principles.ts'),
  loadTs('src/content/capabilities.ts'),
  loadTs('src/content/projects.ts'),
  loadTs('src/content/shared.ts'),
]);

// Principles: the site's /en/method publishes them in English; ingest canonical English text.
for (const [i, p] of princ.PRINCIPLES.entries()) {
  add({
    id: `principle-${i + 1}-${sha(p.title)}`,
    canonical_id: `principle-${i + 1}`,
    type: 'principle',
    title: p.title,
    language: 'en',
    content: `${p.title}\n\n${p.body}`,
    source_url: `${SITE}/en/method`,
    source_hash: sha(p.title),
    evidence_class: 'PUBLISHED_VIEWPOINT',
    related_frameworks: ['principles'],
  });
}

for (const g of caps.CAPABILITIES) {
  const items = (g.items || g.skills || []).map((s) => (typeof s === 'string' ? s : s.name || s.title || '')).filter(Boolean);
  add({
    id: `capability-${sha(g.id ?? g.title)}-en`,
    canonical_id: `capability-${g.id ?? g.title}`,
    type: 'capability',
    title: g.title ?? g.name,
    language: 'en',
    // cross-language tech vocabulary so FA queries reach these records
    content: `${g.title ?? g.name}\n${(g.summary ?? g.description ?? '').toString()}\nSkills: ${items.join(', ')}\nAliases: زبان‌ها فناوری مهارت typescript python rust go solidity`,
    source_url: `${SITE}/en/about`,
    source_hash: sha(g.title ?? ''),
  });
}

const ALIASES = {
  // cross-language proper nouns so Persian queries reach EN records (and vice versa)
  phoenix: 'فینیکس فینیکس Phoenix',
  'free-best-router': 'روتر مسیریاب مدل Free Best Router روتر رایگان',
  'smart-trader': 'تریدر هوشمند معامله‌گر Smart Trader',
  'universal-engineering-agent': 'ایجنت مهندسی عمومی Universal Engineering Agent',
  quantiviq: 'کوانتیویک',
};
for (const p of projs.PROJECTS) {
  const detail = [
    p.name, p.oneLiner, p.thesis, p.whyItMatters,
    `Status: ${p.statusLabel || p.status}`,
    p.languages ? `Languages: ${p.languages.join(', ')}` : '',
    p.githubUrl ? `Repo: ${p.githubUrl}` : '',
    ALIASES[p.slug] ? `Aliases: ${ALIASES[p.slug]}` : '',
  ].filter(Boolean).join('\n\n');
  add({
    id: `project-${p.slug}-en`,
    canonical_id: `project-${p.slug}`,
    type: 'project',
    title: `${p.name} — ${p.oneLiner || ''}`.trim(),
    language: 'en',
    content: detail,
    source_url: `${SITE}/work/${p.slug}`,
    source_hash: sha(p.slug),
  });
}

/* ---------- 3. Dict prose (about / leadership / method / system / proof / services) ---------- */
for (const loc of ['en', 'fa']) {
  const mod = await loadTs(`src/content/i18n/${loc}.ts`);
  const t = mod[loc] ?? mod.en ?? mod.fa ?? (mod.dict ? mod.dict(loc) : mod.default);
  const L = loc;
  const url = (p) => `${SITE}/${L}${p}`;

  // about story
  const ab = t.about ?? {};
  const story = [ab.h1, ab.p1, ab.p2, ab.p3].filter(Boolean).join('\n\n');
  if (story.length > 100) add({ id: `about-${L}`, canonical_id: 'about', type: 'identity', title: ab.h1 || 'About Majid', language: L, content: story, source_url: url('/about'), source_hash: sha('ab' + L) });

  // method stages
  const me = t.method ?? {};
  const meBody = [me.lede, (me.stages ?? []).map((s, i) => `${i + 1}. ${s.title}: ${s.note}`).join('\n'), me.close].filter(Boolean).join('\n\n');
  if (meBody.length > 100) add({ id: `method-${L}`, canonical_id: 'method', type: 'framework', title: me.h2 || me.h1 || 'Method', language: L, content: meBody, source_url: url('/method'), source_hash: sha('me' + L) });

  // system: eight OS layers
  const sy = t.system ?? {};
  const syBody = [sy.lede, (sy.osLayers ?? []).map((p) => `Layer ${p.num} — ${p.name}: ${p.role} ${p.detail || ''}`).join('\n'), sy.principle].filter(Boolean).join('\n\n');
  if (syBody.length > 100) add({ id: `system-${L}`, canonical_id: 'system', type: 'architecture', title: sy.h1 || 'The System', language: L, content: syBody, source_url: url('/system'), source_hash: sha('sy' + L) });

  // services offers
  const sv = t.services ?? {};
  const svBody = (sv.offers ?? []).map((s) => [s.name, s.oneLiner, s.whoFor && `For: ${Array.isArray(s.whoFor) ? s.whoFor.join(', ') : s.whoFor}`, s.deliverables && `Deliverables: ${Array.isArray(s.deliverables) ? s.deliverables.join('; ') : s.deliverables}`, s.process && `Process: ${Array.isArray(s.process) ? s.process.join(' → ') : s.process}`].filter(Boolean).join('\n')).join('\n\n');
  if (svBody.length > 100) add({ id: `services-${L}`, canonical_id: 'services', type: 'offering', title: sv.h1 || 'Services', language: L, content: svBody, source_url: url('/services'), source_hash: sha('sv' + L) });

  // proof cards
  const pf = t.proof ?? {};
  const pfBody = (pf.items ?? []).map((c) => `${c.name} — ${c.status} (${c.level}): ${c.blurb}`).join('\n\n');
  if (pfBody.length > 100) add({ id: `proof-${L}`, canonical_id: 'proof', type: 'evidence', title: pf.h1 || 'Proof', language: L, content: [pf.lede, pfBody].filter(Boolean).join('\n\n'), source_url: url('/proof'), source_hash: sha('pf' + L) });

  // leadership hero + problems + career + contact block
  const ls2 = t.leadership ?? {};
  const lsHero = [ls2.eyebrow, ls2.h1, ls2.sub, ls2.body].filter(Boolean).join('\n\n');
  if (lsHero.length > 100) add({ id: `leadership-hero-${L}`, canonical_id: 'leadership-hero', type: 'leadership', title: ls2.h1 || 'Leadership', language: L, content: lsHero, source_url: url('/leadership'), source_hash: sha('lh' + L) });
  const prob = ls2.problems ?? {};
  const probBody = (prob.items ?? prob.cards ?? []).map((x) => `${x.title}: ${x.body || x.blurb || x.lede || ''}`).join('\n\n');
  if (probBody.length > 80) add({ id: `leadership-problems-${L}`, canonical_id: 'leadership-problems', type: 'leadership', title: prob.title || prob.h2 || 'Problems Majid leads', language: L, content: probBody, source_url: url('/leadership'), source_hash: sha('lp' + L) });
  const career = ls2.career ?? {};
  const careerBody = (career.layers ?? career.items ?? []).map((x) => `${x.title ?? x.period ?? ''}: ${x.body ?? x.note ?? JSON.stringify(x)}`).join('\n\n');
  if (careerBody.length > 80) add({ id: `leadership-career-${L}`, canonical_id: 'leadership-career', type: 'career', title: career.title || career.h2 || 'Career', language: L, content: careerBody, source_url: url('/leadership'), source_hash: sha('lcr' + L) });
  const cb = ls2.contactBlock ?? {};
  const cbBody = [cb.title, cb.body, cb.mailto ? `Email: majid@quantiviq.xyz` : '', cb.cta].filter(Boolean).join('\n');
  if (cbBody.length > 60) add({ id: `leadership-contact-${L}`, canonical_id: 'leadership-contact', type: 'identity', title: cb.title || 'Hiring contact', language: L, content: cbBody, source_url: url('/leadership'), source_hash: sha('lct' + L) });
  const ev = ls2.evidence ?? {};
  const evBody = (ev.rows ?? ev.items ?? []).map((x) => `${x.title} [${x.chipKind ?? x.kind ?? ''}]: ${x.body ?? x.blurb ?? ''}`).join('\n\n');
  if (evBody.length > 80) add({ id: `leadership-evidence-${L}`, canonical_id: 'leadership-evidence', type: 'evidence', title: ev.title || ev.h2 || 'Evidence', language: L, content: evBody, source_url: url('/leadership'), source_hash: sha('le' + L) });
  const cases = ls2.cases ?? {};
  const caseBody = [cases.title, cases.intro, (cases.steps ?? []).map((s, i) => `${i + 1}. ${typeof s === 'string' ? s : s.title + ': ' + (s.body ?? '')}`).join('\n')].filter(Boolean).join('\n\n');
  if (caseBody.length > 80) add({ id: `leadership-case-${L}`, canonical_id: 'leadership-case', type: 'framework', title: cases.title || 'Case template', language: L, content: caseBody, source_url: url('/leadership'), source_hash: sha('lc' + L), evidence_class: 'DEMONSTRATION' });

  // contact intents
  const ct = t.contact ?? {};
  if (ct.hero?.lede || ct.lede) add({ id: `contact-${L}`, canonical_id: 'contact', type: 'identity', title: 'Contact', language: L, content: [ct.hero?.lede, ct.lede, ct.direct].filter(Boolean).join('\n\n'), source_url: url('/contact'), source_hash: sha('ct' + L) });
}

/* ---------- 4. Identity summary (from shared.ts) ---------- */
const S = shared.SITE ?? shared.default?.SITE;
if (S) {
  add({
    id: 'identity-core-en', canonical_id: 'identity-core', type: 'identity',
    title: 'Majid Asghari Tabrizi — identity card',
    language: 'en',
    content: [
      `Name: Majid Asghari Tabrizi. Tagline: ${S.tagline}.`,
      `Site: ${S.canonicalUrl}. Email: ${S.email}. GitHub: ${S.githubUrl}. LinkedIn: ${S.linkedinUrl}.`,
      `Role framing: AI Product & Transformation Leader — product leadership, business transformation, marketplace platforms, applied AI and agentic systems, engineering and systems thinking.`,
      `Career arc (self-described, published on the site journey): Product → Data → Systems → AI → Autonomous decision systems → Production infrastructure.`,
      `This is an AI assistant, not Majid himself. It represents his documented public professional perspectives only.`,
    ].join('\n'),
    source_url: SITE, source_hash: sha('id-core'),
  });
}

/* ---------- 6. Silver-bullet knowledge library (books / OSS / flows / concepts) ----------
 * Same files that render the public pages (content/knowledge/*.json) feed the
 * Mind corpus — one source of truth. Bibliographic and license facts are
 * VERIFIED_FACT (checked against the linked sources, see
 * content/knowledge/sources.json); flows/concepts are the owner's published
 * viewpoints/templates. Book records carry an explicit ingestion-status line so
 * the model can never imply chapter-level knowledge. */
const KJ = (name) => JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'knowledge', name), 'utf8'));

const booksFile = KJ('books.json');
for (const b of booksFile.books) {
  for (const L of ['en', 'fa']) {
    const status = L === 'fa'
      ? 'وضعیت: رکورد کتاب‌شناختی — متن کامل کتاب دریافت نشده است؛ نقل‌قول فصل/صفحه ارائه نمی‌شود.'
      : 'Status: catalog-only record — the full book text has NOT been ingested; no chapter/page quotations are available.';
    add({
      id: `book-${b.slug}-${L}`, canonical_id: `book-${b.slug}`, type: 'book',
      title: b.title[L],
      language: L,
      content: [
        `${b.title[L]}`,
        `Authors: ${b.authors.join(', ')}`,
        `Publisher: ${b.publisher} · Year: ${b.year} · Edition: ${b.edition} · ISBN-13: ${b.isbn13}`,
        `${b.brief[L]}`,
        `${b.takeaway[L]}`,
        `Domains: ${b.domains.join(', ')}`,
        `Mind concepts: ${b.mindConcepts.join(', ')}`,
        status,
        `Reference: ${b.officialSourceUrl}`,
        L === 'fa' ? `Aliases: ${b.title.en} ${b.authors.join(' ')}` : '',
      ].filter(Boolean).join('\n'),
      source_url: `${SITE}/${L}/insights/books/${b.slug}`,
      source_hash: sha(b.slug + L),
      related_frameworks: b.mindConcepts,
      evidence_class: 'VERIFIED_FACT',
    });
  }
}

const ossFile = KJ('oss.json');
for (const layer of ossFile.layers) {
  for (const L of ['en', 'fa']) {
    add({
      id: `oss-${layer.id}-${L}`, canonical_id: `oss-${layer.id}`, type: 'repo',
      title: layer.name[L],
      language: L,
      content: [
        layer.name[L],
        `GitHub: ${layer.githubUrl}`,
        `License: ${layer.license.label}. ${layer.license.note}`,
        `Inputs: ${layer.inputs[L]}`,
        `Outputs: ${layer.outputs[L]}`,
        `Guard: ${layer.guard[L]}`,
        `When NOT to use: ${layer.whenNot[L]}`,
        layer.brief[L],
        'Integration status on quantiviq.xyz: research/recommendation reference — not a deployed service.',
        L === 'fa' ? `Aliases: ${layer.name.en} ${layer.id}` : '',
      ].filter(Boolean).join('\n'),
      source_url: `${SITE}/${L}/insights/enterprise-ai-stack`,
      source_hash: sha(layer.id + L),
      related_frameworks: layer.mindConcepts,
      evidence_class: 'VERIFIED_FACT',
    });
  }
}

const flowsFile = KJ('flows.json');
for (const f of flowsFile.flows) {
  for (const L of ['en', 'fa']) {
    add({
      id: `flow-${f.id}-${L}`, canonical_id: `flow-${f.id}`, type: 'org_flow',
      title: f.name[L],
      language: L,
      content: [
        `${f.name[L]} (generic template, public-safe)`,
        `Trigger: ${f.inputTrigger[L]}`,
        `Owner: ${f.accountableOwner[L]}`,
        `Decision rights: ${f.decisionRights[L]}`,
        `Steps: ${f.steps[L]}`,
        `Human gates: ${f.humanGates[L]}`,
        `Metrics: ${f.metrics[L]}`,
        `Failure modes: ${f.failureModes[L]}`,
        `Rollback: ${f.rollback[L]}`,
        `Lesson: ${f.lessons[L]}`,
        L === 'fa' ? `Aliases: ${f.name.en} ${f.id}` : '',
      ].filter(Boolean).join('\n'),
      source_url: `${SITE}/${L}/mind/flows`,
      source_hash: sha(f.id + L),
      evidence_class: 'PUBLISHED_VIEWPOINT',
    });
  }
}

const conceptsFile = KJ('concepts.json');
for (const c of conceptsFile.concepts) {
  for (const L of ['en', 'fa']) {
    add({
      id: `concept-${c.id}-${L}`, canonical_id: `concept-${c.id}`, type: 'concept',
      title: c.name[L],
      language: L,
      content: `${c.name[L]}\n\n${c.body[L]}`,
      source_url: `${SITE}/${L}/mind/flows`,
      source_hash: sha(c.id + L),
      evidence_class: 'PUBLISHED_VIEWPOINT',
    });
  }
}

/* ---------- 5. GitHub public repos (from the site's cached data) ---------- */
const gh = await loadTs('src/content/github.ts');
const FALLBACK = gh.FALLBACK_REPOS || [];
for (const r of FALLBACK) {
  add({
    id: `repo-${r.name}`, canonical_id: `repo-${r.name}`, type: 'project',
    title: `GitHub: ${r.name}`,
    language: 'en',
    content: `${r.name} (${r.language}, ${r.stargazers_count}★): ${r.description}\nRepo: ${r.html_url}`,
    source_url: r.html_url, source_hash: sha(r.name), source_type: 'github',
  });
}

/* ---------- sanitize: secret/PII scan ---------- */
const SECRET_PATTERNS = [
  /sk-[A-Za-z0-9]{16,}/, /api[_-]?key\s*[:=]\s*\S+/i, /Bearer\s+[A-Za-z0-9._-]{16,}/,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /password\s*[:=]\s*\S+/i,
  /\b\d{1,3}(\.\d{1,3}){3}\b(?!\d*\.\d)/,
  /[A-Za-z]:\\Users\\[^\s"']+/, /\/home\/[^\s"']+/,
];
const ALLOWED_EMAILS = new Set(['majid@quantiviq.xyz']);
const findings = [];
for (const r of records) {
  for (const p of SECRET_PATTERNS) {
    const m = r.content.match(p);
    if (m) findings.push({ id: r.id, pattern: p.source, sample: m[0].slice(0, 24) + '…' });
  }
  for (const em of r.content.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g)) {
    if (!ALLOWED_EMAILS.has(em[0])) findings.push({ id: r.id, pattern: 'email', sample: em[0] });
  }
}
if (findings.length) {
  console.error('SANITIZE FAIL:', JSON.stringify(findings.slice(0, 10), null, 2));
  process.exit(1);
}

/* ---------- write SQLite ---------- */
fs.mkdirSync(OUT_DIR, { recursive: true });
for (const f of [DB, DB + '-wal', DB + '-shm', DB + '.sha256']) { try { fs.unlinkSync(f); } catch {} }
const { DatabaseSync } = await import('node:sqlite');
const db = new DatabaseSync(DB);
db.exec(`
CREATE TABLE records (
  id TEXT PRIMARY KEY, canonical_id TEXT, type TEXT, title TEXT, language TEXT,
  content TEXT, evidence_class TEXT, confidence TEXT, source_type TEXT,
  source_url TEXT, source_hash TEXT, publication_status TEXT,
  publication_approval TEXT, verified_at TEXT, updated_at TEXT,
  related_entities TEXT, related_frameworks TEXT
);
CREATE VIRTUAL TABLE records_fts USING fts5(content, title, type, language, content='records', content_rowid='rowid');
CREATE TRIGGER records_ai AFTER INSERT ON records BEGIN
  INSERT INTO records_fts(rowid, content, title, type, language)
  VALUES (new.rowid, new.content, new.title, new.type, new.language);
END;
CREATE TABLE meta (k TEXT PRIMARY KEY, v TEXT);
`);
const ins = db.prepare(`INSERT INTO records VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
for (const r of records) {
  ins.run(r.id, r.canonical_id ?? r.id, r.type, r.title, r.language, r.content,
    r.evidence_class, r.confidence, r.source_type, r.source_url, r.source_hash,
    r.publication_status, r.publication_approval, r.verified_at, r.updated_at,
    JSON.stringify(r.related_entities), JSON.stringify(r.related_frameworks));
}
const count = db.prepare('SELECT COUNT(*) n FROM records').get().n;
const byType = db.prepare('SELECT type, COUNT(*) n FROM records GROUP BY type ORDER BY n DESC').all();
const byLang = db.prepare('SELECT language, COUNT(*) n FROM records GROUP BY language').all();

const manifest = {
  package: 'quantiviq-public-mind',
  version: `v1-${commit}-${Date.now()}`,
  built_at: now, source_commit: commit,
  counts: { total: count, by_type: byType, by_language: byLang },
  articles: { en: nEn, fa: nFa },
  classification_policy: 'PUBLIC_VERIFIED only; sources = published site content + public GitHub; default-deny otherwise',
  sanitize_scan: 'passed (secret patterns + non-owner emails + local paths + private IPs)',
};
db.exec(`INSERT INTO meta VALUES ('manifest', '${JSON.stringify(manifest).replace(/'/g, "''")}')`);
db.exec(`INSERT INTO records_fts(records_fts) VALUES('optimize')`);
db.close();

const dbSha = crypto.createHash('sha256').update(fs.readFileSync(DB)).digest('hex');
manifest.sqlite_sha256 = dbSha;
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
fs.writeFileSync(DB + '.sha256', dbSha);
console.log(`OK records=${count} enArticles=${nEn} faArticles=${nFa}`);
console.log(JSON.stringify({ by_type: byType, by_language: byLang }, null, 1));
console.log('sha256:', dbSha.slice(0, 32) + '…');
