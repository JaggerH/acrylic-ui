#!/usr/bin/env python3
"""Shape the Sliders page into a condensed Slider token doc.

    sketch_tokens.py extract <sketch> "Sliders and Dials" --out raw.json
    shape_slider.py raw.json --sketch <sketch> --out tokens/slider.json

The Slider is COMPOSITE and its real geometry/colours live in CHILD layers of
nested sub-symbols, not on the top-level masters (the universal `extract` only
sees the master frames, which here are 2px-wide "Nested Symbol BG" placeholders).
So, like shape_dialog.py, this shaper re-opens the .sketch and digs into the
atomic sub-symbol masters:

  - Track - Unfilled  (the rail)  -> rgba(0,0,0,0.06) idle / 0.03 disabled, capsule
  - Track - Filled    (the range) -> accent blue rgba(0,136,255,1) (#0088FF), capsule
  - Knob/{size}       (the thumb) -> frosted white rounded-rect (pill), per-size
  - Tick Marks        (ticks)     -> rgba(0,0,0,0.25) 2x2 dots, capsule
  - Circular Slider (Dial)        -> 36x36 circle + grabber

Sizes follow the kit's 5 control sizes (1 Mn..5 XL). Track height is 4px for
mini/small and 6px for medium/large/xl. The canonical resting state = Idle.

The light->dark colour map is the kit-general one (see references/sketch-format.md):
accent #0088FF -> dark accent #0091FF (keep alpha); black-at-alpha rail/tick ->
white-at-alpha.
"""
import argparse, json, re, zipfile

SIZE_TOK = {'Mn': 'mini', 'Sm': 'small', 'Md': 'medium', 'Lg': 'large', 'XL': 'xl'}
SIZE_ORDER = ['mini', 'small', 'medium', 'large', 'xl']
PAGE_ID = '0F963399-EA2F-4684-8165-18BD3CCA224B'

# ---- light -> dark colour map (kit-general) -------------------------------
def parse(s):
    m = re.match(r'rgba\((\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\)', s)
    return (int(m[1]), int(m[2]), int(m[3]), float(m[4]))

def rgba(rgb, a):
    return f"rgba({rgb[0]}, {rgb[1]}, {rgb[2]}, {round(a, 3)})"

def dark_color(s):
    if not s:
        return s
    r, g, b, a = parse(s)
    if (r, g, b) == (0, 136, 255):            # accent blue -> dark accent
        return rgba((0, 145, 255), a)
    if (r, g, b) == (0, 0, 0):                # black-opacity rail/tick -> white-opacity
        return rgba((255, 255, 255), a)
    if (r, g, b) == (255, 255, 255):          # frosted-white knob: keep white
        return rgba((255, 255, 255), a)
    return s

# ---- sketch helpers -------------------------------------------------------
def colstr(c):
    if not c:
        return None
    r = round(c.get('red', 0) * 255); g = round(c.get('green', 0) * 255)
    b = round(c.get('blue', 0) * 255); a = round(c.get('alpha', 0), 3)
    return f"rgba({r}, {g}, {b}, {a})"

def radii(lyr):
    cor = lyr.get('style', {}).get('corners')
    if cor:
        rad = cor.get('radii')
        return rad[0] if isinstance(rad, list) and rad else rad
    return lyr.get('fixedRadius')

def enabled(lst):
    return [x for x in (lst or []) if x.get('isEnabled', True)]

def walk(layer, pp=''):
    yield pp, layer
    for c in layer.get('layers', []):
        yield from walk(c, pp + ' > ' + layer.get('name', ''))

def size_of(name):
    m = re.search(r'[1-9]\s+(Mn|Sm|Md|Lg|XL)', name)
    return SIZE_TOK[m.group(1)] if m else None

