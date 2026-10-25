#!/usr/bin/env node
/* Generates Quantiviq Insights PERSIAN visual assets:
 *   public/insights/heroes/fa/<id>.svg   1600x900 conceptual hero per article
 *   captures-v5/og-src-fa/<id>.svg       1200x630 social preview composition
 *
 * Mirrors scripts/insights-heroes.mjs with Persian labels, Estedad-first font
 * stack, and an RTL-mirrored frame. Diagram families are the same original
 * geometric compositions (language-neutral), with Persian label overrides.
 */
import fs from 'node:fs';
import path from 'node:path';

const HERO_DIR = path.join(process.cwd(), 'public', 'insights', 'heroes', 'fa');
const OG_SRC = path.join(process.cwd(), 'captures-v5', 'og-src-fa');
fs.mkdirSync(HERO_DIR, { recursive: true });
fs.mkdirSync(OG_SRC, { recursive: true });

const PILLAR_ACCENT = {
  'transformation-strategy': '#69deb9',
  'economics-value': '#f5b968',
  'ai-native-operations': '#80c9f8',
  'trust-governance': '#a694f7',
  'applied-industry': '#f27e85',
};
const PILLAR_NAME_FA = {
  'transformation-strategy': 'تحول و استراتژی هوش مصنوعی',
  'economics-value': 'اقتصاد و ارزش کسب‌وکاری',
  'ai-native-operations': 'مدل‌های عملیاتی بومی هوش مصنوعی',
  'trust-governance': 'اعتماد، ایمنی و تغییر',
  'applied-industry': 'تحول کاربردی',
};

/* per-article composition spec: family + Persian key phrase */
const ART = [
  { id: '01', pillar: 'transformation-strategy', family: 'flow', phrase: 'ابزار ≠ تحول' },
  { id: '02', pillar: 'transformation-strategy', family: 'grid', phrase: 'کارخانهٔ مأموریت' },
  { id: '03', pillar: 'transformation-strategy', family: 'grid', phrase: 'چارت‌های ارکستراسیون' },
  { id: '04', pillar: 'transformation-strategy', family: 'grid', phrase: 'اختیارات تصمیم' },
  { id: '05', pillar: 'economics-value', family: 'waterfall', phrase: 'ارزش فراتر از بهره‌وری' },
  { id: '06', pillar: 'economics-value', family: 'ledger', phrase: 'دفتر ارزش' },
  { id: '07', pillar: 'economics-value', family: 'ledger', phrase: 'هزینهٔ واقعی عامل‌ها' },
  { id: '08', pillar: 'economics-value', family: 'waterfall', phrase: 'پرتفوی مأموریت' },
  { id: '09', pillar: 'ai-native-operations', family: 'loop', phrase: 'مالکیت نتیجه' },
  { id: '10', pillar: 'ai-native-operations', family: 'grid', phrase: 'تیم‌های انسان + هوش مصنوعی' },
  { id: '11', pillar: 'ai-native-operations', family: 'flow', phrase: 'از نمونهٔ اولیه تا تولید' },
  { id: '12', pillar: 'ai-native-operations', family: 'roadmap', phrase: '۹۰ روز، ۳ دروازه' },
  { id: '13', pillar: 'trust-governance', family: 'ladder', phrase: 'در حلقه / روی حلقه' },
  { id: '14', pillar: 'trust-governance', family: 'ledger', phrase: 'ارزیابی برای نتیجه‌ها' },
  { id: '15', pillar: 'trust-governance', family: 'ladder', phrase: 'حکمرانی از ابتدا در طراحی' },
  { id: '16', pillar: 'trust-governance', family: 'grid', phrase: 'پذیرش، خودِ محصول است' },
  { id: '17', pillar: 'applied-industry', family: 'flow', phrase: 'عملیات تجاری FMCG' },
  { id: '18', pillar: 'applied-industry', family: 'signal', phrase: 'هوش تصمیم' },
  { id: '19', pillar: 'applied-industry', family: 'waterfall', phrase: 'درآمدِ جاگذاشته' },
  { id: '20', pillar: 'applied-industry', family: 'roadmap', phrase: 'درون یک مأموریت' },
];

const FA_FONT = 'Estedad, Vazirmatn, Tahoma, system-ui, sans-serif';
const FA_MONO = 'Estedad, Tahoma, sans-serif';

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
const M = 90;

