'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { NAV, SITE } from '@/content/shared';

export function Header() {
  const pathname = usePathname();
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand" aria-label={`${SITE.name} home`}>
          <span className="brand-mark" aria-hidden />
          <span>{SITE.shortName}</span>
        </Link>
        <nav className="nav" aria-label="Primary">
          {NAV.map((item) => {
            const href = item.href as string;
            const active =
              href === '/'
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
        </nav>
      </div>
    </header>
  );
}