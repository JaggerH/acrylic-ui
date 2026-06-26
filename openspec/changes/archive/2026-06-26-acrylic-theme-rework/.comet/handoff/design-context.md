# Comet Design Handoff

- Change: acrylic-theme-rework
- Phase: design
- Mode: compact
- Context hash: 3b1383ddc89b34fe1eb385443f8d252b2e7efd0f14a9a7fde5251c80bc47c743

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/acrylic-theme-rework/proposal.md

- Source: openspec/changes/acrylic-theme-rework/proposal.md
- Lines: 1-27
- SHA256: f5e33458306baa0aadb74d9e87a33cee9687f86d2853bb7afda653fcfe941fb1

```md
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
```

## openspec/changes/acrylic-theme-rework/design.md

- Source: openspec/changes/acrylic-theme-rework/design.md
- Lines: 1-52
- SHA256: 93ca7ea938be9ac83ec59c299044ce17897b78ee298079e16516b8b678541350

```md
## Context

acrylic-ui ships three appearances. Today `light`/`dark` live on `:root`/`.dark` and `acrylic` is a third `:root`-level class built as *light glass* (light frosted panels, dark text, flat `#ececec`). The sidebar was already reworked to a per-theme material; the "main panel" was never given a stable home and ended up implemented three ways (`SidebarInset` fill, `.acr-content` utility, a `#nd-page` rule). Components are already token-driven (`--acr-*`, `--foreground`, …), which is the lever this redesign uses.

## Goals / Non-Goals

**Goals:**
- `acrylic` is a dark-based theme: white foreground + dark frosted/translucent surfaces.
- Themes are **region-scoped**: `.light`/`.dark`/`.acrylic` work as class selectors on any element, so `sidebar.acrylic` can sit beside `main.{light|dark|acrylic}`.
- A single `Backdrop` body layer is the base; regions are glass (translucent, show it) or opaque (cover it). One control point; Tauri vibrancy = transparent backdrop → native material.
- No `content` concept — the main area is just a themed region.

**Non-Goals:**
- Redesigning individual component visuals beyond what the dark-glass token flip implies.
- Native (Tauri) wiring beyond keeping the `.vibrancy` transparency path intact; web is the focus.
- Changing light/dark appearances (only their selectors become class-scoped).

## Decisions

**D1 — Theme as region-applicable class, not `:root`-only.**
Define `.light`/`.dark`/`.acrylic` as plain class selectors that each set the full token block. CSS custom properties inherit by DOM scope, so a region's class re-scopes its subtree; components stay theme-agnostic and "just work" per region. next-themes keeps owning the *global* class on `html` (add `value` mapping so `light` emits `.light`); regions opt in by carrying their own class (e.g. `Sidebar` adds `.acrylic`). Alternative — keep `:root`-only + duplicate components per surface — rejected: defeats token reuse and can't compose.

**D2 — acrylic = dark token base + frosted surfaces (整体转深).**
acrylic reuses the dark foreground set (white text) and makes surfaces dark translucent. Rationale: frosted material is dark, so white text is the natural contrast (matches Apple). This flips the previous light-glass values across acrylic surfaces (cards/dialogs/popover/inputs included).

**D3 — `Backdrop` is the body-level base; regions decide opacity.**
`body[Backdrop] → sidebar | main`. Acrylic regions are translucent (`backdrop-blur` over the backdrop) + white text; light/dark regions are opaque and cover it. A page with no acrylic region → backdrop fully covered → no visual effect (resolves the "affects everything" worry). Tauri: `.vibrancy` makes the backdrop transparent so the OS material shows. Alternative — backdrop per-region — rejected: seams when two acrylic regions are adjacent; body-base gives one continuous material.

**D4 — Delete the `content` concept.**
Remove `--acr-content`, `.acr-content`, the `SidebarInset` content-frost, and the `#nd-page` rule. `SidebarInset` becomes a plain region that follows its theme class.

**Tree-shaking constraint (carry-over):** lightningcss prunes rules whose only declaration is a custom property referenced solely via `bg-[var(--x)]`. Region token overrides must therefore ride on real utility classes / token values, not orphan raw rules (the documented sidebar gotcha).

