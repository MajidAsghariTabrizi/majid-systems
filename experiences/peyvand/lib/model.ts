/** Deterministic, fictional opportunity examples. No real people, scores or transactions. */
export type ScenarioId = 'supply' | 'talent' | 'transform';
export type LayerId = 'social' | 'intent' | 'capability' | 'commerce' | 'trust' | 'result';
export type GraphNode = {
  id: string; label: string; role: string; detail: string; evidence: string; x: number; y: number;
};
export type OpportunityRoute = {
  id: string; title: string; reason: string; steps: string[]; nodeIds: string[];
  evidence: string[]; evidenceReady: boolean;
};
export type GraphEdge = { id: string; from: string; to: string; layers: LayerId[]; minPhase: number; label: string };
export type Scenario = {
  id: ScenarioId; title: string; need: string; nodes: GraphNode[]; routes: OpportunityRoute[]; edges: GraphEdge[];
};

export const LAYERS: { id: LayerId; title: string; question: string; description: string }[] = [
  { id: 'social', title: 'شبکه ارتباطات', question: 'چه کسی، چه کسی را می‌شناسد؟', description: 'مسیر معرفی حرفه‌ای را پیدا می‌کند؛ صرف آشنایی، اثبات توانایی یا اجازه تماس نیست.' },
  { id: 'intent', title: 'شبکه نیازها', question: 'چه کسی، اکنون چه می‌خواهد؟', description: 'نیاز جاری، زمان‌بندی و شرایط همکاری را روشن می‌کند؛ هر نیاز با اختیار صاحب آن قابل مشاهده می‌شود.' },
  { id: 'capability', title: 'شبکه توانایی‌ها', question: 'چه کسی واقعاً می‌تواند انجامش دهد؟', description: 'مهارت، ظرفیت آزاد و تجربه مرتبط را به نیاز متصل می‌کند؛ ادعا با شاهد قابل بررسی تفاوت دارد.' },
  { id: 'commerce', title: 'شبکه تجارت', question: 'چه عرضه‌ای با این تقاضا سازگار است؟', description: 'محصول، خدمت، شرایط تأمین و محدودیت‌های عملیاتی را کنار هم قرار می‌دهد؛ پیشنهاد، قرارداد نیست.' },
  { id: 'trust', title: 'شبکه اعتماد', question: 'برای شروع، چه شواهدی لازم است؟', description: 'نمونه‌کار، ارجاع و سابقه همکاری را با رضایت طرفین قابل بررسی می‌کند؛ امتیاز اعتماد ساختگی تولید نمی‌کند.' },
  { id: 'result', title: 'شبکه نتایج', question: 'پس از معرفی، چه اتفاقی افتاد؟', description: 'پذیرش معرفی، گفت‌وگو، توافق و نتیجه تأییدشده را از هم جدا ثبت می‌کند؛ اتصال بیشتر لزوماً معامله بیشتر نیست.' },
];

