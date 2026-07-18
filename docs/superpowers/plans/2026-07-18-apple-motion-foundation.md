---
change: apple-motion-foundation
design-doc: docs/superpowers/specs/2026-07-18-apple-motion-foundation-design.md
base-ref: ed569012c5bbc402ae2e81084b2e4ac4ad1f0c2b
---

# Implementation Plan — Apple Motion Foundation

Execution order follows dependency: tokens first (nothing depends on Sheet), then Sheet, then docs, then build/verify. Each numbered stage = one commit. Full detail in the design doc; this plan is the executable checklist with acceptance per stage.

## Stage 1 — Spring generator + tokens (tasks 1.1–1.3)

1. Write `scripts/gen-springs.mjs`: pure Node, no deps. Exports/prints `linear()` strings from `(damping, response)` by sampling the damped-spring position (critical vs under-damped formulas from design §1), ~24 stops, plus prints the raw damping/response. CLI: `node scripts/gen-springs.mjs` → emits a CSS block to stdout.
2. Run it, capture the three preset blocks, and insert `--acr-spring-{default,drawer,bounce}` (+ `-damping`/`-response`) into the shared `:root` type-scale block near the bottom of `registry/acrylic/acrylic.css`, with the `@supports not(linear())` cubic-bezier fallback.
3. Mirror the same block into `app/global.css` (docs-site mirror).

**Accept**: `node scripts/gen-springs.mjs` runs clean; both CSS files contain the three spring tokens at `:root` (theme-independent); values are `linear(...)`; fallback block present.

## Stage 2 — Typography companions (tasks 2.1–2.2)

1. In both `acrylic.css` and `app/global.css`, extend the `:root` type-scale block: add `--text-<size>-tracking` + `--text-<size>-leading` for all 9 sizes per the design §2 table.

**Accept**: every `--text-<size>` has a matching `-tracking` and `-leading`; tracking values differ across sizes (grep check).

## Stage 3 — Accessibility media blocks (tasks 3.1–3.4)

1. Append the three `@media` blocks (reduced-motion, reduced-transparency, prefers-contrast) to `acrylic.css` and `app/global.css`, per design §3, refined against real values.

**Accept**: three `@media` blocks present in both files; reduced-motion neutralizes the spring vars.

## Stage 4 — Sheet pilot refactor (tasks 4.1–4.7)

1. `npm i motion` (workspace) and add `"motion"` to the sheet entry's `dependencies` in `registry.json`.
2. Rewrite `registry/acrylic/sheet.tsx` per design §4: `AnimatePresence` + `forceMount`, `motion.div` panel driven by drawer spring from live value; drag axis-locked with rubber-band; `onDragEnd` momentum projection + velocity handoff → dismiss or spring-back; scrim opacity from drag offset; `usePrefersReducedMotion` guard. Keep all Radix a11y and the public API identical.
3. Add a `usePrefersReducedMotion` helper (inline in sheet.tsx or a tiny hook file).

**Accept**: typecheck passes; Sheet API unchanged (Sidebar mobile off-canvas still compiles); drive-in-app shows spring/interrupt/drag/dismiss/scrim/reduced-motion (Stage 6).

## Stage 5 — Skill documentation (tasks 5.1–5.3)

1. `references/apple-motion.md` — trimmed, attributed adaptation of the general philosophy (author into the change repo under `docs/skill/` staging, then copy to the installed skill dir `~/.claude/skills/acrylic-ui/references/`).
2. `rules/motion.md` — acrylic delta: tokens, tiering, Sheet recipe, a11y, Incorrect/Correct pairs.
3. Cross-link `SKILL.md` critical-rules index + `rules/materials.md` typography note.

**Accept**: both files exist and are complete; SKILL.md + materials.md link them.

## Stage 6 — Build + verify (tasks 6.1–6.4)

1. `npm run registry:build` (`shadcn build`) → confirm `r/sheet.json` gains `motion`, theme item carries new tokens.
2. `npm run types:check` (or `tsc --noEmit`) → no new errors.
3. Drive Sheet in the running app; verify the six behaviors + light/dark/acrylic regression.

**Accept**: build + typecheck clean; in-app behaviors confirmed; no token regression.

## Review gate

Before the build→verify guard, load `requesting-code-review` and review the diff; fix any CRITICAL findings.