# ---- shapers --------------------------------------------------------------
def shape_knobs(page):
    """size -> {width, height, radius, fills, shadows}"""
    out = {}
    for pp, lyr in walk(page):
        nm = lyr.get('name', '')
        if lyr.get('_class') != 'symbolMaster':
            continue
        if '/Knob/' not in nm or 'Ticked' in nm or 'Over-glass' in nm:
            continue
        sz = SIZE_TOK.get(nm.split('/')[-1].split()[-1]) if nm.split('/')[-1].split() else None
        if sz not in SIZE_ORDER:
            continue
        if sz in out:
            continue
        for c in lyr.get('layers', []):
            if c.get('name') == 'Knob' and c.get('_class') == 'rectangle':
                f = c.get('frame', {}); st = c.get('style', {})
                # frosted-white knob: collapse the stacked white layers to one opaque white
                fills = [colstr(x.get('color')) for x in enabled(st.get('fills'))]
                shadows = [{'color': colstr(s.get('color')), 'blur': s.get('blurRadius'),
                            'x': s.get('offsetX'), 'y': s.get('offsetY'),
                            'spread': s.get('spread')} for s in enabled(st.get('shadows'))]
                out[sz] = {'width': f.get('width'), 'height': f.get('height'),
                           'radius': radii(c), 'fillsLight': fills, 'shadows': shadows}
                break
    return out

def shape_rail(page):
    """idle/disabled rail (Track - Unfilled) by track height (4 small / 6 large)."""
    out = {}
    for pp, lyr in walk(page):
        if lyr.get('name') != 'Track - Unfilled':
            continue
        state = 'disabled' if 'Disabled' in pp else 'idle'
        h = lyr.get('frame', {}).get('height')
        fills = enabled(lyr.get('style', {}).get('fills'))
        c = colstr(fills[0].get('color')) if fills else None
        out.setdefault(state, {})[h] = {'color': c, 'colorDark': dark_color(c),
                                        'radius': radii(lyr)}
    return out

def shape_range(page):
    """Track - Filled (the accent range)."""
    for pp, lyr in walk(page):
        if lyr.get('name') in ('Track - Filled',) and 'Over-glass' not in pp:
            fills = enabled(lyr.get('style', {}).get('fills'))
            # the solid accent is the blend=14 (normal) opaque layer; take last opaque
            solid = None
            for f in fills:
                c = f.get('color', {})
                if round(c.get('alpha', 0), 3) == 1.0:
                    solid = colstr(c)
            solid = solid or (colstr(fills[-1].get('color')) if fills else None)
            return {'color': solid, 'colorDark': dark_color(solid),
                    'radius': radii(lyr),
                    'fillStack': [colstr(f.get('color')) for f in fills]}
    return None

def shape_ticks(page):
    for pp, lyr in walk(page):
        nm = lyr.get('name', '')
        if lyr.get('_class') == 'symbolMaster' and nm.endswith('/Tick Marks/Idle'):
            kids = [k for k in lyr.get('layers', []) if k.get('_class') == 'rectangle']
            if not kids:
                continue
            k = kids[0]; f = k.get('frame', {})
            fills = enabled(k.get('style', {}).get('fills'))
            c = colstr(fills[0].get('color')) if fills else None
            return {'count': len(kids), 'dot': {'width': f.get('width'), 'height': f.get('height'),
                    'radius': radii(k)}, 'color': c, 'colorDark': dark_color(c)}
    return None

