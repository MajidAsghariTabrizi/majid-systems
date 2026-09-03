import Link from 'next/link';

import { SITE } from '@/content/shared';

export function Footer() {
  const year = new Date().getUTCFullYear();
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <div style={{ color: 'var(--fg)', fontWeight: 500 }}>{SITE.name}</div>
          <div style={{ marginTop: '0.3rem' }}>
            {SITE.tagline} · {SITE.location}
          </div>
        </div>
        <ul>
          <li>
            <Link href="/work">Work</Link>
          </li>
          <li>
            <Link href="/notes">Notes</Link>
          </li>
          <li>
            <Link href="/about">About</Link>
          </li>
          <li>
            <Link href="/contact">Contact</Link>
          </li>
          <li>
            <a href={SITE.githubUrl} rel="me noopener" target="_blank">
              GitHub
            </a>
          </li>
          <li>
            <a href={SITE.linkedinUrl} rel="me noopener" target="_blank">
              LinkedIn
            </a>
          </li>
        </ul>
        <div>© {year} · {SITE.domain}</div>
      </div>
    </footer>
  );
}