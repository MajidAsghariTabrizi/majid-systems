import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import * as React from 'react';
import ts from 'typescript';

/* Exercise the actual UI callbacks with a local controller mock. The harness
 * deliberately skips effects: no DOM, request, timer, storage or LLM is used.
 * This catches draft loss in the shell even when the shared sender correctly
 * rejects a concurrent request. Streaming/citation internals remain untouched. */
type ElementLike = { type?: unknown; props?: { children?: unknown; [key: string]: unknown } };
const requireLocal = createRequire(import.meta.url);
const strings = {
  starters: [], suggestions: [], scopes: [], remainingTemplate: '{n} questions left',
  title: 'Mind', headline: 'Mind', inputLabel: 'Question', placeholder: 'Ask',
};

function findElement(tree: unknown, match: (node: ElementLike) => boolean): ElementLike | undefined {
  if (Array.isArray(tree)) {
    for (const node of tree) { const found = findElement(node, match); if (found) return found; }
  } else if (tree && typeof tree === 'object') {
    const node = tree as ElementLike;
    if (match(node)) return node;
    return findElement(node.props?.children, match);
  }
}

type Surface = 'full' | 'panel' | 'executive';
function renderComposer(surface: Surface, options: { busy?: boolean; asked?: number; draft?: string } = {}) {
  const busy = options.busy ?? false;
  const asked = options.asked ?? 0;
  const draft = options.draft ?? 'A question worth retaining';
  const executive = surface === 'executive';
  const states: unknown[] = executive
    ? ['en', 'chat', 'general', draft, null, new Set()]
    : [draft, false, null, new Set()];
  const inputIndex = executive ? 3 : 0;
  const sent: string[] = [];
  let stateIndex = 0;
  const react = {
    ...React,
    useState(initial: unknown) {
      const index = stateIndex++;
      if (index >= states.length) states[index] = typeof initial === 'function' ? initial() : initial;
      return [states[index], (next: unknown) => {
        states[index] = typeof next === 'function' ? next(states[index]) : next;
      }];
    },
    useRef: (initial: unknown) => ({ current: initial }),
    useEffect: () => undefined,
    useMemo: (compute: () => unknown) => compute(),
  };
  const controller = {
    messages: [], busy, asked, error: null, notice: null, retryQuestion: null,
    scope: 'all', setScope: () => undefined, reset: () => undefined, stop: () => undefined,
    send: (question: string) => { sent.push(question); },
  };
  const filename = path.resolve(process.cwd(), executive
    ? 'src/components/exec/ExecutiveDialogue.tsx'
    : surface === 'full' ? 'src/components/mind/MindFullPage.tsx' : 'src/components/mind/QuantiviqMindPanel.tsx');
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const module = { exports: {} as Record<string, (...args: unknown[]) => unknown> };
  const requireMock = (id: string) => {
    if (id === 'react') return react;
    if (id.startsWith('react/')) return requireLocal(id);
    if (id.includes('useMindChat')) return {
      MAX_QUESTIONS: 6, useMindChat: () => controller,
      useFollow: () => ({ ref: { current: null }, mode: 'reading', atBottom: true }),
    };
    if (id.includes('evidence')) return { MindMessage: () => null, EvidenceInspector: () => null, normalizeSources: () => [] };
    if (id.includes('strings')) return { MIND_STRINGS: { en: strings, fa: strings } };
    if (id === '@/lib/analytics') return { qEvent: () => undefined, oncePerSession: () => true };
    if (id === 'next/link') return { __esModule: true, default: 'a' };
    if (id === 'next/navigation') return { useSearchParams: () => ({ get: () => null }) };
    throw new Error('Unmocked composer dependency: ' + id);
  };
  vm.runInNewContext(compiled, {
    module, exports: module.exports, require: requireMock, console,
    setTimeout: () => 0, requestAnimationFrame: () => 0,
  }, { filename });
  let tree: unknown;
  if (executive) tree = module.exports.ExecutiveDialogue();
  else if (surface === 'panel') tree = module.exports.QuantiviqMindPanel({ locale: 'en', s: strings, onClose: () => undefined });
  else {
    const wrapper = module.exports.MindFullPage({ locale: 'en', s: strings }) as ElementLike;
    const inner = wrapper.props?.children as ElementLike;
    tree = (inner.type as (props: unknown) => unknown)(inner.props);
  }
  const input = findElement(tree, (node) => node.type === 'textarea');
  assert.ok(input, surface + ': textarea rendered');
  const form = findElement(tree, (node) => node.type === 'form');
  return {
    sent, draft: () => states[inputIndex],
    key(options: { composing?: boolean; shift?: boolean } = {}) {
      let prevented = false;
      (input.props?.onKeyDown as (event: unknown) => void)({
        key: 'Enter', shiftKey: options.shift ?? false,
        nativeEvent: { isComposing: options.composing ?? false },
        preventDefault: () => { prevented = true; },
      });
      return prevented;
    },
    submit() {
      assert.ok(form, surface + ': form rendered');
      (form.props?.onSubmit as (event: unknown) => void)({ preventDefault() {} });
    },
  };
}

for (const surface of ['full', 'panel', 'executive'] as Surface[]) {
  test(surface + ' composer retains its draft while a response is busy', () => {
    const ui = renderComposer(surface, { busy: true });
    ui.key();
    assert.deepEqual(ui.sent, []);
    assert.equal(ui.draft(), 'A question worth retaining');
  });
  test(surface + ' composer retains its draft at the session quota', () => {
    const ui = renderComposer(surface, { asked: surface === 'executive' ? 24 : 6 });
    ui.key();
    assert.deepEqual(ui.sent, []);
    assert.equal(ui.draft(), 'A question worth retaining');
  });
  test(surface + ' composer leaves IME confirmation and Shift+Enter to the input', () => {
    const ui = renderComposer(surface);
    assert.equal(ui.key({ composing: true }), false);
    assert.equal(ui.key({ shift: true }), false);
    assert.deepEqual(ui.sent, []);
    assert.equal(ui.draft(), 'A question worth retaining');
  });
  test(surface + ' composer sends a valid question and clears its draft', () => {
    const ui = renderComposer(surface);
    assert.equal(ui.key(), true);
    assert.deepEqual(ui.sent, ['A question worth retaining']);
    assert.equal(ui.draft(), '');
  });
  test(surface + ' composer ignores whitespace without changing the draft', () => {
    const ui = renderComposer(surface, { draft: '   ' });
    ui.key();
    assert.deepEqual(ui.sent, []);
    assert.equal(ui.draft(), '   ');
  });
}
for (const surface of ['full', 'panel'] as Surface[]) {
  test(surface + ' form submission uses the same busy guard as Enter', () => {
    const ui = renderComposer(surface, { busy: true });
    ui.submit();
    assert.deepEqual(ui.sent, []);
    assert.equal(ui.draft(), 'A question worth retaining');
  });
}
