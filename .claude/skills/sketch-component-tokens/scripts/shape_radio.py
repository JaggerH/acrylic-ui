#!/usr/bin/env python3
"""Shape the Radio Button anatomy from the Toggles page into a condensed token set.

    sketch_tokens.py extract <sketch> Toggles --out radio_raw.json   # (row-level only)
    shape_radio.py <sketch> --out tokens/radio.json

Radio Button taxonomy: Radio Button/{Area}/{Size}/{State}.
  State = {Active|Inactive}, {Unchecked|Checked|Mixed} - {1 Idle|3 Clicked|4 Disabled}

A radio master is a COMPOSITE row (137x24 = circle + label), so its visual params
live in a child group named "Radio Button" (the circle), NOT on the master itself
(the universal `extract` flattens children away). This shaper therefore re-reads
the .sketch to reach the circle group + its inner "Dot"/"Dash" oval.

Anatomy (Content Area, resting = Active ... 1 Idle):
  - Outer circle: a `group` named "Radio Button", w==h == diameter, radius [100]
    (fully-round sentinel -> circle). Background is a single GROUP FILL (no border
    layer): unchecked = black 5% (gray ring/fill); checked = accent 100% (#0088FF).
  - Inner dot: child `oval` "Dot", white, ~40% of circle diameter; only present
    when checked. (Mixed/indeterminate uses a "Dash" rectangle instead.)
  - Disabled: checked circle fill -> accent 50% + group opacity 0.5; unchecked
    -> black 4%.

Diameters per size (mini..xl): circle 12/14/16/18/18, dot 4/4.8/4.8/5/5.
Label: SF Pro Medium, 10/11/13/13/13, near-black #1A1A1A.
"""
import argparse, json, zipfile, re

PAGE = "01EC0891-3A21-460F-881F-FC0546A9E15A"
SIZE_TOK = {'Mn': 'mini', 'Sm': 'small', 'Md': 'medium', 'Lg': 'large', 'XL': 'xl'}
SIZE_ORDER = ['mini', 'small', 'medium', 'large', 'xl']


# --- light -> dark (kit-general; see references/sketch-format.md) -------------
def parse(s):
    m = re.match(r'rgba\((\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\)', s)
    return (int(m[1]), int(m[2]), int(m[3]), float(m[4]))

def rgba(rgb, a):
    return f"rgba({rgb[0]}, {rgb[1]}, {rgb[2]}, {round(a,3)})"

def dark_color(s):
    if not s:
        return s
    r, g, b, a = parse(s)
    if (r, g, b) == (255, 255, 255):     # white dot stays white
        return rgba((255, 255, 255), a)
    if (r, g, b) == (0, 0, 0):           # black-opacity ring/fill -> white-opacity
        return rgba((255, 255, 255), a)
    if (r, g, b) == (0, 136, 255):       # light accent #0088FF -> dark accent #0091FF
        return rgba((0, 145, 255), a)
    if (r, g, b) == (26, 26, 26):        # near-black label -> near-white
        return rgba((245, 245, 245), a)
    if (r, g, b) == (76, 76, 76):        # inactive gray dot -> lighter gray
        return rgba((170, 170, 170), a)
    return s

def both(s):
    return {'light': s, 'dark': dark_color(s)} if s else None


# --- .sketch reading ---------------------------------------------------------
def color_str(c, SW):
    if not c:
        return None
    a = c.get("alpha", 1)
    r = round(c.get("red", 0) * 255); g = round(c.get("green", 0) * 255); b = round(c.get("blue", 0) * 255)
    return f"rgba({r}, {g}, {b}, {round(a,3)})"

def fills_of(layer, SW):
    st = layer.get("style", {})
    return [color_str(f.get("color"), SW) for f in st.get("fills", []) if f.get("isEnabled", True)]

def opacity_of(layer):
    return layer.get("style", {}).get("contextSettings", {}).get("opacity")

def find_master(page, name):
    found = []
    def rec(l):
        if l.get("_class") == "symbolMaster" and l.get("name") == name:
            found.append(l)
        for ch in l.get("layers", []):
            rec(ch)
    rec(page)
    return found[0] if found else None

def circle_group(master):
    for ch in master.get("layers", []):
        if ch.get("name") == "Radio Button":
            return ch
    return None

def inner_dot(group):
    for ch in group.get("layers", []):
        if ch.get("name") in ("Dot", "Dash"):
            fr = ch.get("frame", {})
            return {'shape': 'dot' if ch.get("name") == "Dot" else 'dash',
                    'w': round(fr.get("width", 0), 2), 'h': round(fr.get("height", 0), 2),
                    'fill': both(fills_of(ch, None)[0]) if fills_of(ch, None) else None}
    return None

