# Comet Design Handoff

- Change: fumadocs-docs-site
- Phase: design
- Mode: compact
- Context hash: 36cd1025cbff8145eeae7d2aaa7db30109419b6e2fda52417184143928d35204

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/fumadocs-docs-site/proposal.md

- Source: openspec/changes/fumadocs-docs-site/proposal.md
- Lines: 1-30
- SHA256: cf4068e9f1f00af9033a4cb7f0eaba9d3ff7577a7f65f245e39306c7b9b03607

```md
## Why

The current Acrylic preview is a single-page Vite demo with hand-rolled hash routing. It does not scale to the dozens of components planned, and diverges from how component libraries are actually documented. Adopting shadcn's own approach (a Next.js app that is registry source + registry host + Fumadocs docs site, all in one) means every future component is added the same cheap way — source + registry entry + one MDX page + one example — with no migration ever.

## What Changes

- **BREAKING**: Replace the Vite `demo/` app with a Next.js + Fumadocs application at the repo root (mirrors shadcn `apps/www`). The Vite demo, `vite.config.ts`, `index.html`, and `demo/` are removed.
- Stand up Fumadocs (Next.js + MDX): per-component **routed pages** (`/docs/components/<name>`), left **sidebar** nav (alphabetical), right **TOC** (On This Page), and a **Preview / Code** tabbed block per example.
- Keep the registry as the source of truth: the existing 8 components + `acrylic.css` tokens move into the app; `shadcn build` still produces `public/r/*.json`, and the same app **hosts** the registry JSON (registry host == docs site).
- Add a **live-preview mechanism** like shadcn's: a generated `__registry__` index mapping example name → `React.lazy` import + source string, surfaced by a `<ComponentPreview name>` MDX component (Preview tab renders it, Code tab shows the source).
- Migrate all 8 existing components (alert-dialog, auto-textarea, button, dialog, glass-card, input, toaster + theme tokens) to MDX doc pages with a **props / variants table** each; alphabetical order.
- Preserve dark/light theme toggle.
- Bootstrap from the official Fumadocs shadcn example / Vercel Registry Starter rather than greenfield, to stay close to upstream conventions.

## Capabilities

### New Capabilities
- `component-docs`: A Fumadocs (Next.js + MDX) documentation site that renders one routed page per component, with sidebar navigation (alphabetical), table of contents, dark/light theming, and an MDX authoring flow where adding a component requires no framework changes.
- `live-preview`: A registry-backed live preview system — a lazy-loaded example index (name → dynamic import + source) powering a Preview/Code tabbed block — and registry JSON build/hosting served by the same app.

### Modified Capabilities
<!-- none — no existing OpenSpec specs in this fresh repo -->

## Impact

- **Removed**: `demo/`, `vite.config.ts`, `index.html`, Vite/React-plugin deps; the `pnpm demo` script.
- **Added**: Next.js, Fumadocs (`fumadocs-ui`, `fumadocs-mdx`, `fumadocs-core`), MDX content under `content/docs/`, a `__registry__` example index, app routes under `app/`.
- **Moved**: `registry/acrylic/*` and `acrylic.css` into the app's source tree (still the registry build inputs); `registry.json` retained; `public/r/*.json` still emitted and now served by the app.
- **Unchanged**: the component source itself (no redesign), the `@acrylic/*` install contract, the macOS-26 token system.
- **Dev/deploy**: Next dev runs on WSL-native ext4 (`~/projects/acrylic-ui`); deploy target is a single Next app (Vercel-style) that is both the docs and the registry endpoint.
```

## openspec/changes/fumadocs-docs-site/design.md

- Source: openspec/changes/fumadocs-docs-site/design.md
- Lines: 1-71
- SHA256: 86ab225b35464cf2abf00b2d3fc133471fb86cc22b28d2024cc25d4ec3dddfa1

```md
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
```

## openspec/changes/fumadocs-docs-site/tasks.md

- Source: openspec/changes/fumadocs-docs-site/tasks.md
- Lines: 1-38
- SHA256: 23a63c5623989e31655947d6d2f42309c3db713a5c1c8cd84d36e1892a20a377

```md
## 1. Scaffold the Next.js + Fumadocs app

- [ ] 1.1 Branch; bootstrap the Fumadocs shadcn template (or Vercel Registry Starter) into a temp dir; evaluate which grafts our registry build with least friction
- [ ] 1.2 Bring the chosen scaffold to the repo root (Next app: `app/`, `content/docs/`, `mdx-components`, fumadocs config), keeping the existing `registry/`, `registry.json`, `acrylic.css` untouched for now
- [ ] 1.3 Wire Tailwind v4 + `acrylic.css` as the app's global stylesheet; verify the `--acr-*` tokens win over Fumadocs' default theme tokens (frosted surfaces read; chrome neutral)
- [ ] 1.4 Reproduce the dark/light toggle (Fumadocs theme or a small client component flipping `html.dark/.light`); backdrop optional

## 2. Registry build + hosting in the app

- [ ] 2.1 Move `registry/acrylic/*` into the app source tree; keep `registry.json` paths valid
- [ ] 2.2 Wire `shadcn build` → `public/r/*.json`; confirm all current items still emit
- [ ] 2.3 Verify the app serves `public/r/<name>.json` (registry endpoint == docs host)

## 3. Live preview infrastructure (vertical slice)

- [ ] 3.1 Add an `examples` area in the registry; create `button-demo` example item + file
- [ ] 3.2 Implement `__registry__` index codegen (name → `React.lazy` import + raw source string) as part of the build; never hand-edited
- [ ] 3.3 Build the `<ComponentPreview name>` MDX component: Preview tab (lazy live render) + Code tab (source string)
- [ ] 3.4 Author the Button MDX page end-to-end as the slice; confirm Preview renders + Code shows source + page routed + in sidebar

## 4. Migrate the 8 components to MDX pages

- [ ] 4.1 Author MDX pages (alphabetical): alert-dialog, auto-textarea, button, dialog, glass-card, input, toaster — each with title, description, `npx shadcn add @acrylic/<name>`, ≥1 example, and a props/variants table
- [ ] 4.2 Create one example item per component in the registry + index
- [ ] 4.3 Add a "Theme / Tokens" docs page documenting the `--acr-*` macOS-26 token set (light/dark)
- [ ] 4.4 Confirm sidebar is alphabetical with active highlight; TOC present on each page

## 5. Remove the Vite demo + cleanup

- [ ] 5.1 Delete `demo/`, `vite.config.ts`, `index.html`; remove Vite/react-plugin deps and the `pnpm demo` script
- [ ] 5.2 Update README (dev = `pnpm dev` Next; registry usage unchanged) and `.gitignore` as needed

## 6. Verify

- [ ] 6.1 `pnpm dev` runs; all 8 component pages + theme page render with working Preview/Code, routing, sidebar, TOC
- [ ] 6.2 Dark/light toggle re-themes every preview consistently
- [ ] 6.3 Registry build emits all `public/r/*.json` and the app serves them; `npx shadcn add @acrylic/button` resolves against the local host
- [ ] 6.4 Adding a throwaway test component (source + registry item + MDX + example) appears with no framework/config edits — then revert it
```

## openspec/changes/fumadocs-docs-site/specs/component-docs/spec.md

- Source: openspec/changes/fumadocs-docs-site/specs/component-docs/spec.md
- Lines: 1-44
- SHA256: 6e5b1b2ce3372db4bef485294918f663cc1dd8c72529f9de867dec57a3f8cdff

```md
## ADDED Requirements

### Requirement: Per-component routed pages
The docs site SHALL render one routed page per component at a stable path (e.g. `/docs/components/<name>`), so each component is an independently addressable, shareable URL rather than a section of a single scrolling page.

#### Scenario: Navigating to a component page
- **WHEN** a user opens `/docs/components/button`
- **THEN** only the Button page renders (title, description, install command, examples), and the URL reflects the current component

#### Scenario: Direct deep link
- **WHEN** a user loads a component page URL directly or via browser back/forward
- **THEN** the correct component page renders without falling back to a default or 404

### Requirement: Sidebar navigation, alphabetical
The docs site SHALL present a left sidebar listing all component pages ordered alphabetically by component name, with the active page visually highlighted.

#### Scenario: Switching components via sidebar
- **WHEN** a user clicks a component in the sidebar
- **THEN** the app navigates to that component's page and marks it active

#### Scenario: Ordering
- **WHEN** the sidebar lists components
- **THEN** they appear in case-insensitive alphabetical order (e.g. Alert Dialog, AutoTextarea, Button, …)

### Requirement: Table of contents
Each component page SHALL show an "On This Page" table of contents derived from the page's headings, with the current section tracked while scrolling.

#### Scenario: TOC reflects headings
- **WHEN** a component page contains multiple sections (e.g. Installation, Usage, Examples)
- **THEN** the TOC lists those sections and clicking an entry scrolls to it

### Requirement: Dark/light theming
The docs site SHALL support a dark/light theme toggle that flips the Acrylic `--acr-*` token set and the macOS-26 semantic colors, so every component preview re-themes consistently.

#### Scenario: Toggling theme
- **WHEN** a user toggles the theme control
- **THEN** the documented components and the docs chrome switch between the light and dark token sets without reload

### Requirement: Zero-migration authoring flow
Adding a new component to the docs SHALL require only content/registry edits — a component source file, a `registry.json` entry, one MDX page, and one example — with no changes to framework, routing, or build configuration.

#### Scenario: Adding a component
- **WHEN** an author adds a component source file, its `registry.json` item, an MDX page, and an example file
- **THEN** the new component appears in the sidebar and renders its page (with working preview) on the next dev/build, with no edits to app routing or config
```

## openspec/changes/fumadocs-docs-site/specs/live-preview/spec.md

- Source: openspec/changes/fumadocs-docs-site/specs/live-preview/spec.md
- Lines: 1-34
- SHA256: ac5038206f205b76846fb5fa5e64c77c266664b2d232c02e2a5615618e18ffb2

```md
## ADDED Requirements

### Requirement: Preview / Code tabbed block
Component pages SHALL render examples in a tabbed block exposing a live **Preview** (the rendered example) and a **Code** view (the example's source), authored in MDX by referencing an example by name.

#### Scenario: Viewing an example
- **WHEN** a component page includes an example reference (e.g. `<ComponentPreview name="button-demo" />`)
- **THEN** the Preview tab renders the live example and the Code tab shows that example's source

#### Scenario: Interacting in Preview
- **WHEN** a user interacts with a live example (clicks a button, opens a dialog, toggles theme)
- **THEN** the rendered component responds as the real installed component would

### Requirement: Lazy-loaded example index
Examples SHALL be exposed through a generated index mapping example name → a dynamically imported component and its raw source string, so previews code-split and the Code tab shows real source without hand-duplication.

#### Scenario: Lazy loading
- **WHEN** a component page is opened
- **THEN** only that page's referenced examples are loaded (dynamic import), not every example in the registry

#### Scenario: Index is generated, not hand-edited
- **WHEN** the registry/example set changes and the build runs
- **THEN** the example index is regenerated from the registry as the single source of truth (never hand-maintained)

### Requirement: Registry JSON build and hosting
The same application SHALL build the registry items to JSON (`shadcn build` → `public/r/*.json`) and serve them, so the docs host is also the registry endpoint consumers install from.

#### Scenario: Installing from the docs host
- **WHEN** a consumer configures `@acrylic` to point at `<docs-host>/r/{name}.json` and runs `npx shadcn add @acrylic/button`
- **THEN** the served JSON resolves and installs the component

#### Scenario: Build emits all items
- **WHEN** the registry build runs
- **THEN** every component and example item in `registry.json` produces a corresponding `public/r/<name>.json`
```

