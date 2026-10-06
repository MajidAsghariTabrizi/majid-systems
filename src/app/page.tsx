import type { Metadata } from 'next';
import Link from 'next/link';

import {
  BEFORE_AFTER,
  ENGAGEMENT,
  FINAL_CTA,
  FOUNDER,
  HERO,
  LATENCY_FORMS,
  LATENCY_INTRO,
  OS_INTRO,
  OS_LAYERS,
  PRIMITIVES,
  PRIMITIVES_HONESTY,
  PRIMITIVES_NOTE,
  RESTRUCTURING,
  SIGNATURE,
  USE_CASES,
  BRAND,
} from '@/content/quantiviq';
import { OrgTransform } from '@/components/OrgTransform';
import { OrgNervousSystem } from '@/components/OrgNervousSystem';
import { BrainDemo } from '@/components/BrainDemo';
import { LearningLoop } from '@/components/LearningLoop';
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

export default function QuantiviqHomePage() {
  return (
    <>
      <QuantiviqJsonLd />

      {/* ============= HERO ============= */}
      <section className="q-hero" aria-label="Quantiviq — AI-native organization transformation">
        <div className="container-wide">
          <div className="q-hero-copy">
            <span className="eyebrow">{HERO.eyebrow}</span>
            <h1 className="q-display">{HERO.h1}</h1>
            <p className="q-hero-sub">{HERO.sub}</p>
            <p className="q-hero-body">{HERO.body}</p>
            <div className="hero-actions">
              <Link href={HERO.ctaPrimary.href} className="btn btn-primary">
                {HERO.ctaPrimary.label} <span className="arrow" aria-hidden>↓</span>
              </Link>
              <Link href={HERO.ctaSecondary.href} className="btn">
                {HERO.ctaSecondary.label} <span className="arrow" aria-hidden>→</span>
              </Link>
            </div>
          </div>
          <Reveal className="q-hero-viz">
            <div className="q-viz-head">
              <span className="eyebrow" style={{ marginBottom: 0 }}>{HERO.vizTitle}</span>
              <span className="q-viz-caption">{HERO.vizCaption}</span>
            </div>
            <OrgTransform />
          </Reveal>
        </div>
      </section>

      {/* ============= SIGNATURE QUESTION ============= */}
      <section className="q-signature" aria-label="The signature question">
        <div className="container-narrow">
          <Reveal>
            <p className="q-question">{SIGNATURE.question}</p>
          </Reveal>
          <Reveal delay={260}>
            <p className="q-answer">{SIGNATURE.answer}</p>
          </Reveal>
          <Reveal delay={420}>
            <p className="q-close">{SIGNATURE.close}</p>
          </Reveal>
        </div>
      </section>

      {/* ============= COMPANY LATENCY ============= */}
      <section id="latency" className="q-section" aria-label="Company latency">
        <div className="container-wide">
          <Reveal>
            <div className="section-header">
              <div>
                <span className="eyebrow">01 · The bottleneck</span>
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

      {/* ============= ORGANIZATION OS ============= */}
      <section id="operating-model" className="q-section" aria-label="The AI-native organization operating system">
        <div className="container-wide">
          <Reveal>
            <div className="section-header">
              <div>
                <span className="eyebrow">02 · Operating model</span>
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
        </div>
      </section>

      {/* ============= COMPANY BRAIN ============= */}
      <section id="company-brain" className="q-section" aria-label="The company brain">
        <div className="container-wide">
          <Reveal>
            <div className="section-header">
              <div>
                <span className="eyebrow">03 · Company brain</span>
                <h2 className="q-h2">A memory the company can interrogate.</h2>
              </div>
            </div>
          </Reveal>
          <Reveal>
            <BrainDemo />
          </Reveal>
        </div>
      </section>

      {/* ============= LEARNING LOOP ============= */}
      <section id="learning" className="q-section" aria-label="The learning loop">
        <div className="container-wide">
          <Reveal>
            <div className="section-header">
              <div>
                <span className="eyebrow">04 · Learning loop</span>
                <h2 className="q-h2">Experience should compound.</h2>
              </div>
            </div>
          </Reveal>
          <Reveal>
            <LearningLoop />
          </Reveal>
        </div>
      </section>

      {/* ============= WHAT ACTUALLY CHANGES ============= */}
      <section id="changes" className="q-section" aria-label="What actually changes">
        <div className="container-wide">
          <Reveal>
            <div className="section-header">
              <div>
                <span className="eyebrow">05 · Structure</span>
                <h2 className="q-h2">What actually changes.</h2>
              </div>
              <span className="section-num">structural comparison — not KPIs</span>
            </div>
          </Reveal>
          <Reveal>
            <div className="ba-table" role="table" aria-label="Before and after, structural comparison">
              <div className="ba-row ba-head" role="row">
                <span role="columnheader">Dimension</span>
                <span role="columnheader">Traditional company</span>
                <span role="columnheader">AI-native company</span>
              </div>
              {BEFORE_AFTER.map((r) => (
                <div className="ba-row" role="row" key={r.dimension}>
                  <span className="ba-dim" role="rowheader">{r.dimension}</span>
                  <span className="ba-before" role="cell">{r.before}</span>
                  <span className="ba-after" role="cell">{r.after}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============= RESTRUCTURING ============= */}
      <section id="restructuring" className="q-section" aria-label="Company restructuring">
        <div className="container-wide">
          <Reveal>
            <div className="section-header">
              <div>
                <span className="eyebrow">06 · Restructuring</span>
                <h2 className="q-h2">{RESTRUCTURING.headline}.</h2>
              </div>
            </div>
            <p className="q-lede">{RESTRUCTURING.body}</p>
          </Reveal>
          <ul className="restructure-list">
            {RESTRUCTURING.items.map((item, i) => (
              <Reveal as="li" key={item} delay={i * 70}>
                <span aria-hidden>▸ </span>
                {item}
              </Reveal>
            ))}
          </ul>
          <Reveal>
            <p className="q-punch">{RESTRUCTURING.close}</p>
          </Reveal>
        </div>
      </section>

      {/* ============= FOUNDER ============= */}
      <section id="founder" className="q-section" aria-label="The person behind Quantiviq">
        <div className="container">
          <Reveal>
            <span className="eyebrow">{FOUNDER.eyebrow}</span>
            <h2 className="q-h2">{FOUNDER.headline}</h2>
          </Reveal>
          {FOUNDER.body.map((p, i) => (
            <Reveal key={p.slice(0, 24)} delay={i * 120}>
              <p className="q-founder-p">{p}</p>
            </Reveal>
          ))}
          <Reveal>
            <Link href={FOUNDER.link.href} className="btn">
              {FOUNDER.link.label} <span className="arrow" aria-hidden>→</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ============= PRIMITIVES ============= */}
      <section id="proof" className="q-section" aria-label="Primitives as proof">
        <div className="container-wide">
          <Reveal>
            <div className="section-header">
              <div>
                <span className="eyebrow">07 · Proof</span>
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
        </div>
      </section>

      {/* ============= METHOD / ENGAGEMENT ============= */}
      <section id="method" className="q-section" aria-label="How the work runs">
        <div className="container-wide">
          <Reveal>
            <div className="section-header">
              <div>
                <span className="eyebrow">08 · Method</span>
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
            <div className="hero-actions" style={{ marginTop: '2.5rem' }}>
              <Link href={ENGAGEMENT.cta.href} className="btn btn-primary">
                {ENGAGEMENT.cta.label} <span className="arrow" aria-hidden>→</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============= USE CASES ============= */}
      <section id="use-cases" className="q-section" aria-label="Ideal first functions">
        <div className="container-wide">
          <Reveal>
            <div className="section-header">
              <div>
                <span className="eyebrow">09 · First functions</span>
                <h2 className="q-h2">Where to start.</h2>
              </div>
              <span className="section-num">ideal first use cases</span>
            </div>
          </Reveal>
          <div className="usecase-grid">
            {USE_CASES.map((u, i) => (
              <Reveal key={u.key} delay={i * 60} className="usecase-card">
                <h3>{u.name}</h3>
                <p>{u.why}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============= FINAL CTA ============= */}
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
