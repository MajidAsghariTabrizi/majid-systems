'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { EVIDENCE_BOUNDARY, ROLLOUT } from '../lib/content';
import './summary.css';

type Props = { open: boolean; onClose: () => void };

/** Local-only proposal. Native modality, no submission, printable in isolation. */
export function ExecutiveSummary({ open, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.classList.add('pv-summary-open');
    dialog.showModal();
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      dialog.close();
      document.body.classList.remove('pv-summary-open');
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="pv-summary-portal">
      <dialog
        ref={dialogRef}
        className="pv-summary"
        dir="rtl"
        aria-labelledby="pv-summary-title"
        aria-describedby="pv-summary-purpose"
        onCancel={(event) => { event.preventDefault(); onClose(); }}
      >
        <div className="pv-summary-toolbar">
          <span>خلاصه پیشنهاد راهبردی</span>
          <div>
            <button type="button" className="pv-summary-print" onClick={() => window.print()}>چاپ یا ذخیره پی‌دی‌اف</button>
            <button ref={closeRef} type="button" className="pv-summary-close" aria-label="بستن خلاصه پیشنهاد" onClick={onClose}>بستن <span aria-hidden="true">×</span></button>
          </div>
        </div>

        <article className="pv-summary-document">
          <header className="pv-summary-masthead">
            <div><span className="pv-summary-wordmark">پیوند</span><p>نقشه زنده فرصت‌های اقتصادی ایران</p></div>
            <div className="pv-summary-recipient"><span>برای بررسی آقای بابک زنجانی</span><small>به‌عنوان سرمایه‌گذار راهبردی بالقوه</small></div>
          </header>

          <p className="pv-summary-overline">{EVIDENCE_BOUNDARY.proposal}</p>
          <h1 id="pv-summary-title">اتصال نیاز، توانایی و اعتماد؛<br />از معرفی تا نتیجه.</h1>
          <p id="pv-summary-purpose" className="pv-summary-lede">پیوند، پیشنهادی برای یک شبکه دعوتی است که نیازهای اقتصادی را به توانایی‌ها، عرضه‌های سازگار و مسیرهای معرفی مورد رضایت متصل می‌کند. آزمون اولیه باید نشان دهد آیا این اتصال، به گفت‌وگو و همکاری قابل تأیید می‌رسد.</p>

          <div className="pv-summary-sections">
            <section>
              <h2><span>۰۱</span> فرصت مورد بررسی</h2>
              <p>فهرست افراد به‌تنهایی کافی نیست. پیشنهاد پیوند این است که «چه کسی را می‌شناسیم» در کنار «الان چه می‌خواهد»، «چه می‌تواند ارائه کند» و «چه شواهدی در دسترس است» قرار بگیرد. ارزش این سازوکار باید در آزمون میدانی سنجیده شود.</p>
            </section>
            <section>
              <h2><span>۰۲</span> محصول نخست</h2>
              <p>یک شبکه خصوصی میان تولیدکنندگان، پخش‌کنندگان، خرده‌فروشان و ارائه‌دهندگان خدمات یک حوزه مشخص؛ با ثبت نیاز و عرضه، زمان اعتبار، شرایط تجاری و دسترسی انتخابی. هوش مصنوعی مسیر پیشنهاد می‌دهد؛ تصمیم معرفی با انسان و رضایت طرفین است.</p>
            </section>
            <section className="pv-summary-wide">
              <h2><span>۰۳</span> شش شبکه، یک مدل داده</h2>
              <p className="pv-summary-graphs">ارتباطات <span>·</span> نیازها <span>·</span> توانایی‌ها <span>·</span> تجارت <span>·</span> اعتماد <span>·</span> نتایج</p>
              <p>یک هویت می‌تواند چند نقش داشته باشد، اما دیدپذیری، دسترسی و رضایت هر نقش مستقل است. سابقه و مرجع اعتماد فقط با اجازه و همراه شواهد بررسی می‌شوند؛ هیچ امتیاز اعتماد ساختگی برای افراد واقعی ساخته نمی‌شود.</p>
            </section>
            <section>
              <h2><span>۰۴</span> پایلوت پیشنهادی</h2>
              <p>یک گروه کالایی، یک محدوده و گروه محدودی از سازمان‌های داوطلب انتخاب شوند. نیازها و عرضه‌ها بررسی، پیشنهادها با کمک انسان بازبینی و معرفی‌ها پس از پذیرش طرفین انجام شوند. دامنه، هزینه اجرا، معیار موفقیت و شرط توقف پیش از آغاز توافق شوند.</p>
            </section>
            <section>
              <h2><span>۰۵</span> شاهدی که ارزش دارد</h2>
              <p>پیشنهاد تطبیق، معرفی پذیرفته‌شده، جلسه برگزارشده، فرصت واجد شرایط و همکاری تأییدشده جداگانه اندازه‌گیری شوند. نتیجه با تأیید طرفین ثبت شود؛ تعداد اعضا، بازدید یا کلیک جای نتیجه اقتصادی را نگیرد.</p>
            </section>
            <section className="pv-summary-wide">
              <h2><span>۰۶</span> منطق درآمد؛ هنوز یک فرضیه</h2>
              <p>اشتراک کسب‌وکارها، کشف فرصت، معرفی واجد شرایط، اتصال به فرایندهای سازمانی و شبکه اختصاصی مجموعه‌ها، مسیرهای قابل آزمون‌اند. قیمت، تمایل به پرداخت و اقتصاد هر مسیر باید با تجربه واقعی مشتری و هزینه هماهنگی سنجیده شوند؛ در این پیشنهاد تأیید نشده‌اند.</p>
            </section>
          </div>

          <section className="pv-summary-rollout">
            <h2>توسعه مشروط به شواهد</h2>
            <ol>{ROLLOUT.map((step) => <li key={step.title}>{step.title}</li>)}</ol>
            <p>این مسیر، ترتیب پیشنهادی توسعه است؛ نه پیش‌بینی رشد یا تضمین رسیدن به مقیاس ملی.</p>
          </section>

          <footer className="pv-summary-foot">
            <p><strong>تصمیم پیشنهادی:</strong> بررسی امکان اجرای یک پایلوت محدود، با معیار روشن برای ادامه یا توقف؛ نه تعهد به سرمایه‌گذاری یا اجرای سراسری.</p>
            <p className="pv-summary-boundary">این سند، طرح مفهومی است. هیچ سرمایه‌گذاری، تأیید، مشارکت، مشتری یا عملکرد مالی محقق‌شده‌ای ادعا نمی‌کند. تمام سناریوهای نمایش تعاملی فرضی‌اند.</p>
            <div><span>{EVIDENCE_BOUNDARY.attribution}</span><span>نسخه اولیه · برای بررسی</span></div>
          </footer>
        </article>
      </dialog>
    </div>,
    document.body,
  );
}
