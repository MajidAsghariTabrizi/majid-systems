import test from 'node:test';
import assert from 'node:assert/strict';
import { matchesSearch, normalizeSearchText } from '../src/lib/search-text';

test('resource search accepts Persian joining and Arabic letter variants', () => {
  assert.ok(matchesSearch('مسئله هم‌راستایی و همکاری انسان', 'هم راستایی'));
  assert.ok(matchesSearch('هوش مصنوعی و کار', 'هوش مصنوعي'));
  assert.ok(matchesSearch('کتاب‌های راهبرد', 'كتاب های'));
});

test('resource search ignores vocalization and presentation-only marks', () => {
  assert.ok(matchesSearch('مدیریت دانش', 'مُدیریت'));
  assert.ok(matchesSearch('راهبرد', 'راهـبرد'));
  assert.ok(matchesSearch('AI Engineering', 'ai engineering'));
});

test('resource search matches Persian, Arabic and Latin numbers consistently', () => {
  assert.ok(matchesSearch('Edition 2026', '۲۰۲۶'));
  assert.ok(matchesSearch('ویراست ۱۴۰۵', '١٤٠٥'));
  assert.equal(normalizeSearchText('۲۰۲۶'), '2026');
});

test('empty resource search includes the collection; unrelated text does not match', () => {
  assert.ok(matchesSearch('کتاب مهندسی', '  '));
  assert.equal(matchesSearch('طراحی محصول', 'حسابداری'), false);
});
