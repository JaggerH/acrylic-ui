#!/usr/bin/env python3
"""Extract design tokens from a Sketch (.sketch) UI kit.

A .sketch file is a ZIP of JSON. This tool reads it WITHOUT Sketch installed.

Subcommands
-----------
  pages   <file.sketch>
      List every page name + id. Page names carry SF-Symbol glyph prefixes
      (e.g. "﷈ Buttons") — match on the trailing word.

  explore <file.sketch> <page-id-or-name>
      Print the symbolMaster taxonomy of a page: every master name decomposed
      into "/"-segments, plus the distinct values per segment position. Use this
      to discover a component's variant/size/state dimensions before extracting.

  extract <file.sketch> <page-id-or-name> [--out tokens.json]
      Emit one record per symbolMaster with FULLY-RESOLVED visual params:
      frame, padding, radius (+ raw sentinel + style), fills, borders, text,
      and the parsed name segments. Component-agnostic and always faithful.
      Shaping this raw dump into a condensed variant x size token matrix
      (and any light->dark mapping) is left to the caller — see SKILL.md.

Sketch gotchas baked in here (see references/sketch-format.md):
  * Button-type controls have NO shape layers — the background is fills painted
    directly on the symbolMaster frame.
  * Corner radius lives in style.corners.radii (MSImmutableStyleCorners),
    NOT in cornerRadius / fixedRadius. radii value 100 = "fully rounded"
    sentinel => resolve to height/2 (capsule / circle).
  * Colors reference shared swatches by swatchID -> resolve via
    document.json -> sharedSwatches.
"""
import argparse, json, re, sys, zipfile
from collections import defaultdict

SIZE_TOKENS = {'Mn': 'mini', 'Sm': 'small', 'Md': 'medium', 'Lg': 'large', 'XL': 'xl'}
STATE_WORDS = ('Idle', 'Hover', 'Clicked', 'Pressed', 'Disabled', 'Focused')


# ---------------------------------------------------------------- sketch io
def open_sketch(path):
    return zipfile.ZipFile(path)

def load(z, name):
    return json.loads(z.read(name))

def swatch_table(z):
    """do_objectID -> swatch name, for resolving swatchID color references."""
    doc = load(z, 'document.json')
    out = {}
    for s in (doc.get('sharedSwatches') or {}).get('objects', []):
        out[s.get('do_objectID')] = s.get('name')
    return out

def page_index(z):
    """page-id -> name (name has glyph prefix)."""
    meta = load(z, 'meta.json')
    return meta.get('pagesAndArtboards', {})

def _strip_glyph(name):
    # page names are "<sf-symbol-glyph> Name"; drop leading non-letters
    return re.sub(r'^[^A-Za-z]+', '', name or '').strip()

def resolve_page_id(z, key):
    pa = page_index(z)
    if key in pa:                                   # exact id
        return key
    k = key.lower()
    exact = [pid for pid, info in pa.items() if _strip_glyph(info.get('name', '')).lower() == k]
    if len(exact) == 1:
        return exact[0]
    subs = [(pid, info.get('name')) for pid, info in pa.items() if k in (info.get('name', '') or '').lower()]
    if len(subs) == 1:
        return subs[0][0]
    if subs:
        cand = '; '.join(f"{_strip_glyph(n)}" for _, n in subs)
        raise SystemExit(f"page {key!r} is ambiguous, matches: {cand}. Use the exact name or page-id.")
    raise SystemExit(f"page not found: {key!r}. Run `pages` to list.")


# ---------------------------------------------------------------- colors
def rgba_str(c):
    if not c:
        return None
    return (f"rgba({round(c.get('red',0)*255)}, {round(c.get('green',0)*255)}, "
            f"{round(c.get('blue',0)*255)}, {round(c.get('alpha',1),3)})")


# ---------------------------------------------------------------- master extract
def find_text(layer):
    if layer.get('_class') == 'text':
        return layer
    for c in layer.get('layers', []) or []:
        r = find_text(c)
        if r:
            return r
    return None

