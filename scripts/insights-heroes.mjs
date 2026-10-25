#!/usr/bin/env node
/* Generates Quantiviq Insights visual assets:
 *   public/insights/heroes/<id>.svg   1600x900 conceptual hero per article
 *   og-src/<id>.svg                   1200x630 social preview composition
 *   public/og/insights/<id>.png       rendered via Playwright (--render)
 *
 * All artwork is original generative-composition SVG (typographic + geometric
 * diagrams) — not photography, not third-party charts. */
import fs from 'node:fs';
import path from 'node:path';

const HERO_DIR = path.join(process.cwd(), 'public', 'insights', 'heroes');
const OG_SRC = path.join(process.cwd(), 'captures-v5', 'og-src');
fs.mkdirSync(HERO_DIR, { recursive: true });
fs.mkdirSync(OG_SRC, { recursive: true });

const PILLAR_ACCENT = {
  'transformation-strategy': '#69deb9',
  'economics-value': '#f5b968',
  'ai-native-operations': '#80c9f8',
  'trust-governance': '#a694f7',
  'applied-industry': '#f27e85',
};
const PILLAR_NAME = {
  'transformation-strategy': 'AI TRANSFORMATION & STRATEGY',
  'economics-value': 'ECONOMICS & BUSINESS VALUE',
  'ai-native-operations': 'AI-NATIVE OPERATING MODELS',
  'trust-governance': 'TRUST, SAFETY & CHANGE',
  'applied-industry': 'APPLIED TRANSFORMATION',
};

/* per-article composition spec: family, key phrase, variant seed */
const ART = [
  { id: '01', pillar: 'transformation-strategy', family: 'flow', phrase: 'Tools ≠ transformation' },
  { id: '02', pillar: 'transformation-strategy', family: 'grid', phrase: 'Mission factory' },
  { id: '03', pillar: 'transformation-strategy', family: 'grid', phrase: 'Orchestration charts' },
  { id: '04', pillar: 'transformation-strategy', family: 'grid', phrase: 'Decision rights' },
  { id: '05', pillar: 'economics-value', family: 'waterfall', phrase: 'Value beyond productivity' },
  { id: '06', pillar: 'economics-value', family: 'ledger', phrase: 'The value ledger' },
  { id: '07', pillar: 'economics-value', family: 'ledger', phrase: 'True cost of agents' },
  { id: '08', pillar: 'economics-value', family: 'waterfall', phrase: 'Mission portfolio' },
  { id: '09', pillar: 'ai-native-operations', family: 'loop', phrase: 'Outcome ownership' },
  { id: '10', pillar: 'ai-native-operations', family: 'grid', phrase: 'Human + AI teams' },
  { id: '11', pillar: 'ai-native-operations', family: 'flow', phrase: 'Prototype → production' },
  { id: '12', pillar: 'ai-native-operations', family: 'roadmap', phrase: '90 days, 3 gates' },
  { id: '13', pillar: 'trust-governance', family: 'ladder', phrase: 'In the loop / on the loop' },
  { id: '14', pillar: 'trust-governance', family: 'ledger', phrase: 'Evaluate for outcomes' },
  { id: '15', pillar: 'trust-governance', family: 'ladder', phrase: 'Governance by design' },
  { id: '16', pillar: 'trust-governance', family: 'grid', phrase: 'Adoption is the product' },
  { id: '17', pillar: 'applied-industry', family: 'flow', phrase: 'Commercial operations' },
  { id: '18', pillar: 'applied-industry', family: 'signal', phrase: 'Decision intelligence' },
  { id: '19', pillar: 'applied-industry', family: 'waterfall', phrase: 'Revenue left behind' },
  { id: '20', pillar: 'applied-industry', family: 'roadmap', phrase: 'Inside a mission' },
];

/* deterministic pseudo-random from seed */
function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

const W = 1600;
const H = 900;
const M = 90; // margin

