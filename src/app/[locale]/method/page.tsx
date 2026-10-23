import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { dict, isLocale } from '@/content/i18n';
import { socialMeta } from '@/lib/social';
import { Reveal } from '@/components/Reveal';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const t = dict(params.locale).meta.method;
  return {
    title: t.title,
    description: t.description,
    ...socialMeta({
      title: t.title,
      description: t.description,
      path: `/${params.locale}/method`,
      locale: params.locale === 'fa' ? 'fa' : 'en',
      languages: { en: '/en/method', fa: '/fa/method', 'x-default': '/en/method' },
    }),
  };
}

export default async function MethodPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const l = params.locale;
  const t = dict(l).method;

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
          <ol className="steps-list">
            {t.stages.map((s, i) => (
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
            <p className="q-founder-p">{t.close}</p>
          </Reveal>
          <Reveal>
            <div className="hero-actions" style={{ marginTop: '2.5rem' }}>
              <Link href={`/${l}/contact`} className="btn btn-primary">
                {t.cta} <span className="arrow" aria-hidden>→</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
