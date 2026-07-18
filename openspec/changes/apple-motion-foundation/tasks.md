# Tasks — apple-motion-foundation

## 1. Spring token foundation

- [x] 1.1 Write `scripts/gen-springs.mjs` that samples the damped-spring ODE for each preset `(damping, response)` and emits a CSS `linear()` string (~24 stops), with a `--supports not(linear())` cubic-bezier fallback value
- [x] 1.2 Generate the three presets — `default` (1.0/0.4), `drawer` (0.8/0.3), `bounce` (0.8/0.4) — and insert `--acr-spring-<name>` (linear) + `--acr-spring-<name>-damping` / `--acr-spring-<name>-response` (raw numbers) into `registry/acrylic/acrylic.css`
- [x] 1.3 Confirm the tokens are theme-independent (defined once, not per light/dark/acrylic) and documented inline in the CSS

## 2. Typography tracking + leading tokens

- [x] 2.1 Add `--text-<size>-tracking` and `--text-<size>-leading` companions for every existing `--text-*` size in `acrylic.css` (negative tracking + tight leading for large sizes, near-zero + comfortable for body)
- [x] 2.2 Verify each size token now has a matching tracking and leading value and the values differ across sizes

## 3. Accessibility media blocks

- [x] 3.1 Add `@media (prefers-reduced-motion: reduce)` block (springs/slides → opacity cross-fade, `transform:none`, overshoot dropped) to `acrylic.css`
- [x] 3.2 Add `@media (prefers-reduced-transparency: reduce)` block (raise `--acr-surface`/`--acr-panel` opacity, drop blur) 
- [x] 3.3 Add `@media (prefers-contrast: more)` block (near-solid surfaces + defined contrasting border)
- [x] 3.4 Mirror the token/media additions into the app global stylesheet if it does not import the registry CSS (confirm which by inspecting the app CSS entry)

## 4. Sheet pilot refactor

- [x] 4.1 Add `motion` to `registry.json`'s sheet entry `dependencies` and install it in the workspace
- [x] 4.2 Refactor `registry/acrylic/sheet.tsx`: keep Radix Dialog primitives for a11y, `forceMount` content, drive enter/exit with a Motion spring (drawer preset) from the live value inside `AnimatePresence`, path symmetric to the entry edge
- [x] 4.3 Add 1:1 axis-locked drag toward the sheet edge with grab-offset respect and rubber-band resistance past the closed bound
- [x] 4.4 On release, project the endpoint (Apple decay `current + (v/1000)·d/(1−d)`) and hand off velocity: dismiss if projected past threshold / velocity sign says dismiss, else spring back open
- [x] 4.5 Tie scrim opacity to drag progress (dim to focus)
- [x] 4.6 Guard the JS motion path on `matchMedia('(prefers-reduced-motion: reduce)')` → direct transition, no velocity animation
- [x] 4.7 Confirm focus trap, scroll lock, ESC-to-close, and ARIA semantics survive the refactor

## 5. Skill documentation

- [x] 5.1 Create `references/apple-motion.md` in the acrylic-ui skill — trimmed, attributed copy of the general Apple motion philosophy ("source: emilkowalski/skills, adapted")
- [x] 5.2 Author `rules/motion.md` — spring tokens, the CSS-vs-Motion tiering rule, per-component motion recipes, accessibility wiring; Incorrect/Correct pairs in the skill's style
- [x] 5.3 Cross-link from `SKILL.md` (critical-rules index) and add a typography note + link in `rules/materials.md`

## 6. Build, verify, wire-up

- [x] 6.1 Run `npm run registry:build`; confirm `r/sheet.json` re-emits with the `motion` dependency and the acrylic theme item carries the new tokens
- [x] 6.2 Build/typecheck the project; confirm no errors introduced
- [x] 6.3 Drive the Sheet in the running app: verify spring enter/exit, interruptible grab-mid-flight, 1:1 drag, velocity-projected dismiss vs spring-back, scrim dimming, and reduced-motion degradation
- [x] 6.4 Verify tokens hold in light / dark / acrylic themes (no regression to existing surfaces)
