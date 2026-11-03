'use client';

/**
 * The Living Organization — /explore experience.
 *
 * Wraps the EXISTING V5 simulator engine (src/components/OrgSimulator) and adds
 * the mission's signature journey around it: role lens → signal → evidence
 * source drawers (5 OSS layers, honestly labeled as concepts) → human
 * authority gate that changes the displayed outcome → deterministic static
 * transcript fallback → exit CTAs. Fully synthetic; no live integrations.
 */
import { useMemo, useState } from 'react';
import Link from 'next/link';

import { OrgSimulatorSection } from '@/components/OrgSimulator';
import { dict, type Locale } from '@/content/i18n';
import { simLabels } from '@/content/i18n/sim';
import { makeSimData } from '@/content/i18n/sim-data';
import { SIM_SIGNALS, type SignalKey } from '@/content/simulator';
import { qEvent } from '@/lib/analytics';
import { OLD_HOPS, NEW_STEPS, OLD_TOTAL_HOURS, OLD_TOTAL_HANDOFFS, NEW_TOTAL_MINUTES } from '@/lib/sim/timeline';
import { OSS, OSS_BY_ID, BOOK_BY_SLUG, type OssLayer } from '@/content/knowledge';

type GateChoice = 'approve' | 'reject' | 'evidence';

