import Link from 'next/link';

import { PROJECTS } from '@/content/projects';
import { CAPABILITIES } from '@/content/capabilities';
import { PRINCIPLES } from '@/content/principles';
import { NOTES } from '@/content/notes';
import { SITE } from '@/content/shared';
import { getGitHubData, repoByName } from '@/content/github';
import { HomeJsonLd } from '@/components/JsonLd';

export default async function HomePage() {
  const gh = await getGitHubData();
  const flagship = PROJECTS.filter((p) => p.category === 'flagship');
  const featuredNotes = NOTES.slice(0, 6);
  const phoenixStars = repoByName(gh.repos, 'anti-gravity-phoenix-v4')?.stargazers_count ?? 0;

  return (
    <>
      <HomeJsonLd />

      {/* ============= HERO ============= */}
      <section className="hero" aria-label="Introduction">
        <div className="container-wide">
          <div className="hero-grid">
            <div>
              <span className="hero-eyebrow">
                {SITE.establishedYear} → {new Date().getUTCFullYear()} · {SITE.location}
              </span>
              <h1>{SITE.name}.</h1>
              <p className="lede">
                I build <strong>products</strong> and <strong>intelligent systems</strong> where
                product strategy, engineering, and real-world constraints meet. The portfolio
                below is the public record of that work.
              </p>
              <div className="hero-actions">
                <Link href="/work" className="btn btn-primary">
                  See selected work <span className="arrow" aria-hidden>→</span>
                </Link>
                <a href={SITE.githubUrl} className="btn" target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
                <a
                  href={SITE.linkedinUrl}
                  className="btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              </div>
            </div>
            <div className="hero-stats" aria-label="At a glance">
              <div className="stat">
                <span className="stat-label">Flagship projects</span>
                <span className="stat-value">{flagship.length}</span>
                <span className="stat-sub">production systems</span>
              </div>
              <div className="stat">
                <span className="stat-label">Public repos</span>
                <span className="stat-value">{gh.user?.public_repos ?? 17}</span>
                <span className="stat-sub">on GitHub</span>
              </div>
              <div className="stat">
                <span className="stat-label">Open source</span>
                <span className="stat-value">MIT</span>
                <span className="stat-sub">router + UEA</span>
              </div>
              <div className="stat">
                <span className="stat-label">Phoenix</span>
                <span className="stat-value">{phoenixStars} ★</span>
                <span className="stat-sub">fail-closed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============= SELECTED WORK ============= */}
      <section aria-label="Selected work">
        <div className="container-wide">
          <div className="section-header">
            <div>
              <span className="eyebrow">01 / Selected work</span>
              <h2>Production systems, not side projects.</h2>
            </div>
            <span className="section-num">
              {flagship.length} flagship · {PROJECTS.length} total
            </span>
          </div>

          <div className="project-grid">
            {flagship.map((p) => (
              <Link key={p.slug} href={`/work/${p.slug}`} className="project-card">
                <span className="card-status">{p.statusLabel}</span>
                <div>
                  <h3>{p.name}</h3>
                  <p className="card-thesis">{p.oneLiner}</p>
                </div>
                <div className="card-tags">
                  {p.languages.slice(0, 5).map((l) => (
                    <span key={l} className="tag">
                      {l}
                    </span>
                  ))}
                </div>
                <div className="card-cta">
                  <span>Read case study</span>
                  <span aria-hidden>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============= ENGINEERING THINKING ============= */}
      <section aria-label="Engineering thinking">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="eyebrow">02 / Engineering thinking</span>
              <h2>How I think about systems.</h2>
            </div>
          </div>
          <div className="principle-list">
            {PRINCIPLES.slice(0, 6).map((p, idx) => (
              <div key={p.title} className="principle">
                <span className="principle-num">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============= CAPABILITIES ============= */}
      <section aria-label="Capabilities">
        <div className="container-wide">
          <div className="section-header">
            <div>
              <span className="eyebrow">03 / Capabilities</span>
              <h2>Product, AI, systems, engineering — applied.</h2>
            </div>
            <Link href="/engineering" className="section-num">
              Full breakdown →
            </Link>
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
                  {c.items.slice(0, 5).map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============= NOTES ============= */}
      <section aria-label="Notes">
        <div className="container-wide">
          <div className="section-header">
            <div>
              <span className="eyebrow">04 / Field notes</span>
              <h2>What building taught me.</h2>
            </div>
            <Link href="/notes" className="section-num">
              All notes →
            </Link>
          </div>
          <div className="notes-grid">
            {featuredNotes.map((n) => (
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

      {/* ============= CTA ============= */}
      <section aria-label="Contact">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="eyebrow">05 / Currently building</span>
              <h2>What I am working on right now.</h2>
            </div>
          </div>
          <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '70ch' }}>
            <p>
              The active surfaces are Phoenix (production-observation mode on Arbitrum),
              Smart Trader (decision intelligence on a live market), Free Best Router
              (v0.1.0 shipped; expanding provider coverage and scoring), and Universal
              Engineering Agent (reference implementation, working through profile and harness
              integrations).
            </p>
            <p>
              If any of that overlaps with what you are building, I would like to hear
              about it.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link href="/contact" className="btn btn-primary">
                Get in touch <span className="arrow" aria-hidden>→</span>
              </Link>
              <a href={SITE.githubUrl} className="btn" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}