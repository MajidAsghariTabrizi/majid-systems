/** Normalize search input only. Published text and canonical identifiers retain
 * their original spelling. Arabic/Persian letters, vowels, digits and joined
 * or spaced writing should not decide whether a visitor finds a resource. */
export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase('en')
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/\u0640/g, '')
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[أإٱآ]/g, 'ا')
    .replace(/[\u06F0-\u06F9\u0660-\u0669]/g, (digit) => {
      const code = digit.codePointAt(0)!;
      return String(code - (code >= 0x06f0 ? 0x06f0 : 0x0660));
    })
    .replace(/[\u200C\u200D\s]+/g, ' ')
    .trim();
}

export function matchesSearch(haystack: string, query: string): boolean {
  const needle = normalizeSearchText(query);
  if (!needle) return true;
  const text = normalizeSearchText(haystack);
  return text.includes(needle) || text.replace(/ /g, '').includes(needle.replace(/ /g, ''));
}
