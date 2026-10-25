/** Insights publication UI strings. Articles are English-first; the FA index
 * renders localized chrome with an explicit notice (no machine-published
 * translations — see docs/INSIGHTS_BASELINE.md §8). */
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
    noticeTitle: 'English-first research publication',
    noticeBody:
      'Quantiviq Insights is published in English so that sources, terminology and analysis can be verified to a single editorial standard. Persian editions will follow only where translation and editorial review can meet that same standard — we do not publish machine translations as finished articles.',
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
    subtitle: 'تحلیل‌های اصیل دربارهٔ تحول کسب‌وکار بومی هوش مصنوعی — مدل عملیاتی، اقتصاد، حاکمیت و اجرا.',
    intro:
      'انتشارات تحلیل‌های کوانتی‌ویک برای مدیرانی نوشته می‌شود که در حال بازطراحی روش ارزش‌آفرینی سازمان خود با هوش مصنوعی‌اند. هر مقاله به یک پرسش تصمیم‌گیری پاسخ می‌دهد، به منابع راستی‌آزمایی‌شده استناد می‌کند و با گام‌های عملی برای رهبران پایان می‌یابد.',
    latest: 'تازه‌ترین تحلیل‌ها',
    pillars: 'محورهای سردبیری',
    explorePillar: 'مرور محور',
    readArticle: 'خواندن تحلیل',
    minRead: 'دقیقه مطالعه',
    published: 'انتشار',
    updated: 'به‌روزرسانی',
    byAuthor: 'به قلم',
    keyTakeaways: 'پیام‌های کلیدی',
    onThisPage: 'در این صفحه',
    discussion: 'پرسش‌های بحث',
    discussionIntro: 'پرسش‌هایی که تیم‌های اجرایی می‌توانند برای سنجش این تحلیل در سازمان خود به‌کار ببرند.',
    references: 'منابع و مستندات',
    methodologyNote: 'روش پژوهش و راستی‌آزمایی ما',
    related: 'تحلیل‌های مرتبط',
    nextArticle: 'بعدی',
    prevArticle: 'قبلی',
    backToInsights: 'همهٔ تحلیل‌ها',
    share: 'اشتراک',
    copyLink: 'کپی پیوند',
    sourcesLabel: 'منبع استنادشده',
    wordsLabel: 'واژه',
    noticeTitle: 'انتشار پژوهشی با زبان اصلی انگلیسی',
    noticeBody:
      'تحلیل‌های کوانتی‌ویک به انگلیسی منتشر می‌شود تا استنادها، اصطلاحات و تحلیل‌ها با یک استاندارد سردبیری واحد راستی‌آزمایی شوند. نسخهٔ فارسی تنها زمانی منتشر می‌شود که ترجمه و ویرایش بتواند به همان استاندارد برسد؛ ترجمهٔ ماشینی را به‌عنوان مقالهٔ نهایی منتشر نمی‌کنیم.',
    contactCta: 'گفت‌وگو با کوانتی‌ویک',
    contactBody: 'اگر سازمان شما با مسائلی که این مقالات توصیف می‌کنند سروکار دارد، با تیم‌های رهبری تجربه‌رفرا می‌کنیم.',
    series: 'مجموعهٔ ویژه',
    allArticles: 'همهٔ تحلیل‌ها',
    authorTitle: 'دربارهٔ پژوهش کوانتی‌ویک',
    methodologyTitle: 'روش سردبیری',
    topicsTitle: 'موضوع‌ها',
    aiDisclosure:
      'این مقالات پیش‌نویس‌های پژوهش‌محور و با کمک هوش مصنوعی‌اند که پیش از انتشار بر اساس دفتر منابع ویرایش و راستی‌آزمایی شده‌اند. توضیح روش ما را ببینید.',
    publishedOn: 'منتشر شده در',
    updatedOn: 'به‌روزرسانی شده در',
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
