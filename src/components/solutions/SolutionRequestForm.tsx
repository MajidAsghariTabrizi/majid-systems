'use client';

/** Solution request form — guest path, no login, exact owner field set.
 *  selected solution locked (server re-validates the slug), name, email,
 *  company (required — owner contract), phone (optional), need (optional),
 *  consent. Persisted via /api/lead (durable-first, then notification).
 *  Closure 2026-11-02: programmatic labels, field-linked errors, aria-invalid,
 *  error summary + focus management, server/429 error mapping, localized
 *  privacy link, per-submission idempotency key (safe network retry). */
import { useRef, useState } from 'react';

import type { SolutionEntry } from '@/content/solutions';
import type { Locale } from '@/content/i18n';
import { qEvent } from '@/lib/analytics';

type FieldKey = 'name' | 'email' | 'org' | 'phone' | 'need' | 'consent' | 'form';
type Errors = Partial<Record<FieldKey, string>>;

const T = {
  en: {
    name: 'Your name', email: 'Work email', org: 'Company / organization',
    phone: 'Phone', need: 'Briefly, what do you want to improve?',
    needPh: 'e.g. our quotation turnaround is too slow…',
    consent: 'I agree that Quantiviq may contact me about this request. My details are handled per the',
    privacy: 'privacy policy',
    submit: 'Submit request', submitting: 'Submitting…', selected: 'Selected solution',
    req: 'Required', emailReq: 'Enter a valid email address',
    orgReq: 'Company or organization name is required',
    phoneBad: 'Enter a valid phone number, or leave this empty',
    needShort: 'Please write at least 10 characters, or leave this empty',
    consentReq: 'Consent is required to submit',
    srvInvalid: 'Some entries could not be accepted — please review the highlighted fields.',
    srv429: 'Too many requests from your connection — please wait a bit and try again.',
    srvConflict: 'This form was already submitted with different details. Reload the page to start a new request.',
    fail: 'Something went wrong — please try again in a moment.',
    summaryTitle: 'Please fix the following:',
  },
  fa: {
    name: 'نام و نام خانوادگی', email: 'ایمیل کاری', org: 'نام شرکت / سازمان',
    phone: 'تلفن', need: 'به‌اختصار، چه چیزی را می‌خواهید بهتر شود؟',
    needPh: 'مثلاً زمان صدور پیش‌فاکتور ما زیاد طول می‌کشد…',
    consent: 'موافقم که کوانتی‌ویک برای پیگیری همین درخواست با من تماس بگیرد. اطلاعات من طبق',
    privacy: 'سیاست حفظ حریم خصوصی',
    submit: 'ثبت درخواست', submitting: 'در حال ارسال…', selected: 'راهکار انتخاب‌شده',
    req: 'الزامی است', emailReq: 'ایمیل معتبر وارد کنید',
    orgReq: 'نام شرکت یا سازمان الزامی است',
    phoneBad: 'شماره تماس معتبر وارد کنید یا این فیلد را خالی بگذارید',
    needShort: 'حداقل ۱۰ نویسه بنویسید یا این فیلد را خالی بگذارید',
    consentReq: 'پذیرش این بند برای ثبت درخواست الزامی است',
    srvInvalid: 'برخی مقادیر پذیرفته نشد — لطفاً فیلدهای مشخص‌شده را بررسی کنید.',
    srv429: 'تعداد درخواست‌ها از ارتباط شما زیاد بوده — کمی صبر کنید و دوباره تلاش کنید.',
    srvConflict: 'این فرم قبلاً با اطلاعات متفاوتی ارسال شده است. برای درخواست جدید صفحه را بازخوانی کنید.',
    fail: 'خطایی رخ داد — لطفاً کمی بعد دوباره تلاش کنید.',
    summaryTitle: 'لطفاً موارد زیر را اصلاح کنید:',
  },
};

/** Mirrors the server contract: Persian/Arabic-Indian digits are legitimate —
 *  normalize to ASCII before checking the shape. */
