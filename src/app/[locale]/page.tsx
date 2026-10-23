import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { dict, isLocale } from '@/content/i18n';
import { socialMeta } from '@/lib/social';
import { OrgSimulatorSection } from '@/components/OrgSimulator';
import { OrgNervousSystem } from '@/components/OrgNervousSystem';
import { BrainDemo } from '@/components/BrainDemo';
import { SystemFlow } from '@/components/LearningLoop';
import { Reveal } from '@/components/Reveal';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const l = params.locale;
  const t = dict(l).meta.home;
  return {
    title: t.title,
    description: t.description,
    ...socialMeta({
      title: t.title,
      description: t.description,
      path: `/${l}`,
      locale: l === 'fa' ? 'fa' : 'en',
      languages: { en: '/en', fa: '/fa', 'x-default': '/en' },
    }),
  };
}

export default async function LocaleHome({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const l = params.locale;
  const t = dict(l);
  const h = t.home;

  return (
    <>
      {/* ===== 01 · HERO ===== */}
      <section className="q-hero" aria-label="Quantiviq — AI-native organization transformation">
        <div className="container-wide">
          <div className="q-hero-copy">
            <span className="eyebrow sig">{t.hero.tag}</span>
            <h1 className="q-display">{t.hero.h1}</h1>
            <p className="q-hero-sub">{t.hero.sub}</p>
            <p className="q-hero-body">{t.hero.bodyP1}</p>
            <p className="q-hero-body">{t.hero.bodyP2}</p>
            <p className="q-hero-promise">{t.hero.promise}</p>
            <div className="hero-actions">
              <Link href={`/${l}#simulator`} className="btn btn-primary">
                {t.hero.ctaPrimary} <span className="arrow" aria-hidden>↓</span>
              </Link>
              <Link href={`/${l}/contact`} className="btn">
                {t.hero.ctaSecondary} <span className="arrow" aria-hidden>→</span>
              </Link>
            </div>
            <p className="hero-hiring">
              <Link href={`/${l}/leadership`}>{t.hero.hiringLink}</Link>
            </p>
          </div>
        </div>
      </section>

      {/* ===== 02 · SIMULATION (localized frame, EN microcopy inside) ===== */}
      <section id="simulator-frame" className="q-section" aria-label={h.simFrame}>
        <div className="container-wide">
          <Reveal>
            <div className="section-header">
              <div>
                <span className="eyebrow sig">{h.simFrame}</span>
                <h2 className="q-h2">{t.hero.ctaPrimary}.</h2>
              </div>
              <span className="section-num sim-disclaimer">{h.simCaption}</span>
            </div>
          </Reveal>
        </div>
      </section>

      <OrgSimulatorSection locale={l} />

      {/* ===== 03 · THE PROBLEM ===== */}
      <section id="problem" className="q-section" aria-label={h.problemH2}>
        <div className="container-wide">
          <Reveal>
            <div className="section-header">
              <div>
                <span className="eyebrow sig">{h.problemEyebrow}</span>
                <h2 className="q-h2">{h.problemH2}</h2>
              </div>
            </div>
            <p className="q-lede">{h.problemLede}</p>
          </Reveal>
          <ul className="latency-list">
            {h.latencyForms.map((f, i) => (
              <Reveal as="li" key={f.name} delay={i * 90} className="latency-row">
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

      {/* ===== 04 · THE SYSTEM ===== */}
      <section id="operating-model" className="q-section" aria-label={h.systemH2}>
        <div className="container-wide">
          <Reveal>
            <div className="section-header">
              <div>
                <span className="eyebrow sig">{h.systemEyebrow}</span>
                <h2 className="q-h2">{h.systemH2}</h2>
              </div>
            </div>
            <p className="q-lede">{h.systemLede}</p>
          </Reveal>
          <Reveal>
            <OrgNervousSystem
              layers={t.system.osLayers.map((ly, i) => ({
                key: ['governance', 'authority', 'control-plane', 'workflows', 'agents', 'brain', 'data', 'tools'][i],
                num: ly.num,
                name: ly.name,
                role: ly.role,
                detail: ly.detail,
              }))}
            />
          </Reveal>
          <Reveal>
            <ol className="os-index">
              {t.system.osLayers.map((ly) => (
                <li key={ly.num}>
                  <span className="os-index-num">{ly.num}</span>
                  <span className="os-index-name">{ly.name}</span>
                  <span className="os-index-role">{ly.role}</span>
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal>
            <p className="q-punch">{h.systemOutro}</p>
          </Reveal>
        </div>
      </section>

      {/* ===== 05 · HOW THE SYSTEM LEARNS ===== */}
      <section id="learning" className="q-section" aria-label={h.learningH2}>
        <div className="container-wide">
          <Reveal>
            <div className="section-header">
              <div>
                <span className="eyebrow sig">{h.learningEyebrow}</span>
                <h2 className="q-h2">{h.learningH2}</h2>
              </div>
            </div>
            <p className="q-lede">{h.learningLede}</p>
          </Reveal>
          <Reveal>
            <SystemFlow steps={h.flow} />
          </Reveal>
          <Reveal>
            <p className="q-punch" dir="ltr">{t.system.principle}</p>
          </Reveal>
        </div>
      </section>

      {/* ===== 06 · PROOF ===== */}
      <section id="proof" className="q-section" aria-label={h.proofH2}>
        <div className="container-wide">
          <Reveal>
            <div className="section-header">
              <div>
                <span className="eyebrow sig">{h.proofEyebrow}</span>
                <h2 className="q-h2">{h.proofH2}</h2>
              </div>
              <span className="section-num">{t.proof.levels}</span>
            </div>
          </Reveal>
          <div className="primitive-grid">
            {t.proof.items.map((p, i) => (
              <Reveal key={p.name} delay={i * 80} className="primitive-card">
                <Link href={`/${l}/proof`} className="primitive-link">
                  <div className="primitive-head">
                    <span className={`chip chip-${p.level === 'PUBLICLY VERIFIED' ? 'ok' : 'path'}`}>
                      {p.status}
                    </span>
                    <h3>{p.name}</h3>
                  </div>
                  <p className="primitive-one">{p.blurb}</p>
                  <span className="card-cta">
                    <span>{t.proof.seeSystem}</span>
                    <span aria-hidden>→</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p className="q-honesty">{h.honesty}</p>
          </Reveal>
          <Reveal>
            <div className="proof-bridge">
              <span className="eyebrow sig">{h.bridgeEyebrow}</span>
              <p className="proof-bridge-line">{h.bridgeLine}</p>
              <div className="hero-actions">
                <Link href={`/${l}/leadership`} className="btn btn-primary">
                  {h.bridgeLeadership} <span className="arrow" aria-hidden>→</span>
                </Link>
                <Link href="/journey" className="btn">
                  {h.bridgeJourney} <span className="arrow" aria-hidden>→</span>
                </Link>
                <Link href="/profile" className="btn">
                  {h.bridgeProfile} <span className="arrow" aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== 07 · METHOD ===== */}
      <section id="method" className="q-section" aria-label={h.methodH2}>
        <div className="container-wide">
          <Reveal>
            <div className="section-header">
              <div>
                <span className="eyebrow sig">{h.methodEyebrow}</span>
                <h2 className="q-h2">{h.methodH2}</h2>
              </div>
            </div>
            <p className="q-lede">{h.methodLede}</p>
          </Reveal>
          <ol className="steps-list">
            {t.method.stages.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 70} className="step-row">
                <span className="step-num">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.note}</p>
                </div>
              </Reveal>
            ))}
          </ol>
          <Reveal>
            <p className="q-founder-p">{t.method.close}</p>
          </Reveal>
          <Reveal>
            <div className="hero-actions" style={{ marginTop: '2.5rem' }}>
              <Link href={`/${l}/contact`} className="btn btn-primary">
                {t.method.cta} <span className="arrow" aria-hidden>→</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== FINAL ===== */}
      <section className="q-final" aria-label="Start">
        <div className="container-narrow">
          <Reveal>
            <p className="q-final-question">{h.finalQ}</p>
            <p className="q-final-answer">{h.finalA}</p>
            <h2 className="q-display q-final-h2">{h.finalH}</h2>
            <div className="hero-actions q-final-actions">
              <Link href={`/${l}/contact?intent=diagnostic`} className="btn btn-primary">
                {h.finalPrimary} <span className="arrow" aria-hidden>→</span>
              </Link>
              <Link href={`/${l}/contact`} className="btn">
                {h.finalSecondary} <span className="arrow" aria-hidden>→</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
