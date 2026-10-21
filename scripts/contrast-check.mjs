/**
 * WCAG contrast validation for the simulator command-center tokens.
 * Targets: >= 4.5:1 normal text, >= 3:1 large text and meaningful graphics.
 */
const L = (hex) => {
  const c = hex.replace('#', '');
  const f = (v) => {
    const s = parseInt(v, 16) / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(c.slice(0, 2)) + 0.7152 * f(c.slice(2, 4)) + 0.0722 * f(c.slice(4, 6));
};
const ratio = (a, b) => {
  const [x, y] = [L(a), L(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const BG = '#0b1119';
const SURFACE = '#141f2b';
const ELEV = '#1c2a38';

const checks = [
  ['primary text on surface', '#f1f5f9', SURFACE, 4.5],
  ['secondary text on surface', '#b4c3d1', SURFACE, 4.5],
  ['primary text on elevated', '#f1f5f9', ELEV, 4.5],
  ['secondary text on elevated', '#b4c3d1', ELEV, 4.5],
  ['node label on node fill', '#f1f5f9', SURFACE, 4.5],
  ['node role on node fill', '#b4c3d1', SURFACE, 4.5],
  ['CTA text on mint', '#08130e', '#69deb9', 4.5],
  ['decision on stage bg (KPI)', '#f5b968', BG, 4.5],
  ['mint on stage bg (KPI)', '#69deb9', BG, 4.5],
  ['loss on surface (KPI)', '#f27e85', SURFACE, 4.5],
  ['edge base on stage bg (graphic)', '#55708c', BG, 3],
  ['hierarchy edge on stage bg (graphic)', '#566f8a', BG, 3],
  ['flow edge on stage bg (graphic)', '#f5b968', BG, 3],
  ['new edge on stage bg (graphic)', '#69deb9', BG, 3],
  ['human accent on node fill (graphic)', '#80c9f8', '#12202c', 3],
  ['agent accent on node fill (graphic)', '#69deb9', '#0f211c', 3],
  ['gate accent on node fill (graphic)', '#f5b968', '#221a10', 3],
  ['event accent on node fill (graphic)', '#a694f7', '#171327', 3],
];

let fail = 0;
for (const [name, fg, bg, min] of checks) {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${r.toFixed(2)}:1 (min ${min})  ${name}  ${fg} on ${bg}`);
}
console.log(fail === 0 ? 'CONTRAST: ALL PASS' : `CONTRAST: ${fail} FAIL`);
process.exit(fail ? 1 : 0);
