'use client';

import { usePathname, useRouter } from 'next/navigation';

import { dict, type Locale } from '@/content/i18n';

/**
 * LocaleSwitcher — the two-option segmented tab [ English | فارسی ].
 * Always visible in the global header on desktop AND mobile (never inside
 * a hamburger). Swaps the locale segment of the current path, preserving
 * the deep route and query; on shared (non-locale) pages it links to the
 * locale home. Sets the qv_locale cookie so / honors the explicit choice.
 */
export function LocaleSwitcher({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname() ?? '/';
  const router = useRouter();

  const current: Locale | null = pathname.startsWith('/fa/')
    ? 'fa'
    : pathname.startsWith('/en/')
      ? 'en'
      : pathname === '/fa'
        ? 'fa'
        : pathname === '/en'
          ? 'en'
          : null;

  const go = (to: Locale) => {
    document.cookie = `qv_locale=${to};path=/;max-age=31536000;samesite=lax`;
    const nextPath =
      current !== null
        ? pathname.replace(/^\/(en|fa)(?=\/|$)/, `/${to}`)
        : `/${to}`;
    const qs = typeof window !== 'undefined' ? window.location.search : '';
    router.push(nextPath + qs);
  };

  const t = dict(current ?? 'en').switcher;

  return (
    <div className={`lang-tabs${compact ? ' lang-tabs-compact' : ''}`} role="group" aria-label={t.label}>
      <button
        type="button"
        className={`lang-tab${current === 'en' ? ' is-on' : ''}`}
        aria-pressed={current === 'en'}
        aria-label={t.en}
        onClick={() => go('en')}
      >
        <span className="lt-full">{t.en}</span>
        <span className="lt-mini" aria-hidden>EN</span>
      </button>
      <button
        type="button"
        className={`lang-tab${current === 'fa' ? ' is-on' : ''}`}
        aria-pressed={current === 'fa'}
        aria-label="فارسی"
        onClick={() => go('fa')}
      >
        <span className="lt-full">فارسی</span>
        <span className="lt-mini" aria-hidden>فا</span>
      </button>
    </div>
  );
}
