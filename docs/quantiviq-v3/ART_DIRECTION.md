# ART DIRECTION — premium editorial sci-fi / precision engineering — 2026-10-18

## Core idea
A dark graphite canvas that behaves like precision instrumentation: quiet surfaces, exact borders, one luminous signal color. The site should feel like a well-machined control panel crossed with a serious journal — never a startup template, never a game UI.

## Color
- **Canvas:** graphite darks from the existing token set — `--bg #0a0b0d`, `--bg-elevated #111317`, `--bg-card #14171c` (globals.css `:root`). Keep the canvas near-neutral; depth comes from surface steps, not gradients.
- **Luminous system accent:** existing mint `--accent #7cd9b7` (with `--accent-strong #4dc59a` for interaction states). Mint marks *system, evidence, ok-state, live signal*. `--accent-warm #f0a868` is reserved for *human* emphasis (names, voice, judgment) — used rarely.
- **Rationale:** continuity with the v2 identity (visitors from the portfolio recognize it) and differentiation from the cyan/purple AI cliché — mint reads organic-alive rather than neon-tech.

## Typography
- **EN:** Inter (400/500/600/700/800) for text and display; JetBrains Mono (400/500/600) for data, code, labels, measurements, and system voice. Mono is not decoration — it marks machine-produced content.
- **FA:** Vazirmatn (400–800), fallback Tahoma. Loaded per-locale (see I18N_PLAN.md).
- **Type scale (modular, ratio ~1.25):** 14 / 16 / 20 / 25 / 31 / 39 / 49 / 61px. Body 16px/1.7; long-form measure ≤ 68ch. Display sizes tighten tracking (−1 to −2%); mono labels set small with +4–6% tracking and uppercase.
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128px. Section rhythm on multiples of 24.

## Surfaces, borders, radius
- Surfaces are flat cards from the token steps (`--bg-card` → `--bg-card-hover` on interaction), existing `--radius: 10px` / `--radius-lg: 14px` only. No radii larger than 14px, no pill chrome except controls.
- Borders carry the structure: hairline `--border` (7% white) for grouping, `--border-strong` (14%) for interactive edges. An element lights its border toward accent on focus/hover instead of adding shadow.
- Shadows minimal (`--shadow` token only); elevation is communicated by surface step + border, not blur.

## Motion
- **Meaningful only**, in three registers: **flow** (signal moves through the system — the diagram "operates"), **state** (elements show what changed: selection, expansion, send), **authority** (section entrances that make hierarchy legible).
- Intersection-driven: animate on enter via `Reveal`, never on a global timer.
- All motion honors `prefers-reduced-motion` — reduced-motion gets instant states, no parallax, no autoplaying flow.
- Durations 150–400ms; ease-out for entrances, ease-in-out for state. No bounce, no springs, no scroll-jacking.

## Signature visual — the signal journey
The recurring motif: a signal (mint) traveling through a dark system — chart → nervous system → working loop. It appears as the homepage simulator (company-as-chart becoming company-as-system), the OS diagram layers, and small inline glyphs. Everything else stays quiet so the signal reads.

## What to avoid
- Robot/android imagery and any human-robot handshake cliché.
- Glassmorphism excess — no frosted blur stacks; surfaces are matte.
- WebGL / 3D scenes — cost on the 1GB-VPS-served page and the precision register doesn't need it.
- Cyan/purple gradient "AI glow", decorative particles, stock tech photos.
