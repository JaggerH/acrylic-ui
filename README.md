# Acrylic

A dark frosted-glass **shadcn/ui registry** + **Fumadocs docs site** in one Next.js
app. Color, spacing, and corner radii are lifted from the official Apple **macOS 26**
UI Kit; every component is theme-aware (light / dark) through one token set.

## Develop

```bash
pnpm install
pnpm dev            # docs at http://localhost:3000/docs
```

- Component source: `registry/acrylic/*` · tokens: `registry/acrylic/acrylic.css`.
- Docs content: `content/docs/**.mdx`. Each component = one MDX page + one example
  (`components/examples/<name>-demo.tsx`) shown via `<ComponentPreview name="…" />`.
- Registry JSON: `pnpm registry:build` → `public/r/*.json` (served by the same app,
  so the docs host is the registry endpoint).

## Add a component (no framework/config edits)

1. `registry/acrylic/<name>.tsx` + a `registry.json` item.
2. `components/examples/<name>-demo.tsx`, then `node scripts/gen-examples.mjs`.
3. `content/docs/components/<name>.mdx` with `<ComponentPreview name="<name>-demo" />`.
4. Add `<name>` to `content/docs/components/meta.json` (alphabetical).

## Use the registry

In a consuming project's `components.json`:

```json
{ "registries": { "@acrylic": "https://<host>/r/{name}.json" } }
```

```bash
npx shadcn add @acrylic/button
```
