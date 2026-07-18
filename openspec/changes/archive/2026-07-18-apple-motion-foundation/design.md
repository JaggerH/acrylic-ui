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
