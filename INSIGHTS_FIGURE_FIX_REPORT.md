# Quantiviq Insights — English Figure Layout Regression: Root Cause & Fix

**Mission:** https://quantiviq.xyz/en/insights/ai-adoption-is-not-ai-transformation — "English article images appear clipped, misaligned, or overlapping their containers. Persian version looks correct."
**Status: FIXED, DEPLOYED, LIVE-VERIFIED (122/122 element checks + pixel evidence, production).**
**Commits:** `87ccca0` (EN fixes + baseline), `4cfe90b` (FA anchor fix + QA suite + evidence), `bff14e2` (screenshots) → deployed via authorized workflow.

---

## ROOT CAUSE (three distinct defects, all verified by measurement)

### 1. EN 01 + EN 12 — blank lines inside `<figure>` split the markdown HTML block *(the reported symptom, already live in production)*

A blank line inside `<figure>…</figure>` terminates the CommonMark HTML block; the following 4-space-indented SVG lines render as a `<pre><code>` block. Result on the live EN page: partial raw SVG + an 855px-wide code block overflowing the article + `</svg>`/`<figcaption>`/`</figure>` rendered as loose, unstyled HTML **outside** the figure card — i.e. clipped, misaligned, overlapping content. The Persian edition was authored without internal blank lines, which is why "Persian looks correct."

**Evidence (before):** figure card rendered 784×**1652** px with ink touching the left edge (`captures-figqa/before/crop-en-ai-adoption-is-not.png`; pixel analysis: `edgeTouch=True, gap L0`). **Fix:** blank-line removal only (commit `d3e9dca`, content otherwise byte-identical; recorded in `docs/INSIGHTS_FA_BASELINE.json` changelog). **After:** 784×534 px, clean margins (L22 R41).

### 2. EN 07 + EN 09 — authored geometry overflowing the SVG viewBox *(live until this deploy)*

- **EN 07** (The Real Cost of Enterprise AI Agents): legend label `integration / other` at `x="686"` with default anchor ran to x≈796 — **36 px past the 760-unit viewBox**, clipped at the SVG edge (`figcheck: fig0-content-clipped(1)`).
- **EN 09** (The AI-Native Product Operating Model): loop circle at `cy="308" r="34"` bottomed at y=342 — **12 px past the 330-unit viewBox**, visibly cut.

**Fix:** EN 07 legend block shifted left (swatches 668→656, labels 686→674) and the long label wrapped to two lines; EN 09 viewBox extended `330→344` (zero element movement). Mirrored onto FA 07/09 (Persian labels are wider: FA 07 legend at swatch 644 / label 662). Recorded in the baseline changelog.

### 3. FA figures (9 articles) — `direction: rtl` flips `text-anchor` semantics

Inline SVG inherits `direction: rtl` from `html[dir=rtl]`, which reverses anchor semantics: `start` = *right* edge at x, `end` = *left* edge at x. The Persian figures were authored with LTR anchor semantics (mirroring EN geometry), so **101 `<text>` elements across 9 FA figures anchored from the wrong edge** — labels mispositioned inside the diagram and clipped at the viewBox (FA 06's figure had most of its ledger text rendered outside the canvas: only 3% ink coverage).

**Fix:** anchors re-authored to match RTL rendering (`end`↔start swapped, `middle` untouched; `scripts/insights-fa-anchor-fix.mjs`). Persian bidi paragraph order is untouched — direction stays rtl — so Persian+Latin mixed labels keep correct reading order. Verified in isolation before applying: FA 01 went from 8 out-of-bounds texts to 0, every label landing at its authored position.

*Why the earlier QA missed it:* containment/aspect checks passed (text still occupies *a* box), and an earlier ad-hoc probe had an uppercase-only tagName regex that silently matched nothing on inline SVG. The new suite (below) uses CSS selectors and per-element viewBox math — it caught all of the above.

---

## VERIFICATION

### New permanent regression suite — `npm run qa:figures` (`scripts/insights-figcheck.mjs`)

Element-level checks (not page-level overflow) for **both editions × 3 viewports (390/768/1440) × 20 articles = 122 checks**: hero contained + aspect; figure SVG contained in card + rendered ratio vs viewBox ratio; figcaption contained + no SVG overlap; **every drawn SVG element inside the viewBox (transform-aware, viewBox-unit math)**; SVG-source-as-code detection; loose `</svg>`/figcaption detection.

- Before fixes: **30 failures** (2 EN articles + 8 FA articles).
- Local after fixes: **122/122 PASS**.
- **Production after deploy: 122/122 PASS** (`captures-figqa/figcheck-prod.txt`).

### Full gates (no regression)

`insights-parity` 20/20 PASS · `insights-validate` ALL PASS (20+20, 4/pillar) · `tsc --noEmit` clean · `npm test` 103/103 · `next build` 107/107 · `insights-check` 470/470.

### Pixel evidence — production before vs production after (`captures-figqa/`, `scripts/figqa-pixels.ps1`)

| Figure | Before (live) | After (live) |
|--------|--------------|--------------|
| EN 01 card (code-block bug, vs pre-fix build) | 784×1652, ink at left edge | 784×534, clean margins |
| EN 07 legend | label clipped +36px at viewBox (DOM) | fits; right gap 21→25px |
| EN 09 circle | clipped 12px at bottom; card 416px | full circle; card 430px |
| FA 01 labels | 5.9% ink (labels off-canvas) | 6.6% ink |
| FA 04 labels | 4.9% ink | 6.0% ink, labels at authored x |
| FA 06 ledger | **3.0% ink** (ledger text invisible) | **7.7% ink** (text restored) |

### Production verification (fresh browser screenshots)

- Full-page EN+FA at 390/768/1024/1440: `captures-figqa/prod-after/` (8 files)
- Fixed-figure crops EN 07/09 + FA 01/04/06: `captures-figqa/prod-after/crop-*.png`
- Before crops from live production (pre-deploy): `captures-figqa/before/prod-fig*.png`
- Live HTML markers confirmed: FA 01 `text-anchor="end" x="24"` present · EN 09 `viewBox="0 0 760 344"` · EN 07 legend `x="674"`.

---

## PERSIAN EXPERIENCE — UNCHANGED WHERE IT MATTERS, FIXED WHERE IT WAS BROKEN

Content, structure, prose, bidi reading order, RTL page chrome: untouched. The only FA changes are the 101 anchor attributes (labels now render at the positions they were authored to occupy) and the FA 07/09 geometry mirrors of the EN fixes. All 20 FA articles pass the same 122-check suite; parity 20/20.

## REMAINING ISSUES

None known. The QA layer that missed this class of defect (outer-box containment only) is superseded by `insights-figcheck.mjs`, wired as `npm run qa:figures`.
