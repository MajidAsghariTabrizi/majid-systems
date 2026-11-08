/** Solutions catalog — public API. Typed source of truth for the commercial layer.
 *  Relation registry (solutionId <-> articleId) lives here ONCE; components
 *  never hardcode cross-links independently. */
import { SALES, type L, type SolutionCategory, type SolutionEntry, type SolutionStatus } from './entries-a';
import { FINANCE } from './entries-b';
import { OPERATIONS } from './entries-c';
import { CX, ENTERPRISE, COMMERCE } from './entries-d';

export type { SolutionEntry, SolutionCategory, SolutionStatus, L };

export const SOLUTIONS: SolutionEntry[] = [
  ...SALES,
  ...FINANCE,
  ...OPERATIONS,
  ...CX,
  ...ENTERPRISE,
  ...COMMERCE,
];

export const FLAGSHIPS = SOLUTIONS.filter((s) => s.status === 'flagship');
export const SCOPING = SOLUTIONS.filter((s) => s.status === 'scoping');

export function getSolution(id: string): SolutionEntry | undefined {
  return SOLUTIONS.find((s) => s.id === id);
}
export function solutionSlug(s: SolutionEntry): string {
  return s.id;
}

export const CATEGORIES: { key: SolutionCategory; label: L<string> }[] = [
  { key: 'sales', label: { en: 'Sales', fa: 'فروش' } },
  { key: 'finance', label: { en: 'Finance & Cash', fa: 'مالی و نقدینگی' } },
  { key: 'operations', label: { en: 'Operations', fa: 'عملیات' } },
  { key: 'cx', label: { en: 'Customer Experience', fa: 'تجربه مشتری' } },
  { key: 'enterprise', label: { en: 'Enterprise AI', fa: 'هوش مصنوعی سازمانی' } },
  { key: 'commerce', label: { en: 'Commerce Intelligence', fa: 'تجارت هوشمند' } },
];

export const STATUS_LABEL: Record<SolutionStatus, L<string> & { hint: L<string> }> = {
  flagship: {
    en: 'Defined delivery path',
    fa: 'مسیر اجرای مشخص',
    hint: { en: 'Scoped engagement with a documented delivery path', fa: 'خدمت متناسب با سازمان، با مراحل اجرای مشخص' },
  },
  scoping: {
    en: 'Discovery first',
    fa: 'شروع با نیازسنجی',
    hint: { en: 'Available for discovery and a custom proposal after we understand your context', fa: 'پیشنهاد اختصاصی پس از بررسی نیاز و امکان‌سنجی' },
  },
};

