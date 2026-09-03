import type { Metadata } from 'next';

import { CAPABILITIES } from '@/content/capabilities';
import { PRINCIPLES } from '@/content/principles';
import { SITE } from '@/content/shared';

export const metadata: Metadata = {
  title: 'Engineering',
  description:
    'How I think about product, AI, systems, and engineering — applied principles and capability map.',
  alternates: { canonical: `${SITE.canonicalUrl}/engineering` },
};

export default function EngineeringPage() {
  return (
    <>
      <section style={{ paddingTop: '4.5rem', borderTop: 0 }}>
        <div className="container">
          <span className="eyebrow">Engineering + Product</span>
          <h1>How I think.</h1>
          <p style={{ maxWidth: '60ch', fontSize: '1.08rem', color: 'var(--fg-muted)' }}>
            Principles, capability groups, and the engineering thinking that has
            survived contact with production systems. Evidence-based, project-agnostic,
            and deliberately small.
          </p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-header">
            <div>
              <span className="eyebrow">Principles</span>
              <h2>Ten working principles.</h2>
            </div>
          </div>
          <div className="principle-list">
            {PRINCIPLES.map((p, idx) => (
              <div key={p.title} className="principle">
                <span className="principle-num">{String(idx + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container-wide">
          <div className="section-header">
            <div>
              <span className="eyebrow">Capabilities</span>
              <h2>Product → AI → Systems → Engineering.</h2>
            </div>
          </div>
          <div className="cap-grid">
            {CAPABILITIES.map((c) => (
              <div key={c.title} className={`cap-card ${c.category}`}>
                <h3>
                  <span className="cap-icon" aria-hidden />
                  {c.title}
                </h3>
                <p>{c.blurb}</p>
                <ul>
                  {c.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}