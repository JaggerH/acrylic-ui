## Fix

Edit `registry.json`, the `acrylic` registry:style item, `cssVars`:

- `theme`: `{}` (was 9 semantic `color-*` mappings). The consuming app already provides the `--color-*` mappings from its own `init`; Acrylic components use arbitrary `bg-[var(--acr-*)]` values plus the semantic utilities (`bg-primary`) that the host maps.
- `light` / `dark`: remove the leading 10 semantic keys (`background … border`); keep `--acr-*` + `--text-*`.

Token-ownership rule encoded: **a registry ships only its namespaced tokens (`--acr-*`, `--text-*`); standard shadcn semantic tokens belong to the consumer.**

The acrylic-ui docs app keeps the full palette in `app/global.css` (independent of the registry artifacts), so its own rendering is unchanged.

### Why not a cascade trick on the consumer side

`!important`, `@layer`, or source-order hacks in the consumer are fragile band-aids: the CLI re-merges `cssVars` on every install and source order can flip the winner (exactly the failure observed). The durable guarantee is the registry not shipping the palette at all — which is possible here because we own the registry.

### Verification

- `npm run registry:build` regenerates `public/r/*.json`.
- `public/r/acrylic.json` cssVars: no `primary` / `background` / `foreground` in light or dark; `--acr-*` retained (31 keys).
- `tsc --noEmit` clean. Docs site (`app/global.css`) renders unchanged.
