import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { dict, isLocale } from '@/content/i18n';
import { socialMeta } from '@/lib/social';
import { Reveal } from '@/components/Reveal';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const t = dict(params.locale).meta.about;
  return {
    title: t.title,
    description: t.description,
    ...socialMeta({
      title: t.title,
      description: t.description,
      path: `/${params.locale}/about`,
      locale: params.locale === 'fa' ? 'fa' : 'en',
      languages: { en: '/en/about', fa: '/fa/about', 'x-default': '/en/about' },
    }),
  };
}

export default async function AboutPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const l = params.locale;
  const t = dict(l).about;

  return (
    <>
      <section className="q-hero" style={{ minHeight: 'auto', paddingBottom: '2rem' }}>
        <div className="container-wide">
          <span className="eyebrow sig">{t.eyebrow}</span>
          <h1 className="q-display">{t.h1}</h1>
        </div>
      </section>

      <section className="q-section" style={{ borderTop: 0 }}>
        <div className="container-narrow">
          {[t.p1, t.p2, t.p3].map((p) => (
            <Reveal key={p.slice(0, 24)}>
              <p className="q-founder-p">{p}</p>
            </Reveal>
          ))}
          <Reveal>
            <div className="hero-actions" style={{ marginTop: '2.5rem' }}>
              <Link href="/journey" className="btn btn-primary">{t.journeyCta} <span className="arrow" aria-hidden>→</span></Link>
              <Link href="/profile" className="btn">{t.profileCta} <span className="arrow" aria-hidden>→</span></Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
