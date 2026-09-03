import Link from 'next/link';
import type { Metadata } from 'next';

import { SITE } from '@/content/shared';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'How to reach Majid Asghari — GitHub, LinkedIn, and direct channels.',
  alternates: { canonical: `${SITE.canonicalUrl}/contact` },
};

export default function ContactPage() {
  return (
    <>
      <section style={{ paddingTop: '4.5rem', borderTop: 0 }}>
        <div className="container">
          <span className="eyebrow">Contact</span>
          <h1>If any of this overlaps with what you are building.</h1>
          <p style={{ maxWidth: '60ch', fontSize: '1.08rem', color: 'var(--fg-muted)' }}>
            I am most useful when product, systems, and AI engineering meet a real
            constraint. The fastest way to reach me is via the public channels below.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: '1rem' }}>
        <div className="container">
          <div className="contact-grid">
            <a
              href={SITE.githubUrl}
              className="contact-card"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="label">GitHub</span>
              <span className="value">{SITE.githubUser}</span>
              <span className="label" style={{ color: 'var(--fg-muted)' }}>
                Open source · code · issues
              </span>
            </a>
            <a
              href={SITE.linkedinUrl}
              className="contact-card"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="label">LinkedIn</span>
              <span className="value">/in/majid-asghari</span>
              <span className="label" style={{ color: 'var(--fg-muted)' }}>
                Profile · experience
              </span>
            </a>
            <div className="contact-card">
              <span className="label">Domain</span>
              <span className="value">{SITE.domain}</span>
              <span className="label" style={{ color: 'var(--fg-muted)' }}>
                This site
              </span>
            </div>
          </div>

          <p style={{ marginTop: '3rem', maxWidth: '60ch' }}>
            For sensitive or commercial conversations, LinkedIn is usually the fastest
            path. For anything code-related, please open an issue on the relevant
            repository — public, traceable, and benefits others.
          </p>

          <p style={{ marginTop: '1.5rem' }}>
            <Link href="/work">← Back to selected work</Link>
          </p>
        </div>
      </section>
    </>
  );
}