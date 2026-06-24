#!/usr/bin/env python3
"""Shape the universal raw master dump into a condensed Sidebar token set.

    sketch_tokens.py extract <sketch> Sidebars --out raw.json
    shape_sidebar.py raw.json --out tokens/sidebar.json

Sidebar taxonomy: Sidebar/{Size}/{Area}/{Level - State}.
  Size  = Large | Medium | Small         -> the 3 density sizes (240px wide, all)
  Area  = Items | Folders | Header        -> Items = leaf rows, Folders = group/
          disclosure rows, Header = section label.
  Level = Level 0..4                      -> nesting depth (indent grows per level)
  State = Default | Selected | Disabled   -> resting = Default.

The selection fill is NOT in the flattened master (the kit paints the selection
pill on a sub-layer, so the master fill reads as the plain white row bg). macOS
selects a sidebar row with the accent colour (active window) on a rounded pill,
white text -> wire the Selected state to --primary / --primary-foreground.
The row 'leading' is the text x-offset (icon + gaps before the label): Items have
an icon only; Folders also carry a disclosure triangle, so they lead wider.
"""
import argparse, json, re

SIZE_ORDER = ['large', 'medium', 'small']
SIZE_KEY = {'Large': 'large', 'Medium': 'medium', 'Small': 'small'}


def parse(s):
    m = re.match(r'rgba\((\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\)', s)
    return (int(m[1]), int(m[2]), int(m[3]), float(m[4]))


def rgba(rgb, a):
    return f"rgba({rgb[0]}, {rgb[1]}, {rgb[2]}, {round(a, 3)})"


def dark_color(s):
    if not s:
        return s
    r, g, b, a = parse(s)
    if (r, g, b) == (255, 255, 255):
        return rgba((255, 255, 255), 0.09) if a == 1 else rgba((255, 255, 255), round(a * 0.85 + 0.04, 3))
    if (r, g, b) == (0, 0, 0):                # black-opacity label/secondary -> white-opacity
        return rgba((255, 255, 255), a)
    if (r, g, b) == (0, 122, 255):
        return rgba((0, 145, 255), a)
    return s


def col(c):
    return {'light': c, 'dark': dark_color(c)} if c else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('raw'); ap.add_argument('--out')
    args = ap.parse_args()
    raw = json.load(open(args.raw))

    # size -> area -> level -> state -> master  (top-level Sidebar/{Size}/... only)
    by = {}
    for m in raw['masters']:
        segs = m.get('segments', [])
        if len(segs) < 3 or segs[0] != 'Sidebar' or segs[1] not in SIZE_KEY:
            continue
        sz = SIZE_KEY[segs[1]]
        area = segs[2]                              # Items | Folders | Header
        if area == 'Header':
            by.setdefault(sz, {}).setdefault('Header', {})['_'] = m
            continue
        lvl_state = segs[3] if len(segs) > 3 else ''  # "Level 0 - Default"
        mt = re.match(r'Level (\d+) - (\w+)', lvl_state)
        if not mt:
            continue
        lvl, state = int(mt.group(1)), mt.group(2)
        by.setdefault(sz, {}).setdefault(area, {}).setdefault(lvl, {})[state] = m

    tokens = {
        'source': raw.get('source'), 'component': 'sidebar',
        'width': 240,
        'note': ('macOS sidebar. 240px wide (all sizes). 3 density sizes drive row '
                 'height + font: large 40/15, medium 32/13, small 24/11. Rows: Items '
                 '(leaf, icon lead) and Folders (group, disclosure+icon lead, deeper). '
                 'Header = section label (black 50%, smaller). Label text black 85% '
                 '(small 77%). Selection fill is NOT in the kit master (painted on a '
                 'sub-layer) -> wire Selected to --primary pill + white text; hover to '
                 '--acr-hover. Per-level indent grows ~ one step; folderLeading/'
                 'itemLeading are the text x-offsets read off the kit.'),
        'bySize': {},
    }

    for sz in SIZE_ORDER:
        a = by.get(sz, {})
        items = a.get('Items', {})
        folders = a.get('Folders', {})
        header = a.get('Header', {}).get('_')

        def rest(area_map, lvl):
            d = area_map.get(lvl, {})
            return d.get('Default') or d.get('Selected') or d.get('Disabled')

        item0 = rest(items, 0)
        fold0 = rest(folders, 0)
        fold1 = rest(folders, 1)
        if not item0:
            continue
        it = item0.get('text') or {}
        ht = (header or {}).get('text') or {}
        ft0 = (fold0 or {}).get('text') or {}
        ft1 = (fold1 or {}).get('text') or {}

        # per-level indent step: folder Lvl0 lead - Lvl1 lead is tiny; the real
        # nesting step is the gap the kit applies per level. Read off as L0->L1 delta
        # of the *folder* leading, fall back to a sensible macOS-ish 14.
        step = None
        if ft0.get('paddingX') is not None and ft1.get('paddingX') is not None:
            step = abs(ft0['paddingX'] - ft1['paddingX']) or None

        tokens['bySize'][sz] = {
            'rowHeight': item0['height'],
            'fontSize': it.get('fontSize'),
            'font': it.get('font'),
            'labelColor': col(it.get('color')),
            'itemLeading': it.get('paddingX'),       # icon + gaps before label
            'folderLeading': ft0.get('paddingX'),    # disclosure + folder icon + gaps
            'indentStep': step,
            'header': {
                'height': (header or {}).get('height'),
                'fontSize': ht.get('fontSize'),
                'color': col(ht.get('color')),
                'leading': ht.get('paddingX'),
            } if header else None,
        }

    text = json.dumps(tokens, indent=2, ensure_ascii=False)
    if args.out:
        open(args.out, 'w').write(text)
        print(f"wrote {len(tokens['bySize'])} sizes -> {args.out}")
        for sz in SIZE_ORDER:
            d = tokens['bySize'].get(sz)
            if d:
                print(f"  {sz:6} h={d['rowHeight']} fs={d['fontSize']} "
                      f"itemLead={d['itemLeading']} folderLead={d['folderLeading']} "
                      f"hdr={d['header']['fontSize'] if d['header'] else '-'}")
    else:
        print(text)


if __name__ == '__main__':
    main()