const GATE_OUTCOMES: Record<SignalKey, Record<GateChoice, { en: string; fa: string; log: { en: string; fa: string } }>> = {
  'customer-issue': {
    approve: {
      en: 'Fix is applied to checkout the same hour; the evaluation node measures repeat-failure rate dropping over the next synthetic day.',
      fa: 'در این سناریوی فرضی، اصلاح همان ساعت روی پرداخت اعمال می‌شود و ارزیابی، کاهش نرخ تکرار خطا را در روز بعد نشان می‌دهد.',
      log: { en: 'Gate: APPROVED — reversible, low risk. Timeline: proposal → approval → action → measured outcome.', fa: 'تأیید انسانی: تأیید شد — برگشت‌پذیر، ریسک کم. خط زمانی: پیشنهاد ← تأیید ← اقدام ← پیامد اندازه‌گیری‌شده.' },
    },
    reject: {
      en: 'No action is taken. The signal stays open in the backlog; the timeline records the rejection reason and the cost of waiting (traditional physics resumes).',
      fa: 'اقدامی انجام نمی‌شود و رویداد در صف کار باز می‌ماند. دلیل رد و هزینه انتظار ثبت می‌شود و مسیر هماهنگی سنتی ادامه می‌یابد.',
      log: { en: 'Gate: REJECTED — owner judged the evidence insufficient. Timeline: proposal → rejection → signal remains open.', fa: 'تأیید انسانی: رد شد — مسئول تصمیم شواهد را کافی ندانست. خط زمانی: پیشنهاد ← رد ← سیگنال باز می‌ماند.' },
    },
    evidence: {
      en: 'The proposal waits. A targeted evidence request is issued (recent orders, error logs, policy text) before any decision — the loop continues without action this cycle.',
      fa: 'پیشنهاد منتظر می‌ماند. پیش از هر تصمیم، درخواست شواهد هدفمند صادر می‌شود (سفارش‌های اخیر، لاگ خطا، متن سیاست) — حلقه در این چرخه بدون اقدام ادامه می‌یابد.',
      log: { en: 'Gate: MORE EVIDENCE REQUESTED. Timeline: proposal → evidence request → decision deferred.', fa: 'تأیید انسانی: درخواست شواهد بیشتر. خط زمانی: پیشنهاد ← درخواست شواهد ← تعویق تصمیم.' },
    },
  },
  'product-signal': {
    approve: {
      en: 'Activation experiment ships behind a flag to 10% of synthetic users; evaluation watches the activation curve against intent.',
      fa: 'آزمایش فعال‌سازی با کلید کنترل انتشار برای ۱۰٪ کاربران فرضی فعال می‌شود؛ سپس نتیجه با هدف اولیه مقایسه می‌شود.',
      log: { en: 'Gate: APPROVED — staged rollout, reversible by flag. Timeline: hypothesis → experiment → measured activation.', fa: 'تأیید انسانی: تأیید شد — انتشار مرحله‌ای با امکان بازگشت از طریق کلید کنترل. خط زمانی: فرضیه ← آزمایش ← فعال‌سازی اندازه‌گیری‌شده.' },
    },
    reject: {
      en: 'The hypothesis is closed with a written reason; no experiment runs. The knowledge base records why — that is the learning.',
      fa: 'فرضیه با دلیل مکتوب بسته می‌شود؛ آزمایشی اجرا نمی‌شود. پایگاه دانش دلیل را ثبت می‌کند — همین خودش یادگیری است.',
      log: { en: 'Gate: REJECTED — hypothesis archived with reason. Timeline: hypothesis → rejection → knowledge updated.', fa: 'تأیید انسانی: رد شد — فرضیه با دلیل بایگانی شد. خط زمانی: فرضیه ← رد ← به‌روزرسانی دانش.' },
    },
    evidence: {
      en: 'More segmentation data is requested before an experiment is designed — funnel step, cohort, device.',
      fa: 'پیش از طراحی آزمایش، داده بیشتری به تفکیک مرحله قیف، گروه کاربران و دستگاه درخواست می‌شود.',
      log: { en: 'Gate: MORE EVIDENCE REQUESTED. Timeline: hypothesis → segmentation request → decision deferred.', fa: 'تأیید انسانی: درخواست شواهد بیشتر. خط زمانی: فرضیه ← درخواست بخش‌بندی ← تعویق تصمیم.' },
    },
  },
  'production-incident': {
    approve: {
      en: 'Mitigation (rollback of the last deploy) is executed; HolmesGPT-style evidence correlation is preserved for the postmortem.',
      fa: 'برای کاهش اثر رخداد، آخرین استقرار بازگردانده می‌شود. شواهد مرتبط، با رویکردی مشابه HolmesGPT، برای بررسی پس از رخداد نگهداری می‌شوند.',
      log: { en: 'Gate: APPROVED — rollback is the reversible action. Timeline: alert → hypothesis → rollback → verified recovery.', fa: 'تأیید انسانی: تأیید شد — بازگردانی اقدام برگشت‌پذیر است. خط زمانی: هشدار ← فرضیه ← بازگردانی ← بازیابی راستی‌آزمایی‌شده.' },
    },
    reject: {
      en: 'No write action is allowed. The incident escalates to a human on-call; the timeline shows the wait cost rising.',
      fa: 'هیچ تغییری در سیستم مجاز نیست. رخداد به کارشناس کشیک ارجاع می‌شود و افزایش هزینه انتظار در خط زمانی دیده می‌شود.',
      log: { en: 'Gate: REJECTED — write actions denied without authority. Timeline: proposal → escalation → human on-call.', fa: 'تأیید انسانی: رد شد — تغییر بدون مجوز ممنوع است. خط زمانی: پیشنهاد ← ارجاع ← کارشناس کشیک.' },
    },
    evidence: {
      en: 'Correlation evidence is requested first: which change coincided with the alert, which metric moved first.',
      fa: 'ابتدا شواهد همبستگی خواسته می‌شود: کدام تغییر با هشدار هم‌زمان بود، کدام شاخص زودتر تغییر کرد.',
      log: { en: 'Gate: MORE EVIDENCE REQUESTED. Timeline: hypothesis → change-correlation request → decision deferred.', fa: 'تأیید انسانی: درخواست شواهد بیشتر. خط زمانی: فرضیه ← درخواست همبستگی تغییر ← تعویق تصمیم.' },
    },
  },
  'revenue-drop': {
    approve: {
      en: 'A certified-metric query (WrenAI-style, read-only) is approved; the aggregate result is attached to the decision record — still no autonomous action.',
      fa: 'یک پرس‌وجوی فقط‌خواندنی روی شاخص تأییدشده، با رویکردی مشابه WrenAI، مجاز می‌شود. نتیجه تجمیعی به سابقه تصمیم پیوست می‌شود و اقدام مستقل انجام نمی‌گیرد.',
      log: { en: 'Gate: APPROVED — read-only query only. Timeline: question → certified metric → evidence ledger → human reads result.', fa: 'تأیید انسانی: تأیید شد — فقط پرس‌وجوی بدون تغییر داده. خط زمانی: سؤال ← شاخص تأییدشده ← دفتر شواهد ← خواندن نتیجه توسط انسان.' },
    },
    reject: {
      en: 'The question returns to its owner; the drop stays unexplained in this cycle. Honesty: an unanswered question is an acceptable system state.',
      fa: 'پرسش به مسئول آن برمی‌گردد؛ افت در این چرخه بدون توضیح می‌ماند. صداقت: سؤال بی‌پاسخ یک حالت قابل‌قبول سیستم است.',
      log: { en: 'Gate: REJECTED — owner prefers existing dashboards this cycle. Timeline: question → rejection → open.', fa: 'تأیید انسانی: رد شد — مسئول تصمیم در این چرخه داشبوردهای موجود را ترجیح می‌دهد. خط زمانی: سؤال ← رد ← باز.' },
    },
    evidence: {
      en: 'Metric ownership and freshness are verified first (OpenMetadata-style) — is "revenue" here even the certified definition?',
      fa: 'ابتدا مسئول و تازگی شاخص راستی‌آزمایی می‌شود (به سبک OpenMetadata) — آیا «درآمد» اینجا اصلاً تعریف تأییدشده است؟',
      log: { en: 'Gate: MORE EVIDENCE REQUESTED. Timeline: question → definition verification → decision deferred.', fa: 'تأیید انسانی: درخواست شواهد بیشتر. خط زمانی: سؤال ← راستی‌آزمایی تعریف ← تعویق تصمیم.' },
    },
  },
};

