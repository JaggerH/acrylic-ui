#!/usr/bin/env python3
"""Shape the raw Alerts dump into a token doc.

    sketch_tokens.py extract <sketch> "Alerts" --out raw.json
    shape_alert.py raw.json --out tokens/alert.json

Alert is a COMPOSITE (no variant×size matrix). The page has 7 masters: the panel
Background, the Dimming Layer (modal backdrop), two button layouts (Side by Side /
Stacked), and three button roles (Cancel / Destructive / Preferred). The buttons
are 28px tall = the Button component's `large` size, so the wrapper styles its
action/cancel via buttonVariants({size:"large"}). Roles map to Button variants:
Preferred→default, Cancel→neutral, Destructive→destructive (kit shows it borderless
red, but we keep the themed variant).
"""
import argparse, json

def find(masters, needle):
    return next((m for m in masters if needle in m['name']), None)

def fills(m):
    return [{'color': f['color'], 'swatch': f.get('swatch')} for f in (m['fills'] if m else [])]

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('raw'); ap.add_argument('--out')
    args = ap.parse_args()
    raw = json.load(open(args.raw))
    M = raw['masters']

    bg = find(M, '/Background')
    dim = find(M, 'Dimming Layer')
    sbs = find(M, 'Side by Side')
    stk = find(M, 'Stacked')
    pref = find(M, 'Buttons/Preferred')
    canc = find(M, 'Buttons/Cancel')
    dest = find(M, 'Buttons/Destructive')

    def layout(m):
        if not m:
            return None
        t = m['text'] or {}
        return {'width': m['width'], 'height': m['height'], 'padding': m['padding'],
                'bodyText': {'font': t.get('font'), 'fontSize': t.get('fontSize'), 'color': t.get('color')}}

    def btn(m, variant):
        t = (m['text'] or {}) if m else {}
        return {'mapsToVariant': variant, 'size': 'large',
                'height': m['height'] if m else None, 'radius': m['radius'] if m else None,
                'radiusRaw': m['radiusRaw'] if m else None,
                'fill': (fills(m)[0]['color'] if m and m['fills'] else None),
                'textColor': t.get('color'), 'sampleLabel': t.get('string')}

    tokens = {
        'source': raw.get('source'), 'component': 'alert',
        'note': ('composite. panel radius 26 + translucent white material; modal '
                 'backdrop = black 23%; buttons are 28px = Button `large` size. '
                 'roles map to Button variants (Preferred→default, Cancel→neutral, '
                 'Destructive→destructive).'),
        'panel': {'radius': bg['radius'] if bg else None, 'fills': fills(bg)},
        'backdrop': {'fill': (fills(dim)[0]['color'] if dim and dim['fills'] else None)},
        'layouts': {'sideBySide': layout(sbs), 'stacked': layout(stk)},
        'buttons': {
            'size': 'large', 'height': (pref or {}).get('height'),
            'roles': {
                'preferred': btn(pref, 'default'),
                'cancel': btn(canc, 'neutral'),
                'destructive': btn(dest, 'destructive'),
            },
        },
    }
    text = json.dumps(tokens, indent=2, ensure_ascii=False)
    if args.out:
        open(args.out, 'w').write(text)
        print(f"wrote alert tokens -> {args.out}")
        print(f"  panel radius={tokens['panel']['radius']} backdrop={tokens['backdrop']['fill']}")
        print(f"  buttons size={tokens['buttons']['size']} height={tokens['buttons']['height']}")
        for r, v in tokens['buttons']['roles'].items():
            print(f"    {r:11} -> variant {v['mapsToVariant']:11} fill={v['fill']} text={v['textColor']}")
    else:
        print(text)


if __name__ == '__main__':
    main()
