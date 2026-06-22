---
comet_change: fumadocs-docs-site
role: technical-design
canonical_spec: openspec
---

## Context

`acrylic-ui` today is a shadcn **registry** (`registry.json` + `registry/acrylic/*` + `acrylic.css`) plus a single-page **Vite** preview (`demo/`) using hand-rolled hash routing. The registry is the durable asset; the demo is throwaway. We are about to add many more components, and the demo format does not scale (no per-component pages, no live Code view, no TOC, no MDX authoring).

shadcn's own docs (`apps/www`) solve this with **one Next.js app** that is simultaneously: the component source tree, the registry build (`shadcn build` → `public/r/*.json`, served by the app), and the Fumadocs (Next.js + MDX) documentation site. Adopting that shape gives a zero-migration path: each new component = source + `registry.json` entry + one MDX page + one example.

Constraints: repo lives on WSL-native ext4 (`~/projects/acrylic-ui`) — fine for Next dev. Components, the `@acrylic/*` install contract, and the macOS-26 token system must not change.

## Goals / Non-Goals

**Goals:**
- One Next.js + Fumadocs app at repo root that is registry source + registry host + docs site.
- Per-component routed pages with sidebar (alphabetical), TOC, and Preview/Code tabs.
- Registry-backed live preview: examples lazy-loaded by name, with source shown in the Code tab.
- Migrate the 8 existing components to MDX pages (with props/variants tables) with no change to component source.
- Adding a future component touches only: component source, `registry.json`, one MDX page, one example file — no framework edits.

**Non-Goals:**
- Redesigning any component (visual/behavioral) — pure move.
- Liquid Glass refraction material (separate later iteration).
- Search, i18n, versioned docs, MDX API auto-generation (can be added later without migration).

## Decisions

### D1 — Single Next.js + Fumadocs app at repo root (vs monorepo)
Mirror shadcn `apps/www`: components, registry build, and docs in one app. **Alternative considered:** pnpm monorepo (`packages/registry` + `apps/docs`) — rejected as over-wired for a solo registry; cross-package source+source-string sharing for the Code tab adds friction. One app is the upstream-proven shape and the lowest-tech-debt.

### D2 — Bootstrap from the official Fumadocs shadcn template (vs greenfield)
Start from `fumadocs-shadcn` (or Vercel Registry Starter) and graft our `registry/acrylic/*` + `acrylic.css` + `registry.json`. **Alternative:** wire Next + Fumadocs by hand — rejected (more pitfalls, drifts from upstream conventions).

### D3 — Live preview via a generated `__registry__` index
A build/codegen step emits `__registry__/index.tsx`: `{ "<example-name>": { component: React.lazy(() => import(".../example")), source: "<raw source string>" } }`. A `<ComponentPreview name="...">` MDX component renders the lazy component (Preview tab) and the source string (Code tab). **Alternative:** import examples directly in each MDX — rejected (no lazy split, no source string for Code tab, repetitive). This matches shadcn.

### D4 — Examples live in the registry as their own items
Each preview example is a small file (e.g. `registry/examples/button-demo.tsx`) registered in `registry.json` and the `__registry__` index. This keeps previews installable/inspectable and keeps the index generated from one source of truth.

### D5 — Theme + tokens unchanged
`acrylic.css` (the macOS-26 `--acr-*` token system, light/dark) is imported as the app's global stylesheet; the existing dark/light toggle is reimplemented as a Fumadocs theme toggle (or kept as a small client component). Tailwind v4 stays.

### D6 — Registry host = docs app
`shadcn build` writes `public/r/*.json`; the Next app serves `public/` statically, so `https://<docs-host>/r/<name>.json` is the registry endpoint. `components.json` consumers point `@acrylic` at that URL. No separate hosting.

## Risks / Trade-offs

- **Next.js + Fumadocs is heavier than Vite** → Accepted: it's the cost of the official, scalable structure the user explicitly chose; dev runs fine on ext4.
- **Tailwind v4 + Fumadocs theme CSS collision** (Fumadocs ships its own tokens) → Mitigation: scope/override with our `--acr-*` tokens; verify the frosted surfaces still read; keep Fumadocs UI chrome neutral.
- **`__registry__` codegen drift** (index out of sync with examples) → Mitigation: generate it as part of the registry build script; never hand-edit.
- **Template churn** (template may bundle opinions we don't want) → Mitigation: strip to essentials after bootstrap; keep only docs + registry plumbing.
- **In-place restructure is destructive** (removing `demo/`, Vite) → Mitigation: it's all committed in git (5 commits); the move is a new change on a branch, reversible.

## Migration Plan

1. Branch. Scaffold the Next + Fumadocs app from the template into the repo root (or a temp dir, then move) without deleting the registry yet.
2. Graft `registry/acrylic/*`, `acrylic.css`, `registry.json`; wire `shadcn build` → `public/r`.
3. Stand up the `__registry__` codegen + `<ComponentPreview>`; add one example (button) end-to-end as the vertical slice.
4. Author the 8 MDX pages (alphabetical) with props/variants tables; one example each.
5. Remove `demo/`, `vite.config.ts`, `index.html`, Vite deps + `pnpm demo`.
6. Verify: dev server, all 8 pages render Preview + Code, registry JSON served, dark/light works.

Rollback: revert the branch; the prior Vite demo + registry remain at the last commit.

## Open Questions

- Exact template: `fumadocs-shadcn` example vs Vercel "Registry Starter" — pick during build by whichever grafts our registry build with least friction.
- Props/variants tables: hand-authored MDX now; auto-generation from types is a later, non-migrating enhancement.
