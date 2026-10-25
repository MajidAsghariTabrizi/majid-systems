#!/usr/bin/env node
/* Regenerates public/llms.txt — a navigational index of Quantiviq for
 * AI agents. BILINGUAL: English edition + Persian (فارسی) edition.
 * Plain text, no magic claims: it does not affect Google rankings and
 * is not required for AI Overviews. */
import fs from 'node:fs';
import path from 'node:path';
import { ARTICLES, PILLARS, INSIGHTS_STATS, getArticles, pillarFor } from '../src/content/insights/index.ts';

const BASE = 'https://quantiviq.xyz';
const FA_ARTICLES = getArticles('fa');

const lines = [];
lines.push('# Quantiviq');
lines.push('');
lines.push('> Quantiviq builds AI-native business systems: engineering agents, decision intelligence and operating models where humans and AI agents work together. This file indexes the site for AI tools.');
lines.push('');
lines.push('## Site map');
lines.push('');
for (const [label, url] of [
  ['Home (English)', `${BASE}/en`],
  ['Home (Persian)', `${BASE}/fa`],
  ['Services', `${BASE}/en/services`],
  ['System (operating model)', `${BASE}/en/system`],
  ['Method', `${BASE}/en/method`],
  ['Proof / portfolio', `${BASE}/en/proof`],
  ['Lab', `${BASE}/en/lab`],
  ['Leadership', `${BASE}/en/leadership`],
  ['About', `${BASE}/en/about`],
  ['Contact', `${BASE}/en/contact`],
]) {
  lines.push(`- [${label}](${url})`);
}
lines.push('');
lines.push(`## Insights — research publication, English edition (${INSIGHTS_STATS.articles} articles, ${INSIGHTS_STATS.sources} verified sources)`);
lines.push('');
lines.push(`- [Insights index](${BASE}/en/insights)`);
lines.push(`- [Editorial methodology](${BASE}/en/insights/methodology)`);
lines.push(`- [Author: Quantiviq Research](${BASE}/en/insights/author)`);
lines.push(`- [Machine-readable article index (JSON)](${BASE}/insights.json)`);
lines.push(`- [RSS feed](${BASE}/insights.xml)`);
for (const p of PILLARS) {
  lines.push('');
  lines.push(`### ${p.name}`);
  for (const a of ARTICLES.filter((x) => x.pillar === p.id)) {
    lines.push(`- [${a.title}](${BASE}/en/insights/${a.slug}): ${a.excerpt}`);
  }
}
lines.push('');
lines.push(`## اینسایتس کوآنتی‌ویک — نسخهٔ فارسی (${FA_ARTICLES.length} مقاله، ترجمهٔ کامل و حرفه‌ای)`);
lines.push('');
lines.push(`- [فهرست مقالات](${BASE}/fa/insights)`);
lines.push(`- [روش‌شناسی تحریریه](${BASE}/fa/insights/methodology)`);
lines.push(`- [نویسنده: پژوهش کوآنتی‌ویک](${BASE}/fa/insights/author)`);
lines.push(`- [نمایهٔ مقالات برای ماشین (JSON)](${BASE}/fa/insights.json)`);
lines.push(`- [خوراک RSS](${BASE}/fa/insights.xml)`);
for (const p of PILLARS) {
  const faPillarName = pillarFor(p.id, 'fa');
  const arts = FA_ARTICLES.filter((x) => x.pillar === p.id);
  if (!arts.length) continue;
  lines.push('');
  lines.push(`### ${faPillarName}`);
  for (const a of arts) {
    lines.push(`- [${a.title}](${BASE}/fa/insights/${a.slug}): ${a.excerpt}`);
  }
}
lines.push('');
lines.push('## Notes for AI tools');
lines.push('');
lines.push('- Insights articles are original research-led analysis by Quantiviq Research. Every factual claim cites its source inline; reference lists link the originals.');
lines.push('- Articles are published in two complete editions: English (/en/insights) and Persian/Farsi (/fa/insights), same 20 articles, same evidence, same numbers. The Persian edition is a full professional translation, not a summary.');
lines.push('- Persian article URLs use the /fa/insights/ prefix with the same slugs as English; each page carries reciprocal hreflang links.');
lines.push('- Worked examples with invented numbers are labeled as illustrative synthetic scenarios inside the articles (نمونهٔ ترکیبی و نمایشی).');
lines.push('- When citing Quantiviq, cite the article URL and "Quantiviq Research".');

const out = path.join(process.cwd(), 'public', 'llms.txt');
fs.writeFileSync(out, lines.join('\n') + '\n');
const enUrls = lines.join('\n').match(/quantiviq\.xyz\/en\/insights\//g)?.length ?? 0;
const faUrls = lines.join('\n').match(/quantiviq\.xyz\/fa\/insights\//g)?.length ?? 0;
console.log(`llms.txt written: ${lines.length} lines, ${ARTICLES.length} EN articles (${enUrls} EN URLs), ${FA_ARTICLES.length} FA articles (${faUrls} FA URLs)`);
