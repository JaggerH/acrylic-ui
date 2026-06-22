## 1. Scaffold the Next.js + Fumadocs app

- [x] 1.1 Evaluate scaffold source (on master, no branch). Finding: the official `fumadocs-shadcn` example is Tailwind **v3** (Fumadocs 14, tailwind.config.js + tailwind-plugin); our registry is Tailwind **v4** (`@theme` + arbitrary `var()` token classes). Using it would force a v4→v3 downgrade that breaks our token system. Decision: scaffold with current **`create-fumadocs-app` (Fumadocs v15 + Tailwind v4)** — same official tooling, v4-native — then graft the registry.
- [x] 1.2 Bring the chosen scaffold to the repo root (Next app: `app/`, `content/docs/`, `mdx-components`, fumadocs config), keeping the existing `registry/`, `registry.json`, `acrylic.css` untouched for now
- [x] 1.3 Wire Tailwind v4 + `acrylic.css` as the app's global stylesheet; verify the `--acr-*` tokens win over Fumadocs' default theme tokens (frosted surfaces read; chrome neutral)
- [x] 1.4 Reproduce the dark/light toggle (Fumadocs theme or a small client component flipping `html.dark/.light`); backdrop optional

## 2. Registry build + hosting in the app

- [x] 2.1 Move `registry/acrylic/*` into the app source tree; keep `registry.json` paths valid
- [x] 2.2 Wire `shadcn build` → `public/r/*.json`; confirm all current items still emit
- [x] 2.3 Verify the app serves `public/r/<name>.json` (registry endpoint == docs host)

## 3. Live preview infrastructure (vertical slice)

- [x] 3.1 Add an `examples` area in the registry; create `button-demo` example item + file
- [x] 3.2 Implement `__registry__` index codegen (name → `React.lazy` import + raw source string) as part of the build; never hand-edited
- [x] 3.3 Build the `<ComponentPreview name>` MDX component: Preview tab (lazy live render) + Code tab (source string)
- [x] 3.4 Author the Button MDX page end-to-end as the slice; confirm Preview renders + Code shows source + page routed + in sidebar

## 4. Migrate the 8 components to MDX pages

- [x] 4.1 Author MDX pages (alphabetical): alert-dialog, auto-textarea, button, dialog, glass-card, input, toaster — each with title, description, `npx shadcn add @acrylic/<name>`, ≥1 example, and a props/variants table
- [x] 4.2 Create one example item per component in the registry + index
- [x] 4.3 Add a "Theme / Tokens" docs page documenting the `--acr-*` macOS-26 token set (light/dark)
- [x] 4.4 Confirm sidebar is alphabetical with active highlight; TOC present on each page

## 5. Remove the Vite demo + cleanup

- [x] 5.1 Delete `demo/`, `vite.config.ts`, `index.html`; remove Vite/react-plugin deps and the `pnpm demo` script
- [x] 5.2 Update README (dev = `pnpm dev` Next; registry usage unchanged) and `.gitignore` as needed

## 6. Verify

- [x] 6.1 `pnpm dev` runs; all 8 component pages + theme page render with working Preview/Code, routing, sidebar, TOC
- [x] 6.2 Dark/light toggle re-themes every preview consistently
- [x] 6.3 Registry build emits all `public/r/*.json` and the app serves them; `npx shadcn add @acrylic/button` resolves against the local host
- [x] 6.4 Adding a throwaway test component (source + registry item + MDX + example) appears with no framework/config edits — then revert it
