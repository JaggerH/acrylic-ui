#!/usr/bin/env python3
"""Shape the raw Segmented Controls dump into a Button Group token doc.

    sketch_tokens.py extract <sketch> "Segmented Controls" --out raw.json
    shape_button_group.py raw.json --out tokens/button-group.json

Button Group is a COMPOSITE (no clean variant×size matrix on the master itself).
The Segmented Controls page models exactly the macOS "grouped control" anatomy we
need:

  * WELL / TRACK  — the gray rounded container the segments sit in. It is the
    `Content Area/Duo|Trio` composite master: fill rgba(0,0,0,0.05) (5% black),
    radius = control radius per size (4/5/6/14/18), height = control height
    (16/20/24/28/36). Maps to the acrylic theme var --acr-field (already 5% black
    light / 5% white dark, so it flips for free).

  * SEPARATOR    — the hairline divider between flush segments. The composite
    nests a `Separator` instance 1px wide, inset vertically (14px tall on a 24px
    track → ~5px top/bottom inset). Its real color lives in the child rectangle of
    the Separator master: rgba(230,230,230,1) = Label Colors Quinary, a light gray
    hairline. We wire it to --acr-border-soft (theme-aware).

  * SEGMENT      — each item. Off (unselected) = no fill, label color near-black
    (#1A1A1A). On (selected) has TWO appearances in the kit:
        - Active (window focused)  = accent-blue fill #0088FF + white label
        - Inactive (window blurred)= rgba(0,0,0,0.13) gray raised pill
    The modern macOS 26 segmented look the component targets is a RAISED WHITE
    rounded pill with a soft shadow over the gray well; we map the selected pill
    to --acr-control (#ffffff light / translucent white dark) + a soft shadow,
    and document the accent-blue variant the kit also ships. Segment radius is
    concentric with the well (same per-size radius).

Sizes are the five macOS control sizes (heights 16/20/24/28/36; radii
4/5/6/14/18). No standalone "variant" axis exists in the kit — the wrapper's
`segmented`/`attached`/`split` variants are composition choices over this one
anatomy.
"""
import argparse, json, re

SIZE_TOK = {'Mn': 'mini', 'Sm': 'small', 'Md': 'medium', 'Lg': 'large', 'XL': 'xl'}
SIZE_ORDER = ['mini', 'small', 'medium', 'large', 'xl']
SIZE_PX = {'mini': 16, 'small': 20, 'medium': 24, 'large': 28, 'xl': 36}


# light -> dark (kit-general; see references/sketch-format.md)
def parse(s):
    m = re.match(r'rgba\((\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\)', s)
    return (int(m[1]), int(m[2]), int(m[3]), float(m[4]))


def rgba(rgb, a):
    return f"rgba({rgb[0]}, {rgb[1]}, {rgb[2]}, {round(a, 3)})"


def dark_color(s):
    if not s:
        return s
    r, g, b, a = parse(s)
    if (r, g, b) == (255, 255, 255):          # white pill -> dark translucent control
        return rgba((255, 255, 255), 0.09) if a == 1 else rgba((255, 255, 255), round(a * 0.18, 3))
    if (r, g, b) == (0, 0, 0):                # black-opacity well/fill -> white-opacity
        return rgba((255, 255, 255), a)
    if (r, g, b) == (230, 230, 230):          # light-gray hairline -> dark hairline
        return rgba((255, 255, 255), 0.08)
    if (r, g, b) == (0, 136, 255):            # accent #0088FF -> dark accent #0091FF
        return rgba((0, 145, 255), a)
    if (r, g, b) == (26, 26, 26):             # near-black label -> near-white
        return rgba((245, 245, 245), a)
    return s


def lite_dark(s):
    return {'light': s, 'dark': dark_color(s)} if s else None


def size_of(segs):
    for s in segs:
        x = re.search(r'[1-9]\s+(Mn|Sm|Md|Lg|XL)', s)
        if x:
            return SIZE_TOK[x.group(1)]
    return None


def find(masters, *needles):
    for m in masters:
        if all(n in m['name'] for n in needles):
            return m
    return None


