# Site-wide language and interface refinement — 2026-11-03

This release extends the approved solutions design direction across the public
site: ivory surfaces, evergreen actions, consistent cards, readable Persian
typography and clearer navigation. The separate executive shell is retained.

## Changes

- Corrected Persian typos and literal translations across the homepage, core
  dictionaries, leadership, laboratory, simulator, Explore and AI interfaces.
  Homepage messaging is shorter and the diagram itself is localized.
- Refined all 20 Persian article introductions, summaries, metadata and
  selected prose. Improved displayed headings while preserving published
  anchors. Source bibliographies, links and numerical facts are retained.
- Improved Persian knowledge data, book edition descriptions and license
  explanations. Original bibliographic and licensing metadata remains intact.
- Added normalized book/workflow search, results counts and empty-state reset;
  improved keyboard operation of architecture tabs and mobile article contents.
- Corrected localized navigation links, menu focus/current-page semantics and
  footer organization. Language switching retains route, query and fragment.
- Added contact-form validation/focus handling for visible and collapsed fields.
  Preserved entered data and prevented repeat submissions.
- Preserved chat drafts while busy or at quota; IME Enter no longer submits.
  Streaming, citations, source inspectors and scroll-controller internals are
  unchanged. The executive shell now loads the existing self-hosted fonts.
- Repaired mobile grids, inputs, table/link containment, nested main landmarks,
  journey graph contrast/containment, replay contrast and simulator labels.

## Verification and release boundary

167 tests passed. TypeScript passed. The optimized build generated all 223
static outputs. The homepage remains at approximately 138 kB first-load JS;
the localized diagram does not pull the full simulator dictionary into it.

The route inventory contains 293 HTML paths: 135 Persian, 135 English and 23
shared paths, including dynamic solution request pages. Browser scans covered
every route at 320px, with representative desktop inspection and checks of
search/reset, RTL keyboard tabs, mobile navigation and contact error handling.
The scan identified the remaining shared project-body minimum width and long
resume links; those containment fixes are included in this release.

At the owner's request, extended browser testing stopped before publication.
The last containment fixes did not receive another browser pass. Deployment
still requires a successful staged production build and activation health
checks. No production inquiries or AI questions were submitted during QA.

The SHA-pinned deployment helper preserves the existing environment, nginx,
systemd unit, runtime data and prior build, and writes activation evidence under
`/opt/quantiviq-releases/<SHA>/activation.json`.
