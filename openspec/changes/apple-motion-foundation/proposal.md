## Why

Acrylic UI is a complete *material* system (the macOS-26 look) but has almost no *motion* system (the feel). Overlays animate with fixed `tw-animate-css` keyframes, which — per Apple's fluid-interface guidance — cannot be grabbed, reversed mid-flight, or hand off a gesture's velocity, so interactions feel scripted rather than physical. This change lays the motion foundation (spring tokens + conventions) and proves it end-to-end on one gesture-driven component, so later phases can refactor the rest against a settled contract.

## What Changes

- Add a **spring-token layer** to the theme (`--acr-spring-*`): each token is a dual form — a CSS `linear()` easing curve for zero-dependency transitions, plus the raw `damping,response` numbers a JS spring library consumes — so the CSS curve and the JS spring are the same physics.
- Establish a **tiered motion substrate**: CSS spring easing is the dependency-free default for enter/exit + hover on every component; a JS spring library (Motion) is pulled in as an **opt-in `registryDependency`** only on genuinely gesture-driven components. No existing component gains a runtime dependency by default.
- Wire the **accessibility signals** into the theme CSS: `prefers-reduced-motion` (cross-fade, drop overshoot), `prefers-reduced-transparency` (frostier/solid surfaces), `prefers-contrast` (near-solid + defined border).
- Extend the **type scale tokens** with size-specific `tracking` (letter-spacing) and `leading` (line-height) companions — a fixed letter-spacing is wrong at some size; large text wants negative tracking and tight leading, body near zero.
- Refactor **Sheet** as the pilot adopter: spring-based interruptible enter/exit (CSS tier) + 1:1 drag with velocity-projected swipe-to-dismiss and rubber-band resistance (Motion tier) + scrim dimming, honoring reduced-motion.
- Add skill documentation: a new critical-rules file `rules/motion.md` (the acrylic motion delta — tokens, tiering, per-component recipes) and a referenced companion `references/apple-motion.md` (the general Apple motion philosophy, adapted from emilkowalski/skills), with `materials.md`/`components.md` cross-linking it.

## Capabilities

### New Capabilities
- `component-motion`: the spring/gesture motion system — spring tokens and their dual CSS/JS form, the CSS-vs-JS tiering rule, reduced-motion/transparency/contrast behavior, and the gesture contract (pointer-down response, 1:1 tracking, interruptibility, velocity handoff, momentum projection, rubber-banding) that Sheet realizes as the first adopter.

### Modified Capabilities
- `acrylic-theme`: the design-token system gains size-specific typography tracking/leading companions to the existing macOS type scale, so tracking is no longer a single fixed value across all sizes.

## Impact

- **Tokens/CSS**: `registry/acrylic/acrylic.css` (+ `app/` global stylesheet mirror if present) gains `--acr-spring-*`, `--text-*-tracking`/`--text-*-leading`, and the three accessibility `@media` blocks.
- **Components**: `registry/acrylic/sheet.tsx` refactored; new dependency `motion` added to Sheet's `registry.json` entry only.
- **Registry**: `registry.json` Sheet entry gains `motion` in `dependencies`; `npm run registry:build` re-emits `r/sheet.json`.
- **Skill**: new `rules/motion.md`, new `references/apple-motion.md`, edits to `SKILL.md` (critical-rules index) + `rules/materials.md` (typography cross-link).
- **Consumers**: opt-in only — components other than Sheet keep zero JS animation runtime; existing APIs unchanged (Sheet stays API-compatible with shadcn Sheet).
