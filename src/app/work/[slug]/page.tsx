import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

import { PROJECTS, PROJECT_BY_SLUG } from '@/content/projects';
import { getGitHubData, repoByName } from '@/content/github';
import { ProjectJsonLd } from '@/components/JsonLd';
import { SITE } from '@/content/shared';
import { getArchitecture, getPipeline, getSafety } from '@/content/architecture';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return PROJECTS.filter((p) => p.category === 'flagship').map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = PROJECT_BY_SLUG[slug];
  if (!project || project.category !== 'flagship') {
    return { title: 'Project not found' };
  }
  const title = `${project.name} — case study`;
  const description = project.oneLiner;
  return {
    title,
    description,
    alternates: { canonical: `${SITE.canonicalUrl}/work/${slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE.canonicalUrl}/work/${slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = PROJECT_BY_SLUG[slug];
  if (!project || project.category !== 'flagship') notFound();

  const gh = await getGitHubData();
  const liveRepo = repoByName(
    gh.repos,
    slug === 'phoenix' ? 'anti-gravity-phoenix-v4' : slug
  );

  const architecture = getArchitecture(project.slug);
  const pipeline = getPipeline(project.slug);
  const safety = getSafety(project.slug);

  const sections: { id: string; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'problem', label: 'Problem' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'pipeline', label: 'Decision pipeline' },
    { id: 'safety', label: 'Safety model' },
    { id: 'decisions', label: 'Engineering decisions' },
    { id: 'failed', label: 'What changed' },
    { id: 'implementation', label: 'Technical implementation' },
    { id: 'product', label: 'Product implications' },
    { id: 'lessons', label: 'Lessons learned' },
    { id: 'state', label: 'Current state' },
  ];

  return (
    <article className="project-detail">
      <ProjectJsonLd project={project} />

      <header>
        <div className="container-wide">
          <span
            className={`status-pill ${
              project.status === 'production-no-alpha' ? 'warm' : ''
            }`}
          >
            {project.statusLabel}
          </span>
          <h1>{project.name}</h1>
          <p className="lede">{project.thesis}</p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <a
              href={project.githubUrl}
              className="btn btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub <span className="arrow" aria-hidden>↗</span>
            </a>
            <Link href="/work" className="btn">
              ← All work
            </Link>
          </div>
        </div>
      </header>

      <div className="container-wide">
        <div className="detail-grid">
          <main>
            <h2 id="overview">Overview</h2>
            <p>{project.oneLiner}</p>
            <p>{project.problem}</p>

            <h3>What I built</h3>
            <ul>
              {project.whatIBuilt.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>

            <h3>Why it matters</h3>
            <p>{project.whyItMatters}</p>

            <h2 id="problem">Problem</h2>
            <p>{project.problem}</p>

            <h2 id="architecture">Architecture</h2>
            {architecture}

            {pipeline ? (
              <>
                <h2 id="pipeline">Decision pipeline</h2>
                {pipeline}
              </>
            ) : null}

            {safety ? (
              <>
                <h2 id="safety">Safety model</h2>
                <p>
                  The system is designed around explicit fail-closed controls. These are the
                  invariants that must hold before any execution authority is granted.
                </p>
                {safety}
              </>
            ) : null}

            <h2 id="decisions">Engineering decisions</h2>
            <ul>
              {project.decisions.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>

            <h2 id="failed">What changed during development</h2>
            <ul>
              {project.whatFailed.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>

            <h2 id="implementation">Technical implementation</h2>
            <ul>
              {project.technicalImplementation.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>

            <h2 id="product">Product implications</h2>
            <ul>
              {project.productImplications.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>

            <h2 id="lessons">Lessons learned</h2>
            <ul>
              {project.lessons.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>

            <h2 id="state">Current state</h2>
            <p>{project.currentState}</p>
          </main>

          <aside className="detail-aside">
            <div className="aside-card">
              <h4>Repository</h4>
              <div className="meta-row">
                <span className="meta-label">GitHub</span>
                <span className="meta-value">
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                    {project.githubUrl.replace('https://github.com/', '')}
                  </a>
                </span>
              </div>
              {liveRepo ? (
                <>
                  <div className="meta-row">
                    <span className="meta-label">Stars</span>
                    <span className="meta-value">{liveRepo.stargazers_count}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Language</span>
                    <span className="meta-value">{liveRepo.language ?? '—'}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">License</span>
                    <span className="meta-value">{liveRepo.license_spdx_id ?? '—'}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Last push</span>
                    <span className="meta-value">
                      {new Date(liveRepo.pushed_at).toISOString().slice(0, 10)}
                    </span>
                  </div>
                </>
              ) : null}
              <div className="meta-row">
                <span className="meta-label">Started</span>
                <span className="meta-value">{project.dates.started}</span>
              </div>
              {project.dates.latest ? (
                <div className="meta-row">
                  <span className="meta-label">Latest</span>
                  <span className="meta-value">{project.dates.latest}</span>
                </div>
              ) : null}
            </div>

            <div className="aside-card">
              <h4>Stack</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {project.languages.map((l) => (
                  <span key={l} className="tag">
                    {l}
                  </span>
                ))}
              </div>
            </div>

            {project.topics && project.topics.length > 0 ? (
              <div className="aside-card">
                <h4>Topics</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                  {project.topics.map((t) => (
                    <span key={t} className="tag">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="aside-card">
              <h4>On this page</h4>
              <nav className="toc" aria-label="Table of contents">
                {sections.map((s) => (
                  <a key={s.id} href={`#${s.id}`}>
                    {s.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}