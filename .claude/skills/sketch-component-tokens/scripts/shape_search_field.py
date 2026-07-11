#!/usr/bin/env python3
import argparse, json, re

SIZE_TOK = {'Mn': 'mini', 'Sm': 'small', 'Md': 'medium', 'Lg': 'large', 'XL': 'xl'}
SIZE_ORDER = ['mini', 'small', 'medium', 'large', 'xl']
SIZE_PX = {'mini': 16, 'small': 20, 'medium': 24, 'large': 28, 'xl': 36}

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

    # var -> size -> state -> master
    by = {}
    for m in raw['masters']:
        var = None
        if 'Content Area' in m['name']:
            var = 'default'
        elif 'Over-glass' in m['name']:
            var = 'over-glass'
        if not var:
            continue
        sz = size_of(m['segments'])
        state = m['segments'][-1]
        by.setdefault(var, {}).setdefault(sz, {})[state] = m

    tokens = {'source': raw.get('source'), 'component': 'search-field',
              'note': ('Search Field with default (Content Area) and over-glass variants, 5 sizes. '
                       'Over-glass variant has transparent background and no borders at rest.'),
              'sizes': SIZE_PX, 'byVariant': {}}
    
    for var in ['default', 'over-glass']:
        tokens['byVariant'][var] = {}
        for sz in SIZE_ORDER:
            states = by.get(var, {}).get(sz, {})
            rest = states.get('Placeholder')
            focus = states.get('Empty + Focused')
            value = states.get('Value')
            disabled = states.get('Disabled')
            if not rest:
                continue
            tv = (value or {}).get('text') or {} if value else {}
            tokens['byVariant'][var][sz] = {
                'height': rest['height'], 'radius': rest['radius'],
                'padding': rest['padding'],
                'font': tv.get('font'), 'fontSize': tv.get('fontSize'),
                'bg': fill(rest),
                'border': borders(rest),
                'focusRing': borders(focus) if focus else None,
                'disabledBg': fill(disabled) if disabled else None,
                'textColor': {'light': tv.get('color'), 'dark': dark_color(tv.get('color'))} if tv.get('color') else None,
                'placeholderColor': None,
            }
            
    text = json.dumps(tokens, indent=2, ensure_ascii=False)
    if args.out:
        open(args.out, 'w').write(text)
        print(f"wrote {args.out}")
        for var in ['default', 'over-glass']:
            print(f"variant: {var}")
            for sz in SIZE_ORDER:
                d = tokens['byVariant'][var].get(sz)
                if d:
                    print(f"  {sz:6} h={d['height']} r={d['radius']} bg={d['bg']['light'] if d['bg'] else 'none'} "
                          f"border={d['border'][0]['color'] if d['border'] else '-'} "
                          f"focus={'yes' if d['focusRing'] else 'no'}")
    else:
        print(text)

if __name__ == '__main__':
    main()