/** How each OSS layer maps onto the AI-native side of the simulator. */
const LAYER_NODE_MAP: Record<string, { node: string; nodeFa: string }> = {
  onyx: { node: 'CONTEXT ASSEMBLY', nodeFa: 'گردآوری زمینه' },
  'open-metadata': { node: 'EVALUATION', nodeFa: 'ارزیابی' },
  'wren-ai': { node: 'COMPANY BRAIN', nodeFa: 'مغز شرکت' },
  graphiti: { node: 'COMPANY BRAIN', nodeFa: 'مغز شرکت' },
  holmesgpt: { node: 'EVALUATION', nodeFa: 'ارزیابی' },
};

// Display translations only. Timeline order, durations and counters continue
// to come from the existing deterministic simulator engine.
const OLD_NOTES_FA: Record<string, string> = {
  EMPLOYEE: 'مسئله را می‌بیند و گزارش می‌کند.',
  MANAGER: 'بررسی می‌کند و اطلاعات زمینه‌ای بیشتری می‌خواهد.',
  SLACK: 'گفت‌وگو آغاز می‌شود و چهار نفر نظر می‌دهند.',
  MEETING: 'جلسه برای پنجشنبه برنامه‌ریزی می‌شود تا افراد هماهنگ شوند.',
  ANALYST: 'اعداد را جمع می‌کند و درخواست تازه‌ای ثبت می‌کند.',
  DIRECTOR: 'اطلاعات را تفسیر، مسئله را صورت‌بندی و جلسه بررسی تعیین می‌کند.',
  APPROVAL: 'کار تا رسیدن به مسئول دارای اختیار منتظر می‌ماند.',
  ACTION: 'پس از ۴٫۲ روز اجرا می‌شود.',
};
const NEW_CAPTIONS_FA: Record<string, string> = {
  'Signal enters the system.': 'رویداد وارد سیستم می‌شود.',
  'CONTEXT ASSEMBLY — collecting relevant current state.': 'گردآوری زمینه؛ جمع‌آوری اطلاعات مرتبط و به‌روز.',
  'Context meets institutional memory.': 'اطلاعات فعلی با حافظه سازمانی تطبیق داده می‌شود.',
  'COMPANY BRAIN — similar issue observed. Procedure exists.': 'مغز شرکت؛ مورد مشابه و روش رسیدگی موجود است.',
  'Memory ≠ present reality. Verifying live state.': 'حافظه جای وضعیت فعلی را نمی‌گیرد؛ وضعیت اکنون بررسی می‌شود.',
  'Evidence → decision.': 'شواهد به تصمیم تبدیل می‌شوند.',
  'Agent takes bounded execution.': 'عامل، اجرای محدود به وظیفه را بر عهده می‌گیرد.',
  'AGENT — analyzes, investigates, proposes.': 'عامل تحلیل می‌کند، بررسی می‌کند و پیشنهاد می‌دهد.',
  'Every proposal meets explicit authority.': 'هر پیشنهاد با حدود اختیار مشخص بررسی می‌شود.',
  'AUTHORITY GATE — risk, permission, reversibility.': 'کنترل اختیار؛ ریسک، مجوز و امکان بازگشت.',
  'AUTHORITY GRANTED — the gate opens.': 'مجوز داده شده و مسیر اقدام باز می‌شود.',
  'Executing in systems of record.': 'اقدام در سیستم‌های مرجع اجرا می‌شود.',
  'ACTION — executed where the truth lives.': 'اقدام در محل ثبت اطلاعات مرجع انجام شد.',
  'OUTCOME OBSERVED.': 'نتیجه مشاهده شد.',
  'EVALUATION — outcome measured against intent.': 'ارزیابی؛ نتیجه با هدف اولیه مقایسه می‌شود.',
  'Experience returns to the Brain.': 'تجربه به حافظه مشترک بازمی‌گردد.',
};
const STEP_KINDS_FA: Record<string, string> = {
  travel: 'جابه‌جایی', wait: 'بررسی', brain: 'بازیابی دانش', investigate: 'راستی‌آزمایی',
  gate: 'بررسی اختیار', 'gate-open': 'مجوز اقدام',
};

