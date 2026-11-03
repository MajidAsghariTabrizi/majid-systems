import test from 'node:test';
import assert from 'node:assert/strict';
import { BOOKS, bookEdition } from '../src/content/knowledge';

test('every catalog edition has Persian display text and retains its Gregorian year', () => {
  for (const book of BOOKS) {
    const localized = bookEdition(book, 'fa');
    assert.ok(!/[A-Za-z0-9]/.test(localized), `${book.slug}: untranslated edition`);
    const gregorianYear = String(book.year).replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)]);
    assert.ok(localized.includes(gregorianYear), `${book.slug}: year retained`);
    assert.ok(localized.includes('میلادی'), `${book.slug}: calendar explicit`);
    assert.equal(bookEdition(book, 'en'), book.edition, `${book.slug}: original edition intact`);
  }
});

test('edition-specific revision, months and physical formats remain visible', () => {
  const find = (id: string) => BOOKS.find((book) => book.id === id)!;
  assert.match(bookEdition(find('book-01'), 'fa'), /دوم.*بازنگری.*آوریل/);
  assert.match(bookEdition(find('book-06'), 'fa'), /به‌روزشده.*گسترش‌یافته.*سپتامبر/);
  assert.match(bookEdition(find('book-08'), 'fa'), /نسخه چاپی/);
  assert.match(bookEdition(find('book-09'), 'fa'), /جلد سخت/);
  assert.match(bookEdition(find('book-10'), 'fa'), /جلد سخت/);
});
