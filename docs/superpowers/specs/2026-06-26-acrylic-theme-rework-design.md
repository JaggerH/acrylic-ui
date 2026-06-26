---
status: approved
comet_change: acrylic-theme-rework
role: technical-design
canonical_spec: openspec
change: acrylic-theme-rework
openspec-design: openspec/changes/acrylic-theme-rework/design.md
date: 2026-06-26
---

# Acrylic theme rework — technical design

Implementation-facing RFC. Motivation + requirements live in the OpenSpec change
(`proposal.md`, `design.md`, `specs/acrylic-theme/spec.md`); this doc pins the
concrete CSS/token/component mechanics. Brainstorm completed and approved — no
re-exploration.

## 1. Theme as region-scoped classes

Today the token blocks live on `:root` (light), `.dark`, `.acrylic`. Restructure
so every appearance is a **class selector** that can sit on any element:

```css
:root, .light { /* light token block */ }
.dark        { /* dark  token block */ }
.acrylic     { /* acrylic token block (now dark-based) */ }
```

- Keep `:root` aliased to the light block so a no-JS document is still light.
- Add an explicit `.light` so a region can opt *back* to light under a dark/acrylic root.
- `@theme inline` mapping (`--color-*: var(--*)`) is global — unchanged.
- Components already read tokens, so a region's class re-scopes its subtree for free.

next-themes: add `value={{ light: 'light', dark: 'dark', acrylic: 'acrylic' }}` so the
global `light` choice emits `.light` (not the empty default), keeping global + region
on the same selector vocabulary.

**Composition:** the global class rides on `html` (next-themes). `Sidebar` puts
`.acrylic` on its own subtree (static class → SSR-safe). Main is whatever region
class the app sets. Result: `sidebar.acrylic` + `main.{light|dark|acrylic}`.

## 2. Acrylic → dark glass (整体转深)

Flip the `.acrylic` token block from light-glass to dark-based:

- Foreground: reuse the dark set — `--foreground: #ededed`-ish, `--muted-foreground`
  white-alpha. (The sidebar already does white-on-dark; acrylic now matches globally.)
- Surfaces become dark translucent (indicative, tune on screenshot):
  `--acr-surface/panel ≈ rgba(28,28,31,0.55)`, cards a step denser, `--acr-control`
  dark translucent, `--acr-border/-hover/-chip` white-alpha, `--acr-input` white-alpha
  (the over-glass values we already validated).
- Audit each acrylic surface (Card, Dialog, Popover, Input, Sidebar, Button/ButtonGroup)
  for light-glass remnants; verify white text reads.

## 3. Backdrop as body base

`Backdrop` (already created) stays a `fixed inset-0 -z-10` full-bleed layer, mounted
once at the app root. Visibility/opacity by theme via real rules (NOT orphan
custom-property rules — lightningcss prunes those; the documented sidebar gotcha):

```css
[data-slot="backdrop"]            { display: none; }   /* plain themes: nothing */
.acrylic [data-slot="backdrop"]   { display: block; }  /* web acrylic: wallpaper */
.acrylic.vibrancy [data-slot="backdrop"] { display: none; } /* native material */
```

Regions decide opacity: acrylic regions are translucent (their surfaces blur over the
backdrop); `.light`/`.dark` regions are opaque and cover it. So the backdrop only
shows where an acrylic region sits above it; a page with no acrylic region → fully
covered → no effect (kills the "affects everything" worry without per-region backdrops).

Replace the experimental global `.acrylic body { background: transparent }` with the
region model: the base under an acrylic region must be transparent enough for the
backdrop to show, but opaque regions self-cover, so a blanket body-transparent is no
longer the mechanism — acrylic regions being translucent is.

## 4. Remove the content concept

Delete, in both CSS files + components:
- `--acr-content`, the `.acr-content` utility, the `.acrylic #nd-page` rule.
- `SidebarInset`'s `bg-[var(--acr-content)] backdrop-blur-2xl` → revert to a plain
  theme-following region (`bg-[var(--background)]` / transparent so its region class
  decides), no content material.

## 5. Showcase composition

- `Sidebar` adds `.acrylic` to its subtree.
- Docs `main` (Fumadocs `#nd-page`): wear `.light` (or `.dark`) for readable long-form
  prose beside the acrylic sidebar — the composition this design buys. Final pick
  during verify against real pages.
- Tauri example: `SidebarInset` region class; keep `.vibrancy` path.
- Register `Backdrop` in `registry.json`.

## 6. Verification

- Gate: `pnpm types:check` + `pnpm registry:build` + `pnpm build`.
- Screenshots: 3 global themes; composed `acrylic sidebar + main.{light|dark|acrylic}`;
  the `.vibrancy` (transparent-backdrop) path.

## Risks (carry-over from OpenSpec design)

Breaking visual change (light→dark glass); docs prose readability (mitigated by
region composition — docs main can stay light); multiple blur layers (acceptable);
SSR flash (region classes static).

## Implementation Divergence (recorded at verify)

- **Sidebar is NOT force-`.acrylic`.** Design §1 said `Sidebar` would put `.acrylic`
  on its own subtree. In build I left the sidebar following the global theme instead:
  forcing it would push the (display-gated) Backdrop onto a plain *light* app's sidebar.
  The region-class *mechanism* still delivers composition (verified by DOM probe: a
  `.light`/`.dark` region under `html.acrylic` re-scopes independently) — composition
  is opt-in by the consumer, not forced.
- **Fumadocs token bridge added.** Not in the original design: under `.acrylic`,
  `app/global.css` points Fumadocs' own `--color-fd-*` tokens at the acrylic dark-glass
  palette so docs prose/chrome read white-on-dark (our `--foreground` doesn't reach
  Fumadocs-painted text). Docs-app wiring only; not part of the registry theme.
- **`#nd-page` rule re-added via `--background`** (not the removed `--acr-content`):
  the docs main follows the theme background like any region — theme wiring, consistent
  with "no content material/token".