export const SOLUTION_UI = {
  cta: { en: 'Request This Solution', fa: 'درخواست این راهکار' },
  catalogTitle: { en: 'Solutions', fa: 'راهکارها' },
  catalogLead: {
    en: 'Find the work that gets stuck, explore a practical way forward, and see what a first engagement could include. Each solution is adapted to your organization, with human approval where judgment matters.',
    fa: 'از فروش و نقدینگی تا عملیات و دانش سازمان؛ مسئله خود را پیدا کنید، مسیر پیشنهادی را بشناسید و برای بررسی اجرای متناسب با کسب‌وکارتان درخواست بدهید.',
  },
  searchPlaceholder: { en: 'Search a problem or solution…', fa: 'جست‌وجوی مسئله یا راهکار…' },
  allCategories: { en: 'All', fa: 'همه' },
  viewDetails: { en: 'View details', fa: 'مشاهده جزئیات' },
  finderLink: { en: 'Not sure? Find your solution →', fa: 'برای انتخاب کمک می‌خواهید؟ راهنمای انتخاب راهکار ←' },
  heroEyebrow: { en: 'Quantiviq Solutions', fa: 'راهکارهای کوانتی‌ویک' },
  problemLabel: { en: 'The problem we solve', fa: 'مسئله از کجا شروع می‌شود؟' },
  buyerLabel: { en: 'Who it is for', fa: 'این راهکار برای چه تیمی مناسب است؟' },
  capsLabel: { en: 'What it could include', fa: 'قابلیت‌های پیشنهادی' },
  outcomeLabel: { en: 'What we measure', fa: 'نتیجه‌ای که می‌سنجیم' },
  beforeLabel: { en: 'Before (illustrative workflow)', fa: 'روش رایج پیش از اجرا' },
  afterLabel: { en: 'After (illustrative workflow)', fa: 'مسیر پیشنهادی پس از اجرا' },
  inputsLabel: { en: 'What we start from', fa: 'اطلاعات مورد نیاز برای شروع' },
  deliverablesLabel: { en: 'Delivery and handover', fa: 'مسیر اجرا و تحویل' },
  faqLabel: { en: 'Common questions', fa: 'پرسش‌های متداول' },
  relatedLabel: { en: 'Related solutions', fa: 'راهکارهای مرتبط' },
  relatedInsightsLabel: { en: 'Related research', fa: 'پژوهش‌های مرتبط' },
  requestNote: {
    en: 'Describe your situation to start a discussion. No payment or account is needed to submit a request. We review the context and respond with a next step.',
    fa: 'برای ثبت درخواست به پرداخت یا ساخت حساب نیاز ندارید. مسئله و شرایط کسب‌وکارتان را توضیح دهید تا نیاز اولیه بررسی و گام بعدی مشخص شود.',
  },
  noResults: { en: 'No solutions match — try a different word or category.', fa: 'راهکاری با این جست‌وجو پیدا نشد. عبارت دیگری بنویسید یا دسته‌بندی را تغییر دهید.' },
  confirmation: {
    en: 'Your request has been registered. We will contact you to understand your organization and prepare a tailored proposal.',
    fa: 'درخواست شما ثبت شد. برای بررسی نیاز سازمان و ارائه پیشنهاد اختصاصی با شما ارتباط می‌گیریم.',
  },
  bridgeTitle: { en: 'Apply this to your business', fa: 'از ایده تا اجرا در کسب‌وکار شما' },
  bridgeNote: {
    en: 'Explore how the ideas in this article could shape a practical workflow for your organization.',
    fa: 'ببینید ایده‌های این مقاله چگونه می‌توانند به یک فرایند کاربردی و متناسب با سازمان شما تبدیل شوند.',
  },
  finder: {
    title: { en: 'Find Your Solution', fa: 'راهکار خود را پیدا کنید' },
    lead: { en: 'Three quick questions — answers stay on your device; we only count anonymous category totals for the suggestions you view. Nothing containing your contact details is sent until you submit a request.', fa: 'با پاسخ به سه پرسش کوتاه، پیشنهادهای نزدیک‌تر به نیازتان را ببینید. پاسخ‌ها روی دستگاه شما می‌مانند و فقط آمار بی‌نام دسته‌های انتخابی ثبت می‌شود. اطلاعات تماس تنها هنگام ثبت درخواست ارسال خواهد شد.' },
    q1: { en: 'Which outcome matters most right now?', fa: 'در حال حاضر کدام نتیجه برایتان مهم‌تر است؟' },
    q2: { en: 'What is your current bottleneck?', fa: 'گلوگاه فعلی شما چیست؟' },
    q3: { en: 'What type of business are you?', fa: 'نوع کسب‌وکار شما چیست؟' },
    matches: { en: 'Suggested for you', fa: 'راهکارهای نزدیک‌تر به نیاز شما' },
    why: { en: 'Why this matches', fa: 'چرا این پیشنهاد مناسب است' },
    custom: { en: 'Prefer a custom engagement?', fa: 'مسئله شما به راهکار اختصاصی نیاز دارد؟' },
    customNote: { en: 'Describe the problem in your own words so we can agree a useful starting point.', fa: 'مسئله را با زبان خودتان توضیح دهید تا نقطه شروع و دامنه مناسب همکاری را مشخص کنیم.' },
    start: { en: 'Start over', fa: 'شروع دوباره' },
  },
} as const;

/** Finder taxonomy labels (deterministic; no LLM). */
export const OUTCOME_OPTIONS: { key: string; label: L<string> }[] = [
  { key: 'sales', label: { en: 'Sell more and faster', fa: 'فروش بیشتر و سریع‌تر' } },
  { key: 'cash', label: { en: 'Protect and recover cash', fa: 'بهبود نقدینگی و وصول مطالبات' } },
  { key: 'operations', label: { en: 'Run operations without chaos', fa: 'عملیات بدون آشفتگی' } },
  { key: 'cx', label: { en: 'Serve customers better', fa: 'خدمات بهتر به مشتری' } },
  { key: 'knowledge', label: { en: 'Keep and use organizational knowledge', fa: 'حفظ و استفاده از دانش سازمان' } },
];
export const TYPE_OPTIONS: { key: string; label: L<string> }[] = [
  { key: 'distributor', label: { en: 'Distribution / wholesale', fa: 'پخش / عمده‌فروشی' } },
  { key: 'manufacturer', label: { en: 'Manufacturing', fa: 'تولید' } },
  { key: 'service', label: { en: 'Service business', fa: 'کسب‌وکار خدماتی' } },
  { key: 'online', label: { en: 'Online business', fa: 'کسب‌وکار آنلاین' } },
  { key: 'enterprise', label: { en: 'Larger enterprise', fa: 'سازمان بزرگ' } },
];

/** Finder taxonomy — bilingual labels for EVERY bottleneck tag in the catalog
 *  (closure 2026-11-02: no option ever renders as a raw internal id, options
 *  are grouped per outcome, and the list is curated — never truncated by
 *  source-file order). */
