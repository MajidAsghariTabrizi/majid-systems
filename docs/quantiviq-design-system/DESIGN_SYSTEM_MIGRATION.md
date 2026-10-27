# QUANTIVIQ - GLOBAL DESIGN SYSTEM MIGRATION (Boardroom Ivory)

**Visual source of truth:** /meet-majid (unchanged, independent shell)
**Scope:** every public page, both locales. **No content or feature changes.**

## 1. The extracted global system (src/app/globals.css :root)

| Token | Value | Role |
|---|---|---|
| --bg | #f7f4ec | ivory paper |
| --bg-elevated | #efe9dc | deep ivory |
| --bg-card / hover | #fdfbf6 / #f9f5ea | card surfaces |
| --border / strong | #ddd4c2 / #c9bfa9 | hairlines |
| --fg | #1d1a16 | deep ink |
| --fg-muted / subtle | #4c463c / #665d4f | secondary text (AA) |
| --accent / strong | #1f5c45 / #174534 | restrained forest |
| --accent-warm | #7d6230 | brass, AA-safe as text AND line |
| --brass-ink | #6e5626 | text-safe brass |
| --danger | #8c3a2b | AA red on ivory |
| --code-bg/-fg/-border | ink / #efe9dc / #3a352c | terminal windows stay ink |

All component CSS keeps working through the same variable names - the system is the token layer, not copied CSS. ~300 hardcoded dark-era values migrated to tokens (white overlays to ink overlays, mint/blue/slate text to forest/ink, dark surfaces to card/ivory, scrims to ivory glass).

## 2. Deliberate exceptions (documented, not oversights)

- **.sim-frame simulator family**: keeps its scoped enterprise command-center palette (dark --sq-* panel, mint/blue signal colors). A dark instrument panel inside an ivory editorial page - functional semantics untouched; verified interactive (6/6 buttons, 0 errors). In-panel contrast bugs fixed: ivory-on-mint CTA 1.49:1 to ink-on-mint 6.8:1; idle step opacity 0.55 to 0.85.
- **Code blocks and chart terminals** (.brain-term, .lab-topo-canvas, .lab-replay-visual): ink --code-bg with light text - terminal windows.

## 3. Persian typography (Estedad Variable)

- Self-hosted /fonts/Estedad-Variable.woff2 (OFL), @font-face weight 100-900, font-display: swap; verified loaded and applied (document.fonts).
- html[lang='fa'] switches --font-sans/--font-display to Estedad; Latin stays Inter (both verified loaded). English typography unchanged.
- Persian body line-height 1.95 (was 1.6); article prose, ledes and AI chat bubbles included. letter-spacing: 0 enforced for Persian (mono labels switch to sans in FA). Mixed-direction values use unicode-bidi: plaintext.
- RTL verified on every page (dir=rtl, no mirrored breakage, 0 overflow).

## 4. Measured quality gates (before vs after)

| Gate | Before (dark) | After (ivory) |
|---|---|---|
| axe critical/serious (21 page combos) | 929 | 4 (all 4 pre-existing nested-interactive in SVG controls, identical in baseline) |
| Color-contrast violations | 267 | 0 |
| Custom WCAG audit (text bg/fg pairs, 23 combos) | - | 0 failures |
| Horizontal overflow (120 combos: 14 routes x 2 locales x 5 widths) | 153px worst (home/en/1024), many pages | 0 everywhere |
| Lighthouse desktop (home/en) | perf 99 / a11y 96 | perf 100 / a11y 100 |
| Test suite | 126 | 126/126 |
| /meet-majid regression | - | unchanged (own shell/CSS; exec acceptance re-run: streaming, cancel, citations 8, evidence 7, axe NONE) |
| Mind chat (real model) | - | EN + FA cited answers (5 sources each), default persona untouched |

Overflow fixes that were pre-existing legacy bugs, now repaired: tablet header wrap (max-width 1120px), mobile grid clamps (480px), lab panel scrolling, journey top bar wrap, chips wrapping.

## 5. Known limitations

- Vision-capable reviewer does not exist in this environment (verified: read_image rejected - model declares no image input). Visual sign-off is programmatic (contrast/axe/overflow/DOM/interaction) + 80 before/after screenshots committed for human review (captures-dst/).
- 4 pre-existing nested-interactive violations in lab/journey SVG controls left as-is: restructuring risks breaking the visualizations.
- /journey, /work, /profile fetch https://quantiviq.xyz/... - same-origin in production, CORS-blocked only in local preview (pre-existing).