def fill0(m):
    return m['fills'][0]['color'] if m and m['fills'] else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('raw')
    ap.add_argument('--out')
    args = ap.parse_args()
    raw = json.load(open(args.raw))
    M = raw['masters']

    # --- WELL geometry/fill per size (Duo composite is the canonical track) ---
    well = {}
    for m in M:
        if 'Content Area/Duo/Active' not in m['name']:
            continue
        sz = size_of(m['segments'])
        if not sz:
            continue
        well[sz] = {'height': m['height'], 'radius': m['radius'],
                    'radiusRaw': m['radiusRaw'], 'fill': lite_dark(fill0(m))}

    # --- SEGMENT (selected/unselected) per size ---
    segs = {}
    for sz_tok, sz in SIZE_TOK.items():
        on_active = find(M, 'Buttons/Content Area', f'Active, {[k for k in ["1 Mn","2 Sm","3 Md","4 Lg","5 XL"] if k.endswith(sz_tok)][0]}', 'On, 1 - Idle')
        on_inact = find(M, 'Buttons/Content Area', f'Inactive, {[k for k in ["1 Mn","2 Sm","3 Md","4 Lg","5 XL"] if k.endswith(sz_tok)][0]}', 'On, 1 - Idle')
        off = find(M, 'Buttons/Content Area', f'Active, {[k for k in ["1 Mn","2 Sm","3 Md","4 Lg","5 XL"] if k.endswith(sz_tok)][0]}', 'Off, 1 - Idle')
        if not off:
            continue
        ot = (off.get('text') or {})
        at = (on_active.get('text') or {}) if on_active else {}
        segs[sz] = {
            'height': off['height'], 'radius': off['radius'], 'radiusRaw': off['radiusRaw'],
            'unselected': {
                'fill': None,
                'textColor': lite_dark(ot.get('color')),
            },
            'selectedAccent': {   # kit window-focused selected = accent blue
                'fill': lite_dark(fill0(on_active)) if on_active else None,
                'textColor': lite_dark(at.get('color')),
            },
            'selectedMuted': {    # kit window-blurred selected = 13% black pill
                'fill': lite_dark(fill0(on_inact)) if on_inact else None,
            },
            'font': at.get('font') or ot.get('font'),
            'fontSize': at.get('fontSize') or ot.get('fontSize'),
        }

    # --- SEPARATOR (real hairline color comes from the On master child rect) ---
    sep_on = find(M, 'Separator/On')
    sep_color = fill0(sep_on)  # universal extract took the master fill (placeholder red);
    # the real hairline (rgba(230,230,230,1)) is dug from the child rect in
    # dig_composite.py — hardcode the verified value here.
    sep_color = 'rgba(230, 230, 230, 1)'

    tokens = {
        'source': raw.get('source'), 'component': 'button-group',
        'note': ('composite (Segmented Controls page). WELL = gray rounded track '
                 'fill rgba(0,0,0,0.05) (-> --acr-field), radius/height per macOS '
                 'control size (4/5/6/14/18 ; 16/20/24/28/36). SEPARATOR = 1px '
                 'hairline rgba(230,230,230,1) (-> --acr-border-soft), inset ~5px '
                 'top/bottom. SEGMENT selected pill: kit ships accent-blue (focused) '
                 'and 13% gray (blurred); the modern macOS look the wrapper targets '
                 'is a RAISED WHITE pill (-> --acr-control) + soft shadow over the '
                 'well. Segment radius concentric with well.'),
        'sizes': SIZE_PX,
        'radiusBySize': {sz: well[sz]['radius'] for sz in SIZE_ORDER if sz in well},
        'well': {sz: well[sz] for sz in SIZE_ORDER if sz in well},
        'segment': {sz: segs[sz] for sz in SIZE_ORDER if sz in segs},
        'separator': {
            'thickness': 1,
            'color': lite_dark(sep_color),
            'insetNote': '~5px top/bottom (14px tall on a 24px track)',
            'mapsTo': '--acr-border-soft',
        },
        'selectedPill': {
            'note': 'macOS 26 target = raised white pill with soft shadow over the well',
            'fill': lite_dark('rgba(255, 255, 255, 1)'),
            'mapsTo': '--acr-control',
            'shadow': '0 1px 2px rgba(0,0,0,0.16), 0 0 0 0.5px rgba(0,0,0,0.04)',
            'altAccent': lite_dark('rgba(0, 136, 255, 1)'),
        },
    }

    text = json.dumps(tokens, indent=2, ensure_ascii=False)
    if args.out:
        open(args.out, 'w').write(text)
        print(f"wrote button-group tokens -> {args.out}")
        print(f"  well fill light={tokens['well']['medium']['fill']['light']} (-> --acr-field)")
        print(f"  radiusBySize={tokens['radiusBySize']}")
        print(f"  separator={tokens['separator']['color']['light']} thick={tokens['separator']['thickness']}")
        print(f"  selected pill={tokens['selectedPill']['fill']['light']} (-> --acr-control) "
              f"alt accent={tokens['selectedPill']['altAccent']['light']}")
    else:
        print(text)


if __name__ == '__main__':
    main()