/* XML-escape text content: SVG files are XML; a raw & or < makes the whole
 * file unparseable and browsers refuse to render it as an <img> source. */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function frame(accent, num, phrase, pillarName) {
  return `
  <rect width="${W}" height="${H}" fill="#0a0d12"/>
  <g opacity="0.05" stroke="#8fa3b8" stroke-width="1">
    ${Array.from({ length: 15 }, (_, i) => `<line x1="${(i * W) / 14}" y1="0" x2="${(i * W) / 14}" y2="${H}"/>`).join('')}
    ${Array.from({ length: 9 }, (_, i) => `<line x1="0" y1="${(i * H) / 8}" x2="${W}" y2="${(i * H) / 8}"/>`).join('')}
  </g>
  <text x="${M}" y="${M + 26}" font-family="Inter, system-ui, sans-serif" font-size="26" font-weight="700" letter-spacing="8" fill="#8fa3b8">QUANTIVIQ · INSIGHTS</text>
  <text x="${M}" y="${M + 62}" font-family="Inter, system-ui, sans-serif" font-size="19" letter-spacing="4" fill="${accent}">${esc(pillarName)}</text>
  <text x="${W - M}" y="${M + 40}" text-anchor="end" font-family="Inter, system-ui, sans-serif" font-size="120" font-weight="800" fill="none" stroke="${accent}" stroke-width="2.5" opacity="0.9">${num}</text>
  <text x="${M}" y="${H - 66}" font-family="Inter, system-ui, sans-serif" font-size="54" font-weight="700" fill="#f1f5f9">${esc(phrase)}</text>
  <text x="${M}" y="${H - 30}" font-family="JetBrains Mono, monospace" font-size="19" letter-spacing="2" fill="#64748b">quantiviq.xyz/en/insights</text>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="#1c2733" stroke-width="1"/>`;
}

/* diagram families — original geometric compositions */
function familyFlow(seed, accent) {
  const r = rng(seed);
  const nodes = 7;
  const pts = Array.from({ length: nodes }, (_, i) => {
    const t = i / (nodes - 1);
    return { x: M + 140 + t * (W - 2 * M - 300), y: H / 2 - 40 + Math.sin(t * Math.PI * 1.6 + seed) * 120 + (r() - 0.5) * 40 };
  });
  let s = '';
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const mx = (a.x + b.x) / 2;
    s += `<path d="M${a.x + 26},${a.y} C${mx},${a.y} ${mx},${b.y} ${b.x - 26},${b.y}" fill="none" stroke="${accent}" stroke-width="2.5" opacity="${i === 0 ? 0.95 : 0.4}"/>`;
    s += `<circle cx="${b.x - 26}" cy="${b.y}" r="5" fill="${accent}" opacity="0.7"/>`;
  }
  pts.forEach((p, i) => {
    const human = i % 3 === 0;
    s += `<circle cx="${p.x}" cy="${p.y}" r="26" fill="#0d1420" stroke="${human ? '#80c9f8' : accent}" stroke-width="2.5"/>`;
    s += `<circle cx="${p.x}" cy="${p.y}" r="7" fill="${human ? '#80c9f8' : accent}"/>`;
    if (i === 2) s += `<circle cx="${p.x}" cy="${p.y}" r="40" fill="none" stroke="${accent}" stroke-width="1.5" stroke-dasharray="4 6" opacity="0.6"/>`;
  });
  return s;
}

function familyWaterfall(seed, accent) {
  const r = rng(seed);
  const bars = 6;
  const bw = (W - 2 * M - 200) / bars;
  let s = '';
  let level = 0;
  for (let i = 0; i < bars; i++) {
    const h = 120 + r() * 300 + (i === bars - 1 ? 180 : 0);
    level += h;
    const x = M + 100 + i * bw;
    const y = H - 220 - level / 2.4;
    const barH = level / 2.4;
    s += `<rect x="${x + 18}" y="${y}" width="${bw - 46}" height="${barH}" rx="6" fill="${i === bars - 1 ? accent : '#141f2b'}" stroke="${i === bars - 1 ? accent : '#2a3a4c'}" stroke-width="2" opacity="${i === bars - 1 ? 0.95 : 0.9}"/>`;
    if (i < bars - 1) {
      s += `<path d="M${x + bw - 28},${y + barH / 2} h16 v${60 + r() * 80} h-24" fill="none" stroke="${accent}" stroke-width="2" opacity="0.5"/>`;
    }
  }
  s += `<line x1="${M + 100}" y1="${H - 210}" x2="${W - M - 60}" y2="${H - 210}" stroke="#2a3a4c" stroke-width="2"/>`;
  return s;
}

