import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { dict, isLocale } from '@/content/i18n';
import { socialMeta } from '@/lib/social';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const t = dict(params.locale).meta.privacy;
  return {
    title: t.title,
    description: t.description,
    ...socialMeta({
      title: t.title,
      description: t.description,
      path: `/${params.locale}/privacy`,
      locale: params.locale === 'fa' ? 'fa' : 'en',
      languages: { en: '/en/privacy', fa: '/fa/privacy', 'x-default': '/en/privacy' },
    }),
    robots: { index: true, follow: true },
  };
}

export default async function PrivacyPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const l = params.locale;
  const t = dict(l).privacy;

  const sections = [
    { h: t.collectedTitle, b: t.collectedBody },
    { h: t.whyTitle, b: t.whyBody },
    { h: t.howLongTitle, b: t.howLongBody },
    { h: t.rightsTitle, b: t.rightsBody },
    { h: t.securityTitle, b: t.securityBody },
{ h: t.measurementTitle, b: t.measurementBody },
  ];

  return (
    <>
      <section className="q-hero" style={{ minHeight: 'auto', paddingBottom: '2rem' }}>
        <div className="container-narrow">
          <span className="eyebrow sig">{t.eyebrow}</span>
          <h1 className="q-display">{t.h1}</h1>
          <p className="q-hero-body" style={{ maxWidth: '62ch' }}>{t.intro}</p>
        </div>
      </section>
      <section className="q-section" style={{ borderTop: 0 }}>
        <div className="container-narrow">
          {sections.map((s) => (
            <div key={s.h} style={{ marginBottom: '2rem' }}>
              <h2 className="q-h2">{s.h}</h2>
              <p className="q-founder-p">{s.b}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
