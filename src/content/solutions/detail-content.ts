/** Editorial detail for all 40 engagements. Scenarios are hypothetical workflow
 * examples, never customer evidence or a claim of a deployed product. Inputs,
 * deliverables and measures are discussion points; final scope is agreed first. */
import type { L, SolutionCategory, SolutionEntry } from './entries-a';

type Scenario = { context: string; workflow: string; result: string };
type Stage = { title: string; body: string };
type FAQ = { q: string; a: string };
export type SolutionDetail = {
  inputs: L<string[]>;
  deliverables: L<string[]>;
  measures: L<string[]>;
  boundary: L<string>;
  scenario: L<Scenario>;
  stages: L<Stage[]>;
  faq: L<FAQ[]>;
};
type Profile = Pick<SolutionDetail, 'inputs' | 'deliverables' | 'measures' | 'scenario'>;
type Pair = [en: string, fa: string];
function list(items: Pair[]): L<string[]> {
  return { en: items.map(([en]) => en), fa: items.map(([, fa]) => fa) };
}
function profile(inputs: Pair[], deliverables: Pair[], measures: Pair[], en: [string, string, string], fa: [string, string, string]): Profile {
  return {
    inputs: list(inputs), deliverables: list(deliverables), measures: list(measures),
    scenario: {
      en: { context: en[0], workflow: en[1], result: en[2] },
      fa: { context: fa[0], workflow: fa[1], result: fa[2] },
    },
  };
}

