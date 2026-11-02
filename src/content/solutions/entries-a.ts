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
    title: { en: 'QuoteDesk — Fast Quotation & Pricing Desk', fa: 'میز پیش‌فاکتور — استعلام و قیمت‌گذاری سریع' },
    oneLiner: { en: 'Turn hours of manual quotation work into governed minutes with human-approved AI drafting.', fa: 'ساعت‌ها کار دستی پیش‌فاکتور را به دقایقی کنترل‌شده با پیش‌نویس هوش مصنوعی و تأیید انسانی تبدیل کنید.' },
    problem: { en: 'Sales teams lose deals while waiting for quotations: pricing lookups across price lists, discounts, stock and currency checks, then re-typing into documents — every quote a small project.', fa: 'تیم فروش در انتظار پیش‌فاکتور، مشتری را از دست می‌دهد: جست‌وجوی قیمت در لیست‌ها، تخفیف، موجودی و نرخ ارز، و سپس تایپ مجدد در اسناد — هر پیش‌فاکتور یک پروژه کوچک است.' },
    buyer: { en: 'Sales directors and commercial managers in distribution, manufacturing and B2B services.', fa: 'مدیران فروش و بازرگانی در پخش، تولید و خدمات B2B.' },
    capabilities: {
      en: ['Draft quotations from your price lists, stock and customer history', 'Discount and margin guardrails with human approval before sending', 'Persian and English quotation documents from one source', 'Full audit trail of who approved what'],
      fa: ['پیش‌نویس پیش‌فاکتور از لیست قیمت، موجودی و سابقه مشتری', 'قواعد تخفیف و حاشیه سود با تأیید انسانی پیش از ارسال', 'اسناد پیش‌فاکتور فارسی و انگلیسی از یک منبع واحد', 'ثبت کامل اینکه چه کسی چه چیزی را تأیید کرده'],
    },
    outcome: { en: 'Quotation response time drops from hours to minutes, with pricing discipline and a documented approval trail.', fa: 'زمان پاسخ پیش‌فاکتور از ساعت به دقیقه می‌رسد؛ همراه با انضباط قیمتی و سابقه تأیید مستند.' },
    tags: { outcomes: ['sales'], bottlenecks: ['slow-quotes', 'pricing-errors'], types: ['distributor', 'manufacturer', 'service'] },
    articles: ['13-human-in-the-loop-vs-human-on-the-loop', '17-agentic-ai-for-fmcg-commercial-operations'],
    related: ['omnichannel-sales', 'pricing-intelligence', 'wholesale-order-portal'],
    flagship: {
      before: { en: ['Request arrives by phone or message', 'Salesperson searches price lists and stock', 'Manager checks discount by chat', 'Document re-typed in Word/Excel', 'Sent hours later — sometimes after the customer bought elsewhere'], fa: ['درخواست با تلفن یا پیام می‌رسد', 'فروشنده در لیست قیمت و موجودی جست‌وجو می‌کند', 'مدیر تخفیف را در چت تأیید می‌کند', 'سند در Word/Excel دوباره تایپ می‌شود', 'چند ساعت بعد ارسال می‌شود — گاهی وقتی مشتری جای دیگری خریده است'] },
      after: { en: ['Request captured once, structured', 'Draft quote assembled automatically from governed sources', 'Human reviews and approves in one screen', 'Branded quotation issued in minutes; every step logged'], fa: ['درخواست یک‌بار و ساخت‌یافته ثبت می‌شود', 'پیش‌نویس به‌طور خودکار از منابع کنترل‌شده آماده می‌شود', 'انسان در یک صفحه بازبینی و تأیید می‌کند', 'پیش‌فاکتور رسمی در چند دقیقه صادر می‌شود؛ همه مراحل ثبت است'] },
      inputs: { en: 'Price lists, discount rules, stock data (file or API), customer history, quotation template.', fa: 'لیست قیمت، قواعد تخفیف، داده موجودی (فایل یا API)، سابقه مشتری و قالب پیش‌فاکتور.' },
      deliverables: { en: 'Discovery workshop, configured pilot on your real quotations, deployment with approval workflow, training and support.', fa: 'کارگاه کشف، پایلوت پیکربندی‌شده روی پیش‌فاکتورهای واقعی شما، استقرار با گردش کار تأیید، آموزش و پشتیبانی.' },
      faq: {
        en: [
          { q: 'Does it send quotes automatically?', a: 'No. Every quotation is approved by a human before it reaches a customer — that is a design principle, not a limitation.' },
          { q: 'Does it replace our ERP?', a: 'No. QuoteDesk works alongside your existing systems, reading governed data and producing documents your process already uses.' },
        ],
        fa: [
          { q: 'آیا پیش‌فاکتورها را خودکار ارسال می‌کند؟', a: 'نه. هر پیش‌فاکتور پیش از رسیدن به مشتری توسط انسان تأیید می‌شود — این اصل طراحی است، نه محدودیت.' },
          { q: 'آیا جایگزین ERP ما می‌شود؟', a: 'نه. میز پیش‌فاکتور در کنار سیستم‌های موجود شما کار می‌کند و اسنادی تولید می‌کند که فرایند شما همین امروز استفاده می‌کند.' },
        ],
      },
    },
  },
  {
    id: 'omnichannel-sales',
    category: 'sales',
    status: 'flagship',
    title: { en: 'Omnichannel Sales Desk', fa: 'میز فروش همه‌کاناله' },
    oneLiner: { en: 'One governed desk for orders and inquiries arriving from WhatsApp, phone, web and field sales.', fa: 'یک میز کنترل‌شده برای سفارش‌ها و استعلام‌هایی که از واتس‌اپ، تلفن، وب و فروش میدانی می‌رسد.' },
    problem: { en: 'Orders arrive through five channels and live in five inboxes; nothing is traceable, follow-ups slip, and the best customer gets the worst answer.', fa: 'سفارش‌ها از پنج کانال می‌رسد و در پنج صندوق ورودی زندگی می‌کند؛ هیچ‌چیز قابل ردیابی نیست، پیگیری‌ها جا می‌ماند و بهترین مشتری بدترین پاسخ را می‌گیرد.' },
    buyer: { en: 'Commercial leaders running multi-channel B2B sales teams.', fa: 'سرپرستان فروش B2B با تیم‌های چندکاناله.' },
    capabilities: {
      en: ['Unified intake from messaging, phone notes and web forms', 'Structured order drafts with human confirmation', 'Channel and customer response-time reporting', 'Handoff rules to finance and warehouse'],
      fa: ['دریافت یکپارچه از پیام‌رسان، یادداشت تلفنی و فرم وب', 'پیش‌نویس ساخت‌یافته سفارش با تأیید انسانی', 'گزارش زمان پاسخ به تفکیک کانال و مشتری', 'قواعد تحویل به مالی و انبار'],
    },
    outcome: { en: 'Every inquiry is captured once, answered measurably faster, and never silently dropped.', fa: 'هر استعلام یک‌بار ثبت می‌شود، به‌طور قابل اندازه‌گیری سریع‌تر پاسخ می‌گیرد و هرگز بی‌صدا گم نمی‌شود.' },
    tags: { outcomes: ['sales', 'cx'], bottlenecks: ['scattered-channels', 'slow-response'], types: ['distributor', 'manufacturer', 'online'] },
    articles: ['17-agentic-ai-for-fmcg-commercial-operations'],
    related: ['quote-desk', 'customer-support-copilot', 'multichannel-order-management'],
    flagship: {
      before: { en: ['WhatsApp on one phone, email on another', 'Orders copy-pasted between apps', 'No record of what was promised', 'Follow-up depends on memory'], fa: ['واتس‌اپ روی یک گوشی، ایمیل روی دیگری', 'سفارش‌ها بین برنامه‌ها کپی می‌شوند', 'ثبتی از قول‌های داده‌شده نیست', 'پیگیری به حافظه وابسته است'] },
      after: { en: ['All channels land in one structured desk', 'AI drafts the order; human confirms', 'Promises and follow-ups are logged automatically', 'Managers see response time per channel'], fa: ['همه کانال‌ها در یک میز ساخت‌یافته فرود می‌آیند', 'هوش مصنوعی سفارش را پیش‌نویس می‌کند؛ انسان تأیید می‌کند', 'قول‌ها و پیگیری‌ها خودکار ثبت می‌شوند', 'مدیران زمان پاسخ هر کانال را می‌بینند'] },
      inputs: { en: 'Channel access (messaging API or export), product/customer master data, order rules.', fa: 'دسترسی کانال (API پیام‌رسان یا خروجی)، داده اصلی محصول/مشتری و قواعد سفارش.' },
      deliverables: { en: 'Channel-by-channel pilot, then deployment with routing rules, dashboards and team training.', fa: 'پایلوت کانال‌به‌کانال، سپس استقرار با قواعد مسیریابی، داشبورد و آموزش تیم.' },
      faq: {
        en: [
          { q: 'Do you offer a WhatsApp API account?', a: 'No — we work with your existing channels and access. We never ask customers to move channels.' },
          { q: 'What if a channel has no API?', a: 'We design a realistic intake (forwarding address, export, or operator console) instead of pretending integration exists.' },
        ],
        fa: [
          { q: 'آیا حساب WhatsApp API می‌فروشید؟', a: 'نه — با کانال‌ها و دسترسی‌های موجود شما کار می‌کنیم و هرگز از مشتری نمی‌خواهیم کانالش را عوض کند.' },
          { q: 'اگر کانالی API نداشته باشد؟', a: 'یک مسیر واقع‌بینانه (آدرس ارجاع، خروجی داده یا کنسول اپراتور) طراحی می‌کنیم، نه ادعای یکپارچگی غیرواقعی.' },
        ],
      },
    },
  },
  {
    id: 'lead-qualification',
    category: 'sales',
    status: 'scoping',
    title: { en: "Lead Qualification Assistant", fa: "دستیار غربالگری سرنخ فروش" },
    oneLiner: { en: "Triage inbound leads with AI-assisted scoring so your team talks to the right prospects first.", fa: "اولویت‌بندی سرنخ‌های ورودی با امتیازدهی هوشمند تا تیم شما اول با سرنخ‌های درست صحبت کند." },
    problem: { en: "Every lead looks urgent; salespeople chase the loudest inbox, not the most qualified buyer.", fa: "هر سرنخ فوری به نظر می‌رسد؛ فروشنده پشت بلندترین صدا می‌رود، نه شایسته‌ترین خریدار." },
    buyer: { en: "Sales managers with more inbound interest than follow-up capacity.", fa: "مدیران فروشی که سرنخ ورودی‌شان بیش از ظرفیت پیگیری است." },
    capabilities: { en: ["Structured intake and enrichment from your criteria","Transparent scoring rules your team can inspect","Human review before any outreach"], fa: ["ثبت ساخت‌یافته و غنی‌سازی بر اساس معیارهای شما","قواعد امتیازدهی شفاف و قابل بازبینی برای تیم","بازبینی انسانی پیش از هر تماس"] },
    outcome: { en: "Follow-up capacity goes to the leads most likely to convert, with a documented reason for every priority.", fa: "ظرفیت پیگیری صرف سرنخ‌هایی می‌شود که بیشترین احتمال تبدیل را دارند؛ با دلیل مستند برای هر اولویت." },
    tags: { outcomes: ["sales"], bottlenecks: ["lead-overload"], types: ["service","online","manufacturer"] },
    articles: [],
    related: ["omnichannel-sales","intelligent-crm"],
  },
  {
    id: 'proposal-followup',
    category: 'sales',
    status: 'scoping',
    title: { en: "Proposal Follow-up Desk", fa: "میز پیگیری پیشنهادهای فروش" },
    oneLiner: { en: "Never lose a deal to silence: governed follow-ups on every sent proposal.", fa: "هیچ معامله‌ای در سکوت گم نشود: پیگیری کنترل‌شده برای هر پیشنهاد ارسالی." },
    problem: { en: "Proposals are sent and forgotten; nobody knows which follow-up was promised to whom.", fa: "پیشنهادها ارسال و فراموش می‌شوند؛ کسی نمی‌داند چه پیگیری‌ای به چه کسی قول داده شده." },
    buyer: { en: "B2B teams with long proposal cycles.", fa: "تیم‌های B2B با چرخه طولانی پیشنهاد." },
    capabilities: { en: ["Proposal register with status and promised dates","Drafted follow-up notes for human review","Simple pipeline visibility without a full CRM migration"], fa: ["ثبت پیشنهادها با وضعیت و تاریخ‌های وعده‌داده‌شده","پیش‌نویس یادداشت پیگیری برای بازبینی انسانی","دید خط لوله ساده بدون مهاجرت کامل CRM"] },
    outcome: { en: "Every open proposal has a next step, an owner and a date.", fa: "هر پیشنهاد باز، گام بعدی، مسئول و تاریخ دارد." },
    tags: { outcomes: ["sales"], bottlenecks: ["forgotten-followup"], types: ["service","manufacturer","enterprise"] },
    articles: [],
    related: ["lead-qualification","quote-desk"],
  },
  {
    id: 'intelligent-crm',
    category: 'sales',
    status: 'scoping',
    title: { en: "Intelligent CRM Assistant", fa: "دستیار هوشمند CRM" },
    oneLiner: { en: "Make your existing CRM actually usable: AI-assisted updates, summaries and hygiene.", fa: "CRM موجود را واقعاً قابل استفاده کنید: به‌روزرسانی، خلاصه‌سازی و پاکیزگی داده با کمک هوش مصنوعی." },
    problem: { en: "CRM data rots because updating it is nobody’s favorite job.", fa: "داده CRM می‌پوسد چون به‌روزرسانی آن کار محبوب کسی نیست." },
    buyer: { en: "Organizations with a CRM nobody maintains.", fa: "سازمان‌هایی که CRM‌شان کسی آن را نگه نمی‌دارد." },
    capabilities: { en: ["Meeting-note capture and structured field updates (human-approved)","Duplicate and stale-record detection","Pre-meeting briefs from history"], fa: ["ثبت یادداشت جلسه و به‌روزرسانی ساخت‌یافته فیلدها (با تأیید انسانی)","تشخیص رکورد تکراری و قدیمی","خلاصه پیش از جلسه از تاریخچه"] },
    outcome: { en: "A CRM your team trusts because keeping it current costs minutes, not evenings.", fa: "CRM‌ای که تیم به آن اعتماد می‌کند چون به‌روز نگه‌داشتنش چند دقیقه طول می‌کشد، نه یک شب." },
    tags: { outcomes: ["sales"], bottlenecks: ["crm-rot"], types: ["service","enterprise"] },
    articles: [],
    related: ["lead-qualification","proposal-followup"],
  },
  {
    id: 'wholesale-order-portal',
    category: 'sales',
    status: 'scoping',
    title: { en: "Wholesale Order Portal", fa: "پورتال سفارش عمده" },
    oneLiner: { en: "A simple self-service portal so repeat B2B customers order without phone tag.", fa: "پورتال سلف‌سرویس تا مشتریان عمده تکراری بدون تماس تلفنی سفارش بدهند." },
    problem: { en: "Your best customers still order by phone message; every order is typed by your staff.", fa: "بهترین مشتریان شما هنوز با پیام تلفنی سفارش می‌دهند؛ هر سفارش را کارمند شما تایپ می‌کند." },
    buyer: { en: "Distributors and manufacturers with repeat wholesale buyers.", fa: "پخش‌ها و تولیدکنندگان با خریداران عمده تکراری." },
    capabilities: { en: ["Customer-specific catalogs and price lists","Order entry with confirmation workflow","Status visibility for the customer"], fa: ["کاتالوگ و لیست قیمت اختصاصی هر مشتری","ثبت سفارش با گردش کار تأیید","مشاهده وضعیت برای مشتری"] },
    outcome: { en: "Order entry effort drops and customers stop asking \"did you get my order?\".", fa: "بار ثبت سفارش کم می‌شود و مشتری دیگر نمی‌پرسد «سفارشم رسید؟»." },
    tags: { outcomes: ["sales","operations"], bottlenecks: ["manual-orders"], types: ["distributor","manufacturer"] },
    articles: [],
    related: ["quote-desk","reorder-assistant"],
  },
  {
    id: 'sales-appointment-desk',
    category: 'sales',
    status: 'scoping',
    title: { en: "Sales Appointment Desk", fa: "میز وقت‌گذاری فروش" },
    oneLiner: { en: "Book sales visits and calls without a calendar ping-pong.", fa: "رزرو جلسات و تماس‌های فروش بدون پینگ‌پنگ تقویمی." },
    problem: { en: "Field sales days are wasted arranging when to meet, not meeting.", fa: "روزهای فروش میدانی صرف هماهنگی وقت می‌شود، نه ملاقات." },
    buyer: { en: "Field sales teams and their coordinators.", fa: "تیم‌های فروش میدانی و هماهنگ‌کنندگانشان." },
    capabilities: { en: ["Availability-based scheduling for your team","Reminders and rescheduling in Persian","Route-friendly day grouping"], fa: ["زمان‌بندی بر اساس آزادیِ تقویم تیم","یادآوری و تغییر وقت به فارسی","گروه‌بندی روزانه مناسب مسیر"] },
    outcome: { en: "More meetings per week with less coordination overhead.", fa: "جلسات بیشتر در هفته با هزینه هماهنگی کمتر." },
    tags: { outcomes: ["sales"], bottlenecks: ["scheduling"], types: ["distributor","service"] },
    articles: [],
    related: ["omnichannel-sales","reorder-assistant"],
  },
  {
    id: 'reorder-assistant',
    category: 'sales',
    status: 'scoping',
    title: { en: "Reorder Assistant", fa: "دستیار سفارش مجدد" },
    oneLiner: { en: "Prompt customers to reorder at the right time, from their own history.", fa: "در زمان درست، بر اساس سابقه خود مشتری، او را به سفارش مجدد تشویق کنید." },
    problem: { en: "Reorders happen when the customer remembers — usually after a stockout on their side.", fa: "سفارش مجدد وقتی رخ می‌دهد که مشتری یادش بیاید — معمولاً بعد از اتمام موجودی خودش." },
    buyer: { en: "Distributors and suppliers with recurring B2B demand.", fa: "پخش‌ها و تأمین‌کنندگان با تقاضای تکرارشونده B2B." },
    capabilities: { en: ["Consumption-pattern estimation from order history","Human-approved reorder suggestions per customer","Draft reminder messages in Persian"], fa: ["برآورد الگوی مصرف از تاریخچه سفارش","پیشنهاد سفارش مجدد با تأیید انسانی برای هر مشتری","پیش‌نویس پیام یادآوری به فارسی"] },
    outcome: { en: "Smoother demand, fewer emergency orders, steadier revenue.", fa: "تقاضای نرم‌تر، سفارش‌های اضطراری کمتر و درآمد باثبات‌تر." },
    tags: { outcomes: ["sales"], bottlenecks: ["irregular-demand"], types: ["distributor","manufacturer"] },
    articles: [],
    related: ["wholesale-order-portal","sales-forecasting"],
  },
];