def shape_dial(page):
    for pp, lyr in walk(page):
        nm = lyr.get('name', '')
        if (lyr.get('_class') == 'symbolMaster' and 'Circular Slider' in nm
                and 'Content Area' in nm and 'Idle' in nm and '5 XL' in nm):
            f = lyr.get('frame', {})
            grab = next((c for c in lyr.get('layers', []) if c.get('name') == 'Grabber'), None)
            gf = grab.get('frame', {}) if grab else {}
            return {'diameter': f.get('width'), 'radius': radii(lyr),
                    'grabber': {'width': gf.get('width'), 'height': gf.get('height'),
                                'radius': radii(grab) if grab else None}}
    return None

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('raw')
    ap.add_argument('--sketch', required=True)
    ap.add_argument('--out')
    args = ap.parse_args()
    raw = json.load(open(args.raw))

    z = zipfile.ZipFile(args.sketch)
    page = json.load(z.open(f'pages/{PAGE_ID}.json'))

    knobs = shape_knobs(page)
    rail = shape_rail(page)
    rng = shape_range(page)
    ticks = shape_ticks(page)
    dial = shape_dial(page)

    # track height per size: 4px mini/small, 6px medium/large/xl
    track_h = {'mini': 4, 'small': 4, 'medium': 6, 'large': 6, 'xl': 6}

    rail_idle = rail.get('idle', {})
    rail_dis = rail.get('disabled', {})

    bySize = {}
    for sz in SIZE_ORDER:
        th = track_h[sz]
        k = knobs.get(sz, {})
        ri = rail_idle.get(th, {})
        rd = rail_dis.get(th, {})
        bySize[sz] = {
            'trackHeight': th,
            'trackRadius': ri.get('radius'),
            'railColor': {'light': ri.get('color'), 'dark': ri.get('colorDark')},
            'railColorDisabled': {'light': rd.get('color'), 'dark': rd.get('colorDark')},
            'thumb': {
                'width': k.get('width'), 'height': k.get('height'),
                'radius': k.get('radius'),
                'fillsLight': k.get('fillsLight'),
                'fill': 'rgba(255, 255, 255, 1)',   # collapsed frosted-white -> opaque white knob
                'shadows': k.get('shadows'),
            },
        }

    tokens = {
        'source': raw.get('source'), 'component': 'slider',
        'note': ('macOS 26 slider. Capsule rail (Track - Unfilled) = black 6% idle / '
                 '3% disabled; capsule range (Track - Filled) = accent blue #0088FF '
                 '(dark #0091FF). Thumb = frosted-white rounded-rect PILL, per-size '
                 '(mini 16x12 .. xl 24x20, radius=height/2), ambient soft shadow + '
                 'inner highlight rims. Track height 4px (mini/small) / 6px '
                 '(medium/large/xl). Ticks = 2x2 black-25% capsule dots (9 marks). '
                 'Dial = 36x36 circle + 2x7 grabber. Colours flip light/dark via theme.'),
        'sizes': {sz: {'trackHeight': bySize[sz]['trackHeight'],
                       'thumb': f"{bySize[sz]['thumb']['width']}x{bySize[sz]['thumb']['height']}"}
                  for sz in SIZE_ORDER},
        'range': rng,
        'rail': {'idle': {'light': (rail_idle.get(6) or rail_idle.get(4) or {}).get('color'),
                          'dark': (rail_idle.get(6) or rail_idle.get(4) or {}).get('colorDark')},
                 'disabled': {'light': (rail_dis.get(6) or rail_dis.get(4) or {}).get('color'),
                              'dark': (rail_dis.get(6) or rail_dis.get(4) or {}).get('colorDark')},
                 'radius': 'capsule (radii=50 -> height/2)'},
        'ticks': ticks,
        'dial': dial,
        'bySize': bySize,
        # canonical pick used by the web wrapper (square-ish knob, capsule rail)
        'canonical': {
            'size': 'medium',
            'trackHeight': 6,
            'thumbSize': 16,          # web standard knob (kit medium pill 20x16 -> 16px round web knob)
            'thumbRadius': 'full',
            'thumbFill': 'white / --acr-control',
            'railColor': 'black 6% -> --acr-chip translucent',
            'rangeColor': 'accent #0088FF -> --primary',
        },
    }

    text = json.dumps(tokens, indent=2, ensure_ascii=False)
    if args.out:
        open(args.out, 'w').write(text)
        print(f"wrote slider tokens -> {args.out}")
        print(f"  range  = {rng['color']} radius={rng['radius']}")
        print(f"  rail   = idle {tokens['rail']['idle']['light']} / disabled {tokens['rail']['disabled']['light']}")
        if ticks:
            print(f"  ticks  = {ticks['count']}x {ticks['dot']['width']}x{ticks['dot']['height']} {ticks['color']}")
        if dial:
            print(f"  dial   = {dial['diameter']}px circle + grabber {dial['grabber']['width']}x{dial['grabber']['height']}")
        for sz in SIZE_ORDER:
            d = bySize[sz]
            print(f"  {sz:6} track h={d['trackHeight']} thumb {d['thumb']['width']}x{d['thumb']['height']} r={d['thumb']['radius']}")
    else:
        print(text)


if __name__ == '__main__':
    main()
