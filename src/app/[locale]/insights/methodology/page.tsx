import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { isLocale } from '@/content/i18n';
import { socialMeta } from '@/lib/social';
import { SOURCES, getArticles, insightsStats, type Locale } from '@/content/insights';
import { INSIGHTS_UI } from '@/content/insights/ui';
import { SITE } from '@/content/shared';

type Params = { locale: string };

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const l = params.locale;
  if (!isLocale(l)) return {};
  const fa = l === 'fa';
  const title = fa ? 'روش سردبیری — تحلیل‌های کوانتی‌ویک' : 'Editorial Methodology — Quantiviq Insights';
  const description = fa
    ? 'پژوهش کوانتی‌ویک چگونه منابع را برمی‌گزیند، راستی‌آزمایی می‌کند، پیش‌نویس می‌نویسد و بازبینی می‌کند: سیاست منبع دست‌اول، استاندارد استناد، افشای کمک هوش مصنوعی و برچسب‌گذاری نمونه‌های شبیه‌سازی‌شده.'
    : 'How Quantiviq Research sources, verifies, drafts and reviews its analysis: primary-source policy, citation standards, AI-assistance disclosure, and how we label synthetic examples.';
  return {
    title,
    description,
    alternates: {
      canonical: `/${l}/insights/methodology`,
      languages: { en: '/en/insights/methodology', fa: '/fa/insights/methodology', 'x-default': '/en/insights/methodology' },
      types: { 'application/rss+xml': `${SITE.canonicalUrl}/${fa ? 'fa/insights.xml' : 'insights.xml'}` },
    },
    ...socialMeta({
      title,
      description,
      path: `/${l}/insights/methodology`,
      locale: fa ? 'fa' : 'en',
      languages: { en: '/en/insights/methodology', fa: '/fa/insights/methodology', 'x-default': '/en/insights/methodology' },
    }),
  };
}

