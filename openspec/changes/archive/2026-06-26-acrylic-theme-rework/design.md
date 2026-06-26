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