function familyLadder(seed, accent) {
  const r = rng(seed);
  const steps = 5;
  let s = '';
  for (let i = 0; i < steps; i++) {
    const y = H - 200 - i * 95;
    const w = 420 + i * 150 + r() * 40;
    const x = M + 80;
    s += `<rect x="${x}" y="${y - 34}" width="${w}" height="68" rx="8" fill="#101a26" stroke="${i >= steps - 2 ? accent : '#2a3a4c'}" stroke-width="2.5" opacity="${0.55 + i * 0.09}"/>`;
    s += `<circle cx="${x + 40}" cy="${y}" r="9" fill="${i >= steps - 2 ? accent : '#3d5166'}"/>`;
    s += `<line x1="${x + 66}" y1="${y}" x2="${x + w - 30}" y2="${y}" stroke="#3d5166" stroke-width="2" stroke-dasharray="3 7"/>`;
  }
  const gx = W - M - 260;
  s += `<circle cx="${gx}" cy="${H / 2 - 40}" r="60" fill="none" stroke="${accent}" stroke-width="2.5"/>`;
  s += `<circle cx="${gx}" cy="${H / 2 - 40}" r="8" fill="${accent}"/>`;
  s += `<text x="${gx}" y="${H / 2 + 60}" text-anchor="middle" font-family="Inter, sans-serif" font-size="20" fill="#8fa3b8">approval</text>`;
  return s;
}

function familyGrid(seed, accent) {
  const r = rng(seed);
  const cols = 4;
  const rows = 3;
  const cw = 170;
  const ch = 110;
  const ox = M + 60;
  const oy = H / 2 - 200;
  const cells = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (r() < 0.28) continue;
      const x = ox + i * (cw + 50);
      const y = oy + j * (ch + 42);
      cells.push({ x, y, i, j });
    }
  }
  let s = '';
  // links first
  for (let a = 0; a < cells.length; a++) {
    for (let b = a + 1; b < cells.length; b++) {
      const A = cells[a];
      const B = cells[b];
      if ((A.i - B.i) ** 2 + (A.j - B.j) ** 2 === 1 && Math.random() === 0) continue;
      if (Math.abs(A.i - B.i) + Math.abs(A.j - B.j) !== 1) continue;
      if (r() < 0.4) continue;
      s += `<line x1="${A.x + cw / 2}" y1="${A.y + ch / 2}" x2="${B.x + cw / 2}" y2="${B.y + ch / 2}" stroke="${accent}" stroke-width="1.6" opacity="0.35"/>`;
    }
  }
  for (const c of cells) {
    const hub = r() < 0.22;
    s += `<rect x="${c.x}" y="${c.y}" width="${cw}" height="${ch}" rx="10" fill="#101a26" stroke="${hub ? accent : '#2a3a4c'}" stroke-width="${hub ? 2.5 : 1.6}"/>`;
    s += `<circle cx="${c.x + 30}" cy="${c.y + 30}" r="${hub ? 10 : 6}" fill="${hub ? accent : '#3d5166'}"/>`;
    s += `<line x1="${c.x + 22}" y1="${c.y + 62}" x2="${c.x + cw - 26}" y2="${c.y + 62}" stroke="#3d5166" stroke-width="3" opacity="0.7"/>`;
    s += `<line x1="${c.x + 22}" y1="${c.y + 80}" x2="${c.x + cw - 60}" y2="${c.y + 80}" stroke="#3d5166" stroke-width="3" opacity="0.4"/>`;
  }
  return s;
}

function familyLoop(seed, accent) {
  const cx = W / 2;
  const cy = H / 2 - 50;
  const R = 240;
  const n = 6;
  let s = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${accent}" stroke-width="2" stroke-dasharray="6 10" opacity="0.55"/>`;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(a) * R;
    const y = cy + Math.sin(a) * R;
    const a2 = ((i + 0.5) / n) * Math.PI * 2 - Math.PI / 2;
    const x2 = cx + Math.cos(a2) * R;
    const y2 = cy + Math.sin(a2) * R;
    s += `<path d="M${x + Math.cos(a) * 30},${y + Math.sin(a) * 30} A${R},${R} 0 0 1 ${x2},${y2}" fill="none" stroke="${accent}" stroke-width="2.4" marker-end=""/>`;
    s += `<circle cx="${x}" cy="${y}" r="24" fill="#101a26" stroke="${accent}" stroke-width="2"/>`;
    s += `<circle cx="${x}" cy="${y}" r="6" fill="${accent}"/>`;
  }
  s += `<circle cx="${cx}" cy="${cy}" r="46" fill="#0d1420" stroke="#2a3a4c" stroke-width="2"/>`;
  s += `<text x="${cx}" y="${cy + 8}" text-anchor="middle" font-family="Inter, sans-serif" font-size="22" font-weight="700" fill="#f1f5f9">learn</text>`;
  return s;
}

