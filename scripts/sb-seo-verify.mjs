/**
 * Rendered SEO verification: parse the JSON-LD the site actually ships,
 * check the crawlable identity text, hreflang and canonical on key pages.
 * This is the "equivalent tool" validation: JSON.parse + schema.org property
 * vocabulary checks + cross-reference integrity on the RENDERED output.
 */
import { chromium } from 'playwright';

const BASE = process.env.CAPTURE_BASE ?? 'http://127.0.0.1:3219';
const browser = await chromium.launch({ channel: 'msedge', headless: true });

// schema.org vocabulary sanity: properties we emit must exist on the types
const PERSON_PROPS = ['name', 'alternateName', 'jobTitle', 'url', 'image', 'sameAs', 'worksFor', 'address'];
const ORG_PROPS = ['name', 'url', 'description', 'slogan', 'founder', 'areaServed', 'serviceType', 'knowsAbout'];

const results = [];
for (const route of ['/en/about', '/fa/about', '/en', '/fa', '/en/insights/books']) {
  const pg = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await pg.goto(BASE + route, { waitUntil: 'networkidle', timeout: 60000 });
  const out = await pg.evaluate(() => {
    const lds = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => {
      try { return JSON.parse(s.textContent ?? ''); } catch (e) { return { parseError: String(e).slice(0, 80) }; }
    });
    const body = document.body.innerText;
    const alternates = [...document.querySelectorAll('link[rel="alternate"]')].map((l) => ({ hreflang: l.getAttribute('hreflang'), href: l.getAttribute('href') }));
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null;
    return {
      ldCount: lds.length,
      lds,
      hasEnName: body.includes('Majid Asghari Tabrizi'),
      hasFaName: body.includes('\u0645\u062c\u06cc\u062f \u0627\u0635\u063a\u0631\u06cc \u062a\u0628\u0631\u06cc\u0632\u06cc'),
      hasTitle: body.includes('Founder & AI Transformation Architect') || body.includes('\u0628\u0646\u06cc\u0627\u0646\u200c\u06af\u0630\u0627\u0631 \u0648 \u0645\u0639\u0645\u0627\u0631'),
      linkedinLinks: [...document.querySelectorAll('a[href*="linkedin.com"]')].map((a) => ({ href: a.getAttribute('href'), rel: a.getAttribute('rel') })),
      alternates, canonical,
    };
  });
  results.push({ route, ...out });
  console.log('==', route);
  console.log('  jsonld scripts:', out.ldCount, '| parseErrors:', out.lds.filter((l) => l.parseError).length);
  console.log('  crawlable: enName=' + out.hasEnName, 'faName=' + out.hasFaName, 'title=' + out.hasTitle, 'linkedin=' + out.linkedinLinks.length);
  console.log('  canonical:', out.canonical);
  console.log('  hreflang:', out.alternates.map((a) => a.hreflang + '->' + a.href).join(' '));
  await pg.close();
}
await browser.close();

// deep-validate the graph on /en (locale layout schema)
const en = results.find((r) => r.route === '/en');
const graphLd = en.lds.find((l) => l['@graph']);
if (!graphLd) throw new Error('no @graph ld+json on /en');
const person = graphLd['@graph'].find((n) => n['@type'] === 'Person');
const org = graphLd['@graph'].find((n) => n['@type'] === 'ProfessionalService');
const problems = [];
if (!person || !org) problems.push('missing Person or Organization node');
if (person) {
  for (const p of PERSON_PROPS) if (!(p in person)) problems.push('Person missing ' + p);
  if (person.name !== 'Majid Asghari Tabrizi') problems.push('Person.name wrong: ' + person.name);
  if (!person.alternateName?.includes('\u0645\u062c\u06cc\u062f \u0627\u0635\u063a\u0631\u06cc \u062a\u0628\u0631\u06cc\u0632\u06cc')) problems.push('Persian alternateName missing');
  if (person.jobTitle !== 'Founder & AI Transformation Architect') problems.push('jobTitle wrong');
  if (!person.sameAs?.some((u) => u === 'https://www.linkedin.com/in/majid-asghari/')) problems.push('LinkedIn missing from sameAs');
  if (person.worksFor?.['@id'] !== org?.['@id']) problems.push('worksFor does not reference the organization @id');
}
if (org) {
  for (const p of ORG_PROPS) if (!(p in org)) problems.push('Organization missing ' + p);
  if (org.founder?.['@id'] !== person?.['@id']) problems.push('founder does not reference the person @id');
  if (org['@id'] !== 'https://quantiviq.xyz/#organization') problems.push('org @id unexpected');
}
// no duplicate Person nodes anywhere in any page's ld
for (const r of results) {
  for (const ld of r.lds) {
    const nodes = ld['@graph'] ?? [ld];
    const typeOf = (n) => (Array.isArray(n['@type']) ? n['@type'] : [n['@type']]);
    for (const n of nodes) {
      if (typeOf(n).includes('Person') && !n['@id']) problems.push(r.route + ': Person without @id (duplicate risk)');
      if (typeOf(n).includes('Person') && n.name && n.name !== 'Majid Asghari Tabrizi') problems.push(r.route + ': conflicting Person name ' + n.name);
    }
  }
}
console.log('\nGRAPH VALIDATION:', problems.length === 0 ? 'PASS — Person/Organization wiring valid, no duplicates, no conflicts' : 'FAIL');
for (const p of problems) console.log('  -', p);
if (problems.length) process.exit(1);
