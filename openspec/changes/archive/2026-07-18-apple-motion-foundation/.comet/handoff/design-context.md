# Comet Design Handoff

- Change: apple-motion-foundation
- Phase: design
- Mode: compact
- Context hash: 1700b9717dfa50b407a40d64b319f2e0fed279668a62a4a9bdb527c232eb9ce7

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/apple-motion-foundation/proposal.md

- Source: openspec/changes/apple-motion-foundation/proposal.md
- Lines: 1-28
- SHA256: 56c847ac03796925d8fbcd3865c014690d48689dba906e2b7aa89787c7966113

```md
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
```

## openspec/changes/apple-motion-foundation/design.md

- Source: openspec/changes/apple-motion-foundation/design.md
- Lines: 1-78
- SHA256: 3cc67a89318a6ba85f7cabe2bc79aa5f04b0a0ce757a59f07efa929eb44434bd

```md
## Context

Acrylic UI is a shadcn/ui **registry**: components are copied into consumer projects, so every dependency a component declares is inherited by consumers. The library is complete on material/color (`--acr-*` tokens across `light`/`dark`/`acrylic`) but has no motion model — overlays use `tw-animate-css` fixed keyframes driven by Radix `data-state`. Apple's *Designing Fluid Interfaces* establishes that fluid motion must (a) respond on pointer-down, (b) track 1:1, (c) be interruptible from the live on-screen value, (d) hand off release velocity, and (e) project momentum. Fixed CSS keyframes satisfy none of the gesture cases. This design introduces motion as a first-class, tokenized layer and validates it on Sheet before any broad refactor.

Emil Kowalski's `apple-design` skill (emilkowalski/skills) is the philosophy source. It is *general* (any web UI); acrylic-ui is *one registry*. The design keeps that separation rather than copying the philosophy into the registry's own rules.

## Goals / Non-Goals

**Goals:**
- A tokenized spring system whose numbers drive both a zero-dependency CSS path and a JS path, so both tiers share one physics.
- Zero new runtime cost for components that don't need gestures; gesture power available opt-in where it earns its place.
- Accessibility (reduced-motion / reduced-transparency / contrast) baked into the token layer, not per-component.
- Size-correct typography tokens (tracking + leading vary with size).
- One fully-converted reference component (Sheet) proving the contract end-to-end.
- Skill knowledge structured so the general philosophy is *referenced* and the acrylic-specific conventions are *authored fresh*.

**Non-Goals:**
- Refactoring components other than Sheet (each is a later change).
- Replacing Radix primitives or altering their focus-trap/scroll-lock/ARIA behavior.
- Changing the Tauri vibrancy mechanism.
- Making Motion a default dependency of the registry.

## Decisions

### D1 — Tiered substrate: CSS `linear()` default + Motion opt-in
CSS spring easing (`linear()`) is the default for enter/exit and hover on all components; the JS spring library **Motion** (Framer Motion's successor, tree-shakeable) is an opt-in `registryDependency` only on gesture-driven components.
- *Why not CSS-only:* CSS transitions animate to a fixed target and cannot restart from the live presentation value, carry velocity, or track a finger — exactly the interruptibility/handoff Apple calls essential (§3, §5). CSS-only buys the spring *look*, not the *feel*.
- *Why not JS-everywhere:* a registry must not force a runtime animation dependency onto every consumer for a component (Card, Badge, Tooltip) that only needs a 200ms enter. Opt-in isolates the cost.
- *Result:* the common case stays dependency-free; the hard case (drag, swipe-to-dismiss) gets real physics.

### D2 — Spring tokens are dual-form, generated from one source
Each preset is defined once by `(damping, response)` and emitted in two shapes:
- `--acr-spring-<name>`: a CSS `linear()` easing string (≈24 sampled stops of the spring's normalized position) usable directly in `transition`.
- `--acr-spring-<name>-damping` / `--acr-spring-<name>-response`: the raw numbers Motion consumes (mapped to Motion's `bounce`/`duration`).
A build-time helper (`scripts/gen-springs.*`) samples the damped-spring ODE and writes the `linear()` strings into `acrylic.css`, so the curve and the numbers never drift. Presets (from Apple's shipped values):

| token | damping | response | use |
|---|---|---|---|
| `--acr-spring-default` | 1.0 | 0.4 | reposition / most UI, no overshoot |
| `--acr-spring-drawer` | 0.8 | 0.3 | sheets / drawers |
| `--acr-spring-bounce` | 0.8 | 0.4 | momentum/flick, deliberate overshoot |

Default UI is critically damped; overshoot is reserved for gesture-carried momentum.

### D3 — Skill knowledge split by generality
- `references/apple-motion.md`: a trimmed, attributed copy of the general philosophy (springs, interruptibility, velocity handoff, momentum, the eight principles). Marked "source: emilkowalski/skills, adapted" — inherited knowledge, version-pinned and offline, like the skill already inherits shadcn rules.
- `rules/motion.md`: authored fresh — the acrylic delta. Owns the spring tokens, the D1 tiering rule, per-component motion recipes, and the accessibility wiring. `materials.md`/`components.md`/`SKILL.md` cross-link it. This avoids two sources of truth for things acrylic already implements (materials §12, typography §15 stay owned by `materials.md`, citing the principle).

### D4 — Sheet architecture: Radix underneath, Motion as a drag overlay
Keep `@radix-ui` Dialog/Sheet primitives for a11y (focus trap, scroll lock, `aria-*`, ESC). Layer motion on top:
- Enter/exit: drive the panel transform with a Motion spring (drawer preset) from the live value, replacing the keyframe classes; Radix `forceMount` + presence so exit isn't cut off.
- Drag: Pointer Events via Motion's drag on the panel, axis-locked to the sheet's edge, 1:1 with grab offset; rubber-band past the closed bound.
- Release: project the endpoint with Apple's decay `current + (v/1000)·d/(1−d)`; if projected past the dismiss threshold (or velocity sign says dismiss) → animate closed handing off velocity, else spring back open.
- Scrim: opacity tied to drag progress (dim to focus).
- *Alternative considered:* a pure-CSS sheet with `linear()` + touch handlers — rejected, no velocity handoff, reversal "brick wall."

### D5 — Typography tokens gain tracking + leading companions
For each `--text-<size>` add `--text-<size>-tracking` and `--text-<size>-leading`. Large display sizes get negative tracking + tight leading; body near `0` tracking + comfortable leading. This modifies the existing `acrylic-theme` type-scale requirement rather than adding a new capability.

### D6 — Accessibility at the token layer
Three `@media` blocks in `acrylic.css`: `prefers-reduced-motion: reduce` (springs/slides → opacity cross-fade, `transform:none`), `prefers-reduced-transparency: reduce` (raise surface opacity, drop blur), `prefers-contrast: more` (near-solid surfaces + defined border). Components inherit; Sheet also guards its JS path on `matchMedia('(prefers-reduced-motion: reduce)')`.

## Risks / Trade-offs

- `linear()` spring approximation imperfect / older-browser support → Mitigation: `linear()` is baseline-supported in current evergreens; sample density (~24 stops) keeps error sub-perceptual; a `cubic-bezier` fallback via `@supports not (...)` for the enter/exit case.
- Motion adds bundle weight to Sheet consumers → Mitigation: opt-in only, tree-shakeable import (`motion/react`), documented in the Sheet install note.
- Radix presence + Motion drag can fight over unmount timing → Mitigation: `forceMount` the content and own exit in Motion's `AnimatePresence`, let Radix own only a11y/state.
- Gesture + focus-trap/scroll-lock interaction on touch → Mitigation: verify swipe-to-dismiss keeps scroll lock and returns focus; test in the pilot before generalizing.
- Two spring definitions (CSS vs JS) drifting → Mitigation: single generator (D2); the numbers are the source, the `linear()` is emitted.

## Migration Plan

Additive only. New tokens/media blocks append to `acrylic.css`; Sheet stays API-compatible (shadcn Sheet surface unchanged). Registry rebuild re-emits `r/sheet.json` with the added `motion` dependency. Rollback = revert the change; no consumer breakage since nothing else adopts Motion and the CSS tokens are unused until referenced. Work is isolated in the `worktree-apple-motion` branch for review before merge.

## Open Questions

- Exact `linear()` stop count and whether to ship a `cubic-bezier` fallback or rely on baseline `linear()` — resolve empirically during build (visual diff).
- Whether the global app stylesheet (`app/globals.css` or equivalent) mirrors the registry token additions or imports them — confirm during build by inspecting the app's CSS entry.
```

