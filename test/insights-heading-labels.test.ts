import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { renderMarkdown } from '../src/content/insights';

test('all Persian articles retain their published heading fragments after label improvements', () => {
  const directory = path.join(process.cwd(), 'content/insights/fa');
  const files = fs.readdirSync(directory).filter((file) => file.endsWith('.md'));
  assert.equal(files.length, 20);
  for (const file of files) {
    const { content } = matter(fs.readFileSync(path.join(directory, file), 'utf8'));
    const legacy = renderMarkdown(content, 'en'); // Unmodified source labels.
    const localized = renderMarkdown(content, 'fa');
    assert.deepEqual(localized.headings.map((heading) => heading.id), legacy.headings.map((heading) => heading.id), file);
    for (const heading of localized.headings) {
      assert.ok(localized.html.includes(`id="${heading.id}"`), `${file}: ${heading.text}`);
      assert.ok(localized.html.includes(heading.text), `${file}: ToC and heading label agree`);
    }
  }
});

test('a corrected Persian heading uses its old fragment and the same new label in the ToC', () => {
  const source = '## یک مأموریت از میان میله، نه دوشیزه‌بازی';
  const legacy = renderMarkdown(source, 'en');
  const localized = renderMarkdown(source, 'fa');
  assert.equal(localized.headings[0].id, legacy.headings[0].id);
  assert.equal(localized.headings[0].text, 'انتخاب مأموریت با معیار، نه جذابیت ارائه');
  assert.ok(localized.html.includes('>انتخاب مأموریت با معیار، نه جذابیت ارائه</h2>'));
});

test('English headings and unmodified inline formatting remain intact', () => {
  assert.equal(renderMarkdown('### CEO', 'en').headings[0].text, 'CEO');
  assert.equal(renderMarkdown('### CEO', 'fa').headings[0].text, 'مدیرعامل (CEO)');
  const output = renderMarkdown('## A **bold** & plain heading', 'en');
  assert.ok(output.html.includes('<strong>bold</strong>'));
  assert.ok(output.html.includes('&amp; plain'));
});
