# Quantiviq V3 — Persian Editorial & Claims Audit (SEO_COPY_REVIEW)

Auditor scope: file-based review of `src/content/i18n/fa.ts` (full read), `src/content/i18n/en.ts` (full read), `src/content/quantiviq.ts` (full read, incl. `PRIMITIVES`), `src/app/[locale]/*/page.tsx`, `src/components/Header.tsx`, `src/components/Footer.tsx`, plus routing context (`src/middleware.ts`, `src/content/i18n/index.ts`, `src/components/LocaleSwitcher.tsx`, `src/components/LeadForm.tsx`, `src/components/BrainDemo.tsx`). No network access; no files modified other than this report.

---

## 1. Editorial review — `src/content/i18n/fa.ts` (native-editor pass, full file)

**Overall verdict: genuinely good.** The register is consistently senior/formal, نیم‌فاصله discipline is strong throughout (می‌کنند، گردش‌کارها، سیستم‌عامل، به‌عنوان، به‌روز، بخش‌به‌بخش are all correct), the humans-vs-agents framing is kept deliberately, and the copy does not read like machine output. The 12 items below are real but mostly local; none require a rewrite of the file's voice.

| # | Key path (fa.ts line) | Current excerpt | Proposed replacement | One-line reason |
|---|---|---|---|---|
| 1 | `system.demoH2` (192) | «حافظه‌ای که می‌توان از شرکت پرس‌وجو کرد.» | «حافظه‌ای که می‌توان دربارهٔ شرکت از آن پرس‌وجو کرد.» | خطای نقش حرف اضافه: «از شرکت پرس‌وجو کرد» یعنی «بازجویی از شرکت»، نه «بازجویی از حافظه دربارهٔ شرکت» — جملهٔ فعلی معکوس/گنگ درمی‌آید. |
| 2 | `system.osLayers[0].detail` (196) | «اختیار یک مصنوع سیاستی است، نه یک برداشت قبیله‌ای.» | «اختیار در قالب سیاستی مکتوب و ماشین‌خوان تعریف می‌شود، نه یک تفاهم شفاهی و غیررسمی.» | ترجمهٔ تحت‌اللفظیِ policy artifact / tribal understanding؛ «مصنوع سیاستی» و «برداشت قبیله‌ای» در فارسی مدیریتی بیگانه‌اند و مدیر ایرانی این را به کار نمی‌برد. |
| 3 | `meta.proof.description` (30), `system.osLayers[4].name` (200), `proof.items[1].name` (232), `services.offers[2].deliverables` (165), `about.p2` (242) | «زمان‌اجرای ایجنت» | «ران‌تایم ایجنت» (یا «محیط اجرای ایجنت») | «زمان اجرا» در فارسی یعنی *مدت‌زمانِ* اجرا؛ runtime مفهوم «محیط اجرا» است. کالک معنایی که مخاطب CTO را گیج می‌کند — او «ران‌تایم» را همان می‌فهمد. |
| 4 | `about.p1` (241) | «اپراتور محصول و مارکت‌پلیسی که سال‌ها…» | «اپراتور محصول و مارکت‌پلیس که سال‌ها…» | «ی» نسبی به سرِ وام‌واژهٔ «مارکت‌پلیس» چسبیده و ساخت را دوپهلو می‌کند؛ `meta.about.description` همین عبارت را بدون «ی» دارد — یکدست شود. |
| 5 | `services.offers[0].deliverables` (143) | «کارت امتیاز تأخیر و مسیریابی» | «کارنامهٔ تأخیر و مسیریابی» | «کارت امتیاز» ترجمهٔ وارفتِ scorecard است؛ در فارسی کسب‌وکاری «کارنامه» یا «جدول امتیازدهی» رایج است. |
| 6 | `services.offers[3].oneLiner` (173) و `.notPromised` (177) | «مورد به مورد» | «مورد‌به‌مورد» | نیم‌فاصلهٔ ناتمام: همین فایل «بخش‌به‌بخش» (خط ۱۷۶) را درست با نیم‌فاصله نوشته؛ الگوی تکراری «Xبه‌Y» یکدست شود. |
| 7 | `home.honesty` (111) | «در تاریخ ۲۰۲۶/۰۹/۲۳ متوقف شد» | «در تاریخ ۲۰۲۶-۰۹-۲۳ (میلادی) متوقف شد» | قالب ممیزدار با ارقام فارسی در نگاه اول تاریخ شمسی خوانده می‌شود؛ تاریخ انجماد جریان داده باید بدون ابهام میلادی باشد (EN از 2026-09-23 استفاده می‌کند). |
| 8 | `privacy.securityBody` (306) | «اعتبارسنجی و از نظر نرخ محدود می‌شوند» | «اعتبارسنجی و مشمول محدودسازی نرخ ارسال (rate limit) می‌شوند» | «از نظر نرخ محدود» ساختار گنگ و ترجمه‌وارِ rate-limited است؛ فعل مرکب پیشنهادی در متن حقوقی طبیعی‌تر است. |
| 9 | `home.latencyForms[3].body` (87) | «مصوبات پشت انسان‌های پرکار صف می‌شوند» | «مصوبات پشت انسان‌های پرمشغله صف می‌شوند» | «انسان‌های پرکار» در نثر رسمی طبیعی نیست؛ «پرمشغله» همان بار معنایی busy را با واژهٔ اداریِ درست می‌دهد و تقابل انسان/ایجنت حفظ می‌شود. |
| 10 | `contact.lede` (250) | «نه یک دنبالهٔ فروش» | «نه یک زنجیرهٔ پیگیری فروش» | «دنبالهٔ فروش» ترجمهٔ مستقیم sales sequence است و بار ریاضیِ «دنباله» دارد؛ خوانندهٔ غیرفنی معنا را دیر می‌گیرد. |
| 11 | `home.latencyForms[1].body` (85) | «دانش در صندوق‌های ایمیل… پراکنده است» | «دانش میان اینباکس‌ها، اسناد و ذهن‌ها پراکنده است» | «صندوق‌های ایمیل» تحت‌اللفظیِ inboxes است؛ برای مخاطب فنی «اینباکس» رایج و خواناتر است (اقدام اختیاری/جزئی). |
| 12 | `hero.promise` (77) | «با نگاه عملیاتی، متکی به شواهد، فراتر از اسلاید و ارائه.» | «عملیات‌محور، مبتنی بر شواهد — فراتر از اسلاید و ارائه.» | ساختار فعلی فعل ندارد و مثل فهرست صفت رها شده؛ نسخهٔ پیشنهادی همان تلگرافی‌بودن EN را با نثر طبیعی‌تر فارسی می‌دهد (اقدام اختیاری/جزئی). |

