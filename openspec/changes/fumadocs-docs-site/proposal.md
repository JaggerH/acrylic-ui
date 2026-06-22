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
