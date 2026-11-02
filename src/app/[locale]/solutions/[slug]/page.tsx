import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CATEGORIES, getSolution, SOLUTIONS, SOLUTION_UI, STATUS_LABEL } from '@/content/solutions';
import { getArticleBySlug } from '@/content/insights';
import { socialMeta } from '@/lib/social';
import { isLocale, LOCALES, type Locale } from '@/content/i18n';

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => SOLUTIONS.map((s) => ({ locale, slug: s.id })));
}

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const s = getSolution(params.slug);
  if (!s) return {};
  const l = params.locale === 'fa' ? 'fa' : 'en';
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://quantiviq.xyz';
  // Flagship pages carry substantive unique content -> indexable.
  // Scoping pages are honest stubs pending depth -> noindex until upgraded.
  const robots = s.status === 'flagship' ? { index: true, follow: true } : { index: false, follow: true };
  // Truthful sharing metadata for THIS route (closure 2026-11-02): previously
  // these pages inherited the homepage OG title/description/url.
  const social = socialMeta({
    title: `${s.title[l]} — ${l === 'fa' ? 'راهکارهای کوانتی‌ویک' : 'Quantiviq Solutions'}`,
    description: s.oneLiner[l],
    path: `/${params.locale}/solutions/${s.id}`,
    locale: l,
    languages: { en: `${base}/en/solutions/${s.id}`, fa: `${base}/fa/solutions/${s.id}` },
  });
  return {
    title: s.title[l],
    description: s.oneLiner[l],
    ...social,
    robots,
  };
}

export default async function SolutionDetailPage({ params }: { params: { locale: string; slug: string } }) {
  if (!isLocale(params.locale)) notFound();
  const s = getSolution(params.slug);
  if (!s) notFound();
  const locale = params.locale as Locale;
  const l = locale === 'fa' ? 'fa' : 'en';
  const cat = CATEGORIES.find((c) => c.key === s.category);
  const st = STATUS_LABEL[s.status];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.title.en,
    description: s.oneLiner.en,
    provider: { '@type': 'Organization', name: 'Quantiviq', url: 'https://quantiviq.xyz' },
    areaServed: 'Worldwide',
    serviceType: 'AI-enabled business workflow implementation',
    inLanguage: ['en', 'fa'],
  };

  return (
    <div className="sol-section sol-detail">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="eyebrow">{cat ? cat.label[l] : ''} · {st[l]}</p>
      <h1>{s.title[l]}</h1>
      <p className="one">{s.oneLiner[l]}</p>
      <div className="sol-meta-row">
        <span className={`sol-badge ${s.status}`}>{st[l]}</span>
        <span className="sol-badge scoping">{st.hint[l]}</span>
      </div>

      <div className="sol-section-h">{SOLUTION_UI.problemLabel[l]}</div>
      <p className="body">{s.problem[l]}</p>
      <div className="sol-section-h">{SOLUTION_UI.buyerLabel[l]}</div>
      <p className="body">{s.buyer[l]}</p>
      <div className="sol-section-h">{SOLUTION_UI.capsLabel[l]}</div>
      <ul className="sol-caps">
        {s.capabilities[l].map((c) => <li key={c}>{c}</li>)}
      </ul>
      <div className="sol-section-h">{SOLUTION_UI.outcomeLabel[l]}</div>
      <div className="sol-outcome">{s.outcome[l]}</div>

      {s.flagship ? (
        <>
          <div className="sol-section-h">{SOLUTION_UI.beforeLabel[l]}</div>
          <div className="sol-ba">
            <div className="sol-ba-col">
              <h4>{SOLUTION_UI.beforeLabel[l]}</h4>
              <ul>{s.flagship.before[l].map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
            <div className="sol-ba-col after">
              <h4>{SOLUTION_UI.afterLabel[l]}</h4>
              <ul>{s.flagship.after[l].map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
          </div>
          <div className="sol-section-h">{SOLUTION_UI.inputsLabel[l]}</div>
          <p className="body">{s.flagship.inputs[l]}</p>
          <div className="sol-section-h">{SOLUTION_UI.deliverablesLabel[l]}</div>
          <p className="body">{s.flagship.deliverables[l]}</p>
          <div className="sol-section-h">{SOLUTION_UI.faqLabel[l]}</div>
          <div className="sol-faq">
            {s.flagship.faq[l].map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </>
      ) : null}

      {s.related.length > 0 ? (
        <>
          <div className="sol-section-h">{SOLUTION_UI.relatedLabel[l]}</div>
          <div className="sol-related">
            {s.related.filter((r) => getSolution(r)).map((r) => (
              <Link key={r} href={`/${locale}/solutions/${r}`}>{getSolution(r)!.title[l]}</Link>
            ))}
          </div>
        </>
      ) : null}
      {s.articles.length > 0 ? (
        <>
          <div className="sol-section-h">{SOLUTION_UI.relatedInsightsLabel[l]}</div>
          <div className="sol-related">
            {s.articles.map((a) => {
              // Resolve the REAL localized article title from the registry —
              // never render the filename as a label.
              const slug = a.replace(/^\d+-/, '');
              const art = getArticleBySlug(slug, l) ?? getArticleBySlug(slug, 'en');
              return (
                <Link key={a} href={`/${locale}/insights/${slug}`}>
                  {art ? art.title : slug.replace(/-/g, ' ')}
                </Link>
              );
            })}
          </div>
        </>
      ) : null}

      <div className="sol-request-panel">
        <h2>{SOLUTION_UI.cta[l]}</h2>
        <p>{SOLUTION_UI.requestNote[l]}</p>
        <Link className="btn" href={`/${locale}/solutions/${s.id}/request`}>
          {SOLUTION_UI.cta[l]}
        </Link>
      </div>
    </div>
  );
}
