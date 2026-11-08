import type { Locale } from '@/content/i18n';

const en = {
  heroPrimary: 'Find a solution for your workflow',
  heroSecondary: 'Try the interactive demonstration',
  heroHint: 'Not sure where to start? Choose a path below.',
  eyebrow: 'YOUR FIRST STEP',
  title: 'Start with what you need.',
  intro: 'A practical challenge, a closer look at the system, or the evidence behind it. Choose a path and take the next step.',
  tabsLabel: 'Choose your starting point',
  nextLabel: 'WHAT YOU CAN EXPLORE',
  timeLabel: 'time',
  paths: [
    {
      key: 'workflow', label: 'Improve a workflow', hint: 'Start with a business bottleneck',
      title: 'Find a useful place to start.',
      body: 'Tell the solution finder where work gets stuck. Compare relevant starting points, what each engagement covers, and what needs to be clarified before implementation.',
      steps: ['Choose a business area', 'Identify the bottleneck', 'Review relevant solutions'],
      primary: 'Find my starting point', href: '/solutions/find',
      secondary: 'Browse all solutions', secondaryHref: '/solutions',
      note: 'Explore first. A project request is a separate next step.',
    },
    {
      key: 'system', label: 'See how it works', hint: 'Try a decision, follow the result',
      title: 'Follow one signal through the organization.',
      body: 'Choose a scenario in the Living Organization. Inspect the evidence, change the human decision, and follow how the proposed action and learning respond.',
      steps: ['Choose a scenario', 'Inspect the decision', 'Compare the outcome'],
      primary: 'Open the interactive demonstration', href: '/explore#simulator',
      secondary: 'Read the operating model', secondaryHref: '/system',
      note: 'A synthetic demonstration with clear boundaries; no real business action is executed.',
    },
    {
      key: 'evidence', label: 'Look at the evidence', hint: 'Understand what supports the approach',
      title: 'Inspect the work behind the ideas.',
      body: 'Review the published engineering evidence and its status. Or ask Quantiviq Mind a question and inspect the sources behind its answer.',
      steps: ['Read the evidence', 'Check its status', 'Ask a source-backed question'],
      primary: 'Inspect the evidence', href: '/proof',
      secondary: 'Ask Quantiviq Mind', secondaryHref: '/mind',
      note: 'Published work, demonstrations and research are distinguished so you can judge the claims.',
    },
  ],
};

const fa: typeof en = {
  heroPrimary: 'راهکار مناسب فرایندتان را پیدا کنید',
  heroSecondary: 'شبیه‌سازی تعاملی را امتحان کنید',
  heroHint: 'نمی‌دانید از کجا شروع کنید؟ مسیرتان را در ادامه انتخاب کنید.',
  eyebrow: 'از اینجا شروع کنید',
  title: 'چه چیزی را می‌خواهید بهتر کنید؟',
  intro: 'یک مسئله عملی دارید، می‌خواهید عملکرد سیستم را ببینید یا شواهد را بررسی کنید؟ مسیر مناسب خود را انتخاب کنید.',
  tabsLabel: 'انتخاب نقطه شروع',
  nextLabel: 'در این مسیر چه می‌بینید؟',
  timeLabel: 'زمان',
  paths: [
    {
      key: 'workflow', label: 'بهبود یک فرایند', hint: 'از گره واقعی کسب‌وکارتان شروع کنید',
      title: 'یک نقطه شروع کاربردی پیدا کنید.',
      body: 'در راهنمای انتخاب راهکار مشخص کنید کار کجا متوقف می‌شود. پیشنهادهای مرتبط، محدوده هر همکاری و مواردی را که پیش از اجرا باید روشن شوند، بررسی کنید.',
      steps: ['حوزه کسب‌وکار را انتخاب کنید', 'گره فرایند را مشخص کنید', 'راهکارهای مرتبط را ببینید'],
      primary: 'راهکار مناسب را پیدا کنید', href: '/solutions/find',
      secondary: 'همه راهکارها را ببینید', secondaryHref: '/solutions',
      note: 'ابتدا بررسی کنید؛ ثبت درخواست پروژه، گام جداگانه‌ای است.',
    },
    {
      key: 'system', label: 'تجربه عملکرد سیستم', hint: 'تصمیم را تغییر دهید و نتیجه را دنبال کنید',
      title: 'مسیر یک رویداد را در سازمان دنبال کنید.',
      body: 'در سازمان زنده، یک سناریو را انتخاب کنید. شواهد را ببینید، تصمیم انسانی را تغییر دهید و مسیر اقدام پیشنهادی و یادگیری را مقایسه کنید.',
      steps: ['یک سناریو انتخاب کنید', 'تصمیم را بررسی کنید', 'نتیجه را مقایسه کنید'],
      primary: 'ورود به شبیه‌سازی تعاملی', href: '/explore#simulator',
      secondary: 'مدل عملیاتی را بخوانید', secondaryHref: '/system',
      note: 'این تجربه با داده‌های فرضی ساخته شده و هیچ اقدام واقعی در کسب‌وکار انجام نمی‌دهد.',
    },
    {
      key: 'evidence', label: 'بررسی شواهد', hint: 'پشتوانه این رویکرد را بشناسید',
      title: 'کارهای پشت ایده‌ها را بررسی کنید.',
      body: 'شواهد مهندسی منتشرشده و وضعیت هر کدام را ببینید. یا از کوانتی‌ویک مایند بپرسید و منابع پاسخ را بررسی کنید.',
      steps: ['شواهد را بخوانید', 'وضعیت آن‌ها را بسنجید', 'پاسخ را با منابعش بررسی کنید'],
      primary: 'شواهد را بررسی کنید', href: '/proof',
      secondary: 'از کوانتی‌ویک مایند بپرسید', secondaryHref: '/mind',
      note: 'کارهای منتشرشده، نمونه‌های نمایشی و پژوهش‌ها مشخص شده‌اند تا بتوانید ادعاها را بسنجید.',
    },
  ],
};

export function homeGuide(locale: Locale) {
  return locale === 'fa' ? fa : en;
}
