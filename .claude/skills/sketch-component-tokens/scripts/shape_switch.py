#!/usr/bin/env python3
"""Shape the universal raw master dump into a condensed Switch (Toggle) token set.

    sketch_tokens.py extract <sketch> "Toggles" --out switch_raw.json
    shape_switch.py switch_raw.json --out tokens/switch.json

Toggle taxonomy (Toggles page): Toggles/{Area}/{Size}/{Window},{Value},{State}
  Window: Active | Inactive   Value: Off | On | Mixed   State: 1 Idle/3 Clicked/4 Disabled
No tone/variant axis — just 5 sizes. Resting On = "Active, On, 1 - Idle";
resting Off = "Active, Off, 1 - Idle"; Disabled = "Active, Off, 4 - Disabled".

Track is a capsule (radius = height/2). OFF rail = black 6% (Fills/Light); ON rail
composites to opaque accent #0088FF. The KNOB is a separate `Knob` rectangle child
(read from the raw .sketch, the universal extractor doesn't carry it): a soft white
pill inset 2px (1.5 mini / 3 xl) inside the track, with layered shadows. Knob W>H
(macOS 26 squircle thumb). This shaper re-opens the .sketch to recover the knob.
"""
import argparse, json, re, zipfile

SK = "/mnt/c/Users/Jagger/Downloads/Apple macOS 26 UI Kit.sketch"
PAGE = "01EC0891-3A21-460F-881F-FC0546A9E15A"
SIZE_TOK = {'Mn': 'mini', 'Sm': 'small', 'Md': 'medium', 'Lg': 'large', 'XL': 'xl'}
SIZE_ORDER = ['mini', 'small', 'medium', 'large', 'xl']
SIZE_KEY = {'mini': '1 Mn', 'small': '2 Sm', 'medium': '3 Md', 'large': '4 Lg', 'xl': '5 XL'}

def parse(s):
    m = re.match(r'rgba\((\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\)', s)
    return (int(m[1]), int(m[2]), int(m[3]), float(m[4]))

def rgba(rgb, a):
    return f"rgba({rgb[0]}, {rgb[1]}, {rgb[2]}, {round(a,3)})"

# light -> dark (kit-general; see references/sketch-format.md)
def dark_color(s):
    if not s:
        return s
    r, g, b, a = parse(s)
    if (r, g, b) == (255, 255, 255):
        return rgba((255, 255, 255), a)              # white knob stays white
    if (r, g, b) == (0, 0, 0):                       # black-opacity rail -> white-opacity
        return rgba((255, 255, 255), a)
    if (r, g, b) == (0, 136, 255):                   # light accent #0088FF -> dark accent #0091FF
        return rgba((0, 145, 255), a)
    return s

# ---- knob recovery from the raw .sketch ----
def knob_frames():
    z = zipfile.ZipFile(SK)
    page = json.loads(z.read(f"pages/{PAGE}.json"))
    found = {}
    def walk(layer):
        if layer.get("_class") == "symbolMaster":
            found[layer.get("name")] = layer
        for c in layer.get("layers", []):
            walk(c)
    walk(page)
    def knob(master_name):
        m = found.get(master_name)
        if not m:
            return None
        for c in m.get("layers", []):
            if c.get("name") == "Knob":
                return c.get("frame")
        return None
    out = {}
    for sz, key in SIZE_KEY.items():
        off = knob(f"Toggles/Content Area/{key}/Active, Off, 1 - Idle")
        on = knob(f"Toggles/Content Area/{key}/Active, On, 1 - Idle")
        out[sz] = {"off": off, "on": on}
    return out

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

    # size -> state -> master (Toggles type, Content Area)
    by = {}
    for m in raw['masters']:
        if not m['name'].startswith('Toggles/') or 'Content Area' not in m['name']:
            continue
        sz = size_of(m['segments'])
        state = m['segments'][-1]
        by.setdefault(sz, {})[state] = m

    knobs = knob_frames()

    tokens = {
        'source': raw.get('source'), 'component': 'switch',
        'note': ('macOS 26 Toggle. Track = capsule (radius=height/2). OFF rail = '
                 'black 6% (Fills/Light) -> white 6% dark. ON rail composites to opaque '
                 'accent #0088FF -> dark #0091FF. Knob = soft white pill (W>H squircle) '
                 'inset 2px (1.5 mini / 3 xl); travel = onX-offX. 5 macOS control sizes.'),
        'sizes': {sz: {'track': [None, None]} for sz in SIZE_ORDER},
        'bySize': {},
    }
    for sz in SIZE_ORDER:
        states = by.get(sz, {})
        off = states.get('Active, Off, 1 - Idle')
        on = states.get('Active, On, 1 - Idle')
        disabled = states.get('Active, Off, 4 - Disabled')
        if not off or not on:
            continue
        off_fill = off['fills'][0]['color'] if off['fills'] else None
        # ON rail: last enabled fill is the opaque accent base
        on_fill = on['fills'][-1]['color'] if on['fills'] else None
        kf = knobs.get(sz, {})
        koff, kon = kf.get('off'), kf.get('on')
        inset = round(koff['y'], 2) if koff else None
        travel = round(kon['x'] - koff['x'], 2) if (koff and kon) else None
        tokens['sizes'][sz] = {'track': [off['width'], off['height']]}
        tokens['bySize'][sz] = {
            'track': {'w': off['width'], 'h': off['height'], 'radius': off['radius']},
            'knob': {
                'w': round(koff['width'], 2) if koff else None,
                'h': round(koff['height'], 2) if koff else None,
                'inset': inset,
                'travel': travel,
            },
            'trackOff': {'light': off_fill, 'dark': dark_color(off_fill)},
            'trackOn': {'light': on_fill, 'dark': dark_color(on_fill)},
            'knobFill': {'light': 'rgba(255, 255, 255, 1)', 'dark': 'rgba(255, 255, 255, 1)'},
            'disabledTrackOff': ({'light': disabled['fills'][0]['color'],
                                  'dark': dark_color(disabled['fills'][0]['color'])}
                                 if disabled and disabled['fills'] else None),
        }
    text = json.dumps(tokens, indent=2, ensure_ascii=False)
    if args.out:
        open(args.out, 'w').write(text)
        print(f"wrote {len(tokens['bySize'])} sizes -> {args.out}")
        for sz in SIZE_ORDER:
            d = tokens['bySize'].get(sz)
            if d:
                t, k = d['track'], d['knob']
                print(f"  {sz:6} track={t['w']}x{t['h']} r={t['radius']} "
                      f"knob={k['w']}x{k['h']} inset={k['inset']} travel={k['travel']} "
                      f"on={d['trackOn']['light']}")
    else:
        print(text)


if __name__ == '__main__':
    main()
