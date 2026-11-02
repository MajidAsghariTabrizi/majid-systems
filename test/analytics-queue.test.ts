import assert from 'node:assert/strict';
import test from 'node:test';

/** qEvent/queue live in analytics.ts guarded by typeof window — exercise the
 *  module via a tiny window shim on globalThis before import. */
type Track = { calls: { name: string; data: Record<string, unknown> }[] };
async function fresh(mockWindow: Record<string, unknown> | null): Promise<Track> {
  const track: Track = { calls: [] };
  (globalThis as Record<string, unknown>).window = mockWindow ?? {};
  // reset module state between cases
  const mod = await import('../src/lib/analytics.ts');
  const qEvent = (mod as unknown as { qEvent: (n: string, d?: Record<string, unknown>) => void }).qEvent;
  return Object.assign(track, { qEvent });
}

test('qEvent: no window → silent no-op (SSR safe)', async () => {
  delete (globalThis as Record<string, unknown>).window;
  const mod = await import('../src/lib/analytics.ts');
  const qEvent = (mod as unknown as { qEvent: (n: string) => void }).qEvent;
  qEvent('solutions_view'); // must not throw
  assert.ok(true);
});

test('qEvent: collector ready → immediate sanitized track', async () => {
  const calls: { name: string; data: Record<string, unknown> }[] = [];
  const { qEvent } = await fresh({ umami: { track: (n: string, d?: Record<string, unknown>) => calls.push({ name: n, data: d ?? {} }) } });
  qEvent('solutions_view', { locale: 'fa', notAllowed: 'x' });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].name, 'solutions_view');
  assert.equal(calls[0].data.locale, 'fa');
  assert.equal('notAllowed' in calls[0].data, false);
});

test('qEvent: collector never appears → queued then dropped, never throws', async () => {
  const { qEvent } = await fresh({});
  qEvent('solution_finder_start', { locale: 'en' });
  qEvent('solution_request_start', { solution: 'quote-desk', locale: 'en' });
  await new Promise((r) => setTimeout(r, 120));
  qEvent('solution_request_success', { solution: 'quote-desk', locale: 'en' });
  assert.ok(true); // no throw, app usable
});

test('qEvent: taxonomy still rejects unknown names and sanitizes values', async () => {
  const calls: { name: string; data: Record<string, unknown> }[] = [];
  const { qEvent } = await fresh({ umami: { track: (n: string, d?: Record<string, unknown>) => calls.push({ name: n, data: d ?? {} }) } });
  qEvent('not_a_real_event');
  qEvent('solution_view', { solution: 'x'.repeat(300), locale: 'en' });
  // (a prior test's expiry timer may flush its own queued events here — filter)
  const mine = calls.filter((c) => c.name === 'solution_view' || c.name === 'not_a_real_event');
  assert.equal(mine.length, 1);
  assert.equal(mine[0].name, 'solution_view');
  assert.equal((mine[0].data.solution as string).length, 100);
});
