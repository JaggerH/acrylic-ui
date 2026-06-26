## Why

The `acrylic` theme was built as a *light glass* appearance pinned to `:root`/`html` (dark text, light frosted panels, flat `#ececec` base), and the "main panel" leaked in as a half-formed `content` concept implemented three different ways at once (a `SidebarInset` fill, an `.acr-content` utility, and a one-off `#nd-page` CSS rule). This doesn't match the macOS dark-vibrant mental model, forces white-on-light readability problems, and cannot compose per region (e.g. a frosted sidebar beside a plain-light content pane).

## What Changes

- **BREAKING** — `acrylic` becomes a **dark-based** theme: white foreground (reusing the dark token set) + dark frosted / translucent surfaces, replacing the previous light-glass values.
- **BREAKING** — Theme tokens move from `:root`-only to **region-applicable class selectors** (`.light` / `.dark` / `.acrylic`). Any region can wear any theme; a region's class re-scopes its subtree's tokens. This enables composition: `sidebar.acrylic` + `main.{light|dark|acrylic}`.
- A **`Backdrop`** primitive becomes the body-level base layer. Acrylic regions are translucent (show the backdrop + white text); light/dark regions are opaque (cover it). Under Tauri vibrancy the backdrop is transparent so the native OS material shows.
- **Remove the `content` concept**: delete `--acr-content`, the `.acr-content` utility, the `SidebarInset` content-frost, and the docs `#nd-page` rule. The main area is just a region wearing a theme class — no dedicated component or material.

## Capabilities

### New Capabilities
- `acrylic-theme`: the theming system — the three region-scoped appearance classes (light/dark/acrylic), their token contracts, the dark-glass acrylic material, the `Backdrop` base layer, and the per-region composition rules.

### Modified Capabilities
<!-- none: no existing spec describes the theme system -->

## Impact

- `app/global.css`, `registry/acrylic/acrylic.css` — theme scopes restructured to class selectors; acrylic flipped to dark glass; `--acr-content` removed; `.acr-content` removed; `#nd-page` rule removed; `.acrylic body` transparency reworked around the backdrop.
- `registry/acrylic/backdrop.tsx` — promoted to the body-level base primitive; visibility/transparency rules.
- `registry/acrylic/sidebar.tsx` — `SidebarInset` content-frost removed (becomes a plain theme-following region); `Sidebar` opts its subtree into `.acrylic`.
- `app/layout.tsx` — `Backdrop` mount; next-themes `value` mapping to the `.light` class.
- Docs showcase (`components/docs-*`, MDX) — composition wiring so the docs read correctly under the new model.
- Consumers: theme switch + any acrylic surface change appearance (breaking visual change).
