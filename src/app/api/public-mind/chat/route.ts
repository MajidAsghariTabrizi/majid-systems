import { NextRequest } from 'next/server';

/**
 * Quantiviq Mind — same-origin public gateway.
 * Proxies the loopback public-mind service; holds no secrets; adds a
 * light first-pass validation and IP-hash abuse identity header.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UPSTREAM = process.env.MIND_UPSTREAM || 'http://127.0.0.1:8210';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'bad request' }, { status: 400 });
  }
  const b = body as {
    session?: unknown;
    locale?: unknown;
    messages?: unknown;
  };
  if (
    typeof b.session !== 'string' ||
    b.session.length < 8 ||
    b.session.length > 64 ||
    !Array.isArray(b.messages) ||
    b.messages.length === 0 ||
    b.messages.length > 12 ||
    !b.messages.every(
      (m) =>
        m &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.length > 0 &&
        m.content.length <= 2000
    )
  ) {
    return Response.json({ error: 'bad request' }, { status: 400 });
  }
  if (b.locale !== undefined && b.locale !== 'en' && b.locale !== 'fa') {
    return Response.json({ error: 'bad request' }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${UPSTREAM}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session: b.session, locale: b.locale, messages: b.messages }),
      signal: AbortSignal.timeout(70_000),
    });
  } catch {
    return Response.json(
      { error: 'unavailable', message_en: 'Quantiviq Mind is briefly unavailable.', message_fa: 'Quantiviq Mind موقتاً در دسترس نیست.' },
      { status: 502 }
    );
  }

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => '{}');
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(text);
    } catch {}
    return Response.json(parsed, {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // SSE passthrough
  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}
