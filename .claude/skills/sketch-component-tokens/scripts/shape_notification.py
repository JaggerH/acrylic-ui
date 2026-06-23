#!/usr/bin/env python3
"""Shape the raw Notifications dump into a token doc.

    sketch_tokens.py extract <sketch> "Notifications" --out raw.json
    shape_notification.py <sketch> --out tokens/notification.json

Notification is a COMPOSITE (no variant x size matrix), like Alert / Dialog. The
macOS notification *banner* is the web equivalent of a Sonner toast.

The universal `extract` only surfaces top-level symbolMaster frames, so the actual
banner anatomy (app icon, title, body, timestamp) lives DEEP in the child layer
tree of `Notifications/Light/Single`. This shaper therefore re-reads the .sketch
directly (like shape_dialog.py) to reach the banner internals.

Anatomy (from `Notifications/Light/Single`, 344x78):
  card       radius 16 (cornerStyle 1, concentric off). padding top/bottom 12,
             left 10, right 14.
  material   the background is a SEPARATE `BG` master (instanced into the card):
               Light = white 70% (blendMode 4 = "color burn"-ish frost) over
                       opaque #FAFAFA  -> translucent frosted white
               Dark  = black 40% over opaque #121212 -> translucent frosted dark
             => web: backdrop-blur + semi-opaque surface, exactly the acrylic
             toast material (--acr-toast).
  appIcon    32x32 slot at the left (the app/sender glyph).
  title      SFPro-Bold/13.  Light #1A1A1A, Dark #F5F5F5.
  body       SFPro-Regular/13 ("Description"). same colors as title.
  timestamp  SFPro-Regular/11, top-right.  Light #727272, Dark #8A8A8A.
  thumbnail  optional 32x32 rect (radius 6) trailing slot (image attachment).
  spacing    icon->text gap ~16 (text stack starts x=58 = 10 pad + 32 icon + 16);
             title->body vertical gap 16.
  close      NO persistent X in the kit (banners auto-dismiss / swipe). Sonner's
             closeButton is opt-in; style it as a subtle ghost affordance.
  stacked    a second variant shows a peeking card behind (8px reveal) = Sonner's
             native stacking.

Light -> dark mapping is hard-coded from the kit's own Dark/Single master (we read
both appearances directly here, so no heuristic needed).
"""
import argparse, json, zipfile

PAGE_ID = "E43AD1FB-5C96-46AD-B2B3-30698F639602"


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
        cs = f.get('contextSettings', {}) or {}
        out.append({'color': rgba(f.get('color', {})), 'blendMode': cs.get('blendMode', 0)})
    return out


def find_by_name(layer, name, classes=None):
    if layer.get('name') == name and (classes is None or layer.get('_class') in classes):
        return layer
    for c in layer.get('layers', []) or []:
        r = find_by_name(c, name, classes)
        if r:
            return r
    return None


def _find_suffix(layer, suffix, classes=('symbolMaster',)):
    """Match a symbolMaster whose name ENDS WITH suffix (names carry SF-Symbol
    glyph prefixes whose private-use codepoint we don't want to hardcode)."""
    if (layer.get('name') or '').endswith(suffix) and layer.get('_class') in classes:
        return layer
    for c in layer.get('layers', []) or []:
        r = _find_suffix(c, suffix, classes)
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


