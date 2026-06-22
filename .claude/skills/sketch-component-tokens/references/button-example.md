# Worked example: Button (macOS 26 → shadcn/ui)

The fully validated extraction, and the proposed mapping to a shadcn/ui wrapper.
Source: `Apple macOS 26 UI Kit.sketch`, page `Buttons` (785 symbolMasters →
8 categories × 5 sizes). Produced by:

```bash
python scripts/sketch_tokens.py extract "$SK" Buttons --out raw.json
python scripts/shape_button.py raw.json --out tokens/button.json
```

## 8 categories (variants)

7 Push-Button styles + Arrow Button:

| Apple category | resting fill (light) | text (light) | proposed shadcn variant |
|---|---|---|---|
| Bordered Default | accent `#0088FF`, **3-layer material** (50%×2 + 100%, blend 16/0/14) | white | `default` (the macOS prominent/"default" button) |
| Bordered Colored | solid accent `#0088FF` 100% | white | `default` flat / a `filled` |
| Bordered Secondary | accent 10% | accent `#0078F0` | `secondary` (tinted) |
| Bordered Destructive | red `#FF383C` 25% | red `#FF383C` | `destructive` |
| Neutral | black 5% (`Active,Off,Idle`; the *On* state is 13%) | `#1A1A1A` | `secondary` (gray) |
| Borderless (on = bezel) | none at rest; accent fill when **On** | accent → white(on) | `ghost` / toggle |
| Borderless (on = label change) | none | accent `#0078F0` | `ghost` / `link` |
| Arrow Button | black 5%, square, `SFPro-Semibold`, no label | 85% black | `icon` button |

Note the canonical **resting** state is `Active, Off, Idle`. Several categories
look different when On (toggled/pressed) — that is a separate state, not the
default appearance.

## 5 sizes + the radius two-regime rule

Radius comes from `style.corners.radii` (see sketch-format.md), **not a single
formula**:

| size | height | radius | padX | fontSize | regime |
|---|---|---|---|---|---|
| mini | 16 | **4** | 7 | 10 | ~height/4 rounded-rect |
| small | 20 | **5** | 10 | 11 | ~height/4 |
| medium | 24 | **6** | 16 | 13 | height/4 |
| large | 28 | **14** | 16 | 13 | **height/2 capsule** |
| xl | 36 | **18** | 16 | 13 | **height/2 capsule** |

macOS 26 keeps mini/small/medium as quarter-height rounded rectangles but snaps
large/xl to full **capsule**. Arrow Button uses the `100` sentinel = full circle.
Borderless-bezel toggles 6 (off) ↔ 100 (on). Font is `SFPro-Medium` (Arrow:
`SFPro-Semibold`).

## Colours: light + dark

`tokens/button.json` carries `*_light` and `*_dark` for every fill and text
colour. Dark is mapped from the kit's own Dark swatch families (accent `#0091FF`,
red `#FF4245`, black-opacity fills → white-opacity, labels Light→Dark). acrylic-ui
is a dark frosted theme, so the wrapper should consume the `_dark` values (or wire
both behind the theme's CSS variables).

## Building the shadcn wrapper (step 5 — not yet done)

Target: `registry/acrylic/button.tsx` (currently a draft with height/4-guessed
radii and `px-3` medium padding — both wrong vs the kit). Plan:

1. Define `buttonVariants` (CVA) with the 8 categories above as `variant` and the
   5 sizes as `size`; wire colours to the theme's CSS variables / `_dark` tokens.
2. Fix the size scale to the extracted values: heights 16/20/24/28/36, radii
   4/5/6/14/18, padX 7/10/16/16/16, fontSize 10/11/13/13/13.
3. Keep `asChild` via Radix `Slot` (already in the draft).
4. Decide the variant-name mapping (Apple names vs shadcn conventional names) —
   the current draft already uses `default/secondary/tinted/outline/ghost/
   destructive/glow`; reconcile with the 8 extracted categories.

Open decisions to confirm with the user before writing the wrapper:
- variant naming (keep Apple category names, or shadcn-conventional names?),
- whether `Bordered Default`'s 3-layer material is worth replicating or flatten
  to a single accent fill,
- map `Arrow Button` → the existing `icon` size or a dedicated variant.
