'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { BRAND, BUILDER_LINK, NAV, ROOT_NAV, ROOT_NAV_CTA } from '@/content/shared';

export function Header() {
  const pathname = usePathname();
  const isRoot = pathname === '/';

  const links = isRoot ? ROOT_NAV : NAV;

  return (
    <header className={`site-header ${isRoot ? 'site-header-root' : ''}`}>
      <div className="site-header-inner">
        <Link href="/" className="brand" aria-label="Quantiviq home">
          <span className="brand-mark" aria-hidden />
          <span className="brand-word">{BRAND.wordmark}</span>
        </Link>
        <nav className="nav" aria-label={isRoot ? 'Primary — Quantiviq' : 'Primary — Builder profile'}>
          {links.map((item) => {
            const href = item.href as string;
            const active = href.startsWith('#')
              ? false
              : href === '/'
                ? pathname === '/'
                : pathname === href || pathname?.startsWith(`${href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? 'active' : ''}
              >
                {item.label}
              </Link>
            );
          })}
          <Link href={BUILDER_LINK.href} className="nav-builder">
            {BUILDER_LINK.label}
          </Link>
        </nav>
        {isRoot && (
          <Link href={ROOT_NAV_CTA.href} className="btn btn-primary nav-cta">
            {ROOT_NAV_CTA.label}
          </Link>
        )}
      </div>
    </header>
  );
}
