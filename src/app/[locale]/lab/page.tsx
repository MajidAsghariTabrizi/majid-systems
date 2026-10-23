import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { dict, isLocale } from '@/content/i18n';
import { socialMeta } from '@/lib/social';
import { Reveal } from '@/components/Reveal';
import { LabApp } from '@/components/lab/LabApp';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const t = dict(params.locale).meta.lab;
  return {
    title: t.title,
    description: t.description,
    ...socialMeta({
      title: t.title,
      description: t.description,
      path: `/${params.locale}/lab`,
      locale: params.locale === 'fa' ? 'fa' : 'en',
      languages: { en: '/en/lab', fa: '/fa/lab', 'x-default': '/en/lab' },
    }),
    robots: { index: true, follow: true },
  };
}

export default async function LabPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const l = params.locale;
  const t = dict(l);
  const lab = t.lab;

  return (
    <>
      {/* ── hero ─────────────────────────────────────────────── */}
      <section className="q-hero lab-hero" style={{ minHeight: 'auto', paddingBottom: '2.75rem' }}>
        <div className="container-wide">
          <Reveal>
            <span className="eyebrow sig">{lab.hero.eyebrow}</span>
            <h1 className="q-display">{lab.hero.h1}</h1>
            <p className="q-hero-sub">{lab.hero.sub}</p>
            <p className="q-hero-body" style={{ maxWidth: '68ch' }}>{lab.hero.lede}</p>
            <div className="hero-actions">
              <Link href="#replay" className="btn btn-primary">
                {lab.hero.ctaPrimary} <span className="arrow" aria-hidden>→</span>
              </Link>
              <Link href="#topology" className="btn">
                {lab.hero.ctaSecondary}
              </Link>
            </div>
            <p className="lab-hero-safety lab-mono">{lab.hero.safetyLine}</p>
          </Reveal>
        </div>
      </section>

      {/* ── overview cards ───────────────────────────────────── */}
      <section className="q-section" aria-label={lab.overview.h2}>
        <div className="container-wide">
          <Reveal>
            <div className="section-header">
              <div>
                <span className="eyebrow sig">{lab.overview.eyebrow}</span>
                <h2 className="q-h2">{lab.overview.h2}</h2>
              </div>
            </div>
            <p className="q-lede">{lab.overview.lede}</p>
          </Reveal>
          <div className="lab-overview-grid">
            {lab.overview.cards.map((c) => (
              <Reveal key={c.title}>
                <article className="lab-card">
                  <h3>{c.title}</h3>
                  <p>{c.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── interactive laboratory (client) ──────────────────── */}
      <LabApp locale={l} />

      {/* ── modes & safety ───────────────────────────────────── */}
      <section className="q-section" id="safety" aria-label={lab.safety.h2}>
        <div className="container-wide">
          <Reveal>
            <div className="section-header">
              <div>
                <span className="eyebrow sig">{lab.safety.eyebrow}</span>
                <h2 className="q-h2">{lab.safety.h2}</h2>
              </div>
            </div>
            <p className="q-lede">{lab.safety.lede}</p>
          </Reveal>
          <div className="lab-safety-grid">
            <Reveal>
              <div className="lab-safety-card">
                <h3>{lab.safety.invariantsTitle}</h3>
                <ul className="lab-invariants">
                  {lab.safety.invariants.map((inv) => (
                    <li key={inv}>{inv}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal>
              <div className="lab-safety-card">
                <h3>{lab.safety.modesTitle}</h3>
                <p>{lab.safety.modesBody}</p>
                <h3 style={{ marginTop: '1.4rem' }}>{lab.safety.disclosureTitle}</h3>
                <p>{lab.safety.disclosureBody}</p>
              </div>
            </Reveal>
          </div>
          <Reveal>
            <div className="lab-provenance-note">
              <h3>{lab.dataNote.title}</h3>
              <p>{lab.dataNote.body}</p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
