export type MindStrings = {
  invite: string;
  close: string;
  openLabel: string;
  openFull: string;
  fab: string;
  title: string;
  emptyTitle: string;
  disclosure: string;
  inputLabel: string;
  placeholder: string;
  send: string;
  stop: string;
  copy: string;
  copied: string;
  reset: string;
  sources: string;
  contactCta: string;
  contactLink: string;
  limitReached: string;
  error: string;
  disabledEn: string;
  disabledFa: string;
  suggestions: string[];
  /* full-page (/mind) surface */
  headline: string;
  subtitle: string;
  aiNote: string;
  startersTitle: string;
  starters: string[];
  switchLabel: string;
  remainingTemplate: string;
};

export const MIND_STRINGS: Record<'en' | 'fa', MindStrings> = {
  en: {
    invite: 'Curious how I approach AI Transformation? Ask my AI Mind.',
    close: 'Close',
    openLabel: 'Open Quantiviq Mind — AI assistant',
    openFull: 'Open the full Mind page',
    fab: 'Mind',
    title: 'Quantiviq Mind',
    emptyTitle: 'Ask Majid’s AI Mind',
    disclosure:
      'An AI assistant grounded in Majid’s approved professional knowledge, projects and writing. It is not Majid himself.',
    inputLabel: 'Your question',
    placeholder: 'Ask about AI transformation, systems, or Majid’s work…',
    send: 'Send',
    stop: 'Stop',
    copy: 'Copy answer',
    copied: 'Copied',
    reset: 'New conversation',
    sources: 'Sources',
    contactCta: 'Want to discuss a transformation challenge with Majid directly?',
    contactLink: 'Talk to Majid directly',
    limitReached: 'You have reached this session’s question limit. The conversation stays available — or reach out directly.',
    error: 'Something went wrong. Please try again in a moment.',
    disabledEn: 'Quantiviq Mind is currently switched off. Please use the contact page instead.',
    disabledFa: 'Quantiviq Mind در حال حاضر خاموش است. لطفاً از صفحهٔ تماس استفاده کنید.',
    suggestions: [
      'How would Majid lead AI Transformation?',
      'Why does AI adoption fail to produce ROI?',
      'Which systems has Majid built?',
      'How does he evaluate complex decisions?',
      'What books shaped his thinking?',
      'What is his AI-native operating model?',
    ],
    headline: 'Explore How Majid Thinks',
    subtitle:
      'An AI assistant grounded in Majid’s approved professional experience, projects, research and thinking frameworks.',
    aiNote: 'This is an AI representation, not Majid himself.',
    startersTitle: 'Start the conversation',
    starters: [
      'How would Majid lead AI Transformation in our organization?',
      'What makes Majid’s approach different from simply adopting AI tools?',
      'Which projects demonstrate his capabilities?',
      'How does he connect Product, Engineering, AI and measurable business outcomes?',
      'What are his core thinking principles?',
      'How would he approach an FMCG transformation during the first 90 days?',
    ],
    switchLabel: 'فارسی',
    remainingTemplate: '{n} questions left this session',
  },
  fa: {
    invite: 'دوست داری بدونی چطور به تحول AI فکر می‌کنم؟ از ذهن هوشمند من بپرس.',
    close: 'بستن',
    openLabel: 'باز کردن Quantiviq Mind — دستیار هوشمند',
    openFull: 'باز کردن صفحهٔ کامل ذهن هوشمند',
    fab: 'ذهن',
    title: 'Quantiviq Mind',
    emptyTitle: 'با ذهن هوشمند مجید گفت‌وگو کن',
    disclosure:
      'این دستیار هوشمند بر اساس دانش حرفه‌ای، پروژه‌ها و نوشته‌های تأییدشدهٔ مجید پاسخ می‌دهد. خودِ مجید نیست.',
    inputLabel: 'پرسش شما',
    placeholder: 'دربارهٔ تحول هوش مصنوعی، سیستم‌ها یا کار مجید بپرس…',
    send: 'ارسال',
    stop: 'توقف',
    copy: 'کپی پاسخ',
    copied: 'کپی شد',
    reset: 'گفت‌وگوی جدید',
    sources: 'منابع',
    contactCta: 'می‌خوای دربارهٔ مسئلهٔ کسب‌وکارت مستقیماً با مجید صحبت کنی؟',
    contactLink: 'گفت‌وگوی مستقیم با مجید',
    limitReached: 'به سقف پرسش‌های این نشست رسیده‌اید. گفت‌وگو در دسترس است — یا مستقیماً تماس بگیرید.',
    error: 'خطایی رخ داد. لطفاً کمی بعد دوباره تلاش کنید.',
    disabledEn: 'Quantiviq Mind is currently switched off. Please use the contact page instead.',
    disabledFa: 'Quantiviq Mind در حال حاضر خاموش است. لطفاً از صفحهٔ تماس استفاده کنید.',
    suggestions: [
      'مجید تحول هوش مصنوعی را از کجا شروع می‌کند؟',
      'چرا استفاده از AI همیشه ارزش اقتصادی ایجاد نمی‌کند؟',
      'مجید چه سیستم‌هایی ساخته است؟',
      'چطور دربارهٔ مسائل پیچیده تصمیم می‌گیرد؟',
      'چه کتاب‌هایی روی طرز فکر او اثر گذاشته‌اند؟',
      'مدل عملیاتی AI-Native از نگاه او چیست؟',
    ],
    headline: 'با ذهن هوشمند مجید گفت‌وگو کن',
    subtitle:
      'دستیاری هوشمند که بر پایهٔ تجربهٔ حرفه‌ای، پروژه‌ها، پژوهش‌ها و چارچوب‌های فکری تأییدشدهٔ مجید پاسخ می‌دهد.',
    aiNote: 'این یک بازنمایی هوش مصنوعی است، نه خودِ مجید.',
    startersTitle: 'گفت‌وگو را شروع کن',
    starters: [
      'اگر مجید مسئول تحول هوش مصنوعی سازمان ما بود، از کجا شروع می‌کرد؟',
      'رویکرد مجید چه تفاوتی با صرفاً استفاده از ابزارهای هوش مصنوعی دارد؟',
      'کدام پروژه‌ها توانایی‌های او را نشان می‌دهند؟',
      'او محصول، مهندسی، هوش مصنوعی و نتایج قابل‌اندازه‌گیری کسب‌وکار را چطور به هم وصل می‌کند؟',
      'اصول فکری اصلی او چیست؟',
      'در ۹۰ روز اولِ تحول یک هلدینگ مصرفی (FMCG) چه می‌کرد؟',
    ],
    switchLabel: 'English',
    remainingTemplate: '{n} پرسش دیگر در این نشست باقی مانده است',
  },
};
