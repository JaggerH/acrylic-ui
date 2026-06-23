#!/usr/bin/env python3
"""Shape the raw Forms dump + the Example Forms artboard into a layout token doc.

    sketch_tokens.py extract <sketch> "Forms" --out form_raw.json
    shape_form.py form_raw.json --sketch <sketch> --out tokens/form.json

A macOS "Form" is a LAYOUT, not a control. It maps to shadcn/ui's Field family
(Field, FieldLabel, FieldDescription, FieldGroup, FieldSet, FieldError). The
interesting tokens are spacing + typography, NOT fills.

The page's 10 symbolMasters are only leading-accessory building blocks (disclosure
chevron, icon backgrounds, sidebar/service icons) — they do NOT carry the row
layout. The row anatomy lives in the `Forms/Example Forms` artboard:

    Form (group)
      Row (group)            <- a Field: label + control on one baseline
        Leading (group)      <- FieldLabel (+ optional leading icon, + Subtitle)
        Trailing (group)     <- the control (Input/Toggle/Stepper/Button/…)
      Separator (rectangle)  <- 1px hairline between rows
      Row …

Measured constants (from form_measure.py / form_detail.py over both example forms):
  - row content inset:        10px from the form group edges (rows & separators at x=10,w=440 in a 460 form)
  - row-to-row edge gap:      21px of whitespace between adjacent rows (1px separator centered → ~10px above + ~10px below)
  - separator:                1px hairline, inset 10px both sides
  - label↔control:            same row baseline; Trailing right-aligned; label is leading. Form variant reserves a 30px trailing accessory column.
  - leading icon→label gap:   8px (for 24/32px icons; 18px disclosure chevron carries its own padding → 0)
  - label typography:         SF Pro Medium 13, primary #1A1A1A (secondary/disabled #727272)
  - title→subtitle gap:       2px
  - subtitle (description):   SF Pro 11 (Medium or Regular), gray #727272
  - error/validation:         NOT present in the kit (0 hits / 40 strings); derived = reuse destructive token.

Light→dark color map is kit-general (see references/sketch-format.md):
  #1A1A1A → #F5F5F5 (near-black → near-white), gray #727272 stays (mid gray reads in both),
  separator black 0.1 → white 0.1, destructive #FF383C → #FF4245.
"""
import argparse, json, zipfile

# --- kit-general light→dark for the few colors a Form uses ---------------------
DARK = {
    "rgba(26, 26, 26, 1)": "rgba(245, 245, 245, 1)",     # primary label
    "rgba(114, 114, 114, 1)": "rgba(152, 152, 152, 1)",  # secondary/description gray
    "rgba(0, 0, 0, 0.1)": "rgba(255, 255, 255, 0.1)",    # separator hairline
    "rgba(0, 0, 0, 0.05)": "rgba(255, 255, 255, 0.05)",  # separator hairline (measured)
    "rgba(255, 56, 60, 1)": "rgba(255, 66, 69, 1)",      # destructive
}
def dark(c):
    if c is None:
        return None
    # generic rule: a raw black-with-alpha Fills/Light token flips to white at same alpha
    if c in DARK:
        return DARK[c]
    if c.startswith("rgba(0, 0, 0, ") and not c.endswith(", 1)"):
        return c.replace("rgba(0, 0, 0,", "rgba(255, 255, 255,")
    return c

PAGE = "FBEC33FE-F369-4BDD-BB22-C7CD70651D5B"

def fr(l):
    f = l.get("frame", {})
    return (f.get("x", 0), f.get("y", 0), f.get("width", 0), f.get("height", 0))

def text_attrs(l):
    s = l.get("attributedString", {})
    string = s.get("string", "")
    a = (s.get("attributes", [{}]) or [{}])[0].get("attributes", {})
    font = a.get("MSAttributedStringFontAttribute", {}).get("attributes", {})
    c = a.get("MSAttributedStringColorAttribute", {})
    color = None
    if c:
        color = (f"rgba({round(c.get('red',0)*255)}, {round(c.get('green',0)*255)}, "
                 f"{round(c.get('blue',0)*255)}, {round(c.get('alpha',1),3)})")
    return string, font.get("name"), font.get("size"), color


