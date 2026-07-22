# Authoring a new Acrylic component

Adding a component to the **acrylic-ui repo itself** (not consuming one — for that
see the Workflow section in SKILL.md). Do this when the correspondence table lists
a component under "Not shipped" and you've confirmed with the maintainer it should
ship. The pipeline is: source `.tsx` → `registry.json` entry → `registry:build` →
docs → register in this skill → verify. Deploy is what makes it installable.

## Contents

- Ground rule: start from shadcn, diverge only for the material
- Step 1 — source component (`registry/acrylic/<name>.tsx`)
- Step 2 — registry entry (`registry.json`)
- Step 3 — build (`npm run registry:build`)
- Step 4 — docs (mdx + meta + demo)
- Step 5 — register in this skill
- Step 6 — verify & deploy
- Token cheat-sheet (which form for which token)
- Fixing an existing component (and propagating the fix)

---

## Ground rule: start from shadcn, diverge only for the material

Every acrylic component IS its shadcn counterpart, restyled. Copy shadcn's source
verbatim, keep the anatomy and API 1:1, then recolor **through tokens** and add the
macOS material. If a component is already token-driven (Breadcrumb, Separator), the
"restyle" is nearly a no-op — that's expected, ship it 1:1. Only invent new axes
(Button sizes, Badge pills) when the macOS kit demands it, and record those in
[components.md](./components.md).

Never introduce raw hex/rgb, never write manual `dark:` pairs — the three theme
blocks in `acrylic.css` flip values for free (see [materials.md](./materials.md)).

## Step 1 — source component (`registry/acrylic/<name>.tsx`)

- File lives in `registry/acrylic/`, imports `cn` from `@/lib/utils`, one component
  family per file, `export { … }` at the bottom (no default export).
- **Open with a docstring** — a `//` comment block stating what it is, the acrylic
  delta vs shadcn, and how to compose it. This IS the component's API reference (the
  consuming-side Workflow reads local docstrings, not the website).
- Recolor through tokens using the cheat-sheet below.

## Step 2 — registry entry (`registry.json`)

Add one object to the `items` array (roughly alphabetical). Copy the shape of an
existing simple entry (`separator`, `badge`):

```json
{
  "name": "<name>",
  "type": "registry:ui",
  "title": "Acrylic <Name>",
  "description": "One or two sentences: what it is + the acrylic delta.",
  "dependencies": ["@radix-ui/react-…", "lucide-react", "class-variance-authority"],
  "registryDependencies": ["https://acrylic-ui.vercel.app/r/acrylic.json"],
  "files": [
    {
      "path": "registry/acrylic/<name>.tsx",
      "type": "registry:ui",
      "target": "components/acrylic/<name>.tsx"
    }
  ]
}
```

- **`target` is mandatory and must be `components/acrylic/<name>.tsx`.** Without it,
  `shadcn add` drops the file into the host's `components/ui/`, clobbering stock
  shadcn components. This target is what keeps acrylic vendored under its own dir.
- **`dependencies`** = only the npm packages the source actually imports (radix
  primitives, `lucide-react`, `class-variance-authority`). Omit `react`/`cn`.
- **`registryDependencies`** always includes `.../r/acrylic.json` (the theme tokens).
  Add other acrylic components it composes — e.g. Dialog lists `.../r/button.json`
  because its close button is the acrylic Button. This is the dependency graph a
  hand-copy misses; the registry install pulls it transitively.

## Step 3 — build (`npm run registry:build`)

Runs `shadcn build`, compiling every `registry.json` item into the installable
`public/r/<name>.json` served at `/r/<name>.json`. Run it after every source or
entry change. Verify `public/r/<name>.json` exists and its `target` is correct.

## Step 4 — docs (mdx + meta + demo)

Three files, all required for a working docs page:

1. `content/docs/components/<name>.mdx` — frontmatter `title` + `description`, then
   Installation (`npx shadcn add …/r/<name>.json`), `<ComponentPreview name="<name>-demo" />`,
   a Usage code block, an Anatomy/Variants section, and Notes. Match `badge.mdx`.
2. `components/examples/<name>-demo.tsx` — a `default export` component importing from
   `@/registry/acrylic/<name>`. **Then run `node scripts/gen-examples.mjs`** to
   regenerate `components/examples-map.ts` — `<ComponentPreview name="<name>-demo" />`
   resolves the name through that map, NOT by scanning the folder. Skip this and the
   preview renders blank (the demo file existing is not enough).
3. `content/docs/components/meta.json` — add `"<name>"` to the `pages` array so it
   appears in the sidebar nav.

## Step 5 — register in this skill

- Move the component from the **"Not shipped by acrylic"** list to the
  **Component correspondence table** in SKILL.md (mark `1:1` or link its divergence).
- If it added a new API axis, document it in [components.md](./components.md).

## Step 6 — verify & deploy

