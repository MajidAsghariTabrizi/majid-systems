# Solutions editorial refresh — 2026-11-03

The solutions catalog now introduces the operating problems, explains how to
choose an offering, and shows a conceptual information → review → output flow.
All 40 Persian entries have been edited for natural business language. Their
IDs, routes, related-article relations and 8 detailed / 32 scoping statuses stay
the same.

Every detail page now has an illustrated hero, section navigation, a practical
scenario, prerequisites, proposed deliverables, evaluation measures, an explicit
scope boundary and FAQs. Each scenario and domain profile is specific to the
solution. The new supplemental content is bilingual. Examples are clearly
illustrative; discovery-only offerings are still labelled and remain noindex.

The layout uses the existing ivory, evergreen and Estedad design system. It adds
original inline SVG graphics for the six categories, aligned cards, a desktop
request summary, and mobile layouts with consistent gutters. The assistant
remains available but its automatic invitation is suppressed in the solutions
section so it does not obscure the content. Request/finder suppression remains.

## Validation

- `npm test`: 141 passed, 0 failed.
- `tsc --noEmit --incremental false`: passed.
- `npm run build`: passed; all 223 generated routes completed. Existing hook
  lint warnings outside the visual changes remain non-blocking.
- Browser inspection: catalog and detail at desktop, 390px and 320px; real
  Persian search (`پیش فاکتور`) and Finance category filter; FAQ expansion;
  request labels and layout; English detail metadata and layout; Persian
  homepage carousel movement after the shared card changes.
- All 40 Persian detail routes at 320px: one H1, five content sections, at least
  three FAQs, accessible hero graphic, and document width no greater than the
  viewport content width. Representative screenshots were visually inspected.
- No production lead submissions or notification sends were performed.

## Release

`scripts/deploy-focused-release.py` prepares an exact Git SHA independently of
the live `.next` directory and activates it with a retained previous build and
health checks. It preserves the existing production environment, nginx/unit
configuration, request data, and server lockfile modification. The deployment
record is written under `/opt/quantiviq-releases/<SHA>/activation.json`.
