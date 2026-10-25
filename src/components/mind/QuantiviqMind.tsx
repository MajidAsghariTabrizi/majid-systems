'use client';

import dynamic from 'next/dynamic';
import { MIND_STRINGS } from './strings';

/** Mounted once per layout; the launcher itself is inert until clicked. */
const QuantiviqMindLauncher = dynamic(
  () => import('./QuantiviqMindLauncher').then((m) => m.QuantiviqMindLauncher),
  { ssr: false }
);

export function QuantiviqMind({ locale }: { locale: 'en' | 'fa' }) {
  return <QuantiviqMindLauncher locale={locale} s={MIND_STRINGS[locale]} />;
}