## Risks / Trade-offs

- **Breaking visual change** for acrylic consumers (light-glass → dark-glass) → mitigation: it's a deliberate major theme revision; document in the change + showcase.
- **Docs prose under acrylic** becomes white-on-dark over a backdrop (heavy for long-form docs) → mitigation: the docs main is a region; it can wear `.light`/`.dark` while the sidebar stays `.acrylic` (the composition this design enables). Decide showcase composition during build/verify.
- **Multiple `backdrop-filter` layers** (nested glass) cost paint → acceptable; already used by sidebar/cards.
- **next-themes controlled→region nesting** edge cases (SSR flash) → mitigation: region classes are static (e.g. `Sidebar` always `.acrylic`), SSR-safe; only the global class is dynamic.

## Migration Plan

1. Restructure theme scopes to class selectors; flip acrylic to dark tokens.
2. Promote `Backdrop` to body base + region glass/opaque rules.
3. Strip the `content` concept; make `SidebarInset` theme-following.
4. Wire showcase composition (sidebar `.acrylic` + main region class) and verify all three themes + the composed case.

Rollback: revert the CSS/token commits; components are unchanged structurally.

## Open Questions

- Final showcase composition for the docs (main = `.light` for readable prose, or `.acrylic` for the full effect) — resolve when verifying against real pages.
```

## openspec/changes/acrylic-theme-rework/tasks.md

- Source: openspec/changes/acrylic-theme-rework/tasks.md
- Lines: 1-29
- SHA256: 76fee5ac04ac485bb240ffa7f3d4c41134b16c679db16bad894931cb121ed9e4

```md
## 1. Region-scoped theme classes

- [ ] 1.1 Convert the theme token blocks in `app/global.css` and `registry/acrylic/acrylic.css` from `:root`/`.dark`/`.acrylic` to class selectors `.light`/`.dark`/`.acrylic` (add an explicit `.light` block; keep `:root` as the light default for no-JS), so a class re-scopes its subtree's tokens.
- [ ] 1.2 Configure next-themes `value` mapping in `app/layout.tsx` so the `light` theme emits the `.light` class; confirm global theme switching still works.

## 2. Acrylic → dark glass (整体转深)

- [ ] 2.1 Flip the `acrylic` token block to a dark base: white foreground (reuse the dark fg tokens) + dark translucent surfaces across `--acr-*` (panel/surface/card/control/input/border/hover/chip…), in both CSS files.
- [ ] 2.2 Confirm acrylic components (Card, Dialog, Popover, Input, Sidebar, Button/ButtonGroup) render as dark glass with white text — no light-glass remnants.

## 3. Backdrop as body base

- [ ] 3.1 Make `Backdrop` the body-level base layer; acrylic regions translucent (blur over it), `light`/`dark` regions opaque (cover it); `.vibrancy` → transparent backdrop (native material).
- [ ] 3.2 Mount `<Backdrop/>` once at the app root and rework the `.acrylic` base transparency around it (replace the experimental body-transparent approach).

## 4. Remove the content concept

- [ ] 4.1 Delete `--acr-content` (both CSS files), the `.acr-content` utility, the docs `#nd-page` frost rule, and the `SidebarInset` content-frost; `SidebarInset` becomes a plain theme-following region.

## 5. Composition wiring + showcase

- [ ] 5.1 `Sidebar` opts its subtree into `.acrylic`; the main region wears a theme class — verify `sidebar.acrylic` + `main.{light|dark|acrylic}` composes.
- [ ] 5.2 Wire the docs showcase composition (choose the docs `main` appearance for readable prose beside the acrylic sidebar) and the Tauri example.
- [ ] 5.3 Register `Backdrop` in `registry.json` as an installable primitive.

## 6. Verify

