'use client';

/**
 * Client loader for the public sanitized lab snapshot.
 *
 * The artifact is a static, cacheable asset committed with the site
 * (public/lab/snapshot.json.gz) — there is NO runtime connection to any
 * private system. If the asset cannot be loaded (rare: JS disabled networks,
 * CDN fault), the lab renders an explicit unavailability state. It never
 * fabricates data.
 */

import type { LabSnapshot } from '@/content/lab/types';

export type LoadResult =
  | { kind: 'snapshot'; data: LabSnapshot }
  | { kind: 'unavailable'; reason: string };

async function loadSnapshot(): Promise<LabSnapshot | null> {
  // root-absolute: the lab renders under /en/lab and /fa/lab — a relative URL
  // would resolve against the locale prefix and 404. The artifact ships gzip
  // bytes under a custom extension (Next mis-serves .gz statics with 204);
  // DecompressionStream inflates it in the browser.
  const res = await fetch('/lab/snapshot.labpack', { cache: 'force-cache' });
  if (!res.ok) return null;
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  const isGzipMagic = bytes.length > 2 && bytes[0] === 0x1f && bytes[1] === 0x8b;
  try {
    let text: string;
    if (isGzipMagic) {
      if (typeof DecompressionStream === 'undefined') return null;
      const ds = new DecompressionStream('gzip');
      const stream = new Blob([buf]).stream().pipeThrough(ds);
      text = await new Response(stream).text();
    } else {
      text = new TextDecoder().decode(buf);
    }
    const snap = JSON.parse(text) as LabSnapshot;
    if (!snap?.decisions_compact?.length || !snap?.meta?.generated_at) return null;
    return snap;
  } catch {
    return null;
  }
}

export async function loadLabData(): Promise<LoadResult> {
  try {
    const snap = await loadSnapshot();
    if (snap) return { kind: 'snapshot', data: snap };
    return { kind: 'unavailable', reason: 'artifact-missing-or-invalid' };
  } catch (e) {
    return { kind: 'unavailable', reason: e instanceof Error ? e.message : 'network' };
  }
}

export interface LabStatus {
  artifact: string;
  generated_at: string;
  sanitized_at: string;
  age_hours: number;
  artifact_sha256: string;
  counts?: Record<string, number>;
  window_days?: number;
}

export async function fetchStatus(): Promise<LabStatus | null> {
  try {
    const res = await fetch('/api/lab/status', { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as LabStatus;
  } catch {
    return null;
  }
}
