/**
 * Lead validation — shared by the API route (server truth) and unit tests.
 * No dependencies. Every check returns a stable error code the client maps
 * to a localized message.
 */

export const LEAD_INTENTS = ['hiring', 'diagnostic', 'rebuild-function', 'infrastructure', 'partnership', 'solution_request', 'other'] as const;
export type LeadIntent = (typeof LEAD_INTENTS)[number];

export const LEAD_MAX = {
  name: 100,
  email: 254,
  org: 150,
  website: 300,
  role: 100,
  message: 5000,
  preferredLink: 300,
  phone: 30,
  solution: 80,
  source: 100,
} as const;

export type LeadInput = {
  intent: string;
  name: string;
  email: string;
  org?: string;
  website?: string;
  role?: string;
  message: string;
  preferred: string;
  preferredLink?: string;
  consent: boolean;
  company_site?: string; // honeypot — must be empty
  /** Commercial layer: requested catalog solution id + attribution. */
  solution?: string;
  phone?: string;
  source?: string;
};

export type LeadErrors = Partial<Record<
  'intent' | 'name' | 'email' | 'org' | 'website' | 'role' | 'message' | 'preferred' | 'preferredLink' | 'consent' | 'phone' | 'solution' | 'source',
  string
>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const URL_RE = /^https?:\/\/[^\s]+\.[^\s]{2,}$/i;

function clean(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

export function validateLead(raw: unknown): { ok: true; value: LeadInput } | { ok: false; errors: LeadErrors } {
  const b = (raw ?? {}) as Record<string, unknown>;
  const errors: LeadErrors = {};

  const intent = clean(b.intent);
  if (!(LEAD_INTENTS as readonly string[]).includes(intent)) errors.intent = 'invalid_intent';

  const name = clean(b.name);
  if (!name || name.length < 2) errors.name = 'required';
  else if (name.length > LEAD_MAX.name) errors.name = 'too_long';

  const email = clean(b.email);
  if (!email) errors.email = 'required';
  else if (email.length > LEAD_MAX.email || !EMAIL_RE.test(email)) errors.email = 'invalid_email';

  const org = clean(b.org);
  // solution_request keeps the owner field contract: company REQUIRED. Legacy
  // contact intents preserve their historical optionality (regression-safe).
  if (intent === 'solution_request' && !org) errors.org = 'required';
  else if (org.length > LEAD_MAX.org) errors.org = 'too_long';

  const website = clean(b.website);
  if (website && (website.length > LEAD_MAX.website || !URL_RE.test(website))) errors.website = 'invalid_url';

  const role = clean(b.role);
  if (role.length > LEAD_MAX.role) errors.role = 'too_long';

  const message = clean(b.message);
  // Solution requests keep the need description OPTIONAL (owner decision 2026-11-02):
  // the selected solution itself carries the context. All other intents keep
  // the >=10 char message requirement (regression-safe for the legacy form).
  const isSolutionRequest = intent === 'solution_request';
  if (!isSolutionRequest && (!message || message.length < 10)) errors.message = 'required';
  else if (message.length > LEAD_MAX.message) errors.message = 'too_long';
  if (isSolutionRequest && message && message.length < 3) errors.message = 'too_short';

  const preferred = clean(b.preferred) || 'email';
  if (preferred !== 'email' && preferred !== 'linkedin') errors.preferred = 'invalid';

  const preferredLink = clean(b.preferredLink);
  if (preferredLink && (preferredLink.length > LEAD_MAX.preferredLink || !URL_RE.test(preferredLink)))
    errors.preferredLink = 'invalid_url';

  if (b.consent !== true) errors.consent = 'required';

  // Commercial layer fields (all bounded; digits normalized).
  // Persian/Arabic-Indian digits are LEGITIMATE phone input — normalize to
  // ASCII before validating so «۰۹۱۲…» passes like "0912…".
  const DIGIT_MAP: Record<string, string> = {
    '\u06f0': '0', '\u06f1': '1', '\u06f2': '2', '\u06f3': '3', '\u06f4': '4',
    '\u06f5': '5', '\u06f6': '6', '\u06f7': '7', '\u06f8': '8', '\u06f9': '9',
    '\u0660': '0', '\u0661': '1', '\u0662': '2', '\u0663': '3', '\u0664': '4',
    '\u0665': '5', '\u0666': '6', '\u0667': '7', '\u0668': '8', '\u0669': '9',
  };
  const normalizeDigits = (s: string) => s.replace(/[\u06f0-\u06f9\u0660-\u0669]/g, (d) => DIGIT_MAP[d] ?? d);
  const PHONE_RE = /^[+0-9\s()-]{4,30}$/;
  const phoneRaw = clean(b.phone);
  const phone = normalizeDigits(phoneRaw);
  if (phone && !PHONE_RE.test(phone)) errors.phone = 'invalid_phone';

  const solution = clean(b.solution);
  if (solution && !/^[a-z0-9-]{2,80}$/.test(solution)) errors.solution = 'invalid';
  // solution_request without a solution is a contract violation (locked
  // selection is the whole point of the solution request form).
  if (intent === 'solution_request' && !solution) errors.solution = 'required';

  // Attribution is OPTIONAL METADATA: unknown/odd URL params must never block
  // an otherwise valid inquiry. Anything failing the safe charset falls back
  // to 'unattributed' at the route level — validation stays lenient here.

  const source = clean(b.source).slice(0, LEAD_MAX.source);
  const normalizedSource = /^[a-z0-9_.:-]{2,100}$/i.test(source) ? source : '';

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: { intent, name, email, org, website, role, message, preferred, preferredLink, consent: true, ...(phone && { phone: normalizeDigits(phoneRaw) }), ...(solution && { solution }), ...(normalizedSource && { source: normalizedSource }) },
  };
}

/** Hash the IP for rate limiting without storing raw addresses. */
export function ipHash(ip: string): string {
  // FNV-1a 32-bit — enough to bucket identical IPs without storing them.
  let h = 0x811c9dc5;
  for (let i = 0; i < ip.length; i++) {
    h ^= ip.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}
