# Verification Report — registry-theme-token-ownership

Mode: **light** (1 source file `registry.json`, no delta spec; the scale script's
task-count heuristic over-classified as full, manually corrected to light).

## Lightweight checks (5)

| # | Check | Result |
|---|-------|--------|
| 1 | All tasks in tasks.md are `[x]` | PASS |
| 2 | Changed files match task descriptions (`registry.json` cssVars stripped of semantic tokens; openspec artifacts) | PASS |
| 3 | Build passes (`npm run registry:build` → "Building registry." OK) | PASS |
| 4 | Related checks pass (`npx tsc --noEmit` clean) | PASS |
| 5 | No security issues (data-only change, no secrets, no unsafe ops) | PASS |

## Root-cause elimination (hotfix gate)

Confirmed the bug is gone at both layers:

- Source `registry.json` → `acrylic` item `cssVars`: 0 of {primary, background, foreground, destructive, ring, border, accent, muted-foreground, label-tertiary}.
- Built `public/r/acrylic.json` `cssVars`: no `primary`/`background`/`foreground` in light or dark; **31** `--acr-*` tokens retained.

Result: installing any `@acrylic/*` component no longer injects the semantic palette, so a consumer's `--primary` (e.g. snapick's amber) is never overwritten.

## Out of scope / unaffected

- Docs site renders from `app/global.css` (independent of registry artifacts) — visually unchanged.
- No component source or API changes.

**Verdict: PASS.**
