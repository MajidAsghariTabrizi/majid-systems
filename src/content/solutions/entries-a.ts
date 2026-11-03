/** Solutions catalog — Part A (Sales) + shared types.
 * Typed source of truth for the commercial layer. All copy bilingual EN/FA.
 * Status semantics: flagship = deep v1 detail page (honest, scoped);
 * scoping = available for discovery and custom proposal ONLY — never
 * presented as deployed/ready software. No fake prices, SLAs or clients. */
export type SolutionStatus = 'flagship' | 'scoping';
export type SolutionCategory = 'sales' | 'finance' | 'operations' | 'cx' | 'enterprise' | 'commerce';

export type L<T> = { en: T; fa: T };

export type SolutionEntry = {
  id: string;
  category: SolutionCategory;
  status: SolutionStatus;
  title: L<string>;
  oneLiner: L<string>;
  problem: L<string>;
  buyer: L<string>;
  capabilities: L<string[]>;
  outcome: L<string>;
  tags: { outcomes: string[]; bottlenecks: string[]; types: string[] };
  articles: string[];
  related: string[];
  flagship?: {
    before: L<string[]>;
    after: L<string[]>;
    inputs: L<string>;
    deliverables: L<string>;
    faq: L<{ q: string; a: string }[]>;
  };
};

