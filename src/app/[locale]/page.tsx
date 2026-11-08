import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { dict, isLocale } from '@/content/i18n';
import { socialMeta } from '@/lib/social';
import { proofStatusLabel } from '@/lib/proof-display';
import { DecisionAtlas } from '@/components/DecisionAtlas';
import { HomeStartGuide } from '@/components/HomeStartGuide';
import { FeaturedSolutions } from '@/components/solutions/FeaturedSolutions';
import '../home-guide.css';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const l = params.locale;
  const t = dict(l).meta.home;
  return {
    title: t.title,
    description: t.description,
    ...socialMeta({
      title: t.title,
      description: t.description,
      path: `/${l}`,
      locale: l === 'fa' ? 'fa' : 'en',
      languages: { en: '/en', fa: '/fa', 'x-default': '/en' },
    }),
  };
}

export default async function LocaleHome({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const l = params.locale;
  const fa = l === 'fa';
  const t = dict(l);
  const h = t.home;
  const arrow = fa ? '←' : '→';
  const number = (i: number) => new Intl.NumberFormat(l, { minimumIntegerDigits: 2 }).format(i);
  const groups = [t.home2.groups.knowledge, t.home2.groups.execution, t.home2.groups.authority];

  return (
    <div className="signature-home">
      <section className="signature-hero" aria-labelledby="home-title">
        <div className="container-wide signature-hero-grid">
          <div className="signature-hero-copy">
            <span className="eyebrow sig">{t.hero.tag}</span>
            <h1 id="home-title">{t.hero.h1}</h1>
            <p className="signature-intro">{t.hero.sub}</p>
            <p className="signature-body">{t.hero.bodyP1}</p>
            <div className="hero-actions">
              <Link href={`/${l}/solutions/find`} className="btn btn-primary">
                {fa ? 'راهکار مناسب من' : 'Find my starting point'}
                <span aria-hidden="true">{arrow}</span>
              </Link>
              <Link href={`/${l}/proof`} className="signature-text-link">
                {fa ? 'شواهد را بررسی کنید' : 'Inspect the evidence'}
                <span aria-hidden="true">{arrow}</span>
              </Link>
            </div>
            <div className="signature-byline">
              <span className="signature-monogram" aria-hidden="true">
                M / A
              </span>
              <div>
                <Link href={`/${l}/about`}>
                  {fa ? 'مجید اصغری تبریزی' : 'Majid Asghari Tabrizi'}
                </Link>
                <p>
                  {fa
                    ? 'از طراحی محصول تا ساخت سیستم و تغییر شیوه کار سازمان'
                    : 'Product judgment. Systems engineering. Organizational change.'}
                </p>
              </div>
            </div>
          </div>
          <DecisionAtlas locale={l} />
        </div>
        <div className="container-wide signature-index">
          <span>
            {fa ? 'یک منطق، از پرسش تا نتیجه' : 'ONE LOGIC, FROM QUESTION TO OUTCOME'}
          </span>
          <a href="#start-here">{fa ? 'مسیرتان را انتخاب کنید' : 'Choose your path'} ↓</a>
          <a href="#proof">{fa ? 'پشتوانه این رویکرد' : 'The work behind it'} ↓</a>
        </div>
      </section>

      <HomeStartGuide locale={l} />
      <FeaturedSolutions locale={l} />

      <section id="proof" className="signature-proof q-section" aria-labelledby="proof-title">
        <div className="container-wide">
          <div className="signature-section-head">
            <span className="eyebrow">
              {fa ? 'ایده را با کار بسنجید' : 'JUDGE THE IDEA BY THE WORK'}
            </span>
            <h2 id="proof-title">
              {fa ? 'آنچه ساخته‌ام؛ آنچه آموخته‌ام.' : 'Built, questioned, learned from.'}
            </h2>
            <p>
              {fa
                ? 'از حافظه سازمانی و زیرساخت عامل‌ها تا تجربه‌هایی که به توقف رسیدند. وضعیت هر سیستم و پشتوانه ادعا را جداگانه ببینید.'
                : 'Organizational memory, agent infrastructure, and experiments that reached a deliberate stop. Inspect each system’s status and the evidence behind it.'}
            </p>
          </div>
          <div className="signature-evidence-list">
            {t.proof.items.map((p, i) => (
              <Link href={`/${l}/proof`} className="signature-evidence-row" key={p.name}>
                <span className="signature-row-num" aria-hidden="true">
                  {number(i + 1)}
                </span>
                <div>
                  <h3>{p.name}</h3>
                  <p>{p.blurb}</p>
                </div>
                <span className="signature-status" data-status={p.status}>
                  {proofStatusLabel(p.status, l)}
                </span>
                <span className="signature-row-arrow" aria-hidden="true">
                  {arrow}
                </span>
              </Link>
            ))}
          </div>
          <p className="signature-evidence-note">
            {fa
              ? 'در صفحه شواهد، کار عمومی قابل بررسی، روایت صاحب پروژه و مدل نمایشی از هم مشخص شده‌اند.'
              : 'The evidence page distinguishes publicly inspectable work, owner-attested accounts, and illustrative models.'}
          </p>
          <Link href={`/${l}/proof`} className="signature-text-link">
            {fa ? 'وضعیت و منابع هر سیستم' : 'Review status and sources'} {arrow}
          </Link>
        </div>
      </section>

      <section
        id="operating-model"
        className="signature-model q-section"
        aria-labelledby="model-title"
      >
        <div className="container-wide signature-model-grid">
          <div className="signature-section-head">
            <span className="eyebrow">
              {fa ? 'شیوه فکر کردن من' : 'HOW I THINK ABOUT THE SYSTEM'}
            </span>
            <h2 id="model-title">
              {fa
                ? 'هوشمندی باید به شیوه کار وصل شود.'
                : 'Intelligence belongs in the way work runs.'}
            </h2>
            <p>
              {fa
                ? 'یک پاسخ خوب کافی نیست. دانش، اجرای کار و اختیار تصمیم باید در یک طراحی مشترک به هم برسند.'
                : 'A good answer is a beginning. Shared knowledge, execution, and decision rights need to work as one design.'}
            </p>
            <Link href={`/${l}/system`} className="signature-text-link">
              {fa ? 'مدل کامل سازمان را بررسی کنید' : 'Inspect the full operating model'} {arrow}
            </Link>
          </div>
          <ol className="signature-principles">
            {groups.map((g, i) => (
              <li key={g.name}>
                <span aria-hidden="true">{number(i + 1)}</span>
                <div>
                  <h3>{g.name}</h3>
                  <p>{g.role}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="method" className="q-section signature-method" aria-labelledby="method-title">
        <div className="container-wide">
          <div className="signature-section-head">
            <span className="eyebrow">{fa ? 'مسیر همکاری' : 'A PRACTICAL WAY TO BEGIN'}</span>
            <h2 id="method-title">{h.methodH2}</h2>
            <p>{h.methodLede}</p>
          </div>
          <ol className="signature-method-steps">
            {t.method.stages.slice(0, 3).map((s, i) => (
              <li key={s.title}>
                <span className="signature-row-num">{number(i + 1)}</span>
                <h3>{s.title}</h3>
                <p>{s.note}</p>
              </li>
            ))}
          </ol>
          <div className="signature-method-links">
            <Link href={`/${l}/method`} className="signature-text-link">
              {fa ? 'مراحل کامل همکاری' : 'The complete method'} {arrow}
            </Link>
            <Link href={`/${l}/services`} className="signature-text-link">
              {fa ? 'شیوه‌های همکاری' : 'Ways to work together'} {arrow}
            </Link>
          </div>
        </div>
      </section>

      <section className="signature-founder" aria-labelledby="founder-title">
        <div className="container-wide signature-founder-grid">
          <div>
            <span className="eyebrow">
              {fa ? 'پشت این رویکرد' : 'THE PERSON BEHIND THE APPROACH'}
            </span>
            <h2 id="founder-title">
              {fa ? 'مسئولیت فکر؛ مسئولیت اجرا.' : 'Own the thinking. Own the implementation.'}
            </h2>
          </div>
          <div>
            <p>{h.bridgeLine}</p>
            <div className="signature-method-links">
              <Link href={`/${l}/leadership`} className="signature-text-link">
                {fa ? 'نگاه و تجربه مدیریتی' : 'Leadership & experience'} {arrow}
              </Link>
              <Link href="/profile" className="signature-text-link">
                {fa ? 'پروژه‌های مهندسی · انگلیسی' : 'Engineering work'} {arrow}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="signature-final" aria-labelledby="final-title">
        <div className="container-wide">
          <span className="eyebrow">{fa ? 'گام بعد' : 'YOUR NEXT MOVE'}</span>
          <h2 id="final-title">
            {fa ? 'کجای کارتان باید بهتر پیش برود؟' : 'Where should work move better?'}
          </h2>
          <p>
            {fa
              ? 'یک فرایند، یک گره واقعی، یک نتیجه قابل سنجش. گفت‌وگو را از همین‌جا شروع کنیم.'
              : 'One workflow. One real bottleneck. One outcome we can measure. Let’s start there.'}
          </p>
          <div className="hero-actions">
            <Link href={`/${l}/contact?intent=diagnostic`} className="btn btn-primary">
              {fa ? 'درباره مسئله‌تان گفت‌وگو کنیم' : 'Discuss your challenge'} {arrow}
            </Link>
            <Link href={`/${l}/mind`} className="signature-text-link">
              {fa ? 'ابتدا از دستیار کوانتی‌ویک بپرسید' : 'Ask Quantiviq Mind first'} {arrow}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