const PROFILES: Record<string, Profile> = {
  'quote-desk': profile(
    [['Current price lists and stock snapshots', 'فهرست قیمت و نمونه موجودی فعلی'], ['Discount authority and quotation templates', 'حدود اختیار تخفیف و قالب پیش‌فاکتور'], ['A sample of past quotations', 'نمونه پیش‌فاکتورهای قبلی']],
    [['A reviewed quotation draft and approval route', 'پیش‌نویس پیش‌فاکتور و مسیر تأیید آن'], ['Price-source and revision history', 'سابقه منبع قیمت و اصلاحات'], ['Team handover and operating guide', 'آموزش تیم و راهنمای کار']],
    [['Time from inquiry to approved draft', 'زمان از دریافت استعلام تا پیش‌نویس تأییدشده'], ['Pricing corrections before and after approval', 'تعداد اصلاحات قیمت پیش و پس از تأیید']],
    ['A distributor receives an inquiry for several items.', 'The draft combines approved prices, availability and discount rules; a salesperson checks exceptions.', 'The team issues a traceable quote after approval.'],
    ['یک شرکت پخش برای چند قلم کالا استعلام دریافت می‌کند.', 'پیش‌نویس از قیمت مصوب، موجودی و قواعد تخفیف تهیه می‌شود و کارشناس موارد خارج از قاعده را بررسی می‌کند.', 'پیش‌فاکتور پس از تأیید، با سابقه قابل پیگیری صادر می‌شود.']),
  'omnichannel-sales': profile(
    [['Channel inventory and permitted access methods', 'فهرست کانال‌ها و روش دسترسی مجاز'], ['Customer and product reference data', 'اطلاعات مرجع مشتری و کالا'], ['Routing and response ownership', 'مسئولیت پاسخ‌گویی و قواعد ارجاع']],
    [['A shared inquiry and order register', 'فهرست مشترک استعلام‌ها و سفارش‌ها'], ['Routing and handoff rules', 'قواعد ارجاع و تحویل میان تیم‌ها'], ['Channel response report', 'گزارش پاسخ‌گویی کانال‌ها']],
    [['First-response time by channel', 'زمان اولین پاسخ به تفکیک کانال'], ['Unassigned or duplicated requests', 'درخواست‌های بی‌مسئول یا تکراری']],
    ['A customer starts on WhatsApp and later phones the office.', 'Both interactions are linked to one inquiry, with a named owner and next action.', 'Sales and operations see the same status instead of parallel records.'],
    ['مشتری ابتدا پیام می‌دهد و سپس با دفتر تماس می‌گیرد.', 'دو ارتباط به یک درخواست وصل می‌شوند و مسئول و اقدام بعدی مشخص می‌شود.', 'فروش و عملیات به‌جای پرونده‌های موازی، وضعیت مشترکی می‌بینند.']),
  'lead-qualification': profile(
    [['Lead forms and a sample of past outcomes', 'فرم‌های ورودی و نمونه نتیجه سرنخ‌های قبلی'], ['Ideal-customer criteria and exclusions', 'معیار مشتری مناسب و موارد خارج از دامنه']],
    [['An inspectable qualification rubric', 'چارچوب ارزیابی قابل بازبینی'], ['A prioritized queue with reasons', 'صف اولویت‌بندی‌شده همراه دلیل'], ['A review route for uncertain cases', 'مسیر بررسی موارد نامطمئن']],
    [['Time to first qualified follow-up', 'زمان تا اولین پیگیری سرنخ مناسب'], ['Agreement between scores and team review', 'میزان هم‌خوانی امتیاز با ارزیابی تیم']],
    ['Several inquiries arrive after a campaign.', 'The assistant checks agreed criteria and flags missing information before ranking.', 'A salesperson reviews the queue and chooses whom to contact first.'],
    ['پس از یک کمپین چندین درخواست دریافت می‌شود.', 'دستیار معیارهای توافق‌شده را بررسی می‌کند و اطلاعات ناقص را پیش از اولویت‌بندی نشان می‌دهد.', 'فروشنده صف را بازبینی و ترتیب تماس را تعیین می‌کند.']),
  'proposal-followup': profile(
    [['Proposal register and current statuses', 'فهرست پیشنهادها و وضعیت فعلی'], ['Follow-up policy and account owners', 'رویه پیگیری و مسئول هر مشتری']],
    [['A next-action board for open proposals', 'نمای اقدام بعدی پیشنهادهای باز'], ['Reviewed follow-up drafts and reminders', 'پیش‌نویس پیگیری و یادآوری‌های قابل تأیید']],
    [['Open proposals without a next action', 'پیشنهادهای باز بدون اقدام بعدی'], ['Overdue follow-ups and response rates', 'پیگیری‌های عقب‌افتاده و نرخ دریافت پاسخ']],
    ['A proposal is awaiting feedback for a week.', 'The owner receives a reminder with the last promise and a draft follow-up.', 'The outcome and next date are recorded in the same proposal history.'],
    ['یک پیشنهاد فروش یک هفته منتظر پاسخ مانده است.', 'مسئول پرونده، آخرین توافق و پیش‌نویس پیگیری را همراه یادآوری دریافت می‌کند.', 'نتیجه تماس و موعد بعدی در سابقه همان پیشنهاد ثبت می‌شود.']),
  'intelligent-crm': profile(
    [['CRM schema and authorized export or API', 'ساختار سامانه مشتریان و خروجی یا رابط مجاز'], ['Meeting-note samples and update rules', 'نمونه یادداشت جلسه و قواعد به‌روزرسانی']],
    [['Human-reviewed field-update suggestions', 'پیشنهاد به‌روزرسانی فیلدها برای تأیید'], ['Duplicate and stale-record review queue', 'صف بررسی پرونده‌های تکراری و قدیمی'], ['Pre-meeting customer brief', 'خلاصه سوابق مشتری پیش از جلسه']],
    [['Record completeness and freshness', 'کامل‌بودن و تازگی اطلاعات'], ['Time spent updating a meeting record', 'زمان ثبت و تکمیل سابقه جلسه']],
    ['A salesperson returns from a customer meeting.', 'Notes become proposed field changes and a summary linked to the customer.', 'The salesperson approves corrections before the CRM is updated.'],
    ['فروشنده از جلسه مشتری برمی‌گردد.', 'یادداشت‌ها به خلاصه جلسه و پیشنهاد تغییر فیلدهای همان مشتری تبدیل می‌شوند.', 'اطلاعات پس از بازبینی فروشنده در سامانه به‌روز می‌شود.']),
  'wholesale-order-portal': profile(
    [['Customer-specific products and prices', 'کالا و قیمت مجاز هر مشتری'], ['Order confirmation and access rules', 'قواعد تأیید سفارش و سطح دسترسی']],
    [['A scoped buyer ordering journey', 'مسیر سفارش‌گذاری متناسب با خریدار'], ['Customer access and order-status views', 'دسترسی اختصاصی و نمای وضعیت سفارش']],
    [['Manual re-entry per order', 'ورود مجدد اطلاعات برای هر سفارش'], ['Order-status contacts and completion rate', 'تماس‌های وضعیت سفارش و نرخ تکمیل ثبت']],
    ['A repeat wholesale buyer needs the usual items.', 'The buyer selects permitted products and submits an order for confirmation.', 'Both sides can follow receipt and processing without retyping the same request.'],
    ['یک خریدار عمده، اقلام همیشگی خود را نیاز دارد.', 'مشتری کالاهای مجاز را انتخاب و سفارش را برای تأیید ثبت می‌کند.', 'دریافت و رسیدگی به سفارش بدون ورود مجدد همان درخواست قابل پیگیری است.']),
  'sales-appointment-desk': profile(
    [['Team availability and visit constraints', 'ظرفیت تقویم و محدودیت بازدیدها'], ['Reminder channels and customer consent rules', 'کانال یادآوری و قواعد رضایت مشتری']],
    [['Scheduling and rescheduling workflow', 'گردش کار تعیین و تغییر زمان جلسه'], ['A shared visit calendar with confirmations', 'تقویم مشترک بازدید با وضعیت تأیید']],
    [['Coordination time per meeting', 'زمان هماهنگی هر جلسه'], ['Calendar conflicts and unattended visits', 'تداخل تقویم و بازدیدهای انجام‌نشده']],
    ['A field representative needs three visits in one area.', 'Available slots are grouped around team and location constraints.', 'Confirmed changes are reflected in the shared schedule.'],
    ['نماینده فروش باید سه بازدید در یک محدوده انجام دهد.', 'زمان‌های آزاد با توجه به ظرفیت تیم و محدوده بازدید پیشنهاد می‌شوند.', 'تغییرهای تأییدشده در برنامه مشترک ثبت می‌شوند.']),
  'reorder-assistant': profile(
    [['Customer order history and product codes', 'سابقه سفارش مشتری و شناسه کالا'], ['Contact preferences and sales ownership', 'ترجیح تماس و مسئول فروش مشتری']],
    [['A customer reorder review list', 'فهرست بررسی زمان سفارش مجدد مشتریان'], ['Suggested items and reviewed reminder drafts', 'اقلام پیشنهادی و پیش‌نویس یادآوری']],
    [['Acceptance of reviewed suggestions', 'پذیرش پیشنهادهای بازبینی‌شده'], ['Emergency orders and reorder intervals', 'سفارش‌های اضطراری و فاصله خرید مجدد']],
    ['A customer normally replenishes a product each month.', 'A change in the usual purchase interval creates a suggestion for sales review.', 'The salesperson decides whether a reminder is timely and records the result.'],
    ['مشتری معمولاً هر ماه یک کالا را دوباره خریداری می‌کند.', 'تغییر در فاصله معمول خرید، پیشنهادی برای بازبینی فروشنده ایجاد می‌کند.', 'فروشنده درباره زمان مناسب یادآوری تصمیم می‌گیرد و نتیجه را ثبت می‌کند.']),
  'cash-recovery': profile(
    [['Aged receivables and customer contacts', 'گزارش سنی مطالبات و اطلاعات تماس مجاز'], ['Payment promises and disputed balances', 'وعده‌های پرداخت و مانده‌های مورد اختلاف'], ['Approved tone and escalation rules', 'لحن مکاتبه و قواعد ارجاع مصوب']],
    [['A prioritized collections worklist', 'فهرست اولویت‌بندی‌شده پیگیری مطالبات'], ['Reviewed reminder drafts and promise tracking', 'پیش‌نویس یادآوری و پیگیری وعده پرداخت'], ['A history of actions and unresolved disputes', 'سابقه اقدامات و اختلاف‌های حل‌نشده']],
    [['Overdue balances with a next action', 'مانده معوق دارای اقدام بعدی'], ['Promise-kept rate and collection results', 'نرخ ایفای وعده و نتیجه وصول']],
    ['A customer has an overdue invoice and a partial-payment promise.', 'The balance, dispute status and agreed date appear in one worklist; a human approves the reminder.', 'The team follows the promise without losing the conversation history.'],
    ['یک مشتری فاکتور معوق و وعده پرداخت بخشی از مبلغ را دارد.', 'مانده، وضعیت اختلاف و موعد توافق‌شده در یک صف دیده می‌شوند و مسئول، یادآوری را تأیید می‌کند.', 'وعده پرداخت با حفظ سابقه گفت‌وگو پیگیری می‌شود.']),
  'financial-reconciliation': profile(
    [['Bank, invoice and ledger samples', 'نمونه بانک، فاکتور و دفتر مالی'], ['Matching tolerances and period-close rules', 'حدود مجاز تطبیق و قواعد بستن دوره']],
    [['Matching rules and an exception queue', 'قواعد تطبیق و صف مغایرت‌ها'], ['Source-linked reconciliation report', 'گزارش مغایرت‌گیری با ارجاع به منبع']],
    [['Accepted matching coverage', 'پوشش تطبیق تأییدشده'], ['Review time and age of open exceptions', 'زمان بررسی و عمر مغایرت‌های باز']],
    ['The finance team closes a period with unmatched bank lines.', 'Rule-based matches are proposed and ambiguous items are assigned for review.', 'The closing report separates confirmed matches from unresolved differences.'],
    ['تیم مالی هنگام بستن دوره، ردیف‌های بانکی تطبیق‌نیافته دارد.', 'تطبیق‌های مبتنی بر قاعده پیشنهاد می‌شوند و موارد مبهم مسئول بررسی می‌گیرند.', 'گزارش پایان دوره، تطبیق‌های تأییدشده را از اختلاف‌های باز جدا می‌کند.']),
  'cashflow-intelligence': profile(
    [['Receivables, payables and opening balances', 'مطالبات، بدهی‌ها و مانده ابتدای دوره'], ['Payment timing and scenario assumptions', 'زمان‌بندی پرداخت و فرض‌های سناریو']],
    [['A rolling cash outlook with assumptions', 'تصویر دوره‌ای نقدینگی همراه فرض‌ها'], ['Scenario comparison and variance review', 'مقایسه سناریو و بررسی انحراف از واقعیت']],
    [['Forecast variance by horizon', 'انحراف پیش‌بینی در افق‌های زمانی مختلف'], ['Freshness and coverage of source inputs', 'تازگی و پوشش داده‌های ورودی']],
    ['A large receivable may arrive later than planned.', 'Finance compares the expected date with a delay scenario and planned supplier payments.', 'The team sees which decisions depend on that assumption before committing.'],
    ['احتمال تأخیر در وصول یک طلب بزرگ وجود دارد.', 'مالی، موعد مورد انتظار و سناریوی تأخیر را در کنار پرداخت‌های برنامه‌ریزی‌شده مقایسه می‌کند.', 'پیش از تعهد جدید، تصمیم‌های وابسته به این فرض مشخص می‌شوند.']),
  'invoice-extraction': profile(
    [['Representative scans and PDF invoices', 'نمونه واقعی اسکن و فاکتور PDF'], ['Required fields and validation rules', 'فیلدهای مورد نیاز و قواعد کنترل']],
    [['Structured extraction with source evidence', 'اطلاعات ساخت‌یافته در کنار سند مبدأ'], ['Low-confidence field review and approved exports', 'بازبینی فیلد نامطمئن و خروجی تأییدشده']],
    [['Accuracy by field and document type', 'دقت هر فیلد به تفکیک نوع سند'], ['Human correction time per document', 'زمان اصلاح انسانی هر سند']],
    ['A supplier sends a scanned invoice with a faint total.', 'Extracted fields are shown beside the image; the uncertain amount is flagged.', 'An accountant verifies the total before export to the next system.'],
    ['تأمین‌کننده فاکتور اسکن‌شده‌ای با مبلغ کم‌رنگ ارسال می‌کند.', 'فیلدها کنار تصویر نمایش داده می‌شوند و مبلغ نامطمئن علامت می‌خورد.', 'حسابدار پیش از خروجی اطلاعات، مبلغ را کنترل می‌کند.']),
  'payment-matching': profile(
    [['Bank receipt lines and open invoices', 'ردیف‌های واریز بانکی و فاکتورهای باز'], ['Customer references and allocation rules', 'شناسه مشتری و قواعد تسهیم پرداخت']],
    [['Suggested receipt-to-invoice allocations', 'پیشنهاد تخصیص دریافت به فاکتور'], ['An unresolved-receipt queue with reasons', 'صف دریافت‌های نامشخص همراه دلیل']],
    [['Approved match rate', 'نرخ تطبیق تأییدشده'], ['Unapplied receipt age and review time', 'عمر دریافت تخصیص‌نیافته و زمان بررسی']],
    ['One bank transfer appears to cover two invoices.', 'The system proposes an allocation using amount, date and customer references.', 'Finance confirms the split or leaves it open with a reason.'],
    ['به نظر می‌رسد یک واریز مربوط به دو فاکتور باشد.', 'بر اساس مبلغ، تاریخ و شناسه مشتری، نحوه تخصیص پیشنهاد می‌شود.', 'مالی تقسیم مبلغ را تأیید می‌کند یا با ثبت دلیل، مورد را باز نگه می‌دارد.']),
  'credit-risk-monitor': profile(
    [['Payment history and outstanding exposure', 'سابقه پرداخت و مانده تعهدات مشتری'], ['Credit limits and review authority', 'سقف‌های اعتبار و اختیار بازبینی']],
    [['A credit-review watchlist with evidence', 'فهرست بازبینی اعتبار همراه شواهد'], ['A documented human decision trail', 'سابقه مستند تصمیم مسئول اعتبار']],
    [['Review coverage and alert relevance', 'پوشش بازبینی و مرتبط‌بودن هشدارها'], ['Time from a signal to a recorded decision', 'زمان از مشاهده نشانه تا ثبت تصمیم']],
    ['A customer begins paying later while placing larger orders.', 'The change is flagged against the agreed credit-review criteria.', 'The credit owner reviews context before changing a limit or release decision.'],
    ['مشتری هم‌زمان با سفارش‌های بزرگ‌تر، دیرتر پرداخت می‌کند.', 'تغییر رفتار بر اساس معیارهای توافق‌شده برای بازبینی اعتبار علامت می‌خورد.', 'مسئول اعتبار پیش از تغییر سقف یا مجوز ارسال، شرایط را بررسی می‌کند.']),
  'commission-audit': profile(
    [['Commission plan versions and sales records', 'نسخه طرح پورسانت و سوابق فروش'], ['Returns, collections and adjustment policy', 'مرجوعی، وصول و قواعد تعدیل']],
    [['Recalculated commissions with explanations', 'محاسبه مجدد پورسانت همراه توضیح'], ['An exception report and approval record', 'گزارش اختلاف و سابقه تأیید']],
    [['Unexplained differences before payment', 'اختلاف‌های بدون توضیح پیش از پرداخت'], ['Time to review the monthly calculation', 'زمان بازبینی محاسبه ماهانه']],
    ['A return is posted after a salesperson reaches a bonus threshold.', 'The relevant plan version is applied and the difference is explained.', 'Finance approves the treatment before the payment file is finalized.'],
    ['پس از رسیدن فروشنده به حد نصاب پاداش، یک مرجوعی ثبت می‌شود.', 'نسخه مربوط طرح پورسانت اعمال و اثر مرجوعی بر اختلاف محاسبه روشن می‌شود.', 'مالی پیش از نهایی‌شدن فایل پرداخت، نحوه محاسبه را تأیید می‌کند.']),
  'business-continuity': profile(
    [['Critical processes and service dependencies', 'فرایندهای حیاتی و وابستگی‌های خدمت'], ['Owners, backups and existing recovery notes', 'مسئولان، جانشین‌ها و دستورالعمل‌های موجود']],
    [['A prioritized dependency and risk map', 'نقشه اولویت‌بندی‌شده وابستگی و ریسک'], ['Reviewed continuity playbooks and drill checklists', 'راهنمای تداوم و چک‌لیست تمرین تأییدشده']],
    [['Critical processes with a tested backup', 'فرایندهای حیاتی دارای جانشین آزموده'], ['Drill findings closed and documents kept current', 'موارد رفع‌شده تمرین و تازگی مستندات']],
    ['The only person who handles an essential daily task is unavailable.', 'The backup follows a reviewed playbook and records gaps during a planned exercise.', 'The team updates responsibilities and instructions before a real disruption.'],
    ['تنها مسئول یک فعالیت ضروری روزانه در دسترس نیست.', 'جانشین در یک تمرین برنامه‌ریزی‌شده از راهنمای تأییدشده استفاده و ابهام‌ها را ثبت می‌کند.', 'تیم پیش از اختلال واقعی، دستورالعمل و مسئولیت‌ها را اصلاح می‌کند.']),
  'legacy-automation': profile(
    [['Current spreadsheets, forms and process walkthroughs', 'فایل‌ها، فرم‌ها و شرح فرایند فعلی'], ['Exception cases and data ownership', 'موارد خاص و مالکیت داده']],
    [['A scoped end-to-end pilot workflow', 'گردش کار آزمایشی با دامنه مشخص'], ['Migration, parallel-run and handover plan', 'برنامه انتقال، اجرای موازی و تحویل']],
    [['Manual touches and re-entry errors', 'تعداد اقدام دستی و خطای ورود مجدد'], ['User adoption and unresolved exceptions', 'پذیرش کاربران و موارد خاص حل‌نشده']],
    ['A team coordinates daily work in a shared spreadsheet and chat.', 'One process is mapped and piloted alongside the existing method.', 'Users compare results before agreeing to switch the live process.'],
    ['یک تیم کار روزانه را با اکسل مشترک و پیام‌رسان هماهنگ می‌کند.', 'یک فرایند مشخص ترسیم و در کنار روش فعلی آزمایش می‌شود.', 'کاربران پیش از انتقال جریان اصلی، نتایج دو روش را مقایسه می‌کنند.']),
  'inventory-sync-monitor': profile(
    [['Stock records from the agreed systems', 'سوابق موجودی از سامانه‌های توافق‌شده'], ['Product mapping and stock-count history', 'تطبیق شناسه کالا و سابقه شمارش']],
    [['A stock-discrepancy review board', 'نمای رسیدگی به مغایرت‌های موجودی'], ['Count suggestions and corrective-action history', 'پیشنهاد شمارش و سابقه اقدام اصلاحی']],
    [['Age and value of unresolved discrepancies', 'عمر و ارزش مغایرت‌های حل‌نشده'], ['Repeat causes after corrective action', 'تکرار علت پس از اقدام اصلاحی']],
    ['Warehouse and sales show different quantities for one item.', 'The item is flagged, assigned and checked against movements and a count.', 'The corrected balance and the verified cause remain in the same history.'],
    ['عدد موجودی یک کالا در انبار و فروش متفاوت است.', 'کالا علامت‌گذاری می‌شود و مسئول، گردش‌ها و نتیجه شمارش را بررسی می‌کند.', 'عدد اصلاح‌شده و علت تأییدشده در یک سابقه نگهداری می‌شوند.']),
  'order-exception-desk': profile(
    [['Order statuses and common exception samples', 'وضعیت سفارش‌ها و نمونه مشکلات پرتکرار'], ['Stock, credit and discount decision rules', 'قواعد تصمیم موجودی، اعتبار و تخفیف']],
    [['A categorized exception queue', 'صف دسته‌بندی‌شده سفارش‌های مسئله‌دار'], ['Ownership, escalation and resolution reasons', 'مسئولیت، ارجاع و دلایل رفع مشکل']],
    [['Exception resolution time', 'زمان رسیدگی به سفارش مسئله‌دار'], ['Orders stalled without an owner', 'سفارش‌های متوقف بدون مسئول']],
    ['An otherwise valid order has a credit hold.', 'The order is routed to the authorized reviewer rather than waiting in a general inbox.', 'The decision and its reason are visible to the next team.'],
    ['یک سفارش معتبر به علت محدودیت اعتباری متوقف شده است.', 'سفارش به‌جای انتظار در صف عمومی، به مسئول مجاز بررسی ارجاع می‌شود.', 'تصمیم و دلیل آن برای تیم بعدی قابل مشاهده است.']),
  'purchase-order-automation': profile(
    [['Purchase-request forms and budget references', 'فرم درخواست خرید و ارجاع بودجه'], ['Approval thresholds and supplier templates', 'حدود اختیار تأیید و قالب سفارش تأمین‌کننده']],
    [['A request-to-approval workflow', 'مسیر ثبت درخواست تا تأیید خرید'], ['Approved purchase orders and send history', 'سفارش خرید تأییدشده و سابقه ارسال']],
    [['Requests with approval before commitment', 'درخواست‌های دارای تأیید پیش از تعهد'], ['Approval cycle time and missing information', 'زمان چرخه تأیید و اطلاعات ناقص']],
    ['A department requests equipment above its usual spending limit.', 'The request includes budget context and follows the correct approval threshold.', 'An approved order is prepared only after the responsible person decides.'],
    ['یک واحد تجهیزاتی با مبلغ بالاتر از سقف معمول درخواست می‌کند.', 'درخواست همراه اطلاعات بودجه از مسیر متناسب با حدود اختیار عبور می‌کند.', 'سفارش پس از تصمیم مسئول مجاز آماده می‌شود.']),
  'supplier-intelligence': profile(
    [['Purchase orders, receipts and quality records', 'سفارش خرید، رسید و سوابق کیفیت'], ['Agreed supplier evaluation definitions', 'تعریف شاخص‌های ارزیابی تأمین‌کننده']],
    [['Source-backed supplier scorecards', 'کارنامه تأمین‌کننده با ارجاع به داده'], ['A review brief for sourcing and negotiation', 'گزارش بازبینی برای تأمین و مذاکره']],
    [['On-time delivery and order-fill rates', 'نرخ تحویل به‌موقع و تکمیل سفارش'], ['Coverage and consistency of evaluation data', 'پوشش و یکدستی داده ارزیابی']],
    ['Two suppliers offer similar prices but different delivery performance.', 'Their records are compared using the same definitions and period.', 'Procurement reviews the evidence before choosing or negotiating.'],
    ['دو تأمین‌کننده قیمت مشابه اما عملکرد تحویل متفاوت دارند.', 'سوابق با تعریف شاخص و دوره زمانی یکسان مقایسه می‌شوند.', 'خرید پیش از انتخاب یا مذاکره، شواهد را بازبینی می‌کند.']),
  'document-approval': profile(
    [['Document types and approval matrices', 'انواع سند و جدول اختیارات تأیید'], ['Versioning, delegation and retention rules', 'قواعد نسخه، جانشینی و نگهداری']],
    [['A version-aware approval route', 'مسیر تأیید همراه کنترل نسخه'], ['Decision records and overdue-review visibility', 'سابقه تصمیم و نمای بررسی‌های عقب‌افتاده']],
    [['Approval cycle time', 'زمان چرخه تأیید'], ['Decisions missing a version or reason', 'تصمیم‌های فاقد نسخه سند یا دلیل']],
    ['A price-change document needs two approvals and one reviewer is away.', 'The approved delegation rule routes the correct version to a substitute.', 'The final decision retains the document version and reviewer history.'],
    ['سند تغییر قیمت به دو تأیید نیاز دارد و یک مسئول غایب است.', 'قاعده جانشینی مصوب، نسخه صحیح را به فرد جایگزین ارجاع می‌دهد.', 'تصمیم نهایی همراه نسخه سند و سابقه بررسی ثبت می‌شود.']),
  'catalog-enrichment': profile(
    [['Product exports and category definitions', 'خروجی محصولات و تعریف دسته‌ها'], ['Attribute standards and approved source material', 'استاندارد ویژگی‌ها و منابع معتبر محصول']],
    [['A catalog-quality gap report', 'گزارش شکاف کیفیت کاتالوگ'], ['Reviewed content drafts and clean exports', 'پیش‌نویس محتوای بازبینی‌شده و خروجی پاک‌سازی‌شده']],
    [['Required-attribute completeness', 'درصد تکمیل ویژگی‌های ضروری'], ['Duplicate, conflict and reviewer correction rates', 'نرخ تکرار، تعارض و اصلاح کارشناس']],
    ['A product category lacks consistent dimensions and Persian descriptions.', 'Missing fields are identified and drafts are prepared only from approved sources.', 'A category expert verifies the content before publication.'],
    ['ابعاد و توضیحات فارسی محصولات یک دسته کامل و یکدست نیست.', 'فیلدهای ناقص شناسایی و پیش‌نویس فقط از منابع مجاز تهیه می‌شود.', 'کارشناس دسته پیش از انتشار، صحت محتوا را تأیید می‌کند.']),
  'persian-voice-operator': profile(
    [['Approved call scenarios and knowledge sources', 'سناریوهای تماس و منابع پاسخ مصوب'], ['Telephony access, consent and escalation rules', 'دسترسی تلفنی، رضایت و قواعد ارجاع']],
    [['A bounded Persian call-flow pilot', 'اجرای آزمایشی گفت‌وگوی فارسی با دامنه مشخص'], ['Structured messages and human handoff context', 'پیام ساخت‌یافته و زمینه ارجاع به کارشناس'], ['Call-quality evaluation and operating guidance', 'ارزیابی کیفیت تماس و راهنمای بهره‌برداری']],
    [['Speech understanding and response latency', 'درک گفتار و تأخیر پاسخ'], ['Correct handoff and message completeness', 'ارجاع درست و کامل‌بودن پیام']],
    ['A caller asks a routine service question, then raises an unusual issue.', 'The approved question is answered; the unusual issue is summarized for a person.', 'The caller reaches a human route with context instead of an invented answer.'],
    ['تماس‌گیرنده ابتدا سؤال متداول و سپس موضوعی خارج از سناریو مطرح می‌کند.', 'پرسش مجاز پاسخ داده می‌شود و موضوع خاص برای کارشناس خلاصه می‌شود.', 'موضوع با حفظ زمینه به مسیر انسانی می‌رود و پاسخ حدسی ارائه نمی‌شود.']),
  'customer-support-copilot': profile(
    [['Approved product and support documentation', 'مستندات مصوب محصول و پشتیبانی'], ['Sample tickets and response-quality criteria', 'نمونه تیکت و معیار کیفیت پاسخ']],
    [['Source-linked draft replies', 'پیش‌نویس پاسخ همراه منبع'], ['A review and feedback workflow', 'مسیر بازبینی و ثبت بازخورد کارشناس']],
    [['Draft acceptance and factual corrections', 'پذیرش پیش‌نویس و اصلاح خطای محتوایی'], ['Handling time and source coverage', 'زمان رسیدگی و پوشش منابع']],
    ['A customer asks how a product feature works.', 'The assistant prepares a reply from approved documentation and shows the source.', 'The agent checks the answer, adjusts the tone and sends it.'],
    ['مشتری درباره کارکرد یک قابلیت محصول سؤال می‌کند.', 'دستیار از مستندات مصوب پیش‌نویس می‌سازد و منبع را نمایش می‌دهد.', 'کارشناس پاسخ را بررسی، لحن را تنظیم و سپس ارسال می‌کند.']),
  'complaint-resolution': profile(
    [['Complaint samples and resolution policies', 'نمونه شکایت و رویه رسیدگی'], ['Severity, ownership and response-time rules', 'قواعد شدت، مسئولیت و مهلت پاسخ']],
    [['A complaint case register and action trail', 'فهرست پرونده شکایت و سابقه اقدامات'], ['Recurring-cause and overdue-case reporting', 'گزارش علت‌های تکراری و پرونده‌های معطل']],
    [['Time to owner assignment and resolution', 'زمان تعیین مسئول و خاتمه رسیدگی'], ['Reopened cases and recurring causes', 'پرونده‌های بازگشایی‌شده و علت‌های تکراری']],
    ['A customer reports the same delivery issue through two channels.', 'The reports are linked to one case with severity, owner and next action.', 'The resolution and verified cause are available for quality review.'],
    ['مشتری یک مشکل تحویل را از دو کانال گزارش می‌کند.', 'گزارش‌ها در یک پرونده با شدت، مسئول و اقدام بعدی جمع می‌شوند.', 'نتیجه رسیدگی و علت تأییدشده برای بازبینی کیفیت در دسترس است.']),
  'returns-automation': profile(
    [['Return policies and order records', 'قواعد مرجوعی و سوابق سفارش'], ['Evidence requirements and refund authority', 'مدارک لازم و اختیار بازپرداخت']],
    [['A return-case journey and decision queue', 'مسیر پرونده مرجوعی و صف تصمیم'], ['Status and financial handoff records', 'سابقه وضعیت و ارجاع به مالی']],
    [['Time from request to decided action', 'زمان درخواست تا تصمیم اقدام'], ['Cases missing evidence or financial completion', 'پرونده‌های فاقد مدرک یا تکمیل مالی']],
    ['A buyer requests replacement for a damaged item.', 'Order evidence and policy conditions are collected before an authorized person decides.', 'The replacement or refund remains traceable through completion.'],
    ['خریدار تعویض کالای آسیب‌دیده را درخواست می‌کند.', 'مدارک سفارش و شرایط رویه پیش از تصمیم مسئول مجاز جمع‌آوری می‌شوند.', 'تعویض یا بازپرداخت تا تکمیل نهایی قابل پیگیری می‌ماند.']),
  'customer-selfservice': profile(
    [['Frequently requested information and source systems', 'اطلاعات پرتکرار مورد درخواست و سامانه مبدأ'], ['Customer identity and visibility rules', 'شناسه مشتری و قواعد نمایش اطلاعات']],
    [['A scoped customer information portal', 'درگاه اطلاعات مشتری با دامنه مشخص'], ['Verified access boundaries and support escalation', 'کنترل سطح دسترسی و مسیر ارجاع به پشتیبانی']],
    [['Completion of routine information tasks', 'نرخ انجام درخواست‌های اطلاعاتی متداول'], ['Repeated status contacts and access-test results', 'تماس تکراری وضعیت و نتیجه آزمون دسترسی']],
    ['A buyer needs a past invoice and the status of a new order.', 'The portal displays only that customer’s authorized records.', 'The buyer retrieves information or opens a contextual support request.'],
    ['مشتری فاکتور قبلی و وضعیت سفارش جدید را نیاز دارد.', 'درگاه فقط سوابق مجاز همان مشتری را نمایش می‌دهد.', 'مشتری اطلاعات را دریافت می‌کند یا درخواست پشتیبانی مرتبط ثبت می‌کند.']),
  'private-knowledge-ai': profile(
    [['Approved documents, ownership and versions', 'اسناد مصوب، مالکیت و نسخه‌ها'], ['Access groups and representative questions', 'گروه‌های دسترسی و پرسش‌های نمونه'], ['Security and deployment constraints', 'الزامات امنیت و محدودیت استقرار']],
    [['A permission-aware knowledge pilot', 'دستیار دانش آزمایشی با رعایت دسترسی'], ['Inspectable citations and a coverage report', 'ارجاع قابل بررسی و گزارش پوشش پاسخ'], ['Source maintenance and evaluation guidance', 'راهنمای نگهداری منابع و ارزیابی']],
    [['Answer grounding and citation correctness', 'اتکای پاسخ به منبع و صحت ارجاع'], ['Access isolation and appropriate abstention', 'جداسازی دسترسی و اعلام ندانستن در موقعیت مناسب']],
    ['A new colleague asks about an internal operating procedure.', 'The assistant retrieves only permitted sources and cites the relevant section.', 'The colleague can inspect the source; unanswered questions go to the owner.'],
    ['همکار جدید درباره یک رویه داخلی سؤال می‌کند.', 'دستیار فقط منابع مجاز را بررسی و بخش مرتبط را ارجاع می‌دهد.', 'همکار می‌تواند منبع را بازبینی کند و پرسش بی‌پاسخ به مالک دانش ارجاع می‌شود.']),
  'contract-intelligence': profile(
    [['Contracts and amendments with permitted access', 'قرارداد و الحاقیه با دسترسی مجاز'], ['Standard terms, dates and obligation owners', 'شروط مرجع، موعدها و مسئول تعهدات']],
    [['Source-linked clause and obligation summaries', 'خلاصه بند و تعهد با ارجاع به متن'], ['A reviewed obligation and renewal calendar', 'تقویم بازبینی‌شده تعهد و تمدید']],
    [['Verified extraction coverage', 'پوشش استخراج تأییدشده'], ['Upcoming obligations without an assigned owner', 'تعهدات نزدیک فاقد مسئول مشخص']],
    ['A contract includes a renewal notice period in an amendment.', 'The clause is extracted with the original reference and proposed deadline.', 'A legal reviewer confirms interpretation and assigns the action owner.'],
    ['مهلت اعلام تمدید یک قرارداد در الحاقیه آمده است.', 'بند همراه ارجاع اصلی و موعد پیشنهادی استخراج می‌شود.', 'بررسی‌کننده حقوقی تفسیر را تأیید و مسئول اقدام را مشخص می‌کند.']),
  'policy-assistant': profile(
    [['Approved policy versions and effective dates', 'نسخه مصوب آیین‌نامه و تاریخ اجرا'], ['Access groups and policy owners', 'گروه‌های دسترسی و مالکان رویه']],
    [['Policy answers with source and version', 'پاسخ رویه‌ای همراه منبع و نسخه'], ['An unanswered-question and ambiguity register', 'فهرست پرسش‌های بی‌پاسخ و ابهام‌ها']],
    [['Answer correctness and source freshness', 'صحت پاسخ و تازگی منبع'], ['Repeated questions resolved by documentation', 'پرسش‌های تکراری حل‌شده با تکمیل مستندات']],
    ['An employee asks which expense approval applies.', 'The current approved policy section is shown with its effective date.', 'Ambiguity is referred to the policy owner rather than resolved by guesswork.'],
    ['کارمند درباره تأیید لازم برای یک هزینه سؤال می‌کند.', 'بخش مرتبط از رویه مصوب فعلی همراه تاریخ اعتبار نمایش داده می‌شود.', 'ابهام به مالک رویه ارجاع می‌شود و با حدس پاسخ داده نمی‌شود.']),
  'executive-intelligence': profile(
    [['KPI definitions and authorized data extracts', 'تعریف شاخص و خروجی مجاز منابع داده'], ['Reporting rhythm and decision ownership', 'دوره گزارش و مسئول تصمیم‌ها']],
    [['A reviewed management brief with source links', 'گزارش مدیریتی بازبینی‌شده با ارجاع منبع'], ['An exceptions and open-decisions register', 'فهرست استثناها و تصمیم‌های باز']],
    [['Source freshness and definition consistency', 'تازگی منبع و یکدستی تعریف شاخص'], ['Open decisions followed through each cycle', 'پیگیری تصمیم‌های باز در هر دوره']],
    ['Weekly sales rise while collections fall behind.', 'The brief shows both movements, their sources and the decision that needs attention.', 'Leaders record an owner and review the action in the next cycle.'],
    ['فروش هفتگی افزایش یافته اما وصول عقب افتاده است.', 'گزارش هر دو تغییر، منابع آن‌ها و تصمیم نیازمند توجه را نشان می‌دهد.', 'مدیران مسئول اقدام را ثبت و نتیجه را در دوره بعد بررسی می‌کنند.']),
  'workflow-orchestration': profile(
    [['System interfaces and process boundaries', 'رابط سامانه‌ها و مرزهای فرایند'], ['Authority, failure and retry rules', 'قواعد اختیار، خطا و تلاش مجدد']],
    [['A traceable cross-system workflow pilot', 'فرایند آزمایشی قابل ردیابی بین سامانه‌ها'], ['Approval gates, exception handling and run history', 'نقاط تأیید، رسیدگی به خطا و سابقه اجرا']],
    [['Successful completion and manual intervention', 'تکمیل موفق و میزان مداخله دستی'], ['Recovery from failed or duplicated steps', 'بازیابی مراحل ناموفق یا تکراری']],
    ['An approved order must update two systems and notify operations.', 'Each step is tracked; a failed update becomes a visible exception with a retry rule.', 'The owner can resume the case without repeating completed actions blindly.'],
    ['یک سفارش تأییدشده باید دو سامانه و واحد عملیات را به‌روز کند.', 'هر مرحله ثبت می‌شود و خطای اتصال به مورد قابل مشاهده با قاعده تلاش مجدد تبدیل می‌شود.', 'مسئول می‌تواند پرونده را بدون تکرار بی‌رویه اقدامات تکمیل‌شده ادامه دهد.']),
  'agent-ready-commerce': profile(
    [['Catalog, price, inventory and customer samples', 'نمونه کاتالوگ، قیمت، موجودی و مشتری'], ['Planned automation use cases and ownership', 'کاربردهای خودکارسازی و مالکیت داده']],
    [['An evidence-based data-readiness assessment', 'ارزیابی مستند آمادگی داده'], ['A prioritized remediation and integration plan', 'برنامه اولویت‌بندی‌شده اصلاح و اتصال']],
    [['Completeness, consistency and access readiness', 'کامل‌بودن، سازگاری و آمادگی دسترسی'], ['Critical blockers closed before a pilot', 'موانع حیاتی رفع‌شده پیش از اجرای آزمایشی']],
    ['A retailer wants automation but product identifiers differ by system.', 'The assessment maps identifiers, owners and quality gaps for the intended use case.', 'The next project starts with a defined correction sequence and known dependencies.'],
    ['فروشگاه قصد خودکارسازی دارد اما شناسه محصول در سامانه‌ها متفاوت است.', 'ارزیابی، شناسه‌ها، مسئول داده و شکاف کیفیت را برای کاربرد مورد نظر مشخص می‌کند.', 'پروژه بعدی با ترتیب اصلاحات و وابستگی‌های روشن آغاز می‌شود.']),
  'competitor-monitoring': profile(
    [['A defined competitor and public-source watchlist', 'فهرست مشخص رقبا و منابع عمومی مجاز'], ['Relevant products, topics and review frequency', 'محصول، موضوع و تناوب بازبینی مورد نیاز']],
    [['A periodic source-linked market brief', 'گزارش دوره‌ای بازار با پیوند منبع'], ['A change history and analyst review', 'سابقه تغییرات و بازبینی تحلیل‌گر']],
    [['Relevant changes found and verified', 'تغییرات مرتبط شناسایی و تأییدشده'], ['Source coverage and false-change rate', 'پوشش منابع و نرخ تغییر کاذب']],
    ['A competitor changes a visible price or product assortment.', 'The change is recorded with a dated source and checked for relevance.', 'The commercial team receives a concise brief rather than an unfiltered alert stream.'],
    ['یک رقیب قیمت قابل مشاهده یا تنوع محصول خود را تغییر می‌دهد.', 'تغییر با منبع تاریخ‌دار ثبت و مرتبط‌بودن آن بررسی می‌شود.', 'تیم بازرگانی به‌جای اعلان‌های پراکنده، جمع‌بندی مشخص دریافت می‌کند.']),
  'pricing-intelligence': profile(
    [['Cost, sales, discount and price history', 'سابقه هزینه، فروش، تخفیف و قیمت'], ['Margin rules and price-change authority', 'قواعد حاشیه سود و اختیار تغییر قیمت']],
    [['A margin and price-scenario review', 'تحلیل حاشیه سود و سناریوی قیمت'], ['A documented price decision and review plan', 'تصمیم قیمت مستند و برنامه بازبینی نتیجه']],
    [['Margin impact against stated assumptions', 'اثر حاشیه سود نسبت به فرض‌های اعلام‌شده'], ['Price exceptions and post-change performance', 'استثناهای قیمت و عملکرد پس از تغییر']],
    ['A supplier increases cost for a group of products.', 'The team compares margin under several price and discount scenarios.', 'The pricing owner approves a change with a recorded rationale and review date.'],
    ['تأمین‌کننده هزینه گروهی از کالاها را افزایش می‌دهد.', 'تیم، حاشیه سود را در چند سناریوی قیمت و تخفیف مقایسه می‌کند.', 'مسئول قیمت، تغییر را همراه دلیل و موعد بازبینی تأیید می‌کند.']),
  'seller-onboarding': profile(
    [['Required documents and acceptance criteria', 'مدارک لازم و معیار پذیرش'], ['Reviewer roles and activation dependencies', 'نقش بررسی‌کنندگان و پیش‌نیازهای فعال‌سازی']],
    [['An onboarding checklist and review queue', 'چک‌لیست پذیرش و صف بررسی'], ['A partner status and activation trail', 'سابقه وضعیت و فعال‌سازی شریک']],
    [['Time to complete and activate a file', 'زمان تکمیل و فعال‌سازی پرونده'], ['Repeated document requests and stalled cases', 'درخواست تکراری مدرک و پرونده‌های معطل']],
    ['A new seller submits most documents but one item is missing.', 'The checklist shows the exact gap and routes completed checks to reviewers.', 'Activation waits for the required human decisions with a visible status.'],
    ['فروشنده جدید بیشتر مدارک را ارسال کرده اما یک مورد ناقص است.', 'چک‌لیست نقص دقیق را نشان می‌دهد و بررسی‌های آماده را به مسئولان ارجاع می‌کند.', 'فعال‌سازی با وضعیت روشن، منتظر تصمیم‌های انسانی لازم می‌ماند.']),
  'catalog-syndication': profile(
    [['A product master and channel field requirements', 'اطلاعات مرجع محصول و فیلدهای هر کانال'], ['Authorized publishing methods and review rules', 'روش مجاز انتشار و قواعد بازبینی']],
    [['Channel-specific mappings and export flows', 'تطبیق فیلد و مسیر خروجی هر کانال'], ['A reviewed publication and error-status history', 'سابقه انتشار تأییدشده و وضعیت خطا']],
    [['Cross-channel field consistency', 'یکدستی فیلدها میان کانال‌ها'], ['Rejected updates and manual correction effort', 'به‌روزرسانی ردشده و زمان اصلاح دستی']],
    ['A product specification changes in the approved master.', 'A reviewed update is mapped to the requirements of each connected channel.', 'The team sees which publications succeeded and which need correction.'],
    ['یک ویژگی محصول در منبع مرجع اصلاح می‌شود.', 'تغییر پس از بازبینی به قالب مورد نیاز هر کانال متصل تبدیل می‌شود.', 'تیم می‌بیند کدام انتشار موفق بوده و کدام به اصلاح نیاز دارد.']),
  'sales-forecasting': profile(
    [['Sales, returns and stockout history', 'سابقه فروش، مرجوعی و کمبود موجودی'], ['Planning horizon and purchasing constraints', 'افق برنامه‌ریزی و محدودیت خرید']],
    [['A benchmarked demand forecast and uncertainty range', 'پیش‌بینی تقاضا با روش مبنا و بازه عدم‌قطعیت'], ['A human-adjustable planning and accuracy review', 'برنامه قابل اصلاح و گزارش سنجش خطا']],
    [['Forecast error against a simple baseline', 'خطای پیش‌بینی نسبت به روش مبنای ساده'], ['Bias and planning usefulness by product group', 'سوگیری و کاربردپذیری به تفکیک گروه کالا']],
    ['A planner prepares the next purchasing cycle for seasonal products.', 'The forecast is compared with a simple baseline and adjusted for known business events.', 'The team tracks actual demand before claiming any accuracy improvement.'],
    ['برنامه‌ریز چرخه بعدی خرید کالاهای فصلی را آماده می‌کند.', 'پیش‌بینی با روش مبنای ساده مقایسه و با رویدادهای شناخته‌شده کسب‌وکار اصلاح می‌شود.', 'تیم پیش از اعلام بهبود دقت، نتیجه را با تقاضای واقعی می‌سنجد.']),
  'multichannel-order-management': profile(
    [['Channel orders and inventory interfaces', 'سفارش کانال‌ها و رابط موجودی'], ['Reservation, cancellation and allocation rules', 'قواعد رزرو، لغو و تخصیص موجودی']],
    [['A combined order and reservation view', 'نمای مشترک سفارش و رزرو موجودی'], ['A conflict queue and reviewed recovery path', 'صف تعارض و مسیر بازبینی‌شده رفع مشکل']],
    [['Oversell and stock-related cancellation events', 'موارد فروش مازاد و لغو ناشی از موجودی'], ['Synchronization delay and unresolved conflicts', 'تأخیر همگامی و تعارض‌های حل‌نشده']],
    ['Two channels request the final units of one item.', 'Orders are checked against the agreed reservation rule and conflicts become visible.', 'Operations decides how to allocate stock and records the resolution.'],
    ['دو کانال آخرین واحدهای یک کالا را سفارش می‌دهند.', 'سفارش‌ها با قواعد رزرو توافق‌شده بررسی و تعارض‌ها مشخص می‌شوند.', 'عملیات درباره تخصیص موجودی تصمیم می‌گیرد و نتیجه را ثبت می‌کند.']),
};

