import assert from 'node:assert/strict';
import test from 'node:test';

import { faMatch, normalizeFa } from '../src/content/solutions/search';

// Regression: the two spellings that must both find QuoteDesk (meez pish-faktor)
test('fa search: space vs ZWNJ variants are equivalent', () => {
  const hay = 'میز پیش‌فاکتور هوشمند Quote desk';
  assert.ok(faMatch(hay, 'پیش فاکتور'));   // space variant finds ZWNJ title
  assert.ok(faMatch(hay, 'پیش‌فاکتور'));   // exact ZWNJ
  assert.ok(faMatch(hay, 'پیشفاکتور'));    // joined
  assert.ok(faMatch(hay, 'پیش فاكتور'));   // Arabic kaf variant
});

test('fa search: digits normalize and empty needle matches all', () => {
  assert.ok(faMatch('24 ساعت', '۲۴'));
  assert.ok(faMatch('anything', ''));
  assert.ok(!faMatch('something else', 'پیش فاکتور'));
});

test('fa search: small truthful aliases cross the EN/FA boundary', () => {
  assert.ok(faMatch('quote desk', 'پیش فاکتور'));      // alias → EN title
  assert.ok(faMatch('میز پیش‌فاکتور', 'quotation'));    // EN needle → FA via alias
});

test('normalizeFa: ZWNJ → space, whitespace collapsed, yeh/kaf unified', () => {
  assert.equal(normalizeFa('پیش‌فاکتور'), 'پیش فاکتور');
  assert.equal(normalizeFa('می   شود'), 'می شود');
  assert.equal(normalizeFa('كتاب ياد'), 'کتاب یاد');
});
