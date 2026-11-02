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
  // Commercial layer (taxonomy v2) — slug/category/locale/source labels ONLY;
  // never free-text needs, names, emails or phones (PRD §13).
  solutions_view: ['locale', 'source'],
  solution_view: ['solution', 'locale'],
  solution_finder_start: ['locale'],
  solution_finder_complete: ['locale', 'outcome', 'bottleneck', 'type'],
  solution_request_start: ['solution', 'locale'],
  solution_request_success: ['solution', 'locale'],
  solution_request_failure: ['solution', 'locale', 'reason'],
  solution_related_insight_click: ['solution', 'locale'],
};

function sanitize(v: unknown): string {
  return String(v ?? '')
    .replace(/[\u0000-\u001f]/g, ' ')
    .replace(/[@]/g, ' ') // strip address-like content
    .trim()
    .slice(0, 100);
}

/** Emit an allowlisted analytics event. Safe no-op before hydration, when
 *  blocked by an ad-blocker, or when the collector is unreachable.
 *
 *  Collector readiness (closure 2026-11-02): early-mount events used to be
 *  silently dropped when the Umami script had not loaded yet. They are now
 *  queued (sanitized, deduped, bounded, expiring) and flushed as soon as the
 *  collector appears; if it never appears, the queue is dropped — the app
 *  stays fully usable without analytics. */
type Queued = { name: string; data: Data; at: number };
const QUEUE: Queued[] = [];
const QUEUE_MAX = 20;
const QUEUE_TTL_MS = 15_000;
let flushTimer: ReturnType<typeof setInterval> | null = null;

function umamiTrack(name?: string, data?: Data): boolean {
  if (typeof window === 'undefined') return false;
  const umami = (window as { umami?: { track?: (n: string, d?: Data) => void } }).umami;
  if (!umami?.track) return false;
  const track = umami.track.bind(umami);
  // flush what queued while the collector was unavailable (drop expired)
  const now = Date.now();
  while (QUEUE.length > 0) {
    const q = QUEUE.shift()!;
    if (now - q.at <= QUEUE_TTL_MS) track(q.name, q.data);
  }
  if (flushTimer) { clearInterval(flushTimer); flushTimer = null; }
  if (name) track(name, data);
  return true;
}

function enqueue(name: string, data: Data): void {
  if (QUEUE.length >= QUEUE_MAX) QUEUE.shift(); // bounded — never a leak
  QUEUE.push({ name, data, at: Date.now() });
  if (!flushTimer) {
    flushTimer = setInterval(() => {
      if (umamiTrack()) return; // flush succeeded; timer cleared inside
      if (QUEUE.length === 0 || Date.now() - QUEUE[QUEUE.length - 1].at > QUEUE_TTL_MS) {
        if (flushTimer) { clearInterval(flushTimer); flushTimer = null; }
      }
    }, 800);
  }
}

export function qEvent(name: keyof typeof ALLOWED | string, data?: Data): void {
  if (typeof window === 'undefined') return;
  const allowedProps = ALLOWED[name];
  if (!allowedProps) return; // not in taxonomy
  const clean: Data = {};
  for (const k of allowedProps) {
    if (data && data[k] !== undefined) clean[k] = typeof data[k] === 'number' ? data[k] : sanitize(data[k]);
  }
  try {
    if (!umamiTrack(name, clean)) enqueue(name, clean); // collector not ready → bounded queue
  } catch {
    /* analytics must never throw into product code */
  }
}