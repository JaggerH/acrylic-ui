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

5. **Map to shadcn/ui and build the wrapper.** Collapse the kit's categories to a
   clean variant set (the kit often conflates *fill emphasis* × *tone* into one
   "category" axis — separate them), then write the component as a standalone CVA
   that follows shadcn's shape (`cva` + `VariantProps` + Radix `Slot` +
   `data-slot`/`data-variant`/`data-size`), wiring **colours to the theme CSS
   variables** (`acrylic.css` already carries the kit's light/dark values, so
   colours flip for free) and **geometry to the extracted values**
   (height/radius/padding/font). Target `registry/acrylic/<component>.tsx`.
   Read `references/button-example.md` for the fully worked mapping.

6. **Add a showcase + docs page** — displaying the component is part of the job.
   The docs site (fumadocs) renders live examples via `<ComponentPreview
   name="..." />`:
   - Write `components/examples/<name>.tsx` (default-export a React component).
     Add both a small usage demo and a **full variant × size matrix** showcase.
   - Run `node scripts/gen-examples.mjs` to regenerate `components/examples-map.ts`
     (auto-generated index — never hand-edit it).
   - Reference the examples in `content/docs/components/<component>.mdx`
     (`<ComponentPreview name="<name>" />`), and keep the variant/size tables in
     that page in sync with the actual CVA.
   - Update the component's `registry.json` description.

7. **Verify + view.** `pnpm types:check` (tsc) and `pnpm registry:build` must both
   pass. Then restart the dev app (`pnpm dev`, Next.js) to view the page.

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

**Button and Input are fully done end-to-end** (steps 1–7), both validated against
the kit and shipped to `registry/acrylic/` with showcases in the docs;
`types:check` + `registry:build` pass.
- Button — 785 masters → 8 categories collapsed to 5 variants × 5 sizes + `icon`.
  Shaper: `scripts/shape_button.py`. Worked example: `references/button-example.md`.
- Input — 60 masters → Text Field, 5 sizes (no variant axis), uniform radius
  4/5/6/7/9, accent focus ring. Shaper: `scripts/shape_input.py`.
- Alert — 7 masters → composite (no variant×size). Panel radius 26 + frosted
  material, backdrop black 23%, buttons are 28px = Button `large`. `alert-dialog.tsx`
  now styles Action/Cancel via `buttonVariants({size:"large"})` (Action→default,
  Cancel→neutral). Shaper: `scripts/shape_alert.py`.
- Combobox — 40 masters → composite = Text Field instance (== Input) + a trailing
  chevron Menu Button. Assembled `combobox.tsx` from Input (trigger via
  `inputVariants`, 5 sizes) + new `popover.tsx` (Radix) + `command.tsx` (cmdk).
  Shaper: `scripts/shape_combobox.py`. Note: a composite can require NEW primitives
  (here Popover + Command, with deps @radix-ui/react-popover + cmdk) before it can
  be assembled — check the registry for them first.
- Dialog — page is a full screen scene; the panel is a nested group
  (`Save Dialog - Collapsed`), so `shape_dialog.py` re-reads the .sketch to reach it
  (the universal `extract` only sees the top-level frame). Panel: radius 20, 20px
  padding, opaque-white sheet (we keep the frosted acrylic panel instead). **No X/
  close button in the kit** — dismissed via actions; action buttons are 24px =
  Button `medium` (vs Alert's large). `dialog.tsx` now: close = ghost-icon Button
  (not auto-focused on open, matching macOS), `showCloseButton` prop. Shaper:
  `scripts/shape_dialog.py`.

Each new component gets its own `shape_<component>.py` (copy the nearest existing
one and adjust the taxonomy parsing + resting-state pick). Composite components
(like Alert) reuse already-built atomic components (Button) rather than a
variant×size matrix. Other components (Search Field, Combo Box, Toggle, …) still
need steps 1–7.
