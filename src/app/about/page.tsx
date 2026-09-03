import type { Metadata } from 'next';

import { SITE } from '@/content/shared';

export const metadata: Metadata = {
  title: 'About',
  description: `About ${SITE.name} — product, systems, and AI engineering.`,
  alternates: { canonical: `${SITE.canonicalUrl}/about` },
};

export default function AboutPage() {
  return (
    <>
      <section style={{ paddingTop: '4.5rem', borderTop: 0 }}>
        <div className="container-wide">
          <span className="eyebrow">About</span>
          <h1>Product, systems, engineering.</h1>
        </div>
      </section>

      <section style={{ paddingTop: '1rem' }}>
        <div className="container-wide">
          <div className="about-grid">
            <div>
              <p>
                I am <strong>{SITE.name}</strong>, a builder working where product
                strategy, engineering, and real-world constraints meet. The portfolio
                on this site is the public record of that work — production systems,
                decision infrastructure, and AI engineering — not a résumé.
              </p>
              <p>
                My background crosses product management, marketplace systems,
                data and analytics, and engineering. That crossover is the point: a
                product without engineering discipline is a sketch; an engineering
                effort without product discipline is a hobby. The interesting work is
                at the boundary.
              </p>
              <p>
                The active projects on this site are <strong>Phoenix</strong> (a
                production-grade, fail-closed financial intelligence and execution
                system on Arbitrum), <strong>Smart Trader</strong> (a live decision
                intelligence trading system), <strong>Free Best Router</strong> (an
                OpenAI-compatible intelligent router for free AI models), and the{' '}
                <strong>Universal Engineering Agent</strong> (a profile-agnostic
                reference implementation of an engineering-agent operating kernel).
              </p>
              <p>
                I work on systems that have to ship. The work on this site is the
                evidence — not a marketing pitch.
              </p>

              <h2 style={{ marginTop: '3rem' }}>How I got here</h2>
              <p>
                Product → Data → Systems → AI → Autonomous decision systems →
                Production infrastructure. That progression is the story; you can read
                it through the projects. The early work was product and marketplace
                thinking. The middle work added data systems, ranking, and
                experimentation. The recent work adds AI engineering, agent
                architecture, and autonomous decision systems — with the same product
                discipline applied at a different layer of the stack.
              </p>

              <h2>What I believe</h2>
              <p>
                Reliability beats cleverness. Economic correctness matters more than
                technical correctness. Production is part of the product. Models are
                not the product by themselves — routing, harnesses, evaluation, and
                feedback loops are. Fail-closed is different from fast. A small,
                well-scoped kernel with documented profiles is more useful than a
                large, opinionated framework. The boring parts of a system are most
                of the system.
              </p>

              <h2>Currently</h2>
              <p>
                Phoenix is in production observation on Arbitrum; Smart Trader is in
                active development with a live market; Free Best Router is shipped and
                expanding provider coverage; UEA is the reference implementation of a
                kernel I expect to keep iterating. The honest state is honest; the
                work is real.
              </p>
            </div>

            <aside>
              <h4>Basics</h4>
              <ul>
                <li>
                  <strong>Name</strong> — {SITE.name}
                </li>
                <li>
                  <strong>Domain</strong> — {SITE.domain}
                </li>
                <li>
                  <strong>Location</strong> — {SITE.location}
                </li>
                <li>
                  <strong>GitHub</strong> —{' '}
                  <a href={SITE.githubUrl}>{SITE.githubUser}</a>
                </li>
                <li>
                  <strong>LinkedIn</strong> —{' '}
                  <a href={SITE.linkedinUrl}>/in/majid-asghari</a>
                </li>
                <li>
                  <strong>Open to</strong> — serious product / systems work, AI
                  infrastructure collaborations
                </li>
              </ul>

              <h4 style={{ marginTop: '1.5rem' }}>Stack I think in</h4>
              <ul>
                <li>Python · Rust · Go · TypeScript · Solidity</li>
                <li>PostgreSQL · NATS · Prometheus · Docker</li>
                <li>Next.js · React · Node.js</li>
                <li>Arbitrum · Aave V3 · Atlas · Uniswap V3</li>
                <li>OpenAI-compatible LLM APIs · DeepSeek Harness</li>
              </ul>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}