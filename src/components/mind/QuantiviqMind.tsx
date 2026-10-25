'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { MIND_STRINGS } from './strings';

/** Mounted once per layout; the launcher itself is inert until clicked.
 *  Suppressed on the /mind standalone pages, where the full-page experience
 *  replaces it (no duplicate panels). */
const QuantiviqMindLauncher = dynamic(
  () => import('./QuantiviqMindLauncher').then((m) => m.QuantiviqMindLauncher),
  { ssr: false }
);

export function QuantiviqMind({ locale }: { locale: 'en' | 'fa' }) {
  const pathname = usePathname();
  if (pathname && /\/mind\/?$/.test(pathname)) return null;
  return <QuantiviqMindLauncher locale={locale} s={MIND_STRINGS[locale]} />;
}
