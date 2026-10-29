'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { BRAND, NAV } from '@/content/shared';
import { dict, localePath, type Locale } from '@/content/i18n';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';

type NavItem = { label: string; href: string; sharedEn?: boolean };
type NavGroup = { key: string; label: string; href?: string; items?: NavItem[] };

/**
 * SiteHeader (2026-10-29 redesign)
 *
 * Desktop: brand + five primary entries (Approach, Services, Evidence,
 * Insights, About) + locale control + ONE CTA. Groups with items open
 * accessible dropdown menus; plain groups link directly. Keyboard:
 * Enter/Space/ArrowDown open, ArrowUp/Down move, Escape closes and
 * restores focus, click-outside closes. Current page is marked with
 * aria-current and reflected on the owning group.
 *
 * Mobile (<1024px): a dialog sheet (role=dialog, aria-modal) opened from a
 * labeled Menu button - grouped destinations, visible close, focus
 * containment, Escape, focus return. No hidden horizontal strip.
 */
export function Header({ locale }: { locale?: Locale }) {
  const pathname = usePathname();
  const t = dict(locale ?? 'en');
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const lp = (p: string) => (locale ? localePath(locale, p) : p);
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname?.startsWith(href + '/');

  const groups: NavGroup[] = locale
    ? [
        {
          key: 'approach',
          label: t.nav2.approach,
          items: [
            { label: t.nav.system, href: lp('/system') },
            { label: t.nav.method, href: lp('/method') },
            { label: t.nav.explore, href: lp('/explore') },
          ],
        },
        { key: 'services', label: t.nav.services, href: lp('/services') },
        {
          key: 'evidence',
          label: t.nav2.evidence,
          items: [
            { label: t.nav.proof, href: lp('/proof') },
            { label: t.nav.lab, href: lp('/lab') },
            { label: t.nav2.work, href: '/work', sharedEn: true },
          ],
        },
        {
          key: 'insights',
          label: t.nav.insights,
          items: [
            { label: t.nav.insights, href: lp('/insights') },
            { label: t.nav2.library, href: lp('/insights/books') },
            { label: t.nav2.stack, href: '/insights/enterprise-ai-stack', sharedEn: true },
          ],
        },
        {
          key: 'about',
          label: t.nav.about,
          items: [
            { label: t.nav.about, href: lp('/about') },
            { label: t.nav.leadership, href: lp('/leadership') },
            { label: t.nav.mind, href: lp('/mind') },
            { label: t.nav.journey, href: '/journey', sharedEn: true },
          ],
        },
      ]
    : [
        { key: 'work', label: 'Work', href: '/work' },
        { key: 'notes', label: 'Notes', href: '/notes' },
        { key: 'engineering', label: 'Engineering', href: '/engineering' },
        {
          key: 'builder',
          label: 'Profile',
          items: NAV.filter((n) =>
            ['/profile', '/journey', '/resume', '/open-source'].some((p) => n.href === p)
          ).map((n) => ({ label: n.label, href: n.href })),
        },
      ];

  const groupActive = (g: NavGroup) =>
    g.href ? isActive(g.href) : (g.items ?? []).some((it) => isActive(it.href));

  useEffect(() => {
    if (!openKey) return;
    const onDoc = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setOpenKey(null);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [openKey]);

  useEffect(() => {
    if (!mobileOpen) return;
    document.documentElement.classList.add('sheet-open');
    const prevFocused = document.activeElement as HTMLElement | null;
    sheetRef.current?.querySelector<HTMLElement>('a, button')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMobileOpen(false); return; }
      if (e.key !== 'Tab' || !sheetRef.current) return;
      const f = [...sheetRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')].filter((x) => x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.classList.remove('sheet-open');
      document.removeEventListener('keydown', onKey);
      (prevFocused ?? menuBtnRef.current)?.focus();
    };
  }, [mobileOpen]);

  const openMenu = (key: string) => {
    setOpenKey(key);
    requestAnimationFrame(() => {
      const menu = barRef.current?.querySelector('[data-menu="' + key + '"]');
      (menu?.querySelector('a') as HTMLElement | null)?.focus();
    });
  };

  const onGroupKey = (e: React.KeyboardEvent, g: NavGroup) => {
    if (!g.items) return;
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openMenu(g.key); }
    else if (e.key === 'Escape' && openKey === g.key) setOpenKey(null);
  };

  const onMenuKey = (e: React.KeyboardEvent, key: string) => {
    const menu = e.currentTarget as HTMLElement;
    const items = [...menu.querySelectorAll<HTMLElement>('a')];
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length]?.focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length]?.focus(); }
    else if (e.key === 'Escape') {
      setOpenKey(null);
      const grp = barRef.current?.querySelector('[data-group="' + key + '"]');
      (grp?.querySelector('button') as HTMLElement | null)?.focus();
    } else if (e.key === 'Tab') setOpenKey(null);
  };

  const closeAll = () => { setOpenKey(null); setMobileOpen(false); };

  return (
    <header className={`site-header ${locale ? 'site-header-locale' : 'site-header-root'}`}>
      <div className="site-header-inner" ref={barRef}>
        <Link href={locale ? localePath(locale) : '/'} className="brand" aria-label="Quantiviq home">
          <span className="brand-mark" aria-hidden />
          <span className="brand-word">{BRAND.wordmark}</span>
        </Link>

        <nav className="nv-bar" aria-label={locale ? 'Primary - Quantiviq' : 'Primary - builder'}>
          {groups.map((g) =>
            g.items ? (
              <div key={g.key} className="nv-group" data-group={g.key}>
                <button
                  type="button"
                  className={'nv-btn' + (groupActive(g) ? ' is-here' : '') + (openKey === g.key ? ' is-open' : '')}
                  aria-expanded={openKey === g.key}
                  aria-haspopup="true"
                  onClick={() => (openKey === g.key ? setOpenKey(null) : openMenu(g.key))}
                  onKeyDown={(e) => onGroupKey(e, g)}
                >
                  {g.label}
                  <span className="nv-caret" aria-hidden>&#9662;</span>
                </button>
                {openKey === g.key && (
                  <div className="nv-menu" data-menu={g.key} role="menu" onKeyDown={(e) => onMenuKey(e, g.key)}>
                    {g.items.map((it) => (
                      <Link
                        key={it.href}
                        href={it.href}
                        role="menuitem"
                        className={'nv-item' + (isActive(it.href) ? ' is-here' : '')}
                        aria-current={isActive(it.href) ? 'page' : undefined}
                      >
                        <span>{it.label}</span>
                        {it.sharedEn ? <em className="nv-en" aria-label="English content">EN</em> : null}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link key={g.key} href={g.href as string} className={'nv-link' + (groupActive(g) ? ' is-here' : '')} aria-current={groupActive(g) ? 'page' : undefined}>
                {g.label}
              </Link>
            )
          )}
        </nav>

        <div className="site-header-actions">
          <LocaleSwitcher />
          <Link href={locale ? localePath(locale, '/contact') : '/en/contact'} className="btn btn-primary nav-cta">
            {t.nav2.start}
          </Link>
          <button ref={menuBtnRef} type="button" className="nv-burger" aria-expanded={mobileOpen} aria-haspopup="dialog" onClick={() => setMobileOpen((v) => !v)}>
            <span className="nv-burger-label">{t.nav2.menu}</span>
            <span className="nv-burger-icon" aria-hidden />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div ref={sheetRef} className="nv-sheet" role="dialog" aria-modal="true" aria-label={t.nav2.menu}>
          <div className="nv-sheet-head">
            <span className="nv-sheet-title">{t.nav2.menu}</span>
            <button type="button" className="nv-sheet-close" onClick={closeAll}>{t.nav2.close}</button>
          </div>
          <div className="nv-sheet-body">
            {groups.map((g) => (
              <section key={g.key} className="nv-sheet-group">
                {g.href ? (
                  <Link href={g.href} className={'nv-sheet-link' + (groupActive(g) ? ' is-here' : '')} onClick={closeAll}>{g.label}</Link>
                ) : (
                  <>
                    <h3 className="nv-sheet-h">{g.label}</h3>
                    <ul>
                      {(g.items ?? []).map((it) => (
                        <li key={it.href}>
                          <Link href={it.href} className={'nv-sheet-item' + (isActive(it.href) ? ' is-here' : '')} aria-current={isActive(it.href) ? 'page' : undefined} onClick={closeAll}>
                            {it.label}
                            {it.sharedEn ? <em className="nv-en" aria-label="English content">EN</em> : null}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </section>
            ))}
            <Link href={locale ? localePath(locale, '/contact') : '/en/contact'} className="btn btn-primary nv-sheet-cta" onClick={closeAll}>
              {t.nav2.start}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