## openspec/changes/apple-motion-foundation/tasks.md

- Source: openspec/changes/apple-motion-foundation/tasks.md
- Lines: 1-42
- SHA256: 94c5d86b32f73cbd07d12a2db7098c44bcadbcbf3d2b464f05be8bae82a1436c

```md
# Tasks — apple-motion-foundation

## 1. Spring token foundation

- [ ] 1.1 Write `scripts/gen-springs.mjs` that samples the damped-spring ODE for each preset `(damping, response)` and emits a CSS `linear()` string (~24 stops), with a `--supports not(linear())` cubic-bezier fallback value
- [ ] 1.2 Generate the three presets — `default` (1.0/0.4), `drawer` (0.8/0.3), `bounce` (0.8/0.4) — and insert `--acr-spring-<name>` (linear) + `--acr-spring-<name>-damping` / `--acr-spring-<name>-response` (raw numbers) into `registry/acrylic/acrylic.css`
- [ ] 1.3 Confirm the tokens are theme-independent (defined once, not per light/dark/acrylic) and documented inline in the CSS

## 2. Typography tracking + leading tokens

- [ ] 2.1 Add `--text-<size>-tracking` and `--text-<size>-leading` companions for every existing `--text-*` size in `acrylic.css` (negative tracking + tight leading for large sizes, near-zero + comfortable for body)
- [ ] 2.2 Verify each size token now has a matching tracking and leading value and the values differ across sizes

## 3. Accessibility media blocks

- [ ] 3.1 Add `@media (prefers-reduced-motion: reduce)` block (springs/slides → opacity cross-fade, `transform:none`, overshoot dropped) to `acrylic.css`
- [ ] 3.2 Add `@media (prefers-reduced-transparency: reduce)` block (raise `--acr-surface`/`--acr-panel` opacity, drop blur) 
- [ ] 3.3 Add `@media (prefers-contrast: more)` block (near-solid surfaces + defined contrasting border)
- [ ] 3.4 Mirror the token/media additions into the app global stylesheet if it does not import the registry CSS (confirm which by inspecting the app CSS entry)

## 4. Sheet pilot refactor

- [ ] 4.1 Add `motion` to `registry.json`'s sheet entry `dependencies` and install it in the workspace
- [ ] 4.2 Refactor `registry/acrylic/sheet.tsx`: keep Radix Dialog primitives for a11y, `forceMount` content, drive enter/exit with a Motion spring (drawer preset) from the live value inside `AnimatePresence`, path symmetric to the entry edge
- [ ] 4.3 Add 1:1 axis-locked drag toward the sheet edge with grab-offset respect and rubber-band resistance past the closed bound
- [ ] 4.4 On release, project the endpoint (Apple decay `current + (v/1000)·d/(1−d)`) and hand off velocity: dismiss if projected past threshold / velocity sign says dismiss, else spring back open
- [ ] 4.5 Tie scrim opacity to drag progress (dim to focus)
- [ ] 4.6 Guard the JS motion path on `matchMedia('(prefers-reduced-motion: reduce)')` → direct transition, no velocity animation
- [ ] 4.7 Confirm focus trap, scroll lock, ESC-to-close, and ARIA semantics survive the refactor

## 5. Skill documentation

- [ ] 5.1 Create `references/apple-motion.md` in the acrylic-ui skill — trimmed, attributed copy of the general Apple motion philosophy ("source: emilkowalski/skills, adapted")
- [ ] 5.2 Author `rules/motion.md` — spring tokens, the CSS-vs-Motion tiering rule, per-component motion recipes, accessibility wiring; Incorrect/Correct pairs in the skill's style
- [ ] 5.3 Cross-link from `SKILL.md` (critical-rules index) and add a typography note + link in `rules/materials.md`

## 6. Build, verify, wire-up

- [ ] 6.1 Run `npm run registry:build`; confirm `r/sheet.json` re-emits with the `motion` dependency and the acrylic theme item carries the new tokens
- [ ] 6.2 Build/typecheck the project; confirm no errors introduced
- [ ] 6.3 Drive the Sheet in the running app: verify spring enter/exit, interruptible grab-mid-flight, 1:1 drag, velocity-projected dismiss vs spring-back, scrim dimming, and reduced-motion degradation
- [ ] 6.4 Verify tokens hold in light / dark / acrylic themes (no regression to existing surfaces)
```