- [ ] 6.1 Gate: `pnpm types:check` + `pnpm registry:build` + `pnpm build` all pass.
- [ ] 6.2 Visual verify (screenshots): all three global themes, plus the composed case (acrylic sidebar + light/dark/acrylic main), web + the `.vibrancy` path.
```

## openspec/changes/acrylic-theme-rework/specs/acrylic-theme/spec.md

- Source: openspec/changes/acrylic-theme-rework/specs/acrylic-theme/spec.md
- Lines: 1-61
- SHA256: a69a8390eb79a6ece9752d730e742c15f5740b851e35b2ebb8d1ae7352440d71

```md
## ADDED Requirements

### Requirement: Region-scoped appearance classes

The theme system SHALL expose `light`, `dark`, and `acrylic` as class selectors that each define the full design-token block, and these classes SHALL be applicable to any element (not only `:root`). A region carrying a theme class SHALL re-scope the design tokens for its own subtree, so descendant components render in that region's appearance without per-component changes.

#### Scenario: Global theme on the document root
- **WHEN** the `html` element carries `light`, `dark`, or `acrylic`
- **THEN** the whole document resolves that theme's tokens, and components render in that appearance

#### Scenario: A region overrides the global theme
- **WHEN** an element inside the page carries a theme class different from the document root's
- **THEN** that element's subtree resolves the region's tokens, and the rest of the page is unaffected

#### Scenario: Composed sidebar + main
- **WHEN** the sidebar region carries `acrylic` and the main region carries `light`, `dark`, or `acrylic`
- **THEN** the sidebar renders as dark frosted glass and the main renders in its own appearance, independently and simultaneously

### Requirement: Acrylic is a dark-based frosted appearance

The `acrylic` appearance SHALL use the dark foreground token set (white-on-dark text) and dark, translucent/frosted surfaces. Frosted surfaces under `acrylic` (panels, cards, dialogs, popovers, inputs, sidebar) SHALL present white text by default.

#### Scenario: Text on an acrylic surface
- **WHEN** any text-bearing component renders inside an `acrylic` region
- **THEN** its foreground resolves to the white-on-dark token set, readable against the dark frosted surface

#### Scenario: Surface material under acrylic
- **WHEN** a frosted surface (e.g. Card, Dialog, Sidebar) renders inside an `acrylic` region
- **THEN** it presents as a dark translucent material, not a light one

### Requirement: Backdrop base layer with region opacity

The system SHALL provide a `Backdrop` primitive mounted once at the application root that renders a full-bleed base layer behind the app. Acrylic regions SHALL be translucent so the Backdrop shows through them; `light`/`dark` regions SHALL be opaque and cover it. When the host window has applied native vibrancy (a `vibrancy` marker on the root), the Backdrop SHALL be transparent so the native OS material shows instead.

#### Scenario: Acrylic region over the backdrop
- **WHEN** an `acrylic` region is painted above the mounted Backdrop on the web
- **THEN** the Backdrop is visible (blurred) through the region's translucent surface

#### Scenario: Opaque region hides the backdrop
- **WHEN** a `light` or `dark` region is painted above the Backdrop
- **THEN** the region is opaque and the Backdrop is not visible through it

#### Scenario: No acrylic region present
- **WHEN** a page mounts the Backdrop but contains no `acrylic` region
- **THEN** the Backdrop is fully covered by opaque regions and has no visible effect

#### Scenario: Native vibrancy host
- **WHEN** the root carries the `vibrancy` marker
- **THEN** the Backdrop is transparent and the native OS material shows through the acrylic regions

### Requirement: No standalone content concept

The main content area SHALL be an ordinary themed region — it MUST NOT require a dedicated content component, content material token, or content utility class. Removing the previous `content` mechanism (the `--acr-content` token, the `.acr-content` utility, the inset content-frost, and the docs `#nd-page` rule) SHALL NOT remove the ability to render a frosted main panel, because an `acrylic` region over the Backdrop already produces it.

#### Scenario: Frosted main panel without a content primitive
- **WHEN** the main region carries `acrylic` and sits over the mounted Backdrop
- **THEN** it renders as a dark frosted main panel using only the region's theme tokens, with no content-specific token, utility, or component

#### Scenario: Plain main panel
- **WHEN** the main region carries `light` or `dark`
- **THEN** it renders as an opaque content surface in that appearance, beside an `acrylic` sidebar if present
```

