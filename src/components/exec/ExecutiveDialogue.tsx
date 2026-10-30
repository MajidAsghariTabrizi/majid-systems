'use client';

/**
 * Meet Majid — landing + executive conversation at /meet-majid (unlisted).
 * 2026-10-30 remediation: the executive surface now runs the SAME stream
 * controller as Mind (useMindChat with persona/session/limit options —
 * one sender: stable ids, batched flushes, generation guard, abort/reset,
 * partial preservation, retry). Viewport policy: turn-start anchoring,
 * reading, explicit follow-latest (useFollow). Frame: toolbar / transcript
 * / composer siblings — the composer never travels with streamed text.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useMindChat, useFollow } from '../mind/useMindChat';
import { MindMessage, EvidenceInspector, normalizeSources, type EvidenceSel } from '../mind/evidence';
import { MIND_STRINGS } from '../mind/strings';
import { qEvent, oncePerSession } from '@/lib/analytics';

type Mode = 'work' | 'challenge' | 'transform' | 'general';

const EN = {
  brand: 'QUANTIVIQ',
  brandTag: 'Meet Majid \u00b7 AI Dialogue',
  mainSite: 'Main site',
  eyebrow: 'MEET MAJID \u00b7 POWERED BY QUANTIVIQ MIND',
  headline: 'Explore Majid\u2019s thinking through AI.',
  desc: 'Ask about real projects, challenge a decision, or bring a business problem. The AI draws on Majid\u2019s published work and curated public reference material, with sources you can inspect.',
  identity: 'Majid Asghari Tabrizi \u00b7 Product leadership, systems thinking & applied AI',
  ctaStart: 'Start an AI conversation',
  ctaContinue: 'Continue conversation',
  ctaHow: 'See how it works',
  disclosureShort: 'You are speaking with an AI representation, not Majid live. Answers may be incomplete; inspect the linked sources.',
  startersTitle: 'Choose a starting point',
  starters: [
    { title: 'Explore the work', desc: 'Inspect what was built, the decisions behind it, and the available evidence.' },
    { title: 'Test a decision', desc: 'Bring a difficult scenario and examine a response informed by published principles.' },
    { title: 'Discuss AI transformation', desc: 'Explore workflows, decision rights, governance and business value.' },
  ],
  generalAsk: 'Or ask your own question',
  howTitle: 'How it works',
  how: [
    { t: 'Ask a real question', d: 'Start with a project, a decision or a business challenge.' },
    { t: 'Explore the response', d: 'Distinguish documented material from AI interpretation.' },
    { t: 'Inspect the sources', d: 'Open the relevant articles, books, documentation and project evidence.' },
  ],
  examplesTitle: 'Examples of available material',
  examplesNote: 'A sample of the public catalog the AI retrieves from \u2014 not sources already fetched for an answer that has not happened. Book entries are notes and metadata, not access to full books.',
  examples: [
    { kind: 'Article', title: 'AI Adoption Is Not AI Transformation', href: '/en/insights/ai-adoption-is-not-ai-transformation' },
    { kind: 'Library entry', title: 'AI Engineering \u2014 book notes', href: '/en/insights/books/ai-engineering' },
    { kind: 'System doc', title: 'The Living Organization', href: '/en/system' },
  ],
  unlistedNote: 'Unlisted, not private. Anyone with this link can open this page.',
  diagram: { q: 'Your question', mind: 'QUANTIVIQ MIND', s1: 'Projects', s2: 'Articles', s3: 'Books & Docs', a1: 'Documented material', a2: 'Interpretation', a3: 'Sources', inspect: 'inspect' },
  paths: ['Explore the work', 'Test a decision', 'Discuss AI transformation'],
  startersQ: {
    work: ['What has Majid actually shipped, and what remains experimental?', 'Walk me through the Phoenix retirement decision \u2014 why shut down a working system?', 'What do the four documented projects prove about his engineering judgment?'],
    challenge: ['What would Majid do if an AI agent made an expensive but technically valid decision?', 'How would he prove an AI transformation created economic value rather than cutting headcount?', 'Why should I trust Majid with AI transformation leadership instead of a management consultant?'],
    transform: ['Where does an AI-native organization actually start \u2014 tools, structure or decision rights?', 'Which workflows should never be automated, and why?', 'How do you govern agents that act, not just answer?'],
    general: ['What can I ask you about?', 'Summarize how Majid separates documented facts from interpretation.', 'What public sources back your answers?'],
  },
  sourcesLabel: 'Sources',
  viewAll: 'View all',
  jumpToLatest: 'Jump to latest',
  incompleteLabel: 'Answer stopped \u2014 partial text kept.',
  closeLabel: 'Close',
  openSource: 'Open source',
  evidenceTitle: 'Evidence',
  evidenceNote: 'Sources retrieved for this answer \u2014 retrieval is not sentence-level proof. Metadata comes from the published catalog; anything not provided is omitted.',
  composerPlaceholder: 'Ask a hard question\u2026',
  send: 'Send', stop: 'Stop', retry: 'Retry',
  challengeThis: 'Challenge this answer',
  hintLeft: 'Grounded in verified public material \u00b7 answers may be interpretation, clearly labeled by the model.',
  limit: (n: number) => n + ' of 24 questions this session',
  errorUnavailable: 'The service is briefly unavailable. Your question was not lost \u2014 retry when ready.',
  errorRate: 'Session limit reached. The conversation stays readable; start a new session to continue asking.',
  back: '\u2190 Introduction',
  footLeft: 'Meet Majid \u2014 AI representation of Majid Asghari Tabrizi',
  footRight: 'Powered by the Quantiviq public mind \u00b7 not indexed \u00b7 noarchive',
};
const FA: typeof EN = {
  brand: 'QUANTIVIQ',
  brandTag: 'ملاقات با مجید \u00b7 گفت‌وگوی هوش مصنوعی',
  mainSite: 'سایت اصلی',
  eyebrow: 'ملاقات با مجید \u00b7 قدرت‌گرفته از ذهن Quantiviq',
  headline: 'تفکر مجید را با هوش مصنوعی کاوش کنید.',
  desc: 'دربارهٔ پروژه‌های واقعی بپرسید، به یک تصمیم چالش بگذارید یا مسئلهٔ کاری‌تان را مطرح کنید. این هوش مصنوعی بر آثار منتشرشدهٔ مجید و منابع عمومی گزینش‌شده تکیه دارد و منابعش قابل بررسی‌اند.',
  identity: 'مجید اصغری تبریزی \u00b7 رهبری محصول، تفکر سیستمی و هوش مصنوعی کاربردی',
  ctaStart: 'گفت‌وگو را شروع کنید',
  ctaContinue: 'ادامهٔ گفت‌وگو',
  ctaHow: 'چگونه کار می‌کند',
  disclosureShort: 'با یک بازنمایی هوش مصنوعی گفت‌وگو می‌کنید، نه خود مجید. پاسخ‌ها ممکن است ناقص باشند؛ منابع پیوندشده را بررسی کنید.',
  startersTitle: 'نقطهٔ شروع را انتخاب کنید',
  starters: [
    { title: 'کارها را ببینید', desc: 'آنچه ساخته شده، تصمیم‌های پشت آن و شواهد در دسترس را بررسی کنید.' },
    { title: 'یک تصمیم را محک بزنید', desc: 'سناریویی دشوار بیاورید و پاسخی مبتنی بر اصول منتشرشده را بسنجید.' },
    { title: 'تحول با هوش مصنوعی', desc: 'جریان کار، حقوق تصمیم، حکمرانی و ارزش کسب‌وکار را کاوش کنید.' },
  ],
  generalAsk: 'یا پرسش خودتان را بپرسید',
  howTitle: 'چگونه کار می‌کند',
  how: [
    { t: 'پرسش واقعی بپرسید', d: 'با یک پروژه، یک تصمیم یا یک چالش کسب‌وکار شروع کنید.' },
    { t: 'پاسخ را کاوش کنید', d: 'مطالب مستند را از تفسیر هوش مصنوعی تفکیک کنید.' },
    { t: 'منابع را بررسی کنید', d: 'مقاله‌ها، کتاب‌ها، مستندات و شواهد پروژه را باز کنید.' },
  ],
  examplesTitle: 'نمونه‌هایی از منابع موجود',
  examplesNote: 'گوشه‌ای از کاتالوگ عمومی که هوش مصنوعی از آن بازیابی می‌کند \u2014 نه منابعی که برای پاسخی که هنوز داده نشده فراخوانی شده‌اند. مدخل کتاب‌ها یادداشت و فراداده است، نه دسترسی به کامل کتاب.',
  examples: [
    { kind: 'مقاله', title: 'پذیرش هوش مصنوعی، تحول هوش مصنوعی نیست', href: '/fa/insights/ai-adoption-is-not-ai-transformation' },
    { kind: 'مدخل کتاب', title: 'مهندسی هوش مصنوعی \u2014 یادداشت‌های کتاب', href: '/fa/insights/books/ai-engineering' },
    { kind: 'مستند سیستم', title: 'سازمان زنده', href: '/fa/system' },
  ],
  unlistedNote: 'فهرست‌نشده، نه خصوصی. هر کسی این پیوند را داشته باشد می‌تواند این صفحه را ببیند.',
  diagram: { q: 'پرسش شما', mind: 'ذهن QUANTIVIQ', s1: 'پروژه‌ها', s2: 'مقاله‌ها', s3: 'کتاب‌ها و مستندات', a1: 'مطالب مستند', a2: 'تفسیر', a3: 'منابع', inspect: 'بررسی' },
  paths: ['کارها را ببینید', 'یک تصمیم را محک بزنید', 'تحول با هوش مصنوعی'],
  startersQ: {
    work: ['مجید واقعاً چه چیزهایی را به تولید رسانده و چه چیزی هنوز آزمایشی است؟', 'تصمیم بازنشستگی فینیکس را توضیح بده \u2014 چرا سیستم کارا را متوقف کرد؟', 'چهار پروژهٔ مستند دربارهٔ قضاوت مهندسی‌اش چه می‌گویند؟'],
    challenge: ['اگر یک عامل هوش مصنوعی تصمیم گران ولی از نظر فنی درستی بگیرد، مجید چه می‌کند؟', 'چگونه اثبات می‌کنید تحول AI ارزش اقتصادی آفریده، نه فقط کاهش نیرو؟', 'چرا به مجید برای رهبری تحول AI اعتماد کنم، نه یک مشاور مدیریتی باتجربه؟'],
    transform: ['سازمان بومی-هوشمند از کجا شروع می‌شود \u2014 ابزار، ساختار یا حقوق تصمیم؟', 'کدام جریان‌های کار هرگز نباید خودکار شوند و چرا؟', 'عامل‌هایی که عمل می‌کنند نه فقط پاسخ می‌دهند را چگونه حکمرانی می‌کنید؟'],
    general: ['دربارهٔ چه چیزهایی می‌توانم از شما بپرسم؟', 'خلاصه کن مجید چگونه واقعیت مستند را از تفسیر جدا می‌کند.', 'چه منابع عمومی از پاسخ‌های شما پشتیبانی می‌کنند؟'],
  },
  sourcesLabel: 'منابع',
  viewAll: 'نمایش همه',
  jumpToLatest: 'پرش به آخرین',
  incompleteLabel: 'پاسخ متوقف شد \u2014 متن ناقص نگه داشته شد.',
  closeLabel: 'بستن',
  openSource: 'باز کردن منبع',
  evidenceTitle: 'شواهد',
  evidenceNote: 'منابع بازیابی‌شده برای این پاسخ \u2014 بازیابی اثبات سطری نیست. فراداده از کاتالوگ منتشرشده می‌آید؛ چیزی که موجود نیست نوشته نمی‌شود.',
  composerPlaceholder: 'پرسش دشواری بپرسید\u2026',
  send: 'ارسال', stop: 'توقف', retry: 'تلاش دوباره',
  challengeThis: 'به این پاسخ چالش بگذارید',
  hintLeft: 'مبتنی بر مطالب عمومی تأییدشده \u00b7 پاسخ‌ها ممکن است تفسیر باشند که مدل صریحاً برچسب می‌زند.',
  limit: (n: number) => 'پرسش ' + String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]) + ' از ۲۴ در این نشست',
  errorUnavailable: 'سرویس موقتاً در دسترس نیست. پرسش شما از دست نرفته \u2014 دوباره تلاش کنید.',
  errorRate: 'سقف نشست پر شده. گفت‌وگو قابل مطالعه می‌ماند؛ برای ادامهٔ پرسش نشست جدیدی بسازید.',
  back: '\u2190 مقدمه',
  footLeft: 'ملاقات با مجید \u2014 بازنمایی هوش مصنوعی مجید اصغری تبریزی',
  footRight: 'مبتنی بر ذهن عمومی Quantiviq \u00b7 فهرست‌نشده \u00b7 بدون آرشیو',
};

export function ExecutiveDialogue() {
  const [locale, setLocale] = useState<'en' | 'fa'>('en');
  const t = locale === 'fa' ? FA : EN;
  const rtl = locale === 'fa';
  const [stage, setStage] = useState<'intro' | 'chat'>('intro');
  const [mode, setMode] = useState<Mode>('general');
  const [draft, setDraft] = useState('');
  const [evidence, setEvidence] = useState<EvidenceSel>(null);
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const follow = useFollow<HTMLDivElement>();
  const focusChatRef = useRef(false);

  // ONE shared stream controller for both surfaces (defect C fix):
  // stable ids, ~45ms batched flushes, generation guard, abort/reset,
  // partial preservation, retry — with executive persona/session/quota.
  const chatStrings = useMemo(
    () => ({
      ...MIND_STRINGS[locale],
      serviceUnavailable: t.errorUnavailable,
      limitReached: t.errorRate,
      error: t.errorUnavailable,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale]
  );
  const { messages, busy, error, asked, retryQuestion, send, stop } = useMindChat(locale, chatStrings, {
    persona: 'executive',
    sessionKey: 'exec-session',
    limit: 24,
  });

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
  }, [locale, rtl]);

  // one intentional focus transition when entering the conversation
  useEffect(() => {
    if (stage === 'chat' && focusChatRef.current) {
      focusChatRef.current = false;
      inputRef.current?.focus();
    }
  }, [stage]);

  // viewport policy: anchor each NEW user turn once, near the transcript
  // top; deltas never move the reader; follow-latest is explicit-only
  const anchoredUserRef = useRef<string | null>(null);
  useEffect(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUser && lastUser.id !== anchoredUserRef.current) {
      anchoredUserRef.current = lastUser.id;
      requestAnimationFrame(() =>
        follow.anchorTurn(document.querySelector('[data-mid="' + lastUser.id + '"]'))
      );
      return;
    }
    follow.afterFlush();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const suggestions = useMemo(() => t.startersQ[mode === 'general' ? 'general' : mode] ?? t.startersQ.general, [t, mode]);

  const enter = (m: Mode, focus = true) => { setMode(m); setStage('chat'); focusChatRef.current = focus; };
  const back = () => { setStage('intro'); setEvidence(null); }; // keeps messages, draft, session
  const openEvidence = (msgId: string, srcId: string) => {
    const s = normalizeSources(messages.find((m) => m.id === msgId)?.sources).find((x) => x.id === srcId);
    if (s) qEvent('source_open', { category: s.type, sid: s.id });
    setEvidence({ msgId, srcId });
  };

  // unlisted page view signal (count only; no identity) — once per session
  useEffect(() => {
    if (oncePerSession('meet-majid-view')) qEvent('meet_majid_view');
  }, []);
  const toggleExpand = (msgId: string) =>
    setExpandedSources((prev) => { const n = new Set(prev); if (n.has(msgId)) n.delete(msgId); else n.add(msgId); return n; });
  const prefill = (q: string) => { setDraft(q); focusChatRef.current = true; setStage('chat'); setTimeout(() => inputRef.current?.focus(), 60); };
  const submitDraft = () => {
    const v = draft.trim();
    if (!v) return;
    setDraft('');
    send(v);
  };

  const hasConversation = messages.length > 0;
  const lastMsg = messages.at(-1);

  return (
    <div className={'ex-root' + (rtl ? ' ex-rtl' : '')}>
      <header className="ex-top">
        <a className="ex2-brand" href={locale === 'fa' ? '/fa' : '/en'}>
          <span className="ex2-brand-mark">QUANTIVIQ</span>
          <span className="ex2-brand-sep" aria-hidden>{'\u00b7'}</span>
          <span className="ex2-brand-tag">{t.brandTag}</span>
        </a>
        <div className="ex-top-right">
          <a className="ex2-main-link" href={locale === 'fa' ? '/fa' : '/en'}>{t.mainSite}</a>
          <div className="ex-locale-toggle" role="group" aria-label="Language">
            <button aria-pressed={locale === 'en'} onClick={() => setLocale('en')}>EN</button>
            <button aria-pressed={locale === 'fa'} onClick={() => setLocale('fa')}>{'\u0641\u0627'}</button>
          </div>
        </div>
      </header>

      {stage === 'intro' ? (
        <main className="ex2-landing" id="main">
          <section className="ex2-hero">
            <div className="ex2-hero-copy">
              <p className="ex-eyebrow">{t.eyebrow}</p>
              <h1 className="ex2-headline">{t.headline}</h1>
              <p className="ex2-desc">{t.desc}</p>
              <p className="ex2-identity">{t.identity}</p>
              <div className="ex2-cta-row">
                <button className="ex2-cta" onClick={() => enter(hasConversation ? mode : 'general')}>
                  {hasConversation ? t.ctaContinue : t.ctaStart}
                </button>
                <button className="ex2-cta-how" onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}>{t.ctaHow}</button>
              </div>
              <p className="ex2-disclosure">{t.disclosureShort}</p>
            </div>
            <div className="ex2-hero-visual" aria-label={t.howTitle}>
              <div className="mx-stage">
                <div className="mx-chip mx-q">{t.diagram.q}</div>
                <div className="mx-link" aria-hidden />
                <div className="mx-mind">
                  <span className="mx-mind-label">{t.diagram.mind}</span>
                </div>
                <div className="mx-src-row">
                  <div className="mx-src" data-kind="1">{t.diagram.s1}</div>
                  <div className="mx-src" data-kind="2">{t.diagram.s2}</div>
                  <div className="mx-src" data-kind="3">{t.diagram.s3}</div>
                </div>
                <div className="mx-link" aria-hidden />
                <div className="mx-answer">
                  <div className="mx-a-row">{t.diagram.a1}</div>
                  <div className="mx-a-row mx-a-soft">{t.diagram.a2}</div>
                  <div className="mx-a-row mx-a-srcs">
                    <span>{t.diagram.a3}</span>
                    <span className="mx-cites"><i className="mx-cite">1</i><i className="mx-cite">2</i><i className="mx-cite mx-cite-hit">3</i></span>
                  </div>
                </div>
                <div className="mx-inspect">
                  <span className="mx-cite mx-cite-hit">3</span>
                  <span className="mx-inspect-line" aria-hidden />
                  <span className="mx-inspect-target">{t.diagram.s3}</span>
                  <span className="mx-inspect-label">{t.diagram.inspect}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="ex2-starters" aria-labelledby="ex2-starters-t">
            <h2 className="ex2-starters-title" id="ex2-starters-t">{t.startersTitle}</h2>
            <ul className="ex2-starter-list">
              {t.starters.map((p, i) => (
                <li key={p.title}>
                  <button className="ex2-starter" onClick={() => enter((['work', 'challenge', 'transform'] as Mode[])[i])}>
                    <span className="ex2-starter-title">{p.title}</span>
                    <span className="ex2-starter-desc">{p.desc}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="ex2-general">
              <button className="ex2-general-btn" onClick={() => enter('general')}>{t.generalAsk} {'\u2192'}</button>
            </div>
          </section>

          <section className="ex2-how" id="how" aria-labelledby="ex2-how-t">
            <h2 id="ex2-how-t">{t.howTitle}</h2>
            <ol className="ex2-steps">
              {t.how.map((s, i) => (
                <li key={s.t} className="ex2-step">
                  <span className="ex2-step-n" aria-hidden>{i + 1}</span>
                  <div><h3>{s.t}</h3><p>{s.d}</p></div>
                </li>
              ))}
            </ol>
            <div className="ex2-examples">
              <h3 className="ex2-examples-title">{t.examplesTitle}</h3>
              <ul>
                {t.examples.map((x) => (
                  <li key={x.href}>
                    <a href={x.href}>
                      <span className="ex2-ex-kind">{x.kind}</span>
                      <span className="ex2-ex-title">{x.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
              <p className="ex2-ex-note">{t.examplesNote}</p>
            </div>
          </section>

          <section className="ex2-close">
            <button className="ex2-cta" onClick={() => enter(hasConversation ? mode : 'general')}>
              {hasConversation ? t.ctaContinue : t.ctaStart}
            </button>
            <p className="ex2-unlisted">{t.unlistedNote}</p>
          </section>
        </main>
      ) : (
        // FRAME (defect D fix): toolbar / transcript / composer are
        // siblings — the ONLY message scroller is the transcript viewport
        <main className="ex2-chat" id="main">
          <div className="ex2-frame">
            <div className="ex2-toolbar">
              <button className="ex-back-btn" onClick={back}>{t.back}</button>
              <span className="ex2-chat-mode">{mode !== 'general' ? t.paths[['work', 'challenge', 'transform'].indexOf(mode)] : t.brandTag}</span>
              {busy && <span className="ex2-live" role="status">{'\u25cf'}</span>}
            </div>
            <div className="ex2-transcript" ref={follow.ref} aria-live="polite">
              {messages.length === 0 && (
                <div className="ex-suggestions">
                  {suggestions.map((s) => (
                    <button key={s} className="ex-suggest" onClick={() => prefill(s)}>{s}</button>
                  ))}
                </div>
              )}
              {messages.map((m) => (
                m.role === 'assistant' ? (
                  <div key={m.id} className={'ex-msg ex-a' + (busy && m === lastMsg ? ' ex-streaming' : '')}>
                    <MindMessage
                      m={m}
                      label={t.sourcesLabel}
                      viewAll={t.viewAll}
                      incompleteLabel={t.incompleteLabel}
                      onOpen={openEvidence}
                      expandedSet={expandedSources}
                      onToggleExpand={toggleExpand}
                    />
                    {m.content && (m.sources?.length ?? 0) > 0 && !busy && (
                      <button className="ex-challenge" onClick={() => send(locale === 'fa' ? 'به این پاسخ چالش بگذار: نقطه‌ضعف‌های استدلال را نشان بده.' : 'Challenge this answer: expose the weakest links in the reasoning.')}>
                        {'\u21af'} {t.challengeThis}
                      </button>
                    )}
                  </div>
                ) : (
                  <MindMessage key={m.id} m={m} label={t.sourcesLabel} viewAll={t.viewAll} onOpen={openEvidence} expandedSet={expandedSources} onToggleExpand={toggleExpand} />
                )
              ))}
              {follow.mode !== 'follow-latest' && !follow.atBottom && messages.length > 0 && (
                <button type="button" className="ex-jump" onClick={follow.jumpToLatest}>
                  {'\u2193'} {t.jumpToLatest}
                </button>
              )}
              {error && (
                <div className="ex-error" role="alert">
                  <span>{error}</span>
                  {retryQuestion && <button onClick={() => send(retryQuestion)}>{t.retry}</button>}
                </div>
              )}
            </div>
            <div className="ex2-composer">
              <div className="ex-compose-row">
                <textarea
                  ref={inputRef}
                  className="ex-input"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={t.composerPlaceholder}
                  rows={2}
                  maxLength={2000}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitDraft(); } }}
                  aria-label={t.composerPlaceholder}
                />
                {busy ? <button className="ex-stop" onClick={stop}>{t.stop}</button> : <button className="ex-send" onClick={submitDraft}>{t.send}</button>}
              </div>
              <div className="ex-hint"><span>{t.hintLeft}</span><span>{t.limit(asked)}</span></div>
            </div>
          </div>
        </main>
      )}

      <EvidenceInspector
        source={
          evidence
            ? normalizeSources(messages.find((m) => m.id === evidence.msgId)?.sources).find((x) => x.id === evidence.srcId) ?? null
            : null
        }
        locale={locale === 'fa' ? 'fa' : 'en'}
        s={{ ...MIND_STRINGS[locale], close: t.closeLabel, openSource: t.openSource, evidenceTitle: t.evidenceTitle, evidenceNote: t.evidenceNote }}
        onClose={() => { setEvidence(null); }}
      />

      <footer className="ex-foot">
        <span>{t.footLeft}</span>
        <span>{t.footRight}</span>
      </footer>
    </div>
  );
}