def measure(sketch):
    """Re-derive the layout constants straight from the artboard so the token
    doc is self-checking, not hand-copied."""
    with zipfile.ZipFile(sketch) as z:
        page = json.loads(z.read(f"pages/{PAGE}.json"))
    forms = []
    for top in page.get("layers", []):
        if "Example Forms" in top.get("name", ""):
            for win in top.get("layers", []):
                if win.get("name") == "Window":
                    for g in win.get("layers", []):
                        if g.get("name") == "Form":
                            forms.append(g)
    rows, seps = [], []
    for form in forms:
        for c in form.get("layers", []):
            if c.get("name") == "Row":
                rows.append((form, c))
            elif c.get("name") == "Separator":
                seps.append(c)

    # row inset + separator
    sep = seps[0]
    sx, sy, sw, sh = fr(sep)
    sep_color = None
    for b in sep.get("style", {}).get("borders", []) or []:
        pass
    # separator color comes from its fill
    for fl in sep.get("style", {}).get("fills", []) or []:
        cc = fl.get("color", {})
        sep_color = (f"rgba({round(cc.get('red',0)*255)}, {round(cc.get('green',0)*255)}, "
                     f"{round(cc.get('blue',0)*255)}, {round(cc.get('alpha',1),3)})")
        break

    # row edge gaps (whitespace between adjacent rows) per form
    edge_gaps = []
    for form in forms:
        rs = sorted([c for c in form.get("layers", []) if c.get("name") == "Row"],
                    key=lambda r: fr(r)[1])
        prev = None
        for r in rs:
            x, y, w, h = fr(r)
            if prev is not None:
                edge_gaps.append(round(y - prev, 1))
            prev = y + h
    common_gap = max(set(edge_gaps), key=edge_gaps.count) if edge_gaps else None

    # title->subtitle gap + typography catalogue
    title_sub_gap = None
    catalog = {}

    def scan(layer):
        nonlocal title_sub_gap
        if layer.get("_class") == "text":
            s, fn, sz, col = text_attrs(layer)
            if s and not s.startswith("\U00100000") and "\\U" not in repr(s)[:4]:
                key = (fn, sz, col)
                catalog.setdefault(key, set())
                if len(catalog[key]) < 5 and len(s) < 30 and ord(s[0]) < 0x3000:
                    catalog[key].add(s)
        if layer.get("_class") == "group" and layer.get("name") in ("Text", "Stack"):
            texts = sorted([c for c in layer.get("layers", []) if c.get("_class") == "text"],
                           key=lambda t: fr(t)[1])
            if len(texts) >= 2:
                ty, th = fr(texts[0])[1], fr(texts[0])[3]
                gap = round(fr(texts[1])[1] - (ty + th), 1)
                if title_sub_gap is None:
                    title_sub_gap = gap
        for c in layer.get("layers", []):
            scan(c)

    for form in forms:
        scan(form)

    # leading icon -> label gap (form with icons): take the modal 8px
    icon_gaps = []
    for form in forms:
        for r in [c for c in form.get("layers", []) if c.get("name") == "Row"]:
            lead = next((c for c in r.get("layers", []) if c.get("name") == "Leading"), None)
            if not lead:
                continue
            icon = next((c for c in lead.get("layers", []) if c.get("_class") == "symbolInstance"), None)
            lbl = None
            for c in lead.get("layers", []):
                if c.get("_class") == "text":
                    lbl = c; break
                if c.get("_class") == "group":
                    t = next((x for x in c.get("layers", []) if x.get("_class") == "text"), None)
                    if t:
                        lbl = t; break
            if icon and lbl:
                g = round(fr(lbl)[0] - (fr(icon)[0] + fr(icon)[2]), 1)
                if g > 0:
                    icon_gaps.append(g)
    icon_gap = max(set(icon_gaps), key=icon_gaps.count) if icon_gaps else None

    return {
        "rowInset": sx, "separatorThickness": sh, "separatorWidth": sw,
        "separatorColor": sep_color, "rowEdgeGap": common_gap,
        "titleSubtitleGap": title_sub_gap, "leadingIconGap": icon_gap,
        "typography": {f"{fn}|{sz}|{col}": sorted(s) for (fn, sz, col), s in catalog.items()},
    }


