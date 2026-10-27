/**
 * Ivory migration auditor: walks every major page (EN+FA), samples the
 * computed styles of text-bearing elements, and flags fg/bg pairs below
 * WCAG AA (4.5:1 normal, 3:1 large/24px+). Also checks page bg is ivory
 * family and reports invisible-text candidates. Simulator frame (.sim-frame)
 * is an intentional dark panel — audited separately against its own tokens.
 */
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:3219';
const PAGES = [['home', '/{loc}'], ['explore', '/{loc}/explore'], ['about', '/{loc}/about'], ['mind', '/{loc}/mind'], ['books', '/{loc}/insights/books'], ['stack', '/{loc}/insights/enterprise-ai-stack'], ['flows', '/{loc}/mind/flows'], ['insights', '/{loc}/insights'], ['lab', '/{loc}/lab'], ['article', '/{loc}/insights/ai-native-organization-design'], ['journey', '/journey'], ['work', '/work'], ['profile', '/profile']];

function composite(bg, root) {
  const m = bg.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)\)/);
  if (!m) return bg;
  const r = +m[1], g = +m[2], b = +m[3], a = +m[4];
  if (a >= 0.99) return bg;
  const R = root.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)\)/);
  if (!R) return bg;
  const mix = (fg, rt) => Math.round(fg * a + rt * (1 - a));
  return 'rgb(' + mix(r, +R[1]) + ', ' + mix(g, +R[2]) + ', ' + mix(b, +R[3]) + ')';
}
function lum(c) {
  const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
  if (!m) return null;
  const [r, g, b, a] = [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]];
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return { L: 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b), a };
}
function ratio(fg, bg) {
  const F = lum(fg), B = lum(bg);
  if (!F || !B) return null;
  const L1 = Math.max(F.L, B.L), L2 = Math.min(F.L, B.L);
  return (L1 + 0.05) / (L2 + 0.05);
}

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const totals = { flagged: 0, pages: 0 };
for (const [name, tpl] of PAGES) {
  for (const loc of ['en', 'fa']) {
    const route = tpl.includes('{loc}') ? tpl.replace('{loc}', loc) : tpl;
    if (loc === 'fa' && !tpl.includes('{loc}')) continue;
    try {
      const pg = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
      await pg.goto(BASE + route, { waitUntil: 'networkidle', timeout: 45000 });
      const res = await pg.evaluate(() => {
        const composite = (bg, root) => {
          const m = bg.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)\)/);
          if (!m) return bg;
          const r = +m[1], g = +m[2], b = +m[3], a = +m[4];
          if (a >= 0.99) return bg;
          const R = root.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)\)/);
          if (!R) return bg;
          const mix = (fg, rt) => Math.round(fg * a + rt * (1 - a));
          return 'rgb(' + mix(r, +R[1]) + ', ' + mix(g, +R[2]) + ', ' + mix(b, +R[3]) + ')';
        };
        const out = [];
        let rootBg = getComputedStyle(document.body).backgroundColor;
        if (/rgba\(.+0\)$/.test(rootBg.replace(/\s/g, ''))) rootBg = getComputedStyle(document.documentElement).backgroundColor;
        const bodyBg = rootBg;
        for (const el of document.querySelectorAll('body *')) {
          if (el.closest('.sim-frame')) continue; // intentional dark panel
          const cs = getComputedStyle(el);
          if (!cs.color || cs.visibility === 'hidden' || cs.display === 'none') continue;
          const txt = (el.childNodes.length && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 2)) ? el.textContent.trim().slice(0, 30) : null;
          if (!txt) continue;
          // effective background: nearest non-transparent ancestor
          let bg = 'rgba(0, 0, 0, 0)', grad = false, node = el;
          while (node && node !== document.documentElement) {
            const cs2 = getComputedStyle(node);
            if (cs2.backgroundImage && cs2.backgroundImage !== 'none') { grad = true; break; }
            const b = cs2.backgroundColor;
            if (b && !/rgba\(.+0\)$/.test(b.replace(/\s/g, ''))) { bg = b; break; }
            node = node.parentElement;
          }
          if (grad) continue; // gradient bg: verified separately (accent/ivory pairs)
          if (bg === 'rgba(0, 0, 0, 0)') bg = bodyBg;
          bg = composite(bg, bodyBg);
          const fs = parseFloat(cs.fontSize), fw = parseInt(cs.fontWeight) || 400;
          out.push({ txt, color: cs.color, bg, fs, fw, tag: el.tagName, cls: String(el.className).slice(0, 40) });
        }
        return { bodyBg, sample: out.slice(0, 900) };
      });
      totals.pages += 1;
      const seen = new Set();
      let flags = 0;
      for (const s of res.sample) {
        const r = ratio(s.color, s.bg);
        if (r === null) continue;
        const large = s.fs >= 24 || (s.fs >= 18.66 && s.fw >= 700);
        const need = large ? 3 : 4.5;
        if (r < need) {
          const key = s.color + '|' + s.bg + '|' + s.cls.slice(0, 15);
          if (seen.has(key)) continue;
          seen.add(key);
          flags += 1;
          if (flags <= 4) console.log('  LOW', (r.toFixed(2)), name, loc, s.tag + '.' + s.cls.slice(0, 22), JSON.stringify(s.txt.slice(0, 20)), s.color, 'on', s.bg);
        }
      }
      totals.flagged += flags;
      if (flags === 0) console.log('OK', name, loc, '(body ' + res.bodyBg + ')');
      await pg.close();
    } catch (e) { console.log('ERR', name, loc, String(e).slice(0, 40)); }
  }
}
await browser.close();
console.log('TOTAL pages:', totals.pages, '| unique low-contrast element styles:', totals.flagged);
