## 1. Region-scoped theme classes

- [x] 1.1 Convert the theme token blocks in `app/global.css` and `registry/acrylic/acrylic.css` from `:root`/`.dark`/`.acrylic` to class selectors `.light`/`.dark`/`.acrylic` (add an explicit `.light` block; keep `:root` as the light default for no-JS), so a class re-scopes its subtree's tokens.
- [x] 1.2 Configure next-themes `value` mapping in `app/layout.tsx` so the `light` theme emits the `.light` class; confirm global theme switching still works.

## 2. Acrylic → dark glass (整体转深)

- [x] 2.1 Flip the `acrylic` token block to a dark base: white foreground (reuse the dark fg tokens) + dark translucent surfaces across `--acr-*` (panel/surface/card/control/input/border/hover/chip…), in both CSS files.
- [x] 2.2 Confirm acrylic components (Card, Dialog, Popover, Input, Sidebar, Button/ButtonGroup) render as dark glass with white text — no light-glass remnants.

## 3. Backdrop as body base

- [x] 3.1 Make `Backdrop` the body-level base layer; acrylic regions translucent (blur over it), `light`/`dark` regions opaque (cover it); `.vibrancy` → transparent backdrop (native material).
- [x] 3.2 Mount `<Backdrop/>` once at the app root and rework the `.acrylic` base transparency around it (replace the experimental body-transparent approach).

## 4. Remove the content concept

- [x] 4.1 Delete `--acr-content` (both CSS files), the `.acr-content` utility, the docs `#nd-page` frost rule, and the `SidebarInset` content-frost; `SidebarInset` becomes a plain theme-following region.

## 5. Composition wiring + showcase

- [x] 5.1 `Sidebar` opts its subtree into `.acrylic`; the main region wears a theme class — verify `sidebar.acrylic` + `main.{light|dark|acrylic}` composes. (Capability delivered via region classes — verified by DOM probe; sidebar is NOT force-`.acrylic` so light apps aren't pushed a backdrop.)
- [x] 5.2 Wire the docs showcase composition (choose the docs `main` appearance for readable prose beside the acrylic sidebar) and the Tauri example.
- [x] 5.3 Register `Backdrop` in `registry.json` as an installable primitive.

## 6. Verify

- [x] 6.1 Gate: `pnpm types:check` + `pnpm registry:build` + `pnpm build` all pass.
- [x] 6.2 Visual verify (screenshots): all three global themes, plus the composed case (acrylic sidebar + light/dark/acrylic main), web + the `.vibrancy` path.
