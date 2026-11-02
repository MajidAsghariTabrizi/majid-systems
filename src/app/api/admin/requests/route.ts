import { timingSafeEqual } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';

import { listLeads, updateLead, type LeadPipelineStatus } from '@/lib/lead/store';
import { outboxPending, smtpConfigured } from '@/lib/lead/notify';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Admin requests API — INTERIM AUTH (documented in docs/commercial/04):
 * Google OAuth + ADMIN_EMAILS allowlist is the PRD target but requires owner
 * credentials that do not exist yet (BLOCKED). Until then access requires the
 * QV_ADMIN_TOKEN server secret, compared in constant time. No token => 401.
 */
function authorized(req: NextRequest): boolean {
  const expected = process.env.QV_ADMIN_TOKEN;
  if (!expected || expected.length < 16) return false; // unconfigured = closed
  const got = req.headers.get('x-admin-token') ?? '';
  const a = Buffer.from(got);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

const STATUSES: LeadPipelineStatus[] = ['new', 'contacted', 'discovery', 'proposal_sent', 'won', 'lost'];

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const leads = listLeads().filter((l) => l.status !== 'deleted');
  return NextResponse.json({
    ok: true,
    summary: {
      total: leads.length,
      byStatus: Object.fromEntries(STATUSES.map((s) => [s, leads.filter((l) => (l.pipeline?.status ?? 'new') === s).length])),
      notify: {
        channel: smtpConfigured() ? 'smtp' : 'outbox',
        outboxPending: outboxPending(),
        pendingRecords: leads.filter((l) => l.notify === 'pending').length,
        failed: leads.filter((l) => l.notify === 'notify_failed').length,
      },
    },
    // PII stays server-side; the console needs contact fields to act on leads —
    // served only over the token gate, never to guests or crawlers.
    requests: [...leads].reverse().map((l) => ({
      id: l.id,
      createdAt: l.createdAt,
      locale: l.locale,
      intent: l.intent,
      solution: l.solution ?? null,
      source: l.source ?? null,
      name: l.fields.name,
      email: l.fields.email,
      phone: l.phone ?? null,
      org: l.fields.org,
      message: l.fields.message,
      notify: l.notify,
      pipeline: l.pipeline?.status ?? 'new',
    })),
  });
}

export async function PATCH(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  let body: { id?: string; status?: string };
  try {
    body = JSON.parse(await req.text()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }
  if (!body.id || !body.status || !STATUSES.includes(body.status as LeadPipelineStatus)) {
    return NextResponse.json({ ok: false, error: 'invalid_input' }, { status: 400 });
  }
  const ok = updateLead(body.id, {
    pipeline: { status: body.status as LeadPipelineStatus, updatedAt: new Date().toISOString(), actor: 'owner' },
  });
  return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
}
