/**
 * Executive Dialogue surface — isolation and contract tests.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf8');

test('/meet-majid route exists in its own shell with noindex metadata', () => {
  const page = read('src/app/(exec)/meet-majid/page.tsx');
  assert.ok(page.includes('index: false'), 'noindex set');
  assert.ok(page.includes('ExecutiveDialogue'), 'renders the exec component');
  const layout = read('src/app/(exec)/layout.tsx');
  assert.ok(!layout.includes('<Header'), 'no public header');
  assert.ok(!layout.includes('<Footer'), 'no public footer');
  assert.ok(!layout.includes('QuantiviqMind'), 'no floating mind panel');
  assert.ok(layout.includes('noindex'), 'layout-level robots too');
});

test('no public page links to /meet-majid', () => {
  const offenders: string[] = [];
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { if (e.name !== 'node_modules' && e.name !== '.next') walk(p); }
      else if (/\.(tsx?|mjs)$/.test(e.name)) {
        const src = fs.readFileSync(p, 'utf8');
        // references allowed only inside the exec surface and gateway comment
        if (src.includes('/meet-majid') && !p.includes('meet-majid') && !p.includes(path.join('components', 'exec')) && !p.endsWith(path.join('chat', 'route.ts')) && !p.includes('next.config.mjs')) offenders.push(p);
      }
    }
  };
  walk('src');
  assert.deepEqual(offenders, []);
});

test('sitemap excludes the unlisted route', () => {
  const sm = read('src/app/sitemap.ts');
  assert.ok(!sm.includes('meet-majid'));
});

test('gateway validates persona and forwards it', () => {
  const gw = read('src/app/api/public-mind/chat/route.ts');
  assert.ok(gw.includes("PERSONAS"), 'persona validation present');
  assert.ok(gw.includes("'executive'"), 'executive persona known');
  assert.ok(gw.includes('persona,'), 'forwarded upstream');
});

test('service defines executive persona contract (prompt, top_k, limit)', () => {
  const svc = read('public-mind/service/mind_service.py');
  assert.ok(svc.includes('EXECUTIVE_SYSTEM_PROMPT'), 'exec prompt exists');
  assert.ok(svc.includes('"executive": {"prompt": EXECUTIVE_SYSTEM_PROMPT, "top_k": 7, "session_limit": 24}'), 'persona table exact');
  assert.ok(svc.includes('body.get("persona") or "default"'), 'absent persona = default (backward compat)');
  assert.ok(svc.includes('PERSONAS[persona]["prompt"]'), 'prompt selected by persona');
});

test('executive component sends persona and renders citations + disclosure', () => {
  const comp = read('src/components/exec/ExecutiveDialogue.tsx');
  assert.ok(comp.includes("persona: 'executive'"), 'persona sent');
  assert.ok(comp.includes('not Majid live'), 'AI-representation disclosure present');
  assert.ok(comp.includes('Unlisted, not private'), 'unlisted-not-private note present');
  assert.ok(comp.includes('MindMessage'), 'shared citation renderer used');
  assert.ok(comp.includes('EvidenceInspector'), 'evidence inspector present');
  assert.ok(comp.includes('useFollow'), 'streaming-stable follow engine used');
  assert.ok(comp.includes('AbortError'), 'cancel handled');
  assert.ok(comp.includes('retryQ'), 'retry restores failed question');
  assert.ok(comp.includes('MAX_QUESTIONS') === false, 'own limit constant');
  // v2 landing contract: one-action entry, no auto-send, history preserved
  assert.ok(comp.includes('ctaStart'), 'primary CTA copy');
  assert.ok(comp.includes('ctaContinue'), 'continue state for existing conversation');
  assert.ok(comp.includes('ex2-landing'), 'landing stage');
  assert.ok(comp.includes('diagram'), 'mechanism diagram labels');
});