export const SALES: SolutionEntry[] = [
  {
    id: 'quote-desk',
    category: 'sales',
    status: 'flagship',
    title: { en: 'QuoteDesk — Fast Quotation & Pricing Desk', fa: "میز هوشمند پیش‌فاکتور" },
    oneLiner: { en: 'Turn hours of manual quotation work into governed, human-approved workflows — pilot target: minutes per quote.', fa: "از استعلام مشتری تا پیش‌فاکتور آماده تأیید؛ با قیمت، موجودی و قواعد تخفیف سازمان شما." },
    problem: { en: 'Sales teams lose deals while waiting for quotations: pricing lookups across price lists, discounts, stock and currency checks, then re-typing into documents — every quote a small project.', fa: "آماده‌کردن هر پیش‌فاکتور به جست‌وجو در فایل‌های قیمت، بررسی موجودی و هماهنگی تخفیف نیاز دارد. ورود چندباره اطلاعات، پاسخ فروش را کند می‌کند و احتمال خطای قیمت یا حاشیه سود را بالا می‌برد." },
    buyer: { en: 'Sales directors and commercial managers in distribution, manufacturing and B2B services.', fa: "مدیران فروش و بازرگانی شرکت‌های پخش، تولیدی و ارائه‌دهندگان خدمات سازمانی که روزانه استعلام‌های متعدد دریافت می‌کنند." },
    capabilities: {
      en: ['Draft quotations from your price lists, stock and customer history', 'Discount and margin guardrails with human approval before sending', 'Persian and English quotation documents from one source', 'Full audit trail of who approved what'],
      fa: ["تهیه پیش‌نویس از فهرست قیمت، موجودی و سابقه مشتری","کنترل تخفیف و حداقل حاشیه سود پیش از تأیید مسئول فروش","تولید پیش‌فاکتور فارسی و انگلیسی با قالب سازمان","ثبت نسخه‌ها، تأییدکنندگان و علت تغییر قیمت"],
    },
    outcome: { en: 'Pilot target: quotation turnaround cut from hours toward minutes, with pricing discipline and a documented approval trail — measured against your baseline during the pilot.', fa: "هدف، کوتاه‌ترشدن زمان تهیه پیش‌فاکتور و کاهش اصلاحات قیمتی است. میزان بهبود در اجرای آزمایشی، نسبت به زمان و خطای فعلی تیم شما سنجیده می‌شود." },
    tags: { outcomes: ['sales'], bottlenecks: ['slow-quotes', 'pricing-errors'], types: ['distributor', 'manufacturer', 'service'] },
    articles: ['13-human-in-the-loop-vs-human-on-the-loop', '17-agentic-ai-for-fmcg-commercial-operations'],
    related: ['omnichannel-sales', 'pricing-intelligence', 'wholesale-order-portal'],
    flagship: {
      before: { en: ['Request arrives by phone or message', 'Salesperson searches price lists and stock', 'Manager checks discount by chat', 'Document re-typed in Word/Excel', 'Sent hours later — sometimes after the customer bought elsewhere'], fa: ["استعلام در تلفن یا پیام‌رسان دریافت می‌شود","کارشناس قیمت و موجودی را از چند منبع جمع می‌کند","تخفیف در گفت‌وگویی جداگانه تأیید می‌شود","اطلاعات دوباره در سند پیش‌فاکتور وارد می‌شود"] },
      after: { en: ['Request captured once, structured', 'Draft quote assembled automatically from governed sources', 'Human reviews and approves in one screen', 'Branded quotation issued in minutes; every step logged'], fa: ["درخواست یک‌بار و به‌صورت ساخت‌یافته ثبت می‌شود","پیش‌نویس از منابع قیمت و موجودی تأییدشده آماده می‌شود","کارشناس موارد خاص و تخفیف را بازبینی می‌کند","سند نهایی پس از تأیید، با سابقه تغییرات صادر می‌شود"] },
      inputs: { en: 'Price lists, discount rules, stock data (file or API), customer history, quotation template.', fa: "فهرست قیمت، قواعد تخفیف، نمونه موجودی، سابقه مشتری و قالب پیش‌فاکتور؛ دسترسی می‌تواند از فایل یا رابط مجاز سامانه باشد." },
      deliverables: { en: 'Discovery workshop, configured pilot on your real quotations, deployment with approval workflow, training and support.', fa: "بررسی فرایند، اجرای آزمایشی روی نمونه‌های واقعی و تنظیم مسیر تأیید. دامنه استقرار، آموزش و پشتیبانی در پیشنهاد مورد توافق مشخص می‌شود." },
      faq: {
        en: [
          { q: 'Does it send quotes automatically?', a: 'No. Every quotation is approved by a human before it reaches a customer — that is a design principle, not a limitation.' },
          { q: 'Does it replace our ERP?', a: 'No. QuoteDesk works alongside your existing systems, reading governed data and producing documents your process already uses.' },
        ],
        fa: [{"q":"آیا پیش‌فاکتور بدون بازبینی برای مشتری ارسال می‌شود؟","a":"خیر. پیش‌نویس باید پیش از ارسال به تأیید مسئول مجاز برسد و قواعد تخفیف و حاشیه سود رعایت شود."},{"q":"آیا باید سامانه مالی یا فروش را جایگزین کنیم؟","a":"ابتدا امکان استفاده از داده و خروجی سامانه فعلی بررسی می‌شود. هر اتصال یا تغییر لازم، پیش از اجرا در دامنه کار مشخص خواهد شد."}],
      },
    },
  },
  {
    id: 'omnichannel-sales',
    category: 'sales',
    status: 'flagship',
    title: { en: 'Omnichannel Sales Desk', fa: "میز یکپارچه فروش چندکاناله" },
    oneLiner: { en: 'One governed desk for orders and inquiries arriving from WhatsApp, phone, web and field sales.', fa: "استعلام و سفارش‌های پیام‌رسان، تلفن، وب و فروش میدانی را در یک مسیر قابل پیگیری مدیریت کنید." },
    problem: { en: 'Orders arrive through five channels and live in five inboxes; nothing is traceable, follow-ups slip, and the best customer gets the worst answer.', fa: "وقتی درخواست‌ها در چند صندوق ورودی و تلفن شخصی پخش می‌شوند، مسئول پاسخ‌گویی و آخرین وضعیت هر مشتری روشن نیست. ثبت تکراری سفارش و پیگیری‌های ناتمام، هم زمان تیم را می‌گیرد و هم تجربه مشتری را ناهماهنگ می‌کند." },
    buyer: { en: 'Commercial leaders running multi-channel B2B sales teams.', fa: "مدیران بازرگانی و سرپرستان فروش سازمانی که چند کانال دریافت سفارش و چند تیم پاسخ‌گو دارند." },
    capabilities: {
      en: ['Unified intake from messaging, phone notes and web forms', 'Structured order drafts with human confirmation', 'Channel and customer response-time reporting', 'Handoff rules to finance and warehouse'],
      fa: ["ثبت یکپارچه درخواست‌ها از کانال‌های قابل اتصال","ساخت پیش‌نویس سفارش و تأیید آن توسط کارشناس","گزارش زمان پاسخ و درخواست‌های باز به تفکیک کانال","تعریف مسئول و قواعد ارجاع به مالی و انبار"],
    },
    outcome: { en: 'Every inquiry is captured once, answered measurably faster, and never silently dropped.', fa: "دید روشن‌تری از درخواست‌های باز، مسئول هر پیگیری و زمان پاسخ‌گویی ایجاد می‌شود. کاهش درخواست‌های بدون پاسخ و ثبت تکراری، از معیارهای ارزیابی اجرا خواهد بود." },
    tags: { outcomes: ['sales', 'cx'], bottlenecks: ['scattered-channels', 'slow-response'], types: ['distributor', 'manufacturer', 'online'] },
    articles: ['17-agentic-ai-for-fmcg-commercial-operations'],
    related: ['quote-desk', 'customer-support-copilot', 'multichannel-order-management'],
    flagship: {
      before: { en: ['WhatsApp on one phone, email on another', 'Orders copy-pasted between apps', 'No record of what was promised', 'Follow-up depends on memory'], fa: ["درخواست‌ها در چند پیام‌رسان، ایمیل و تلفن پراکنده‌اند","اطلاعات سفارش میان ابزارها دوباره وارد می‌شود","آخرین توافق با مشتری برای همه تیم روشن نیست","مسئولیت پیگیری به حافظه افراد وابسته است"] },
      after: { en: ['All channels land in one structured desk', 'AI drafts the order; human confirms', 'Promises and follow-ups are logged automatically', 'Managers see response time per channel'], fa: ["کانال‌های قابل اتصال به یک فهرست مشترک درخواست متصل می‌شوند","پیش‌نویس سفارش برای تأیید کارشناس آماده می‌شود","تعهدات و اقدام بعدی در پرونده مشتری ثبت می‌شوند","مدیر وضعیت و زمان پاسخ هر کانال را می‌بیند"] },
      inputs: { en: 'Channel access (messaging API or export), product/customer master data, order rules.', fa: "فهرست کانال‌ها و دسترسی مجاز آن‌ها، داده مرجع مشتری و محصول و قواعد ثبت و ارجاع سفارش." },
      deliverables: { en: 'Channel-by-channel pilot, then deployment with routing rules, dashboards and team training.', fa: "اجرای آزمایشی از یک کانال شروع می‌شود؛ قواعد ثبت، ارجاع و گزارش پس از ارزیابی نتیجه به کانال‌های مورد توافق گسترش می‌یابد." },
      faq: {
        en: [
          { q: 'Do you offer a WhatsApp API account?', a: 'No — we work with your existing channels and access. We never ask customers to move channels.' },
          { q: 'What if a channel has no API?', a: 'We design a realistic intake (forwarding address, export, or operator console) instead of pretending integration exists.' },
        ],
        fa: [{"q":"آیا حساب یا دسترسی پیام‌رسان هم ارائه می‌شود؟","a":"این خدمت جایگزین تأمین دسترسی قانونی کانال نیست. از حساب‌ها و روش‌های دسترسی مجاز سازمان استفاده می‌شود و امکان اتصال ابتدا بررسی خواهد شد."},{"q":"اگر کانالی رابط اتصال نداشته باشد چه می‌شود؟","a":"روش جایگزین، مانند ورود اپراتور یا خروجی فایل، بررسی می‌شود. اتصال مستقیم فقط در صورت وجود دسترسی و امکان فنی در پیشنهاد درج خواهد شد."}],
      },
    },
  },
  {
    id: 'lead-qualification',
    category: 'sales',
    status: 'scoping',
    title: { en: "Lead Qualification Assistant", fa: "دستیار ارزیابی و اولویت‌بندی سرنخ فروش" },
    oneLiner: { en: "Triage inbound leads with AI-assisted scoring so your team talks to the right prospects first.", fa: "سرنخ‌های ورودی را با معیارهای روشن دسته‌بندی کنید تا زمان فروش صرف فرصت‌های مناسب‌تر شود." },
    problem: { en: "Every lead looks urgent; salespeople chase the loudest inbox, not the most qualified buyer.", fa: "حجم سرنخ‌ها از ظرفیت پیگیری تیم بیشتر است و اولویت تماس اغلب بر اساس تازگی پیام یا اصرار مخاطب تعیین می‌شود. نبود معیار مشترک، فرصت‌های مناسب را میان درخواست‌های کم‌ارتباط پنهان می‌کند." },
    buyer: { en: "Sales managers with more inbound interest than follow-up capacity.", fa: "مدیران فروش و بازاریابی کسب‌وکارهای خدماتی، تولیدی و آنلاین با حجم بالای درخواست اولیه." },
    capabilities: { en: ["Structured intake and enrichment from your criteria","Transparent scoring rules your team can inspect","Human review before any outreach"], fa: ["ثبت ساخت‌یافته نیاز، نوع مشتری و شرایط اولیه","امتیازدهی بر اساس معیارهای قابل بازبینی تیم فروش","نمایش دلیل اولویت و اطلاعات ناقص هر سرنخ","بازبینی انسانی پیش از تماس یا ارجاع"] },
    outcome: { en: "Follow-up capacity goes to the leads most likely to convert, with a documented reason for every priority.", fa: "صف پیگیری بر اساس تناسب مشتری و شواهد موجود مرتب می‌شود؛ هر اولویت دلیل مشخص دارد و قواعد آن با تجربه تیم قابل اصلاح است." },
    tags: { outcomes: ["sales"], bottlenecks: ["lead-overload"], types: ["service","online","manufacturer"] },
    articles: [],
    related: ["omnichannel-sales","intelligent-crm"],
  },
  {
    id: 'proposal-followup',
    category: 'sales',
    status: 'scoping',
    title: { en: "Proposal Follow-up Desk", fa: "میز پیگیری پیشنهادهای فروش" },
    oneLiner: { en: "Never lose a deal to silence: governed follow-ups on every sent proposal.", fa: "برای هر پیشنهاد ارسالی، مسئول، موعد پیگیری و گام بعدی مشخص داشته باشید." },
    problem: { en: "Proposals are sent and forgotten; nobody knows which follow-up was promised to whom.", fa: "پس از ارسال پیشنهاد، پیگیری‌ها در ایمیل، پیام‌رسان یا حافظه افراد باقی می‌مانند. مدیر فروش نمی‌داند کدام فرصت منتظر تصمیم مشتری است و کدام به اقدام تیم نیاز دارد." },
    buyer: { en: "B2B teams with long proposal cycles.", fa: "تیم‌های فروش سازمانی و پروژه‌ای با چرخه مذاکره طولانی و چند پیشنهاد هم‌زمان." },
    capabilities: { en: ["Proposal register with status and promised dates","Drafted follow-up notes for human review","Simple pipeline visibility without a full CRM migration"], fa: ["ثبت پیشنهادها، وضعیت مذاکره و تاریخ اقدام بعدی","تهیه پیش‌نویس پیام پیگیری برای بازبینی کارشناس","یادآوری تعهدات و پیشنهادهای بدون اقدام","نمای مشترک فرصت‌ها بدون الزام به تعویض سامانه فروش"] },
    outcome: { en: "Every open proposal has a next step, an owner and a date.", fa: "پیشنهادهای باز، صاحب و موعد مشخص پیدا می‌کنند و مدیر فروش می‌تواند تأخیر پیگیری و علت توقف فرصت‌ها را بررسی کند." },
    tags: { outcomes: ["sales"], bottlenecks: ["forgotten-followup"], types: ["service","manufacturer","enterprise"] },
    articles: [],
    related: ["lead-qualification","quote-desk"],
  },
  {
    id: 'intelligent-crm',
    category: 'sales',
    status: 'scoping',
    title: { en: "Intelligent CRM Assistant", fa: "دستیار هوشمند مدیریت ارتباط با مشتری" },
    oneLiner: { en: "Make your existing CRM actually usable: AI-assisted updates, summaries and hygiene.", fa: "یادداشت جلسات، سوابق تماس و اطلاعات مشتری را در سامانه فعلی خود به‌روز و قابل استفاده نگه دارید." },
    problem: { en: "CRM data rots because updating it is nobody’s favorite job.", fa: "به‌روزرسانی دستی سامانه ارتباط با مشتری به تعویق می‌افتد؛ اطلاعات تکراری و سوابق ناقص، اعتماد تیم به گزارش‌ها را کم می‌کند. پیش از هر جلسه نیز جمع‌آوری تاریخچه مشتری زمان‌بر است." },
    buyer: { en: "Organizations with a CRM nobody maintains.", fa: "مدیران فروش و عملیات تجاری سازمان‌هایی که سامانه ارتباط با مشتری دارند اما کیفیت و تازگی داده‌های آن کافی نیست." },
    capabilities: { en: ["Meeting-note capture and structured field updates (human-approved)","Duplicate and stale-record detection","Pre-meeting briefs from history"], fa: ["تبدیل یادداشت جلسه به پیشنهاد به‌روزرسانی فیلدها","تشخیص پرونده‌های تکراری و اطلاعات نیازمند بازبینی","خلاصه سوابق و تعهدات پیش از جلسه","اعمال تغییرات پس از تأیید کارشناس"] },
    outcome: { en: "A CRM your team trusts because keeping it current costs minutes, not evenings.", fa: "اطلاعات مشتری با تلاش دستی کمتر به‌روز می‌شود و خلاصه‌ای قابل اتکا برای پیگیری و تصمیم فروش در دسترس تیم قرار می‌گیرد." },
    tags: { outcomes: ["sales"], bottlenecks: ["crm-rot"], types: ["service","enterprise"] },
    articles: [],
    related: ["lead-qualification","proposal-followup"],
  },
  {
    id: 'wholesale-order-portal',
    category: 'sales',
    status: 'scoping',
    title: { en: "Wholesale Order Portal", fa: "پورتال سفارش‌گیری عمده" },
    oneLiner: { en: "A simple self-service portal so repeat B2B customers order without phone tag.", fa: "به مشتریان عمده امکان دهید محصولات، قیمت اختصاصی و وضعیت سفارش خود را در یک درگاه ببینند." },
    problem: { en: "Your best customers still order by phone message; every order is typed by your staff.", fa: "سفارش‌های تکراری هنوز با تماس و پیام ثبت می‌شوند و کارکنان باید اقلام را دوباره وارد سامانه کنند. مشتری نیز برای اطلاع از دریافت سفارش یا موجودی، ناچار به تماس مجدد است." },
    buyer: { en: "Distributors and manufacturers with repeat wholesale buyers.", fa: "شرکت‌های پخش و تولیدکنندگانی که با خریداران عمده و مشتریان سازمانی تکرارشونده کار می‌کنند." },
    capabilities: { en: ["Customer-specific catalogs and price lists","Order entry with confirmation workflow","Status visibility for the customer"], fa: ["نمایش کاتالوگ و فهرست قیمت مجاز برای هر مشتری","ثبت سفارش با قواعد کنترل و تأیید سازمان","نمایش وضعیت دریافت و رسیدگی به سفارش","کنترل دسترسی مشتریان به اطلاعات اختصاصی خود"] },
    outcome: { en: "Order entry effort drops and customers stop asking \"did you get my order?\".", fa: "سفارش‌های تکراری ساخت‌یافته‌تر ثبت می‌شوند و بخشی از تماس‌های مربوط به وضعیت سفارش و ورود دستی اطلاعات کاهش می‌یابد." },
    tags: { outcomes: ["sales","operations"], bottlenecks: ["manual-orders"], types: ["distributor","manufacturer"] },
    articles: [],
    related: ["quote-desk","reorder-assistant"],
  },
  {
    id: 'sales-appointment-desk',
    category: 'sales',
    status: 'scoping',
    title: { en: "Sales Appointment Desk", fa: "میز هماهنگی جلسات فروش" },
    oneLiner: { en: "Book sales visits and calls without a calendar ping-pong.", fa: "هماهنگی جلسه، یادآوری و تغییر زمان ملاقات را با تقویم و مسیر کاری تیم فروش هماهنگ کنید." },
    problem: { en: "Field sales days are wasted arranging when to meet, not meeting.", fa: "رفت‌وبرگشت پیام برای تعیین زمان جلسه، بخش زیادی از وقت فروشندگان و هماهنگ‌کنندگان را می‌گیرد. تداخل تقویم و تغییرهای ثبت‌نشده نیز برنامه بازدیدهای روزانه را به‌هم می‌زند." },
    buyer: { en: "Field sales teams and their coordinators.", fa: "تیم‌های فروش میدانی، مشاوران فروش و مسئولان هماهنگی جلسات مشتریان." },
    capabilities: { en: ["Availability-based scheduling for your team","Reminders and rescheduling in Persian","Route-friendly day grouping"], fa: ["پیشنهاد زمان بر اساس ظرفیت و تقویم تیم","یادآوری و ثبت تغییر زمان به فارسی","گروه‌بندی بازدیدها متناسب با محدوده و مسیر","ثبت تأیید مشتری و مسئول جلسه"] },
    outcome: { en: "More meetings per week with less coordination overhead.", fa: "برنامه جلسات قابل پیگیری‌تر می‌شود و زمان صرف‌شده برای هماهنگی، تداخل‌ها و ملاقات‌های انجام‌نشده قابل اندازه‌گیری خواهد بود." },
    tags: { outcomes: ["sales"], bottlenecks: ["scheduling"], types: ["distributor","service"] },
    articles: [],
    related: ["omnichannel-sales","reorder-assistant"],
  },
  {
    id: 'reorder-assistant',
    category: 'sales',
    status: 'scoping',
    title: { en: "Reorder Assistant", fa: "دستیار سفارش مجدد مشتریان" },
    oneLiner: { en: "Prompt customers to reorder at the right time, from their own history.", fa: "بر اساس الگوی خرید هر مشتری، زمان مناسب پیشنهاد سفارش مجدد را شناسایی کنید." },
    problem: { en: "Reorders happen when the customer remembers — usually after a stockout on their side.", fa: "پیگیری خرید بعدی معمولاً زمانی آغاز می‌شود که مشتری خود تماس بگیرد یا موجودی‌اش تمام شده باشد. تیم فروش دید منظم و مشترکی از چرخه خرید و مشتریان نیازمند پیگیری ندارد." },
    buyer: { en: "Distributors and suppliers with recurring B2B demand.", fa: "شرکت‌های پخش و تأمین‌کنندگانی که مشتریانشان کالاهای مصرفی را به‌صورت دوره‌ای خریداری می‌کنند." },
    capabilities: { en: ["Consumption-pattern estimation from order history","Human-approved reorder suggestions per customer","Draft reminder messages in Persian"], fa: ["برآورد فاصله خرید از سابقه سفارش هر مشتری","پیشنهاد اقلام و زمان پیگیری برای بازبینی فروشنده","تهیه پیش‌نویس پیام یادآوری متناسب با مشتری","ثبت نتیجه پیگیری و اصلاح الگوی پیشنهاد"] },
    outcome: { en: "Smoother demand, fewer emergency orders, steadier revenue.", fa: "تیم فروش می‌تواند پیگیری خریدهای تکراری را برنامه‌ریزی کند و اثر آن را بر سفارش‌های اضطراری و تداوم خرید مشتری بسنجد." },
    tags: { outcomes: ["sales"], bottlenecks: ["irregular-demand"], types: ["distributor","manufacturer"] },
    articles: [],
    related: ["wholesale-order-portal","sales-forecasting"],
  },
];