export const BOTTLENECK_LABELS: Record<string, L<string>> = {
  'slow-quotes': { en: 'Quotations take too long', fa: 'صدور پیش‌فاکتور طول می‌کشد' },
  'pricing-errors': { en: 'Pricing errors and margin leaks', fa: 'خطای قیمت‌گذاری و نشت حاشیه سود' },
  'scattered-channels': { en: 'Requests scattered across channels', fa: 'درخواست‌ها پراکنده بین کانال‌ها' },
  'lead-overload': { en: 'Too many leads, no triage', fa: 'سرنخ زیاد، بدون اولویت‌بندی' },
  'forgotten-followup': { en: 'Follow-ups are forgotten', fa: 'پیگیری‌ها فراموش می‌شوند' },
  'crm-rot': { en: 'Customer data decays in the CRM', fa: 'داده مشتریان در CRM کهنه می‌شود' },
  'manual-orders': { en: 'Orders typed in by staff', fa: 'سفارش‌ها را کارکنان دستی ثبت می‌کنند' },
  'irregular-demand': { en: 'Reorders are unpredictable', fa: 'سفارش‌های مجدد قابل پیش‌بینی نیستند' },
  'scheduling': { en: 'Appointment scheduling is chaos', fa: 'تنظیم قرارها آشفته است' },
  'overdue-payments': { en: 'Overdue receivables', fa: 'مطالبات معوق' },
  'no-followup': { en: 'Collections follow-up is ad hoc', fa: 'پیگیری مطالبات برنامه منظم ندارد' },
  'reconciliation': { en: 'Reconciliation eats our days', fa: 'مغایرت‌گیری زمان زیادی می‌گیرد' },
  'month-end-pain': { en: 'Month-end close is chaos', fa: 'بستن حساب‌های پایان ماه آشفته است' },
  'cash-visibility': { en: 'No clear cash picture', fa: 'تصویر روشنی از نقدینگی نداریم' },
  'unapplied-cash': { en: 'Payments received but not matched', fa: 'پرداخت‌ها دریافت ولی تطبیق نشده‌اند' },
  'credit-blindness': { en: 'Customer credit risk is invisible', fa: 'ریسک اعتباری مشتری نامرئی است' },
  'commission-disputes': { en: 'Commission calculations are disputed', fa: 'محاسبه پورسانت مورد اختلاف است' },
  'manual-entry': { en: 'Endless manual data entry', fa: 'ورود دستی بی‌پایان داده' },
  'stock-discrepancy': { en: 'Stock never matches records', fa: 'موجودی واقعی با اطلاعات ثبت‌شده اختلاف دارد' },
  'order-chaos': { en: 'Orders get lost or stuck', fa: 'سفارش‌ها گم یا معلق می‌شوند' },
  'ungoverned-purchasing': { en: 'Purchasing is ungoverned', fa: 'خرید بدون کنترل و فرایند است' },
  'supplier-blindness': { en: 'Supplier performance is opaque', fa: 'عملکرد تأمین‌کنندگان نامشخص است' },
  'chat-approvals': { en: 'Approvals live in chat and paper', fa: 'تأییدها در چت و کاغذ گیر کرده‌اند' },
  'key-person-risk': { en: 'Everything depends on one person', fa: 'همه‌چیز به یک نفر وابسته است' },
  'excel-processes': { en: 'Excel and chat run the company', fa: 'اکسل و چت، شرکت را می‌چرخانند' },
  'system-silos': { en: 'Systems do not talk to each other', fa: 'سیستم‌ها با هم ارتباط ندارند' },
  'dirty-catalog': { en: 'Product data is a mess', fa: 'داده محصولات آشفته است' },
  'forecast-guesswork': { en: 'Buying decisions run on guesses', fa: 'تصمیم‌های خرید بر اساس حدس است' },
  'slow-response': { en: 'Customer responses are slow', fa: 'پاسخ به مشتری کند است' },
  'phone-overload': { en: 'The phone never stops', fa: 'تماس‌های تلفنی بیش از ظرفیت تیم است' },
  'support-overload': { en: 'Support volume overwhelms the team', fa: 'درخواست‌های پشتیبانی بیش از ظرفیت تیم است' },
  'complaint-chaos': { en: 'Complaints are untracked', fa: 'شکایات پیگیری نظام‌مند ندارند' },
  'returns-chaos': { en: 'Returns stall in manual loops', fa: 'مرجوعی‌ها در فرایندهای دستی گیر می‌کنند' },
  'status-calls': { en: 'Status update calls never end', fa: 'تماس‌های «وضعیت سفارش چیست؟» تمام نمی‌شود' },
  'knowledge-locked': { en: 'Knowledge is locked in people and files', fa: 'دانش در افراد و فایل‌ها قفل شده است' },
  'contract-blindness': { en: 'Contract terms are unfindable', fa: 'پیداکردن بندها و تعهدات قرارداد دشوار است' },
  'policy-chaos': { en: 'Policies exist but nobody follows them', fa: 'رویه‌های داخلی روشن و در دسترس نیستند' },
  'info-lag': { en: 'Leaders decide on stale numbers', fa: 'مدیران با آمار کهنه تصمیم می‌گیرند' },
  'market-blindness': { en: 'Competitor moves surprise us', fa: 'حرکات رقبا ما را غافلگیر می‌کند' },
  'slow-onboarding': { en: 'Seller onboarding drags on', fa: 'ورود فروشندگان به پلتفرم طولانی است' },
  'channel-copies': { en: 'Every channel gets different content', fa: 'هر کانال محتوای متفاوتی می‌گیرد' },
};