function frame(accent, num, phrase, pillarName) {
  return `
  <rect width="${W}" height="${H}" fill="#0a0d12"/>
  <g opacity="0.05" stroke="#8fa3b8" stroke-width="1">
    ${Array.from({ length: 15 }, (_, i) => `<line x1="${(i * W) / 14}" y1="0" x2="${(i * W) / 14}" y2="${H}"/>`).join('')}
    ${Array.from({ length: 9 }, (_, i) => `<line x1="0" y1="${(i * H) / 8}" x2="${W}" y2="${(i * H) / 8}"/>`).join('')}
  </g>
  <text x="${W - M}" y="${M + 26}" text-anchor="end" font-family="Inter, system-ui, sans-serif" font-size="26" font-weight="700" letter-spacing="8" fill="#8fa3b8">QUANTIVIQ · INSIGHTS</text>
  <text x="${W - M}" y="${M + 62}" text-anchor="end" font-family="${FA_FONT}" font-size="24" fill="${accent}">${pillarName}</text>
  <text x="${M}" y="${M + 40}" text-anchor="start" font-family="Inter, system-ui, sans-serif" font-size="120" font-weight="800" fill="none" stroke="${accent}" stroke-width="2.5" opacity="0.9">${num}</text>
  <text x="${W - M}" y="${H - 66}" text-anchor="end" font-family="${FA_FONT}" font-size="56" font-weight="700" fill="#f1f5f9">${phrase}</text>
  <text x="${M}" y="${H - 30}" font-family="JetBrains Mono, monospace" font-size="19" letter-spacing="2" fill="#64748b">quantiviq.xyz/fa/insights</text>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="#1c2733" stroke-width="1"/>`;
}

