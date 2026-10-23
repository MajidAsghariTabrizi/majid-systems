import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { dict, isLocale } from '@/content/i18n';
import { socialMeta } from '@/lib/social';
import { Reveal } from '@/components/Reveal';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const t = dict(params.locale).meta.services;
  return {
    title: t.title,
    description: t.description,
    ...socialMeta({
      title: t.title,
      description: t.description,
      path: `/${params.locale}/services`,
      locale: params.locale === 'fa' ? 'fa' : 'en',
      languages: { en: '/en/services', fa: '/fa/services', 'x-default': '/en/services' },
    }),
  };
}

export default async function ServicesPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const l = params.locale;
  const t = dict(l).services;

  return (
    <>
      <section className="q-hero" style={{ minHeight: 'auto', paddingBottom: '2rem' }}>
        <div className="container-wide">
          <span className="eyebrow sig">{t.eyebrow}</span>
          <h1 className="q-display">{t.h1}</h1>
          <p className="q-hero-body" style={{ maxWidth: '62ch' }}>{t.lede}</p>
        </div>
      </section>

      <section className="q-section" aria-label={t.h1}>
        <div className="container-wide">
          {t.offers.map((o, i) => (
            <Reveal key={o.key} delay={i * 60} className="service-card">
              <div className="service-head">
                <span className="service-num">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h2 className="service-name">{o.name}</h2>
                  <p className="service-one">{o.oneLiner}</p>
                </div>
              </div>
              <dl className="service-facts">
                <div>
                  <dt>{t.whoFor}</dt>
                  <dd>{o.whoFor}</dd>
                </div>
                <div>
                  <dt>{t.symptoms}</dt>
                  <dd>{o.symptoms}</dd>
                </div>
                <div>
                  <dt>{t.deliverables}</dt>
                  <dd>{o.deliverables}</dd>
                </div>
                <div>
                  <dt>{t.notPromised}</dt>
                  <dd>{o.notPromised}</dd>
                </div>
                <div>
                  <dt>{t.process}</dt>
                  <dd>{o.process}</dd>
                </div>
              </dl>
              <div className="hero-actions">
                <Link href={`/${l}/contact?intent=${o.intent}`} className="btn btn-primary">
                  {t.cta} <span className="arrow" aria-hidden>→</span>
                </Link>
              </div>
            </Reveal>
          ))}
          <Reveal>
            <p className="q-honesty">{t.notPackaged}</p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
