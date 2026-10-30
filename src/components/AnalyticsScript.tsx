'use client';

/** First-party Umami loader. The tracker script is served same-origin from
 *  /_q/script.js (nginx -> authenticated tunnel -> Umami on the analytics
 *  host), so its collection endpoint resolves to /_q/api/send automatically.
 *  next/script afterInteractive keeps it fully non-blocking, and a tracker
 *  outage can never affect rendering (fail-open by construction). */
import Script from 'next/script';
import { qEvent, oncePerSession } from '@/lib/analytics';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

export function AnalyticsScript({ page }: { page?: 'site' | 'exec' }) {
  const pathname = usePathname();

  // contact CTA clicks (event delegation, deduped) — every anchor whose
  // destination is a contact route counts as one intentional contact_click
  useEffect(() => {
    if (!WEBSITE_ID || page !== 'site') return;
    let last = 0;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.('a[href]');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (!/\/(?:en|fa)?\/?(contact)(\?|#|$)/.test(href)) return;
      const now = Date.now();
      if (now - last < 30_000) return;
      last = now;
      qEvent('contact_click', { source: (pathname || '/').slice(0, 40) });
    };
    document.addEventListener('click', onClick, { passive: true });
    return () => document.removeEventListener('click', onClick);
  }, [pathname, page]);

  if (!WEBSITE_ID) return null; // no build-time id -> instrumentation inert
  return (
    <Script
      id="q-umami"
      strategy="afterInteractive"
      src="/_q/script.js"
      data-website-id={WEBSITE_ID}
      data-domains="quantiviq.xyz"
      data-tag="q"
    />
  );
}