function phoneOk(raw: string): boolean {
  const fa = '۰۱۲۳۴۵۶۷۸۹';
  const ar = '٠١٢٣٤٥٦٧٨٩';
  const v = raw.replace(/[\u06f0-\u06f9\u0660-\u0669]/g, (d) => {
    const fi = fa.indexOf(d);
    if (fi >= 0) return String(fi);
    return String(ar.indexOf(d));
  }).trim();
  return v === '' || /^[+0-9\s()-]{4,30}$/.test(v);
}

export function SolutionRequestForm({ solution, locale, source }: { solution: SolutionEntry; locale: Locale; source?: string }) {
  const l = locale === 'fa' ? 'fa' : 'en';
  const t = T[l];
  const [values, setValues] = useState({ name: '', email: '', org: '', phone: '', need: '' });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ ref: string } | null>(null);
  // Per-submission key: a network retry (timeout after the server accepted)
  // returns the SAME durable reference instead of creating a second lead.
  const idemKey = useRef(typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const summaryRef = useRef<HTMLDivElement>(null);
  const firstInvalid = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  function clientValidate(): Errors {
    const errs: Errors = {};
    if (values.name.trim().length < 2) errs.name = t.req;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) errs.email = t.emailReq;
    if (values.org.trim().length < 1) errs.org = t.orgReq;
    if (!phoneOk(values.phone)) errs.phone = t.phoneBad;
    const need = values.need.trim();
    if (need.length > 0 && need.length < 10) errs.need = t.needShort;
    if (!consent) errs.consent = t.consentReq;
    return errs;
  }

  function failWith(errs: Errors) {
    setErrors(errs);
    // Announce + focus: summary for server failures, first invalid field for
    // client validation. Entered values are intentionally preserved.
    requestAnimationFrame(() => {
      if (errs.form && summaryRef.current) summaryRef.current.focus();
      else firstInvalid.current?.focus();
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || done) return; // duplicate network sends prevented at the source
    firstInvalid.current = null;
    const errs = clientValidate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      requestAnimationFrame(() => firstInvalid.current?.focus());
      return;
    }
    setBusy(true);
    qEvent('solution_request_start', { solution: solution.id, locale });
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          intent: 'solution_request',
          locale,
          solution: solution.id,
          source: source ?? 'solutions',
          name: values.name.trim(),
          email: values.email.trim(),
          org: values.org.trim(),
          phone: values.phone.trim(),
          message: values.need.trim(),
          preferred: 'email',
          consent: true,
          idempotencyKey: idemKey.current,
        }),
      });
      let data: { ok?: boolean; id?: string; errors?: Record<string, string>; idempotentReplay?: boolean } = {};
      try {
        data = (await res.json()) as typeof data;
      } catch {
        /* non-JSON error body handled below */
      }
      if (res.status === 429) {
        failWith({ form: t.srv429 });
        qEvent('solution_request_failure', { solution: solution.id, locale, reason: 'rate_limited' });
        return;
      }
      if (res.status === 409) {
        failWith({ form: t.srvConflict });
        qEvent('solution_request_failure', { solution: solution.id, locale, reason: 'idempotency_conflict' });
        return;
      }
      if (!res.ok || !data.ok || typeof data.id !== 'string' || !data.id.startsWith('QV-') || data.id === 'QV-ignored') {
        // Map known field errors to precise localized messages; anything else
        // stays a reviewable generic failure (never a fake success).
        const se = data.errors ?? {};
        const mapped: Errors = { form: t.fail };
        if (se.org === 'required') mapped.org = t.orgReq;
        if (se.email === 'invalid') mapped.email = t.emailReq;
        if (se.phone === 'invalid_phone') mapped.phone = t.phoneBad;
        if (se.solution === 'required' || se.solution === 'unknown' || se.solution === 'invalid') {
          mapped.form = t.srvInvalid;
        }
        if (Object.keys(se).length > 0 && mapped.form === t.fail) mapped.form = t.srvInvalid;
        failWith(mapped);
        qEvent('solution_request_failure', { solution: solution.id, locale, reason: 'server_rejected' });
        return;
      }
      // Registered success REQUIRES a real durable reference from the server.
      setDone({ ref: data.id });
      qEvent('solution_request_success', { solution: solution.id, locale });
    } catch {
      failWith({ form: t.fail });
      qEvent('solution_request_failure', { solution: solution.id, locale, reason: 'network' });
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="sol-confirm" role="status">
        <h2>{l === 'fa'
          ? 'درخواست شما ثبت شد. برای بررسی نیاز سازمان و ارائه پیشنهاد اختصاصی با شما ارتباط می‌گیریم.'
          : 'Your request has been registered. We will contact you to understand your organization and prepare a tailored proposal.'}</h2>
        <p className="ref">{done.ref}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="sol-selected" aria-label={t.selected}>
        <span aria-hidden="true">◆</span>
        <span>{t.selected}: {solution.title[l]}</span>
      </div>

      {errors.form ? (
        <div className="sol-error-summary" role="alert" tabIndex={-1} ref={summaryRef}>
          <strong>{t.summaryTitle}</strong> <span>{errors.form}</span>
        </div>
      ) : null}

      <div className="sol-field">
        <label htmlFor="sr-name">{t.name} *</label>
        <input id="sr-name" value={values.name} onChange={set('name')} autoComplete="name" maxLength={100} required aria-required="true"
          aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'err-name' : undefined}
          ref={(el) => { if (errors.name && !firstInvalid.current) firstInvalid.current = el; }} />
        {errors.name ? <span id="err-name" className="err">{errors.name}</span> : null}
      </div>
      <div className="sol-field">
        <label htmlFor="sr-email">{t.email} *</label>
        <input id="sr-email" type="email" dir="ltr" value={values.email} onChange={set('email')} autoComplete="email" maxLength={254} required aria-required="true"
          aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'err-email' : undefined} />
        {errors.email ? <span id="err-email" className="err">{errors.email}</span> : null}
      </div>
      <div className="sol-field">
        <label htmlFor="sr-org">{t.org} *</label>
        <input id="sr-org" value={values.org} onChange={set('org')} autoComplete="organization" maxLength={150} required aria-required="true"
          aria-invalid={Boolean(errors.org)} aria-describedby={errors.org ? 'err-org' : undefined} />
        {errors.org ? <span id="err-org" className="err">{errors.org}</span> : null}
      </div>
      <div className="sol-field">
        <label htmlFor="sr-phone">{t.phone} <span className="opt">({l === 'fa' ? 'اختیاری' : 'optional'})</span></label>
        <input id="sr-phone" type="tel" dir="ltr" value={values.phone} onChange={set('phone')} autoComplete="tel" maxLength={30}
          aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'err-phone' : undefined} />
        {errors.phone ? <span id="err-phone" className="err">{errors.phone}</span> : null}
      </div>
      <div className="sol-field">
        <label htmlFor="sr-need">{t.need} <span className="opt">({l === 'fa' ? 'اختیاری' : 'optional'})</span></label>
        <textarea id="sr-need" rows={3} value={values.need} onChange={set('need')} placeholder={t.needPh} maxLength={2000}
          aria-invalid={Boolean(errors.need)} aria-describedby={errors.need ? 'err-need' : undefined} />
        {errors.need ? <span id="err-need" className="err">{errors.need}</span> : null}
      </div>
      <label className="sol-consent">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
          aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? 'err-consent' : undefined} />
        <span>
          {t.consent}{' '}
          <a href={`/${l}/privacy`} target="_blank" rel="noopener">{t.privacy}</a>
          {l === 'fa' ? ' نگهداری می‌شود.' : '.'}
        </span>
      </label>
      {errors.consent ? <span id="err-consent" className="err" style={{ display: 'block', marginTop: -6 }}>{errors.consent}</span> : null}
      <button className="sol-submit" type="submit" disabled={busy}>
        {busy ? t.submitting : t.submit}
      </button>
    </form>
  );
}
