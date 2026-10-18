# I18N PLAN — EN/FA routing and contracts — 2026-10-18

Status: scaffold already in the v3 working tree (`src/middleware.ts`, `src/app/[locale]/layout.tsx`, `src/components/LocaleSwitcher.tsx`, `src/content/i18n/{en,index}.ts`); `fa.ts` and all `[locale]` pages pending.

## Routing
- Locale-prefixed routes under `src/app/[locale]/` (`/en/...`, `/fa/...`) for homepage, about, contact, and other narrative pages.
- Shared deep pages stay single-copy under `src/app/(shared)/` route group — `/journey`, `/profile`, `/work`, `/work/[slug]`, `/notes`, `/notes/[slug]`, `/engineering`, `/open-source`, `/resume` — served locale-agnostic inside the locale layout's chrome.

## Middleware rules (src/middleware.ts — implemented)
- `/` → **307** to `/en`, or `/fa` if the `qv_locale` cookie says so (query preserved). **No Accept-Language, no IP/geolocation detection** — the only inputs are the URL and the explicit cookie.
- `/en/...` and `/fa/...` → served; visiting an explicit locale URL sets `qv_locale` (1 year, SameSite=Lax).
- Legacy root pages → **308** permanent to their `/en` equivalents, query preserved: `/about`, `/contact`, `/services`, `/method`, `/system`, `/proof`, `/privacy` (e.g. `/contact?intent=diagnostic` → `/en/contact?intent=diagnostic`).
- Trailing slashes → 308 to canonical. Matcher skips `_next/*` and any path with a file extension.

## Dictionary contract
- Location: `src/content/i18n/en.ts` and `fa.ts`. `Dict = typeof en` — **EN is the source of truth type**; `fa.ts` must satisfy it (typed parity).
- A key-parity unit test asserts deep key equality between `en` and `fa` (fail the build on missing/extra keys).
- Access only via `dict(locale)` from `src/content/i18n/index.ts`; routes built with `localePath(locale, path)`.

## Locale switcher spec
- Segmented two-option control `EN | فارسی` in the header, visible on desktop and in the mobile menu; target areas ≥44×44px.
- Behavior: swaps the locale segment of the current path, preserving the rest of the path and query; sets `qv_locale`; on shared pages (no locale segment) navigates to the locale root of the *other* locale.

## RTL
- `<html dir="rtl" lang="fa">` set by `[locale]/layout.tsx`.
- All layout CSS uses logical properties (`margin-inline`, `padding-inline`, `inset-inline-start`, `text-align: start`) — never left/right.
- Latin tokens (code, identifiers, brand names, URLs) wrapped in LTR isolates (`unicode-bidi: isolate` + `direction: ltr`, or `<bdi>`) so they don't scramble the FA line.

## SEO
- Per-locale canonical (`/en` ↔ `/fa`), `hreflang` for `en`, `fa`, and `x-default → /en` (already in `[locale]/layout.tsx` metadata).
- `sitemap.ts` emits alternates per locale; JSON-LD on EN.

## FA font
- Vazirmatn (400–800) from Google Fonts, requested only when `locale === 'fa'`; fallback Tahoma. FA line-height slightly larger than EN (≈1.9) for readability.

## Known P1 gap (accepted)
- Simulator microcopy and the shared deep pages (`/journey`, `/work/*`, `/notes/*`, …) remain English-only. When a FA visitor lands on a shared page, a localized frame note explains: the deep content is available in English while the site chrome, navigation, and core offer pages are in Persian. Localization of deep content is a later wave decision.