---

## 2. Terminology consistency scan (fa.ts)

| Concept | Variants found (where) | Recommended canonical | Verdict |
|---|---|---|---|
| "function" (org unit) | «بخش» فقط — nav.cta، services، method؛ «تابع» هرگز به کار نرفته | «بخش» (نگه دارید) | ✅ consistent |
| "agent" | «ایجنت / ایجنت‌ها» در کل فایل؛ «عامل» هرگز | «ایجنت» (نگه دارید؛ Latin فقط در نام‌های خاص) | ✅ consistent |
| "AI-native" | «بومی هوش مصنوعی» — meta.home، footer.tagline، system.h1، about | همان (نگه دارید) | ✅ consistent؛ انتخاب آگاهانه، اگرچه «بومی» به‌تنهایی می‌تواند «بومی‌سازی» تداعی کند — چون همه‌جا یکسان است، شفاف می‌ماند |
| "runtime" | «زمان‌اجرا / زمان‌اجرای ایجنت» (5 نقطه، ردیف ۳ بالا) | «ران‌تایم ایجنت» | ⚠️ یک‌دست اما کالک معنایی — اصلاح شود |
| "control plane" | «صفحهٔ کنترل (سازمان)» — meta.system، osLayers[2]، osLayers[4] | «کنترل‌پلین سازمانی» یا «لایهٔ کنترل» | ⚠️ یک‌دست اما «صفحه» برای plane ترجمهٔ هندسی است و «داشبورد» تداعی می‌کند؛ برای گوش CTO «کنترل‌پلین» طبیعی‌تر است |
| "model router / routing" | «مسیریاب مدل» (proof.items[2]، services.infra) ↔ «روتر» / «روترها» (about.p2) ↔ «روتر و هستهٔ ایجنت» (meta.proof.description) ↔ «مسیریابی مدل» برای فعالیت | **«روتر مدل»** برای اسم؛ «مسیریابی» فقط برای فعل/فرایند | ❌ دو روایت موازی — یکدست شود |
| "workflow" vs "process" | «گردش‌کار» (workflow) ↔ «فرایند» (process) — تمایز درست در osLayers[3] و services رعایت شده | همان | ✅ تمایز سالم و پایدار |
| "operating system" | «سیستم‌عامل سازمان» — meta.system، system.h1، home.systemLede؛ نیم‌فاصله همه‌جا درست | همان | ✅ consistent |
| "before the thesis had a name" | «پیش از نام‌گرفتنِ این تز» (meta.proof.title) ↔ «پیش از آنکه تز نامی داشته باشد» (proof.h1) ↔ «پیش از آنکه تز نامی بیاید» (home.proofH2) | یک فرمول واحد، مثلاً «پیش از آنکه این تز نامی پیدا کند» | ⚠️ سه‌گانهٔ سبکی؛ slogan است، یکسان شود |
| Brand "Quantiviq" | «کوانتی‌ویک» در نثر (meta.about.description، about.p1، contact.consent، privacy.intro) ↔ کامنت سرِ فایل می‌گوید Latin tokenها «kept as-is» اند ↔ همهٔ سطوح UI همیشه Latin | «کوانتی‌ویک» در نثر فارسی نگه دارید و کامنت سرِ فایل (خط ۴–۵ fa.ts) را اصلاح کنید تا قاعده با عمل هم‌خوان شود | ⚠️ تضاد قاعدهٔ مکتوب با عمل |
| "vendor" | «وندور» — diagnostic.notPromised، infrastructure.notPromised | همان | ✅ consistent |
| "production" | «پروداکشن / پروداکشنی» در نثر؛ چیپ وضعیت Latin «PRODUCTION» | همان (چیپ‌ها بنا به قرارداد Latin می‌مانند) | ✅ consistent by convention |