const BOUNDARIES: Record<SolutionCategory, L<string>> = {
  sales: { en: 'Prices, promises and outbound messages remain subject to your approved rules and human authority. Channel access is verified before any integration is proposed.', fa: 'قیمت، تعهد به مشتری و پیام خروجی تابع قواعد مصوب و اختیار مسئول سازمان است. امکان اتصال هر کانال پیش از پیشنهاد اجرا بررسی می‌شود.' },
  finance: { en: 'Financial outputs are reviewed by authorized people before posting, payment or customer communication. The workflow supports judgment; it does not guarantee collection or financial outcomes.', fa: 'خروجی مالی پیش از ثبت، پرداخت یا ارتباط با مشتری به تأیید مسئول مجاز می‌رسد. این فرایند به تصمیم‌گیری کمک می‌کند و تضمین وصول یا نتیجه مالی نیست.' },
  operations: { en: 'Operational changes are piloted with exception handling and named owners. System access, data quality and continuity requirements determine the final rollout plan.', fa: 'تغییر عملیاتی با اجرای آزمایشی، مسیر رسیدگی به خطا و مسئول مشخص پیش می‌رود. دسترسی سامانه، کیفیت داده و الزامات تداوم، برنامه استقرار نهایی را تعیین می‌کنند.' },
  cx: { en: 'Customer-facing responses stay within approved information and escalation rules. Access, consent, retention and service hours are agreed as part of the scope.', fa: 'پاسخ به مشتری در محدوده اطلاعات مصوب و قواعد ارجاع باقی می‌ماند. دسترسی، رضایت، نگهداری داده و ساعات خدمت در تعریف دامنه مشخص می‌شوند.' },
  enterprise: { en: 'Source permissions and document ownership govern what can be retrieved or changed. Sensitive interpretation and final decisions remain with the authorized business owner.', fa: 'مجوز منابع و مالکیت اسناد، حدود بازیابی و تغییر اطلاعات را تعیین می‌کند. تفسیر حساس و تصمیم نهایی در اختیار مسئول مجاز سازمان باقی می‌ماند.' },
  commerce: { en: 'Channel capabilities and permitted source access are checked first. Forecasts and pricing scenarios show assumptions and uncertainty; they are not promises of future sales or margins.', fa: 'قابلیت کانال و دسترسی مجاز به منابع ابتدا بررسی می‌شود. پیش‌بینی و سناریوی قیمت با فرض‌ها و عدم‌قطعیت ارائه می‌شوند و وعده فروش یا سود آینده نیستند.' },
};

