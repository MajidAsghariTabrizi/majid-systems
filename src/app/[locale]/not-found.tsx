'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LocaleNotFound() {
  const fa = usePathname()?.split('/')[1] === 'fa';
  return (
    <section className="q-hero" style={{ minHeight: '60vh' }}>
      <div className="container-narrow" style={{ textAlign: 'center' }}>
        <span className="eyebrow sig">404</span>
        <h1 className="q-display">{fa ? 'این صفحه پیدا نشد.' : 'Not found.'}</h1>
        <p className="q-hero-body">{fa ? 'ممکن است نشانی تغییر کرده باشد یا صفحه دیگر در دسترس نباشد.' : 'The page you are looking for does not exist — or has moved.'}</p>
        <div className="hero-actions" style={{ justifyContent: 'center' }}>
          <Link href={fa ? '/fa' : '/en'} className="btn btn-primary">{fa ? 'بازگشت به صفحه اصلی ←' : 'English home →'}</Link>
          <Link href={fa ? '/fa/solutions' : '/en/solutions'} className="btn">{fa ? 'بررسی راهکارها' : 'Explore solutions'}</Link>
        </div>
      </div>
    </section>
  );
}
