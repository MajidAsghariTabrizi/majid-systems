import Link from 'next/link';
import type { Metadata } from 'next';

import { PROJECTS } from '@/content/projects';
import { getGitHubData, repoByName } from '@/content/github';
import { SITE } from '@/content/shared';

export const metadata: Metadata = {
  title: 'Work',
  description: 'Selected projects by Majid Asghari — production systems, case studies, and engineering evidence.',
  alternates: { canonical: `${SITE.canonicalUrl}/work` },
};

export default async function WorkPage() {
  const gh = await getGitHubData();
  const flagship = PROJECTS.filter((p) => p.category === 'flagship');

  return (
    <>
      <section style={{ paddingTop: '4.5rem', borderTop: 0 }}>
        <div className="container-wide">
          <span className="eyebrow">Selected work</span>
          <h1>Projects that earned their place.</h1>
          <p style={{ maxWidth: '60ch', fontSize: '1.08rem', color: 'var(--fg-muted)' }}>
            Every entry below links to a case study. The case study explains the problem,
            the architecture, the engineering decisions, what changed during development,
            and what I learned. Evidence comes from the project repository; no metric is
            invented.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: '2rem' }}>
        <div className="container-wide">
          <div className="project-grid">
            {flagship.map((p) => {
              const liveStars =
                repoByName(gh.repos, p.slug === 'phoenix' ? 'anti-gravity-phoenix-v4' : p.slug)
                  ?.stargazers_count ?? 0;
              return (
                <Link key={p.slug} href={`/work/${p.slug}`} className="project-card">
                  <span className="card-status">{p.statusLabel}</span>
                  <div>
                    <h3>{p.name}</h3>
                    <p className="card-thesis">{p.oneLiner}</p>
                  </div>
                  <div className="card-tags">
                    {p.languages.slice(0, 6).map((l) => (
                      <span key={l} className="tag">
                        {l}
                      </span>
                    ))}
                    {liveStars > 0 ? (
                      <span className="tag" aria-label={`${liveStars} stars on GitHub`}>
                        ★ {liveStars}
                      </span>
                    ) : null}
                  </div>
                  <div className="card-cta">
                    <span>Read case study</span>
                    <span aria-hidden>→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}