---

## 3. Claims audit — `en.ts` + `quantiviq.ts` (PRIMITIVES)

### (a) No invented clients, logos, outcomes, ROI figures

| Check | Verdict | Evidence |
|---|---|---|
| Client names / logos in en.ts + quantiviq.ts | **PASS** | Zero client or logo references anywhere; `about.p3` explicitly pledges «invented client logos» do not exist. |
| ROI / outcome figures | **PASS** | No ROI numbers in either file; `diagnostic.notPromised`: "No ROI projections…"; simulator metrics (`FRICTION_METRICS` 4.2 DAYS / 17 / 31/WEEK / 84%) are illustrative and the home page renders the localized disclaimer `simCaption`: «شبیه‌سازی مفهومی — نه نتایج اندازه‌گیری‌شدهٔ مشتریان» / "Conceptual simulation — not measured client results." |
| `BRAIN_DEMO` invented specifics | **WARN** | `quantiviq.ts` L205–280 contains a scripted scenario with concrete numbers (−18% conversion, provider p95 4.1s→11.8s, incident #48271, n=214 replays, "test ended Sep 12"). The code comment calls it "a scripted query", but **no user-visible caption on /system marks it as illustrative** — `demoCaption` describes what a brain is, not that this case is hypothetical. Fix: append "Illustrative walkthrough — not a client case." / «نمایشِ مفهومی — مورد واقعی نیست» to the demo caption. |

### (b) No employer names or internal employer details

| Check | Verdict | Evidence |
|---|---|---|
| en.ts + quantiviq.ts | **PASS** | Grep for Snapp/Zood/Digikala/Divar/Tapsi/Bamilo/Cafe Bazaar/Alibaba/employer: zero matches in both audited files. `about.p1` says "product and marketplace operator… inside real companies" with no employer named. |
| Adjacent (out of audit scope, informational) | note | The shared **English** builder tree (`journey.ts`, `resume/page.tsx`) names SnappMarket · Okala · Alibaba · SportMob · Daapapp · Infinite8 as an "owner-verified list, names only — no employer internals", explicitly labeled at each occurrence. Consistent with the no-internals rule; not reachable from /fa commercial pages. |

### (c) Evidence levels per primitive

Expected per brief: Company Brain & Agent Runtime = OWNER-ATTESTED (personal systems); Model Router / Phoenix / UEA = PUBLICLY VERIFIED (public repos); Smart Trader = ARCHIVED only, freeze date 2026-09-23.

| Primitive | status | level (en.ts `proof.items`) | Expected | Verdict |
|---|---|---|---|---|
| company-brain | IN DAILY USE | OWNER-ATTESTED | OWNER-ATTESTED | **PASS** — proof text in `quantiviq.ts` is properly owner-scoped: "A **personal-brain** instance is in daily operational use". |
| agent-runtime | PRODUCTION | OWNER-ATTESTED | OWNER-ATTESTED | **PASS** — "DeepSeek Harness deployment…" is his own deployment; owner-attested is the honest (conservative) level. |
| model-router | MIT · v0.1.0 | PUBLICLY VERIFIED | PUBLICLY VERIFIED | **PASS** — free-best-router is a public repo (mirrored in `github.ts`), MIT claim testable. |
| phoenix | PRODUCTION | PUBLICLY VERIFIED | PUBLICLY VERIFIED | **PASS** — anti-gravity-phoenix-v4 public repo. Note: the *operational* "PRODUCTION" status is owner-attested; the level is attached to the publicly inspectable fail-closed architecture — acceptable, optionally annotate. |
| uea | MIT · REFERENCE | PUBLICLY VERIFIED | PUBLICLY VERIFIED | **PASS** — MIT reference implementation, public repo. |
| smart-trader | — (absent from PRIMITIVES) | — | ARCHIVED only | **PASS** — not in `PRIMITIVES`; appears **only** in the honesty notes (`quantiviq.ts` PRIMITIVES_HONESTY, `en.home.honesty`, `fa.home.honesty`) as archived + "froze on 2026-09-23"; builder profile (`projects.ts`) carries `status: 'archived'`, `statusLabel: 'Archived · data frozen 2026-09-23'`. Adjacent note: `github.ts` FALLBACK_REPOS has `archived: false` for the smart-trader repo (GitHub *platform* flag ≠ system archive) — verify the open-source page still shows the archived label when it renders from the fallback. |

### (d) Services "what is NOT promised" sections

| Offer (en + fa) | notPromised present | Honest? |
|---|---|---|
| diagnostic | ✅ | Yes — no ROI projections, no vendor selection, no fixed timelines before evidence. |
| rebuild | ✅ | Yes — no headcount-reduction claims, no guaranteed savings, no scope creep without evidence. |
| infrastructure | ✅ | Yes — no black-box autonomy, no unsupervised production authority, no model-vendor lock-in. |
| partnership | ✅ | Yes — explicitly case-by-case; no standing retainer, no interim-executive packaging, no team-of-consultants illusion. |

Plus the global `services.notPackaged` disclaimer ("not packaged products with fixed outcomes") in both locales. **PASS.**

---

## 4. CTA href audit — every link reachable from /fa pages

Routing facts used: middleware `LEGACY` map 308-redirects `/contact` → **`/en/contact`**; shared tree (`/journey`, `/profile`, `/work`, `/notes`, `/engineering`) is served untouched in English; `localePath()` prefixes `/{locale}`.

### Header (all /fa pages, `Header locale='fa'`)

| Route (page) | href | Lands on | Verdict |
|---|---|---|---|
| brand | `/fa` | Persian home | PASS |
| nav services / system / method / proof / about | `/fa/services` · `/fa/system` · `/fa/method` · `/fa/proof` · `/fa/about` | Persian pages | PASS |
| header CTA (بازسازی یک بخش) | `/fa/contact` | Persian contact | PASS |
| LocaleSwitcher | client-side `/fa`↔`/en` segment swap (button, not href) | same route, other locale | PASS |

### Footer (`Footer locale='fa'`)

| Link | href | Verdict |
|---|---|---|
| خدمات / سیستم / روش / شواهد | `/fa/...` | PASS |
| حریم خصوصی | `/fa/privacy` | PASS |
| سفر · EN | `/journey` | PASS — shared EN tree, **labeled ·EN** ✅ |
| پروفایل سازنده · EN | `/profile` | PASS — shared EN tree, **labeled ·EN** ✅ |
| (work / notes) | — | **WARN** — members of the documented shared EN tree but **absent from the FA footer**; if the product intent is a labeled map of the whole shared tree, add «کار · EN» / «یادداشت‌ها · EN» rows (today they are only reachable via the English profile page). Also note: `footer.englishNote` ("این بخش تخصصی در حال حاضر به انگلیسی است.") is defined in fa.ts/en.ts but **never rendered** — dead key. |

### /fa (home, `page.tsx`)

| CTA | href | Verdict |
|---|---|---|
| hero primary (سیستم را ببینید) | `/fa#simulator` | PASS (same-locale anchor) |
| hero secondary | `/fa/contact` | PASS |
| proof section cards (×5) | `/fa/proof` | PASS |
| bridge: چرا این تز → سفر | `/journey` | PASS — documented shared EN exception, footer-labeled |
| bridge: آنچه واقعاً ساخته است | `/profile` | PASS — documented shared EN exception, footer-labeled |
| method CTA | `/fa/contact` | PASS |
| final primary | `/fa/contact?intent=diagnostic` | PASS |
| final secondary | `/fa/contact` | PASS |

### /fa/services

| CTA | href | Verdict |
|---|---|---|
| per-offer CTA ×4 | `/fa/contact?intent={diagnostic\|rebuild-function\|infrastructure\|partnership}` | PASS |

### /fa/system · /fa/method

| CTA | href | Verdict |
|---|---|---|
| single CTA each | `/fa/contact` | PASS |

### /fa/proof

| CTA | href | Verdict |
|---|---|---|
| journey / profile CTAs | `/journey` · `/profile` | PASS — documented exceptions |
| card: مغز شرکت (company-brain) | **`/contact`** (PRIMITIVES.href) | **FAIL** — middleware 308 → **`/en/contact`**: a Persian visitor clicking the first proof card lands on the English contact form. Fix: make PRIMITIVES hrefs locale-aware (e.g. key-based: `contact → /{locale}/contact`) or route commercial hrefs through `localePath`. |
| card: زمان‌اجرای ایجنت (agent-runtime) | `/engineering` | **WARN** — English shared-tree route **outside** the documented exception set (journey, profile, work, notes), and nothing on the FA proof page labels it ·EN. |
| card: مسیریاب مدل / Phoenix / UEA | `/work/free-best-router` · `/work/phoenix` · `/work/universal-engineering-agent` | WARN (soft) — `/work/*` is inside the documented shared EN exception, but the click itself is unlabeled and the FA footer does not list work ·EN; acceptable only if the footer gains the work/notes rows above. |

### /fa/about

| CTA | href | Verdict |
|---|---|---|
| سفر را بخوانید (primary) | `/journey` | PASS — documented exception (footer-labeled) |
| پروفایل سازنده را ببینید | `/profile` | PASS — documented exception |

### /fa/contact · /fa/privacy · not-found

| CTA | href | Verdict |
|---|---|---|
| contact: LinkedIn / GitHub | external `https://…` (target _blank) | PASS (external by design) |
| LeadForm privacy link | `./privacy` (relative) | PASS — resolves to `/fa/privacy` on `/fa/contact`; fragile only if the route ever nests deeper. |
| /fa/privacy | no outbound CTAs | PASS |
| [locale] not-found (bad /fa/* paths) | `/en` + `/fa` | PASS — bilingual escape hatch, both explicit. |

---

## 5. Final verdict table

| # | Item | Verdict | One-line fix |
|---|---|---|---|
| 1 | Persian editorial quality (fa.ts) | **WARN** | Overall strong; apply the 12 fixes in §1 — priority: `system.demoH2` grammar, «مصنوع سیاستی/برداشت قبیله‌ای», «زمان‌اجرای ایجنت» → «ران‌تایم ایجنت». |
| 2 | Terminology consistency | **WARN** | Unify «روتر/مسیریاب مدل» → «روتر مدل» (+ «مسیریابی» for the activity); fix «مورد به مورد» → «مورد‌به‌مورد»; align the fa.ts header comment with the کوانتی‌ویک transliteration practice. |
| 3 | No invented clients/logos/outcomes/ROI | **PASS** (with WARN) | Add a visible "illustrative — not a client case" caption to `BRAIN_DEMO` on /system. |
| 4 | No employer names / internals | **PASS** | None in audited files; keep the names-only labeling discipline in the shared EN tree. |
| 5 | Evidence levels per primitive | **PASS** | Matches the brief exactly (2× OWNER-ATTESTED personal systems, 3× PUBLICLY VERIFIED public repos). |
| 6 | Smart Trader ARCHIVED-only + freeze date | **PASS** | Consistent 2026-09-23 freeze across en/fa/quantiviq/projects.ts; optionally reconcile the `github.ts` fallback `archived:false` platform flag with the system-archive label. |
| 7 | "What is NOT promised" sections | **PASS** | Present ×4 in both locales, specific and honest — no action. |
| 8 | CTA locale integrity from /fa | **FAIL** | One hard leak: /fa/proof → company-brain card `/contact` → 308 → /en/contact — make `PRIMITIVES.href` locale-aware; and decide whether `/engineering` stays linkable from FA proof. |
| 9 | FA footer ·EN labeling | **WARN** | journey/profile correctly labeled ·EN; add work/notes rows (or document their omission) and delete or render the dead `footer.englishNote` key. |
