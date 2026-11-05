import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { dict, isLocale } from '@/content/i18n';
import { SITE } from '@/content/shared';
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
            <div className="founder-identity" data-founder="majid-asghari-tabrizi">
              <p className="founder-name">
                {SITE.fullName} <span aria-hidden="true">·</span> {SITE.fullNameFa}
              </p>
              <p className="founder-title">{t.founderTitle}</p>
              <a
                className="founder-linkedin"
                href={SITE.linkedinUrl}
                rel="me noopener"
                target="_blank"
              >
                {t.founderLinkedIn} <span aria-hidden="true">↗</span>
              </a>
            </div>
          </Reveal>
          <Reveal>
            <div style={{ marginTop: '2.5rem' }}>
              <h2 className="q-h2">{l === 'fa' ? 'از ایده تا مسئلهٔ شما' : 'Find a practical next step'}</h2>
              <p className="q-founder-p">{l === 'fa'
                ? 'دربارهٔ آثار منتشرشده از دستیار هوش مصنوعی بپرسید، یا راهکار مرتبط با کار تیم‌تان را پیدا کنید.'
                : 'Ask the AI about the published work, or find a solution relevant to your team.'}</p>
              <div className="hero-actions">
                <Link href={`/${l}/mind`} className="btn btn-primary">{l === 'fa' ? 'از دستیار هوش مصنوعی بپرسید' : 'Ask Quantiviq Mind'} <span className="arrow" aria-hidden>→</span></Link>
                <Link href={`/${l}/solutions/find`} className="btn">{l === 'fa' ? 'راهکار مناسب را پیدا کنید' : 'Find your solution'} <span className="arrow" aria-hidden>→</span></Link>
              </div>
              <div className="hero-actions" style={{ marginTop: '1rem' }}>
                <Link href="/journey" className="founder-linkedin">{t.journeyCta} {l === 'fa' ? <span className="shared-en-mark" lang="en" dir="ltr">EN</span> : null}</Link>
                <Link href="/profile" className="founder-linkedin">{t.profileCta} {l === 'fa' ? <span className="shared-en-mark" lang="en" dir="ltr">EN</span> : null}</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
