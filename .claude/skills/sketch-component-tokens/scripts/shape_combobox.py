#!/usr/bin/env python3
"""Shape the raw Combo Boxes dump into a token doc.

    sketch_tokens.py extract <sketch> "Combo Boxes" --out raw.json
    shape_combobox.py raw.json --out tokens/combobox.json

Combo Box is a COMPOSITE: each master = a Text Field instance (== the Input
component) + a "Menu Button" group (chevron.down glyph on a translucent chip).
So the field reuses Input's geometry; only the trailing chevron button is new.
The master itself carries just the chevron glyph (SFPro-Bold, foreground); the
field bg/border/radius live in the nested Text Field. The dropdown LIST is not on
this page (style it from Menus / a generic popover). States: Idle / Field Clicked
(field focus) / Button Clicked (chevron open) / Disabled.
"""
import argparse, json, re

SIZE_TOK = {'Mn': 'mini', 'Sm': 'small', 'Md': 'medium', 'Lg': 'large', 'XL': 'xl'}
SIZE_ORDER = ['mini', 'small', 'medium', 'large', 'xl']
SIZE_PX = {'mini': 16, 'small': 20, 'medium': 24, 'large': 28, 'xl': 36}

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

    by = {}
    for m in raw['masters']:
        if 'Content Area' not in m['name'] or not m['name'].endswith('Idle'):
            continue
        sz = size_of(m['segments'])
        if sz:
            by[sz] = m

    tokens = {
        'source': raw.get('source'), 'component': 'combobox',
        'note': ('composite = Input (Text Field) + trailing chevron Menu Button. '
                 'field geometry reuses Input tokens; chevron = SF chevron.down '
                 '(SFPro-Bold, foreground) sized per control; menu-button chip bg '
                 'rgba(0,0,0,0.13) radius ~4.5. dropdown list not on this page.'),
        'sizes': SIZE_PX,
        'reuses': 'input',
        'chevronBySize': {},
    }
    for sz in SIZE_ORDER:
        m = by.get(sz)
        if not m:
            continue
        t = m['text'] or {}
        tokens['chevronBySize'][sz] = {
            'height': m['height'],
            'glyph': t.get('string'), 'font': t.get('font'),
            'fontSize': t.get('fontSize'), 'color': t.get('color'),
        }
    text = json.dumps(tokens, indent=2, ensure_ascii=False)
    if args.out:
        open(args.out, 'w').write(text)
        print(f"wrote combobox tokens -> {args.out}")
        for sz in SIZE_ORDER:
            d = tokens['chevronBySize'].get(sz)
            if d:
                print(f"  {sz:6} h={d['height']} chevron {d['font']} {d['fontSize']}px {d['color']}")
    else:
        print(text)


if __name__ == '__main__':
    main()
