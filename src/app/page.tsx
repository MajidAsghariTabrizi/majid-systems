import type { Metadata } from 'next';
import Link from 'next/link';

import {
  BRAND,
  ENGAGEMENT,
  FINAL_CTA,
  HERO,
  LATENCY_FORMS,
  LATENCY_INTRO,
  OS_INTRO,
  OS_LAYERS,
  PRIMITIVES,
  PRIMITIVES_HONESTY,
  PRIMITIVES_NOTE,
  PROOF_BRIDGE,
  SYSTEM_FLOW_CAPTION,
} from '@/content/quantiviq';
import { OrgSimulatorSection } from '@/components/OrgSimulator';
import { OrgNervousSystem } from '@/components/OrgNervousSystem';
import { BrainDemo } from '@/components/BrainDemo';
import { SystemFlow } from '@/components/LearningLoop';
import { Reveal } from '@/components/Reveal';
import { QuantiviqJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: BRAND.title,
  description: BRAND.description,
  alternates: { canonical: 'https://quantiviq.xyz' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://quantiviq.xyz',
    siteName: 'Quantiviq',
    title: BRAND.title,
    description: BRAND.description,
    images: [{ url: BRAND.ogImage, width: 1200, height: 630, alt: 'Quantiviq — Rebuild the Company' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: BRAND.title,
    description: BRAND.description,
    images: [BRAND.ogImage],
  },
};

/**
 * One continuous argument, six beats:
 * problem → thesis → system → learning → proof → method.
 * Every section advances exactly one of them.
 */
export default function QuantiviqHomePage() {
  return (
    <>
      <QuantiviqJsonLd />

      {/* ===== 01 · HERO + SIMULATION — the thesis, felt ===== */}
      <section className="q-hero" aria-label="Quantiviq — AI-native organization transformation">
        <div className="container-wide">
          <div className="q-hero-copy">
            <span className="eyebrow">{HERO.tag}</span>
            <h1 className="q-display">{HERO.h1}</h1>
            <p className="q-hero-sub">{HERO.sub}</p>
            <p className="q-hero-body">{HERO.bodyP1}</p>
            <p className="q-hero-body">{HERO.bodyP2}</p>
            <div className="hero-actions">
              <Link href={HERO.ctaPrimary.href} className="btn btn-primary">
                {HERO.ctaPrimary.label} <span className="arrow" aria-hidden>↓</span>
              </Link>
              <Link href={HERO.ctaSecondary.href} className="btn">
                {HERO.ctaSecondary.label} <span className="arrow" aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <OrgSimulatorSection />

      {/* ===== 02 · THE PROBLEM — company latency ===== */}
      <section id="problem" className="q-section" aria-label="Company latency">
        <div className="container-wide">
          <Reveal>
            <div className="section-header">
              <div>
                <span className="eyebrow sig">01 · The problem</span>
                <h2 className="q-h2">The new bottleneck is company latency.</h2>
              </div>
            </div>
            <p className="q-lede">{LATENCY_INTRO}</p>
          </Reveal>
          <ul className="latency-list">
            {LATENCY_FORMS.map((f, i) => (
              <Reveal as="li" key={f.key} delay={i * 90} className="latency-row">
                <div className="latency-main">
                  <span className="latency-num">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{f.name}</h3>
                    <p className="latency-question">{f.question}</p>
                  </div>
                </div>
                <div className="latency-bar" aria-hidden>
                  <span style={{ width: `${34 + i * 14}%` }} />
                  <span className="latency-bar-label">time</span>
                </div>
                <p className="latency-body">{f.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== 03 · THE SYSTEM — the Organization OS (canonical architecture) ===== */}
      <section id="operating-model" className="q-section" aria-label="The AI-native organization operating system">
        <div className="container-wide">
          <Reveal>
            <div className="section-header">
              <div>
                <span className="eyebrow sig">02 · The system</span>
                <h2 className="q-h2">The AI-native Organization OS.</h2>
              </div>
            </div>
            <p className="q-lede">{OS_INTRO}</p>
          </Reveal>
          <Reveal>
            <OrgNervousSystem />
          </Reveal>
          <Reveal>
            <ol className="os-index">
              {OS_LAYERS.map((l) => (
                <li key={l.key}>
                  <span className="os-index-num">{l.num}</span>
                  <span className="os-index-name">{l.name}</span>
                  <span className="os-index-role">{l.role}</span>
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal>
            <p className="q-punch">
              When intelligence becomes cheap, the shape of the organization itself becomes a design
              decision: departments become workflows with oversight; meetings become rules.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ===== 04 · HOW THE SYSTEM LEARNS — one loop, brain inside it ===== */}
      <section id="learning" className="q-section" aria-label="How the system learns">
        <div className="container-wide">
          <Reveal>
            <div className="section-header">
              <div>
                <span className="eyebrow sig">03 · Learning</span>
                <h2 className="q-h2">Signals in. Learning out.</h2>
              </div>
            </div>
            <p className="q-lede">{SYSTEM_FLOW_CAPTION}</p>
          </Reveal>
          <Reveal>
            <SystemFlow />
          </Reveal>
          <Reveal>
            <BrainDemo />
          </Reveal>
        </div>
      </section>

      {/* ===== 05 · PROOF — primitives, built before the thesis had a name ===== */}
      <section id="proof" className="q-section" aria-label="Primitives as proof">
        <div className="container-wide">
          <Reveal>
            <div className="section-header">
              <div>
                <span className="eyebrow sig">04 · Proof</span>
                <h2 className="q-h2">{PRIMITIVES_NOTE}</h2>
              </div>
            </div>
          </Reveal>
          <div className="primitive-grid">
            {PRIMITIVES.map((p, i) => (
              <Reveal key={p.key} delay={i * 80} className="primitive-card">
                <Link href={p.href} className="primitive-link">
                  <div className="primitive-head">
                    <span className={`chip chip-${p.statusKind}`}>{p.status}</span>
                    <h3>{p.name}</h3>
                  </div>
                  <p className="primitive-one">{p.oneLiner}</p>
                  <p className="primitive-proof">{p.proof}</p>
                  <span className="card-cta">
                    <span>See the system</span>
                    <span aria-hidden>→</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p className="q-honesty">{PRIMITIVES_HONESTY}</p>
          </Reveal>
          <Reveal>
            <div className="proof-bridge">
              <span className="eyebrow sig">{PROOF_BRIDGE.eyebrow}</span>
              <p className="proof-bridge-line">{PROOF_BRIDGE.line}</p>
              <div className="hero-actions">
                <Link href={PROOF_BRIDGE.journey.href} className="btn">
                  {PROOF_BRIDGE.journey.label} <span className="arrow" aria-hidden>→</span>
                </Link>
                <Link href={PROOF_BRIDGE.profile.href} className="btn">
                  {PROOF_BRIDGE.profile.label} <span className="arrow" aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== 06 · METHOD + CTA ===== */}
      <section id="method" className="q-section" aria-label="How the work runs">
        <div className="container-wide">
          <Reveal>
            <div className="section-header">
              <div>
                <span className="eyebrow sig">05 · Method</span>
                <h2 className="q-h2">{ENGAGEMENT.headline}</h2>
              </div>
            </div>
            <p className="q-lede">{ENGAGEMENT.body}</p>
          </Reveal>
          <ol className="steps-list">
            {ENGAGEMENT.steps.map((s, i) => (
              <Reveal as="li" key={s.num} delay={i * 70} className="step-row">
                <span className="step-num">{s.num}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.note}</p>
                </div>
              </Reveal>
            ))}
          </ol>
          <Reveal>
            <p className="q-founder-p">{ENGAGEMENT.close}</p>
          </Reveal>
          <Reveal>
            <div className="hero-actions" style={{ marginTop: '2.5rem' }}>
              <Link href={ENGAGEMENT.cta.href} className="btn btn-primary">
                {ENGAGEMENT.cta.label} <span className="arrow" aria-hidden>→</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== FINAL — the signature question, asked exactly once ===== */}
      <section className="q-final" aria-label="Start">
        <div className="container-narrow">
          <Reveal>
            <p className="q-final-question">
              {FINAL_CTA.lines[0]}
              <br />
              {FINAL_CTA.lines[1]}
            </p>
            <p className="q-final-answer">{FINAL_CTA.answer}</p>
            <h2 className="q-display q-final-h2">{FINAL_CTA.headline}</h2>
            <div className="hero-actions q-final-actions">
              <Link href={FINAL_CTA.primary.href} className="btn btn-primary">
                {FINAL_CTA.primary.label} <span className="arrow" aria-hidden>→</span>
              </Link>
              <Link href={FINAL_CTA.secondary.href} className="btn">
                {FINAL_CTA.secondary.label} <span className="arrow" aria-hidden>→</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
