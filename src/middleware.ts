import { NextResponse, type NextRequest } from 'next/server';

import { SITE } from '@/content/shared';

/**
 * Locale routing rules (EN default, NO auto-detection):
 * - `/`            → 307 to /en (or /fa if the visitor explicitly chose FA before)
 * - `/en/...|/fa/...` → served; a qv_locale cookie remembers the last explicit locale
 * - legacy moved pages (/about, /contact, ...) → 308 to their /en equivalents
 * - shared deep pages (/journey, /profile, /work, ...) and /api → untouched
 */

const LOCALES = new Set(['en', 'fa']);
const LOCALE_COOKIE = 'qv_locale';
const YEAR = 60 * 60 * 24 * 365;

/** Legacy root pages that moved under /en (permanent). */
const LEGACY: Record<string, string> = {
  '/about': '/en/about',
  '/contact': '/en/contact',
  '/services': '/en/services',
  '/method': '/en/method',
  '/system': '/en/system',
  '/lab': '/en/lab',
  '/proof': '/en/proof',
  '/privacy': '/en/privacy',
};

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Redirects MUST use the canonical public origin. Behind nginx, Next 14.2
  // `next start` ignores the forwarded Host header when it absolutizes
  // middleware redirect targets: `new URL(req.url)` inherits the server's
  // INTERNAL bind origin (`next start -H 127.0.0.1` advertises
  // `localhost:3000`), which leaked to the public as
  // https://localhost:3000/... (ERR_CONNECTION_REFUSED). Next's middleware
  // runtime rejects relative Location headers (Invalid URL), so the redirect
  // target is built explicitly from the canonical public origin instead.
  // (Development keeps req.url so local dev stays local.)
  const base =
    process.env.NODE_ENV === 'production' ? SITE.canonicalUrl : new URL(req.url).origin;

  function redirectTo(path: string, status: 307 | 308): NextResponse {
    return NextResponse.redirect(new URL(path + search, base), status);
  }

  // trailing slash → canonical single slash
  if (pathname !== '/' && pathname.endsWith('/')) {
    return redirectTo(pathname.replace(/\/+$/, ''), 308);
  }

  const seg = pathname.split('/')[1] ?? '';

  if (LOCALES.has(seg)) {
    const res = NextResponse.next();
    // A direct visit to an explicit locale URL IS an explicit choice — remember it
    // so the root gateway can honor it later. URLs always take precedence anyway.
    res.cookies.set(LOCALE_COOKIE, seg, {
      path: '/',
      maxAge: YEAR,
      sameSite: 'lax',
    });
    return res;
  }

  if (pathname === '/') {
    // English default. The ONLY input besides the URL is the explicit cookie —
    // never Accept-Language, never IP/geolocation.
    const remembered = req.cookies.get(LOCALE_COOKIE)?.value;
    const locale = remembered === 'fa' ? 'fa' : 'en';
    return redirectTo(`/${locale}`, 307);
  }

  const legacy = LEGACY[pathname];
  if (legacy) {
    // e.g. /contact?intent=diagnostic → /en/contact?intent=diagnostic
    return redirectTo(legacy, 308);
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next internals and any file with an extension (assets, images, icons).
  matcher: ['/((?!_next/static|_next/image|.*\\..*).*)'],
};