export default async function MethodologyPage({ params }: { params: Params }) {
  const l = params.locale;
  if (!isLocale(l)) notFound();
  const locale = (l === 'fa' ? 'fa' : 'en') as Locale;
  const t = INSIGHTS_UI[locale];
  const sources = Object.values(SOURCES);
  const stats = insightsStats(locale);

  return (
    <>
      <section className="ins-hero-section">
        <div className="container-narrow">
          <nav className="ins-breadcrumb" aria-label={locale === 'fa' ? 'مسیر صفحه' : 'Breadcrumb'}>
            <ol>
              <li><Link href={`/${locale}`}>{locale === 'fa' ? 'خانه' : 'Home'}</Link></li>
              <li><Link href={`/${locale}/insights`}>{t.title}</Link></li>
              <li aria-current="page">{locale === 'fa' ? 'روش سردبیری' : 'Methodology'}</li>
            </ol>
          </nav>
          <span className="eyebrow sig">{locale === 'fa' ? 'پژوهش کوانتی‌ویک' : 'Quantiviq Research'}</span>
          <h1 className="q-display">{locale === 'fa' ? 'روش سردبیری' : 'Editorial Methodology'}</h1>
          <p className="ins-subtitle">
            {locale === 'fa' ? 'این انتشارات چگونه اعتماد مدیران را به‌دست می‌آورد.' : 'How this publication earns executive trust.'}
          </p>
          <p className="q-lede">
            {locale === 'fa'
              ? 'تحلیل‌های کوانتی‌ویک به تصمیم‌گیری مدیران کمک می‌کنند: هر عدد باید منبع قابل پیگیری داشته باشد، هر چارچوب حاصل تحلیل ما باشد و محدودیت‌ها روشن بیان شوند. این صفحه روش کار ما را توضیح می‌دهد.'
              : 'Quantiviq Insights exists to give executives analysis they can act on. That means every number traces to a source, every framework is original synthesis, and every limitation is stated. This page documents how.'}
          </p>
        </div>
      </section>

      <section className="q-section">
        <div className="container-narrow ins-prose ins-prose-page">
          <h2>{locale === 'fa' ? 'چه چیزی منتشر می‌کنیم' : 'What we publish'}</h2>
          <p>
            {locale === 'fa'
              ? `${stats.articles} مقالهٔ پژوهشی در پنج محور — استراتژی، اقتصاد، مدل‌های عملیاتی بومی هوش مصنوعی، اعتماد و حکمرانی، و تحلیل کاربردی صنعتی. هر مقاله به یک پرسش تصمیم‌گیری مدیریتی پاسخ می‌دهد، تز خود را در پاراگراف‌های آغازین بیان می‌کند، چارچوبی کاربردی ارائه می‌کند و با گام‌های عملی مشخص پایان می‌یابد. دیدگاه بدون شواهد منتشر نمی‌کنیم و شواهد بدون استناد منتشر نمی‌کنیم.`
              : `${stats.articles} original English articles across five pillars — strategy, economics, AI-native operating models, trust and governance, and applied industry analysis. Each article answers one executive decision question, states its thesis in the opening paragraphs, provides a usable framework, and closes with concrete next actions. We do not publish opinion without evidence, and we do not publish evidence without attribution.`}
          </p>

          <h2>{locale === 'fa' ? 'سیاست انتخاب منابع' : 'Source policy'}</h2>
          <p>
            {locale === 'fa'
              ? `برای ادعاهای بیرونی به منابع دست‌اول رجوع می‌کنیم: نهادهای پژوهشی (McKinsey، BCG، Gartner، Deloitte، MIT، NBER، METR)، نهادهای استانداردگذار (مانند NIST)، مقررات اتحادیهٔ اروپا و نشریات داوری‌شده. ناشر، تاریخ انتشار، نشانی، تاریخ بررسی، روش پژوهش و محدودیت‌های هر منبع در فهرستی ساختاریافته ثبت می‌شود؛ این فهرست اکنون ${sources.length.toLocaleString('fa-IR')} منبع دارد. اگر به گزارش ثانویه‌ای از یک پژوهش تکیه کنیم، مانند پوشش رسانه‌ای یک نظرسنجی، آن را در مدخل منبع مشخص می‌کنیم و ارقام را نشانه‌ای از روند می‌دانیم، نه برآوردی با دقت قطعی.`
              : `Every external claim is anchored to a primary source: research institutions (McKinsey, BCG, Gartner, Deloitte, MIT, NBER, METR), standards bodies (NIST, EU regulation), or peer-reviewed journals. We record the source, publisher, publication date, URL, access date, methodology notes and limitations in a structured ledger — ${sources.length} sources at present. When we rely on secondary coverage of primary research (for example, trade-press reporting of a consultancy survey), we say so explicitly in the reference entry, and we treat those figures as directional rather than exact.`}
          </p>
          <p>{locale === 'fa' ? 'هرگز:' : 'We never:'}</p>
          <ul>
            <li>{locale === 'fa' ? 'عنوان، نشانی، تاریخ، عدد یا نقل‌قول منبعی را جعل نمی‌کنیم؛' : 'invent source titles, URLs, dates, numbers or quotes;'}</li>
            <li>{locale === 'fa' ? 'نمودارها، تصویرسازی‌ها یا بخش‌های بلند متون دیگران را بازنشر نمی‌کنیم؛' : 'reprint third-party charts, illustrations or long excerpts;'}</li>
            <li>{locale === 'fa' ? 'پیوند سازمانی یا تأیید هیچ نهاد پژوهشی را القا نمی‌کنیم؛' : 'imply affiliation with or endorsement by any research institution;'}</li>
            <li>{locale === 'fa' ? 'پیش‌بینی‌ها را به‌عنوان نتایج مشاهده‌شده ارائه نمی‌کنیم.' : 'present forecasts as observed results.'}</li>
          </ul>

          <h2>{locale === 'fa' ? 'استاندارد استناد' : 'Citation standard'}</h2>
          <p>
            {locale === 'fa'
              ? 'استنادهای درون‌متنی به فهرست منابع در پایان هر مقاله پیوند می‌خورند؛ هر مرجع، پیوند اصلی و تاریخ آخرین راستی‌آزمایی ما را همراه دارد. ادعاهای کمّی با زمینه‌ای که یک مدیر لازم دارد بیان می‌شوند: سال، جامعهٔ آماری یا نمونه، و اینکه یافته مشاهده‌ای است، تجربی یا پیش‌بینی.'
              : 'Inline citations link to the reference list at the end of each article; every reference carries the original link and the date we last verified it. Quantitative claims include the context an executive needs: year, surveyed population or sample, and whether the finding is observational, experimental or a forecast.'}
          </p>

          <h2>{locale === 'fa' ? 'تحلیل مستقل و مثال‌های توضیحی' : 'Original synthesis and examples'}</h2>
          <p>
            {locale === 'fa'
              ? 'چارچوب‌ها، نمودارها و مدل‌های مالی این مقالات را کوانتی‌ویک برای استفاده در تصمیم‌های واقعی طراحی می‌کند. اگر از محاسبه‌ای با اعداد فرضی استفاده کنیم، مانند برآورد درآمد قابل بازیابی یک خرده‌فروش، فرض‌ها را می‌نویسیم و نمونه را به‌روشنی «سناریوی فرضی» معرفی می‌کنیم. این مثال‌ها گزارش عملکرد مشتری نیستند و به نتایج مشتریان نامشخص استناد نمی‌کنیم.'
              : 'Frameworks, diagrams and financial models in these articles are original Quantiviq work — built to be applied, not admired. Where an article uses a worked scenario with invented numbers (for example, a retailer recovering lost revenue), the scenario is labeled prominently as an illustrative synthetic scenario with stated assumptions. We do not present synthetic examples as client case studies, and we make no claims of unnamed-client outcomes.'}
          </p>

          <h2>{locale === 'fa' ? 'افشای کمک هوش مصنوعی' : 'AI assistance disclosure'}</h2>
          <p>
            {locale === 'fa'
              ? 'مقالات پژوهش‌محور و با کمک هوش مصنوعی نوشته می‌شوند: دفتر منابع، ساختار مقاله، استدلال‌های تحلیلی و استانداردهای راستی‌آزمایی را فرایند سردبیری تعیین می‌کند و ابزار هوش مصنوعی برای پیش‌نویس‌نویسی و تکرار، زیر کنترل سردبیری انسانی به‌کار می‌رود. پیش از انتشار، هر مقاله با دفتر منابع راستی‌آزمایی می‌شود (ادعاها به منابع استنادشده ردیابی می‌شوند)، از نظر طرح اعتبارسنجی می‌شود و از نظر ساختار، لحن و صحت فنی بازبینی می‌گردد. این موضوع را افشا می‌کنیم نه پنهان؛ چون تولید تحلیل جدی در سال ۲۰۲۶ همین‌گونه است — و چون استانداردی که اهمیت دارد راستی‌آزمایی‌پذیری است، نه سرعت تایپ.'
              : 'Articles are research-led and AI-assisted: the research ledger, article structure, analytical arguments and verification standards are set by the editorial process, with AI tooling used for drafting and iteration under human editorial control. Before publication, every article is checked against the source ledger (claims trace to cited sources), schema-validated, and reviewed for structure, tone and technical accuracy. This is disclosed rather than hidden because it is how serious analysis is produced in 2026 — and because the standard that matters is verifiability, not typing speed.'}
          </p>

          <h2>{locale === 'fa' ? 'اصلاح‌ها و به‌روزرسانی‌ها' : 'Corrections and updates'}</h2>
          <p>
            {locale === 'fa'
              ? 'هر مقاله تاریخ «انتشار» و «به‌روزرسانی» دارد. تغییرات اساسی، تاریخ به‌روزرسانی را تغییر می‌دهند و در نقشهٔ سایت و فید RSS منعکس می‌شوند؛ اصلاحات تایپی تاریخ انتشار را بازنشانی نمی‌کنند. تصحیح‌های اساسی در محل و همراه با تاریخ به‌روزرسانی انجام می‌شوند — تاریخ را بی‌صدا بازنویسی نمی‌کنیم.'
              : 'Articles carry published and updated dates. Substantive changes update the date and are reflected in the sitemap and RSS feed; typographical fixes do not reset the published date. Corrections of substance are made in place with the updated date — we do not silently rewrite history.'}
          </p>

          <h2>{locale === 'fa' ? 'خواندن دفتر منابع' : 'Reading the ledger'}</h2>
          <p>
            {locale === 'fa'
              ? `فهرست کامل منابع در کنار مقالات نگهداری می‌شود و اکنون ${sources.length.toLocaleString('fa-IR')} مدخل دارد. منابع انتهای هر مقاله از همین فهرست انتخاب می‌شوند و شناسه‌ها، تاریخ‌ها و محدودیت‌های ثبت‌شده را حفظ می‌کنند. ادعایی که امکان بررسی آن وجود نداشته باشد، منتشر نمی‌شود.`
              : `The full source ledger is maintained alongside the articles (${sources.length} sources at publication). For each article, the reference list is the article-facing view of that ledger — the same source IDs, dates and limitations. If a claim cannot be verified, it does not ship.`}
          </p>

          <h2>{locale === 'fa' ? 'دربارهٔ نسخهٔ فارسی' : 'About the Persian edition'}</h2>
          <p>
            {locale === 'fa'
              ? 'نسخهٔ فارسی تحلیل‌ها، معادل کامل و حرفه‌ای نسخهٔ انگلیسی است: همان ساختار، همان جدول‌ها و نمودارها، همان استنادها و همان ارقام. منابع پژوهشی با عنوان اصلی انگلیسی خود در فهرست منابع می‌آیند تا خواننده بتواند اصل را بیابد. اعداد و فرمول‌ها عیناً با نسخهٔ انگلیسی حفظ شده‌اند و هیچ داده‌ای برای مخاطب فارسی‌زبان تغییر نکرده است.'
              : 'The Persian edition is a complete, professional counterpart of the English publication: the same structure, tables, figures, citations and numbers. Research sources keep their original English titles in the reference lists so readers can locate the primary material. All figures and formulas are preserved exactly as published in English — nothing is altered for the Persian audience.'}
          </p>
        </div>
      </section>

      <section className="q-section ins-method-note">
        <div className="container-narrow">
          <h2 className="q-h2">{locale === 'fa' ? 'مطالعهٔ پژوهش‌ها' : 'Read the research'}</h2>
          <div className="hero-actions">
            <Link href={`/${locale}/insights`} className="btn btn-primary">
              {locale === 'fa' ? 'همهٔ تحلیل‌ها' : 'All analysis'} <span className="arrow" aria-hidden>→</span>
            </Link>
            <Link href={`/${locale}/insights/author`} className="btn">
              {t.authorTitle} <span className="arrow" aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
