#!/usr/bin/env node
/* Quantiviq Insights — content + schema validator.
 * Fails loudly on any editorial/SEO rule violation. Exit 0 = valid.
 * Usage: node scripts/insights-validate.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'content', 'insights');
const HERO_DIR = path.join(ROOT, 'public', 'insights', 'heroes');
const OG_DIR = path.join(ROOT, 'public', 'og', 'insights');

const REQUIRED = [
  'id', 'slug', 'title', 'subtitle', 'excerpt', 'pillar', 'tags', 'author_id',
  'published_at', 'updated_at', 'status', 'hero_image', 'hero_alt', 'hero_caption',
  'seo_title', 'seo_description', 'primary_term', 'secondary_terms', 'source_ids',
  'featured', 'discussion_questions', 'related_article_ids',
];
const PILLARS = ['transformation-strategy', 'economics-value', 'ai-native-operations', 'trust-governance', 'applied-industry'];
const ISO = /^\d{4}-\d{2}-\d{2}$/;

let errors = 0;
const err = (id, msg) => { console.error(`FAIL [${id}] ${msg}`); errors += 1; };
const warn = (id, msg) => console.warn(`WARN [${id}] ${msg}`);

/* ---- load ledger ---- */
const ledger = JSON.parse(fs.readFileSync(path.join(DIR, 'sources.json'), 'utf8'));
const SOURCE_IDS = new Set(ledger.sources.map((s) => s.source_id));
const sourceUse = new Map(ledger.sources.map((s) => [s.source_id, new Set(s.article_ids_using_source ?? [])]));

/* ---- load articles ---- */
const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.md'));
const articles = [];
for (const f of files) {
  const raw = fs.readFileSync(path.join(DIR, f), 'utf8');
  const { data, content } = matter(raw);
  articles.push({ file: f, fm: data, content, raw });
}

const published = articles.filter((a) => a.fm.status === 'published');

console.log(`insights-validate: ${files.length} file(s), ${published.length} published`);

/* ---- cardinality ---- */
if (published.length !== 20) err('count', `expected exactly 20 published articles, found ${published.length}`);
if (published.length < 20) {
  console.error(`FAIL [count] cannot continue meaningfully with ${published.length} articles`);
}

/* ---- per-article schema ---- */
const seenSlugs = new Map();
const seenTitles = new Map();
const seenIds = new Map();
const seenTerms = new Map();

