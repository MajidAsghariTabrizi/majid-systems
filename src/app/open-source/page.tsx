import type { Metadata } from 'next';

import { OPEN_SOURCE_ITEMS, FORK_ITEMS } from '@/content/openSource';
import { getGitHubData, repoByName } from '@/content/github';
import { SITE } from '@/content/shared';

export const metadata: Metadata = {
  title: 'Open source',
  description: 'Original open-source work, curated lists, and forks that helped me learn the systems I now build on.',
  alternates: { canonical: `${SITE.canonicalUrl}/open-source` },
};

export default async function OpenSourcePage() {
  const gh = await getGitHubData();
  return (
    <>
      <section style={{ paddingTop: '4.5rem', borderTop: 0 }}>
        <div className="container-wide">
          <span className="eyebrow">Open source</span>
          <h1>What I have built in public.</h1>
          <p style={{ maxWidth: '60ch', fontSize: '1.08rem', color: 'var(--fg-muted)' }}>
            Original projects I created and maintain, plus curated lists and forks that
            helped me study the systems I now build on. Each entry includes the role and
            the reason.
          </p>
        </div>
      </section>

      <section>
        <div className="container-wide">
          <div className="section-header">
            <div>
              <span className="eyebrow">Maintained</span>
              <h2>Original projects</h2>
            </div>
            <span className="section-num">{OPEN_SOURCE_ITEMS.length} repos</span>
          </div>
          <div className="os-list">
            {OPEN_SOURCE_ITEMS.map((item) => {
              const live = repoByName(gh.repos, item.name);
              return (
                <a key={item.slug} href={item.url} className="os-row" target="_blank" rel="noopener noreferrer">
                  <div>
                    <h3>{item.name}</h3>
                    <p className="os-desc">{item.description}</p>
                  </div>
                  <div className="os-meta">
                    {item.language ? <span className="tag">{item.language}</span> : null}
                    {item.license ? <span className="tag">{item.license}</span> : null}
                    {live && live.stargazers_count > 0 ? (
                      <span className="tag">★ {live.stargazers_count}</span>
                    ) : null}
                    {live ? (
                      <span className="tag">
                        pushed {new Date(live.pushed_at).toISOString().slice(0, 10)}
                      </span>
                    ) : null}
                  </div>
                  <span className="os-action">
                    {item.role} ↗
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <div className="container-wide">
          <div className="section-header">
            <div>
              <span className="eyebrow">Studied</span>
              <h2>Forks and curated lists</h2>
            </div>
            <span className="section-num">{FORK_ITEMS.length} repos</span>
          </div>
          <div className="os-list">
            {FORK_ITEMS.map((item) => (
              <a key={item.slug} href={item.url} className="os-row" target="_blank" rel="noopener noreferrer">
                <div>
                  <h3>{item.name}</h3>
                  <p className="os-desc">{item.description}</p>
                </div>
                <div className="os-meta">
                  {item.language ? <span className="tag">{item.language}</span> : null}
                  {item.license ? <span className="tag">{item.license}</span> : null}
                  <span className="tag">{item.kind === 'curated' ? 'curated list' : 'fork'}</span>
                </div>
                <span className="os-action">
                  {item.role} ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-header">
            <div>
              <span className="eyebrow">Honesty</span>
              <h2>About ownership claims.</h2>
            </div>
          </div>
          <p style={{ maxWidth: '70ch' }}>
            Where a repository is a fork of someone else's project, I say so explicitly and
            credit the parent. I do not claim "contributions" to upstream repositories unless
            there is a merged PR I can point to. I do not invent ownership or achievements.
            Every entry on this page is grounded in the public record on GitHub.
          </p>
        </div>
      </section>
    </>
  );
}