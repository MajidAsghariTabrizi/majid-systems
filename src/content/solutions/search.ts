/** Persian/Arabic text normalization for search matching ONLY (display text
 *  is never altered). Handles ZWNJ vs space vs joined forms (پیش‌فاکتور /
 *  پیش فاکتور / پیشفاکتور), Arabic yeh/kaf variants, and digits. */
export function normalizeFa(s: string): string {
  return s
    .toLowerCase()
    .replace(/\u064A/g, '\u06CC')       // Arabic yeh → Persian yeh
    .replace(/\u0643/g, '\u06A9')       // Arabic kaf → Persian kaf
    .replace(/[\u06F0-\u06F9\u0660-\u0669]/g, (d) => {
      const fa = '\u06F0'.codePointAt(0)!;
      const ar = '\u0660'.codePointAt(0)!;
      const cp = d.codePointAt(0)!;
      return String(cp - (cp >= fa ? fa : ar));
    })
    .replace(/\u200C/g, ' ')          // ZWNJ behaves like a word separator for matching
    .replace(/\s+/g, ' ')
    .trim();
}

/** Match needle against haystack with both raw-space and no-space variants,
 *  plus small truthful aliases for real catalog terms. */
const ALIASES: Record<string, string[]> = {
  'پیش فاکتور': ['quote desk', 'quotation'],
  'فاکتور': ['invoice'],
  'مغایرت گیری': ['reconciliation'],
  'مطالبات': ['receivables', 'recovery'],
};
export function faMatch(haystack: string, needle: string): boolean {
  const h = normalizeFa(haystack);
  const n = normalizeFa(needle);
  if (!n) return true;
  if (h.includes(n)) return true;
  // no-space comparison catches joined/split writing variants
  if (h.replace(/ /g, '').includes(n.replace(/ /g, ''))) return true;
  for (const [k, aliases] of Object.entries(ALIASES)) {
    if (normalizeFa(k) === n && aliases.some((a) => h.includes(a))) return true;
    if (aliases.some((a) => normalizeFa(a) === n) && h.includes(normalizeFa(k))) return true;
  }
  return false;
}
