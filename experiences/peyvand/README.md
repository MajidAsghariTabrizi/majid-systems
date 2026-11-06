# پیوند — طرح تعاملی شبکه فرصت

Independent Persian RTL investment concept. Final target:
`https://quantiviq.xyz/peyvand/` (the owner changed the initial subdomain brief).
No main Quantiviq route, layout, stylesheet, navigation, sitemap or analytics
module is imported or edited. All fictional matching, consent controls and
pilot calculations run locally in the browser; no introduction or message is sent.

## Run

This project uses the repository's existing React18/Next14/TypeScript toolchain;
no package installation or main dependency change is required.

```powershell
cd experiences/peyvand
npm run dev
# http://localhost:3002/peyvand/
npm run typecheck
npm test
npm run build
```

The independent static export is `out/`, with assets prefixed `/peyvand/`.
The export and build cache are ignored by Git. The Persian Estedad font is
self-hosted; its SIL license and authors are included with the font.

## Structure

- `lib/content.ts`: Persian presentation and investment hypotheses.
- `lib/model.ts`: shared entities, six graph layers, three fictional scenarios
  and deterministic evidence-aware route matching.
- `lib/simulation-state.ts`: explicit discovery/consent/evidence lifecycle gates.
- `lib/pilot.ts`: a bounded illustrative funnel; all ratios are stated assumptions.
- `components/EconomicNetwork.tsx`: SVG relationships and semantic entity buttons,
  with readable mobile alternatives and reduced motion.
- `components/OpportunitySimulator.tsx`: scenario discovery, inspection, route
  selection and local consent-based simulated progression.
- `components/PeyvandExperience.tsx`: six-chapter single-page narrative.
- `components/ExecutiveSummary.tsx`: native dialog, focus return and isolated
  light-background printing through the browser.
- `app/peyvand.css`, component styles: independent plum-black, copper and ivory
  palette, with no main-site CSS dependency.

## Evidence boundaries

No real people are scored, no customers or partnerships are claimed, and no
market size, investment amount or commercial performance is fabricated.
The recipient is named only as a potential strategic investor in the summary.
Proposed capabilities, hypothetical scenarios, pilot assumptions and actual
validation remain distinct. The opportunity network is a product vision;
it is not connected to a live matching model or business network.

## Validation

Production static build and standalone TypeScript passed. Twelve regressions
cover graph identity, evidence filters, discovery visibility, Persian model copy,
consent/evidence gates, lifecycle boundaries and funnel conservation. Browser
checks exercised all three scenarios through outcomes, conditional-route blocking,
reset, six layers, role permissions, zero-acceptance funnel behavior, native
summary modality and print-only-summary styling. Mobile content scanning found
no English visible copy, ASCII digit labels, external links or horizontal overflow
at390px. The print test verified the main experience and controls hide while the
summary becomes a white, unconstrained printable document.

Noindex/nofollow metadata, robots disallow and response headers discourage
indexing. This is an unlisted proposal, not authenticated private hosting.
See [deployment and rollback](DEPLOYMENT.md).
