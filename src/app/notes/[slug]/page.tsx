import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

import { NOTES, NOTE_BY_SLUG } from '@/content/notes';
import { PROJECT_BY_SLUG } from '@/content/projects';
import { NoteJsonLd } from '@/components/JsonLd';
import { SITE } from '@/content/shared';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return NOTES.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const note = NOTE_BY_SLUG[slug];
  if (!note) return { title: 'Note not found' };
  return {
    title: note.title,
    description: note.lede,
    alternates: { canonical: `${SITE.canonicalUrl}/notes/${slug}` },
    openGraph: {
      title: note.title,
      description: note.lede,
      url: `${SITE.canonicalUrl}/notes/${slug}`,
      type: 'article',
    },
  };
}

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const note = NOTE_BY_SLUG[slug];
  if (!note) notFound();

  const related = (note.relatedProjects ?? [])
    .map((s) => PROJECT_BY_SLUG[s])
    .filter(Boolean);

  return (
    <article className="note-detail">
      <NoteJsonLd note={note} />
      <header>
        <div className="container">
          <span className="eyebrow">
            Note {note.number} · {note.category}
          </span>
          <h1>{note.title}</h1>
          <p className="lede" style={{ fontSize: '1.15rem', color: 'var(--fg-muted)', maxWidth: '60ch' }}>
            {note.lede}
          </p>
        </div>
      </header>

      <section style={{ paddingTop: '1.5rem' }}>
        <div className="container">
          <div className="note-body">
            {note.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {related.length > 0 ? (
            <aside style={{ marginTop: '3rem' }}>
              <h4>From the projects</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.5rem' }}>
                {related.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/work/${p.slug}`}>
                      {p.name} — {p.oneLiner}
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}

          <p style={{ marginTop: '3rem' }}>
            <Link href="/notes">← All notes</Link>
          </p>
        </div>
      </section>
    </article>
  );
}