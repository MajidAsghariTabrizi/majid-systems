'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import type { Locale } from '@/content/i18n';

const stages = [
  {
    key: 'signal', x: 15, y: 50,
    en: 'Signal', fa: 'نشانه',
    titleEn: 'Start with what changed.', titleFa: 'از تغییری که رخ داده شروع کنید.',
    bodyEn: 'A customer issue, a delayed order, an unexpected cost. Give the question a clear owner before choosing a tool.',
    bodyFa: 'مسئله مشتری، تأخیر سفارش یا هزینه پیش‌بینی‌نشده؛ پیش از انتخاب ابزار، پرسش و مسئول پیگیری را روشن کنید.',
    noteEn: 'A real business question', noteFa: 'یک پرسش واقعی کسب‌وکار',
  },
  {
    key: 'context', x: 50, y: 48,
    en: 'Knowledge', fa: 'دانش',
    titleEn: 'Bring the evidence into view.', titleFa: 'شواهد را کنار هم بگذارید.',
    bodyEn: 'Connect relevant records, prior decisions and their sources. Keep uncertainty visible so the next decision has context.',
    bodyFa: 'سوابق مرتبط، تصمیم‌های پیشین و منابع آن‌ها را به هم وصل کنید. ابهام را آشکار نگه دارید تا تصمیم بعدی بر شناخت تکیه کند.',
    noteEn: 'Sources · history · uncertainty', noteFa: 'منابع · سابقه · ابهام',
  },
  {
    key: 'authority', x: 50, y: 14,
    en: 'Authority', fa: 'اختیار',
    titleEn: 'Intelligence is not authority.', titleFa: 'هوشمندی، اختیار تصمیم نیست.',
    bodyEn: 'Name the person who can approve the action. Define what an agent may do, when it must stop, and how to reverse a change.',
    bodyFa: 'مشخص کنید چه کسی مجاز به تأیید اقدام است؛ عامل هوشمند چه کاری می‌تواند انجام دهد، کجا باید متوقف شود و تغییر چگونه بازگردد.',
    noteEn: 'A named human decision owner', noteFa: 'مسئول مشخص برای تأیید تصمیم',
  },
  {
    key: 'action', x: 85, y: 50,
    en: 'Action', fa: 'اقدام',
    titleEn: 'Move work with clear boundaries.', titleFa: 'کار را با حدود روشن پیش ببرید.',
    bodyEn: 'People and agents carry out the approved workflow. Exceptions return to an owner; actions leave a record.',
    bodyFa: 'افراد و عامل‌ها فرایند تأییدشده را اجرا می‌کنند. موارد استثنا به مسئول مربوط برمی‌گردد و سابقه اقدام باقی می‌ماند.',
    noteEn: 'Bounded execution · traceable changes', noteFa: 'اجرای محدود · تغییرات قابل پیگیری',
  },
  {
    key: 'learning', x: 50, y: 83,
    en: 'Learning', fa: 'یادگیری',
    titleEn: 'Let the result change the system.', titleFa: 'از نتیجه، سیستم را بهتر کنید.',
    bodyEn: 'Compare the outcome with the starting point. Keep what helped, examine what failed, and update the shared knowledge.',
    bodyFa: 'نتیجه را با نقطه شروع بسنجید. آنچه مفید بوده حفظ کنید، شکست را بررسی کنید و دانش مشترک را به‌روز نگه دارید.',
    noteEn: 'Measured outcomes · a retained lesson', noteFa: 'نتیجه سنجیده‌شده · تجربه ماندگار',
  },
] as const;

/** A manual, inspectable model. No autoplay, synthetic metrics or live claims. */
export function DecisionAtlas({ locale }: { locale: Locale }) {
  const [selected, setSelected] = useState(2);
  const id = useId();
  const fa = locale === 'fa';
  const stage = stages[selected];
  return (
    <section className="decision-atlas" aria-label={fa ? 'نقشه تعاملی تصمیم و اقدام' : 'Interactive decision and action map'}>
      <div className="atlas-heading"><span>{fa ? 'منطق کار کوانتی‌ویک' : 'THE QUANTIVIQ OPERATING LOGIC'}</span><span>{fa ? 'مدل مفهومی' : 'CONCEPT MODEL'}</span></div>
      <div className="atlas-plate">
        <svg viewBox="0 0 500 340" aria-hidden="true" className="atlas-lines">
          <defs><marker id={`${id}-arrow`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 8 4 0 8" fill="currentColor" /></marker></defs>
          <circle cx="250" cy="164" r="116" className="atlas-orbit" />
          <circle cx="250" cy="164" r="68" className="atlas-orbit inner" />
          <path d="M105 170H195 M250 133V75 M305 170H391 M422 196C407 280 341 283 282 283 M219 282C147 282 154 219 215 202" className="atlas-route" markerEnd={`url(#${id}-arrow)`} />
          <path d="M28 28H46M37 19V37M454 306H472M463 297V315" className="atlas-register" />
          <text x="29" y="315" className="atlas-notation">Q / 01</text>
        </svg>
        {stages.map((item, i) => (
          <button type="button" key={item.key} className={`atlas-node atlas-${item.key}`} style={{ left: `${item.x}%`, top: `${item.y}%` }} aria-pressed={selected === i} aria-controls={`${id}-detail`} onClick={() => setSelected(i)}>
            <span className="atlas-node-number" aria-hidden="true">{new Intl.NumberFormat(fa ? 'fa' : 'en', { minimumIntegerDigits: 2 }).format(i + 1)}</span>
            <span>{fa ? item.fa : item.en}</span>
          </button>
        ))}
      </div>
      <div className="atlas-detail" id={`${id}-detail`} aria-live="polite" aria-atomic="true">
        <p className="atlas-detail-note">{fa ? stage.noteFa : stage.noteEn}</p>
        <h2>{fa ? stage.titleFa : stage.titleEn}</h2>
        <p>{fa ? stage.bodyFa : stage.bodyEn}</p>
      </div>
      <div className="atlas-footer"><span>{fa ? 'هر گره را انتخاب کنید' : 'Select a node to inspect'}</span><Link href={`/${locale}/explore#simulator`}>{fa ? 'یک سناریو را امتحان کنید ←' : 'Try a scenario →'}</Link></div>
    </section>
  );
}
