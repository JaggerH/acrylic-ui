## Why

Every Acrylic component lists the `acrylic` theme item as a `registryDependency`, so `shadcn add @acrylic/<component>` always merges that item's `cssVars` into the consuming project's global CSS. The `acrylic` item shipped the **full** palette — including the standard shadcn semantic tokens (`--primary`, `--background`, `--foreground`, `--destructive`, `--ring`, `--border`, `--accent`, `--muted-foreground`, plus `--label-tertiary`) with Acrylic's own macOS values (blue `--primary`, etc.).

Because the CLI merges `light → :root` and `dark → .dark`, installing any Acrylic component **overwrote the host app's brand colors**. A consumer with an amber `--primary` silently got Acrylic's blue; the appended `.dark` block (equal specificity to `:root` but later in source order, so it wins) clobbered the host theme. This is the registry behaving as a bad citizen — shipping tokens it does not own.

## Root Cause

`registry.json` → the `acrylic` item (`type: registry:style`) → `cssVars.{theme,light,dark}` contained the standard semantic tokens, not just Acrylic's own `--acr-*` family. shadcn's model: semantic tokens are owned by the consuming app (set once at `init`); a registry's `cssVars` must carry only the NEW tokens its components introduce (the official example uses `brand` / `font-heading`). Acrylic violated this.

## What Changes

- Strip all standard semantic tokens from the `acrylic` theme item's `cssVars` (theme mappings + light/dark values): `background, foreground, muted-foreground, label-tertiary, accent, primary, primary-foreground, destructive, ring, border`.
- Keep only Acrylic-owned tokens: the `--acr-*` family (surfaces/controls/materials + the macOS system color spectrum), the SF Pro `--text-*` type scale, and the `scrollbar-mac` utility.
- Update the item description to state it deliberately omits semantic vars.

After this, installing any `@acrylic/*` component injects only `--acr-*` tokens; the consumer's `--primary` etc. stay untouched, and components inherit the host's brand because they reference `bg-primary` / `text-foreground`.

## Impact

- Consumers (e.g. snapick) keep their own theme — no overwrite, no post-install cleanup.
- The acrylic-ui docs site is unaffected: it renders from its own `app/global.css`, not the registry artifacts.
- No component source changes; no API changes.
