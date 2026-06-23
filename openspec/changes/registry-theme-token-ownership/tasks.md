## Tasks

- [x] Strip the standard semantic tokens from the `acrylic` item `cssVars` (theme mappings + light/dark values) in `registry.json`; keep `--acr-*` + `--text-*`
- [x] Update the `acrylic` item description to state semantic vars are intentionally omitted
- [x] `npm run registry:build`; verify `public/r/acrylic.json` has no semantic palette and retains `--acr-*` (31 keys)
- [x] `tsc --noEmit` clean
