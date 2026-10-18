import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

import { NextResponse, type NextRequest } from 'next/server';

import { ipHash, validateLead } from '@/lib/lead/validate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET — health probe: is the lead sink writable? */
export async function GET() {
  try {
    const dir = process.env.QV_LEAD_DATA || path.join(process.cwd(), '.data');
    fs.mkdirSync(dir, { recursive: true });
    fs.accessSync(dir, fs.constants.W_OK);
    return NextResponse.json({ ok: true, storage: 'writable', notify: process.env.LEAD_NOTIFY_EMAIL ? 'configured' : 'pending_config' });
  } catch {
    return NextResponse.json({ ok: true, storage: 'error', notify: 'pending_config' });
  }
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

function clientIp(req: NextRequest): string {
  const xf = req.headers.get('x-forwarded-for');
  return xf ? xf.split(',')[0].trim() : req.headers.get('x-real-ip') ?? '0.0.0.0';
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

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, errors: { form: 'invalid_json' } }, { status: 400 });
  }

  const ipKey = ipHash(clientIp(req));
  if (rateLimited(ipKey)) {
    return NextResponse.json({ ok: false, errors: { form: 'rate_limited' } }, { status: 429 });
  }

  const honeypot = typeof (body as Record<string, unknown>)?.company_site === 'string'
    ? ((body as Record<string, unknown>).company_site as string).trim()
    : '';
  if (honeypot !== '') {
    // Bot filled the hidden field — pretend success, store nothing.
    return NextResponse.json({ ok: true, id: 'QV-ignored' }, { status: 202 });
  }

  const parsed = validateLead(body);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, errors: parsed.errors }, { status: 400 });
  }

  const id = `QV-${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`;
  const record = {
    id,
    createdAt: new Date().toISOString(),
    locale: typeof (body as Record<string, unknown>).locale === 'string' ? (body as Record<string, unknown>).locale : 'en',
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
    notify: process.env.LEAD_NOTIFY_EMAIL ? 'queued' : 'pending_config',
  };

  // Durable acceptance: append one JSON line. Only after THIS succeeds do we
  // claim success — everything else is retried or reported honestly.
  try {
    const dir = process.env.QV_LEAD_DATA || path.join(process.cwd(), '.data');
    fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(path.join(dir, 'leads.jsonl'), JSON.stringify(record) + '\n', { encoding: 'utf8' });
  } catch {
    return NextResponse.json({ ok: false, errors: { form: 'storage_failed' } }, { status: 500 });
  }

  // Owner notification: queued for a configured transport; until SMTP/CRM env
  // exists the record is durably stored and marked pending_config (visible in
  // operations, retried manually — never reported as a lost lead).
  return NextResponse.json({ ok: true, id }, { status: 200 });
}
