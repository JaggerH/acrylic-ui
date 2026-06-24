# Tauri Vibrancy Playground — Design

**Date:** 2026-06-25
**Status:** Approved (design), pending implementation

## Goal

acrylic-ui's frosted components (Dialog, AlertDialog, Sidebar, Card, …) depend on a
**transparent vibrancy window** to look right — a context the Next.js docs site
cannot reproduce. We need an in-repo, reusable Tauri app that renders the real
registry components against **native OS acrylic/vibrancy**, runnable on Windows, so
we can visually verify every component before consumers (e.g. snapick) adopt them.

Secondary: this doubles as the canonical "how to use acrylic-ui in Tauri" reference
that the `content/docs/tauri.mdx` guide points to.

## Why this is needed (the gotcha)

CSS `backdrop-filter` only blurs pixels the **web page** paints. Under a transparent
vibrancy window the body is `transparent` (the OS acrylic is DWM/compositor-rendered
*outside* the webview), so an overlay's blur is a no-op — text stays sharp, only the
tint shows. The fix is a per-state toggle: while any Dialog/AlertDialog is open the
shipped `useModalAcrylicBody` hook adds `html.modal-acrylic`; a CSS rule then paints
the body opaque so the blur has real pixels, reverting to transparent on close.

acrylic-ui currently ships the **hook** but not the **CSS rule** that responds to it
— an orphaned class. This design fixes that upstream.

## Approach

Standalone Vite + React + TS app at `examples/tauri/`, registered as a pnpm workspace
package, that imports the **real** `registry/acrylic/*` components via a path alias
(single source of truth — no copies). Its own `src-tauri/` Rust shell applies native
vibrancy, mirroring snapick's proven WSL→Windows (`x86_64-pc-windows-gnu`) setup
including its mingw cdylib workarounds.

Rejected: (B) point Tauri at the Next.js docs dev server — SSR, not a vibrancy app,
body can't be cleanly transparent. (C) copy components into the playground —
duplication/drift.

## Structure

```
examples/tauri/
  package.json          # vite, react, @tauri-apps/api+cli; name: "tauri-playground"
  vite.config.ts        # @tailwindcss/vite; alias "@" -> repo root (resolve registry/, lib/)
  index.html
  src/
    main.tsx            # mount; invoke('window_translucent') -> add html.vibrancy if active
    App.tsx             # gallery: overlay / structural / base sections + light/dark toggle
    index.css           # @import tailwindcss; @source registry; @import acrylic.css;
                        #   (vibrancy body-paint now comes from acrylic.css upstream)
  src-tauri/
    Cargo.toml          # tauri 2 + window-vibrancy 0.7 + windows-sys; mingw cdylib workaround
    tauri.conf.json     # window transparent:true, decorations; devUrl = vite port
    build.rs
    src/main.rs
    src/lib.rs          # detect_and_apply_translucency + window_translucent command
```

- `pnpm-workspace.yaml` gains `packages: ["examples/*"]`.
- Tailwind v4 `@source` scans `registry/acrylic` so component classes are emitted.
- Alias `@` → acrylic-ui root so `@/registry/acrylic/*` and `@/lib/utils` resolve; the
  components' relative `./button` imports resolve within the registry dir.

## Vibrancy plumbing (lifted from snapick, the proven impl)

1. **tauri.conf.json**: main window `"transparent": true`.
2. **Rust `lib.rs`** `detect_and_apply_translucency(app) -> bool`:
   - macOS → `apply_vibrancy(NSVisualEffectMaterial::HudWindow)`
   - Windows → `apply_acrylic`, gated on the "Transparency effects" registry flag,
     plus an always-active WM_NCACTIVATE subclass so DWM keeps blurring when unfocused
   - Linux/other → opaque fallback (returns false)
   Exposed to JS via a `window_translucent` command returning the bool.
3. **main.tsx**: `invoke('window_translucent').then(a => a && documentElement.classList.add('vibrancy'))`.
4. **CSS** (shipped upstream in `registry/acrylic/acrylic.css`):
   ```css
   html.vibrancy { --background: transparent; }
   html.vibrancy.modal-acrylic { --background: rgba(24, 24, 27, 0.92); }
   html.vibrancy, html.vibrancy body, html.vibrancy #root { background: var(--background); }
   html.vibrancy body { transition: background-color 0.18s ease; }
   ```
   Inert on a normal opaque web page (no `.vibrancy` class is ever added there).
5. The shipped `useModalAcrylicBody` hook already toggles `.modal-acrylic`.

## Gallery scope (App.tsx)

Minimal triggers per component — a verification harness, not a polished showcase:
- **Overlay:** Dialog, AlertDialog, Sheet, Popover, ContextMenu, Select
- **Structural:** Sidebar layout, Card (incl. nested frosted), Sonner toast
- **Base:** Button (variants), Input, Switch, Badge, Slider, …
- A light/dark toggle (the vibrancy material + tokens differ per theme).

## Build / run

`pnpm --filter tauri-playground tauri dev --target x86_64-pc-windows-gnu` → launches
the Windows window with native acrylic. First Rust build is slow (one-time); frontend
hot-reloads after. The user verifies visually on Windows.

## Deliverables

1. `examples/tauri/` app (above).
2. `pnpm-workspace.yaml` workspace registration.
3. Upstream fix: vibrancy body-paint CSS added to `registry/acrylic/acrylic.css`.
4. `content/docs/tauri.mdx` guide (+ root `content/docs/meta.json` entry) documenting
   the integration recipe and pointing to `examples/tauri/`.

## Out of scope

- Full migration of snapick to acrylic-ui (separate, later).
- Unit tests for the harness (it *is* the visual test).
- Automated screenshotting — the user verifies on Windows directly.
