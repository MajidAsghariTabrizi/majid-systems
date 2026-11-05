# Mobile navigation and guided discovery — 2026-11-05

The mobile menu opened inside the sticky, backdrop-filtered header. Its fixed
sheet inherited the header's containing block: at 390×844, the link area was
only 48.8px high with 1,277px of content. This made the menu appear broken.

The menu now renders through a body portal as a native modal dialog. It fills
the dynamic viewport, keeps its close control visible and scrolls its link
area independently. Native modal behavior keeps the background inert; Escape,
focus return, route dismissal and switching to the desktop breakpoint release
the scroll lock. Two prominent shortcuts lead to solution discovery and Mind.

The same EN/FA navigation component serves the localized site and shared
builder pages. No dependency was added.

## Clearer first steps

- The homepage leads to finding a relevant solution or trying the existing
  simulation. A keyboard-accessible, RTL-aware guide offers workflow,
  demonstration and evidence paths with concrete next links.
- The catalog shows a visible search label, result count, clear-filter action
  and recoverable empty state. Solution cards give workflow details visual
  priority before requesting a conversation.
- The finder starts with the visitor's priority, reveals relevant questions,
  shows answer progress and takes focus to the resulting suggestions. It
  preserves deterministic matching and the existing analytics/privacy contract.
- Request pages explain the next step and link back to the solution. The form,
  validation, lead persistence and delivery contract are unchanged.
- The footer groups links by visitor intent. About and Leadership provide
  useful localized next steps and explicitly mark English-only destinations.
- Automatic AI invitation bubbles no longer cover reading or controls on
  mobile. The launcher remains available outside the existing conversion-route
  exclusions.

## Focused validation

- TypeScript: passed.
- Existing unit suite: 167 passed, zero failures.
- Reproduced the production defect and inspected the repaired menu at390×844:
  844px modal, 772px independently scrolling body, background lock and focus
  return verified. The modal exposes only its own controls while open.
- Header geometry checked at320,390,768,1024 and1440px in Persian, plus English
  at1024px: no header control escaped the viewport.
- Keyboard opening of desktop dropdowns, Persian homepage guide selection,
  menu-to-finder navigation, progressive choices and three matching suggestions
  were exercised in the browser.

Release uses the existing SHA-pinned prepare/activate helper with a staged
production build and rollback. Environment, nginx, service configuration,
lead data and the separate Mind service are outside this change.

This is a shared-navigation and main-journey review, not a claim that every
article, screen-reader/browser combination or possible user journey was
exhaustively tested. Live lead forms are not submitted during verification.
