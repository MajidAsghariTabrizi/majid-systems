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
  serviceUnavailable: string;
  retryHint: string;
  disabledEn: string;
  disabledFa: string;
  suggestions: string[];
  /* full-page (/mind) surface */
  headline: string;
  headlineSecond?: string; // EN two-line cadence; FA leaves empty
  subtitle: string;
  aiNote: string;
  aiNoteDetail: string;
  startersTitle: string;
  starters: string[];
  switchLabel: string;
  remainingTemplate: string;
};

/**
 * Quantiviq Mind — editorial voice (2026-10-25)
 * Positioning: "A résumé tells you what someone has done. A conversation
 * explores how they think." Sell intellectual clarity, not AI novelty.
 * The SITE speaks in Majid's first person; the ASSISTANT is always
 * described in third person and never impersonates him. Persian is native
 * editorial Iranian Persian — no translationese, no brochure tone.
 */
export const MIND_STRINGS: Record<'en' | 'fa', MindStrings> = {
  en: {
    invite: 'Curious about the decisions behind the work? Ask here.',
    close: 'Close',
    openLabel: 'Open Quantiviq Mind — AI assistant',
    openFull: 'Open the full conversation',
    fab: 'Ask',
    title: 'Quantiviq Mind',
    emptyTitle: 'What would you like to explore?',
    disclosure:
      "Answers draw on Majid's published work and professional evidence. This is an AI assistant, not a direct conversation with Majid.",
    inputLabel: 'Your question',
    placeholder: 'Ask about a project, decision, or approach…',
    send: 'Send',
    stop: 'Stop',
    copy: 'Copy answer',
    copied: 'Copied',
    reset: 'New conversation',
    sources: 'Sources',
    contactCta: 'Have a specific challenge worth discussing?',
    contactLink: 'Contact Majid',
    limitReached:
      "You've reached the question limit for this conversation. You can review the answers above — or contact Majid directly.",
    error: 'Something went wrong. Please try again in a moment.',
    serviceUnavailable:
      "I couldn't complete that answer. Your question is still here — resend it to try again.",
    retryHint: 'ready to resend',
    disabledEn: 'Quantiviq Mind is switched off at the moment. Please use the contact page instead.',
    disabledFa: 'Quantiviq Mind در حال حاضر خاموش است. لطفاً از صفحهٔ تماس استفاده کنید.',
    suggestions: [
      'Where would Majid start our AI transformation?',
      "Why doesn't AI adoption pay off by itself?",
      'Which systems has he actually shipped?',
      'How does he connect product and engineering?',
      "Where is his line on AI autonomy?",
      'What does the public evidence show?',
    ],
    headline: 'Beyond the résumé.',
    headlineSecond: 'Explore the thinking behind the work.',
    subtitle:
      'Ask about the decisions, principles and real projects behind my approach to product leadership, AI systems and business transformation. Explore the evidence — and challenge the reasoning.',
    aiNote:
      "Answers draw on Majid's published work and professional evidence. This is an AI assistant, not a direct conversation with Majid.",
    aiNoteDetail: 'Responses may be incomplete or inaccurate — check the linked sources for important claims.',
    startersTitle: 'Start the conversation',
    starters: [
      'Where would Majid begin an AI transformation inside our business?',
      "Why doesn't adding AI tools automatically create business value?",
      "Which of Majid's projects show he can turn ideas into working systems?",
      'How does he connect product, engineering and economic outcomes?',
      'Where does he draw the line between AI autonomy and human accountability?',
      'What does the public evidence actually support about his leadership fit?',
    ],
    switchLabel: 'فارسی',
    remainingTemplate: '{n} questions left in this conversation',
  },
  fa: {
    invite: 'پشت این پروژه‌ها چه تصمیم‌هایی بوده؟ اینجا بپرس.',
    close: 'بستن',
    openLabel: 'باز کردن Quantiviq Mind — دستیار هوشمند',
    openFull: 'گفت‌وگوی کامل',
    fab: 'گفت‌وگو',
    title: 'Quantiviq Mind',
    emptyTitle: 'دوست داری درباره کدام تصمیم یا تجربه بیشتر بدانی؟',
    disclosure:
      'پاسخ‌ها بر پایهٔ نوشته‌ها، پروژه‌ها و اطلاعات حرفه‌ای منتشرشدهٔ مجید است؛ این دستیار AI است، نه گفت‌وگوی مستقیم با او.',
    inputLabel: 'سؤال شما',
    placeholder: 'سؤالت را درباره پروژه‌ها یا رویکرد مجید بنویس…',
    send: 'ارسال',
    stop: 'توقف',
    copy: 'کپی پاسخ',
    copied: 'کپی شد',
    reset: 'گفت‌وگوی جدید',
    sources: 'منابع',
    contactCta: 'مسئله مشخصی برای همکاری داری؟ می‌توانیم مستقیم گفت‌وگو کنیم.',
    contactLink: 'تماس با مجید',
    limitReached:
      'سهمیه پرسش‌های این گفت‌وگو تمام شده است. می‌توانی پاسخ‌های قبلی را مرور کنی یا مستقیماً با مجید در تماس باشی.',
    error: 'خطایی رخ داد. لطفاً کمی بعد دوباره تلاش کنید.',
    serviceUnavailable: 'الان پاسخ کامل نشد. سؤالت حفظ شده است؛ می‌توانی دوباره امتحان کنی.',
    retryHint: 'آمادهٔ ارسال مجدد',
    disabledEn: 'Quantiviq Mind is currently switched off. Please use the contact page instead.',
    disabledFa: 'Quantiviq Mind در حال حاضر خاموش است. لطفاً از صفحهٔ تماس استفاده کنید.',
    suggestions: [
      'مجید تحول AI را از کجا شروع می‌کند؟',
      'چرا ابزارهای AI خودبه‌خود نتیجه نمی‌دهند؟',
      'کدام سیستم‌ها را واقعاً ساخته است؟',
      'محصول و مهندسی را چطور به نتیجه وصل می‌کند؟',
      'مرز خودمختاری AI از نظر او کجاست؟',
      'شواهد عمومی چه چیزی را نشان می‌دهند؟',
    ],
    headline: 'رزومه می‌گوید چه کرده‌ام؛',
    headlineSecond: 'اینجا بپرس چطور فکر می‌کنم.',
    subtitle:
      'از رهبری محصول و ساخت سیستم‌های هوش مصنوعی تا بازطراحی فرایندهای کسب‌وکار؛ درباره رویکرد من به مسائل پیچیده، تصمیم‌های دشوار و سنجش نتیجه سؤال کن. پاسخ‌ها بر اساس پروژه‌ها، نوشته‌ها و شواهد حرفه‌ای منتشرشده‌اند.',
    aiNote:
      'پاسخ‌ها بر پایهٔ نوشته‌ها، پروژه‌ها و اطلاعات حرفه‌ای منتشرشدهٔ مجید است؛ این دستیار AI است، نه گفت‌وگوی مستقیم با او.',
    aiNoteDetail: 'پاسخ‌ها ممکن است ناقص یا نادرست باشند؛ برای ادعاهای مهم، منابع پیوندشده را بررسی کنید.',
    startersTitle: 'گفت‌وگو را شروع کن',
    starters: [
      'اگر مجید هدایت تحول AI شرکت ما را بر عهده بگیرد، از کجا شروع می‌کند؟',
      'چرا اضافه‌کردن ابزارهای AI لزوماً به نتیجه تجاری بهتر منجر نمی‌شود؟',
      'کدام پروژه‌های مجید نشان می‌دهند می‌تواند ایده را به سیستم اجرایی تبدیل کند؟',
      'مجید محصول، مهندسی و نتیجه اقتصادی را چگونه به هم مرتبط می‌کند؟',
      'در تصمیم‌های پرریسک، مجید چه اختیاری به AI می‌دهد و چه چیزی را انسانی نگه می‌دارد؟',
      'بر اساس شواهد منتشرشده، نقاط قوت و محدودیت‌های مجید برای یک نقش رهبری چیست؟',
    ],
    switchLabel: 'English',
    remainingTemplate: '{n} پرسش دیگر در این گفت‌وگو باقی مانده است',
  },
};