def label_text(master, SW):
    res = []
    def rec(l):
        if l.get("_class") == "text":
            s = l.get("attributedString", {})
            attrs = s.get("attributes", [{}])[0].get("attributes", {})
            font = attrs.get("MSAttributedStringFontAttribute", {}).get("attributes", {})
            col = color_str(attrs.get("MSAttributedStringColorAttribute"), SW)
            res.append((font.get("name"), font.get("size"), col))
        for ch in l.get("layers", []):
            rec(ch)
    rec(master)
    return res[0] if res else (None, None, None)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('sketch')
    ap.add_argument('--out')
    args = ap.parse_args()

    z = zipfile.ZipFile(args.sketch)
    page = json.loads(z.read(f"pages/{PAGE}.json"))
    SW = None  # swatch names not needed for token values (we keep resolved rgba)

    tokens = {
        'source': args.sketch.split('/')[-1],
        'component': 'radio',
        'note': ('Radio Button (Toggles page). Composite row = circle child group '
                 '"Radio Button" + label. Circle radius = fully-round (height/2). '
                 'Unchecked = gray group fill (black 5% -> white 5% dark), no border '
                 'layer in kit. Checked = accent 100% fill (#0088FF -> #0091FF) with '
                 'white center dot ~40% of circle. Disabled checked = accent 50% + '
                 'group opacity 0.5; disabled unchecked = black 4%. Inactive (window '
                 'blurred) checked = gray fill + gray dot. Mixed = white dash bar.'),
        'diameter': {},      # circle diameter per size
        'dot': {},           # inner dot diameter per size
        'font': {}, 'fontSize': {},
        'bySize': {},
    }

    for tok, name in SIZE_TOK.items():
        sz = name
        unm = f"Radio Button/Content Area/{tok_full(tok)}/Active, Unchecked - 1 - Idle"
        cnm = f"Radio Button/Content Area/{tok_full(tok)}/Active, Checked - 1 - Idle"
        udis = f"Radio Button/Content Area/{tok_full(tok)}/Active, Unchecked - 4 - Disabled"
        cdis = f"Radio Button/Content Area/{tok_full(tok)}/Active, Checked - 4 - Disabled"

        mu = find_master(page, unm); mc = find_master(page, cnm)
        if not mu or not mc:
            continue
        gu = circle_group(mu); gc = circle_group(mc)
        gud = circle_group(find_master(page, udis)) if find_master(page, udis) else None
        gcd = circle_group(find_master(page, cdis)) if find_master(page, cdis) else None

        diameter = round(gu.get("frame", {}).get("width", 0), 2)
        dot = inner_dot(gc)
        font, fontsize, labelcol = label_text(mu, SW)

        tokens['diameter'][sz] = diameter
        tokens['dot'][sz] = dot['w'] if dot else None
        tokens['font'][sz] = font
        tokens['fontSize'][sz] = fontsize

        uf = fills_of(gu, SW); cf = fills_of(gc, SW)
        udf = fills_of(gud, SW) if gud else []
        cdf = fills_of(gcd, SW) if gcd else []

        tokens['bySize'][sz] = {
            'diameter': diameter,
            'dotDiameter': dot['w'] if dot else None,
            'uncheckedFill': both(uf[0]) if uf else None,
            'checkedFill': both(cf[0]) if cf else None,
            'dotFill': dot['fill'] if dot else None,
            'disabledUncheckedFill': both(udf[0]) if udf else None,
            'disabledCheckedFill': both(cdf[0]) if cdf else None,
            'disabledOpacity': opacity_of(gcd) if gcd else None,
            'label': {'font': font, 'fontSize': fontsize, 'color': both(labelcol)},
        }

    text = json.dumps(tokens, indent=2, ensure_ascii=False)
    if args.out:
        open(args.out, 'w').write(text)
        print(f"wrote {len(tokens['bySize'])} sizes -> {args.out}")
        for sz in SIZE_ORDER:
            d = tokens['bySize'].get(sz)
            if d:
                print(f"  {sz:6} circle={d['diameter']} dot={d['dotDiameter']} "
                      f"unchecked={d['uncheckedFill']['light'] if d['uncheckedFill'] else '-'} "
                      f"checked={d['checkedFill']['light'] if d['checkedFill'] else '-'}")
    else:
        print(text)


def tok_full(tok):
    n = {'Mn': '1 Mn', 'Sm': '2 Sm', 'Md': '3 Md', 'Lg': '4 Lg', 'XL': '5 XL'}
    return n[tok]


if __name__ == '__main__':
    main()
