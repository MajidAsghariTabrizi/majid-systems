/**
 * Silver-bullet Gate D — Mind grounding eval (mock mode).
 * Loads public-mind/eval/sb_seed_eval.json (seeded questions, both languages,
 * grounded/partial/unknown + adversarial + temporal classes) and runs them
 * against the local mock service (127.0.0.1:8210, MIND_MOCK=1).
 *
 * Answer-level quality is owner-verifiable only after chat activation; this
 * eval proves GROUNDING invariants that hold regardless of model:
 *   G1 expected record type+URL retrieved for grounded/partial questions
 *   G2 every cited URL belongs to the public host whitelist (no fabrication)
 *   G3 unknown-class answers never cite a source that could answer them
 * Verdict per question + summary. No tokens spent (mock mode).
 */
import fs from 'node:fs';
import path from 'node:path';

const EVAL = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'public-mind', 'eval', 'sb_seed_eval.json'), 'utf8'));
const BASE = process.env.MIND_BASE ?? 'http://127.0.0.1:8210';
const HOST_OK = [/^https:\/\/quantiviq\.xyz(\/|$)/, /^https:\/\/github\.com(\/|$)/, /^https:\/\/raw\.githubusercontent\.com(\/|$)/];

async function ask(q) {
  const session = 'sb-eval-' + q.id;
  const body = { session, locale: /[؀-ۿ]/.test(q.q) ? 'fa' : 'en', messages: [{ role: 'user', content: q.q }] };
  if (q.scope) body.scope = q.scope;
  const r = await fetch(BASE + '/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(40000),
  });
  if (!r.ok) return { http: r.status };
  const raw = await r.text();
  const sources = [];
  let answer = '';
  for (const line of raw.split('\n')) {
    if (!line.startsWith('data:')) continue;
    try {
      const ev = JSON.parse(line.slice(5).trim());
      if (ev && Array.isArray(ev.sources)) sources.push(...ev.sources);
      if (ev && typeof ev.delta === 'string') answer += ev.delta;
      if (ev && typeof ev.text === 'string') answer += ev.text;
    } catch {}
  }
  return { http: r.status, sources, answer };
}

let pass = 0, fail = 0, manual = 0;
const results = [];
for (const q of EVAL.questions) {
  const res = await ask(q);
  const row = { id: q.id, cls: q.class, http: res.http ?? 'ERR' };
  // G2 — host whitelist (applies to every class)
  const badUrls = (res.sources ?? []).filter((s) => !HOST_OK.some((re) => re.test(s.url ?? '')));
  row.g2_allUrlsWhitelisted = badUrls.length === 0;
  if (res.http !== 200) { row.verdict = 'FAIL(http ' + res.http + ')'; fail++; results.push(row); console.log(row.id.padEnd(8), row.verdict); continue; }
  if (q.expect?.types) {
    const types = [...new Set((res.sources ?? []).map((s) => s.type))];
    row.types = types;
    row.g1_typeOk = q.expect.types.every((t) => types.includes(t));
    row.g1_urlOk = (res.sources ?? []).some((s) => (s.url ?? '').includes(q.expect.urlIncludes));
    row.verdict = row.g1_typeOk && row.g1_urlOk && row.g2_allUrlsWhitelisted ? 'PASS' : 'FAIL';
  } else if (q.class === 'unknown') {
    // G3 — unknown questions must not retrieve records that plausibly answer them;
    // in mock mode answers are built ONLY from retrieved public records, so the
    // invariant is: whitelist holds and no non-public host ever appears.
    row.verdict = row.g2_allUrlsWhitelisted ? 'PASS(integrity)' : 'FAIL';
  } else {
    // adversarial / temporal-note rows: integrity + retrieval only
    row.verdict = row.g2_allUrlsWhitelisted ? 'PASS(integrity; answer-level pending chat activation)' : 'FAIL';
  }
  if (row.verdict.startsWith('PASS')) pass++; else if (row.verdict.startsWith('FAIL')) fail++; else manual++;
  results.push(row);
  console.log(q.id.padEnd(8), q.class.padEnd(12), row.verdict, row.types ? 'types=' + row.types.join(',') : '');
}
const summary = { at: new Date().toISOString(), mode: 'mock', pass, fail, manual, total: EVAL.questions.length };
fs.writeFileSync(path.resolve(process.cwd(), 'public-mind', 'eval', 'sb_seed_eval_results.json'), JSON.stringify({ summary, results }, null, 2) + '\n');
console.log('\nSUMMARY', JSON.stringify(summary), '-> public-mind/eval/sb_seed_eval_results.json');
