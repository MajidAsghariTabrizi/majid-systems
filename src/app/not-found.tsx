import Link from 'next/link';
import { SITE } from '@/content/shared';

export default function NotFound() {
  return (
    <div
      style={{
        padding: '10rem 1.5rem 4rem',
        textAlign: 'center',
        maxWidth: '480px',
        margin: '0 auto',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.78rem',
          color: 'var(--fg-subtle)',
          letterSpacing: '0.04em',
        }}
      >
        404
      </span>
      <h1 style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>Page not found.</h1>
      <p style={{ color: 'var(--fg-muted)' }}>
        This page does not exist. The portfolio has a clear structure — start from the
        work index or the home page.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
        <Link href="/" className="btn btn-primary">
          Home
        </Link>
        <Link href="/work" className="btn">
          Work
        </Link>
      </div>
      <p style={{ marginTop: '3rem', fontSize: '0.85rem', color: 'var(--fg-subtle)' }}>
        {SITE.domain}
      </p>
    </div>
  );
}