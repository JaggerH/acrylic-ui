# Sketch (.sketch) file format — the parts that bite

A `.sketch` file is a ZIP archive of JSON. Open with `zipfile`; no Sketch app
needed. Layout:

```
document.json          # sharedSwatches (colour tokens), sharedStyles, page refs
meta.json              # pagesAndArtboards: page-id -> {name, artboards}
user.json
pages/<page-id>.json   # one file per page; the actual layer tree
images/ , previews/    # binary assets (not needed for tokens)
```

## Pages

- `meta.json → pagesAndArtboards` maps page-id → name. **Names have an SF-Symbol
  glyph prefix** (a private-use Unicode char + space, e.g. `􁸞 Buttons`). Strip
  leading non-letters to match by plain name. Several pages can share a trailing
  word (`Buttons` vs `Pop-up and Pull-down Buttons`) — prefer exact match.
- The layer tree is in `pages/<page-id>.json` under `layers` (recursive
  `layers` arrays). Components are `_class: "symbolMaster"`.

## Where each parameter lives on a symbolMaster

| Param | Location | Notes |
|---|---|---|
| size | `frame.width` / `frame.height` | |
| content padding | `topPadding`/`rightPadding`/`bottomPadding`/`leftPadding` on the master | also derivable from the child text layer's `frame.x` |
| **corner radius** | **`style.corners.radii`** (`MSImmutableStyleCorners`) | ⚠️ NOT `cornerRadius`/`fixedRadius` (those are 0/absent for these controls). `radii` is a list; first value is the uniform radius. Also `style` and `prefersConcentric`. |
| background fill | `style.fills[]` | on the master itself — these controls have **no rectangle/shape layers**. Multiple enabled fills stack (each with `contextSettings.blendMode`) for the macOS material look. |
| border | `style.borders[]` | `thickness`, `position` (0 center / 1 inside / 2 outside). Often empty even for "Bordered" variants — the look comes from fills. |
| shadows | `style.shadows[]` | |
| label text | child layer `_class: "text"` | `attributedString.string`; font + size in `attributes[0].attributes.MSAttributedStringFontAttribute.attributes` (`name`, `size`); colour in `MSAttributedStringColorAttribute`. |

### Corner radius sentinel

`radii == [100]` does **not** mean 100px. It is the kit's "fully rounded"
sentinel → render as `height/2` (capsule for pills, circle for square icon
buttons). Always keep the raw value (`radiusRaw`) alongside the resolved one so
the sentinel is recoverable.

## Colours: swatch resolution

Fills/borders/text reference a shared swatch via `color.swatchID`. Resolve to a
human name through `document.json → sharedSwatches.objects[] {do_objectID, name,
value}`. The stored RGBA is the **light-appearance** value even for swatches
named "…Appearance …%". Relevant swatch families in the macOS 26 kit:

- `Accent Colors (Opacities)/Accent Appearance {10,15,25,50,85,100}%` — accent
  blue at opacity; light base `#0088FF`.
- `Accent Colors (Opacities)/Destructive {25,50,100}%` — light red `#FF383C`.
- `System Colors/{Light,Dark}/N <hue>` — full palette, both appearances stored.
- `Fills/{Light,Dark}/N` — Light = black at opacity; Dark = white at opacity.
- `Label Colors/{Light,Dark}[ Vibrant]/N` — text colours per appearance.

## Light → dark mapping (kit-general, reused by shape_button.py)

The kit only stores light values on the masters. Derive dark from the kit's own
Dark families:

- swatch name contains `Accent Appearance` → swap base to **Dark accent
  `#0091FF`** (`System Colors/Dark/8 Blue`), keep alpha.
- swatch name contains `Destructive` → swap base to **Dark red `#FF4245`**
  (`System Colors/Dark/1 Red`), keep alpha.
- raw black-with-alpha fill (`rgba(0,0,0,a<1)`, a `Fills/Light` token) →
  **white at same alpha** (`Fills/Dark`).
- text colours: white stays white; accent label `#0078F0` → dark accent;
  destructive label `#FF383C` → `#FF4245`; near-black `#1A1A1A` → near-white
  `#F5F5F5`; pure black → white.

## Variant/size/state taxonomy

symbolMaster names are `/`-delimited paths. For the Buttons page:
`{Type}/{Area}/{Style}/{Size}/{State}`, e.g.
`Push Button/Content Area/Bordered Default/3 Md/Active, Off, 1 Idle`.

- **Type**: `Push Button`, `Arrow Button`.
- **Area**: `Content Area` (canonical) vs `Over-glass` (variant tuned for glass
  backdrops). Extract from `Content Area`.
- **Size**: `1 Mn`/`2 Sm`/`3 Md`/`4 Lg`/`5 XL` → mini/small/medium/large/xl
  (heights 16/20/24/28/36).
- **State**: `{Active|Inactive}, {On|Off}, {1 Idle|2 Hover|3 Clicked|4 Disabled}`.
  Canonical resting = `Active, Off, Idle`. The On state is the toggled/pressed
  appearance (e.g. borderless-bezel grows a fill, Neutral darkens) — do not
  mistake it for the resting look.

Other pages reuse the same size/state convention but different Type/Style
segments — run `explore` to read off each component's dimensions.
