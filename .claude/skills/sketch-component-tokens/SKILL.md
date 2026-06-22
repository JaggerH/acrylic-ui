---
name: sketch-component-tokens
description: Extract design tokens (sizes, variants, colors, radius, padding, typography, per-state styling) for a UI component directly from a Sketch (.sketch) UI kit — without Sketch installed — and shape them into a token matrix for building shadcn/ui wrappers. Use when the user wants to read a component's parameters out of a .sketch file, align a shadcn/ui component to a Sketch design (e.g. the Apple macOS 26 UI Kit), build or audit acrylic-ui registry components against the kit, or asks "extract the button/input/etc. from the sketch".
---

# Sketch Component Tokens

Read a component's full parameter set straight out of a `.sketch` UI kit and turn
it into a condensed `variant × size` token matrix that drives a shadcn/ui wrapper.

A `.sketch` file is a **ZIP of JSON** — no Sketch app needed. The scripts here
parse it directly. Before trusting any field, read `references/sketch-format.md`:
the Apple kit stores several things in non-obvious places (corner radius is the
big one — it is NOT in `cornerRadius`).

## Workflow

Run scripts with `conda run -n qlib python` (any Python 3 with stdlib works; no
third-party deps). `SK` = path to the `.sketch` file.

1. **Find the component's page.**
   ```bash
   python scripts/sketch_tokens.py pages "$SK" | grep -i button
   ```
   Page names carry an SF-Symbol glyph prefix (e.g. `􁸞 Buttons`); pass the plain
   trailing name (`Buttons`) — exact match wins over substring.

2. **Explore the taxonomy.** Discover how variants/sizes/states are encoded in
   the symbolMaster names before extracting.
   ```bash
   python scripts/sketch_tokens.py explore "$SK" Buttons
   ```
   Names decompose as `{Type}/{Area}/{Style}/{Size}/{State}`. Confirm the size
   tokens (`1 Mn`..`5 XL`) and state words, and read off the distinct values per
   segment position — these become the component's variant/size/state dimensions.

3. **Extract the universal raw dump.** One record per symbolMaster, every visual
   param fully resolved (frame, radius, padding, fills, borders, text), faithful
   and component-agnostic.
   ```bash
   python scripts/sketch_tokens.py extract "$SK" Buttons --out raw.json
   ```

4. **Shape into a condensed token matrix.** This step encodes the component's
   taxonomy (which segment is the variant, which is the size) and picks the
   canonical resting state. For Button, use the worked template:
   ```bash
   python scripts/shape_button.py raw.json --out ../../../tokens/button.json
   ```
   For a NEW component, copy `shape_button.py` and adjust `category()`,
   `size_of()`, and `is_resting()` to that component's taxonomy. The light→dark
   colour map in that script is **kit-general** (reuse as-is). See
   `references/button-example.md` for the fully worked Button case.

5. **Map to shadcn/ui and build the wrapper** (next phase — out of scope for the
   extraction itself). Read `references/button-example.md` for the proposed
   Apple-category → shadcn-variant mapping and the open design decisions
   (radius is a two-regime rule, not a single formula; colours are light-mode,
   dark is mapped).

## Key facts (full detail in references/sketch-format.md)

- **Corner radius** lives in `style.corners.radii` (an `MSImmutableStyleCorners`
  object), **not** `cornerRadius`/`fixedRadius`. Value `100` is a "fully rounded"
  sentinel → resolve to `height/2` (capsule/circle). The scripts already do this
  and expose both `radius` (resolved) and `radiusRaw`.
- **Backgrounds are fills on the symbolMaster** — these controls have no
  rectangle/shape layers. Fills can be multi-layer (blend modes) for the macOS
  material look.
- **Colours reference shared swatches** by `swatchID`; the scripts resolve them
  to swatch names via `document.json` → `sharedSwatches`.
- **State explosion**: each variant×size has many masters (Active/Inactive ×
  On/Off × Idle/Hover/Clicked/Disabled). `shape_button.py` picks the canonical
  resting state = `Active, Off, Idle` (window active, toggle off, not pressed).

## Output

`tokens/<component>.json` (at the acrylic-ui repo root) — condensed
`categories[variant][size]` with `height`, `radius`(+`radiusRaw`), `padding`,
`font`/`fontSize`, `fills_light`/`fills_dark`, `textColor_light`/`textColor_dark`,
plus a top-level `radiusBySize`. The raw dump (all masters, all states) is the
intermediate `raw.json`.

## Status

Extraction (steps 1–4) is complete and validated against the macOS 26 Buttons
page (785 masters → 8 categories × 5 sizes). The shadcn mapping + wrapper +
docs-page showcase (step 5) are not yet built.
