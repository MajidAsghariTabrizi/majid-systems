/** Publication chrome. English and Persian editions share source references;
 * language availability is resolved from the article registry. */
export const INSIGHTS_UI: Record<'en' | 'fa', InsightsUi> = {
  en: {
    eyebrow: 'Quantiviq Research',
    title: 'Insights',
    subtitle: 'Original analysis on AI-native business transformation — operating models, economics, governance and execution.',
    intro:
      'Quantiviq Insights publishes research-led analysis for executives rebuilding how their organizations create value with AI. Every article answers a decision question, cites verified sources, and ends with what leaders should do next.',
    latest: 'Latest analysis',
    pillars: 'Editorial pillars',
    explorePillar: 'Explore the pillar',
    readArticle: 'Read the analysis',
    minRead: 'min read',
    published: 'Published',
    updated: 'Updated',
    byAuthor: 'By',
    keyTakeaways: 'Key takeaways',
    onThisPage: 'On this page',
    discussion: 'Discussion questions',
    discussionIntro: 'Questions executive teams can use to pressure-test this analysis against their own organization.',
    references: 'References & sources',
    methodologyNote: 'How we research and verify',
    related: 'Related analysis',
    nextArticle: 'Next',
    prevArticle: 'Previous',
    backToInsights: 'All analysis',
    share: 'Share',
    copyLink: 'Copy link',
    sourcesLabel: 'sources cited',
    wordsLabel: 'words',
    noticeTitle: 'Research in English and Persian',
    noticeBody:
      'English and Persian editions share the same source references. Use the language switch to read the available edition, and inspect the references and methodology behind each analysis.',
    contactCta: 'Discuss this with Quantiviq',
    contactBody: 'If your organization is working through the problems these articles describe, we compare notes with leadership teams.',
    series: 'Featured series',
    allArticles: 'All analysis',
    authorTitle: 'About Quantiviq Research',
    methodologyTitle: 'Editorial methodology',
    topicsTitle: 'Topics',
    aiDisclosure:
      'These articles are research-led, AI-assisted drafts edited and fact-checked against the source ledger before publication. See our methodology for what that means and what it does not.',
    publishedOn: 'Published on',
    updatedOn: 'Updated on',
  },
  fa: {
    eyebrow: 'پژوهش کوانتی‌ویک',
    title: 'تحلیل‌ها',
    subtitle: 'تحلیل درباره تحول کسب‌وکار با هوش مصنوعی؛ از مدل عملیاتی و اقتصاد تا حکمرانی و اجرا.',
    intro:
      'تحلیل‌های کوانتی‌ویک برای مدیرانی است که شیوه ارزش‌آفرینی سازمان خود را با هوش مصنوعی بازطراحی می‌کنند. هر مقاله از یک پرسش تصمیم‌گیری آغاز می‌شود، شواهد و محدودیت‌ها را توضیح می‌دهد و با گام‌های عملی پایان می‌یابد.',
    latest: 'تازه‌ترین تحلیل‌ها',
    pillars: 'محورهای پژوهش',
    explorePillar: 'مرور محور',
    readArticle: 'مطالعه تحلیل',
    minRead: 'دقیقه مطالعه',
    published: 'انتشار',
    updated: 'به‌روزرسانی',
    byAuthor: 'به قلم',
    keyTakeaways: 'پیام‌های کلیدی',
    onThisPage: 'در این صفحه',
    discussion: 'پرسش‌هایی برای گفت‌وگوی تیم',
    discussionIntro: 'این پرسش‌ها به تیم مدیریت کمک می‌کنند تحلیل را با شرایط و تصمیم‌های سازمان خود بسنجند.',
    references: 'منابع و مستندات',
    methodologyNote: 'روش پژوهش و راستی‌آزمایی ما',
    related: 'تحلیل‌های مرتبط',
    nextArticle: 'بعدی',
    prevArticle: 'قبلی',
    backToInsights: 'همهٔ تحلیل‌ها',
    share: 'اشتراک‌گذاری',
    copyLink: 'کپی لینک',
    sourcesLabel: 'منبع استنادشده',
    wordsLabel: 'واژه',
    noticeTitle: 'پژوهش به فارسی و انگلیسی',
    noticeBody:
      'نسخه‌های فارسی و انگلیسی به منابع مشترک استناد می‌کنند. با انتخاب زبان، نسخه موجود را بخوانید و برای بررسی شواهد و محدودیت‌ها به منابع و روش پژوهش هر تحلیل مراجعه کنید.',
    contactCta: 'گفت‌وگو با کوانتی‌ویک',
    contactBody: 'اگر سازمان شما با این مسائل روبه‌روست، می‌توانیم درباره شرایط، تصمیم‌ها و گام بعدی با تیم شما گفت‌وگو کنیم.',
    series: 'مجموعهٔ ویژه',
    allArticles: 'همهٔ تحلیل‌ها',
    authorTitle: 'دربارهٔ پژوهش کوانتی‌ویک',
    methodologyTitle: 'روش پژوهش و ویرایش',
    topicsTitle: 'موضوع‌ها',
    aiDisclosure:
      'این مقاله‌ها با کمک هوش مصنوعی تهیه و بر اساس فهرست منابع ویرایش و بررسی شده‌اند. روش پژوهش، حدود شواهد و نقش هوش مصنوعی در صفحه روش‌شناسی توضیح داده شده است.',
    publishedOn: 'تاریخ انتشار',
    updatedOn: 'آخرین به‌روزرسانی',
  },
} satisfies Record<'en' | 'fa', InsightsUi>;

export interface InsightsUi {
  eyebrow: string;
  title: string;
  subtitle: string;
  intro: string;
  latest: string;
  pillars: string;
  explorePillar: string;
  readArticle: string;
  minRead: string;
  published: string;
  updated: string;
  byAuthor: string;
  keyTakeaways: string;
  onThisPage: string;
  discussion: string;
  discussionIntro: string;
  references: string;
  methodologyNote: string;
  related: string;
  nextArticle: string;
  prevArticle: string;
  backToInsights: string;
  share: string;
  copyLink: string;
  sourcesLabel: string;
  wordsLabel: string;
  noticeTitle: string;
  noticeBody: string;
  contactCta: string;
  contactBody: string;
  series: string;
  allArticles: string;
  authorTitle: string;
  methodologyTitle: string;
  topicsTitle: string;
  aiDisclosure: string;
  publishedOn: string;
  updatedOn: string;
}
