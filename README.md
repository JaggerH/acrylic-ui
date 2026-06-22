# Acrylic

A private [shadcn/ui](https://ui.shadcn.com) **registry** for a dark frosted-glass
(acrylic) component set — shared across projects via the shadcn CLI.

> Acrylic = semi-opaque + blur + tint. The pre-"Liquid Glass" Apple vibrancy /
> Microsoft Fluent material. Not the 2025 Liquid Glass language.

## Items

| Item | Type | Installs to | What it is |
|------|------|-------------|------------|
| `glass-card` | component | `components/acrylic/glass-card.tsx` | `GlassCard` — translucent charcoal pane, flat at rest, soft float + lift on hover (`interactive`). |
| `dialog` | ui | `components/acrylic/dialog.tsx` | Acrylic Dialog — Radix Dialog with a 72px blur+saturate overlay and a translucent panel. |

Both land under `components/acrylic/` (not `components/ui/`), so they sit **alongside**
the stock shadcn components instead of overwriting them. The Acrylic Dialog uses
`@radix-ui/react-dialog` directly, so it never clobbers your `@shadcn/dialog`.

## Develop locally

```bash
pnpm install
pnpm build        # shadcn build → public/r/*.json
pnpm serve        # serve public on :4000  → http://localhost:4000/r/glass-card.json
# or both:
pnpm dev
```

Editing a component → re-run `pnpm build` (or `pnpm dev`), then re-pull in the
consuming project (see below). The registry is pull/copy, not a live link.

## Use it from another project

In the consuming project's `components.json`, register the `@acrylic` namespace
(point at the local server during dev, or a GitHub raw / hosted URL once pushed):

```jsonc
{
  "registries": {
    // local dev:
    "@acrylic": "http://localhost:4000/r/{name}.json"
    // released (commit public/r/ and remove it from .gitignore):
    // "@acrylic": "https://raw.githubusercontent.com/jaggerh/acrylic-ui/main/public/r/{name}.json"
  }
}
```

Then add / update items:

```bash
npx shadcn@latest add @acrylic/glass-card
npx shadcn@latest add @acrylic/dialog

npx shadcn@latest add @acrylic/glass-card --diff       # preview upstream vs your local copy
npx shadcn@latest add @acrylic/glass-card --overwrite  # pull latest
```

`--diff` is the key: it shows what changed upstream so you can merge while keeping
any per-app tweaks, instead of a blind overwrite.

## Coexists with `@shadcn`, no pollution

- **Namespace** keeps addressing separate: `@shadcn/button` vs `@acrylic/dialog`.
- **`target`** keeps files separate: everything lands in `components/acrylic/`.
- The Acrylic Dialog depends on radix directly (not `@shadcn/dialog`), so the stock
  dialog is never overwritten — you get both.

## Tauri / transparent-window apps (optional)

The components need **no global CSS** on a normal web page. But on a desktop app
with a *transparent vibrancy window* (Tauri/Electron), a child `backdrop-filter`
has no painted pixels to frost. The Dialog already toggles `html.modal-acrylic`
while open; pair it with these rules (also in `registry/acrylic/acrylic.css`) in
your app's global stylesheet:

```css
html.vibrancy { --background: transparent; }
html.vibrancy.modal-acrylic { --background: rgba(24, 24, 27, 0.92); }
html, body, #root { background: var(--background); }
```

(Your app adds `html.vibrancy` when it detects the window got a translucent backdrop.)
On a plain web app none of this is needed — the body is already opaque.