def find_text_named(card, name):
    t = find_by_name(card, name, ('text',))
    return text_info(t) if t else {}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('sketch')
    ap.add_argument('--page', default=PAGE_ID)
    ap.add_argument('--out')
    args = ap.parse_args()

    z = zipfile.ZipFile(args.sketch)
    page = json.loads(z.read(f'pages/{args.page}.json'))

    light = find_by_name(page, 'Notifications/Light/Single', ('symbolMaster',))
    dark = find_by_name(page, 'Notifications/Dark/Single', ('symbolMaster',))
    # BG masters carry an SF-Symbol glyph in their name; match on the stable
    # suffix instead of the private-use codepoint.
    bg_light = find_by_name(page, '/BG/Light',
                            ('symbolMaster',)) or _find_suffix(page, '/BG/Light')
    bg_dark = find_by_name(page, '/BG/Dark',
                           ('symbolMaster',)) or _find_suffix(page, '/BG/Dark')
    stacked = find_by_name(page, 'Notifications/Light/Stacked', ('symbolMaster',))

    lfr = light.get('frame') or {}
    lcorners = (light.get('style') or {}).get('corners') or {}
    lradii = lcorners.get('radii')

    # app icon slot
    appicon = find_by_name(light, 'App Icon')
    aifr = (appicon or {}).get('frame') or {}
    # thumbnail/image slot (in the timestamp stack)
    thumb = find_by_name(light, 'Image', ('rectangle',))
    tfr = (thumb or {}).get('frame') or {}
    tcorners = (thumb.get('style') or {}).get('corners') if thumb else None
    tradii = (tcorners or {}).get('radii')

    title_l = find_text_named(light, 'Title')
    body_l = find_text_named(light, 'Description')
    ts_l = find_text_named(light, 'Timestamp')
    title_d = find_text_named(dark, 'Title')
    body_d = find_text_named(dark, 'Description')
    ts_d = find_text_named(dark, 'Timestamp')

    # text stack offset (icon->text gap)
    text_stack = None
    for g in find_all(light, lambda l: l.get('name') == 'Stack'):
        if find_by_name(g, 'Title', ('text',)):
            text_stack = g
            break
    text_x = round((text_stack.get('frame') or {}).get('x', 0)) if text_stack else None

    # title -> body vertical gap (body.y - (title.y + title.h))
    title_layer = find_by_name(light, 'Title', ('text',))
    body_layer = find_by_name(light, 'Description', ('text',))
    title_to_body = None
    if title_layer and body_layer:
        tf = title_layer.get('frame') or {}
        bf = body_layer.get('frame') or {}
        title_to_body = round(bf.get('y', 0) - (tf.get('y', 0) + tf.get('height', 0)))

    # stacked reveal
    stack_reveal = None
    if stacked:
        sfr = stacked.get('frame') or {}
        stack_reveal = round(sfr.get('height', 0) - lfr.get('height', 0))

    tokens = {
        'source': args.sketch.split('/')[-1],
        'component': 'notification',
        'note': ('composite. macOS notification BANNER = web Sonner toast. Card '
                 '344x78 radius 16, frosted translucent material (separate BG '
                 'master: Light white 70% over #FAFAFA; Dark black 40% over '
                 '#121212) => backdrop-blur acrylic surface (--acr-toast). App-icon '
                 '32x32 left slot; Title SFPro-Bold/13; Body SFPro-Regular/13; '
                 'Timestamp SFPro-Regular/11 top-right. NO persistent close X '
                 '(banners auto-dismiss/swipe; Sonner closeButton opt-in). Stacked '
                 'variant peeks the next card 8px = Sonner native stacking.'),
        'card': {
            'width': round(lfr.get('width', 0)),
            'height': round(lfr.get('height', 0)),
            'radius': lradii[0] if lradii else None,
            'radiusRaw': lradii[0] if lradii else None,
            'cornerStyle': lcorners.get('style'),
            'padding': {
                'top': light.get('topPadding'), 'right': light.get('rightPadding'),
                'bottom': light.get('bottomPadding'), 'left': light.get('leftPadding'),
            },
            'material': 'frosted-translucent (backdrop-blur)',
            'fills_light': enabled_fills(bg_light.get('style') or {}) if bg_light else [],
            'fills_dark': enabled_fills(bg_dark.get('style') or {}) if bg_dark else [],
        },
        'appIcon': {
            'present': appicon is not None,
            'width': round(aifr.get('width', 0)) if appicon else None,
            'height': round(aifr.get('height', 0)) if appicon else None,
            'note': 'app/sender glyph slot at left',
        },
        'thumbnail': {
            'present': thumb is not None,
            'width': round(tfr.get('width', 0)) if thumb else None,
            'height': round(tfr.get('height', 0)) if thumb else None,
            'radius': tradii[0] if tradii else None,
            'note': 'optional trailing image-attachment slot',
        },
        'title': {
            'font': title_l.get('font'), 'fontSize': title_l.get('fontSize'),
            'color_light': title_l.get('color'), 'color_dark': title_d.get('color'),
            'weight': 'bold',
        },
        'body': {
            'font': body_l.get('font'), 'fontSize': body_l.get('fontSize'),
            'color_light': body_l.get('color'), 'color_dark': body_d.get('color'),
            'weight': 'regular', 'sample': body_l.get('string'),
        },
        'timestamp': {
            'font': ts_l.get('font'), 'fontSize': ts_l.get('fontSize'),
            'color_light': ts_l.get('color'), 'color_dark': ts_d.get('color'),
            'position': 'top-right', 'sample': ts_l.get('string'),
        },
        'spacing': {
            'iconToText': (text_x - 10 - (round(aifr.get('width', 0)) if appicon else 0)) if text_x is not None else None,
            'textStackX': text_x,
            'titleToBody': title_to_body,
        },
        'closeButton': {
            'present': False,
            'note': 'kit banner has NO persistent X; auto-dismiss / swipe. Sonner '
                    'closeButton is opt-in — render as subtle ghost affordance.',
        },
        'stacked': {
            'reveal': stack_reveal,
            'note': 'peeking next-card reveal (px) = Sonner native stacking',
        },
    }

    text = json.dumps(tokens, indent=2, ensure_ascii=False)
    if args.out:
        open(args.out, 'w').write(text)
        c = tokens['card']
        print(f"wrote notification tokens -> {args.out}")
        print(f"  card {c['width']}x{c['height']} radius={c['radius']} padding={c['padding']}")
        print(f"  material={c['material']}")
        print(f"    light fills={c['fills_light']}")
        print(f"    dark  fills={c['fills_dark']}")
        print(f"  appIcon {tokens['appIcon']['width']}x{tokens['appIcon']['height']} present={tokens['appIcon']['present']}")
        print(f"  title {tokens['title']['font']}/{tokens['title']['fontSize']} L={tokens['title']['color_light']} D={tokens['title']['color_dark']}")
        print(f"  body  {tokens['body']['font']}/{tokens['body']['fontSize']} L={tokens['body']['color_light']} D={tokens['body']['color_dark']}")
        print(f"  timestamp {tokens['timestamp']['font']}/{tokens['timestamp']['fontSize']} L={tokens['timestamp']['color_light']} D={tokens['timestamp']['color_dark']}")
        print(f"  spacing {tokens['spacing']}  close present={tokens['closeButton']['present']}  stacked reveal={tokens['stacked']['reveal']}")
    else:
        print(text)


if __name__ == '__main__':
    main()
