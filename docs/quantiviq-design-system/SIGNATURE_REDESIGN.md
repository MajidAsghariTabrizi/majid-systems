# Quantiviq — signature redesign

Design rationale and page-family audit · 9 November 2026

## Evidence and direction

This pass connects the existing content to a more recognizable identity. The identity audit reads the current EN/FA dictionaries, `principles.ts`, project records, homepage, shared layouts and prior design documentation. The benchmark samples six relevant first-party sites; it is not an exhaustive ranking of the world's best websites. Quantiviq's live `/en` and `/fa` pages were unavailable to the research web extractor, so observations about those pages here refer to repository source. Runtime and visual verification belong in the release evidence.

The recurring fingerprint in the source is an operator who connects product judgment, systems engineering and organizational change. Explicit uncertainty, inspectable evidence, bounded authority, measurable outcomes and honest negative results are substantive differentiators. They should shape the interface as well as the words. “An operator's fieldbook” is our interpretation of that evidence, not a new credential or business claim.

The resulting direction uses warm mineral paper, oxblood actions and copper annotations instead of a generic AI accent. The global tokens are `--canvas: #f5f1e9`, `--ink: #29242a`, `--brand: #542b3a` and `--copper: #ab5836`. English display passages use editorial serif typography; Persian uses the existing self-hosted Estedad composition. Shared spacing, quieter surfaces and restrained corner radii tie the commercial, reading and engineering pages together. State colors retain meaning: success and errors must remain distinguishable from decoration.

## Benchmark decisions

| First-party reference | Observed pattern | Quantiviq decision |
| --- | --- | --- |
| [Linear](https://linear.app/) | Contextual product demonstrations organized around actual workflow stages. | Make the opening diagram an inspectable interface, with clear local feedback and a route into the fuller simulation. Do not copy its product UI or dark identity. |
| [Stripe](https://stripe.com/) | Business-oriented solution grouping, concrete capability demonstrations and supporting stories. | Lead from a business problem into scope, inputs, deliverables and evaluation. Use only Quantiviq's supported evidence; borrow no scale or client claims. |
| [Pentagram — Design Doha Biennial](https://www.pentagram.com/work/design-doha-biennial) | Equal compositional presence for Arabic and English; a connecting-line system gives varied applications a shared identity. | Give Persian independent typographic rhythm and use the decision/evidence connection as a recurring visual motif. Do not reproduce the project's letterforms or palette. |
| [Instrument](https://www.instrument.com/) | Brief positioning leads quickly into recent work and a compact service structure. | Bring the work closer to the thesis. Vary editorial layouts instead of giving every section an identical card grid. |
| [Anthropic](https://www.anthropic.com/) | Publications connect announcements with model details and system cards. | Place claim status and supporting material close together. Reading and source inspection deserve a calm publication hierarchy. |
| [Tribal](https://www.gotribal.ai/) | Enterprise problems lead into context, approval flows and the application lifecycle. | Explain the organizational problem before the architecture. Keep Quantiviq's distinctive focus on who decides and how the result is assessed. |

## Implemented composition

The EN/FA homepage now follows: concise positioning and founder byline → interactive DecisionAtlas → three starting paths → selected solutions → evidence rows → compact operating model → method preview → founder perspective → specific next action. The duplicate problem taxonomy, full eight-layer index, extra preview and repeated services explanation have been removed from the homepage; the deeper destinations remain available.

`DecisionAtlas.tsx` is a conceptual model with five manually selected nodes: signal, knowledge, authority, action and learning. Selecting a real button updates a local explanatory panel. The model is explicitly labeled; it has no autoplay, live-data implication, invented metric or real-world action. The dedicated demonstration is one link away. It uses pressed-state buttons, associated details, polite announcements and a reduced-motion presentation.

`signature.css` provides the shared composition layer for localized and English engineering layouts. Existing component-specific geometry remains responsible for simulations and chat. Meet Majid retains its independent conversational shell, with coordinated mineral/oxblood tokens. PEYVAND remains an independently built and deployed experience rather than importing main-site CSS.

## Page-family audit inventory

This inventory identifies source coverage and the treatment applied; it does not mean every dynamic URL was separately inspected in a browser.

| Family | Representative routes | Treatment and boundary |
| --- | --- | --- |
| Entry and navigation | `/en`, `/fa`, shared header/footer | Shorter narrative, explicit visitor paths, founder identity and consistent action styling. Preserve the existing mobile dialog behavior. |
| Commercial | `/{locale}/solutions`, `/find`, `/[slug]`, `/[slug]/request`, `/services`, `/contact` | Harmonized surfaces, diagrams, section navigation and readable delivery/evaluation structure. Existing request handling and required-field contracts remain intact. |
| Approach and demonstrations | `/{locale}/system`, `/method`, `/explore`, `/lab`, `/mind/flows` | Shared visual tokens and clearer localized language. Preserve synthetic-data labels, controls and authority boundaries. |
| Evidence and identity | `/{locale}/proof`, `/about`, `/leadership` | Clearer evidence language and founder voice. Project status must follow canonical records; Phoenix's narrative is reconciled with its retired status. |
| Publications and library | `/{locale}/insights`, article/topic/author/methodology pages, books, enterprise AI stack | Shared reading typography, links, surfaces and filter treatment. Bibliographic and research boundaries remain visible. |
| Engineering archive | `/work`, case pages, `/profile`, `/journey`, `/engineering`, `/notes`, `/open-source`, `/resume` | Shared signature stylesheet and status/content consistency; retain the English-only nature of this archive. |
| Conversation and isolated experience | `/{locale}/mind`, `/meet-majid`, `/peyvand/` | Coordinate brand language without replacing conversation scrolling, source mechanics or the independent PEYVAND deployment boundary. |

No new customer outcome, endorsement, commercial metric or production capability follows from a visual redesign. Existing tests and the release build are recorded separately; this document is design rationale, not a claim that publication or every interaction has been verified.
