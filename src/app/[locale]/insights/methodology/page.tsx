import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { isLocale } from '@/content/i18n';
import { socialMeta } from '@/lib/social';
import { INSIGHTS_STATS, SOURCES } from '@/content/insights';
import { INSIGHTS_UI } from '@/content/insights/ui';
import { SITE } from '@/content/shared';

type Params = { locale: string };

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const l = params.locale;
  if (!isLocale(l)) return {};
  const title = 'Editorial Methodology — Quantiviq Insights';
  const description =
    'How Quantiviq Research sources, verifies, drafts and reviews its analysis: primary-source policy, citation standards, AI-assistance disclosure, and how we label synthetic examples.';
  return {
    title,
    description,
    alternates: {
      canonical: `/${l}/insights/methodology`,
      languages: { en: '/en/insights/methodology', fa: '/fa/insights/methodology', 'x-default': '/en/insights/methodology' },
      types: { 'application/rss+xml': `${SITE.canonicalUrl}/insights.xml` },
    },
    ...socialMeta({
      title,
      description,
      path: `/${l}/insights/methodology`,
      locale: l === 'fa' ? 'fa' : 'en',
      languages: { en: '/en/insights/methodology', fa: '/fa/insights/methodology', 'x-default': '/en/insights/methodology' },
    }),
  };
}

export default async function MethodologyPage({ params }: { params: Params }) {
  const l = params.locale;
  if (!isLocale(l)) notFound();
  if (l === 'fa') {
    // Persian methodology summary; full policy is the English canonical.
    const t = INSIGHTS_UI.fa;
    return (
      <section className="q-section">
        <div className="container-narrow">
          <span className="eyebrow sig">{t.eyebrow}</span>
          <h1 className="q-display">{t.methodologyTitle}</h1>
          <p className="q-lede">{t.aiDisclosure}</p>
          <p className="q-founder-p">
            متن کامل سیاست سردبیری — شامل اصول انتخاب منابع، استاندارد استناد، افشای کمک هوش مصنوعی و برچسب‌گذاری نمونه‌های
            شبیه‌سازی‌شده — در نسخهٔ انگلیسی منتشر شده است.
          </p>
          <div className="hero-actions">
            <Link href="/en/insights/methodology" hrefLang="en" className="btn btn-primary">
              Full methodology (EN) <span className="arrow" aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const sources = Object.values(SOURCES);

  return (
    <>
      <section className="ins-hero-section">
        <div className="container-narrow">
          <nav className="ins-breadcrumb" aria-label="Breadcrumb">
            <ol>
              <li><Link href="/en">Home</Link></li>
              <li><Link href="/en/insights">Insights</Link></li>
              <li aria-current="page">Methodology</li>
            </ol>
          </nav>
          <span className="eyebrow sig">Quantiviq Research</span>
          <h1 className="q-display">Editorial Methodology</h1>
          <p className="ins-subtitle">How this publication earns executive trust.</p>
          <p className="q-lede">
            Quantiviq Insights exists to give executives analysis they can act on. That means every number traces to a
            source, every framework is original synthesis, and every limitation is stated. This page documents how.
          </p>
        </div>
      </section>

      <section className="q-section">
        <div className="container-narrow ins-prose ins-prose-page">
          <h2>What we publish</h2>
          <p>
            {INSIGHTS_STATS.articles} original English articles across five pillars — strategy, economics, AI-native
            operating models, trust and governance, and applied industry analysis. Each article answers one executive
            decision question, states its thesis in the opening paragraphs, provides a usable framework, and closes with
            concrete next actions. We do not publish opinion without evidence, and we do not publish evidence without
            attribution.
          </p>

          <h2>Source policy</h2>
          <p>
            Every external claim is anchored to a primary source: research institutions (McKinsey, BCG, Gartner,
            Deloitte, MIT, NBER, METR), standards bodies (NIST, EU regulation), or peer-reviewed journals. We record the
            source, publisher, publication date, URL, access date, methodology notes and limitations in a structured
            ledger — {sources.length} sources at present. When we rely on secondary coverage of primary research (for
            example, trade-press reporting of a consultancy survey), we say so explicitly in the reference entry, and we
            treat those figures as directional rather than exact.
          </p>
          <p>We never:</p>
          <ul>
            <li>invent source titles, URLs, dates, numbers or quotes;</li>
            <li>reprint third-party charts, illustrations or long excerpts;</li>
            <li>imply affiliation with or endorsement by any research institution;</li>
            <li>present forecasts as observed results.</li>
          </ul>

          <h2>Citation standard</h2>
          <p>
            Inline citations link to the reference list at the end of each article; every reference carries the original
            link and the date we last verified it. Quantitative claims include the context an executive needs: year,
            surveyed population or sample, and whether the finding is observational, experimental or a forecast.
          </p>

          <h2>Original synthesis and examples</h2>
          <p>
            Frameworks, diagrams and financial models in these articles are original Quantiviq work — built to be
            applied, not admired. Where an article uses a worked scenario with invented numbers (for example, a retailer
            recovering lost revenue), the scenario is labeled prominently as an <strong>illustrative synthetic
            scenario</strong> with stated assumptions. We do not present synthetic examples as client case studies, and
            we make no claims of unnamed-client outcomes.
          </p>

          <h2>AI assistance disclosure</h2>
          <p>
            Articles are research-led and AI-assisted: the research ledger, article structure, analytical arguments and
            verification standards are set by the editorial process, with AI tooling used for drafting and iteration
            under human editorial control. Before publication, every article is checked against the source ledger
            (claims trace to cited sources), schema-validated, and reviewed for structure, tone and technical accuracy.
            This is disclosed rather than hidden because it is how serious analysis is produced in 2026 — and because
            the standard that matters is verifiability, not typing speed.
          </p>

          <h2>Corrections and updates</h2>
          <p>
            Articles carry <code>published</code> and <code>updated</code> dates. Substantive changes update the date
            and are reflected in the sitemap and RSS feed; typographical fixes do not reset the published date.
            Corrections of substance are made in place with the updated date — we do not silently rewrite history.
          </p>

          <h2>Reading the ledger</h2>
          <p>
            The full source ledger is maintained alongside the articles ({sources.length} sources at publication). For
            each article, the reference list is the article-facing view of that ledger — the same source IDs, dates and
            limitations. If a claim cannot be verified, it does not ship.
          </p>
        </div>
      </section>

      <section className="q-section ins-method-note">
        <div className="container-narrow">
          <h2 className="q-h2">Read the research</h2>
          <div className="hero-actions">
            <Link href="/en/insights" className="btn btn-primary">
              All analysis <span className="arrow" aria-hidden>→</span>
            </Link>
            <Link href="/en/insights/author" className="btn">
              About Quantiviq Research <span className="arrow" aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
