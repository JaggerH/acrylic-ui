#!/usr/bin/env python3
"""Shape the Steppers page into a condensed Stepper token doc.

    sketch_tokens.py extract <sketch> "Steppers" --out raw.json   # (informational)
    shape_stepper.py <sketch> --out tokens/stepper.json

Stepper is a COMPOSITE (no variant axis) — a small vertical up/down increment
control. Like Dialog, the page's top-level masters are thin wrappers
(`Stepper/Content Area/{Size}/No Field/Active, 1 - Idle`) whose single
symbolInstance resolves to the REAL master
(`Stepper/_<glyph>/Content Area/{Size}/Active/1 - Idle`) that actually holds the
child layers. So this shaper re-reads the .sketch and follows the instance chain.

Anatomy of the real master (medium, 20x24, radius 6):
  bezel       the master frame itself; radius lives in style.corners.radii (NOT
              cornerRadius). NO fill/border on the master — the look is built from
              the two button-half rectangles. Radius = uniform ~height/4
              (4/5/6/7/9), identical to the Text Field — never capsule.
  BG: Top     upper half rectangle, full width x height/2, fill black 5% (idle).
  BG: Bottom  lower half rectangle, same, fill black 5% (idle).
  separator   a 1px horizontal divider at the vertical midpoint, inset ~3px each
              side, gray (#BFBFBF Tertiary), radius 0.5.
  chevrons    two `Path` shapePaths — up-chevron centered in the top half, down-
              chevron in the bottom half. Fill black 85% (Primary label) at idle,
              black 25% (Tertiary) when disabled. Width grows with size.

States (No Field, Active):
  1 - Idle        both halves black 5%, chevrons black 85%.
  3 - Click Up    pressed-top: BG:Top -> black 15%, BG:Bottom stays 5%.
  3 - Click Down  pressed-bottom: BG:Bottom -> black 15%, BG:Top stays 5%.
  4 - Disabled    both halves black 4%, chevrons black 25%.

light -> dark (kit-general): black-with-alpha fills become white-with-alpha; the
gray separator becomes white 18%. Our wrapper wires the bezel to --acr-control /
--acr-control-border, each button half hover to --acr-hover, the divider to
--acr-control-border, and the chevron glyph to currentColor (text-foreground),
so it all flips for free via the Acrylic theme tokens.
"""
import argparse, json, zipfile

SIZE = {'1 Mn': 'mini', '2 Sm': 'small', '3 Md': 'medium', '4 Lg': 'large', '5 XL': 'xl'}
SIZE_ORDER = ['mini', 'small', 'medium', 'large', 'xl']


def color_str(c, SW):
    if not c:
        return None
    a = c.get('alpha', 1)
    r = round(c.get('red', 0) * 255); g = round(c.get('green', 0) * 255); b = round(c.get('blue', 0) * 255)
    nm = SW.get(c.get('swatchID')) if c.get('swatchID') else None
    return {'rgba': f"rgba({r}, {g}, {b}, {round(a, 3)})", 'swatch': nm}


def dark_of(rgba):
    """light -> dark per references/sketch-format.md (kit-general)."""
    if not rgba:
        return None
    import re
    m = re.match(r'rgba\((\d+), (\d+), (\d+), ([0-9.]+)\)', rgba)
    if not m:
        return rgba
    r, g, b, a = int(m[1]), int(m[2]), int(m[3]), float(m[4])
    if (r, g, b) == (0, 0, 0):                       # black-opacity fill/glyph -> white-opacity
        return f"rgba(255, 255, 255, {round(a, 3)})"
    if (r, g, b) == (191, 191, 191):                 # separator gray -> white 18%
        return "rgba(255, 255, 255, 0.18)"
    return rgba


def find_all(layer, pred, out=None):
    if out is None:
        out = []
    if pred(layer):
        out.append(layer)
    for c in layer.get('layers', []) or []:
        find_all(c, pred, out)
    return out


def first_fill(layer, SW):
    for f in (layer.get('style', {}).get('fills') or []):
        if f.get('isEnabled', True):
            return color_str(f.get('color'), SW)
    return None


