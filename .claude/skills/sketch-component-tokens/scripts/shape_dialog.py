#!/usr/bin/env python3
"""Shape the raw Dialogs dump into a token doc.

    sketch_tokens.py extract <sketch> "Dialogs" --out raw.json
    shape_dialog.py <sketch> --out tokens/dialog.json

Dialog is a COMPOSITE (no variant x size matrix), like Alert — but its single
master is a full 1512x982 screen scene ("Dialogs/Save Dialog"). The universal
`extract` only surfaces the top-level master frame (the whole screen), so the
actual dialog panel lives DEEP in the child layer tree. This shaper therefore
re-reads the .sketch directly to pull the "Save Dialog - Collapsed" panel group
and its children:

  panel  500x274, radius 20, OPAQUE WHITE sheet (NOT a frosted material like the
         Alert) + drop shadow (60 blur / +18y / black 30%) + 1px hairline
         (black 70%). 20px padding all sides.
  icon   a 52x69 "Blank" rect = the app/document icon image slot (no fill).
  title  SFPro-Bold/13, black 85%.
  body   SFPro-Medium/11, black 85%.
  buttons three 76x24 Push Button instances = Button `medium` (3 Md). They
         resolve to real Button masters whose Style segment gives the variant:
           Save   -> Bordered Colored    -> default (primary)
           Cancel -> Neutral             -> neutral
           Delete -> Bordered Destructive-> destructive
  NO close (X) button. No separators. No dimming-layer master in this scene
  (modal backdrop is implied; reuse the Alert backdrop = black 23% downstream).
"""
import argparse, json, re, zipfile

PAGE_ID = "6ED82C1D-CE46-4844-B6A8-84E31265C88D"
SIZE_TOKENS = {'Mn': 'mini', 'Sm': 'small', 'Md': 'medium', 'Lg': 'large', 'XL': 'xl'}

# kit Style segment -> our Button variant (see references/button-example.md)
STYLE_TO_VARIANT = {
    'Bordered Colored': 'default',
    'Bordered Default': 'secondary',
    'Bordered Destructive': 'destructive',
    'Neutral': 'neutral',
    'Borderless': 'ghost',
}


def rgba(c):
    if not c:
        return None
    return (f"rgba({round(c.get('red',0)*255)}, {round(c.get('green',0)*255)}, "
            f"{round(c.get('blue',0)*255)}, {round(c.get('alpha',1),3)})")


def enabled_fills(style):
    out = []
    for f in (style.get('fills') or []):
        if not f.get('isEnabled'):
            continue
        c = f.get('color', {})
        cs = f.get('contextSettings', {}) or {}
        out.append({'color': rgba(c), 'blendMode': cs.get('blendMode', 0),
                    'fillType': f.get('fillType')})
    return out


def shadow_info(style):
    out = []
    for s in (style.get('shadows') or []):
        if not s.get('isEnabled'):
            continue
        out.append({'color': rgba(s.get('color')), 'blur': s.get('blurRadius'),
                    'offsetX': s.get('offsetX'), 'offsetY': s.get('offsetY'),
                    'spread': s.get('spread')})
    return out


def find_by_name(layer, name, classes):
    if layer.get('name') == name and layer.get('_class') in classes:
        return layer
    for c in layer.get('layers', []) or []:
        r = find_by_name(c, name, classes)
        if r:
            return r
    return None


def find_all(layer, pred):
    out = []
    if pred(layer):
        out.append(layer)
    for c in layer.get('layers', []) or []:
        out.extend(find_all(c, pred))
    return out


def text_info(layer):
    attr = layer.get('attributedString') or {}
    msa = attr.get('attributes') or []
    font = size = color = None
    if msa:
        at = msa[0].get('attributes', {})
        fa = at.get('MSAttributedStringFontAttribute', {}).get('attributes', {})
        font, size = fa.get('name'), fa.get('size')
        color = rgba(at.get('MSAttributedStringColorAttribute'))
    return {'string': attr.get('string'), 'font': font, 'fontSize': size, 'color': color}


def variant_size_from_master_name(mname):
    """'Push Button/Content Area/Bordered Colored/3 Md/...' -> (default, medium)."""
    segs = [s.strip() for s in (mname or '').split('/')]
    variant = next((STYLE_TO_VARIANT[s] for s in segs if s in STYLE_TO_VARIANT), None)
    size = None
    for s in segs:
        m = re.match(r'[1-9]\s+(Mn|Sm|Md|Lg|XL)', s)
        if m:
            size = SIZE_TOKENS[m.group(1)]
            break
    return variant, size


