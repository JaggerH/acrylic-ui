# Component Divergences from stock shadcn/ui

Where an acrylic component's API differs from its shadcn counterpart, the acrylic
API wins. Everything not listed here is 1:1 — apply your shadcn knowledge directly.
Sources of truth: the component docstrings in `registry/acrylic/*.tsx`.

## Contents

- Button: macOS variant / size / icon axes
- Icons in Button: no `data-icon`, no sizing classes
- Badge: `size="sm"` for compact pills
- Item: three variants (default / outline / muted)
- Shell family for app scaffolding
- ButtonGroup is the segmented control
- Overlay choice table (acrylic inventory)

---

## Button: macOS variant / size / icon axes

Modeled on the Apple macOS 26 UI Kit Buttons page. Three **orthogonal** axes:

- `variant`: `default` (solid accent) · `secondary` (10% accent tint) ·
  `destructive` (25% red tint) · `neutral` (gray chip fill) · `ghost` (borderless,
  hover reveals chip fill) · `link` (borderless accent text).
  **There is no `outline` variant** — the closest is `neutral`.
- `size`: `mini`/`small`/`medium`/`large`/`xl` (heights 16/20/24/28/36; macOS
  control sizes). **There is no `sm`/`lg`/`default` vocabulary** — using shadcn size
  names silently falls back to the default.
- `icon`: a **boolean shape prop**, orthogonal to size and variant. It turns any
  size×variant into the kit's round Arrow Button (square, full-circle radius,
  glyph scaled). **There is no `size="icon"`.**

**Incorrect (shadcn vocabulary):**

```tsx
<Button variant="outline" size="sm">Cancel</Button>
<Button size="icon"><XIcon /></Button>
```

**Correct (acrylic vocabulary):**

```tsx
<Button variant="neutral" size="small">Cancel</Button>
<Button icon size="small" variant="ghost" aria-label="Close"><XIcon /></Button>
```

Hover is a brightness/fill shift, not a color swap — do not add hover color
overrides; they break on glass.

---

## Icons in Button: no `data-icon`, no sizing classes

Stock shadcn buttons need `data-icon="inline-start"` on the icon. Acrylic buttons do
**not**: icon↔label spacing is the built-in `gap-1` (one SF Pro space), and glyph
size is set per size axis (`[&_svg]:size-*`). The `data-icon` attribute on an
acrylic Button is set by the component itself to mark the round-icon SHAPE — putting
it on a child icon does nothing.

**Incorrect:**

```tsx
<Button><SearchIcon data-icon="inline-start" className="size-4" />Search</Button>
```

**Correct:**

```tsx
<Button><SearchIcon />Search</Button>
```

---

## Badge: `size="sm"` for compact pills

`size="sm"` keeps font-size and `leading-none` glued together in one place. A
`text-[11px]` className override strips the base `leading-none` (tailwind-merge
drops the earlier line-height), the badge inherits a tall prose line-height and
balloons into an oval.

**Incorrect:**

```tsx
<Badge variant="secondary" className="text-[11px] px-1.5">3</Badge>
```

**Correct:**

```tsx
<Badge variant="secondary" size="sm">3</Badge>
```

---

## Item: three variants

| variant | Material | Use for |
|---|---|---|
| `default` | transparent | rows on an already-visible surface |
| `outline` | glass (`acr-frosted` + `--acr-surface`) | a raised row that IS a surface |
| `muted` | `--acr-card-nested` flat fill | a recessed row inside a surface |

`outline` Items are the same material as Card — inside a container that declared
`data-nested-surface="true"` they auto-recess to the nested fill exactly like
nested Cards (see [materials.md](./materials.md)). On a plain light panel an
undeclared outline Item is white-on-white; declare the surface, don't switch the
row to `muted` as a workaround and don't hand-roll `bg-black/5`.

Anatomy is shadcn's: `Item` in `ItemGroup`, with `ItemMedia`/`ItemContent`/
`ItemTitle`/`ItemDescription`/`ItemActions`/`ItemHeader`/`ItemFooter`/`ItemMeta`,
sizes `default`/`sm`/`xs`.

---

## Shell family for app scaffolding

`shell.tsx` ships the app window frame (acrylic-only): `Shell` (root; `variant=
"inset"` makes it the frosted surface), `ShellInset`, `ShellPanel`
(`variant="list" | "detail"`), `ShellNavbar`, `ShellPanelHeader/Title/Description/
Actions`, `ShellContent`, `ShellBody`. Compose panels from these — don't hand-roll
`<main>`/`<section>` panel scaffolding with borders. Panels that host Cards or
outline Items should declare `data-nested-surface="true"`.

---

## ButtonGroup is the segmented control

macOS segmented controls / toolbars come from `button-group.tsx`
(`ButtonGroup`/`ButtonGroupItem`/`ButtonGroupToggle`/`ButtonGroupSeparator`) — not
from looping Buttons with manual active state, and not from a ToggleGroup (acrylic
does not ship one).

---

## Overlay choice (acrylic inventory)

| Use case | Component |
|---|---|
| Focused task needing input | `Dialog` |
| Destructive confirmation | `AlertDialog` |
| Side panel | `Sheet` |
| Small contextual content on click | `Popover` |
| Quick info on hover | `HoverCard` / `Tooltip` |

No `Drawer` (bottom sheet) in the registry — `Sheet side="bottom"` covers it. All
overlay panes are the frosted `--acr-panel` material and manage their own stacking:
never add manual z-index.
