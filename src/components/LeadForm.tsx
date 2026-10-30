'use client';

import { qEvent } from '@/lib/analytics';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { dict, type Locale } from '@/content/i18n';
import { LEAD_INTENTS } from '@/lib/lead/validate';

type Status = 'idle' | 'sending' | 'success' | 'error';

/** Single source of truth: LEAD_INTENTS in lib/lead/validate.ts (server truth).
 *  The select and the ?intent= preselect must never drift from the API's set. */
const INTENT_KEYS = LEAD_INTENTS;

export function LeadForm({ locale }: { locale: Locale }) {
  const t = dict(locale).contact.form;
  const search = useSearchParams();
  const [intent, setIntent] = useState<string>('diagnostic');
  const [status, setStatus] = useState<Status>('idle');
  const [ref, setRef] = useState('');
  const [errKind, setErrKind] = useState<'validation' | 'rate' | 'server' | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [preferred, setPreferred] = useState<'email' | 'linkedin'>('email');

  useEffect(() => {
    const q = search?.get('intent');
    if (q && (INTENT_KEYS as readonly string[]).includes(q)) setIntent(q);
  }, [search]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setStatus('sending');
    setErrKind(null);
    setFieldErrors({});
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          intent,
          name: fd.get('name'),
          email: fd.get('email'),
          org: fd.get('org'),
          website: fd.get('website'),
          role: fd.get('role'),
          message: fd.get('message'),
          preferred: fd.get('preferred'),
          preferredLink: fd.get('preferredLink'),
          consent: fd.get('consent') === 'on',
          company_site: fd.get('company_site'),
          locale,
        }),
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
        const fe: Record<string, string> = {};
        for (const [k, code] of Object.entries(data.errors)) {
          if (code === 'too_long') fe[k] = t.errors.tooLong;
          else if (code === 'invalid_email') fe[k] = t.errors.email;
          else if (code === 'invalid_url') fe[k] = t.errors.website;
          else if (k === 'name') fe[k] = t.errors.name;
          else if (k === 'message') fe[k] = t.errors.message;
          else if (k === 'consent') fe[k] = t.errors.consent;
          else fe[k] = t.errors.message;
        }
        setFieldErrors(fe);
        requestAnimationFrame(() => {
          const firstInvalid = document.querySelector<HTMLElement>('.lead-form [aria-invalid="true"]');
          firstInvalid?.focus();
        });
        setErrKind('validation');
      } else {
        setErrKind('server');
      }
      setStatus('error');
    } catch {
      setErrKind('server');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="lead-success" role="status" aria-live="polite">
        <h2 className="lead-success-title">{t.successTitle}</h2>
        <p className="lead-success-body">{t.successBody.replace('{id}', ref)}</p>
        <p className="lead-direct">
          {dict(locale).contact.directNote}
        </p>
      </div>
    );
  }

  return (
    <form className="lead-form" onSubmit={onSubmit} noValidate>
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
            <span className="lead-error" id="err-name" role="alert">{fieldErrors.name}</span>
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
            <span className="lead-error" id="err-email" role="alert">{fieldErrors.email}</span>
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
              <span className="lead-error" id="err-preferredLink" role="alert">{fieldErrors.preferredLink}</span>
            )}
          </label>
        </div>
      )}

      <details className="lead-more">
        <summary>{t.moreLabel}</summary>
        <div className="lead-row">
          <label className="lead-field">
            <span className="lead-label">{t.org}</span>
            <input name="org" type="text" maxLength={150} autoComplete="organization" />
          </label>
          <label className="lead-field">
            <span className="lead-label">{t.role}</span>
            <input name="role" type="text" maxLength={100} autoComplete="organization-title" />
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
            {fieldErrors.website && <span className="lead-error" id="err-website" role="alert">{fieldErrors.website}</span>}
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
          aria-describedby={fieldErrors.message ? 'err-message' : 'hint-message'}
        />
        <span className="lead-hint" id="hint-message">{t.messageHint}</span>
        {fieldErrors.message && (
          <span className="lead-error" id="err-message" role="alert">{fieldErrors.message}</span>
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
          <a href={`./privacy`} className="lead-privacy-link">
            {t.privacyLink}
          </a>
        </span>
      </label>
      {fieldErrors.consent && (
        <span className="lead-error" id="err-consent" role="alert">{fieldErrors.consent}</span>
      )}

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
