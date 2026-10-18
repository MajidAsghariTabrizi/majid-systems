import crypto from 'node:crypto';

import { NextResponse, type NextRequest } from 'next/server';

import { ipHash, validateLead } from '@/lib/lead/validate';
import { appendLead, storageHealth, type LeadRecord } from '@/lib/lead/store';
import { deliverOwnerNotification, outboxPending, smtpConfigured } from '@/lib/lead/notify';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET — health probe distinguishing storage and notification states:
 *   storage: 'writable' | 'error'
 *   notify:  'smtp' (credentials present) | 'outbox' (durable fallback active)
 *   outboxPending: count of queued-but-undelivered notifications (-1 = unreadable)
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    storage: storageHealth(),
    notify: smtpConfigured() ? 'smtp' : 'outbox',
    outboxPending: outboxPending(),
  });
}

/**
 * Client IP behind our nginx: X-Real-IP is set by the proxy and wins.
 * X-Forwarded-For is parsed from the RIGHT by QV_XFF_DEPTH (default 1 =
 * one trusted proxy tier) — the leftmost entries are client-spoofable and
 * MUST NOT be used for rate limiting.
 */
function clientIp(req: NextRequest): string {
  const real = req.headers.get('x-real-ip');
  if (real && /^[0-9a-fA-F.:]+$/.test(real.trim())) return real.trim();
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const parts = xff.split(',').map((s) => s.trim()).filter(Boolean);
    const depth = Math.max(1, Number(process.env.QV_XFF_DEPTH ?? 1));
    const idx = Math.max(0, parts.length - depth);
    return parts[idx] ?? '0.0.0.0';
  }
  return '0.0.0.0';
}

/** In-memory sliding-window rate limit per IP hash (5/hour). */
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_PER_WINDOW) {
    hits.set(key, arr);
    return true;
  }
  arr.push(now);
  hits.set(key, arr);
  return false;
}

export async function POST(req: NextRequest) {
  // Origin check (CSRF): same-host form posts only.
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) {
        return NextResponse.json({ ok: false, errors: { form: 'forbidden' } }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ ok: false, errors: { form: 'forbidden' } }, { status: 403 });
    }
  }

  // Body size guard (8KB).
  const raw = await req.text();
  if (raw.length > 8192) {
    return NextResponse.json({ ok: false, errors: { form: 'too_large' } }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, errors: { form: 'invalid_json' } }, { status: 400 });
  }

  const ipKey = ipHash(clientIp(req));
  if (rateLimited(ipKey)) {
    return NextResponse.json({ ok: false, errors: { form: 'rate_limited' } }, { status: 429 });
  }

  const honeypot = typeof body?.company_site === 'string' ? body.company_site.trim() : '';
  if (honeypot !== '') {
    // Bot filled the hidden field — pretend success, store nothing.
    return NextResponse.json({ ok: true, id: 'QV-ignored' }, { status: 202 });
  }

  const parsed = validateLead(body);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, errors: parsed.errors }, { status: 400 });
  }

  const id = `QV-${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`;
  const record: LeadRecord = {
    id,
    createdAt: new Date().toISOString(),
    locale: typeof body.locale === 'string' ? body.locale : 'en',
    intent: parsed.value.intent,
    fields: {
      name: parsed.value.name,
      email: parsed.value.email,
      org: parsed.value.org || '',
      website: parsed.value.website || '',
      role: parsed.value.role || '',
      message: parsed.value.message,
      preferred: parsed.value.preferred,
      preferredLink: parsed.value.preferredLink || '',
    },
    ipHash: ipKey,
    status: 'stored',
    notify: 'pending',
  };

  // Notification is attempted BEFORE the single durable append, so the stored
  // line carries the true final state (sent | outbox_queued | notify_failed).
  // If SMTP delivered but storage then fails, the user sees an honest error
  // and may retry — the owner email is harmless; no lead is ever silently lost.
  const notify = await deliverOwnerNotification(record);
  record.notify = notify.delivered
    ? notify.channel === 'smtp'
      ? 'sent'
      : 'outbox_queued'
    : 'notify_failed';

  // Durable acceptance: append one JSON line. THIS is the success condition.
  try {
    appendLead(record);
  } catch {
    return NextResponse.json({ ok: false, errors: { form: 'storage_failed' } }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id }, { status: 200 });
}
