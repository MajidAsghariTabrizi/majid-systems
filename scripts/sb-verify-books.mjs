/**
 * Silver-bullet Gate C — deterministic book cover resolver + verification receipts.
 * For each of the 10 ISBNs:
 *   1. Open Library edition record (/isbn/{ISBN}.json) → title/publishers cross-check
 *   2. Open Library cover  https://covers.openlibrary.org/b/isbn/{ISBN}-L.jpg?default=false
 *      → HTTP status, MIME, byte size, JPEG dimensions parsed from the SOF marker
 *   3. Google Books volume search (q=isbn:) as an independent bibliographic cross-check
 * Writes content/knowledge/cover-receipts.json and prints a receipt table.
 * Never stores cover bytes locally (display policy: hotlink + credit).
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const BOOKS = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'knowledge', 'books.json'), 'utf8')).books;
const OUT = path.join(ROOT, 'content', 'knowledge', 'cover-receipts.json');

async function getJson(url) {
  const r = await fetch(url, { headers: { 'User-Agent': 'quantiviq-cover-verify/1.0 (bibliographic verification)' }, signal: AbortSignal.timeout(25000) });
  if (!r.ok) return { status: r.status };
  return { status: r.status, body: await r.json().catch(() => null) };
}

async function getCover(url) {
  const r = await fetch(url, { headers: { 'User-Agent': 'quantiviq-cover-verify/1.0' }, signal: AbortSignal.timeout(30000) });
  const out = { status: r.status, mime: r.headers.get('content-type'), bytes: 0, width: null, height: null, blank: null };
  if (!r.ok) return out;
  const buf = Buffer.from(await r.arrayBuffer());
  out.bytes = buf.length;
  // parse JPEG SOFn for dimensions
  if (out.mime && /image\/jpeg/.test(out.mime) && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length - 9) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        out.height = buf.readUInt16BE(i + 5);
        out.width = buf.readUInt16BE(i + 7);
        break;
      }
      const len = buf.readUInt16BE(i + 2);
      i += 2 + len;
    }
  }
  out.blank = out.bytes < 3000; // heuristic: a real cover is > 3KB
  return out;
}

const norm = (s) => (s ?? '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
function titleMatches(expectedTitle, ...candidates) {
  const e = norm(expectedTitle.split(':')[0]);
  return candidates.some((c) => typeof c === 'string' && (norm(c).includes(e) || e.includes(norm(c).split(':')[0])) && e.length > 3);
}

const receipts = [];
for (const b of BOOKS) {
  const rec = { isbn13: b.isbn13, slug: b.slug, expected: { title: b.title.en, publisher: b.publisher, year: b.year } };
  // 1. Open Library edition record
  try {
    const ol = await getJson(`https://openlibrary.org/isbn/${b.isbn13}.json`);
    rec.openLibrary = { status: ol.status, title: ol.body?.title ?? null, publishers: ol.body?.publishers ?? null, publishDate: ol.body?.publish_date ?? null, covers: ol.body?.covers?.length ?? 0 };
    rec.titleMatchOL = titleMatches(b.title.en, ol.body?.title);
  } catch (e) { rec.openLibrary = { status: 'ERROR', error: String(e).slice(0, 80) }; rec.titleMatchOL = false; }
  // 2. cover binary
  try {
    rec.cover = await getCover(`https://covers.openlibrary.org/b/isbn/${b.isbn13}-L.jpg?default=false`);
  } catch (e) { rec.cover = { status: 'ERROR', error: String(e).slice(0, 80) }; }
  // 3. Google Books cross-check
  try {
    const gb = await getJson(`https://www.googleapis.com/books/v1/volumes?q=isbn:${b.isbn13}`);
    const v = gb.body?.items?.[0]?.volumeInfo;
    rec.googleBooks = gb.body ? { status: gb.status, totalItems: gb.body.totalItems ?? 0, title: v?.title ?? null, publisher: v?.publisher ?? null, publishedDate: v?.publishedDate ?? null } : { status: gb.status };
    rec.titleMatchGB = titleMatches(b.title.en, v?.title);
  } catch (e) { rec.googleBooks = { status: 'ERROR', error: String(e).slice(0, 80) }; rec.titleMatchGB = false; }

  rec.verdict =
    rec.cover?.status === 200 && /image/.test(rec.cover?.mime ?? '') && !rec.cover?.blank
      ? (rec.titleMatchOL || rec.titleMatchGB ? 'VERIFIED (cover OK + bibliographic title match)' : 'COVER-OK-TITLE-UNCONFIRMED (review manually)')
      : 'FALLBACK-REQUIRED (cover unavailable — text card will render)';
  receipts.push(rec);
  console.log(`${b.isbn13} ${b.slug.padEnd(34)} cover=${rec.cover?.status}/${rec.cover?.mime?.split('/')[1]}/${rec.cover?.width}x${rec.cover?.height}/${rec.cover?.bytes}B matchOL=${rec.titleMatchOL} matchGB=${rec.titleMatchGB} => ${rec.verdict}`);
}

fs.writeFileSync(OUT, JSON.stringify({ verifiedAt: new Date().toISOString(), method: 'openlibrary isbn API + covers API + google books cross-check; no bytes stored', receipts }, null, 2) + '\n');
const ok = receipts.filter((r) => r.verdict.startsWith('VERIFIED')).length;
console.log(`\nVERIFIED: ${ok}/10 — receipts -> content/knowledge/cover-receipts.json`);