function familyLedger(seed, accent) {
  const r = rng(seed);
  let s = '';
  const rows = 7;
  const ox = M + 60;
  const oy = H / 2 - 210;
  const rw = W - 2 * M - 160;
  const rh = 64;
  s += `<rect x="${ox}" y="${oy - 70}" width="${rw}" height="52" rx="6" fill="${accent}" opacity="0.16"/>`;
  s += `<text x="${ox + 24}" y="${oy - 38}" font-family="JetBrains Mono, monospace" font-size="20" letter-spacing="3" fill="${accent}">VALUE LEDGER</text>`;
  for (let i = 0; i < rows; i++) {
    const y = oy + i * (rh + 16);
    const wfill = 0.25 + r() * 0.7;
    s += `<rect x="${ox}" y="${y}" width="${rw}" height="${rh}" rx="6" fill="#101a26" stroke="#2a3a4c" stroke-width="1.5"/>`;
    s += `<rect x="${ox + 2}" y="${y + 2}" width="${(rw - 4) * wfill}" height="${rh - 4}" rx="4" fill="${accent}" opacity="${i === rows - 1 ? 0.5 : 0.12}"/>`;
    s += `<line x1="${ox + 30}" y1="${y + rh / 2}" x2="${ox + 150}" y2="${y + rh / 2}" stroke="#3d5166" stroke-width="4"/>`;
    s += `<line x1="${ox + 190}" y1="${y + rh / 2}" x2="${ox + 290}" y2="${y + rh / 2}" stroke="#3d5166" stroke-width="4" opacity="0.5"/>`;
    s += `<text x="${ox + rw - 30}" y="${y + rh / 2 + 7}" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="22" fill="${i === rows - 1 ? accent : '#8fa3b8'}">${(wfill * 4).toFixed(1)}x</text>`;
  }
  return s;
}

function familyRoadmap(seed, accent) {
  const r = rng(seed);
  let s = '';
  const phases = 3;
  const py = H / 2 - 20;
  s += `<line x1="${M + 80}" y1="${py}" x2="${W - M - 80}" y2="${py}" stroke="#2a3a4c" stroke-width="3"/>`;
  for (let i = 0; i < phases; i++) {
    const x = M + 200 + i * ((W - 2 * M - 320) / (phases - 1));
    s += `<circle cx="${x}" cy="${py}" r="14" fill="#0d1420" stroke="${accent}" stroke-width="3"/>`;
    s += `<circle cx="${x}" cy="${py}" r="4" fill="${accent}"/>`;
    const bh = 120 + r() * 130;
    const up = i % 2 === 0;
    s += `<rect x="${x - 80}" y="${up ? py - bh - 34 : py + 34}" width="160" height="${bh}" rx="8" fill="#101a26" stroke="${i === phases - 1 ? accent : '#2a3a4c'}" stroke-width="2"/>`;
    for (let k = 0; k < 3; k++) {
      s += `<line x1="${x - 54}" y1="${(up ? py - bh : py + 60) + k * 26}" x2="${x + 54}" y2="${(up ? py - bh : py + 60) + k * 26}" stroke="#3d5166" stroke-width="3" opacity="${0.8 - k * 0.2}"/>`;
    }
  }
  s += `<text x="${M + 84}" y="${py - 24}" font-family="JetBrains Mono, monospace" font-size="19" fill="#64748b">DAY 0</text>`;
  s += `<text x="${W - M - 84}" y="${py - 24}" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="19" fill="${accent}">DAY 90</text>`;
  return s;
}