export default function ExploreExperience({ locale }: { locale: Locale }) {
  const t = dict(locale).explore;
  const L = simLabels[locale];
  const localizedSim = useMemo(() => makeSimData(locale), [locale]);
  const [role, setRole] = useState<string>('ceo');
  // must match the simulator's initialMachine.signal so load never disagrees
  const [signal, setSignal] = useState<SignalKey>('customer-issue');
  const [gate, setGate] = useState<GateChoice>('approve');
  const [drawer, setDrawer] = useState<string | null>(null);

  const roles = t.roles as readonly { id: string; label: string; note: string }[];
  const outcome = GATE_OUTCOMES[signal][gate];

  const signalLabel = (k: SignalKey) => L[`signal_${k.replace(/-/g, '_')}` as keyof typeof L] ?? k;
  const signalNote = (k: SignalKey) => L[`signal_note_${k.replace(/-/g, '_')}` as keyof typeof L] ?? '';

  const transcript = useMemo(() => {
    const oldPart = OLD_HOPS.map((h) => ({
      node: locale === 'fa' ? localizedSim.nodeLabel(h.to) : h.to,
      hours: h.hours,
      handoffs: h.handoffs,
      note: locale === 'fa' ? OLD_NOTES_FA[h.to] ?? h.note : h.note,
    }));
    const newPart = NEW_STEPS.map((s) => ({
      kind: locale === 'fa' ? STEP_KINDS_FA[s.kind] ?? s.kind : s.kind,
      dur: s.dur,
      caption: 'caption' in s ? (locale === 'fa' ? NEW_CAPTIONS_FA[s.caption] ?? s.caption : s.caption) : '',
    }));
    return { oldPart, newPart };
  }, [locale, localizedSim]);

  return (
    <div className="explore">
      <header className="explore-hero">
        <p className="eyebrow">{t.heroTag}</p>
        <h1>{t.h1}</h1>
        <p className="lede">{t.sub}</p>
        <p className="explore-disclaimer">{t.disclaimer}</p>
      </header>

      <section className="explore-step" aria-label={t.roleQ}>
        <h2 className="explore-step-h">{t.roleQ}</h2>
        <div className="role-row" role="group">
          {roles.map((r) => (
            <button
              key={r.id}
              className={`chip chip-btn role-chip ${role === r.id ? 'on' : ''}`}
              aria-pressed={role === r.id}
              onClick={() => setRole(r.id)}
            >
              <strong>{r.label}</strong>
              <span className="role-note">{r.note}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="explore-step" aria-label={t.scenarioQ}>
        <h2 className="explore-step-h">{t.scenarioQ}</h2>
        <div className="role-row" role="group">
          {SIM_SIGNALS.map((s) => (
            <button
              key={s.key}
              className={`chip chip-btn role-chip ${signal === s.key ? 'on' : ''}`}
              aria-pressed={signal === s.key}
              onClick={() => {
                setSignal(s.key);
                qEvent('simulator_run', { scenario: s.key, locale });
              }}
            >
              <strong>{signalLabel(s.key)}</strong>
              <span className="role-note">{signalNote(s.key)}</span>
            </button>
          ))}
        </div>
        <p className="explore-hint">
          {locale === 'fa'
            ? 'با این انتخاب، سناریو، مرحله تأیید انسانی و نسخه متنی با هم تغییر می‌کنند؛ نیازی به انتخاب دوباره در شبیه‌ساز نیست.'
            : 'Your selection drives the simulator scenario, the authority gate, status and transcript together — one source of truth, nothing to re-select.'}
        </p>
      </section>

      <div className="explore-sim" id="simulator">
        <OrgSimulatorSection locale={locale} signal={signal} onSignalChange={setSignal} />
      </div>

      <section className="explore-sources" aria-label={t.sourcesTitle}>
        <h2>{t.sourcesTitle}</h2>
        <p className="explore-src-note">{t.sourcesNote}</p>
        <div className="src-drawers">
          {OSS.layers.map((layer: OssLayer) => {
            const open = drawer === layer.id;
            const map = LAYER_NODE_MAP[layer.id];
            return (
              <article key={layer.id} id={`source-${layer.id}`} className={`src-drawer ${open ? 'open' : ''}`}>
                <button
                  className="src-drawer-head"
                  aria-expanded={open}
                  aria-controls={`src-${layer.id}`}
                  onClick={() => setDrawer(open ? null : layer.id)}
                >
                  <span className="src-num" aria-hidden="true">0{layer.order}</span>
                  <span className="src-name">{layer.name[locale]}</span>
                  <span className="chip chip-mock">{locale === 'fa' ? 'نمونه مفهومی' : 'EXAMPLE STATUS'}</span>
                  <span className="flow-caret" aria-hidden="true">{open ? '−' : '+'}</span>
                </button>
                {open && (
                  <div id={`src-${layer.id}`} className="src-drawer-body">
                    <p>
                      {locale === 'fa' ? 'در بخش بومی هوش مصنوعی شبیه‌ساز، این لایه به گره «' : 'On the AI-native side of the simulator this layer maps to the '}
                      <strong>{locale === 'fa' ? map?.nodeFa : map?.node}</strong>
                      {locale === 'fa' ? '» مرتبط است. ' : ' node. '}
                      {locale === 'fa' ? 'اتصال عملیاتی وجود ندارد؛ این ارتباط برای توضیح معماری است.' : 'No live integration exists — this is a conceptual mapping.'}
                    </p>
                    <p>{layer.brief[locale]}</p>
                    <p className="src-license">
                      <strong>{layer.license.label}</strong> — {locale === 'fa' ? layer.license.noteFa ?? layer.license.note : layer.license.note}
                    </p>
                    <p className="src-links">
                      <a href={layer.githubUrl} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
                      {' · '}
                      <Link href={`/${locale}/insights/enterprise-ai-stack#${layer.id}`}>
                        {locale === 'fa' ? 'شرح کامل در اطلس معماری' : 'Full entry in the stack atlas'} →
                      </Link>
                      {layer.relatedBooks.map((slug) => (
                        <span key={slug}>
                          {' · '}
                          <Link href={`/${locale}/insights/books/${slug}`}>{BOOK_BY_SLUG[slug]?.title[locale].split(':')[0]}</Link>
                        </span>
                      ))}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="explore-gate" aria-label={t.gateTitle}>
        <h2>{t.gateTitle}</h2>
        <p>{t.gateBody}</p>
        <div className="gate-lab">
          <p className="gate-lab-q">
            {locale === 'fa' ? 'سیگنال انتخابی: ' : 'Selected signal: '}
            <strong>{signalLabel(signal)}</strong>
          </p>
          <div className="gate-choices" role="group" aria-label={locale === 'fa' ? 'تصمیم انسانی' : 'Human decision'}>
            {(['approve', 'reject', 'evidence'] as GateChoice[]).map((c) => (
              <button
                key={c}
                className={`chip chip-btn ${gate === c ? 'on' : ''}`}
                aria-pressed={gate === c}
                onClick={() => setGate(c)}
              >
                {c === 'approve' ? (locale === 'fa' ? 'تأیید' : 'Approve') : c === 'reject' ? (locale === 'fa' ? 'رد' : 'Reject') : locale === 'fa' ? 'شواهد بیشتر' : 'Ask for evidence'}
              </button>
            ))}
          </div>
          <p className={`gate-outcome ${gate}`} role="status">{outcome[locale]}</p>
          <p className="gate-log">
            <span className="gate-log-label">{locale === 'fa' ? 'خط زمانی ثبت‌شده' : 'Timeline record'}</span>
            {outcome.log[locale]}
          </p>
        </div>
      </section>

      <details className="explore-transcript">
        <summary>{t.transcriptTitle}</summary>
        <p className="transcript-note">
          {t.transcriptNote}
        </p>
        <div className="transcript-cols">
          <div>
            <h3>{(L.compare_left as string) ?? 'TRADITIONAL'} — {OLD_TOTAL_HOURS} {locale === 'fa' ? 'ساعت' : 'h'} ≈ {locale === 'fa' ? '۴٫۲' : '4.2'} {locale === 'fa' ? 'روز' : 'days'} · {OLD_TOTAL_HANDOFFS} {locale === 'fa' ? 'ارجاع' : 'handoffs'}</h3>
            <ol className="transcript-list">
              {transcript.oldPart.map((h, i) => (
                <li key={i}>
                  <strong>{h.node}</strong> — <bdi>+{h.hours} {locale === 'fa' ? 'ساعت' : 'h'}</bdi> · {h.handoffs} {locale === 'fa' ? 'ارجاع' : 'handoffs'} · {h.note}
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h3>{(L.compare_right as string) ?? 'AI-NATIVE'} — ~{NEW_TOTAL_MINUTES} {locale === 'fa' ? 'دقیقه (مفهومی)' : 'min (conceptual)'}</h3>
            <ol className="transcript-list">
              {transcript.newPart.map((s, i) => (
                <li key={i}>
                  <strong>{s.kind}</strong> — {s.caption}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </details>

      <section className="explore-ctas">
        <Link className="btn btn-primary" href={`/${locale}/services`}>{t.ctaWork}</Link>
        <Link className="btn" href={`/${locale}/lab`}>{t.ctaEvidence}</Link>
        <Link className="btn" href={`/${locale}/contact`}>{t.ctaTalk}</Link>
      </section>
    </div>
  );
}
