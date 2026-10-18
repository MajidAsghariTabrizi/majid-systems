import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { dict, isLocale } from '@/content/i18n';
import { PRIMITIVES } from '@/content/quantiviq';
import { Reveal } from '@/components/Reveal';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const t = dict(params.locale).meta.proof;
  return {
    title: t.title,
    description: t.description,
    alternates: { canonical: `/${params.locale}/proof`, languages: { en: '/en/proof', fa: '/fa/proof', 'x-default': '/en/proof' } },
  };
}

export default async function ProofPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const l = params.locale;
  const t = dict(l).proof;

  // Canonical EN evidence data (links, honest status) joined to localized
  // blurbs/levels by IMMUTABLE KEY — never by localized display name.
  // HREF policy: /contact is a locale route (rewrite to current locale);
  // /engineering and /work/* are the documented shared EN tree — kept, but
  // visibly marked on FA so nothing silently routes Persian users to EN.
  const SHARED_EN = ['/engineering', '/work'];
  const cards = PRIMITIVES.map((p) => {
    const loc = t.items.find((it) => it.key === p.key);
    if (!loc) throw new Error(`proof dictionary missing key: ${p.key}`);
    const href = p.href === '/contact' ? `/${l}/contact` : p.href;
    const sharedEn = l === 'fa' && SHARED_EN.some((s) => p.href.startsWith(s));
    return {
      ...p,
      href,
      sharedEn,
      localName: loc.name,
      localBlurb: loc.blurb,
      level: loc.level,
    };
  });

  return (
    <>
      <section className="q-hero" style={{ minHeight: 'auto', paddingBottom: '2rem' }}>
        <div className="container-wide">
          <span className="eyebrow sig">{t.eyebrow}</span>
          <h1 className="q-display">{t.h1}</h1>
          <p className="q-hero-body" style={{ maxWidth: '62ch' }}>{t.lede}</p>
          <p className="section-num" style={{ marginTop: '1rem' }}>{t.levels}</p>
        </div>
      </section>

      <section className="q-section" aria-label={t.h1}>
        <div className="container-wide">
          <div className="primitive-grid">
            {cards.map((p, i) => (
              <Reveal key={p.key} delay={i * 80} className="primitive-card">
                <Link href={p.href} className="primitive-link">
                  <div className="primitive-head">
                    <span className={`chip chip-${p.statusKind}`}>{p.status}</span>
                    <h3>{p.localName}</h3>
                  </div>
                  <p className="primitive-one">{p.localBlurb}</p>
                  <p className="primitive-proof">
                    {p.level} · {p.proof}
                  </p>
                  <span className="card-cta">
                    <span>
                      {t.seeSystem}
                      {p.sharedEn ? <span className="shared-en-mark" dir="ltr"> ·EN</span> : null}
                    </span>
                    <span aria-hidden>→</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p className="q-honesty">{dict(l).home.honesty}</p>
          </Reveal>
          <Reveal>
            <div className="hero-actions">
              <Link href="/journey" className="btn">{t.journeyCta} <span className="arrow" aria-hidden>→</span></Link>
              <Link href="/profile" className="btn">{t.profileCta} <span className="arrow" aria-hidden>→</span></Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
