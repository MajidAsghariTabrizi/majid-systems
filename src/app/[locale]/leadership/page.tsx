import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { dict, isLocale } from '@/content/i18n';
import { socialMeta } from '@/lib/social';
import { JOURNEY_LAYERS, JOURNEY_NODES } from '@/content/journey';
import { Reveal } from '@/components/Reveal';

const CAREER_FA: Record<string, string> = {
  'n-tech': 'نرم‌افزار چگونه کار می‌کند و در محیط عملیاتی پایدار می‌ماند؟',
  'n-product': 'محصول برای چه کسی و چگونه ارزش ایجاد می‌کند؟',
  'n-org': 'تیم‌ها چگونه محصول می‌سازند؛ نقش ساختار پیرامون کد چیست؟',
  'n-market': 'سازمان چگونه کار می‌کند و اثر هر تصمیم چگونه گسترش می‌یابد؟',
  'n-markets': 'سیستم‌های پیچیده در شرایط عدم‌قطعیت چگونه تصمیم می‌گیرند؟',
  'n-ai': 'هوش به زیرساخت تبدیل شد؛ با مسیریابی، ارزیابی و بودجه مشخص.',
  'n-agents': 'از مدل تا عامل اجرایی؛ با کنترل، بازیابی پس از خطا و راستی‌آزمایی.',
  'n-learning': 'چگونه سیستم می‌تواند تجربه را نگه دارد و هر بار از صفر شروع نکند؟',
  'n-quantiviq': 'مدل عملیاتی بومی هوش مصنوعی؛ نقطه پیوند همه لایه‌ها.',
};
const CAREER_LAYER_FA: Record<string, string> = {
  tech: 'فناوری', product: 'محصول', org: 'سازمان', market: 'سیستم‌های بازارگاهی',
  markets: 'سیستم‌های تصمیم', ai: 'زیرساخت هوش مصنوعی', agents: 'محیط اجرای عامل', learning: 'سیستم‌های یادگیری',
};

/**
 * Leadership pathway — the executive/hiring entry point.
 * Every claim here reuses facts already published elsewhere on the site
 * (resume, journey, laboratory, open-source) with its evidence class kept
 * explicit. No client outcomes are claimed; the case structure is shown as
 * a template, deliberately without numbers.
 */
export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const t = dict(params.locale).meta.leadership;
  return {
    title: t.title,
    description: t.description,
    ...socialMeta({
      title: t.title,
      description: t.description,
      path: `/${params.locale}/leadership`,
      locale: params.locale === 'fa' ? 'fa' : 'en',
      languages: { en: '/en/leadership', fa: '/fa/leadership', 'x-default': '/en/leadership' },
    }),
  };
}