function familySignal(seed, accent) {
  const r = rng(seed);
  let s = '';
  // vertical signal path crossing horizontal decision bands
  const bands = 4;
  for (let i = 0; i < bands; i++) {
    const y = H / 2 - 170 + i * 105;
    s += `<rect x="${M + 60}" y="${y}" width="${W - 2 * M - 140}" height="66" rx="8" fill="#101a26" stroke="#2a3a4c" stroke-width="1.6"/>`;
    s += `<line x1="${M + 96}" y1="${y + 33}" x2="${M + 240 + r() * 200}" y2="${y + 33}" stroke="#3d5166" stroke-width="4"/>`;
    s += `<circle cx="${W - M - 150}" cy="${y + 33}" r="7" fill="none" stroke="${accent}" stroke-width="2"/>`;
  }
  const sx = M + 380;
  s += `<path d="M${sx},${H / 2 - 260} L${sx},${H / 2 + 300}" stroke="${accent}" stroke-width="3" stroke-dasharray="10 8"/>`;
  const y1 = H / 2 - 200;
  s += `<circle cx="${sx}" cy="${y1}" r="16" fill="${accent}"/>`;
  s += `<circle cx="${sx}" cy="${y1}" r="34" fill="none" stroke="${accent}" stroke-width="2" opacity="0.5"/>`;
  for (let i = 0; i < bands; i++) {
    const y = H / 2 - 170 + i * 105 + 33;
    if (r() < 0.75) s += `<circle cx="${sx}" cy="${y}" r="9" fill="#0d1420" stroke="${accent}" stroke-width="2.5"/>`;
  }
  return s;
}

const FAMILIES = { flow: familyFlow, waterfall: familyWaterfall, ladder: familyLadder, grid: familyGrid, loop: familyLoop, ledger: familyLedger, roadmap: familyRoadmap, signal: familySignal };

/* ---------------- heroes ---------------- */
for (const a of ART) {
  const accent = PILLAR_ACCENT[a.pillar];
  const draw = FAMILIES[a.family];
  const diagram = draw(Number(a.id) * 7919, accent);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Quantiviq Insights article ${a.id}: ${a.phrase}">
  <defs>
    <marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="${accent}"/>
    </marker>
  </defs>
  ${frame(accent, a.id, a.phrase, PILLAR_NAME[a.pillar])}
  <g>${diagram.replaceAll(' marker-end=""', ' marker-end="url(#arw)"')}</g>
</svg>`;
  fs.writeFileSync(path.join(HERO_DIR, `${a.id}.svg`), svg);
}

/* ---------------- OG compositions (1200x630) ---------------- */
function wrap(text, max) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max) {
      lines.push(cur.trim());
      cur = w;
    } else cur += ' ' + w;
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines.slice(0, 3);
}

const TITLES = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'captures-v5', 'og-titles.json'), 'utf8'));
for (const a of ART) {
  const accent = PILLAR_ACCENT[a.pillar];
  const title = TITLES[a.id] ?? a.phrase;
  const lines = wrap(title, 42);
  const fs1 = lines.length >= 3 ? 46 : lines.length === 2 ? 54 : 62;
  const startY = 300 - (lines.length - 1) * fs1 * 0.6;
  const titleSvg = lines.map((l, i) => `<text x="96" y="${startY + i * fs1 * 1.18}" font-family="Inter, system-ui, sans-serif" font-size="${fs1}" font-weight="800" fill="#f1f5f9">${l.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0a0d12"/>
  <g opacity="0.05" stroke="#8fa3b8">${Array.from({ length: 9 }, (_, i) => `<line x1="${i * 150}" y1="0" x2="${i * 150}" y2="630"/>`).join('')}</g>
  <text x="96" y="96" font-family="Inter, sans-serif" font-size="26" font-weight="700" letter-spacing="7" fill="#8fa3b8">QUANTIVIQ · INSIGHTS</text>
  <text x="96" y="136" font-family="Inter, sans-serif" font-size="19" letter-spacing="3" fill="${accent}">${esc(PILLAR_NAME[a.pillar])}</text>
  <text x="1104" y="150" text-anchor="end" font-family="Inter, sans-serif" font-size="96" font-weight="800" fill="none" stroke="${accent}" stroke-width="2.5">${a.id}</text>
  <rect x="96" y="168" width="120" height="5" fill="${accent}"/>
  ${titleSvg}
  <text x="96" y="560" font-family="JetBrains Mono, monospace" font-size="20" letter-spacing="2" fill="#64748b">quantiviq.xyz/en/insights</text>
  <rect x="0.5" y="0.5" width="1199" height="629" fill="none" stroke="#1c2733"/>
</svg>`;
  fs.writeFileSync(path.join(OG_SRC, `${a.id}.svg`), svg);
}

console.log(`heroes: ${ART.length} SVGs -> public/insights/heroes/`);
console.log(`og-src: ${ART.length} SVGs -> captures-v5/og-src/ (render with --render)`);
