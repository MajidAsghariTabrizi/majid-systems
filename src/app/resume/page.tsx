import type { Metadata } from 'next';
import Link from 'next/link';

import { JOURNEY_LAYERS, JOURNEY_NODES } from '@/content/journey';
import { PROJECTS } from '@/content/projects';
import { SITE } from '@/content/shared';

export const metadata: Metadata = {
  title: 'Majid Asghari Tabrizi — Résumé',
  description:
    'Traditional résumé view: product lead, systems builder, AI-native organizations. Print this page to PDF.',
  alternates: { canonical: 'https://quantiviq.xyz/resume' },
  robots: { index: true },
};

/**
 * Print-optimized traditional résumé. The cinematic journey lives at /journey;
 * this page is the recruiter escape hatch (File → Print → Save as PDF).
 */
export default function ResumePage() {
  const flagship = PROJECTS.filter((p) => p.category === 'flagship');
  return (
    <div className="resume">
      <header className="r-head no-print">
        <p>
          This is the traditional view of a career better experienced as a system:{' '}
          <Link href="/journey">THE CONVERGENCE →</Link>
        </p>
        <p className="r-print-hint">Use your browser’s Print → Save as PDF for a downloadable copy.</p>
      </header>

      <main className="r-sheet">
        <h1>Majid Asghari Tabrizi</h1>
        <p className="r-tag">Product Lead — AI — Systems · AI-native organization design</p>
        <p className="r-contact">
          {SITE.canonicalUrl.replace('https://', '')} · majid@quantiviq.xyz · github.com/MajidAsghariTabrizi ·
          linkedin.com/in/majid-asghari
        </p>

        <section>
          <h2>Thesis</h2>
          <p>
            One career, deeper layers: how software works → how products create value → how teams create products →
            how organizations operate → how complex systems make decisions → how AI can act → how AI can learn → how
            human + AI organizations should operate. Not a sequence of titles — a sequence of increasingly harder
            questions about reality, decisions, autonomy and learning.
          </p>
        </section>

        <section>
          <h2>Career layers</h2>
          <table className="r-layers">
            <tbody>
              {JOURNEY_NODES.map((n) => (
                <tr key={n.id}>
                  <td className="r-era">{n.era}</td>
                  <td className="r-layer">{JOURNEY_LAYERS[n.layer].label}</td>
                  <td>{n.thesis}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="r-note">
            Employers (owner-verified list): SnappMarket · Okala · Alibaba Travels Co. · SportMob · Daapapp · Infinite8.
            Role details available on request.
          </p>
          <p className="r-note">Certification: Professional Scrum Master I (PSM I).</p>
        </section>

        <section>
          <h2>Selected systems (public proof)</h2>
          {flagship.map((p) => (
            <div key={p.slug} className="r-proj">
              <h3>
                {p.name} <span className="r-status">— {p.statusLabel}</span>
              </h3>
              <p>{p.oneLiner}</p>
              <p className="r-links">
                {p.githubUrl.replace('https://github.com/MajidAsghariTabrizi/', 'github.com/MajidAsghariTabrizi/')}
              </p>
            </div>
          ))}
        </section>

        <section>
          <h2>How I work</h2>
          <ul>
            <li>Reality over architecture; evidence over confidence; no edge, no bet.</li>
            <li>Abstention is a valid decision; fail closed when downside is asymmetric.</li>
            <li>Cheapest experiment before machine; separate intelligence from authority.</li>
            <li>Learning must preserve provenance; technical difficulty is not commercial validation.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