/* diagram families — same original geometric compositions, Persian labels */
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
    const x = W - M - 80 - w; // mirrored: ladders grow from the right
    s += `<rect x="${x}" y="${y - 34}" width="${w}" height="68" rx="8" fill="#101a26" stroke="${i >= steps - 2 ? accent : '#2a3a4c'}" stroke-width="2.5" opacity="${0.55 + i * 0.09}"/>`;
    s += `<circle cx="${x + w - 40}" cy="${y}" r="9" fill="${i >= steps - 2 ? accent : '#3d5166'}"/>`;
    s += `<line x1="${x + 30}" y1="${y}" x2="${x + w - 66}" y2="${y}" stroke="#3d5166" stroke-width="2" stroke-dasharray="3 7"/>`;
  }
  const gx = M + 260;
  s += `<circle cx="${gx}" cy="${H / 2 - 40}" r="60" fill="none" stroke="${accent}" stroke-width="2.5"/>`;
  s += `<circle cx="${gx}" cy="${H / 2 - 40}" r="8" fill="${accent}"/>`;
  s += `<text x="${gx}" y="${H / 2 + 60}" text-anchor="middle" font-family="${FA_FONT}" font-size="22" fill="#8fa3b8">تأیید</text>`;
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
  for (let a = 0; a < cells.length; a++) {
    for (let b = a + 1; b < cells.length; b++) {
      const A = cells[a];
      const B = cells[b];
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
  s += `<text x="${cx}" y="${cy + 8}" text-anchor="middle" font-family="${FA_FONT}" font-size="22" font-weight="700" fill="#f1f5f9">یادگیری</text>`;
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
  s += `<text x="${ox + rw - 24}" y="${oy - 36}" text-anchor="end" font-family="${FA_MONO}" font-size="24" fill="${accent}">دفتر ارزش</text>`;
  for (let i = 0; i < rows; i++) {
    const y = oy + i * (rh + 16);
    const wfill = 0.25 + r() * 0.7;
    s += `<rect x="${ox}" y="${y}" width="${rw}" height="${rh}" rx="6" fill="#101a26" stroke="#2a3a4c" stroke-width="1.5"/>`;
    s += `<rect x="${ox + 2}" y="${y + 2}" width="${(rw - 4) * wfill}" height="${rh - 4}" rx="4" fill="${accent}" opacity="${i === rows - 1 ? 0.5 : 0.12}"/>`;
    s += `<line x1="${ox + rw - 150}" y1="${y + rh / 2}" x2="${ox + rw - 30}" y2="${y + rh / 2}" stroke="#3d5166" stroke-width="4"/>`;
    s += `<line x1="${ox + rw - 290}" y1="${y + rh / 2}" x2="${ox + rw - 190}" y2="${y + rh / 2}" stroke="#3d5166" stroke-width="4" opacity="0.5"/>`;
    s += `<text x="${ox + 30}" y="${y + rh / 2 + 7}" font-family="JetBrains Mono, monospace" font-size="22" fill="${i === rows - 1 ? accent : '#8fa3b8'}">${(wfill * 4).toFixed(1)}x</text>`;
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
  s += `<text x="${W - M - 84}" y="${py - 24}" text-anchor="end" font-family="${FA_MONO}" font-size="21" fill="#64748b">روز ۰</text>`;
  s += `<text x="${M + 84}" y="${py - 24}" font-family="${FA_MONO}" font-size="21" fill="${accent}">روز ۹۰</text>`;
  return s;
}

function familySignal(seed, accent) {
  const r = rng(seed);
  let s = '';
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
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="کوآنتی‌ویک اینسایتس، مقالهٔ ${a.id}: ${a.phrase}">
  <defs>
    <marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="${accent}"/>
    </marker>
  </defs>
  ${frame(accent, a.id, a.phrase, PILLAR_NAME_FA[a.pillar])}
  <g>${diagram.replaceAll(' marker-end=""', ' marker-end="url(#arw)"')}</g>
</svg>`;
  fs.writeFileSync(path.join(HERO_DIR, `${a.id}.svg`), svg);
}

/* ---------------- OG compositions (1200x630, Persian) ---------------- */
const OG_TITLES_FA = {
  '01': 'پذیرش هوش مصنوعی، تحول با هوش مصنوعی نیست',
  '02': 'کارخانهٔ مأموریت عامل‌محور',
  '03': 'از چارت سازمانی تا چارت ارکستراسیون',
  '04': 'مالک تحول هوش مصنوعی کیست؟',
  '05': 'سنجش ارزش هوش مصنوعی، فراتر از بهره‌وری',
  '06': 'دفتر ارزش تحول هوش مصنوعی',
  '07': 'هزینهٔ واقعی عامل‌های سازمانی هوش مصنوعی',
  '08': 'اولویت‌بندی مأموریت‌های پربار هوش مصنوعی',
  '09': 'مدل عملیاتی محصول بومی هوش مصنوعی',
  '10': 'طراحی تیم‌های محصول انسان و هوش مصنوعی',
  '11': 'از نمونهٔ اولیه هوش مصنوعی تا تولید',
  '12': 'نقشهٔ راه ۹۰ روزهٔ تحول با هوش مصنوعی',
  '13': 'انسان-در-حلقه در برابر انسان-روی-حلقه',
  '14': 'ارزیابی عامل هوش مصنوعی برای نتیجه‌های کسب‌وکاری',
  '15': 'حکمرانی هوش مصنوعی عامل‌محور، از ابتدا در طراحی',
  '16': 'چرا تحول هوش مصنوعی بدون مدیریت تغییر شکست می‌خورد',
  '17': 'هوش مصنوعی عامل‌محور برای عملیات تجاری FMCG',
  '18': 'هوش تصمیم بومی هوش مصنوعی در زنجیرهٔ تأمین',
  '19': 'بازیابی درآمدِ ازدست‌رفته میان موجودی، قیمت‌گذاری و پروموشن‌ها',
  '20': 'درون یک مأموریت تحول بومی هوش مصنوعی',
};

function wrapFa(text, max) {
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

for (const a of ART) {
  const accent = PILLAR_ACCENT[a.pillar];
  const title = OG_TITLES_FA[a.id] ?? a.phrase;
  const lines = wrapFa(title, 34);
  const fs1 = lines.length >= 3 ? 42 : lines.length === 2 ? 50 : 58;
  const startY = 300 - (lines.length - 1) * fs1 * 0.6;
  const titleSvg = lines.map((l, i) => `<text x="1104" y="${startY + i * fs1 * 1.2}" text-anchor="end" font-family="${FA_FONT}" font-size="${fs1}" font-weight="800" fill="#f1f5f9">${l.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0a0d12"/>
  <g opacity="0.05" stroke="#8fa3b8">${Array.from({ length: 9 }, (_, i) => `<line x1="${i * 150}" y1="0" x2="${i * 150}" y2="630"/>`).join('')}</g>
  <text x="1104" y="96" text-anchor="end" font-family="Inter, sans-serif" font-size="26" font-weight="700" letter-spacing="7" fill="#8fa3b8">QUANTIVIQ · INSIGHTS</text>
  <text x="1104" y="140" text-anchor="end" font-family="${FA_FONT}" font-size="21" fill="${accent}">${PILLAR_NAME_FA[a.pillar]}</text>
  <text x="96" y="150" text-anchor="start" font-family="Inter, sans-serif" font-size="96" font-weight="800" fill="none" stroke="${accent}" stroke-width="2.5">${a.id}</text>
  <rect x="984" y="168" width="120" height="5" fill="${accent}"/>
  ${titleSvg}
  <text x="1104" y="560" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="20" letter-spacing="2" fill="#64748b">quantiviq.xyz/fa/insights</text>
  <rect x="0.5" y="0.5" width="1199" height="629" fill="none" stroke="#1c2733"/>
</svg>`;
  fs.writeFileSync(path.join(OG_SRC, `${a.id}.svg`), svg);
}

console.log(`heroes-fa: ${ART.length} SVGs -> public/insights/heroes/fa/`);
console.log(`og-src-fa: ${ART.length} SVGs -> captures-v5/og-src-fa/ (render with insights-og-fa.mjs)`);