for (const a of published) {
  const id = a.fm.id ?? a.file;
  for (const key of REQUIRED) {
    if (a.fm[key] === undefined || a.fm[key] === null) err(id, `missing frontmatter key: ${key}`);
  }
  // id + slug
  if (!/^\d{2}$/.test(String(a.fm.id ?? ''))) err(id, `id must be two digits 01-20, got '${a.fm.id}'`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(a.fm.slug ?? ''))) err(id, `slug must be kebab-case: '${a.fm.slug}'`);
  if (a.file !== `${a.fm.id}-${a.fm.slug}.md`) err(id, `filename must be '${a.fm.id}-${a.fm.slug}.md', got '${a.file}'`);
  if (seenSlugs.has(a.fm.slug)) err(id, `duplicate slug '${a.fm.slug}' (also ${seenSlugs.get(a.fm.slug)})`);
  seenSlugs.set(a.fm.slug, id);
  if (seenTitles.has(a.fm.title)) err(id, `duplicate title '${a.fm.title}' (also ${seenTitles.get(a.fm.title)})`);
  seenTitles.set(a.fm.title, id);
  seenTitles.set(a.fm.title, id);
  if (seenIds.has(a.fm.id)) err(id, `duplicate id (also ${seenIds.get(a.fm.id)})`);
  seenIds.set(a.fm.id, id);
  // pillar
  if (!PILLARS.includes(a.fm.pillar)) err(id, `unknown pillar '${a.fm.pillar}'`);
  // dates
  if (!ISO.test(String(a.fm.published_at ?? ''))) err(id, `published_at must be ISO date, got '${a.fm.published_at}'`);
  if (!ISO.test(String(a.fm.updated_at ?? ''))) err(id, `updated_at must be ISO date, got '${a.fm.updated_at}'`);
  if (a.fm.published_at && a.fm.updated_at && a.fm.updated_at < a.fm.published_at) err(id, `updated_at (${a.fm.updated_at}) before published_at (${a.fm.published_at})`);
  // seo lengths
  const st = String(a.fm.seo_title ?? '');
  if (st.length < 15 || st.length > 62) err(id, `seo_title length ${st.length} (need 15-62): '${st}'`);
  const sd = String(a.fm.seo_description ?? '');
  if (sd.length < 70 || sd.length > 160) err(id, `seo_description length ${sd.length} (need 70-160)`);
  // distinct search intent
  const pt = String(a.fm.primary_term ?? '').toLowerCase();
  if (!pt) err(id, 'empty primary_term');
  if (seenTerms.has(pt)) err(id, `duplicate primary_term '${pt}' (also ${seenTerms.get(pt)})`);
  seenTerms.set(pt, id);
  // sources
  if (!Array.isArray(a.fm.source_ids) || a.fm.source_ids.length < 2) err(id, `source_ids must list >= 2 sources, got ${JSON.stringify(a.fm.source_ids)}`);
  for (const sid of a.fm.source_ids ?? []) {
    if (!SOURCE_IDS.has(sid)) err(id, `unknown source_id '${sid}' (not in sources.json)`);
    else sourceUse.get(sid).add(String(a.fm.id));
  }
  // author
  const authors = JSON.parse(fs.readFileSync(path.join(DIR, 'authors.json'), 'utf8'));
  if (!authors.authors.some((x) => x.author_id === a.fm.author_id)) err(id, `unknown author_id '${a.fm.author_id}'`);
  // arrays
  for (const key of ['tags', 'secondary_terms', 'discussion_questions', 'related_article_ids']) {
    if (!Array.isArray(a.fm[key])) err(id, `${key} must be an array`);
  }
  if ((a.fm.discussion_questions ?? []).length < 2 || (a.fm.discussion_questions ?? []).length > 4) err(id, 'discussion_questions must have 2-4 entries');
  // body requirements
  const body = a.content;
  const words = body.replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter((w) => /[a-zA-Z0-9]/.test(w)).length;
  if (words < 1800) err(id, `body too short: ${words} words (minimum 1800; target 2200-3200)`);
  if (words > 4200) warn(id, `body long (${words} words) — check for bloat`);
  const H2 = (body.match(/^## /gm) ?? []).length;
  if (H2 < 5) err(id, `only ${H2} H2 sections (need >= 5)`);
  for (const section of ['Executive Summary', 'Key Takeaways', 'What Leaders Should Do Next', 'References']) {
    if (!new RegExp(`^## ${section}\\s*$`, 'm').test(body)) err(id, `missing required H2 section '## ${section}'`);
  }
  // hero assets
  if (a.fm.hero_image !== `/insights/heroes/${a.fm.id}.svg`) err(id, `hero_image must be '/insights/heroes/${a.fm.id}.svg'`);
  if (!fs.existsSync(path.join(HERO_DIR, `${a.fm.id}.svg`))) err(id, `hero SVG missing: public/insights/heroes/${a.fm.id}.svg`);
  if (!fs.existsSync(path.join(OG_DIR, `${a.fm.id}.png`))) err(id, `OG PNG missing: public/og/insights/${a.fm.id}.png`);
  if (String(a.fm.hero_alt ?? '').length < 20) err(id, 'hero_alt too short (need descriptive alt text >= 20 chars)');
  // citations: every source cited inline AND present in references
  for (const sid of a.fm.source_ids ?? []) {
    const inline = body.includes(`(#ref-${sid})`);
    const anchor = body.includes(`id="ref-${sid}"`);
    if (!anchor) err(id, `references section missing anchor id="ref-${sid}"`);
    if (!inline) err(id, `source '${sid}' never cited inline via (#ref-${sid})`);
  }
  // no fabrication of primary numbers from uncited sources: count external links and check they are ledger URLs or safe anchors
  const ext = [...body.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((m) => m[1]);
  const ledgerUrls = new Set(ledger.sources.map((s) => s.source_url));
  for (const u of ext) {
    if (!ledgerUrls.has(u)) err(id, `external link not in source ledger: ${u} (every outbound factual link must be a ledger source)`);
  }
  // internal links
  const internal = [...body.matchAll(/\]\((\/(?:en|fa)[^)\s]*)\)/g)].map((m) => m[1]);
  if (internal.length < 3) err(id, `only ${internal.length} internal links (need >= 3)`);
  // supporting visual
  if (!/<figure[\s>]/.test(body) || !/<svg[\s>]/.test(body)) err(id, 'missing inline <figure> with <svg> supporting visual');
  // placeholders
  for (const marker of ['TODO', 'TBD', 'FIXME', 'lorem ipsum', 'Lorem ipsum', 'XXX', 'PLACEHOLDER']) {
    if (body.includes(marker)) err(id, `placeholder marker '${marker}' present`);
  }
  // synthetic-data honesty
  if (/case study/i.test(body) && !/synthetic/i.test(body)) warn(id, "mentions 'case study' — ensure synthetic scenarios are labeled as such");
  // no third-party chart rehosting: any svg must be ours (can't fully verify; check for common tell-tales)
  if (/\.png|\.jpg|\.jpeg|\.webp/.test(body)) warn(id, 'body references raster images — figures must be original inline SVG');
}

/* ---- cross-article consistency ---- */
const ids = new Set(published.map((a) => String(a.fm.id)));
for (const a of published) {
  for (const rid of a.fm.related_article_ids ?? []) {
    if (!ids.has(rid)) err(a.fm.id, `related_article_ids references unknown article '${rid}'`);
  }
}
// ledger usage consistency (source lists article ⟺ article cites source)
for (const [sid, uses] of sourceUse) {
  const citing = new Set(published.filter((a) => (a.fm.source_ids ?? []).includes(sid)).map((a) => String(a.fm.id)));
  const declared = new Set([...uses].filter((x) => ids.has(x)));
  for (const x of citing) if (!declared.has(x)) warn(sid, `article ${x} cites this source but ledger article_ids_using_source does not list it (run --fix)`);
  for (const x of declared) if (!citing.has(x)) warn(sid, `ledger lists article ${x} but that article does not cite it`);
}

/* ---- pillar coverage ---- */
const perPillar = PILLARS.map((p) => [p, published.filter((a) => a.fm.pillar === p).length]);
for (const [p, n] of perPillar) {
  if (n !== 4) err('pillars', `pillar '${p}' has ${n} articles (need exactly 4)`);
}

/* ---- auto-fix ledger usage ---- */
if (process.argv.includes('--fix')) {
  for (const s of ledger.sources) s.article_ids_using_source = [...sourceUse.get(s.source_id)].sort();
  fs.writeFileSync(path.join(DIR, 'sources.json'), JSON.stringify(ledger, null, 2) + '\n');
  console.log('ledger article_ids_using_source updated (--fix)');
}

if (errors > 0) {
  console.error(`\nINSIGHTS VALIDATE: ${errors} error(s)`);
  process.exit(1);
}
console.log(`\nINSIGHTS VALIDATE: ALL PASS — ${published.length} articles, ${ledger.sources.length} sources, ${perPillar.map(([p, n]) => `${p}:${n}`).join(' ')}`);