## openspec/changes/apple-motion-foundation/specs/acrylic-theme/spec.md

- Source: openspec/changes/apple-motion-foundation/specs/acrylic-theme/spec.md
- Lines: 1-17
- SHA256: e9fe651477a1446dceb7cced6e3f02490a7bd5b211e60e37f66b1ba83e480be7

```md
## ADDED Requirements

### Requirement: Size-specific typography tracking and leading tokens

The macOS type-scale tokens (`--text-*`) SHALL each carry a companion tracking (letter-spacing) token and a companion leading (line-height) token, so tracking and leading vary with size instead of a single fixed value applied across all sizes. Large display sizes SHALL use negative tracking and tight leading; body sizes SHALL use near-zero tracking and comfortable leading. The companions SHALL be usable independently so a component can pair a size with its matching tracking and leading.

#### Scenario: Display text tightens as it grows
- **WHEN** a component styles large-title text using the large-title size token and its companion tracking/leading tokens
- **THEN** it renders with negative letter-spacing and tight line-height appropriate to that size

#### Scenario: Body text stays comfortable
- **WHEN** a component styles body text using the body size token and its companion tracking/leading tokens
- **THEN** it renders with near-zero letter-spacing and a comfortable line-height

#### Scenario: Tracking is no longer size-independent
- **WHEN** two different type sizes are rendered with their respective companion tokens
- **THEN** their tracking values differ, so no single fixed letter-spacing is imposed across sizes
```