export const SCENARIOS: Scenario[] = [
  {
    id: 'supply', title: 'توزیع و تأمین', need: 'یک تولیدکننده به دنبال خریدار عمده است.',
    nodes: [
      { id: 'manufacturer', label: 'تولیدکننده', role: 'ظرفیت تولید آزاد', detail: 'در این نمونه فرضی، تولیدکننده می‌خواهد بخشی از ظرفیت آزادش را به سفارش عمده تبدیل کند. نوع محصول و شرایط تحویل باید پیش از معرفی روشن شود.', evidence: 'شاهد فرضی: ظرفیت اعلام‌شده؛ تأیید ظرفیت و مجوز اشتراک اطلاعات در پایلوت لازم است.', x: 170, y: 186 },
      { id: 'distributor', label: 'توزیع‌کننده منطقه‌ای', role: 'دسترسی به بازار محلی', detail: 'به محصول سازگار با شبکه فروش خود نیاز دارد. پوشش جغرافیایی، شرایط تسویه و حداقل سفارش بخشی از تطبیق‌اند.', evidence: 'شاهد فرضی: حوزه فعالیت و یک ارجاع حرفه‌ای با رضایت طرفین.', x: 772, y: 170 },
      { id: 'retailer', label: 'فروشگاه', role: 'نیاز به تأمین پایدار', detail: 'برای موجودی قابل اتکا، تأمین‌کننده مناسب می‌خواهد. سازگاری قیمت، زمان و کیفیت همچنان باید در گفت‌وگو بررسی شود.', evidence: 'شاهد فرضی: درخواست تأمین ثبت‌شده؛ خرید یا مشتری واقعی وجود ندارد.', x: 786, y: 466 },
      { id: 'logistics', label: 'همکار حمل‌ونقل', role: 'ظرفیت ارسال مرتبط', detail: 'در صورت توافق تجاری می‌تواند مسیر تحویل را پوشش دهد. ظرفیت حمل و مسئولیت خسارت جداگانه بررسی می‌شود.', evidence: 'شاهد فرضی: محدوده پوشش و ظرفیت اعلامی؛ هنوز قرارداد یا تأیید عملیاتی نیست.', x: 478, y: 552 },
      { id: 'marketing', label: 'همکار توسعه بازار', role: 'دسترسی به خریدار بالقوه', detail: 'یک مسیر جایگزین برای یافتن تقاضا پیشنهاد می‌دهد، اما شواهد مرتبط با بازار این تولیدکننده هنوز کافی نیست.', evidence: 'شاهد ناکافی در نمونه: سابقه مرتبط باید با اجازه صاحب اطلاعات بررسی شود.', x: 172, y: 448 },
    ],
    edges: [
      { id: 'supply-demand', from: 'manufacturer', to: 'retailer', layers: ['intent', 'capability'], minPhase: 2, label: 'هم‌خوانی نیاز و ظرفیت' },
      { id: 'supply-intro', from: 'manufacturer', to: 'distributor', layers: ['social', 'trust'], minPhase: 3, label: 'معرفی حرفه‌ای با رضایت' },
      { id: 'supply-market', from: 'distributor', to: 'retailer', layers: ['commerce', 'result'], minPhase: 4, label: 'مسیر بالقوه تأمین' },
      { id: 'supply-delivery', from: 'manufacturer', to: 'logistics', layers: ['capability', 'commerce'], minPhase: 2, label: 'امکان پوشش تحویل' },
      { id: 'supply-alternative', from: 'manufacturer', to: 'marketing', layers: ['social', 'commerce'], minPhase: 3, label: 'مسیر مشروط؛ شاهد ناکافی' },
      { id: 'supply-outcome', from: 'logistics', to: 'retailer', layers: ['result'], minPhase: 5, label: 'تحویل احتمالی پس از توافق' },
    ],
    routes: [
      { id: 'regional', title: 'مسیر توزیع منطقه‌ای', reason: 'نیاز فروشگاه با ظرفیت تولیدکننده هم‌خوان است؛ توزیع‌کننده می‌تواند معرفی را تسهیل کند و مسیر حمل نیز قابل بررسی است.', steps: ['تأیید نیاز و ظرفیت', 'معرفی به توزیع‌کننده با رضایت', 'بررسی شرایط فروش و حمل', 'سفارش احتمالی پس از توافق'], nodeIds: ['manufacturer', 'distributor', 'retailer', 'logistics'], evidence: ['درخواست و ظرفیت فرضی هم‌خوان‌اند.', 'یک ارجاع حرفه‌ای فرضی برای بررسی وجود دارد.', 'شرایط قیمت، کیفیت و تسویه هنوز باید توافق شود.'], evidenceReady: true },
      { id: 'market-development', title: 'مسیر توسعه بازار', reason: 'همکار توسعه بازار می‌تواند خریدار بالقوه پیدا کند، اما تجربه او در این محصول هنوز نیازمند بررسی است.', steps: ['شرح بازار هدف', 'درخواست سابقه مرتبط با رضایت', 'معرفی مشروط به تأیید شاهد', 'گفت‌وگوی اولیه؛ بدون تعهد'], nodeIds: ['manufacturer', 'marketing', 'retailer'], evidence: ['سابقه مرتبط در این نمونه هنوز تأیید نشده است.', 'بدون تکمیل شاهد و رضایت، معرفی انجام نمی‌شود.'], evidenceReady: false },
    ],
  },
  {
    id: 'talent', title: 'کار و همکاری', need: 'یک شرکت به دنبال متخصص مناسب است.',
    nodes: [
      { id: 'company', label: 'شرکت', role: 'پروژه با دامنه روشن', detail: 'شرکت برای یک پروژه مشخص به همکاری تخصصی نیاز دارد. دامنه، زمان و نحوه همکاری پیش از تطبیق باید روشن شوند.', evidence: 'شاهد فرضی: شرح پروژه؛ موقعیت شغلی یا کارفرمای واقعی نیست.', x: 170, y: 186 },
      { id: 'professional', label: 'متخصص', role: 'مهارت مرتبط با پروژه', detail: 'مهارت متخصص با بخشی از نیاز پروژه هم‌خوان است. زمان در دسترس و شرایط همکاری باید توسط خود او تأیید شود.', evidence: 'شاهد فرضی: مهارت اعلام‌شده و نمونه‌کار مرتبط؛ استخدام یا صلاحیت واقعی احراز نشده است.', x: 772, y: 170 },
      { id: 'connection', label: 'ارتباط حرفه‌ای مشترک', role: 'تسهیل معرفی', detail: 'یک آشنای حرفه‌ای می‌تواند زمینه معرفی را فراهم کند؛ اشتراک هویت و اطلاعات تماس منوط به رضایت مستقل هر دو طرف است.', evidence: 'شاهد فرضی: ارتباط مشترک با اجازه معرفی؛ آشنایی به‌تنهایی تضمین کیفیت نیست.', x: 786, y: 466 },
      { id: 'portfolio', label: 'نمونه‌کار', role: 'شاهد توانایی مرتبط', detail: 'نمونه‌کار در صورت اجازه صاحب آن بررسی می‌شود تا نسبت مهارت ادعایی با نیاز پروژه روشن شود.', evidence: 'شاهد فرضی و قابل بررسی در روایت؛ هیچ نمونه‌کار شخص واقعی استفاده نشده است.', x: 478, y: 552 },
      { id: 'collaboration', label: 'همکاری احتمالی', role: 'نتیجه پس از توافق', detail: 'تطبیق صرفاً به معرفی می‌رسد. شروع همکاری به گفت‌وگو، توافق و پذیرش طرفین وابسته است.', evidence: 'نتیجه در این صفحه شبیه‌سازی است؛ همکاری واقعی یا عملکرد مالی ثبت نشده است.', x: 172, y: 448 },
    ],
    edges: [
      { id: 'talent-need', from: 'company', to: 'professional', layers: ['intent', 'capability', 'commerce'], minPhase: 2, label: 'نیاز پروژه و مهارت مرتبط' },
      { id: 'talent-mutual', from: 'company', to: 'connection', layers: ['social'], minPhase: 3, label: 'مسیر معرفی با اجازه' },
      { id: 'talent-reference', from: 'connection', to: 'professional', layers: ['social', 'trust'], minPhase: 3, label: 'زمینه حرفه‌ای مشترک' },
      { id: 'talent-work', from: 'professional', to: 'portfolio', layers: ['capability', 'trust'], minPhase: 4, label: 'شاهد قابل بررسی توانایی' },
      { id: 'talent-result', from: 'company', to: 'collaboration', layers: ['result'], minPhase: 5, label: 'همکاری احتمالی پس از توافق' },
      { id: 'talent-fit', from: 'professional', to: 'collaboration', layers: ['commerce', 'result'], minPhase: 5, label: 'پذیرش شرایط توسط متخصص' },
    ],
    routes: [
      { id: 'referred', title: 'معرفی با شاهد و ارتباط مشترک', reason: 'مهارت و نمونه‌کار با نیاز پروژه مرتبط‌اند؛ یک ارتباط مشترک می‌تواند معرفی رضایتی را تسهیل کند.', steps: ['روشن‌شدن دامنه پروژه', 'بررسی نمونه‌کار با اجازه', 'پذیرش معرفی توسط دو طرف', 'گفت‌وگو و همکاری احتمالی'], nodeIds: ['company', 'professional', 'connection', 'portfolio', 'collaboration'], evidence: ['ارتباط مهارت با شرح پروژه در داده فرضی دیده می‌شود.', 'نمونه‌کار فرضی برای بررسی در دسترس است.', 'شرایط همکاری و دسترس‌پذیری هنوز نیازمند توافق‌اند.'], evidenceReady: true },
      { id: 'direct', title: 'آشنایی مستقیم؛ نیازمند شاهد بیشتر', reason: 'مهارت اعلامی مرتبط است، اما تطبیق صرفاً متنی برای پیشنهاد همکاری کافی نیست.', steps: ['شرح نیاز', 'درخواست شاهد مرتبط', 'رضایت به معرفی مستقیم', 'ارزیابی انسانی پیش از توافق'], nodeIds: ['company', 'professional', 'collaboration'], evidence: ['در این مسیر، نمونه‌کار هنوز بررسی نشده است.', 'هیچ تصمیم استخدامی خودکار گرفته نمی‌شود.'], evidenceReady: false },
    ],
  },
  {
    id: 'transform', title: 'تحول کسب‌وکار', need: 'یک کسب‌وکار می‌خواهد هزینه‌های عملیاتی خود را کاهش دهد.',
    nodes: [
      { id: 'distributor', label: 'شرکت پخش', role: 'فرایند دستی و تکراری', detail: 'در این نمونه، ورود چندباره اطلاعات و پیگیری دستی مانع جریان کار است. هزینه و خطا ابتدا باید در خط مبنا اندازه‌گیری شوند.', evidence: 'فرض مسئله: فرایند دستی؛ هیچ عدد صرفه‌جویی یا هزینه واقعی ارائه نشده است.', x: 170, y: 186 },
      { id: 'automation', label: 'متخصص خودکارسازی', role: 'توانایی بازطراحی فرایند', detail: 'توانایی پیشنهادی، اتصال هوش مصنوعی به یک فرایند محدود با کنترل انسانی است؛ اجرا به بررسی سامانه‌ها و داده‌ها وابسته است.', evidence: 'شاهد فرضی: تجربه مرتبط با فرایند؛ آمادگی عملیاتی یا نتیجه مشتری ادعا نمی‌شود.', x: 772, y: 170 },
      { id: 'integrator', label: 'همکار یکپارچه‌سازی', role: 'اتصال سامانه‌های موجود', detail: 'امکان اتصال سامانه‌های شرکت را بررسی می‌کند. دسترسی‌ها، مسئولیت‌ها و محدودیت داده باید پیش از پایلوت توافق شوند.', evidence: 'شاهد فرضی: قابلیت فنی اعلام‌شده؛ دسترسی واقعی به هیچ سامانه‌ای وجود ندارد.', x: 786, y: 466 },
      { id: 'connection', label: 'معرف حرفه‌ای', role: 'ارتباط از پیش موجود', detail: 'می‌تواند معرفی اولیه را با رضایت طرفین تسهیل کند؛ نام و اطلاعات تماس هیچ فرد واقعی در این نمونه استفاده نشده است.', evidence: 'شاهد فرضی: یک مسیر ارتباط حرفه‌ای؛ نه تأیید صلاحیت یا ضمانت نتیجه.', x: 478, y: 552 },
      { id: 'pilot', label: 'پایلوت محدود', role: 'آزمون اثر واقعی', detail: 'یک فرایند، داده مجاز و معیار موفقیت روشن انتخاب می‌شوند. تصمیم به ادامه فقط پس از سنجش نتیجه با خط مبنا گرفته می‌شود.', evidence: 'پیشنهاد آزمایش؛ هیچ پایلوت، کاهش هزینه یا قرارداد واقعی آغاز نشده است.', x: 172, y: 448 },
    ],
    edges: [
      { id: 'transform-need', from: 'distributor', to: 'automation', layers: ['intent', 'capability'], minPhase: 2, label: 'نیاز عملیاتی و توانایی مرتبط' },
      { id: 'transform-intro', from: 'distributor', to: 'connection', layers: ['social', 'trust'], minPhase: 3, label: 'معرفی حرفه‌ای رضایتی' },
      { id: 'transform-reference', from: 'connection', to: 'automation', layers: ['social', 'trust'], minPhase: 4, label: 'بررسی سابقه مرتبط با اجازه' },
      { id: 'transform-integrate', from: 'automation', to: 'integrator', layers: ['capability', 'commerce'], minPhase: 2, label: 'تکمیل توانایی اجرا' },
      { id: 'transform-pilot', from: 'distributor', to: 'pilot', layers: ['commerce', 'result'], minPhase: 5, label: 'تعریف پایلوت با کنترل انسانی' },
      { id: 'transform-evaluate', from: 'integrator', to: 'pilot', layers: ['result'], minPhase: 5, label: 'اندازه‌گیری نتیجه؛ نه وعده صرفه‌جویی' },
    ],
    routes: [
      { id: 'bounded-pilot', title: 'پایلوت یک فرایند با تیم مکمل', reason: 'مسئله عملیاتی با توانایی خودکارسازی و یکپارچه‌سازی هم‌خوان است؛ یک معرف حرفه‌ای مسیر گفت‌وگو را تسهیل می‌کند.', steps: ['ثبت خط مبنای فرایند', 'بررسی شاهد و دسترسی مجاز', 'توافق پایلوت محدود', 'سنجش نتیجه پیش از گسترش'], nodeIds: ['distributor', 'automation', 'integrator', 'connection', 'pilot'], evidence: ['نیاز و توانایی مکمل در داده فرضی مشخص‌اند.', 'مسیر معرفی رضایتی وجود دارد.', 'داده، هزینه و معیار موفقیت باید در پایلوت توافق شوند.'], evidenceReady: true },
      { id: 'diagnostic', title: 'بررسی اولیه پیش از انتخاب مجری', reason: 'مسئله کلی روشن است، اما بدون شاهد مرتبط و دسترسی مجاز نمی‌توان اجرای پایلوت را پیشنهاد قطعی دانست.', steps: ['توصیف فرایند دستی', 'درخواست شاهد مرتبط', 'روشن‌شدن محدودیت‌های داده', 'تصمیم انسانی درباره امکان پایلوت'], nodeIds: ['distributor', 'automation', 'pilot'], evidence: ['در این مسیر هنوز شاهد کافی برای انتخاب مجری وجود ندارد.', 'هیچ دسترسی یا اقدام خودکاری مجاز نشده است.'], evidenceReady: false },
    ],
  },
];

export function getScenario(id: ScenarioId): Scenario {
  const scenario = SCENARIOS.find((s) => s.id === id);
  if (!scenario) throw new Error('سناریوی انتخاب‌شده در دسترس نیست.');
  return scenario;
}

/** Evidence-ready means complete within the fictional example, never real verification. */
export function getRoutes(id: ScenarioId, evidenceRequired: boolean): OpportunityRoute[] {
  return getScenario(id).routes.filter((route) => !evidenceRequired || route.evidenceReady);
}

export function visibleEdges(id: ScenarioId, phase: number, layer: LayerId | 'all' = 'all'): GraphEdge[] {
  const safePhase = Math.max(0, Math.min(5, Math.floor(phase)));
  return getScenario(id).edges.filter((edge) => edge.minPhase <= safePhase && (layer === 'all' || edge.layers.includes(layer)));
}
