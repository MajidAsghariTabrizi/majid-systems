'use client';

/** Homepage featured-solutions carousel. Accessible: keyboard-operable
 *  buttons, no auto-play, RTL-aware, touch scroll with snap. */
import { useRef } from 'react';
import Link from 'next/link';

import { FLAGSHIPS } from '@/content/solutions';
import type { Locale } from '@/content/i18n';
import { SolutionCard } from './SolutionCard';

export function FeaturedSolutions({ locale }: { locale: Locale }) {
  const l = locale === 'fa' ? 'fa' : 'en';
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const amount = 316 * 2; // two cards
    el.scrollBy({ left: dir * amount * (locale === 'fa' ? -1 : 1), behavior: 'smooth' });
  };

  return (
    <section className="sol-section sol-carousel" aria-label={l === 'fa' ? 'راهکارهای منتخب کوانتی‌ویک' : 'Featured Quantiviq solutions'}>
      <div className="sol-carousel-head">
        <div>
          <h2>{l === 'fa' ? 'از تز تا راهکار: مسائل واقعی کسب‌وکار' : 'From thesis to practice: real operating problems'}</h2>
          <span className="sub">
            {l === 'fa'
              ? 'راهکارهای عملی با تأیید انسانی — نقطه شروع دیجیتال‌سازی هوشمند.'
              : 'Practical AI-enabled engagements with human approvals — where smart digitization starts.'}
          </span>
        </div>
        <div className="sol-carousel-nav">
          <button className="prev" onClick={() => scrollBy(-1)} aria-label={l === 'fa' ? 'قبلی' : 'Previous'}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button className="next" onClick={() => scrollBy(1)} aria-label={l === 'fa' ? 'بعدی' : 'Next'}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
          </button>
        </div>
      </div>
      <div className="sol-track" ref={trackRef} role="group" aria-label={l === 'fa' ? 'کارت‌های راهکار' : 'Solution cards'} tabIndex={0}>
        {FLAGSHIPS.map((s) => (
          <SolutionCard key={s.id} s={s} locale={locale} />
        ))}
      </div>
      <div className="sol-finder-strip">
        <Link href={`/${locale}/solutions`}>{l === 'fa' ? 'همه ۴۰ راهکار و جست‌وجو ←' : 'All 40 solutions & search →'}</Link>
        <span aria-hidden="true">·</span>
        <Link href={`/${locale}/solutions/find`}>{l === 'fa' ? 'راهکار خود را پیدا کنید' : 'Find your solution'}</Link>
      </div>
    </section>
  );
}
