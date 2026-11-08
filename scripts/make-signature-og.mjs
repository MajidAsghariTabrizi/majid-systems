/** Code-native social card; uses the renderer already bundled with Next. */
import { createElement as h } from 'react';
import { readFile, writeFile, unlink } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

// Next 14's bundled renderer joins file URLs with path.join, which is invalid
// on Windows. Resolve its three local resources in an ephemeral module.
// The installed package and application dependencies are never modified.
const compiled = fileURLToPath(new URL('../node_modules/next/dist/compiled/@vercel/og/index.node.js', import.meta.url));
let renderer = await readFile(compiled, 'utf8');
for (const asset of ['noto-sans-v27-latin-regular.ttf', 'yoga.wasm', 'resvg.wasm']) {
  renderer = renderer.replace(`fileURLToPath(join(import.meta.url, "../${asset}"))`, JSON.stringify(join(dirname(compiled), asset)));
}
const temporary = join(tmpdir(), `quantiviq-og-renderer-${process.pid}.mjs`);
await writeFile(temporary, renderer);
const { ImageResponse } = await import(pathToFileURL(temporary).href);

const card = h('div', { style: { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%', padding: '60px 72px', background: '#f5f1e9', color: '#542b3a' } },
  h('div', { style: { display: 'flex', alignItems: 'center', gap: 20, fontSize: 24, letterSpacing: 5 } },
    h('div', { style: { display: 'flex', width: 34, height: 34, border: '3px solid #542b3a', borderRadius: 6 } }), 'QUANTIVIQ'),
  h('div', { style: { display: 'flex', alignItems: 'center', gap: 52 } },
    h('div', { style: { display: 'flex', flexDirection: 'column', width: 725 } },
      h('div', { style: { fontSize: 65, fontWeight: 600, lineHeight: 1.08, letterSpacing: -3 } }, 'Design the company around better decisions.'),
      h('div', { style: { fontSize: 23, lineHeight: 1.5, color: '#6c6065', marginTop: 24 } }, 'People, AI and shared knowledge. One connected way of working.')),
    h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 240, gap: 16 } },
      h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ab5836', padding: '15px 20px', fontSize: 18 } }, 'AUTHORITY'),
      h('div', { style: { width: 1, height: 25, background: '#ab5836' } }),
      h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 150, height: 150, borderRadius: 100, background: '#eee0dc', border: '1px solid #ab5836', fontSize: 16 } }, 'KNOWLEDGE'),
      h('div', { style: { width: 1, height: 25, background: '#ab5836' } }),
      h('div', { style: { fontSize: 18, color: '#884329' } }, 'ACTION → LEARNING'))),
  h('div', { style: { display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #bdada4', paddingTop: 20, fontSize: 17, color: '#6c6065' } },
    h('span', {}, 'Majid Asghari Tabrizi'), h('span', {}, 'OPERATOR-LED · EVIDENCE-FIRST'), h('span', {}, 'quantiviq.xyz')));

const response = new ImageResponse(card, { width: 1200, height: 630 });
const output = new URL('../public/og/quantiviq-og.png', import.meta.url);
await writeFile(output, Buffer.from(await response.arrayBuffer()));
await unlink(temporary);
console.log('Updated site social card.');
