import { readFileSync } from 'node:fs';
const html = readFileSync('.next/server/app/fa/mind.html', 'utf8');
const en = readFileSync('.next/server/app/en/mind.html', 'utf8');
const desc = (s) => (s.match(/<meta name="description" content="([^"]+)"/) || [])[1] || '';
const title = (s) => (s.match(/<title>([^<]+)<\/title>/) || [])[1] || '';
console.log('FA desc len:', desc(html).length, '| FA title:', title(html));
console.log('EN desc len:', desc(en).length, '| EN title:', title(en));
const clean = (t) => !/Quantiviq.*Quantiviq/.test(t);
console.log('no doubled brand:', clean(title(html)) && clean(title(en)));