## openspec/changes/apple-motion-foundation/specs/component-motion/spec.md

- Source: openspec/changes/apple-motion-foundation/specs/component-motion/spec.md
- Lines: 1-81
- SHA256: 98251f110fc25393bc177353d4db1d387b4cb03a2a063367a7c047f2bfff0032

[TRUNCATED]

```md
## ADDED Requirements

### Requirement: Spring motion tokens with dual CSS/JS form

The theme SHALL define a set of spring motion tokens, each derived from a single `(damping, response)` pair and exposed in two forms: a CSS `linear()` easing value usable directly in a `transition`, and the raw `damping` and `response` numbers a JS spring library can consume. The two forms of a given token SHALL describe the same physical spring so that CSS-driven and JS-driven motion match. At minimum the set SHALL include a critically-damped default preset, a drawer/sheet preset, and a momentum/bounce preset.

#### Scenario: CSS transition uses a spring token
- **WHEN** a component sets `transition-timing-function: var(--acr-spring-default)`
- **THEN** the transition eases along the sampled spring curve (no fixed cubic-bezier), producing spring-like motion without any JS runtime

#### Scenario: JS spring reads the same token numbers
- **WHEN** a gesture-driven component animates with the JS spring library using `--acr-spring-drawer`'s damping and response numbers
- **THEN** its motion matches the CSS `linear()` form of the same token within perceptual tolerance

#### Scenario: Presets encode Apple's damping discipline
- **WHEN** a default (non-gesture) UI element animates with the default preset
- **THEN** it is critically damped with no overshoot; and the bounce preset (used only for momentum-carried gestures) overshoots deliberately

### Requirement: Tiered motion substrate

Enter/exit and hover motion on components SHALL use the CSS spring tokens by default and SHALL NOT require a JS animation runtime. A JS spring library SHALL be introduced only as an opt-in registry dependency on components that need gesture physics, and SHALL NOT be a default dependency of the registry or of non-gesture components.

#### Scenario: Non-gesture component stays dependency-free
- **WHEN** a component whose only motion is enter/exit or hover is installed from the registry
- **THEN** installing it adds no JS animation-library dependency, and its motion is driven purely by CSS spring tokens

#### Scenario: Gesture component opts into the JS library
- **WHEN** a gesture-driven component (e.g. Sheet) is installed from the registry
- **THEN** the JS spring library is declared as that component's own dependency, isolated to it

### Requirement: Gesture interaction contract

A gesture-driven component SHALL respond on pointer-down (not on release), track the pointer 1:1 while respecting the grab offset, remain interruptible so an in-flight animation can be grabbed and reversed from its live on-screen value, hand off the pointer's release velocity to the settling animation, and project momentum from release velocity to choose the resting state. At boundaries it SHALL resist progressively (rubber-band) rather than stopping hard.

#### Scenario: Immediate, continuous feedback
- **WHEN** the user presses and drags the component
- **THEN** visual feedback begins on pointer-down and the element tracks the pointer 1:1 throughout the drag, not only at release

#### Scenario: Interruptible in-flight
- **WHEN** the user grabs the element while it is animating
- **THEN** the new motion starts from the element's current on-screen value with no visible jump, and can be reversed

#### Scenario: Velocity handoff and momentum projection
- **WHEN** the user releases mid-drag with velocity
- **THEN** the settling animation continues at the release velocity and snaps to the state nearest the projected endpoint, so a flick can commit a gesture a slow drag would not

#### Scenario: Rubber-band at the boundary
- **WHEN** the user drags past the component's boundary
- **THEN** resistance increases with distance instead of a hard stop

### Requirement: Motion respects accessibility preferences

The theme SHALL bake reduced-motion, reduced-transparency, and increased-contrast handling into the token layer so components inherit it. Under `prefers-reduced-motion: reduce`, spring/slide/parallax motion SHALL degrade to a short opacity cross-fade with overshoot removed while comprehension-aiding opacity/color changes are kept. Under `prefers-reduced-transparency: reduce`, translucent surfaces SHALL become frostier/solid (raised background opacity, blur dropped). Under `prefers-contrast: more`, surfaces SHALL be near-solid with a defined contrasting border. Gesture components SHALL additionally guard their JS motion path on the reduced-motion signal.

#### Scenario: Reduced motion degrades gracefully
- **WHEN** `prefers-reduced-motion: reduce` is set
- **THEN** a component that would spring or slide instead cross-fades with no overshoot, and gesture components skip velocity-driven animation in favor of a direct transition

#### Scenario: Reduced transparency solidifies surfaces
- **WHEN** `prefers-reduced-transparency: reduce` is set
- **THEN** frosted surfaces raise their background opacity and drop `backdrop-filter` blur, remaining legible

#### Scenario: Increased contrast defines edges
- **WHEN** `prefers-contrast: more` is set
- **THEN** surfaces render near-solid with a defined contrasting border

### Requirement: Sheet realizes the motion contract

The Sheet component SHALL be the reference adopter of this capability: it SHALL animate enter and exit with a spring (drawer preset) from the live value along a path symmetric with its entry edge, support 1:1 drag toward its edge with rubber-band resistance past the closed bound, dismiss or spring back on release based on projected momentum with velocity handoff, dim its scrim in proportion to drag progress, and preserve the underlying primitive's focus trap, scroll lock, ESC-to-close, and ARIA semantics.

#### Scenario: Spring enter and exit
- **WHEN** the Sheet opens and later closes
- **THEN** the panel springs in from its edge and exits back along the same edge, interruptibly, not via a fixed keyframe

#### Scenario: Swipe to dismiss
- **WHEN** the user drags the open Sheet toward its edge and releases with enough projected momentum
- **THEN** the Sheet continues at the release velocity and closes; and if the projected momentum is insufficient it springs back open

#### Scenario: Accessibility preserved under gesture
- **WHEN** the Sheet is opened, dragged, and dismissed
```

Full source: openspec/changes/apple-motion-foundation/specs/component-motion/spec.md

