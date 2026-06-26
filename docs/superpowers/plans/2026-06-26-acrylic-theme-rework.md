---
change: acrylic-theme-rework
design-doc: docs/superpowers/specs/2026-06-26-acrylic-theme-rework-design.md
base-ref: 479370802d2a5ab374e775ba95e3295d57fb7d8d
archived-with: 2026-06-26-acrylic-theme-rework
---

# Implementation plan — acrylic theme rework

Executes `tasks.md` against the approved design. The working tree carries an
earlier "试一试" experiment (body-global Backdrop + `--acr-content` content concept);
this plan converges it to the region-scoped model. Sequential, one commit per group.

## Group 1 — Region-scoped theme classes
- `global.css` + `acrylic.css`: token blocks become `.light` / `.dark` / `.acrylic`
  class selectors (keep `:root` aliased to light for no-JS); add explicit `.light`.
- `app/layout.tsx`: next-themes `value={{light:'light',dark:'dark',acrylic:'acrylic'}}`.
- Verify: global theme switch still flips `html` class + tokens.

## Group 2 — Acrylic → dark glass
- Flip `.acrylic` block to dark base: white foreground (dark fg set), dark translucent
  surfaces across `--acr-*`. Audit Card/Dialog/Popover/Input/Sidebar/Button(Group).
- Verify (screenshot): acrylic surfaces dark + white text, no light-glass remnants.

## Group 3 — Backdrop as body base
- Keep `backdrop.tsx`; visibility via real rules (`display`, not orphan custom-prop):
  hidden in plain, shown under `.acrylic`, hidden under `.acrylic.vibrancy`.
- Region opacity: acrylic regions translucent (blur over backdrop); light/dark opaque.
- Replace experimental global `.acrylic body { background: transparent }` with the
  region model. Keep `<Backdrop/>` mounted at app root.

## Group 4 — Remove content concept
- Delete `--acr-content` (both files), `.acr-content` utility, `.acrylic #nd-page` rule,
  `SidebarInset` content-frost → plain theme-following region.

## Group 5 — Composition + showcase
- `Sidebar` adds `.acrylic` to its subtree; main region wears a theme class.
- Docs `main` (`#nd-page`) appearance pick (light for prose) beside acrylic sidebar.
- Register `Backdrop` in `registry.json`.

## Group 6 — Verify
- Gate: `pnpm types:check` + `pnpm registry:build` + `pnpm build`.
- Screenshots: 3 global themes + composed (acrylic sidebar + main.{light|dark|acrylic}) + `.vibrancy`.