/** Curated per-outcome option groups (ordered, bilingual, never truncated). */
const BOTTLENECK_GROUPS: Record<string, string[]> = {
  sales: ['slow-quotes', 'pricing-errors', 'scattered-channels', 'lead-overload', 'forgotten-followup', 'crm-rot', 'manual-orders', 'irregular-demand', 'scheduling'],
  cash: ['overdue-payments', 'no-followup', 'reconciliation', 'unapplied-cash', 'cash-visibility', 'credit-blindness', 'commission-disputes', 'month-end-pain'],
  operations: ['stock-discrepancy', 'order-chaos', 'manual-entry', 'ungoverned-purchasing', 'supplier-blindness', 'chat-approvals', 'excel-processes', 'system-silos', 'dirty-catalog', 'forecast-guesswork', 'key-person-risk'],
  cx: ['slow-response', 'phone-overload', 'support-overload', 'complaint-chaos', 'returns-chaos', 'status-calls'],
  knowledge: ['knowledge-locked', 'contract-blindness', 'policy-chaos', 'info-lag', 'system-silos', 'key-person-risk'],
};
const GENERAL_BOTTLENECKS = ['manual-entry', 'excel-processes', 'system-silos', 'key-person-risk'];

/**
 * Bottleneck options for the finder. With an outcome selected, options are the
 * curated group for that outcome (falling back to general bottlenecks when the
 * group is thin) — real tag keys only, so every option carries a bilingual
 * label and actually scores in finderMatch. Without an outcome, a compact
 * cross-cutting selection is shown.
 */
export function bottleneckOptions(outcome?: string): { key: string; label: L<string> }[] {
  let keys: string[];
  if (outcome && BOTTLENECK_GROUPS[outcome]) {
    keys = [...BOTTLENECK_GROUPS[outcome]];
    if (keys.length < 4) keys = [...keys, ...GENERAL_BOTTLENECKS.filter((k) => !keys.includes(k))];
  } else {
    keys = ['slow-quotes', 'overdue-payments', 'stock-discrepancy', 'support-overload', 'knowledge-locked', 'manual-entry', 'system-silos', 'key-person-risk'];
  }
  return keys.filter((k) => BOTTLENECK_LABELS[k]).map((k) => ({ key: k, label: BOTTLENECK_LABELS[k] }));
}

/** Deterministic finder: score = 2*outcome + 2*bottleneck (if chosen) + 1*type match. */
export function finderMatch(answers: { outcome?: string; bottleneck?: string; type?: string }): { solution: SolutionEntry; score: number; reasons: L<string>[] }[] {
  const scored = SOLUTIONS.map((s) => {
    let score = 0;
    const reasons: L<string>[] = [];
    if (answers.outcome && s.tags.outcomes.includes(answers.outcome)) { score += 2; reasons.push(OUTCOME_OPTIONS.find((o) => o.key === answers.outcome)!.label); }
    if (answers.bottleneck && s.tags.bottlenecks.includes(answers.bottleneck)) { score += 2; reasons.push(bottleneckOptions().find((b) => b.key === answers.bottleneck)?.label ?? { en: answers.bottleneck, fa: answers.bottleneck }); }
    if (answers.type && s.tags.types.includes(answers.type)) { score += 1; reasons.push(TYPE_OPTIONS.find((t) => t.key === answers.type)!.label); }
    return { solution: s, score, reasons };
  })
    .filter((x) => x.score >= 2)
    .sort((a, b) => b.score - a.score || b.reasons.length - a.reasons.length || a.solution.id.localeCompare(b.solution.id));
  return scored.slice(0, 3);
}

/** Relation registry: articleId (filename id, e.g. '07-the-real-cost-of-enterprise-ai-agents') -> solutions. */
export function solutionsForArticle(articleId: string): SolutionEntry[] {
  return SOLUTIONS.filter((s) => s.articles.includes(articleId));
}
export function articlesForSolution(id: string): string[] {
  return getSolution(id)?.articles ?? [];
}
