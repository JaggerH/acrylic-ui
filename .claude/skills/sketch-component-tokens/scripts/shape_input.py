#!/usr/bin/env python3
"""Shape the universal raw master dump into a condensed Input (Text Field) token set.

    sketch_tokens.py extract <sketch> "Text Fields" --out raw.json
    shape_input.py raw.json --out tokens/input.json

Text Field taxonomy: Text Field/{Area}/{Size}/{State}. No variant axis — just 5
sizes + states (Placeholder/Empty+Focused/Typing/Value/Disabled/Value Disabled).
Resting = Placeholder. Per size we collect geometry + colors from three states:
Placeholder (bg/border/radius/padding), Empty + Focused (the accent focus ring),
Value (value text color/font). Placeholder TEXT color is absent from the kit
(those masters are empty), so it is left null — wire it to a muted theme token.
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
    return f"rgba({rgb[0]}, {rgb[1]}, {rgb[2]}, {round(a,3)})"

def dark_color(s):
    if not s:
        return s
    r, g, b, a = parse(s)
    if (r, g, b) == (255, 255, 255):          # white bg -> dark translucent control
        return rgba((255, 255, 255), 0.09) if a == 1 else rgba((255, 255, 255), round(a * 0.18, 3))
    if (r, g, b) == (0, 0, 0):                # black-opacity (border/fill) -> white-opacity
        return rgba((255, 255, 255), a)
    if (r, g, b) == (0, 122, 255):            # focus accent (#007AFF) -> dark accent
        return rgba((0, 145, 255), a)
    if (r, g, b) == (26, 26, 26):             # near-black value text -> near-white
        return rgba((245, 245, 245), a)
    return s

def borders(m):
    return [{'color': b['color'], 'colorDark': dark_color(b['color']),
             'thickness': b['thickness']} for b in m['borders']]

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

    # size -> state -> master (Content Area only)
    by = {}
    for m in raw['masters']:
        if 'Content Area' not in m['name']:
            continue
        sz = size_of(m['segments'])
        state = m['segments'][-1]
        by.setdefault(sz, {})[state] = m

    tokens = {'source': raw.get('source'), 'component': 'input',
              'note': ('Text Field. radius = uniform ~height/4 (4/5/6/7/9), NO capsule '
                       '(unlike Button). bg solid white -> dark translucent control; '
                       'hairline border #000/8%; focus = accent ring (#007AFF 25% 3.5px + '
                       '15% 1px). Placeholder text color absent from kit -> use muted token.'),
              'sizes': SIZE_PX, 'bySize': {}}
    for sz in SIZE_ORDER:
        states = by.get(sz, {})
        rest = states.get('Placeholder')
        focus = states.get('Empty + Focused')
        value = states.get('Value')
        disabled = states.get('Disabled')
        if not rest:
            continue
        tv = (value or {}).get('text') or {} if value else {}
        tokens['bySize'][sz] = {
            'height': rest['height'], 'radius': rest['radius'],
            'padding': rest['padding'],
            'font': tv.get('font'), 'fontSize': tv.get('fontSize'),
            'bg': fill(rest),
            'border': borders(rest),
            'focusRing': borders(focus) if focus else None,
            'disabledBg': fill(disabled) if disabled else None,
            'textColor': {'light': tv.get('color'), 'dark': dark_color(tv.get('color'))} if tv.get('color') else None,
            'placeholderColor': None,   # not in kit; wire to --muted-foreground
        }
    text = json.dumps(tokens, indent=2, ensure_ascii=False)
    if args.out:
        open(args.out, 'w').write(text)
        print(f"wrote {len(tokens['bySize'])} sizes -> {args.out}")
        for sz in SIZE_ORDER:
            d = tokens['bySize'].get(sz)
            if d:
                print(f"  {sz:6} h={d['height']} r={d['radius']} bg={d['bg']['light']} "
                      f"border={d['border'][0]['color'] if d['border'] else '-'} "
                      f"focus={'yes' if d['focusRing'] else 'no'}")
    else:
        print(text)


if __name__ == '__main__':
    main()
