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
    fa: 'راهکارهای هوشمند برای مسائل واقعی کسب‌وکار. هر تعهد متناسب با سازمان شما تعریف می‌شود و جایی که قضاوت مهم است، با تأیید انسانی تحویل می‌داده می‌شود.',
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
    lead: { en: 'Three quick questions — no sign-in, nothing sent until you choose to submit a request.', fa: 'سه پرسش کوتاه — بدون ثبت‌نام؛ تا زمانی که خودتان درخواست نفرستید، چیزی ارسال نمی‌شود.' },
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

/** Bottleneck options are derived from entry tags so the mapping is real. */
export function bottleneckOptions(): { key: string; label: L<string> }[] {
  const seen = new Map<string, L<string>>();
  const LABELS: Record<string, L<string>> = {
    'slow-quotes': { en: 'Quotations take too long', fa: 'پیش‌فاکتور خیلی طول می‌کشد' },
    'pricing-errors': { en: 'Pricing errors and margin leaks', fa: 'خطای قیمت و نشت حاشیه سود' },
    'scattered-channels': { en: 'Requests scattered across channels', fa: 'درخواست‌ها پراکنده بین کانال‌ها' },
    'slow-response': { en: 'Slow response to customers', fa: 'پاسخ کند به مشتری' },
    'overdue-payments': { en: 'Overdue receivables', fa: 'مطالبات معوق' },
    'no-followup': { en: 'Follow-ups are forgotten', fa: 'پیگیری‌ها فراموش می‌شوند' },
    'reconciliation': { en: 'Reconciliation eats our days', fa: 'مغایرت‌گیری روزهای ما را می‌خورد' },
    'month-end-pain': { en: 'Month-end is chaos', fa: 'پایان ماه آشوب است' },
    'manual-entry': { en: 'Endless manual data entry', fa: 'ورود دستی بی‌پایان داده' },
    'key-person-risk': { en: 'Everything depends on one person', fa: 'همه‌چیز به یک نفر وابسته است' },
    'excel-processes': { en: 'Excel and chat run the company', fa: 'اکسل و چت، شرکت را می‌چرخانند' },
    'stock-discrepancy': { en: 'Stock never matches records', fa: 'موجودی با رکوردها نمی‌خواند' },
    'order-chaos': { en: 'Orders get lost or stuck', fa: 'سفارش‌ها گم یا معلق می‌شوند' },
    'phone-overload': { en: 'The phone never stops', fa: 'تلفن هیچ‌وقت بند نمی‌آید' },
    'support-overload': { en: 'Support volume overwhelms the team', fa: 'حجم پشتیبانی تیم را له می‌کند' },
    'knowledge-locked': { en: 'Knowledge is unfindable', fa: 'دانش، غیرقابل یافتن است' },
    'system-silos': { en: 'Systems do not talk to each other', fa: 'سیستم‌ها با هم حرف نمی‌زنند' },
    'dirty-catalog': { en: 'Product data is a mess', fa: 'داده محصولات آشفته است' },
    'forecast-guesswork': { en: 'Buying on guesses', fa: 'خرید بر اساس حدس' },
    'cash-visibility': { en: 'No clear cash picture', fa: 'تصویر روشنی از نقدینگی نداریم' },
    'lead-overload': { en: 'Too many leads, no triage', fa: 'سرنخ زیاد، بدون اولویت‌بندی' },
    'manual-orders': { en: 'Orders typed by staff', fa: 'سفارش‌ها را کارکنان تایپ می‌کنند' },
  };
  for (const s of SOLUTIONS) for (const b of s.tags.bottlenecks) if (!seen.has(b)) seen.set(b, LABELS[b] ?? { en: b, fa: b });
  // Surface the most meaningful subset (first 10)
  return [...seen.entries()].slice(0, 10).map(([key, label]) => ({ key, label }));
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
    .sort((a, b) => b.score - a.score || (a.solution.status === 'flagship' ? -1 : 1));
  return scored.slice(0, 3);
}

/** Relation registry: articleId (filename id, e.g. '07-the-real-cost-of-enterprise-ai-agents') -> solutions. */
export function solutionsForArticle(articleId: string): SolutionEntry[] {
  return SOLUTIONS.filter((s) => s.articles.includes(articleId));
}
export function articlesForSolution(id: string): string[] {
  return getSolution(id)?.articles ?? [];
}
