'use client';

/** insight_read (taxonomy v1): meaningful article engagement — fires once
 *  per slug/session when the reader reaches >=55% of the article OR dwells
 *  >=25s. Passive observers only; unmount-safe; never blocks rendering. */
import { useEffect } from 'react';
import { qEvent, oncePerSession } from '@/lib/analytics';

export function InsightRead({ slug, locale }: { slug: string; locale: string }) {
  useEffect(() => {
    let fired = false;
    const start = Date.now();
    const fire = () => {
      if (fired) return;
      fired = true;
      window.removeEventListener('scroll', onScroll);
      if (oncePerSession('insight-' + slug)) {
        qEvent('insight_read', { slug: slug.slice(0, 80), locale });
      }
    };
    const onScroll = () => {
      const doc = document.documentElement;
      const pct = (window.scrollY + window.innerHeight) / Math.max(1, doc.scrollHeight);
      if (pct >= 0.55) fire();
    };
    const t = window.setTimeout(fire, 25_000);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('scroll', onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);
  return null;
}