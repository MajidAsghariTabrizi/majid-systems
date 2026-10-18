import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { dict, isLocale } from '@/content/i18n';
import { OrgNervousSystem } from '@/components/OrgNervousSystem';
import { BrainDemo } from '@/components/BrainDemo';
import { SystemFlow } from '@/components/LearningLoop';
import { Reveal } from '@/components/Reveal';

const KEYS = ['governance', 'authority', 'control-plane', 'workflows', 'agents', 'brain', 'data', 'tools'];

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const t = dict(params.locale).meta.system;
  return {
    title: t.title,
    description: t.description,
    alternates: { canonical: `/${params.locale}/system`, languages: { en: '/en/system', fa: '/fa/system', 'x-default': '/en/system' } },
  };
}

export default async function SystemPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const l = params.locale;
  const t = dict(l);
  const s = t.system;

  return (
    <>
      <section className="q-hero" style={{ minHeight: 'auto', paddingBottom: '2rem' }}>
        <div className="container-wide">
          <span className="eyebrow sig">{s.eyebrow}</span>
          <h1 className="q-display">{s.h1}</h1>
          <p className="q-hero-body" style={{ maxWidth: '62ch' }}>{s.lede}</p>
        </div>
      </section>

      <section className="q-section" aria-label={s.h1}>
        <div className="container-wide">
          <Reveal>
            <OrgNervousSystem
              layers={s.osLayers.map((ly, i) => ({ key: KEYS[i], num: ly.num, name: ly.name, role: ly.role, detail: ly.detail }))}
            />
          </Reveal>
          <Reveal>
            <ol className="os-index">
              {s.osLayers.map((ly) => (
                <li key={ly.num}>
                  <span className="os-index-num">{ly.num}</span>
                  <span className="os-index-name">{ly.name}</span>
                  <span className="os-index-role">{ly.role}</span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <section className="q-section" aria-label={s.flowH2}>
        <div className="container-wide">
          <Reveal>
            <div className="section-header">
              <div>
                <span className="eyebrow sig">{s.flowEyebrow}</span>
                <h2 className="q-h2">{s.flowH2}</h2>
              </div>
            </div>
            <p className="q-lede">{s.flowLede}</p>
          </Reveal>
          <Reveal>
            <SystemFlow steps={t.home.flow} />
          </Reveal>
          <Reveal>
            <p className="q-punch">{s.principle}</p>
          </Reveal>
        </div>
      </section>

      <section className="q-section" aria-label={s.demoH2}>
        <div className="container-wide">
          <Reveal>
            <div className="section-header">
              <div>
                <span className="eyebrow sig">{s.demoEyebrow}</span>
                <h2 className="q-h2">{s.demoH2}</h2>
              </div>
              <span className="section-num sim-disclaimer">{t.home.simCaption}</span>
            </div>
          </Reveal>
          <Reveal>
            <BrainDemo locale={l} />
          </Reveal>
          <Reveal>
            <p className="q-punch">{s.demoCaption}</p>
          </Reveal>
          <Reveal>
            <div className="hero-actions">
              <Link href={`/${l}/contact`} className="btn btn-primary">
                {t.nav.cta} <span className="arrow" aria-hidden>→</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
