export type MindStrings = {
  invite: string;
  close: string;
  openLabel: string;
  fab: string;
  title: string;
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
};

export const MIND_STRINGS: Record<'en' | 'fa', MindStrings> = {
  en: {
    invite: 'Curious how I approach AI Transformation? Ask my AI Mind.',
    close: 'Close',
    openLabel: 'Open Quantiviq Mind — AI assistant',
    fab: 'Mind',
    title: 'Quantiviq Mind',
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
    contactLink: 'Contact Majid',
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
  },
  fa: {
    invite: 'دوست داری بدونی چطور به تحول AI فکر می‌کنم؟ از ذهن هوشمند من بپرس.',
    close: 'بستن',
    openLabel: 'باز کردن Quantiviq Mind — دستیار هوشمند',
    fab: 'ذهن',
    title: 'Quantiviq Mind',
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
    contactLink: 'تماس با مجید',
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
  },
};