def fr(l):
    f = l.get('frame') or {}
    return {'x': round(f.get('x', 0), 2), 'y': round(f.get('y', 0), 2),
            'w': round(f.get('width', 0), 2), 'h': round(f.get('height', 0), 2)}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('sketch')
    ap.add_argument('--page', default='B909AE8E-13A9-4DA6-BBC5-96669BC88F9D')
    ap.add_argument('--out')
    args = ap.parse_args()

    z = zipfile.ZipFile(args.sketch)
    doc = json.loads(z.read('document.json'))
    meta = json.loads(z.read('meta.json'))
    SW = {s['do_objectID']: s['name'] for s in doc.get('sharedSwatches', {}).get('objects', [])}

    # symbolID -> master, across all pages (the inner real masters live here too)
    MASTER_BY_ID = {}
    for pid in meta.get('pagesAndArtboards', {}):
        try:
            p = json.loads(z.read(f'pages/{pid}.json'))
        except KeyError:
            continue
        for m in find_all(p, lambda l: l.get('_class') == 'symbolMaster'):
            MASTER_BY_ID[m.get('symbolID')] = m

    page = json.loads(z.read(f'pages/{args.page}.json'))

    def inner_master(size_tok, state):
        wrap_name = f'Stepper/Content Area/{size_tok}/No Field/Active, {state}'
        wraps = find_all(page, lambda l: l.get('_class') == 'symbolMaster' and l.get('name') == wrap_name)
        if not wraps:
            return None, None
        insts = find_all(wraps[0], lambda l: l.get('_class') == 'symbolInstance')
        if not insts:
            return wraps[0], None
        return wraps[0], MASTER_BY_ID.get(insts[0].get('symbolID'))

    def child(master, name):
        return next((c for c in (master.get('layers') or []) if c.get('name') == name), None)

    by_size = {}
    for size_tok, size in SIZE.items():
        wrap, inner = inner_master(size_tok, '1 - Idle')
        if not inner:
            continue
        _, inner_dis = inner_master(size_tok, '4 - Disabled')
        _, inner_up = inner_master(size_tok, '3 - Click Up')

        wfr = wrap.get('frame') or {}
        radii = (wrap.get('style', {}).get('corners') or {}).get('radii')

        top = child(inner, 'BG: Top')
        bottom = child(inner, 'BG: Bottom')
        sep = child(inner, 'separator')
        chevs = [c for c in (inner.get('layers') or []) if c.get('name') == 'Path']
        # up = the one higher on the canvas (smaller y)
        chevs.sort(key=lambda c: (c.get('frame') or {}).get('y', 0))
        up_chev = chevs[0] if chevs else None

        # disabled chevron color
        dis_chevs = [c for c in (inner_dis.get('layers') or [])
                     if c.get('name') == 'Path'] if inner_dis else []
        dis_chev = dis_chevs[0] if dis_chevs else None
        # pressed half color (Click Up -> BG:Top darkens)
        up_top = child(inner_up, 'BG: Top') if inner_up else None

        half_fill = first_fill(top, SW)
        sep_fill = first_fill(sep, SW)
        chev_fill = first_fill(up_chev, SW) if up_chev else None
        dis_chev_fill = first_fill(dis_chev, SW) if dis_chev else None
        pressed_fill = first_fill(up_top, SW) if up_top else None

        def with_dark(cs):
            if not cs:
                return None
            return {'light': cs['rgba'], 'dark': dark_of(cs['rgba']), 'swatch': cs.get('swatch')}

        by_size[size] = {
            'bezel': {'width': round(wfr.get('width', 0)), 'height': round(wfr.get('height', 0)),
                      'radius': radii[0] if radii else None, 'radiusRaw': radii[0] if radii else None},
            'half': {'frame': fr(top) if top else None, 'fillIdle': with_dark(half_fill),
                     'fillPressed': with_dark(pressed_fill)},
            'separator': {'frame': fr(sep) if sep else None, 'thickness': fr(sep)['h'] if sep else None,
                          'inset': fr(sep)['x'] if sep else None, 'fill': with_dark(sep_fill),
                          'radius': ((sep.get('style', {}).get('corners') or {}).get('radii') or [None])[0] if sep else None},
            'chevron': {'frame': fr(up_chev) if up_chev else None,
                        'fillIdle': with_dark(chev_fill), 'fillDisabled': with_dark(dis_chev_fill)},
        }

    tokens = {
        'source': args.sketch.split('/')[-1],
        'component': 'stepper',
        'note': ('composite, no variant axis. A small vertical up/down increment '
                 'control. Top-level page masters are thin wrappers; the real '
                 'child layers live in the nested instance master '
                 '(Stepper/_<glyph>/Content Area/{Size}/Active/{State}). Bezel = '
                 'two stacked half-rectangles (each height/2), radius ~height/4 '
                 '(4/5/6/7/9, never capsule), no master fill/border. Each half '
                 'black 5% idle, darkens to 15% when its arrow is pressed. A 1px '
                 'inset horizontal separator (gray #BFBFBF) splits the halves. Two '
                 'chevron glyphs (up top, down bottom), black 85% idle / 25% '
                 'disabled. light->dark: black-alpha -> white-alpha, separator gray '
                 '-> white 18%. Wrapper wires bezel to --acr-control/-border, half '
                 'hover to --acr-hover, divider to --acr-control-border, chevron to '
                 'currentColor.'),
        'sizes': {k: v['bezel']['height'] for k, v in by_size.items()},
        'radiusBySize': {k: v['bezel']['radius'] for k, v in by_size.items()},
        'bySize': by_size,
    }

    text = json.dumps(tokens, indent=2, ensure_ascii=False)
    if args.out:
        open(args.out, 'w').write(text)
        print(f"wrote stepper tokens ({len(by_size)} sizes) -> {args.out}")
        for sz in SIZE_ORDER:
            d = by_size.get(sz)
            if not d:
                continue
            print(f"  {sz:6} bezel {d['bezel']['width']}x{d['bezel']['height']} r={d['bezel']['radius']} "
                  f"half={d['half']['fillIdle']['light']} sep={d['separator']['fill']['light']} "
                  f"chev={d['chevron']['fillIdle']['light']}")
    else:
        print(text)


if __name__ == '__main__':
    main()
