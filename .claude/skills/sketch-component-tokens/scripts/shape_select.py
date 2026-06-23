#!/usr/bin/env python3
"""Shape the raw Pop-up and Pull-down Buttons dump into a Select token doc.

    sketch_tokens.py extract <sketch> "Pop-up and Pull-down Buttons" --out raw.json
    shape_select.py raw.json --out tokens/select.json

The macOS 26 Pop-up Button == a Select: it shows the chosen value plus an up/down
double-chevron, and opens a menu. Taxonomy on this page is
`{Type}/{Area}/{Size}/{State}` where Type = `Pop-up Button` | `Pulldown Button`
(plus a nested `Double Chevron` glyph sub-master). We want the SELECT, so:

  Type  = Pop-up Button         (Pulldown is the action menu, not a value select)
  Area  = Content Area          (canonical; ignore Over-glass + nested glyph)
  State = 1 - Idle              (resting), with 4 - Disabled for the muted look

The trigger geometry/radius is IDENTICAL to Button (4/5/6/14/18 — mini/small/
medium quarter-height; large/xl capsule). Resting fill is a flat control surface
rgba(0,0,0,0.05); NO border. The up/down chevron is the `Double Chevron` master
under the `Pop-up Button` type: SF glyph 􀆏 (chevron.up.chevron.down → lucide
ChevronsUpDown), SFPro-Semibold, color rgba(0,0,0,0.85) enabled / 0.25 disabled.
The dropdown MENU is not cleanly on this page — reuse the acrylic Popover panel.
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
    if (r, g, b) == (255, 255, 255):          # white -> dark translucent control
        return rgba((255, 255, 255), 0.09) if a == 1 else rgba((255, 255, 255), round(a * 0.18, 3))
    if (r, g, b) == (0, 0, 0):                # black-opacity (fill/glyph) -> white-opacity
        return rgba((255, 255, 255), a)
    if (r, g, b) == (0, 122, 255):            # focus accent (#007AFF) -> dark accent
        return rgba((0, 145, 255), a)
    if (r, g, b) == (26, 26, 26):             # near-black label text -> near-white
        return rgba((245, 245, 245), a)
    return s


def fill(m):
    f = m['fills'][0]['color'] if m['fills'] else None
    return {'light': f, 'dark': dark_color(f)} if f else None


def size_of(segs):
    for s in segs:
        x = re.match(r'[1-9]\s+(Mn|Sm|Md|Lg|XL)', s)
        if x:
            return SIZE_TOK[x.group(1)]
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('raw'); ap.add_argument('--out')
    args = ap.parse_args()
    raw = json.load(open(args.raw))

    # size -> state -> trigger master (Pop-up Button / Content Area only)
    trig = {}
    for m in raw['masters']:
        if m['segments'][0] != 'Pop-up Button' or m['segments'][1] != 'Content Area':
            continue
        sz = size_of(m['segments'])
        state = m['segments'][-1] if not size_of([m['segments'][-1]]) else m['segments'][-2]
        trig.setdefault(sz, {})[state] = m

    # size -> Pop-up Button "Double Chevron" glyph master (Enabled state)
    chev = {}
    for m in raw['masters']:
        if m['segments'][0] != 'Pop-up Button' or m['segments'][2] != 'Double Chevron':
            continue
        if m['segments'][3] != 'Enabled':
            continue
        sz = size_of(m['segments'])
        chev[sz] = m

    tokens = {
        'source': raw.get('source'), 'component': 'select',
        'note': ('macOS 26 Pop-up Button = a Select (shows chosen value + up/down '
                 'double chevron). Trigger geometry/radius IDENTICAL to Button '
                 '(4/5/6/14/18). Resting fill flat control surface rgba(0,0,0,0.05), '
                 'NO border. Chevron = SF 􀆏 (chevron.up.chevron.down -> lucide '
                 'ChevronsUpDown), SFPro-Semibold, rgba(0,0,0,0.85) / 0.25 disabled. '
                 'Dropdown menu not cleanly on this page -> reuse acrylic Popover panel.'),
        'sizes': SIZE_PX,
        'radiusBySize': {},
        'bySize': {},
    }
    for sz in SIZE_ORDER:
        states = trig.get(sz, {})
        rest = states.get('1 - Idle')
        disabled = states.get('4 - Disabled')
        if not rest:
            continue
        t = rest['text'] or {}
        c = (chev.get(sz) or {}).get('text') or {}
        tokens['radiusBySize'][sz] = rest['radius']
        tokens['bySize'][sz] = {
            'height': rest['height'],
            'radius': rest['radius'], 'radiusRaw': rest['radiusRaw'],
            'padding': rest['padding'],
            'font': t.get('font'), 'fontSize': t.get('fontSize'),
            'bg': fill(rest),
            'border': [{'color': b['color'], 'colorDark': dark_color(b['color']),
                        'thickness': b['thickness']} for b in rest['borders']],
            'textColor': {'light': t.get('color'), 'dark': dark_color(t.get('color'))} if t.get('color') else None,
            'disabledBg': fill(disabled) if disabled else None,
            'chevron': {
                'glyph': c.get('string'), 'sf': 'chevron.up.chevron.down',
                'lucide': 'ChevronsUpDown',
                'font': c.get('font'), 'fontSize': c.get('fontSize'),
                'color': {'light': c.get('color'), 'dark': dark_color(c.get('color'))} if c.get('color') else None,
            },
        }
    text = json.dumps(tokens, indent=2, ensure_ascii=False)
    if args.out:
        open(args.out, 'w').write(text)
        print(f"wrote {len(tokens['bySize'])} sizes -> {args.out}")
        for sz in SIZE_ORDER:
            d = tokens['bySize'].get(sz)
            if d:
                print(f"  {sz:6} h={d['height']} r={d['radius']} bg={d['bg']['light']} "
                      f"chevron={d['chevron']['glyph']} {d['chevron']['fontSize']}px")
    else:
        print(text)


if __name__ == '__main__':
    main()
