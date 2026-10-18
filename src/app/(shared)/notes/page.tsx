import Link from 'next/link';
import type { Metadata } from 'next';

import { NOTES } from '@/content/notes';
import { SITE } from '@/content/shared';

export const metadata: Metadata = {
  title: 'Field notes',
  description:
    'Lessons, observations, and engineering notes extracted from real production systems.',
  alternates: { canonical: `${SITE.canonicalUrl}/notes` },
};

export default function NotesIndexPage() {
  return (
    <>
      <section style={{ paddingTop: '4.5rem', borderTop: 0 }}>
        <div className="container-wide">
          <span className="eyebrow">Field notes</span>
          <h1>What building taught me.</h1>
          <p style={{ maxWidth: '60ch', fontSize: '1.08rem', color: 'var(--fg-muted)' }}>
            A working collection of insights extracted from the actual projects. Not
            motivational — operational. Each note points at the project evidence behind it.
          </p>
        </div>
      </section>

      <section>
        <div className="container-wide">
          <div className="notes-grid">
            {NOTES.map((n) => (
              <Link key={n.slug} href={`/notes/${n.slug}`} className="note-card">
                <span className="note-num">{n.number}</span>
                <h3>{n.title}</h3>
                <p>{n.lede}</p>
                <span className="note-cat">{n.category}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}