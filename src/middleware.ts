import { NextResponse, type NextRequest } from 'next/server';

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
  '/proof': '/en/proof',
  '/privacy': '/en/privacy',
};

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // trailing slash → canonical single slash
  if (pathname !== '/' && pathname.endsWith('/')) {
    const u = new URL(req.url);
    u.pathname = pathname.replace(/\/+$/, '');
    return NextResponse.redirect(u, 308);
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
    const u = new URL(req.url); // preserve the exact request origin (avoid host aliasing)
    u.pathname = `/${locale}`;
    u.search = search;
    return NextResponse.redirect(u, 307);
  }

  const legacy = LEGACY[pathname];
  if (legacy) {
    const u = new URL(req.url);
    u.pathname = legacy;
    u.search = search; // e.g. /contact?intent=diagnostic → /en/contact?intent=diagnostic
    return NextResponse.redirect(u, 308);
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next internals and any file with an extension (assets, images, icons).
  matcher: ['/((?!_next/static|_next/image|.*\\..*).*)'],
};
