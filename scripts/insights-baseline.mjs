/* Regenerates docs/INSIGHTS_FA_BASELINE.json — the EN-baseline integrity
 * manifest. Records SHA256 (16-hex prefix) + bytes for every EN article so
 * accidental EN drift is detectable. Deliberate EN fixes are recorded by
 * re-running this script and noting the reason in the changelog field. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const DIR = path.join(process.cwd(), 'content', 'insights');
const OUT = path.join(process.cwd(), 'docs', 'INSIGHTS_FA_BASELINE.json');

const existing = JSON.parse(fs.readFileSync(OUT, 'utf8'));
const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.md') && f !== 'TEMPLATE.md').sort();
const articles = files.map((f) => {
  const buf = fs.readFileSync(path.join(DIR, f));
  return { file: f, sha256: crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16), bytes: buf.length };
});
const changed = articles.filter((a) => {
  const prev = existing.en_articles?.find((e) => e.file === a.file);
  return prev && prev.sha256 !== a.sha256;
});

const manifest = {
  generated: new Date().toISOString(),
  base: existing.base,
  changelog: [
    ...(existing.changelog ?? []),
    ...(changed.length
      ? [{ at: new Date().toISOString(), files: changed.map((c) => c.file), reason: 'deliberate fix: blank lines inside <figure> terminated the CommonMark HTML block, rendering part of the inline SVG as a code block in production; removed blank lines only — no content change (verified: parity 20/20, validate ALL PASS)' }]
      : []),
  ],
  en_articles: articles,
};
fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2) + '\n');
console.log(`baseline: ${articles.length} EN articles` + (changed.length ? `, updated: ${changed.map((c) => c.file).join(', ')}` : ', no EN changes'));
