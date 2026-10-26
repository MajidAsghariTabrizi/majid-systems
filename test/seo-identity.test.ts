/**
 * SEO/AI discoverability — founder <-> Quantiviq identity integrity.
 * Guards the explicit crawlable identity, the Person/Organization JSON-LD
 * wiring, and EN/FA parity of the new keys. No claims about search-engine
 * recognition are made or tested — only what the site emits.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { SITE } from '../src/content/shared';
import { en } from '../src/content/i18n/en';
import { fa } from '../src/content/i18n/fa';

const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf8');

test('identity constants: full bilingual names + accurate founder title', () => {
  assert.equal(SITE.fullName, 'Majid Asghari Tabrizi');
  assert.equal(SITE.fullNameFa, 'مجید اصغری تبریزی');
  assert.equal(SITE.founderTitle, 'Founder & AI Transformation Architect');
  assert.equal(SITE.linkedinUrl, 'https://www.linkedin.com/in/majid-asghari/');
});

test('JSON-LD: one @id-linked Person/Organization graph with founder + worksFor', () => {
  const src = read('src/components/JsonLd.tsx');
  assert.ok(src.includes("'@graph'"), 'org schema uses a single @graph');
  assert.ok(src.includes('worksFor:'), 'Person.worksFor present');
  assert.ok(src.includes("founder: { '@id': FOUNDER_ID }"), 'Organization.founder references the Person @id');
  assert.ok(src.includes('SITE.fullName'), 'Person carries the full name');
  assert.ok(src.includes('SITE.fullNameFa'), 'Person carries the Persian name as alternateName');
  assert.ok(src.includes('SITE.founderTitle'), 'Person carries the accurate jobTitle');
  assert.ok(src.includes('SITE.linkedinUrl'), 'Person.sameAs includes LinkedIn');
  // no second, conflicting Person/Organization node without @id
  const graphs = src.match(/'@graph':/g) ?? [];
  assert.ok(graphs.length === 1, 'exactly one @graph in the component');
});

test('crawlable identity: about page renders both names + title + LinkedIn rel=me', () => {
  const src = read('src/app/[locale]/about/page.tsx');
  assert.ok(src.includes('SITE.fullName') && src.includes('SITE.fullNameFa'), 'both names rendered');
  assert.ok(src.includes('t.founderTitle'), 'localized founder title rendered');
  assert.ok(src.includes('SITE.linkedinUrl') && src.includes('rel="me noopener"'), 'LinkedIn link with rel=me');
});

test('crawlable identity: footer renders both names + title + LinkedIn on every page', () => {
  const src = read('src/components/Footer.tsx');
  assert.ok(src.includes('footer-founder'), 'founder block present');
  assert.ok(src.includes('SITE.fullName') && src.includes('SITE.fullNameFa'), 'both names in footer');
  assert.ok(src.includes('SITE.linkedinUrl'), 'LinkedIn link in footer');
});

test('i18n: founder title/link labels exist and match in both locales', () => {
  assert.equal(en.about.founderTitle, 'Founder & AI Transformation Architect');
  assert.equal(en.footer.founderTitle, 'Founder & AI Transformation Architect');
  assert.ok(fa.about.founderTitle.length > 5, 'fa about founder title present');
  assert.ok(fa.footer.founderTitle.length > 5, 'fa footer founder title present');
});
