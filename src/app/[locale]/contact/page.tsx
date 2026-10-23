import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { dict, isLocale, type Locale } from '@/content/i18n';
import { socialMeta } from '@/lib/social';
import { LeadForm } from '@/components/LeadForm';
import { SITE } from '@/content/shared';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const t = dict(params.locale).meta.contact;
  return {
    title: t.title,
    description: t.description,
    ...socialMeta({
      title: t.title,
      description: t.description,
      path: `/${params.locale}/contact`,
      locale: params.locale === 'fa' ? 'fa' : 'en',
      languages: { en: '/en/contact', fa: '/fa/contact', 'x-default': '/en/contact' },
    }),
  };
}

export default async function ContactPage({
  params,
}: {
  params: { locale: string };
  searchParams?: { intent?: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const l = params.locale as Locale;
  const t = dict(l).contact;

  return (
    <>
      <section className="q-hero" style={{ minHeight: 'auto', paddingBottom: '2rem' }}>
        <div className="container-narrow">
          <span className="eyebrow sig">{t.eyebrow}</span>
          <h1 className="q-display">{t.h1}</h1>
          <p className="q-hero-body" style={{ maxWidth: '62ch' }}>{t.lede}</p>
        </div>
      </section>

      <section className="q-section" style={{ borderTop: 0 }}>
        <div className="container-narrow">
          <Suspense fallback={null}>
            <LeadForm locale={l} />
          </Suspense>
          <div className="lead-direct" style={{ marginTop: '2.5rem' }}>
            <span className="eyebrow">{t.direct}</span>
            <p className="q-founder-p">
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              {' · '}
              <a href={SITE.linkedinUrl} rel="me noopener" target="_blank">LinkedIn</a>
              {' · '}
              <a href={SITE.githubUrl} rel="me noopener" target="_blank">GitHub</a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
