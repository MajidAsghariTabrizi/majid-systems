import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';

/**
 * GET /api/lab/status — read-only freshness/provenance for the lab artifact.
 *
 * Reads the committed manifest (public/lab/manifest.json) and returns its
 * timestamps, hash and counts plus a server-computed age. There is NO call
 * to any private system: the endpoint is a same-origin static read, safe to
 * cache lightly and impossible to abuse as a proxy.
 */

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const p = path.join(process.cwd(), 'public', 'lab', 'manifest.json');
    const raw = await readFile(p, 'utf8');
    const m = JSON.parse(raw) as {
      generated_at: string;
      sanitized_at: string;
      artifact_sha256: string;
      counts?: Record<string, number>;
      window_days?: number;
      artifact?: string;
    };
    const ageMs = Date.now() - Date.parse(m.generated_at);
    return NextResponse.json(
      {
        artifact: m.artifact ?? 'quantiviq-lab-snapshot',
        generated_at: m.generated_at,
        sanitized_at: m.sanitized_at,
        age_hours: Number.isFinite(ageMs) ? Math.max(0, ageMs / 3_600_000) : null,
        artifact_sha256: m.artifact_sha256,
        counts: m.counts,
        window_days: m.window_days,
      },
      // no-store: the age field must be recomputed per request — a cached
      // response could understate snapshot age.
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return NextResponse.json({ error: 'lab manifest unavailable' }, { status: 503 });
  }
}