export default async function LeadershipPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const l = params.locale;
  const t = dict(l);
  const z = t.leadership;

  const hrefFor = (h: string) => (h.startsWith('/') ? h : `/${l}/${h.replace(/^\//, '')}`);

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="q-hero" style={{ minHeight: 'auto', paddingBottom: '2.5rem' }} aria-label={z.h1}>
        <div className="container-wide">
          <span className="eyebrow sig">{z.eyebrow}</span>
          <h1 className="q-display leadership-display">{z.h1}</h1>
          <p className="q-hero-sub" style={{ maxWidth: '58ch' }}>{z.sub}</p>
          <p className="q-hero-body" style={{ maxWidth: '68ch' }}>{z.body}</p>
          <div className="hero-actions" style={{ marginTop: '1.5rem' }}>
            <Link href={`/${l}/contact?intent=hiring`} className="btn btn-primary">
              {z.ctaPrimary} <span className="arrow" aria-hidden>→</span>
            </Link>
            <Link href={`/${l}/mind`} className="btn">
              {l === 'fa' ? 'گفت‌وگو با دستیار هوش مصنوعی مجید' : 'Ask Majid’s AI Mind'} <span className="arrow" aria-hidden>→</span>
            </Link>
            <Link href="/resume" className="btn">
              {z.ctaSecondary} <span className="arrow" aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== PROBLEMS I LEAD ===== */}
      <section className="q-section" id="problems" aria-label={z.problems.h2}>
        <div className="container-wide">
          <Reveal>
            <div className="section-header">
              <div>
                <span className="eyebrow sig">{z.problems.eyebrow}</span>
                <h2 className="q-h2">{z.problems.h2}</h2>
              </div>
            </div>
            <p className="q-lede">{z.problems.lede}</p>
          </Reveal>
          <ul className="leadership-cards">
            {z.problems.cards.map((c, i) => (
              <Reveal as="li" key={c.title} delay={i * 90} className="leadership-card">
                <h3 className="leadership-card-h">{c.title}</h3>
                <p>{c.body}</p>
                <p className="leadership-card-scope">{c.scope}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== EVIDENCE, CLASSIFIED ===== */}
      <section className="q-section" id="evidence" aria-label={z.evidence.h2}>
        <div className="container-wide">
          <Reveal>
            <div className="section-header">
              <div>
                <span className="eyebrow sig">{z.evidence.eyebrow}</span>
                <h2 className="q-h2">{z.evidence.h2}</h2>
              </div>
            </div>
            <p className="q-lede">{z.evidence.lede}</p>
          </Reveal>
          <ul className="leadership-evidence">
            {z.evidence.rows.map((r) => (
              <li key={r.label} className="leadership-evidence-row">
                <div className="leadership-evidence-main">
                  <div className="leadership-evidence-head">
                    <span className={`leadership-chip chip-${r.chipKind}`}>{r.chip}</span>
                    <h3 className="leadership-evidence-label">{r.label}</h3>
                  </div>
                  <p>{r.body}</p>
                  <Link href={hrefFor(r.href)} className="leadership-evidence-link">
                    {r.linkLabel}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== CAREER AT A GLANCE ===== */}
      <section className="q-section" id="career" aria-label={z.career.h2}>
        <div className="container-wide">
          <Reveal>
            <div className="section-header">
              <div>
                <span className="eyebrow sig">{z.career.eyebrow}</span>
                <h2 className="q-h2">{z.career.h2}</h2>
              </div>
            </div>
            <p className="q-lede">{z.career.lede}</p>
          </Reveal>
          <ol className="leadership-layers">
            {JOURNEY_NODES.map((n) => (
              <li key={n.id} className="leadership-layer">
                <span className="leadership-layer-era">{l === 'fa' && n.era === 'NOW' ? 'اکنون' : n.era}</span>
                <span className="leadership-layer-name">{l === 'fa' ? CAREER_LAYER_FA[n.layer] : JOURNEY_LAYERS[n.layer].label}</span>
                <span className="leadership-layer-thesis">{l === 'fa' ? CAREER_FA[n.id] : n.thesis}</span>
              </li>
            ))}
          </ol>
          <div className="hero-actions" style={{ marginTop: '1.5rem' }}>
            <Link href="/journey" className="btn">{z.career.journeyLink}</Link>
            <Link href="/resume" className="btn">{z.career.resumeLink}</Link>
          </div>
        </div>
      </section>

      {/* ===== CASE TEMPLATE ===== */}
      <section className="q-section" id="cases" aria-label={z.cases.h2}>
        <div className="container-narrow">
          <Reveal>
            <div className="section-header">
              <div>
                <span className="eyebrow sig">{z.cases.eyebrow}</span>
                <h2 className="q-h2">{z.cases.h2}</h2>
              </div>
            </div>
            <p className="q-lede">{z.cases.lede}</p>
          </Reveal>
          <div className="leadership-case">
            <div className="leadership-case-head">
              <span className="leadership-chip chip-warn">{l === 'fa' ? 'نمونه توضیحی' : 'ILLUSTRATIVE'}</span>
              <span className="leadership-case-title">{z.cases.cardTitle}</span>
            </div>
            <ol className="leadership-case-structure">
              {z.cases.structure.map((s, i) => (
                <li key={s}>
                  <span className="leadership-case-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="leadership-case-label">{s}</span>
                  <span className="leadership-case-slot" aria-hidden />
                </li>
              ))}
            </ol>
            <p className="leadership-case-note">{z.cases.note}</p>
          </div>
        </div>
      </section>

      {/* ===== HIRING CONTACT ===== */}
      <section className="q-final" aria-label={z.contactBlock.h2}>
        <div className="container-narrow">
          <Reveal>
            <h2 className="q-display q-final-h2">{z.contactBlock.h2}</h2>
            <p className="q-lede">{z.contactBlock.body}</p>
            <div className="leadership-contact">
              <a className="leadership-contact-mail" href="mailto:majid@quantiviq.xyz">{z.contactBlock.email}</a>
              <a className="btn" href="https://www.linkedin.com/in/majid-asghari" target="_blank" rel="noopener noreferrer">
                {z.contactBlock.linkedin} <span className="arrow" aria-hidden>↗</span>
              </a>
            </div>
            <p className="leadership-consulting">
              <Link href={`/${l}/services`}>{z.contactBlock.consulting}</Link>
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