def font_role(fn, sz):
    return {"font": fn, "fontSize": sz}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("raw")
    ap.add_argument("--sketch", required=True, help="path to the .sketch for artboard re-measure")
    ap.add_argument("--out")
    args = ap.parse_args()
    raw = json.load(open(args.raw))
    m = measure(args.sketch)

    # leading-accessory building blocks from the masters dump
    M = {x["name"].split("/")[-1]: x for x in raw["masters"]}
    def accessory(key, friendly):
        x = M.get(key)
        if not x:
            return None
        return {"name": friendly, "width": x["width"], "height": x["height"],
                "radius": x["radius"], "radiusRaw": x["radiusRaw"]}

    label_primary = font_role("SFPro-Medium", 13)
    label_primary.update(color_light="rgba(26, 26, 26, 1)", color_dark=dark("rgba(26, 26, 26, 1)"))
    label_secondary = font_role("SFPro-Medium", 13)
    label_secondary.update(color_light="rgba(114, 114, 114, 1)", color_dark=dark("rgba(114, 114, 114, 1)"))
    description = font_role("SFPro-Regular", 11)
    description.update(color_light="rgba(114, 114, 114, 1)", color_dark=dark("rgba(114, 114, 114, 1)"))

    tokens = {
        "source": raw.get("source"),
        "component": "form",
        "mapsTo": "shadcn/ui Field family (Field, FieldLabel, FieldDescription, FieldGroup, FieldSet, FieldError)",
        "note": (
            "A macOS Form is a LAYOUT wrapper, not a control. Each Field = one Row: a "
            "leading label column + a trailing control, sharing one baseline, with a 1px "
            "hairline separator and uniform vertical rhythm between rows. Tokens are "
            "spacing + typography. The 10 page masters are only leading accessories "
            "(disclosure chevron, icon backgrounds, sidebar/service icons) — the row "
            "layout was measured from the Example Forms artboard."
        ),

        # --- Field row anatomy ------------------------------------------------
        "fieldRow": {
            "mapsTo": "Field (orientation=horizontal)",
            "layout": "label leading, control trailing on one baseline (space-between)",
            "labelAlignment": "leading",         # left-aligned label, right-aligned control
            "controlAlignment": "trailing",
            "rowContentInset": m["rowInset"],     # 10px L/R inside the form group
            "rowEdgeGap": m["rowEdgeGap"],        # 21px whitespace between rows (separator centered)
            "labelToControlGap": "space-between (label & control occupy opposite ends of the row width)",
            "trailingAccessoryColumn": 30,        # form-style reserves a 30px trailing chevron/info column
            "rowHeights": [16, 24, 30, 32, 92],   # 16 single-line; taller when control or stacked text grows
        },

        # --- typography -------------------------------------------------------
        "fieldLabel": {"mapsTo": "FieldLabel", "alignment": "leading", **label_primary},
        "fieldLabelSecondary": {"mapsTo": "FieldLabel (muted/disabled)", **label_secondary},
        "fieldDescription": {
            "mapsTo": "FieldDescription (the macOS 'Subtitle')",
            "titleToDescriptionGap": m["titleSubtitleGap"],   # 2px below the label
            "alignment": "leading",
            **description,
        },
        "fieldError": {
            "mapsTo": "FieldError",
            "note": "NOT present in the macOS kit (0/40 strings carried validation copy). "
                    "Derived: same metrics as FieldDescription, recolored to the kit destructive red.",
            "font": "SFPro-Regular", "fontSize": 11,
            "color_light": "rgba(255, 56, 60, 1)", "color_dark": dark("rgba(255, 56, 60, 1)"),
        },

        # --- group / section --------------------------------------------------
        "fieldGroup": {
            "mapsTo": "FieldGroup / FieldSet",
            "note": "rows are stacked and visually divided by a 1px hairline separator; "
                    "the group is the rounded container window the rows sit in.",
            "separator": {
                "thickness": m["separatorThickness"],
                "inset": m["rowInset"],
                "color_light": m["separatorColor"],
                "color_dark": dark(m["separatorColor"]),
            },
            "rowGap": m["rowEdgeGap"],
        },

        # --- leading accessories (optional icon before the label) -------------
        "leadingAccessories": {
            "note": "optional symbol/icon rendered before the FieldLabel.",
            "iconToLabelGap": m["leadingIconGap"],   # 8px
            "disclosure": accessory("Expanded", "disclosure chevron (expanded)") or
                          accessory("Collapsed", "disclosure chevron"),
            "iconBackgroundGray": accessory("Gray", "icon background (gray, concentric)"),
            "sidebarIconRound": accessory("Image Icon Round", "sidebar icon (circular)"),
            "sidebarIconRoundedCorner": accessory("Image Icon Rounded Corner", "sidebar icon (rounded corner)"),
            "serviceIcon32": accessory("Service Icon 32pt", "service icon 32pt"),
            "serviceIcon24": accessory("Service Icon 24pt", "service icon 24pt"),
        },

        "_measured": m,
    }

    text = json.dumps(tokens, indent=2, ensure_ascii=False)
    if args.out:
        open(args.out, "w").write(text)
        print(f"wrote form tokens -> {args.out}")
        print(f"  rowEdgeGap={m['rowEdgeGap']}  separator={m['separatorThickness']}px inset={m['rowInset']}")
        print(f"  label=SFPro-Medium 13 #1A1A1A  description=SFPro 11 #727272  title→sub gap={m['titleSubtitleGap']}")
        print(f"  leading icon→label gap={m['leadingIconGap']}")
    else:
        print(text)


if __name__ == "__main__":
    main()