/** Each current entry has its own profile. Throwing for a missing profile keeps
 * future catalog additions from silently shipping generic detail pages. */
export function getSolutionDetail(solution: SolutionEntry): SolutionDetail {
  const detail = PROFILES[solution.id];
  if (!detail) throw new Error(`Missing solution detail: ${solution.id}`);
  const scoping = solution.status === 'scoping';
  return {
    ...detail,
    boundary: BOUNDARIES[solution.category],
    stages: {
      en: [
        { title: 'Understand the workflow', body: 'Review the current process, representative data, constraints and the people responsible for decisions.' },
        { title: scoping ? 'Agree the scope first' : 'Run a bounded pilot', body: scoping ? 'Define feasibility, inputs, proposed deliverables and acceptance criteria before preparing a tailored implementation proposal.' : 'Test one agreed workflow with real examples, human review and success measures tied to your current baseline.' },
        { title: 'Review before expanding', body: 'Decide the next step from observed results. Any production rollout, training and ongoing support are specified in the agreed proposal.' },
      ],
      fa: [
        { title: 'شناخت فرایند فعلی', body: 'مسیر کار، نمونه داده، محدودیت‌ها و مسئولان تصمیم را با تیم شما بررسی می‌کنیم.' },
        { title: scoping ? 'توافق بر دامنه اجرا' : 'اجرای آزمایشی محدود', body: scoping ? 'امکان‌پذیری، ورودی‌ها، خروجی‌های پیشنهادی و معیار پذیرش را روشن می‌کنیم؛ سپس پیشنهاد اجرایی متناسب با سازمان آماده می‌شود.' : 'یک مسیر توافق‌شده با نمونه‌های واقعی، بازبینی انسانی و معیارهای قابل مقایسه با وضع فعلی آزمایش می‌شود.' },
        { title: 'بازبینی پیش از توسعه', body: 'گام بعدی با توجه به نتیجه واقعی تعیین می‌شود. استقرار، آموزش و پشتیبانی احتمالی در پیشنهاد مورد توافق مشخص خواهند شد.' },
      ],
    },
    faq: {
      en: [
        { q: 'What should we share to start?', a: 'A short description of the process, a few representative examples and the decision owner are enough for the first conversation. Do not send confidential files through the public request form.' },
        { q: 'Is this ready-to-buy software?', a: scoping ? 'This is a scoping engagement. The page describes a potential delivery direction; feasibility, integration, price and timing need discovery and an agreed proposal.' : 'This is an implementation engagement with a documented delivery approach. Configuration, integration, price and timing depend on your data, systems and agreed scope.' },
        { q: 'Do we need to replace our current systems?', a: 'Not automatically. We first examine the existing tools and access methods. Keeping, connecting or replacing a component is an explicit scope decision.' },
      ],
      fa: [
        { q: 'برای شروع چه اطلاعاتی لازم است؟', a: 'شرح کوتاه فرایند، چند نمونه از مسئله و معرفی مسئول تصمیم برای گفت‌وگوی اولیه کافی است. فایل محرمانه را از طریق فرم عمومی درخواست ارسال نکنید.' },
        { q: 'آیا این راهکار نرم‌افزار آماده خرید است؟', a: scoping ? 'این راهکار ابتدا به بررسی نیاز و تعریف دامنه نیاز دارد. مطالب صفحه مسیر پیشنهادی را توضیح می‌دهند؛ امکان اتصال، هزینه و زمان پس از شناخت شرایط و توافق بر پیشنهاد تعیین می‌شوند.' : 'این خدمت با مسیر اجرای مستند ارائه می‌شود. تنظیمات، اتصال‌ها، هزینه و زمان به داده، سامانه‌ها و دامنه مورد توافق شما وابسته است.' },
        { q: 'آیا باید سامانه‌های فعلی را عوض کنیم؟', a: 'لزوماً خیر. ابتدا ابزارها و روش دسترسی موجود را بررسی می‌کنیم. حفظ، اتصال یا جایگزینی هر بخش باید در دامنه مورد توافق مشخص شود.' },
      ],
    },
  };
}
