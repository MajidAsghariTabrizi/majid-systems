/* FA figure anchor fix: inline figure SVGs on RTL pages inherit direction:rtl,
 * which flips text-anchor semantics (start = right edge at x, end = left edge
 * at x). The Persian figures were authored with LTR anchor semantics (mirroring
 * the EN geometry), so every start/end-anchored <text> renders from the wrong
 * edge — mispositioned inside the figure, and clipped where it crosses the
 * viewBox. This transform re-authors the anchors to match the RTL rendering:
 *   middle          -> unchanged (symmetric)
 *   end  (right-align authored intent) -> start (right edge at x under rtl)
 *   start/none (left-align authored intent) -> end (left edge at x under rtl)
 * Persian bidi paragraph order is untouched (direction stays rtl), so
 * Persian+Latin mixed labels keep their correct reading order. */
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.join(process.cwd(), 'content', 'insights', 'fa');
for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('.md'))) {
  const p = path.join(DIR, f);
  let text = fs.readFileSync(p, 'utf8');
  let changed = 0;

  // operate only inside <svg ...>...</svg> spans
  text = text.replace(/<svg[\s\S]*?<\/svg>/g, (svg) =>
    svg.replace(/<text\b[^>]*>/g, (tag) => {
      if (/text-anchor="middle"/.test(tag)) return tag;
      if (/text-anchor="end"/.test(tag)) {
        changed++;
        return tag.replace(/\s*text-anchor="end"/, '');
      }
      if (/text-anchor="start"/.test(tag)) {
        changed++;
        return tag.replace(/text-anchor="start"/, 'text-anchor="end"');
      }
      changed++;
      return tag.replace(/<text\b/, '<text text-anchor="end"');
    }),
  );

  if (changed > 0) {
    fs.writeFileSync(p, text, 'utf8');
    console.log(`${f}: ${changed} text anchor(s) re-authored for RTL`);
  }
}
console.log('done');
