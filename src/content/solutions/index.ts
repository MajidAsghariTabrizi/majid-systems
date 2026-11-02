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
  { key: 'commerce', label: { en: 'Commerce Intelligence', fa: 'هوش تجاری' } },
];

export const STATUS_LABEL: Record<SolutionStatus, L<string> & { hint: L<string> }> = {
  flagship: {
    en: 'Detailed offering',
    fa: 'راهکار تفصیلی',
    hint: { en: 'Scoped engagement with a documented delivery path', fa: 'تعهد تعریف‌شده با مسیر تحویل مستند' },
  },
  scoping: {
    en: 'Scoping engagement',
    fa: 'در مرحله تعریف دامنه',
    hint: { en: 'Available for discovery and a custom proposal after we understand your context', fa: 'برای کشف نیاز و ارائه پیشنهاد اختصاصی، پس از شناخت شرایط شما' },
  },
};

export const SOLUTION_UI = {
  cta: { en: 'Request This Solution', fa: 'درخواست این راهکار' },
  catalogTitle: { en: 'Solutions', fa: 'راهکارها' },
  catalogLead: {
    en: 'Practical AI-enabled solutions for real operating problems. Every engagement is scoped to your organization and delivered with human approvals where judgment matters.',
    fa: 'راهکارهای هوشمند برای مسائل واقعی کسب‌وکار. هر تعهد متناسب با سازمان شما تعریف می‌شود و جایی که قضاوت مهم است، با تأیید انسانی تحویل داده می‌شود.',
  },
  searchPlaceholder: { en: 'Search solutions…', fa: 'جست‌وجوی راهکار…' },
  allCategories: { en: 'All', fa: 'همه' },
  viewDetails: { en: 'View details', fa: 'مشاهده جزئیات' },
  finderLink: { en: 'Not sure? Find your solution →', fa: 'مطمئن نیستید؟ راهکار خود را پیدا کنید ←' },
  heroEyebrow: { en: 'Quantiviq Solutions', fa: 'راهکارهای کوانتی‌ویک' },
  problemLabel: { en: 'The problem we solve', fa: 'مسئله‌ای که حل می‌کنیم' },
  buyerLabel: { en: 'Who it is for', fa: 'برای چه کسانی است' },
  capsLabel: { en: 'What it includes', fa: 'چه چیزی شامل می‌شود' },
  outcomeLabel: { en: 'The outcome', fa: 'نتیجه' },
  beforeLabel: { en: 'Before (illustrative workflow)', fa: 'پیش از اجرا (نمای تصویری)' },
  afterLabel: { en: 'After (illustrative workflow)', fa: 'پس از اجرا (نمای تصویری)' },
  inputsLabel: { en: 'What we start from', fa: 'نقطه شروع' },
  deliverablesLabel: { en: 'How it is delivered', fa: 'نحوه تحویل' },
  faqLabel: { en: 'Common questions', fa: 'پرسش‌های متداول' },
  relatedLabel: { en: 'Related solutions', fa: 'راهکارهای مرتبط' },
  relatedInsightsLabel: { en: 'Related research', fa: 'پژوهش‌های مرتبط' },
  requestNote: {
    en: 'No payment and no account needed. You submit a request; we review your context personally and reply with next steps.',
    fa: 'نه پرداختی در کار است و نه نیاز به حساب کاربری. شما درخواست ثبت می‌کنید؛ ما شرایط شما را شخصاً بررسی و پاسخ می‌دهیم.',
  },
  noResults: { en: 'No solutions match — try a different word or category.', fa: 'راهکاری مطابق پیدا نشد — عبارت یا دسته دیگری را امتحان کنید.' },
  confirmation: {
    en: 'Your request has been registered. We will contact you to understand your organization and prepare a tailored proposal.',
    fa: 'درخواست شما ثبت شد. برای بررسی نیاز سازمان و ارائه پیشنهاد اختصاصی با شما ارتباط می‌گیریم.',
  },
  bridgeTitle: { en: 'Apply this to your business', fa: 'این را در کسب‌وکار خود پیاده کنید' },
  bridgeNote: {
    en: 'We turn the ideas in this article into governed, working workflows for your organization.',
    fa: 'ایده‌های این مقاله را به فرایندهای کارآمد و کنترل‌شده برای سازمان شما تبدیل می‌کنیم.',
  },
  finder: {
    title: { en: 'Find Your Solution', fa: 'راهکار خود را پیدا کنید' },
    lead: { en: 'Three quick questions — answers stay on your device; we only count anonymous category totals for the suggestions you view. Nothing containing your contact details is sent until you submit a request.', fa: 'سه پرسش کوتاه — پاسخ‌ها روی دستگاه شما می‌مانند؛ فقط شمارش بی‌نام دسته‌های انتخابی برای پیشنهادهای نمایش‌داده‌شده ثبت می‌شود. تا زمانی که درخواست ثبت نکنید، هیچ داده‌ای شامل اطلاعات تماس شما ارسال نمی‌شود.' },
    q1: { en: 'Which outcome matters most right now?', fa: 'الان کدام نتیجه برایتان مهم‌تر است؟' },
    q2: { en: 'What is your current bottleneck?', fa: 'گلوگاه فعلی شما چیست؟' },
    q3: { en: 'What type of business are you?', fa: 'نوع کسب‌وکار شما چیست؟' },
    matches: { en: 'Suggested for you', fa: 'پیشنهاد ما برای شما' },
    why: { en: 'Why this matches', fa: 'چرا این پیشنهاد مناسب است' },
    custom: { en: 'Prefer a custom engagement?', fa: 'ترجیح می‌دهید تعهد اختصاصی داشته باشید؟' },
    customNote: { en: 'Tell us the problem in your words; we scope it personally.', fa: 'مسئله را به زبان خودتان بگویید؛ ما شخصاً دامنه‌اش را تعریف می‌کنیم.' },
    start: { en: 'Start over', fa: 'شروع دوباره' },
  },
} as const;

