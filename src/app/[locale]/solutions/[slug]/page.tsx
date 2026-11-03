import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CATEGORIES, getSolution, SOLUTIONS, SOLUTION_UI, STATUS_LABEL } from '@/content/solutions';
import { getArticleBySlug } from '@/content/insights';
import { socialMeta } from '@/lib/social';
import { isLocale, LOCALES, type Locale } from '@/content/i18n';
import { getSolutionDetail } from '@/content/solutions/detail-content';
import { SolutionVisual } from '@/components/solutions/SolutionVisual';

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
  // Content depth does not change commercial readiness. Keep discovery-only
  // engagements noindex until their publishing status is deliberately upgraded.
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
  const detail = getSolutionDetail(s);
  const requestHref = `/${locale}/solutions/${s.id}/request`;
  const t = l === 'fa' ? {
    home: 'خانه', catalog: 'راهکارها', overview: 'معرفی راهکار', workflow: 'فرایند اجرا',
    delivery: 'ورودی‌ها و خروجی‌ها', evaluation: 'سنجش نتیجه', questions: 'پرسش‌های متداول',
    overviewTitle: 'از مسئله روزمره تا یک مسیر کاری روشن',
    workflowTitle: 'این راهکار در عمل چگونه کار می‌کند؟',
    deliveryTitle: 'برای شروع چه لازم است و چه تحویل می‌گیرید؟',
    evaluationTitle: 'موفقیت را با چه معیارهایی می‌سنجیم؟',
    intended: 'هدف اجرای راهکار', fits: 'مناسب برای این تیم‌ها',
    example: 'یک موقعیت نمونه', exampleNote: 'این سناریو برای توضیح فرایند است و گزارش اجرای یک مشتری نیست.',
    context: 'وضعیت اولیه', action: 'مسیر پیشنهادی', result: 'خروجی قابل بررسی',
    steps: 'مسیر همکاری', inputs: 'ورودی‌های مورد نیاز', outputs: 'خروجی‌های پیشنهادی',
    boundary: 'دامنه و مسئولیت‌ها', measuresNote: 'مقدار مبنا، هدف و روش اندازه‌گیری پیش از اجرا با تیم شما توافق می‌شود. نتیجه به کیفیت داده و شرایط فرایند وابسته است.',
    brief: 'این راهکار در یک نگاه', category: 'حوزه کاربرد', status: 'شیوه همکاری',
    start: 'نقطه شروع', startValue: 'بررسی مسئله و نمونه داده', control: 'کنترل تصمیم',
    controlValue: 'بازبینی توسط مسئول مجاز شما', timing: 'زمان و هزینه', timingValue: 'پس از شناخت نیاز و توافق بر دامنه',
    briefNote: 'شرح کوتاهی از نیازتان کافی است. گام بعدی را پس از بررسی شرایط شما مشخص می‌کنیم.',
    related: 'مسیرهای مرتبط برای ادامه بررسی', research: 'مطالعه بیشتر درباره این رویکرد',
    researchType: 'مقاله و تحلیل', english: 'به زبان انگلیسی', next: 'این مسئله در سازمان شما هم وجود دارد؟',
    back: 'همه راهکارها', seeWorkflow: 'فرایند را ببینید', navigation: 'بخش‌های این راهکار',
  } : {
    home: 'Home', catalog: 'Solutions', overview: 'Overview', workflow: 'Workflow',
    delivery: 'Inputs & deliverables', evaluation: 'Success measures', questions: 'Questions',
    overviewTitle: 'Turn an everyday problem into a clear workflow',
    workflowTitle: 'How would this work in practice?',
    deliveryTitle: 'What do we start with, and what do you receive?',
    evaluationTitle: 'How will we evaluate the result?',
    intended: 'The intended outcome', fits: 'Teams this is designed for',
    example: 'An illustrative situation', exampleNote: 'This scenario explains a possible workflow; it is not a customer case study.',
    context: 'The starting point', action: 'The proposed workflow', result: 'An output to examine',
    steps: 'The engagement path', inputs: 'Inputs we discuss', outputs: 'Proposed deliverables',
    boundary: 'Scope and responsibilities', measuresNote: 'Your team agrees the baseline, target and measurement method before implementation. Results depend on data quality and the operating context.',
    brief: 'This solution at a glance', category: 'Business area', status: 'Engagement type',
    start: 'Starting point', startValue: 'A process review and representative data', control: 'Decision control',
    controlValue: 'Review by your authorized owner', timing: 'Timing and cost', timingValue: 'Agreed after discovery and scoping',
    briefNote: 'Start with a short description of your need. We define the next step after reviewing your context.',
    related: 'Related paths to explore', research: 'Read more about the approach',
    researchType: 'Research & analysis', english: 'In English', next: 'Does this problem sound familiar?',
    back: 'All solutions', seeWorkflow: 'Explore the workflow', navigation: 'On this page',
  };
  const faq = [...(s.flagship?.faq[l] ?? []), ...detail.faq[l]]
    .filter((item, i, all) => all.findIndex((other) => other.q === item.q) === i);
  const related = s.related.map(getSolution).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const articles = s.articles.flatMap((id) => {
    const slug = id.replace(/^\d+-/, '');
    const local = getArticleBySlug(slug, l);
    const article = local ?? getArticleBySlug(slug, 'en');
    return article ? [{ article, slug, articleLocale: local ? l : 'en' }] : [];
  });

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
    <div className="sol-detail-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="sol-section">
        <nav className="sol-breadcrumb" aria-label={l === 'fa' ? 'مسیر صفحه' : 'Breadcrumb'}>
          <Link href={`/${locale}`}>{t.home}</Link><span aria-hidden="true">/</span>
          <Link href={`/${locale}/solutions`}>{t.catalog}</Link><span aria-hidden="true">/</span>
          <span aria-current="page">{s.title[l]}</span>
        </nav>
        <header className="sol-detail-hero">
          <div className="sol-hero-copy">
            <div className="sol-meta-row">
              <span className="eyebrow">{cat?.label[l]}</span>
              <span className={`sol-badge ${s.status}`}>{st[l]}</span>
            </div>
            <h1>{s.title[l]}</h1>
            <p className="lede">{s.oneLiner[l]}</p>
            <div className="sol-hero-actions">
              <Link className="sol-button" href={requestHref}>{SOLUTION_UI.cta[l]}</Link>
              <a className="sol-text-link" href="#workflow">{t.seeWorkflow}<span aria-hidden="true">↓</span></a>
            </div>
            <p className="sol-hero-note">{st.hint[l]}</p>
          </div>
          <SolutionVisual locale={locale} category={s.category} />
        </header>
        <nav className="sol-section-nav" aria-label={t.navigation}>
          <a href="#overview">{t.overview}</a>
          <a href="#workflow">{t.workflow}</a>
          <a href="#delivery">{t.delivery}</a>
          <a href="#evaluation">{t.evaluation}</a>
          <a href="#questions">{t.questions}</a>
        </nav>

        <div className="sol-detail-layout">
          <div className="sol-detail-content">
            <section id="overview" className="sol-content-section" aria-labelledby="overview-title">
              <p className="eyebrow">{t.overview}</p>
              <h2 id="overview-title">{t.overviewTitle}</h2>
              <p className="body">{s.problem[l]}</p>
              <div className="sol-fit">
                <h3>{t.fits}</h3>
                <p>{s.buyer[l]}</p>
              </div>
              <h3>{SOLUTION_UI.capsLabel[l]}</h3>
              <ul className="sol-capability-grid">
                {s.capabilities[l].map((capability, i) => (
                  <li key={capability}><span className="sol-item-number" aria-hidden="true">{new Intl.NumberFormat(l).format(i + 1).padStart(l === 'fa' ? 1 : 2, '0')}</span><p>{capability}</p></li>
                ))}
              </ul>
              <div className="sol-outcome"><h3>{t.intended}</h3><p>{s.outcome[l]}</p></div>
            </section>

            <section id="workflow" className="sol-content-section" aria-labelledby="workflow-title">
              <p className="eyebrow">{t.workflow}</p>
              <h2 id="workflow-title">{t.workflowTitle}</h2>
              <div className="sol-scenario">
                <p className="eyebrow">{t.example}</p>
                <p className="sol-scenario-note">{t.exampleNote}</p>
                <div><h3>{t.context}</h3><p>{detail.scenario[l].context}</p></div>
                <div><h3>{t.action}</h3><p>{detail.scenario[l].workflow}</p></div>
                <div><h3>{t.result}</h3><p>{detail.scenario[l].result}</p></div>
              </div>
              {s.flagship && (
                <div className="sol-ba">
                  <div className="sol-ba-col">
                    <h3>{SOLUTION_UI.beforeLabel[l]}</h3>
                    <ul>{s.flagship.before[l].map((item) => <li key={item}>{item}</li>)}</ul>
                  </div>
                  <div className="sol-ba-col after">
                    <h3>{SOLUTION_UI.afterLabel[l]}</h3>
                    <ul>{s.flagship.after[l].map((item) => <li key={item}>{item}</li>)}</ul>
                  </div>
                </div>
              )}
              <h3>{t.steps}</h3>
              <ol className="sol-detail-stages">
                {detail.stages[l].map((stage, i) => <li key={stage.title}>
                  <span className="sol-item-number" aria-hidden="true">{new Intl.NumberFormat(l).format(i + 1)}</span>
                  <div><h3>{stage.title}</h3><p>{stage.body}</p></div>
                </li>)}
              </ol>
            </section>

            <section id="delivery" className="sol-content-section" aria-labelledby="delivery-title">
              <p className="eyebrow">{t.delivery}</p>
              <h2 id="delivery-title">{t.deliveryTitle}</h2>
              <div className="sol-delivery-grid">
                <div><h3>{t.inputs}</h3><ul>{detail.inputs[l].map((item) => <li key={item}>{item}</li>)}</ul>{s.flagship && <p className="sol-delivery-note">{s.flagship.inputs[l]}</p>}</div>
                <div><h3>{t.outputs}</h3><ul>{detail.deliverables[l].map((item) => <li key={item}>{item}</li>)}</ul>{s.flagship && <p className="sol-delivery-note">{s.flagship.deliverables[l]}</p>}</div>
              </div>
              <div className="sol-boundary"><h3>{t.boundary}</h3><p>{detail.boundary[l]}</p></div>
            </section>

            <section id="evaluation" className="sol-content-section" aria-labelledby="evaluation-title">
              <p className="eyebrow">{t.evaluation}</p>
              <h2 id="evaluation-title">{t.evaluationTitle}</h2>
              <ul className="sol-measures">{detail.measures[l].map((measure) => <li key={measure}><span aria-hidden="true">↗</span>{measure}</li>)}</ul>
              <p className="sol-measures-note">{t.measuresNote}</p>
            </section>

            <section id="questions" className="sol-content-section" aria-labelledby="questions-title">
              <p className="eyebrow">{t.questions}</p>
              <h2 id="questions-title">{SOLUTION_UI.faqLabel[l]}</h2>
              <div className="sol-faq">{faq.map((item) => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}</div>
            </section>
          </div>

          <aside className="sol-detail-aside" aria-labelledby="solution-summary-title">
            <div className="sol-summary-card">
              <p className="eyebrow">{cat?.label[l]}</p>
              <h2 id="solution-summary-title">{t.brief}</h2>
              <dl>
                <div><dt>{t.status}</dt><dd><span className={`sol-badge ${s.status}`}>{st[l]}</span></dd></div>
                <div><dt>{t.start}</dt><dd>{t.startValue}</dd></div>
                <div><dt>{t.control}</dt><dd>{t.controlValue}</dd></div>
                <div><dt>{t.timing}</dt><dd>{t.timingValue}</dd></div>
              </dl>
              <Link className="sol-button" href={requestHref}>{SOLUTION_UI.cta[l]}</Link>
              <p className="sol-summary-note">{t.briefNote}</p>
              <Link className="sol-text-link" href={`/${locale}/solutions`}>{t.back}<span aria-hidden="true">{l === 'fa' ? '←' : '→'}</span></Link>
            </div>
          </aside>
        </div>

        {related.length > 0 && <section className="sol-explore-section" aria-labelledby="related-title">
          <p className="eyebrow">{SOLUTION_UI.relatedLabel[l]}</p>
          <h2 id="related-title">{t.related}</h2>
          <div className="sol-explore-grid">{related.map((item) => <Link className="sol-resource-link" key={item.id} href={`/${locale}/solutions/${item.id}`}>
            <span className={`sol-badge ${item.status}`}>{STATUS_LABEL[item.status][l]}</span>
            <h3>{item.title[l]}</h3><p>{item.oneLiner[l]}</p><span className="sol-text-link">{SOLUTION_UI.viewDetails[l]}<span aria-hidden="true">{l === 'fa' ? '←' : '→'}</span></span>
          </Link>)}</div>
        </section>}

        {articles.length > 0 && <section className="sol-explore-section" aria-labelledby="research-title">
          <p className="eyebrow">{SOLUTION_UI.relatedInsightsLabel[l]}</p>
          <h2 id="research-title">{t.research}</h2>
          <div className="sol-explore-grid">{articles.map(({ article, slug, articleLocale }) => <Link className="sol-resource-link" key={slug} href={`/${articleLocale}/insights/${slug}`}>
            <span className="eyebrow">{t.researchType}{articleLocale !== l ? ` · ${t.english}` : ''}</span>
            <h3 lang={articleLocale}>{article.title}</h3><span className="sol-text-link">{l === 'fa' ? 'مطالعه مقاله' : 'Read article'}<span aria-hidden="true">{l === 'fa' ? '←' : '→'}</span></span>
          </Link>)}</div>
        </section>}

        <section className="sol-request-panel" aria-labelledby="request-title">
          <div><p className="eyebrow">{l === 'fa' ? 'گام بعدی' : 'The next step'}</p><h2 id="request-title">{t.next}</h2><p>{SOLUTION_UI.requestNote[l]}</p></div>
          <Link className="sol-button" href={requestHref}>{SOLUTION_UI.cta[l]}</Link>
        </section>
      </div>
    </div>
  );
}