def extract_master(m, SW):
    fr = m.get('frame', {}) or {}
    h = round(fr.get('height', 0))
    style = m.get('style') or {}

    def fill_info(f):
        if not f.get('isEnabled'):
            return None
        c = f.get('color', {})
        cs = f.get('contextSettings', {}) or {}
        return {'color': rgba_str(c), 'swatch': SW.get(c.get('swatchID')),
                'blendMode': cs.get('blendMode', 0), 'opacity': round(cs.get('opacity', 1), 3)}

    def border_info(b):
        if not b.get('isEnabled'):
            return None
        c = b.get('color', {})
        return {'color': rgba_str(c), 'swatch': SW.get(c.get('swatchID')),
                'thickness': b.get('thickness'), 'position': b.get('position')}

    corners = style.get('corners') or {}
    radii = corners.get('radii')
    radius_raw = radii[0] if radii else None
    radius = (round(h / 2) if radius_raw == 100 else radius_raw) if radius_raw is not None else None

    rec = {
        'name': m.get('name', ''),
        'segments': [s.strip() for s in m.get('name', '').split('/')],
        'width': round(fr.get('width', 0)),
        'height': h,
        'radius': radius,
        'radiusRaw': radius_raw,            # 100 = fully-rounded sentinel
        'cornerStyle': corners.get('style'),
        'prefersConcentric': corners.get('prefersConcentric'),
        'padding': {'top': m.get('topPadding'), 'right': m.get('rightPadding'),
                    'bottom': m.get('bottomPadding'), 'left': m.get('leftPadding')},
        'fills': [x for x in (fill_info(f) for f in (style.get('fills') or [])) if x],
        'borders': [x for x in (border_info(b) for b in (style.get('borders') or [])) if x],
        'text': None,
    }
    t = find_text(m)
    if t:
        attr = t.get('attributedString') or {}
        msa = attr.get('attributes') or []
        font = size = color = None
        if msa:
            at = msa[0].get('attributes', {})
            fa = at.get('MSAttributedStringFontAttribute', {}).get('attributes', {})
            font, size = fa.get('name'), fa.get('size')
            color = rgba_str(at.get('MSAttributedStringColorAttribute'))
        tfr = t.get('frame', {}) or {}
        rec['text'] = {'string': attr.get('string'), 'font': font, 'fontSize': size,
                       'color': color, 'paddingX': round(tfr.get('x', 0))}
    return rec

def iter_masters(page):
    out = []
    def walk(l):
        if l.get('_class') == 'symbolMaster':
            out.append(l)
        for c in l.get('layers', []) or []:
            walk(c)
    for l in page.get('layers', []) or []:
        walk(l)
    return out


# ---------------------------------------------------------------- name parsing helpers
def parse_size(segments):
    for s in segments:
        m = re.match(r'[1-9]\s+(Mn|Sm|Md|Lg|XL)', s)
        if m:
            return SIZE_TOKENS[m.group(1)]
    return None

def parse_state(name):
    return next((w for w in STATE_WORDS if w in name), None)


# ---------------------------------------------------------------- commands
def cmd_pages(args):
    z = open_sketch(args.sketch)
    for pid, info in page_index(z).items():
        print(f"{pid}  ::  {info.get('name')}")

def cmd_explore(args):
    z = open_sketch(args.sketch)
    pid = resolve_page_id(z, args.page)
    page = load(z, f'pages/{pid}.json')
    masters = iter_masters(page)
    by_pos = defaultdict(set)
    for m in masters:
        for i, seg in enumerate(s.strip() for s in m.get('name', '').split('/')):
            by_pos[i].add(seg)
    print(f"page {pid}: {len(masters)} symbolMasters")
    print("\n=== distinct values per name-segment position ===")
    for i in sorted(by_pos):
        vals = sorted(by_pos[i])
        head = vals if len(vals) <= 12 else vals[:12] + [f'... (+{len(vals)-12})']
        print(f"  seg[{i}] ({len(vals)}): {head}")
    print("\n=== sizes detected ===", sorted({parse_size([s.strip() for s in m['name'].split('/')]) for m in masters} - {None}))
    print("=== states detected ===", sorted({parse_state(m['name']) for m in masters} - {None}))

def cmd_extract(args):
    z = open_sketch(args.sketch)
    pid = resolve_page_id(z, args.page)
    page = load(z, f'pages/{pid}.json')
    SW = swatch_table(z)
    masters = iter_masters(page)
    records = [extract_master(m, SW) for m in masters]
    out = {'source': args.sketch.split('/')[-1], 'page': pid,
           'pageName': page_index(z).get(pid, {}).get('name'),
           'count': len(records), 'masters': records}
    text = json.dumps(out, indent=2, ensure_ascii=False)
    if args.out:
        with open(args.out, 'w') as f:
            f.write(text)
        print(f"wrote {len(records)} masters -> {args.out}")
    else:
        print(text)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True)
    p = sub.add_parser('pages'); p.add_argument('sketch'); p.set_defaults(fn=cmd_pages)
    p = sub.add_parser('explore'); p.add_argument('sketch'); p.add_argument('page'); p.set_defaults(fn=cmd_explore)
    p = sub.add_parser('extract'); p.add_argument('sketch'); p.add_argument('page'); p.add_argument('--out'); p.set_defaults(fn=cmd_extract)
    args = ap.parse_args()
    args.fn(args)


if __name__ == '__main__':
    main()
