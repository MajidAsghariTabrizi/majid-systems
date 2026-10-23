'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { BRAND, NAV } from '@/content/shared';
import { dict, localePath, type Locale } from '@/content/i18n';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';

/**
 * Global header. Two modes:
 * - locale mode (locale prop): commercial nav from the dictionary —
 *   Services · System · Method · Proof · About + contact CTA + switcher.
 * - shared mode (no prop): builder nav for the deep English content tree
 *   (journey/profile/work/notes) + switcher back into /en /fa.
 * The switcher is rendered OUTSIDE the collapsible nav so it stays visible
 * on mobile at all times.
 */
export function Header({ locale }: { locale?: Locale }) {
  const pathname = usePathname();
  const t = dict(locale ?? 'en');

  const links = locale
    ? [
        { label: t.nav.services, href: localePath(locale, '/services') },
        { label: t.nav.system, href: localePath(locale, '/system') },
        { label: t.nav.lab, href: localePath(locale, '/lab') },
        { label: t.nav.method, href: localePath(locale, '/method') },
        { label: t.nav.proof, href: localePath(locale, '/proof') },
        { label: t.nav.leadership, href: localePath(locale, '/leadership') },
        { label: t.nav.about, href: localePath(locale, '/about') },
      ]
    : NAV.filter((n) => n.href !== '/journey');

  const isActive = (href: string) =>
    href.startsWith('#')
      ? false
      : href === '/'
        ? pathname === '/'
        : pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <header className={`site-header ${locale ? 'site-header-locale' : 'site-header-root'}`}>
      <div className="site-header-inner">
        <Link href={locale ? localePath(locale) : '/'} className="brand" aria-label="Quantiviq home">
          <span className="brand-mark" aria-hidden />
          <span className="brand-word">{BRAND.wordmark}</span>
        </Link>
        <nav className="nav" aria-label={locale ? `Primary — Quantiviq (${locale})` : 'Primary — builder'}>
          {links.map((item) => (
            <Link key={item.href} href={item.href} className={isActive(item.href as string) ? 'active' : ''}>
              {item.label}
            </Link>
          ))}
          {!locale && (
            <Link href="/profile" className="nav-builder">
              Builder Profile
            </Link>
          )}
        </nav>
        <div className="site-header-actions">
          <LocaleSwitcher />
          {locale ? (
            <Link href={localePath(locale, '/contact')} className="btn btn-primary nav-cta">
              {t.nav.cta}
            </Link>
          ) : (
            <Link href="/en" className="btn btn-primary nav-cta">
              Quantiviq →
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
