# 02 — DESIGN DIRECTION & UX SYSTEM
_Applied art direction: "Quiet Intelligence" (chosen in BENCHMARK_MATRIX.md from 8-site benchmark)._

## Direction

Dark quiet-intelligence system continuing the existing token set (`--bg:#0a0b0d`,
jade-teal `--accent:#7cd9b7` for system/information, amber `--accent-warm:#f0a868`
reserved for human-gate/status caveats). All new styles live in
`src/app/silver-bullet.css` — **zero edits to existing rules** except two 320px
wrap fixes; the legacy site is visually untouched.

## Component vocabulary added

- **Chips as filters** (books domains, flow domains, mind scopes): 44px min-height
  touch targets, `aria-pressed`, keyboard-focusable buttons — not divs.
- **Drawers** (OSS sources) and **accordion cards** (flows): native `<details>` or
  button+region with visible focus, cursor pointer, hover elevation — same pattern
  as the existing FAQ/disclosure components.
- **Contract tables** (flows dl, stack comparison table): sticky-header scroll
  container with `.table-scroll` for narrow viewports; definition lists in
  accessible list mode (screen-reader friendly, no JS needed).
- **Status honesty layer**: every "not deployed" / "catalog-only" / "synthetic"
  state is a visible amber badge or caption — the caveat is part of the design,
  not a footnote.
- **Covers**: hotlinked Open Library image with credit beneath; designed
  typographic fallback card (publisher / title / authors / ISBN / note) — no
  generated art anywhere.

## Accessibility

- Interactive elements: real buttons/anchors, 44px minimum, aria-pressed/aria-label.
- Flow atlas has a JS-free "accessible list mode" rendering all 12 contracts as
  ordered lists + definition lists.
- FA pages render RTL (`dir=rtl` verified in after-report for every /fa route).
- Color contrast follows the existing dark palette tokens (accent-on-bg ≥ AA).
- Model limitation: the agent cannot view rendered pixels (no image input), so
  visual verification was programmatic: DOM metrics, overflow deltas, console
  errors, functional clicks — captured in captures-sb/after-report.json.

## Screenshots (evidence)

- Before (baseline): captures-sb/before/ (108 pngs, 33 routes) + crawl-report.json
- Benchmark: captures-sb/benchmark/ (7/8 sites; McKinsey 403 bot-blocked)
- After: captures-sb/after/ (57 pngs; 14 routes × {320,390,768,1440} EN+FA + interaction shots)