/** Finder taxonomy labels (deterministic; no LLM). */
export const OUTCOME_OPTIONS: { key: string; label: L<string> }[] = [
  { key: 'sales', label: { en: 'Sell more and faster', fa: 'فروش بیشتر و سریع‌تر' } },
  { key: 'cash', label: { en: 'Protect and recover cash', fa: 'حفظ و بازیافت نقدینگی' } },
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
  'no-followup': { en: 'Collections follow-up is ad hoc', fa: 'پیگیری مطالبات اتفاقی است' },
  'reconciliation': { en: 'Reconciliation eats our days', fa: 'مغایرت‌گیری روزهای ما را می‌بلعد' },
  'month-end-pain': { en: 'Month-end close is chaos', fa: 'بستن حساب‌های پایان ماه آشفته است' },
  'cash-visibility': { en: 'No clear cash picture', fa: 'تصویر روشنی از نقدینگی نداریم' },
  'unapplied-cash': { en: 'Payments received but not matched', fa: 'پرداخت‌ها دریافت ولی تطبیق نشده‌اند' },
  'credit-blindness': { en: 'Customer credit risk is invisible', fa: 'ریسک اعتباری مشتری نامرئی است' },
  'commission-disputes': { en: 'Commission calculations are disputed', fa: 'محاسبه پورسانت مورد اختلاف است' },
  'manual-entry': { en: 'Endless manual data entry', fa: 'ورود دستی بی‌پایان داده' },
  'stock-discrepancy': { en: 'Stock never matches records', fa: 'موجودی با رکوردها نمی‌خواند' },
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
  'phone-overload': { en: 'The phone never stops', fa: 'تلفن هیچ‌وقت بند نمی‌آید' },
  'support-overload': { en: 'Support volume overwhelms the team', fa: 'حجم پشتیبانی تیم را خسته کرده است' },
  'complaint-chaos': { en: 'Complaints are untracked', fa: 'شکایات پیگیری نظام‌مند ندارند' },
  'returns-chaos': { en: 'Returns stall in manual loops', fa: 'مرجوعی‌ها در فرایندهای دستی گیر می‌کنند' },
  'status-calls': { en: 'Status update calls never end', fa: 'تماس‌های «وضعیت سفارش چیست؟» تمام نمی‌شود' },
  'knowledge-locked': { en: 'Knowledge is locked in people and files', fa: 'دانش در افراد و فایل‌ها قفل شده است' },
  'contract-blindness': { en: 'Contract terms are unfindable', fa: 'شرایط قراردادها پیدا نمی‌شود' },
  'policy-chaos': { en: 'Policies exist but nobody follows them', fa: 'سیاست‌ها هست ولی کسی اجرا نمی‌کند' },
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
