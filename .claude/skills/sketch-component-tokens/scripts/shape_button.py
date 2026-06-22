#!/usr/bin/env python3
"""Shape the universal raw master dump into a condensed Button token matrix.

Pipeline:
    sketch_tokens.py extract <sketch> Buttons --out raw.json
    shape_button.py raw.json --out tokens/button.json

This is the PER-COMPONENT step: it encodes the Button taxonomy
({Type}/{Area}/{Style}/{Size}/{State}) and the macOS-26 light->dark colour map.
Use it as a template when shaping other components — only the taxonomy parsing
and the resting-state pick are component-specific; the colour map is kit-general.
"""
import argparse, json, re

PUSH_STYLES = ['Bordered Default', 'Bordered Secondary', 'Bordered Colored',
               'Bordered Destructive', 'Neutral',
               'Borderless (on = label change)', 'Borderless (on = bezel)']
SIZE_ORDER = ['mini', 'small', 'medium', 'large', 'xl']
SIZE_PX = {'mini': 16, 'small': 20, 'medium': 24, 'large': 28, 'xl': 36}
SIZE_TOK = {'Mn': 'mini', 'Sm': 'small', 'Md': 'medium', 'Lg': 'large', 'XL': 'xl'}

# light -> dark, sourced from the kit's own Dark swatch families
ACCENT_DARK = (0, 145, 255)   # System Colors/Dark/8 Blue   (light #0088FF)
RED_DARK = (255, 66, 69)      # System Colors/Dark/1 Red     (light #FF383C)
NEAR_WHITE = (245, 245, 245)  # Label Colors/Dark Vibrant/1 Primary


def category(name):
    if name.startswith('Arrow Button'):
        return 'Arrow Button'
    return next((s for s in PUSH_STYLES if s in name), None)

def size_of(segs):
    for s in segs:
        m = re.match(r'[1-9]\s+(Mn|Sm|Md|Lg|XL)', s)
        if m:
            return SIZE_TOK[m.group(1)]
    return None

def area_of(name):
    return 'Over-glass' if 'Over-glass' in name else 'Content Area'

def is_resting(name):
    # canonical resting state: active window, toggle off, idle
    return 'Idle' in name and 'Inactive' not in name and ' On' not in name

def parse(s):
    m = re.match(r'rgba\((\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\)', s)
    return (int(m[1]), int(m[2]), int(m[3]), float(m[4]))

def rgba(rgb, a):
    return f"rgba({rgb[0]}, {rgb[1]}, {rgb[2]}, {round(a,3)})"

def dark_fill(f):
    r, g, b, a = parse(f['color']); sw = f.get('swatch') or ''
    if 'Accent Appearance' in sw:   c = rgba(ACCENT_DARK, a)
    elif 'Destructive' in sw:       c = rgba(RED_DARK, a)
    elif (r, g, b) == (0, 0, 0) and a < 1: c = rgba((255, 255, 255), a)  # Fills light(black)->dark(white)
    else:                           c = f['color']
    return {**f, 'color': c, '_light': f['color']}

def dark_text(s):
    if not s:
        return s
    r, g, b, a = parse(s)
    if (r, g, b) == (255, 255, 255):       return s                 # white label stays
    if (r, g, b) == (0, 120, 240):         return rgba(ACCENT_DARK, 1)
    if (r, g, b) == (255, 56, 60):         return rgba(RED_DARK, a)
    if (r, g, b) == (26, 26, 26):          return rgba(NEAR_WHITE, 1)
    if (r, g, b) == (0, 0, 0):             return rgba((255, 255, 255), a if a < 1 else 1)
    return s


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('raw'); ap.add_argument('--out')
    args = ap.parse_args()
    raw = json.load(open(args.raw))

    # category -> size -> chosen resting record (Content Area preferred)
    chosen = {}
    for m in raw['masters']:
        cat = category(m['name']); sz = size_of(m['segments'])
        if not cat or not sz or area_of(m['name']) != 'Content Area':
            continue
        if not is_resting(m['name']):
            continue
        chosen.setdefault(cat, {}).setdefault(sz, m)

    tokens = {
        'source': raw.get('source'), 'component': 'button',
        'note': ('faithful extraction from Sketch; radius from style.corners.radii '
                 '(raw 100 => fully-rounded => height/2). *_dark mapped via kit Dark '
                 'swatch families (accent #0091FF, red #FF4245, black-opacity fills->white).'),
        'sizes': SIZE_PX, 'categories': {},
    }
    for cat, sizes in chosen.items():
        tokens['categories'][cat] = {}
        for sz in SIZE_ORDER:
            m = sizes.get(sz)
            if not m:
                continue
            tx = m['text'] or {}
            tokens['categories'][cat][sz] = {
                'height': m['height'], 'radius': m['radius'], 'radiusRaw': m['radiusRaw'],
                'padding': m['padding'], 'paddingX': tx.get('paddingX'),
                'font': tx.get('font'), 'fontSize': tx.get('fontSize'),
                'fills_light': m['fills'], 'fills_dark': [dark_fill(f) for f in m['fills']],
                'textColor_light': tx.get('color'), 'textColor_dark': dark_text(tx.get('color')),
            }
    bd = tokens['categories'].get('Bordered Default', {})
    tokens['radiusBySize'] = {s: bd[s]['radius'] for s in SIZE_ORDER if s in bd}

    text = json.dumps(tokens, indent=2, ensure_ascii=False)
    if args.out:
        open(args.out, 'w').write(text)
        print(f"wrote {len(tokens['categories'])} categories -> {args.out}")
        print("radiusBySize:", tokens['radiusBySize'])
    else:
        print(text)


if __name__ == '__main__':
    main()
