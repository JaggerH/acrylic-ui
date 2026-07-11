---
name: acrylic-ui
description: Using and composing Acrylic UI components — the dark frosted-glass shadcn/ui registry aligned to the Apple macOS 26 UI Kit. Applies when working with acrylic components (registry/acrylic/*, components vendored from acrylic-ui), --acr-* tokens, the acr-frosted material, Backdrop/Shell/nested surfaces, or any project that installed from the @acrylic registry. Component APIs mirror shadcn/ui 1:1 where they overlap; this skill covers the acrylic deltas and inherits the rest.
user-invocable: true
---

# Acrylic UI

A shadcn/ui **registry** with a dark frosted-glass (macOS 26 vibrancy) aesthetic.
Every component is a shadcn/ui component copied and restyled per shadcn's extension
conventions — **APIs correspond 1:1 where both ship the component**. What differs is
the material system (`--acr-*` tokens, frosted surfaces, nested-surface treatment)
and a handful of macOS-specific axes (Button sizes, Badge pills, Item variants).

> **Inheritance rule:** if the shadcn/ui skill (or your shadcn knowledge) has a rule
> and this skill doesn't contradict it, the shadcn rule applies verbatim — forms use
> `FieldGroup`+`Field`, items live in their Groups, Dialog needs a Title, `gap-*` not
> `space-y-*`, `cn()` for conditional classes, no manual z-index on overlays, etc.
> This skill documents only the acrylic-specific rules and divergences.

## Install

Components install from the registry URL — no config needed; the Acrylic theme
tokens (`acrylic` style item) come along as a dependency of every component:

```bash
npx shadcn add https://acrylic-ui.vercel.app/r/button.json
```

Optional namespace shortcut (register once in `components.json`):

```json
{ "registries": { "@acrylic": "https://acrylic-ui.vercel.app/r/{name}.json" } }
```

```bash
npx shadcn add @acrylic/button
npx shadcn add https://acrylic-ui.vercel.app/r/acrylic.json   # theme tokens only
```

The theme item deliberately does **NOT** ship the standard shadcn semantic vars
(`--primary`/`--background`/`--foreground`/`--destructive`/`--ring`/`--border`) —
those belong to the consuming app, so installed components inherit the host's brand
colors instead of overwriting them.

## Principles

1. **Use existing components first.** Check the correspondence table below; if
   acrylic ships it, use the acrylic version — never mix stock shadcn styling into
   an acrylic surface.
2. **Compose, don't reinvent.** Same anatomy as shadcn: Card = Header/Title/
   Description/Action/Content/Footer; forms = FieldGroup + Field; rows = Item in
   ItemGroup.
3. **Tokens, never raw colors.** All color flows through `--acr-*` + the host's
   semantic vars; the token set is defined three times (light / dark / acrylic) and
   flips for free. See [rules/materials.md](./rules/materials.md).
4. **The material is the design.** Cards are flat glass — no borders, no rest
   shadows, no `dark:` overrides. Depth comes from nesting steps
   (`--acr-card-nested`), not from decoration.

## Critical Rules

Always enforced. Each links to Incorrect/Correct pairs.

### Materials, tokens & surfaces → [rules/materials.md](./rules/materials.md)

- **Semantic `--acr-*` tokens only.** Never raw colors, never manual `dark:` pairs.
- **Three theme blocks** (light / `.dark` / `.acrylic`) — never assume one; wire
  through token names.
- **Glass = `acr-frosted` + `bg-[var(--acr-surface)]` + `backdrop-blur`.** Panels
  use `--acr-panel`.
- **Cards are flat at rest** — no border/shadow/ring; hover float lives on
  `::before`, never on the translucent element itself.
- **Nested surfaces opt in explicitly**: `Card nestedSurface` /
  `data-nested-surface="true"` on the container → inner Cards drop blur and tint
  `--acr-card-nested`, one step per level. Row-level nested fill = `Item
  variant="muted"`.
- **Exactly one `<Backdrop />` at the app root** — frosted chrome has nothing to
  frost without it.
- **Tauri vibrancy is opt-in and inert on the web**; modals use the shipped
  `useModalAcrylicBody` (already wired into Dialog/AlertDialog/Sheet).

### Components & divergences → [rules/components.md](./rules/components.md)

- **Button axes are macOS, not shadcn**: `variant` default/secondary/destructive/
  neutral/ghost/link × `size` mini/small/medium/large/xl × `icon` (boolean SHAPE
  prop → round icon button). No `size="icon"`, no `variant="outline"`.
- **Icons inside Button need NO `data-icon` attribute and NO sizing classes** —
  spacing is the built-in `gap-1`, glyph size comes from the size axis. (Divergence
  from stock shadcn's `data-icon="inline-start"`.)
- **Badge compact pills use `size="sm"`**, never a `text-[11px]` override (the
  override strips `leading-none` and the badge balloons — see badge.tsx).
- **Item has three variants**: `default` (transparent), `outline` (glass surface),
  `muted` (nested fill). Outline Items inside a declared surface auto-recess like
  nested Cards.
- **Shell family** composes app layouts (Shell/ShellInset/ShellPanel/ShellNavbar/
  ShellContent…) — don't hand-roll panel scaffolding.

### Authoring a new acrylic component → [rules/authoring.md](./rules/authoring.md)

- **Adding a component to the acrylic-ui repo** (vs. consuming one): ship it through
  the registry, never hand-copy. Source in `registry/acrylic/<name>.tsx` (start from
  shadcn, recolor via tokens) → `registry.json` entry with `target:
  components/acrylic/<name>.tsx` + `registryDependencies: acrylic.json` → `npm run
  registry:build` → docs (mdx + `meta.json` + `<name>-demo.tsx`) → move it from "Not
  shipped" into the correspondence table here. Deploy (git push → Vercel) before any
  consumer can `npx shadcn add @acrylic/<name>`.

### Inherited shadcn rules (unchanged — apply as-is)

Forms: `FieldGroup`+`Field`+`FieldSet`/`FieldLegend`, `data-invalid`+`aria-invalid`
pairs, `InputGroupInput`/`InputGroupTextarea` inside `InputGroup`, buttons in inputs
via `InputGroupAddon`. Composition: items inside their Group (`SelectGroup`,
`DropdownMenuGroup`, `CommandGroup`, `ContextMenuGroup`), Dialog/Sheet always carry
a Title (`sr-only` if hidden), full Card anatomy, `Avatar` needs `AvatarFallback`,
toast via `sonner`, `Skeleton` for loading, `Separator` not `<hr>`. Styling:
`className` for layout not color, `gap-*` not `space-*`, `size-*` when square,
`truncate`, `cn()`, no manual z-index on overlays.

## Component correspondence (shadcn ↔ acrylic)

Same name = same API surface, acrylic restyling only. File = `registry/acrylic/<file>`.

| shadcn/ui | acrylic | Notes |
|---|---|---|
| alert-dialog | `alert-dialog.tsx` | + `useModalAcrylicBody` wired for vibrancy |
| avatar | `avatar.tsx` | 1:1 |
| badge | `badge.tsx` | + `size="sm"` compact pill |
| breadcrumb | `breadcrumb.tsx` | 1:1 (already token-driven; separator/ellipsis glyph on `--label-tertiary`) |
| button | `button.tsx` | **Diverges**: macOS variant/size/icon axes (see rules/components.md) |
| button-group | `button-group.tsx` | macOS segmented controls |
| card | `card.tsx` | + `interactive`, + `nestedSurface`; flat glass, no border |
| combobox | `combobox.tsx` | 1:1 (composes command + popover) |
| command | `command.tsx` | 1:1 |
| context-menu | `context-menu.tsx` | 1:1 |
| dialog | `dialog.tsx` | frosted `--acr-panel` pane |
| dropdown-menu | `dropdown-menu.tsx` | 1:1 |
| field | `field.tsx` | 1:1 (Field/FieldLabel/FieldTitle/FieldDescription/FieldError/FieldContent/FieldGroup/FieldSet/FieldLegend/FieldSeparator) |
| hover-card | `hover-card.tsx` | 1:1 |
| input | `input.tsx` | 1:1 |
| input-group | `input-group.tsx` | 1:1 (Input/Textarea/Addon/Button/Text) |
| item | `item.tsx` | + variants `outline`(glass)/`muted`(nested); anatomy 1:1 |
| popover | `popover.tsx` | 1:1 |
| radio-group | `radio-group.tsx` | 1:1 |
| select | `select.tsx` | 1:1 |
| separator | `separator.tsx` | 1:1 |
| sheet | `sheet.tsx` | frosted side drawer |
| sidebar | `sidebar.tsx` | 1:1 anatomy, frosted material |
| skeleton | `skeleton.tsx` | 1:1 |
| slider | `slider.tsx` | 1:1 |
| sonner | `sonner.tsx` | toast = Card surface material (`--acr-toast`) |
| switch | `switch.tsx` | 1:1 |
| tooltip | `tooltip.tsx` | frosted `--acr-panel` |
| — | `backdrop.tsx` | **acrylic-only**: the app-root wallpaper the glass frosts |
| — | `shell.tsx` | **acrylic-only**: app window scaffolding (Shell/Inset/Panel/Navbar/Content) |
| — | `media-box.tsx` | **acrylic-only**: media container |
| — | `audio-player.tsx` | **acrylic-only** |
| — | `stepper.tsx` | **acrylic-only**: macOS stepper control |
| — | `use-modal-acrylic.ts` | **acrylic-only**: Tauri vibrancy modal hook |

**Not shipped by acrylic** (use the host app's own or ask before adding): accordion,
alert, calendar, carousel, chart, checkbox, collapsible, drawer, empty,
input-otp, menubar, navigation-menu, pagination, progress, resizable, scroll-area
(use `scrollbar-mac` utility class), spinner, table, tabs, textarea (exists inside
input-group), toggle, toggle-group.

## Key Patterns

```tsx
// The glass recipe (what Card/Sheet/Popover are made of)
"acr-frosted bg-[var(--acr-surface)] backdrop-blur-xl"

// Card-in-card: container opts in, inner cards auto-recess
<Card nestedSurface className="flex flex-col gap-2.5 p-3">
  <Card className="p-2.5">…</Card>          // nested fill, blur dropped
</Card>

// Round icon button: icon is a SHAPE, orthogonal to size/variant
<Button icon size="large" variant="ghost" aria-label="Play"><PlayIcon /></Button>

// Icon + label: NO data-icon, NO sizing classes (gap + glyph size are built in)
<Button variant="neutral" size="small"><RefreshCwIcon />刷新</Button>

// Compact count pill
<Badge variant="secondary" size="sm">42</Badge>

// Recessed row inside a surface
<Item variant="muted" size="xs">…</Item>

// One backdrop at the root; frosted chrome above it
<Backdrop /> <Shell variant="inset">…</Shell>
```

## Component Selection

| Need | Use |
|---|---|
| App window / panels / navbars | `Shell` family |
| Surface container | `Card` (+ `nestedSurface` for card-in-card) |
| List row | `Item` (+ `ItemGroup`; `muted` recessed / `outline` glass) |
| Button/action | `Button` (macOS axes) · segmented: `ButtonGroup` |
| Form layout | `Field` family + `Input`/`Select`/`Combobox`/`Switch`/`RadioGroup`/`Slider`/`Stepper` |
| Search box with button | `InputGroup` + `InputGroupInput` + `InputGroupAddon` |
| Overlays | `Dialog` / `AlertDialog` (confirm) / `Sheet` (side) / `Popover` / `HoverCard` / `Tooltip` |
| Menus | `DropdownMenu`, `ContextMenu`, `Command` |
| Feedback | `sonner` (toast), `Skeleton`, `Badge` |
| Media | `MediaBox`, `AudioPlayer` |

## Workflow

1. **Identify the vendored location.** Consuming projects copy components under
   their own tree (e.g. `components/acrylic/` or `components/ui/`); imports follow
   the host's alias. Read the local copy — docstrings are the API reference.
2. **Check the correspondence table** before adding anything new; install from the
   registry (`npx shadcn add @acrylic/<name>` or the full URL), never re-style a
   stock shadcn component by hand.
3. **Compose within the material system** — declared surfaces, nested fills,
   tokens. When a surface "disappears" (white-on-white in light mode), the fix is
   the nested-surface mechanism, not a hardcoded background.
4. **Docs**: https://acrylic-ui.vercel.app/docs — each component page has Preview /
   Code / install command / props reference. Repo docs live in `content/docs/`.
