# Motion — springs, tiering & gesture (acrylic-specific)

The material is the *look*; motion is the *feel*. Acrylic's motion follows Apple's
fluid-interface model — the general "why" is [../references/apple-motion.md](../references/apple-motion.md)
(inherited from emilkowalski/skills). This file is the acrylic **delta**: the actual
tokens, the CSS-vs-JS tiering rule, and the per-component recipes. It derives from
`registry/acrylic/acrylic.css` (spring tokens) and `registry/acrylic/sheet.tsx`
(the reference gesture component) — follow them exactly.

## Contents

- Spring tokens (`--acr-spring-*`) — dual CSS/JS form, generated
- The tiered substrate: CSS `linear()` default, Motion opt-in
- The gesture contract (what a draggable acrylic component must do)
- Accessibility is at the token layer (reduced motion/transparency/contrast)
- Typography tracking/leading companions
- Sheet — the reference recipe

---

## Spring tokens — never hand-pick a duration/easing

Motion values flow through `--acr-spring-*`, defined once (theme-independent —
physics, not color) in `acrylic.css` and **generated** by `scripts/gen-springs.mjs`
from a single `(damping, response)` pair per preset. Each preset is dual-form:

- `--acr-spring-<name>` — a CSS `linear()` easing (the spring *shape*, set by the
  damping ratio). Pair it with the matching `--acr-spring-<name>-duration`.
- `--acr-spring-<name>-damping` / `-response` / `-bounce` — the raw numbers a JS
  spring library (Motion) consumes (`bounce ≈ 1 − damping`, `duration = response`).

The two forms describe the **same physical spring**, so CSS-driven and JS-driven
motion match. Presets (from Apple's shipped values):

| token | damping | response | use |
|---|---|---|---|
| `--acr-spring-default` | 1.0 | 0.4 | most UI — critically damped, **no overshoot** |
| `--acr-spring-drawer` | 0.8 | 0.3 | sheets / drawers |
| `--acr-spring-bounce` | 0.8 | 0.4 | momentum/flick — deliberate overshoot |

**Default is critically damped. Reserve overshoot (`bounce`) for gesture-carried
momentum** — a flick, a throw, a drag release. Overshoot on a menu that just faded
in feels wrong.

❌ **Incorrect** — hand-picked duration + ad-hoc easing:
```css
transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
```

✅ **Correct** — the spring tokens:
```css
transition-property: transform;
transition-duration: var(--acr-spring-drawer-duration);
transition-timing-function: var(--acr-spring-drawer);
```

Two presets with equal damping (drawer, bounce) share a `linear()` curve and differ
only in duration — that's expected; the curve encodes damping, the duration encodes
response. Never hand-edit the generated `linear()` values — rerun `gen-springs.mjs`.

## Tiered substrate — CSS by default, Motion opt-in

Enter/exit and hover use the **CSS spring tokens** and add **no JS runtime**. Pull in
`motion` (the JS spring lib) **only** on components that need real gesture physics,
and declare it as *that component's own* `registryDependency` — never a default dep
of the registry or of a non-gesture component.

- **CSS tier** (default): Card, Dialog, Popover, Tooltip, Badge… → `transition` with
  `var(--acr-spring-*)`. Zero runtime.
- **Motion tier** (opt-in): components with drag/swipe/momentum → Sheet today; later
  Slider, Switch, Stepper as their refactors land.

❌ **Incorrect** — reaching for Motion to fade a Popover in:
```tsx
import { motion } from "motion/react"   // adds a runtime dep for a 200ms fade
```

✅ **Correct** — CSS tier for non-gesture motion; Motion only where a finger drives it.

## The gesture contract

A gesture-driven acrylic component MUST: respond on pointer-down (not release);
track 1:1 respecting the grab offset; stay interruptible (animate from the **live**
value, grabbable mid-flight); hand off release velocity to the settling spring;
project momentum to pick the resting state; and rubber-band at boundaries instead of
stopping hard. Radix primitives stay underneath for a11y — Motion only owns *how it
moves*. Use Apple's projection: `projected = current + (v/1000)·d/(1−d)`, `d ≈ 0.998`.

## Accessibility is baked into the tokens

`acrylic.css` ships three `@media` blocks so components inherit a11y for free:
- `prefers-reduced-motion: reduce` → the spring curves collapse to `linear(0,1)` and
  durations shorten (no overshoot, no vestibular slide). Gesture components **also**
  guard their JS path with `matchMedia('(prefers-reduced-motion: reduce)')` (see
  `usePrefersReducedMotion` in sheet.tsx) — opacity/direct instead of velocity fling.
- `prefers-reduced-transparency: reduce` → frosted surfaces go near-solid + blur
  dropped.
- `prefers-contrast: more` → near-solid surfaces + defined contrasting border.

Never re-implement these per component — they already resolve through the tokens.

## Typography tracking + leading

Each `--text-<size>` now carries `--text-<size>-tracking` (letter-spacing) and
`--text-<size>-leading` (line-height). **Tracking is size-specific** — a single fixed
`letter-spacing` is wrong at some size. Large display text tightens (negative);
body sits near `0`. Pair a size with its own companions.

❌ **Incorrect** — one letter-spacing across sizes:
```tsx
<h1 className="text-[26px] tracking-[-0.02em]">…</h1>
<span className="text-[11px] tracking-[-0.02em]">…</span>   // too tight for 11px
```

✅ **Correct** — the size's own companion:
```tsx
<h1 style={{ fontSize: "var(--text-largetitle)", letterSpacing: "var(--text-largetitle-tracking)", lineHeight: "var(--text-largetitle-leading)" }}>…</h1>
```

## Sheet — the reference recipe

`registry/acrylic/sheet.tsx` is the first Motion-tier component; copy its shape when
adding gesture components:

- **Radix Dialog stays** for focus trap / scroll lock / ESC / ARIA. A
  controlled/uncontrolled bridge exposes `open` to the content so the **exit animates
  before unmount** (`forceMount` + a `rendered` gate).
- **One motion value** for the panel's axis position (`0` open, `sign*size` closed).
  Motion's `drag` writes the *same* value, so drag and programmatic `animate()` never
  fight. Enter/exit `animate()` from the live value → interruptible.
- **Drag** axis-locked toward the edge, `dragConstraints` pinning the open direction
  to `0` with `dragElastic` for rubber-band; `dragMomentum: false` (we project
  ourselves).
- **Release** projects the endpoint and hands velocity into the close spring
  (dismiss) or springs back to `0` (snap back), decided by projected distance/sign.
- **Scrim** opacity is a `useTransform` of the panel offset — dims to focus.
- Install note for consumers: Sheet pulls in `motion` (opt-in); other components
  don't.
