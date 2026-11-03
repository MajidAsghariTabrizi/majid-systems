'use client';

import { qEvent } from '@/lib/analytics';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { dict, type Locale } from '@/content/i18n';
import { LEAD_INTENTS, validateLead } from '@/lib/lead/validate';

type Status = 'idle' | 'sending' | 'success' | 'error';

/** Single source of truth: LEAD_INTENTS in lib/lead/validate.ts (server truth).
 *  The select and the ?intent= preselect must never drift from the API's set. */
// 'solution_request' is a programmatic intent set by Solutions pages, never a
// dropdown option in the general contact form.
const INTENT_KEYS = LEAD_INTENTS.filter((k) => k !== 'solution_request');

export function LeadForm({ locale }: { locale: Locale }) {
  const t = dict(locale).contact.form;
  const search = useSearchParams();
  const [intent, setIntent] = useState<string>('diagnostic');
  const [status, setStatus] = useState<Status>('idle');
  const [ref, setRef] = useState('');
  const [errKind, setErrKind] = useState<'validation' | 'rate' | 'server' | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [preferred, setPreferred] = useState<'email' | 'linkedin'>('email');
  const [moreOpen, setMoreOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const pendingRef = useRef(false);

  useEffect(() => {
    const q = search?.get('intent');
    if (q && (INTENT_KEYS as readonly string[]).includes(q)) setIntent(q);
  }, [search]);

  useEffect(() => {
    if (status === 'success') successRef.current?.focus();
    else if (status === 'error' && Object.keys(fieldErrors).length) {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    }
  }, [status, fieldErrors]);

  function reportValidation(errors: Record<string, string>) {
    const localized: Record<string, string> = {};
    for (const [key, code] of Object.entries(errors)) {
      if (code === 'too_long') localized[key] = t.errors.tooLong;
      else if (code === 'invalid_email') localized[key] = t.errors.email;
      else if (code === 'invalid_url') localized[key] = key === 'preferredLink' ? t.errors.preferredLink : t.errors.website;
      else if (key === 'name') localized[key] = t.errors.name;
      else if (key === 'consent') localized[key] = t.errors.consent;
      else localized[key] = t.errors.message;
    }
    if (errors.org || errors.role || errors.website) setMoreOpen(true);
    setFieldErrors(localized);
    setErrKind('validation');
    setStatus('error');
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pendingRef.current) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    setErrKind(null);
    setFieldErrors({});
    const payload = {
      intent, name: fd.get('name'), email: fd.get('email'), org: fd.get('org'),
      website: fd.get('website'), role: fd.get('role'), message: fd.get('message'),
      preferred: fd.get('preferred'), preferredLink: fd.get('preferredLink'),
      consent: fd.get('consent') === 'on', company_site: fd.get('company_site'), locale,
    };
    const validation = validateLead(payload);
    if (!validation.ok) {
      reportValidation(validation.errors);
      return;
    }
    pendingRef.current = true;
    setStatus('sending');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.status === 429) {
        setErrKind('rate');
        setStatus('error');
        return;
      }
      const data = (await res.json()) as { ok: boolean; id?: string; errors?: Record<string, string> };
      if (res.ok && data.ok && data.id) {
        setRef(data.id);
        setStatus('success');
        form.reset();
        // server-confirmed conversion only (taxonomy v1): diagnostic_request
        // when the chosen intent IS the diagnostic, otherwise contact_submit_success
        if (intent === 'diagnostic') qEvent('diagnostic_request', { locale });
        else qEvent('contact_submit_success', { intent: String(intent).slice(0, 40), locale });
        return;
      }
      if (data.errors) {
        reportValidation(data.errors);
      } else {
        setErrKind('server');
      }
      setStatus('error');
    } catch {
      setErrKind('server');
      setStatus('error');
    } finally {
      pendingRef.current = false;
    }
  }

  if (status === 'success') {
    return (
      <div className="lead-success" ref={successRef} tabIndex={-1} role="status" aria-live="polite">
        <h2 className="lead-success-title">{t.successTitle}</h2>
        <p className="lead-success-body">{t.successBody.replace('{id}', ref)}</p>
        <p className="lead-direct">
          {dict(locale).contact.directNote}
        </p>
      </div>
    );
  }

  return (
    <form className="lead-form" ref={formRef} onSubmit={onSubmit} noValidate aria-busy={status === 'sending'}>
      {/* honeypot — invisible to humans, irresistible to bots */}
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="company_site">{t.honeypotLabel}</label>
        <input id="company_site" name="company_site" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="lead-row">
        <label className="lead-field">
          <span className="lead-label">{t.intent}</span>
          <select name="intent-display" value={intent} onChange={(e) => setIntent(e.target.value)}>
            {INTENT_KEYS.map((k) => (
              <option key={k} value={k}>
                {t.intents[k]}
              </option>
            ))}
          </select>
        </label>
        <label className="lead-field">
          <span className="lead-label">{t.preferred}</span>
          <select
            name="preferred"
            value={preferred}
            onChange={(e) => setPreferred(e.target.value as 'email' | 'linkedin')}
          >
            <option value="email">{t.preferredOptions.email}</option>
            <option value="linkedin">{t.preferredOptions.linkedin}</option>
          </select>
        </label>
      </div>

      <div className="lead-row">
        <label className="lead-field">
          <span className="lead-label">{t.name} *</span>
          <input
            name="name"
            type="text"
            required
            maxLength={100}
            autoComplete="name"
            aria-invalid={!!fieldErrors.name}
            aria-describedby={fieldErrors.name ? 'err-name' : undefined}
          />
          {fieldErrors.name && (
            <span className="lead-error" id="err-name">{fieldErrors.name}</span>
          )}
        </label>
        <label className="lead-field">
          <span className="lead-label">{t.email} *</span>
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            dir="ltr"
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? 'err-email' : undefined}
          />
          {fieldErrors.email && (
            <span className="lead-error" id="err-email">{fieldErrors.email}</span>
          )}
        </label>
      </div>

      {preferred === 'linkedin' && (
        <div className="lead-row">
          <label className="lead-field">
            <span className="lead-label">{t.preferredLink}</span>
            <input
              name="preferredLink"
              type="url"
              maxLength={300}
              placeholder="https://linkedin.com/in/…"
              dir="ltr"
              aria-invalid={!!fieldErrors.preferredLink}
              aria-describedby={fieldErrors.preferredLink ? 'err-preferredLink' : undefined}
            />
            {fieldErrors.preferredLink && (
              <span className="lead-error" id="err-preferredLink">{fieldErrors.preferredLink}</span>
            )}
          </label>
        </div>
      )}

      <details className="lead-more" open={moreOpen} onToggle={(e) => setMoreOpen(e.currentTarget.open)}>
        <summary>{t.moreLabel}</summary>
        <div className="lead-row">
          <label className="lead-field">
            <span className="lead-label">{t.org}</span>
            <input name="org" type="text" maxLength={150} autoComplete="organization" aria-invalid={!!fieldErrors.org} aria-describedby={fieldErrors.org ? 'err-org' : undefined} />
            {fieldErrors.org && <span className="lead-error" id="err-org">{fieldErrors.org}</span>}
          </label>
          <label className="lead-field">
            <span className="lead-label">{t.role}</span>
            <input name="role" type="text" maxLength={100} autoComplete="organization-title" aria-invalid={!!fieldErrors.role} aria-describedby={fieldErrors.role ? 'err-role' : undefined} />
            {fieldErrors.role && <span className="lead-error" id="err-role">{fieldErrors.role}</span>}
          </label>
        </div>
        <div className="lead-row">
          <label className="lead-field">
            <span className="lead-label">{t.website}</span>
            <input
              name="website"
              type="url"
              maxLength={300}
              placeholder="https://…"
              dir="ltr"
              aria-invalid={!!fieldErrors.website}
              aria-describedby={fieldErrors.website ? 'err-website' : undefined}
            />
            {fieldErrors.website && <span className="lead-error" id="err-website">{fieldErrors.website}</span>}
          </label>
        </div>
      </details>

      <label className="lead-field">
        <span className="lead-label">{t.message} *</span>
        <textarea
          name="message"
          required
          maxLength={5000}
          rows={5}
          aria-invalid={!!fieldErrors.message}
          aria-describedby={fieldErrors.message ? 'hint-message err-message' : 'hint-message'}
        />
        <span className="lead-hint" id="hint-message">{t.messageHint}</span>
        {fieldErrors.message && (
          <span className="lead-error" id="err-message">{fieldErrors.message}</span>
        )}
      </label>

      <label className="lead-consent">
        <input
          name="consent"
          type="checkbox"
          required
          aria-invalid={!!fieldErrors.consent}
          aria-describedby={fieldErrors.consent ? 'err-consent' : undefined}
        />
        <span>
          {t.consent}{' '}
          <a href={`/${locale}/privacy`} className="lead-privacy-link">
            {t.privacyLink}
          </a>
        </span>
      </label>
      {fieldErrors.consent && (
        <span className="lead-error" id="err-consent">{fieldErrors.consent}</span>
      )}

      {errKind === 'validation' && <p className="lead-error lead-error-summary" role="alert">
        {locale === 'fa' ? 'لطفاً فیلدهای مشخص‌شده را بررسی و اصلاح کنید؛ اطلاعات واردشده حفظ شده است.' : 'Please check the highlighted fields. Your entered information has been kept.'}
      </p>}

      {errKind === 'rate' && (
        <p className="lead-error" role="alert">{t.rateLimited}</p>
      )}
      {errKind === 'server' && (
        <div role="alert">
          <p className="lead-error">{t.errorTitle}</p>
          <p className="lead-hint">{t.errorRetry}</p>
        </div>
      )}

      <button type="submit" className="btn btn-primary lead-submit" disabled={status === 'sending'}>
        {status === 'sending' ? t.submitting : t.submit}
        {status !== 'sending' && <span className="arrow" aria-hidden>→</span>}
      </button>
    </form>
  );
}
