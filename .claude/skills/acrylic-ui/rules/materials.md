# Materials, Tokens & Surfaces (acrylic-specific)

This is the file that makes Acrylic *Acrylic*. None of it exists in stock shadcn/ui.
The rules derive from `registry/acrylic/acrylic.css` and the component docstrings —
follow them exactly.

## Contents

- Semantic `--acr-*` tokens only — never raw colors, never manual `dark:`
- The three theme blocks (light / `.dark` / `.acrylic`)
- Frosted glass material: `acr-frosted` + `bg-[var(--acr-surface)]` + `backdrop-blur`
- Cards are flat at rest — no border, no shadow; hover float lives on `::before`
- Nested surfaces: opt in with `nestedSurface` / `data-nested-surface`
- One `<Backdrop />` at the app root
- Tauri vibrancy (opt-in, inert on the web)

---

## Semantic `--acr-*` tokens only

Colors come from the theme token set, never from raw values and never from manual
`dark:` overrides. The token set is defined three times (light / `.dark` /
`.acrylic`); a component that references the token name flips for free when the
theme class on `<html>` changes. Writing a raw color or a `dark:` pair breaks that
and looks wrong under `.acrylic`.

The semantic tokens: `--acr-surface` / `--acr-surface-hover` (card/panel glass),
`--acr-panel` (floating overlay glass), `--acr-chip` / `--acr-chip-hover` (neutral
fills — Badge secondary, Button neutral/ghost hover), `--acr-field` /
`--acr-input` / `--acr-input-border` (form controls), `--acr-control` /
`--acr-control-hover` / `--acr-control-border` (segmented/stepper controls),
`--acr-border` / `--acr-border-soft` (hairlines), `--acr-card-nested` (recessed
nested fill), `--acr-overlay` (modal scrim), `--acr-solid` / `--acr-solid-fg`
(inverted solid), `--acr-toast`, `--acr-scrollbar` / `--acr-scrollbar-hover`.
Plus the standard shadcn semantic vars (`--primary`, `--foreground`,
`--muted-foreground`, `--destructive`, `--ring`, `--border`, `--background`) which
Acrylic components also use and which the **consuming app** owns (the `acrylic`
style item deliberately does NOT ship them, so installing a component inherits the
host's brand colors).

**Incorrect:**

```tsx
<div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl">Panel</div>
<span className="text-emerald-500">Online</span>
```

**Correct:**

```tsx
<Card>Panel</Card>                       {/* bg-[var(--acr-surface)] already */}
<Badge variant="secondary">Online</Badge>
```

If you need a raw surface tint, use the token: `bg-[var(--acr-card-nested)]`, not
`bg-black/5 dark:bg-white/5`.

---

## The three theme blocks

`acrylic.css` carries **three** mutually-exclusive appearances toggled by the class
on `<html>` — not the usual two:

- `:root` / `.light` → plain **Light** (opaque; `backdrop-blur` is a no-op)
- `.dark` → plain **Dark** (opaque; `backdrop-blur` is a no-op)
- `.acrylic` → **Acrylic** frosted (translucent material; `backdrop-blur` frosts the Backdrop)

Same token *names* in every block; only the *values* differ. In the two plain
themes the `--acr-*` material tokens hold **opaque** fallbacks, so a Card renders
as an ordinary solid surface and the blur does nothing. Under `.acrylic` the tokens
become translucent and the blur turns them to glass. **Never assume the app is in
one specific theme** — wire everything through the token names and it works in all
three. The theme switcher is 3-way (Light / Dark / Acrylic), not a light/dark toggle.

> [!WARNING]
> **Keep `:root, .light` selector on a single line in CSS files.**
> In consuming projects, ensure that the selector `:root, .light {` is written on a single line. Some CSS formatters (e.g. Prettier) split it into multiple lines (with a newline after the comma), which confuses the `shadcn` CLI parser. If formatters split it, `shadcn add` will fail to recognize the existing block, appending a duplicate `:root, .light` block at the end of the file that overrides other themes and breaks the dark/acrylic modes.

---

## Frosted glass = `acr-frosted` + `bg-[var(--acr-surface)]` + `backdrop-blur`

The glass material is exactly three utilities together. `acr-frosted` alone marks
the element's material intent; it is the surface token plus the blur that produce
the frost. Card, Sheet, Popover, Tooltip, Dialog panel, Sidebar, and `Item
variant="outline"` are all built from this trio.

```tsx
"acr-frosted bg-[var(--acr-surface)] backdrop-blur-xl"   // the glass recipe
```

Use `--acr-surface` for cards/panels and `--acr-panel` for floating overlays.

---

## Cards are flat at rest — hover float lives on `::before`

A Card has **no border, no shadow, no inner bevel** at rest — the material alone
reads as a surface. Do not add `border`, `shadow-*`, or a ring to a Card to make it
"pop"; that is not the language.

Interactivity (`Card interactive`, `Item variant="outline"` hover) adds a lift plus
a soft float shadow — and that shadow is painted on a `::before` backing layer
(an outset `box-shadow` behind the card), **never on the card itself**. Reason: the
surface is translucent, so a `box-shadow` or `filter: drop-shadow` painted on the
card bleeds *through* the glass as an internal smudge. An outset shadow on `::before`
(inset-0, `-z-10`) stays purely outside the box. If you ever need a custom floating
glass element, replicate the `::before` pattern — do not put the shadow on the
translucent element.

**Incorrect:**

```tsx
<Card className="border border-white/10 shadow-lg hover:shadow-xl">…</Card>
```

**Correct:**

```tsx
<Card interactive>…</Card>   {/* lift + ::before float, no rest border/shadow */}
```

---

## Nested surfaces: opt in explicitly

A blurred surface cannot usefully re-blur an already-blurred backdrop (no
high-frequency detail left to soften) — a second `backdrop-blur` over the glass
double-samples it and leaves a darkened seam. So a Card inside a Card must drop its
blur and become a flat translucent tint (`--acr-card-nested`) instead. That tint —
one step darker per nesting level — **is** the visible layer boundary, so no border
is needed between layers.

This does not happen automatically. The **container opts in**: `Card nestedSurface`
(or any element with `data-nested-surface="true"`). That triggers the CSS rule
`[data-nested-surface="true"] [data-slot="card"]` which repaints inner Cards to the
nested fill and zeroes their blur.

```tsx
<Card nestedSurface className="flex flex-col gap-2.5 p-3">
  <Card className="p-2.5">…</Card>   {/* auto-recessed: nested fill, no blur */}
</Card>
```

For a single recessed **row** (not a full Card), use `Item variant="muted"` — it is
the row-level `--acr-card-nested` fill. Do not hand-roll `bg-black/5`.

---

## One `<Backdrop />` at the app root

The Backdrop is the body-level wallpaper the frosted chrome blurs over. Mount
**exactly one** `<Backdrop />` near the app root. It paints only under `.acrylic` on
the web, nothing in plain light/dark, and nothing under Tauri vibrancy (the OS
material shows instead) — all governed by CSS, the component is dumb. Pass
`children` for a brand wallpaper instead of the built-in gradient. Frosted
components have nothing to frost without it.

---

## Tauri vibrancy is opt-in and inert on the web

The `html.vibrancy` rules only activate when a Tauri/Electron host adds the class
after applying native OS vibrancy to a transparent window. On a normal web page they
do nothing. When targeting Tauri, use the shipped `useModalAcrylicBody` hook
(bundled with Dialog / AlertDialog) so open modals repaint the body opaque enough to
frost — it is already wired into those components. Don't invent your own transparency
handling. Full guidance lives in the `/docs/tauri` page.

**The body-paint is DOM-driven, not counted.** `useModalAcrylicBody` /
`ModalAcrylicBody` decide `html.modal-acrylic` from a MutationObserver reading the
live DOM (is any `[role=dialog]` / `[role=alertdialog]` currently `[data-state=open]`?)
— NOT a module-level open-overlay counter. A counter desyncs under React StrictMode:
the mount→unmount→remount of a literal-`open` overlay (`<Dialog open>` inside a
conditionally-rendered wrapper) can drop the final cleanup and leave the class stuck
on, which flips `--background` to near-opaque and kills the native acrylic. If you
ever reimplement the paint, read the DOM — never mirror open-state in a hand-kept
counter.
