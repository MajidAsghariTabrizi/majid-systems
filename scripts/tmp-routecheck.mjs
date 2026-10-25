/* Enumerate all EN+FA article routes on production; report non-200s. */
import fs from 'node:fs';
const BASE = 'https://quantiviq.xyz';
const slugs = fs.readdirSync('content/insights').filter((f) => f.endsWith('.md')).map((f) => f.replace(/^\d\d-/, '').replace(/\.md$/, ''));
const faSlugs = fs.readdirSync('content/insights/fa').filter((f) => f.endsWith('.md')).map((f) => f.replace(/^\d\d-/, '').replace(/\.md$/, ''));
let bad = 0;
for (const s of slugs) {
  const r = await fetch(`${BASE}/en/insights/${s}`);
  if (r.status !== 200) { bad++; console.log(`EN ${r.status} ${s}`); }
}
for (const s of faSlugs) {
  const r = await fetch(`${BASE}/fa/insights/${s}`);
  if (r.status !== 200) { bad++; console.log(`FA ${r.status} ${s}`); }
}
console.log(bad === 0 ? 'ALL 40 ROUTES 200' : `${bad} route(s) failing`);