- `npm run types:check` (fumadocs-mdx + `next typegen` + `tsc --noEmit`) — must pass.
- **Deploy (git push → Vercel) before any consumer can `npx shadcn add @acrylic/<name>`.**
  The registry is served from the deployed site, not the local `public/r`. Until
  deploy lands, a consuming app must vendor the file by hand — safe only when its
  `registryDependencies` are already present in that app (e.g. a token-only
  component); otherwise wait for deploy so the graph installs.

## Token cheat-sheet (which form for which token)

| Need | Form | Why |
|---|---|---|
| Text/border that maps to a semantic color | utility: `text-muted-foreground`, `text-foreground`, `bg-background`, `border` | mapped in `acrylic.css` `@theme inline` |
| Frosted surface | `acr-frosted bg-[var(--acr-surface)] backdrop-blur-xl` (panels: `--acr-panel`) | the glass recipe |
| Any `--acr-*` material token | arbitrary: `bg-[var(--acr-border)]`, `bg-[var(--acr-chip)]` | `--acr-*` are NOT mapped as `--color-acr-*` |
| A value token NOT in `@theme` (e.g. `--label-tertiary`) | arbitrary: `text-[var(--label-tertiary)]` | **do not** write `text-label-tertiary` — that utility only exists where the host mapped `--color-label-tertiary`, so it silently breaks in the repo and in unmapped consumers |
| Raw hex / rgb / `dark:` pair | never | the three theme blocks flip values for free |

## Fixing an existing component (and propagating the fix)

A defect can surface in a consuming app's UI while its actual cause lives in the
vendored acrylic component — a color/token assumption that breaks under a
composition the component never accounted for. Fixing it has two halves: locate
and fix the defect at the source (here), then propagate the fix into every
vendored copy that carries it. Both halves matter — patching only the consumer
leaves the same defect waiting for the next component that composes the same way,
and patching only here without syncing leaves consumers stale.

### 1 — Diagnose: acrylic's problem, or the consumer's?

Before touching any consumer code, decide where the defect actually lives:

- **Reproduce it in isolation.** Compose the same combination (e.g. the failing
  component nested inside another component's particular state) using only
  acrylic-ui's own pieces — a scratch example, or an existing docs preview. If it
  reproduces there, the defect is structural: some class in the vendored source
  hard-codes a color/behavior that assumes a context the component doesn't
  actually guarantee (e.g. "the surface underneath is always the neutral panel
  background" — untrue once the component is nested inside a selected/accent
  surface). That's an acrylic-side fix.
- **Check whether a documented pattern was simply skipped.** If the component
  already exposes the right mechanism (a prop, a documented recipe, an existing
  `data-*`/`group-data-*` hook) and the consumer's code just didn't use it, that's
  a consumer-side fix — apply it there, not here.
- **A defect that repeats independently across more than one consumer, or across
  more than one call site making the same reasonable composition, is strong
  evidence it's the first kind** — nobody had a spec to follow, so multiple
  people missed the same case the same way.

### 2 — Fix at the source

- Prefer **extending a mechanism the codebase already established** over
  inventing a new one-off pattern. If a sibling component already reacts to a
  parent's state via a `group-data-[...]/<group-name>:` selector (e.g. `ItemMedia`
  reading `group-data-[size=*]/item:` off `Item`'s `group/item`), give the fixed
  component the same kind of hook rather than asking every consumer to hand-write
  a bespoke override.
- Comment the *why*, not the *what* — future readers need the broken assumption
  and the mechanism reused, not a restatement of the CSS.
- If the fix teaches a usage pattern that wasn't obvious before (not just a
  bugfix), give it a **live example** so the docs page shows the before/after
  instead of only describing it in prose — see Step 4 above for adding one, and
  don't forget `node scripts/gen-examples.mjs` or the preview renders blank.
- Update the component's own `.mdx` (Notes / API Reference), and any other
  component's docs whose documented recipe is now affected by the change.
- `npm run types:check` must pass. `npm run registry:build` regenerates
  `public/r/*.json` for local verification — it's gitignored, don't commit it.
- Commit and push. Push is what deploys the hosted registry, which is what makes
  the fix installable via `npx shadcn add @acrylic/<name>` — a consumer syncing a
  hand-copied file before this lands is copying a fix that doesn't match what a
  fresh install would pull.

### 3 — Propagate to every vendored copy

Do this once per consumer that vendors the fixed file, as its own change in that
consumer's repo:

- **Diff the vendored copy against the fixed registry source before touching
  it.** No diff (or a trivial whitespace-only diff) means the copy has no local
  patches — a straight copy of the new source is safe.
- **Any real diff means the copy carries local patches** (host-specific tweaks,
  extra props). Overwriting would silently discard them. Three-way merge instead:
  base = the commit that first vendored the file, upstream = the new registry
  source, local = the consumer's current file — apply the upstream delta while
  keeping the local one.
- Typecheck the consumer after copying/merging.
- Commit the sync as its own change, scoped to just the synced file(s), and
  reference the upstream commit in the message so the two are traceable to each
  other later.
