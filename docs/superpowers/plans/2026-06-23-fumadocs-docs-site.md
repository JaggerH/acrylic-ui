---
change: fumadocs-docs-site
design-doc: openspec/changes/fumadocs-docs-site/design.md
base-ref: fe84ba4
archived-with: 2026-06-23-fumadocs-docs-site
---

# Plan — Acrylic Fumadocs docs site

Execution plan for `openspec/changes/fumadocs-docs-site`. Mirrors `tasks.md`, adds
sequencing + a verification checkpoint per phase. Strategy: **vertical slice first**
(get one component fully working end-to-end through the new pipeline), then fan out.

## Phase 1 — Scaffold (tasks 1.x)
Bootstrap the Fumadocs shadcn template into the repo root; keep `registry/`,
`registry.json`, `acrylic.css` untouched. Wire Tailwind v4 + `acrylic.css` as the
global stylesheet (verify `--acr-*` win over Fumadocs tokens). Reproduce dark/light.

**Checkpoint:** `pnpm dev` serves a Fumadocs site with one placeholder doc page; the
frosted surfaces render with our tokens; theme toggle flips.

## Phase 2 — Registry build + hosting (tasks 2.x)
Move `registry/acrylic/*` into the app tree; keep `registry.json` paths valid;
`shadcn build` → `public/r/*.json`; app serves them.

**Checkpoint:** `public/r/button.json` is produced and fetchable at `/r/button.json`
from the running app.

## Phase 3 — Live-preview vertical slice (tasks 3.x) — THE proof
`button-demo` example item + file; `__registry__` codegen (name → lazy import +
source string) in the build; `<ComponentPreview name>` (Preview + Code tabs);
author the Button MDX page end-to-end.

**Checkpoint:** `/docs/components/button` routes, shows live Preview + real source in
Code, appears in the sidebar. This validates the whole pipeline before fan-out.

## Phase 4 — Migrate the 8 components (tasks 4.x)
MDX pages (alphabetical) for alert-dialog, auto-textarea, button, dialog,
glass-card, input, toaster + a Theme/Tokens page; one example each; props/variants
tables; sidebar alphabetical + active; TOC per page.

**Checkpoint:** every component page renders Preview/Code; sidebar complete &
alphabetical.

## Phase 5 — Remove Vite + cleanup (tasks 5.x)
Delete `demo/`, `vite.config.ts`, `index.html`; drop Vite deps + `pnpm demo`; update
README + `.gitignore`.

**Checkpoint:** no Vite references remain; `pnpm dev` is the Next app.

## Phase 6 — Verify (tasks 6.x)
All pages render with working Preview/Code/routing/sidebar/TOC; dark/light re-themes
all previews; registry build emits all `public/r/*.json` and the app serves them
(`npx shadcn add @acrylic/button` resolves locally); a throwaway test component
appears with zero framework/config edits (then reverted).

**Exit:** all tasks.md checked, committed per-task, build/dev verified.
