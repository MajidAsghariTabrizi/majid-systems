import io
t = '''/**
 * Service streaming-sanitizer contract (2026-10-26 bug: sanitize_output result
 * was discarded after streaming; deltas reached clients raw).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('streamed deltas pass through the safe emitter, not raw sse', () => {
  const svc = fs.readFileSync('public-mind/service/mind_service.py', 'utf8');
  assert.ok(svc.includes('def make_safe_emitter'), 'safe emitter defined');
  assert.ok(svc.includes('def _safe_cut'), 'URL-boundary guard defined');
  assert.ok(svc.includes('call_glm_stream(messages, emit_delta)'), 'generation streams through emitter');
  assert.ok(svc.includes('flush_delta()'), 'pending tail flushed after generation');
  assert.ok(!svc.includes("call_glm_stream(\n                messages, lambda d: sse("), 'no raw-delta path remains');
});
'''
io.open("test/svc-sanitizer.test.ts", "w", encoding="utf-8", newline="\n").write(t)
print("test written")
