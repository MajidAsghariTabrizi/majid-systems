/**
 * Quantiviq first-party analytics wrapper (taxonomy v1, 2026-10-30).
 * Collection: same-origin Umami served from /_q/* on quantiviq.xyz.
 * Contract (docs/discoverability/05_TRACKING_CONTRACT.md):
 *  - allowlisted event names + properties ONLY; unknown names are dropped
 *  - never record prompt text, answers, emails, phones, tokens, cookies,
 *    IPs, full URLs with personal query data, or any free-form user input
 *  - strings are clamped; pageviews come from Umami auto-track (SPA-aware),
 *    custom events never duplicate a pageview
 */

export const TAXONOMY_VERSION = '1';

const SESSION_FLAG = (k: string) => 'qevt-' + TAXONOMY_VERSION + '-' + k;

/** once-per-session guard (sessionStorage) */
export function oncePerSession(key: string): boolean {
  if (typeof window === 'undefined' || !window.sessionStorage) return false;
  const k = SESSION_FLAG(key);
  try {
    if (window.sessionStorage.getItem(k)) return false;
    window.sessionStorage.setItem(k, '1');
    return true;
  } catch {
    return false;
  }
}

type Data = Record<string, boolean | number | string | undefined>;

const ALLOWED: Record<string, string[]> = {
  meet_majid_view: [],
  mind_session_start: ['surface'],
  mind_session_complete: ['surface'],
  insight_read: ['slug', 'locale'],
  contact_click: ['source'],
  contact_submit_success: ['intent', 'locale'],
  diagnostic_request: ['locale'],
  source_open: ['category', 'sid'],
  simulator_run: ['scenario', 'locale'],
};

function sanitize(v: unknown): string {
  return String(v ?? '')
    .replace(/[\u0000-\u001f]/g, ' ')
    .replace(/[@]/g, ' ') // strip address-like content
    .trim()
    .slice(0, 100);
}

/** Emit an allowlisted analytics event. Safe no-op before hydration, when
 *  blocked by an ad-blocker, or when the collector is unreachable. */
export function qEvent(name: keyof typeof ALLOWED | string, data?: Data): void {
  if (typeof window === 'undefined') return;
  const umami = (window as { umami?: { track?: (n: string, d?: Data) => void } }).umami;
  if (!umami?.track) return; // fail open: never break the app for analytics
  const allowedProps = ALLOWED[name];
  if (!allowedProps) return; // not in taxonomy
  const clean: Data = {};
  for (const k of allowedProps) {
    if (data && data[k] !== undefined) clean[k] = typeof data[k] === 'number' ? data[k] : sanitize(data[k]);
  }
  try {
    umami.track(name, clean);
  } catch {
    /* analytics must never throw into product code */
  }
}