def build_master_index(z):
    """symbolID -> master name, across all pages."""
    meta = json.loads(z.read('meta.json'))
    idx = {}
    for pid in meta.get('pagesAndArtboards', {}):
        try:
            p = json.loads(z.read(f'pages/{pid}.json'))
        except KeyError:
            continue
        for m in find_all(p, lambda l: l.get('_class') == 'symbolMaster'):
            idx[m.get('symbolID')] = m.get('name')
    return idx


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('sketch')
    ap.add_argument('--page', default=PAGE_ID)
    ap.add_argument('--out')
    args = ap.parse_args()

    z = zipfile.ZipFile(args.sketch)
    page = json.loads(z.read(f'pages/{args.page}.json'))
    master_idx = build_master_index(z)

    panel = find_by_name(page, 'Save Dialog - Collapsed', ('group',))
    pstyle = panel.get('style') or {}
    pfr = panel.get('frame') or {}
    corners = pstyle.get('corners') or {}
    radii = corners.get('radii')

    # padding: derive from the inner content groups' x/y vs panel size
    center = find_by_name(panel, 'Center', ('group',))
    cfr = (center or {}).get('frame') or {}
    btns_group = find_by_name(panel, 'Buttons', ('group',))
    bfr = (btns_group or {}).get('frame') or {}
    pad_top = round(cfr.get('y', 0))
    pad_left = round(cfr.get('x', 0))
    pad_right = round(pfr.get('width', 0) - cfr.get('x', 0) - cfr.get('width', 0))
    pad_bottom = round(pfr.get('height', 0) - bfr.get('y', 0) - bfr.get('height', 0))

    # title + body text
    tg = find_by_name(panel, 'Title and Description', ('group',))
    texts = [text_info(t) for t in find_all(tg, lambda l: l.get('_class') == 'text')] if tg else []
    # bold = title, the other = body
    title = next((t for t in texts if t['font'] and 'Bold' in t['font']), None)
    body = next((t for t in texts if t is not title), None)

    # app/document icon image slot
    icon = find_by_name(panel, 'Blank', ('rectangle',))
    icon_fr = (icon or {}).get('frame') or {}

    # buttons: resolve each Push Button instance -> master -> (variant, size)
    insts = find_all(panel, lambda l: l.get('_class') == 'symbolInstance'
                     and l.get('name') == 'Push Button')
    buttons = []
    for inst in insts:
        mname = master_idx.get(inst.get('symbolID'), '')
        variant, size = variant_size_from_master_name(mname)
        ifr = inst.get('frame') or {}
        label = None
        for ov in (inst.get('overrideValues') or []):
            v = ov.get('value')
            if isinstance(v, str) and v and not v.startswith('{'):
                label = v
                break
        buttons.append({'label': label, 'mapsToVariant': variant, 'size': size,
                        'width': round(ifr.get('width', 0)), 'height': round(ifr.get('height', 0)),
                        'x': round(ifr.get('x', 0)), 'masterName': mname})
    # left-to-right order
    buttons.sort(key=lambda b: b['x'])

    btn_size = next((b['size'] for b in buttons if b['size']), None)
    btn_height = next((b['height'] for b in buttons if b['height']), None)

    tokens = {
        'source': args.sketch.split('/')[-1],
        'component': 'dialog',
        'note': ('composite. Single master is a full 1512x982 screen scene; the '
                 'panel "Save Dialog - Collapsed" lives deep in the layer tree. '
                 'Panel = OPAQUE WHITE sheet (NOT a frosted material like Alert), '
                 'radius 20, drop shadow + 1px hairline, 20px padding. NO close (X) '
                 'button, no separators. Action buttons are 24px = Button `medium` '
                 '(3 Md). Modal backdrop not present in this scene; reuse Alert '
                 'backdrop (black 23%) downstream.'),
        'panel': {
            'width': round(pfr.get('width', 0)),
            'height': round(pfr.get('height', 0)),
            'radius': radii[0] if radii else None,
            'radiusRaw': radii[0] if radii else None,
            'fills': enabled_fills(pstyle),
            'borders': [],
            'shadows': shadow_info(pstyle),
            'padding': {'top': pad_top, 'right': pad_right, 'bottom': pad_bottom, 'left': pad_left},
            'material': 'opaque-white',
        },
        'icon': {
            'present': icon is not None,
            'width': round(icon_fr.get('width', 0)) if icon else None,
            'height': round(icon_fr.get('height', 0)) if icon else None,
            'note': 'app/document icon image slot (52x69, no fill)',
        },
        'title': {'font': (title or {}).get('font'), 'fontSize': (title or {}).get('fontSize'),
                  'color': (title or {}).get('color'), 'sample': (title or {}).get('string')},
        'body': {'font': (body or {}).get('font'), 'fontSize': (body or {}).get('fontSize'),
                 'color': (body or {}).get('color'), 'sample': (body or {}).get('string')},
        'closeButton': {'present': False,
                        'note': 'kit Dialog has NO X / close button (dismiss via action buttons)'},
        'separators': {'present': False},
        'backdrop': {'present': False,
                     'note': 'no dimming-layer master in this scene; reuse Alert backdrop = black 23%'},
        'buttons': {
            'size': btn_size, 'height': btn_height, 'layout': 'horizontal',
            'roles': buttons,
        },
    }

    text = json.dumps(tokens, indent=2, ensure_ascii=False)
    if args.out:
        open(args.out, 'w').write(text)
        print(f"wrote dialog tokens -> {args.out}")
        p = tokens['panel']
        print(f"  panel {p['width']}x{p['height']} radius={p['radius']} material={p['material']} fills={p['fills']}")
        print(f"  padding={p['padding']} shadows={len(p['shadows'])}")
        print(f"  title {tokens['title']['font']}/{tokens['title']['fontSize']} {tokens['title']['color']}")
        print(f"  body  {tokens['body']['font']}/{tokens['body']['fontSize']} {tokens['body']['color']}")
        print(f"  closeButton present={tokens['closeButton']['present']} icon present={tokens['icon']['present']}")
        print(f"  buttons size={btn_size} height={btn_height}")
        for b in buttons:
            print(f"    {b['label']:8} -> variant {str(b['mapsToVariant']):11} ({b['width']}x{b['height']}) [{b['masterName']}]")
    else:
        print(text)


if __name__ == '__main__':
    main()
