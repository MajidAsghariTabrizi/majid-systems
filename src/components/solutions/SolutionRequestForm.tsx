'use client';

/** Solution request form — guest path, no login, exact owner field set.
 *  selected solution locked (server re-validates the slug), name, email,
 *  company, phone (optional), need (optional), consent. Persisted via the
 *  existing /api/lead pipeline (durable-first, then owner notification). */
import { useState } from 'react';

import type { SolutionEntry } from '@/content/solutions';
import type { Locale } from '@/content/i18n';
import { qEvent } from '@/lib/analytics';

type Errors = Partial<Record<'name' | 'email' | 'org' | 'phone' | 'consent' | 'form', string>>;

const T = {
  en: {
    name: 'Your name', email: 'Work email', org: 'Company / organization',
    phone: 'Phone (optional)', need: 'Briefly, what do you want to improve? (optional)',
    needPh: 'e.g. our quotation turnaround is too slow…', consent:
    'I agree that Quantiviq may contact me about this request. My details are handled per the privacy policy.',
    submit: 'Submit request', submitting: 'Submitting…',
    fail: 'Something went wrong — please try again in a moment.',
    selected: 'Selected solution',
  },
  fa: {
    name: 'نام و نام خانوادگی', email: 'ایمیل کاری', org: 'نام شرکت / سازمان',
    phone: 'تلفن (اختیاری)', need: 'به‌اختصار، چه چیزی را می‌خواهید بهتر شود؟ (اختیاری)',
    needPh: 'مثلاً زمان صدور پیش‌فاکتور ما زیاد طول می‌کشد…', consent:
    'موافقم که کوانتی‌ویک برای پیگیری همین درخواست با من تماس بگیرد. اطلاعات من طبق سیاست حفظ حریم خصوصی نگهداری می‌شود.',
    submit: 'ثبت درخواست', submitting: 'در حال ارسال…',
    fail: 'خطایی رخ داد — لطفاً کمی بعد دوباره تلاش کنید.',
    selected: 'راهکار انتخاب‌شده',
  },
};

export function SolutionRequestForm({ solution, locale, source }: { solution: SolutionEntry; locale: Locale; source?: string }) {
  const l = locale === 'fa' ? 'fa' : 'en';
  const t = T[l];
  const [values, setValues] = useState({ name: '', email: '', org: '', phone: '', need: '' });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ ref: string } | null>(null);
  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Errors = {};
    if (values.name.trim().length < 2) errs.name = 'required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) errs.email = 'invalid';
    if (!consent) errs.consent = 'required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
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
        }),
      });
      const data = (await res.json()) as { ok: boolean; id?: string; errors?: Errors };
      if (!res.ok || !data.ok) {
        setErrors({ form: t.fail });
        qEvent('solution_request_failure', { solution: solution.id, locale });
      } else {
        setDone({ ref: data.id ?? '' });
        qEvent('solution_request_success', { solution: solution.id, locale });
      }
    } catch {
      setErrors({ form: t.fail });
      qEvent('solution_request_failure', { solution: solution.id, locale });
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
        {done.ref ? <p className="ref">{done.ref}</p> : null}
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="sol-selected" aria-label={t.selected}>
        <span aria-hidden="true">◆</span>
        <span>{t.selected}: {solution.title[l]}</span>
      </div>
      <div className="sol-field">
        <span>{t.name} *</span>
        <input value={values.name} onChange={set('name')} autoComplete="name" maxLength={100} required />
        {errors.name ? <span className="err">{l === 'fa' ? 'الزامی است' : 'Required'}</span> : null}
      </div>
      <div className="sol-field">
        <span>{t.email} *</span>
        <input type="email" dir="ltr" value={values.email} onChange={set('email')} autoComplete="email" maxLength={254} required />
        {errors.email ? <span className="err">{l === 'fa' ? 'ایمیل معتبر وارد کنید' : 'Valid email required'}</span> : null}
      </div>
      <div className="sol-field">
        <span>{t.org} *</span>
        <input value={values.org} onChange={set('org')} autoComplete="organization" maxLength={150} required />
      </div>
      <div className="sol-field">
        <span>{t.phone} <span className="opt">({l === 'fa' ? 'اختیاری' : 'optional'})</span></span>
        <input type="tel" dir="ltr" value={values.phone} onChange={set('phone')} autoComplete="tel" maxLength={30} />
        {errors.phone ? <span className="err">{l === 'fa' ? 'شماره معتبر نیست' : 'Invalid phone'}</span> : null}
      </div>
      <div className="sol-field">
        <span>{t.need} <span className="opt">({l === 'fa' ? 'اختیاری' : 'optional'})</span></span>
        <textarea rows={3} value={values.need} onChange={set('need')} placeholder={t.needPh} maxLength={2000} />
      </div>
      <label className="sol-consent">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>{t.consent}</span>
      </label>
      {errors.consent ? <p className="sol-field err" style={{ marginTop: -10 }}>{l === 'fa' ? 'پذیرش الزامی است' : 'Consent is required'}</p> : null}
      {errors.form ? <p className="sol-field err">{errors.form}</p> : null}
      <button className="sol-submit" type="submit" disabled={busy}>
        {busy ? t.submitting : t.submit}
      </button>
    </form>
  );
}
