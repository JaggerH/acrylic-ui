# Acrylic Table — Design

**Date:** 2026-07-19
**Status:** Approved (brainstorming), pending implementation plan
**Component:** `table` (currently listed under "Not shipped by acrylic")

## Goal

Ship a `Table` component to the acrylic-ui registry and document it on the
fumadocs site, filling a real gap in the correspondence table. The component is
shadcn's Table restyled to the Acrylic macOS material — a pure CSS-tier
component, so it drops onto the existing Phase-1 spring substrate with no runtime
dependency.

## Decisions (locked)

1. **Scope:** shadcn 1:1 anatomy + Apple material. No new API axes.
2. **Docs integration:** standalone registry component with its own doc page.
   The fumadocs default markdown-table rendering is left untouched.
3. **Material:** flat/transparent — no own surface; composes inside `Card`.

## Anatomy (shadcn 1:1)

`registry/acrylic/table.tsx` exports exactly, no more, no less:

`Table` · `TableHeader` · `TableBody` · `TableFooter` · `TableRow` ·
`TableHead` · `TableCell` · `TableCaption`

- Pure CSS-tier: native `<table>` elements + `cn()`. No Radix, no lucide, no CVA.
- `registryDependencies: [acrylic.json]` only; `dependencies: []`.
- Opens with the mandatory docstring block (what it is / acrylic delta / how to
  compose) — this is the API reference the consuming-side workflow reads.
- API corresponds 1:1 to shadcn, so all inherited shadcn rules apply verbatim
  (`className` for layout not color, `text-right` on numeric cells, etc.).

## The Apple material delta (the only divergence)

Flat glass citizen — no own surface; sits transparently on whatever it is
dropped into and composes inside `Card`. Depth comes from the container, per
"the material is the design."

- **Scroll wrapper:** `<div class="relative w-full overflow-x-auto scrollbar-mac">`
  around the `<table>` → macOS thin overlay scrollbar on horizontal overflow.
- **`<table>`:** `w-full caption-bottom text-sm border-collapse`.
- **TableHead** (column labels): `text-muted-foreground`, small + medium weight,
  left-aligned by default (numeric columns opt into `text-right`), Apple row
  height (~`h-9`), `align-middle`, with the letter-spacing companion token for
  the small text size (per the CSS-tier wiring boilerplate).
- **TableHeader row:** firmer bottom hairline via `--acr-border`.
- **TableRow:** hairline separators `border-b border-b-[var(--acr-border-soft)]`
  + `last:border-0`; hover tint `hover:bg-[var(--acr-hover)]`;
  `data-[state=selected]:bg-[var(--acr-chip)]`. Hover wired onto the spring
  substrate — `transition-colors` +
  `[transition-timing-function:var(--acr-spring-default)]` +
  `[transition-duration:var(--acr-spring-default-duration)]`. **Color transition
  only — no `active:scale`** (a table row is not a press target).
- **TableCell:** `px-3 py-2` Apple rhythm, `align-middle`.
- **TableFooter:** top hairline + faint `--acr-chip` fill, medium weight for totals.
- **TableCaption:** `text-muted-foreground`, small, `mt-*`.

No hardcoded hex/rgb, no `dark:` pairs → the three theme blocks
(light / `.dark` / `.acrylic`) flip values for free.

## Files & pipeline (authoring's 6 steps)

1. `registry/acrylic/table.tsx` — new source (above).
2. `registry.json` — one new item, roughly alphabetical (near `separator` /
   `switch`), `type: registry:ui`, `target: components/acrylic/table.tsx`,
   `registryDependencies: [https://acrylic-ui.vercel.app/r/acrylic.json]`, empty
   `dependencies`.
3. `npm run registry:build` → emits `public/r/table.json`; verify `target`.
4. Docs (all four required, or the preview renders blank):
   - `content/docs/components/table.mdx` — frontmatter (title/description) +
     Installation + `<ComponentPreview name="table-demo" />` + Usage + Anatomy +
     Notes. Mirror `badge.mdx`.
   - `components/examples/table-demo.tsx` — one tasteful realistic Apple-content
     table (see Demo below); `default export`, imports from
     `@/registry/acrylic/table`.
   - `node scripts/gen-examples.mjs` → regenerates `components/examples-map.ts`.
   - `content/docs/components/meta.json` — insert `"table"` into `pages` (after
     `"switch"`).
5. Register in the acrylic-ui skill — move `table` from "Not shipped" → the
   correspondence table in `SKILL.md` (repo copy at `.claude/skills/acrylic-ui/`;
   the marketplace copy is a known separate follow-up, per the motion-program
   notes).
6. `npm run types:check` must pass; then commit. Deploy (git push → Vercel) is
   what makes `npx shadcn add @acrylic/table` live — flagged, not part of this
   branch's deliverable.

## Demo (Apple flavor)

A single clean table wrapped in a `Card`: a realistic macOS-human dataset — e.g.
a billing/usage table (Item · Plan · Amount) with amounts right-aligned, a
`TableFooter` **Total** row, a header, hairline rows with hover, and a
`TableCaption`. Exercises every anatomy part in one view. Exact dataset
finalized at build.

## Out of scope (YAGNI — deferred by the locked decisions)

No `inset`/grouped variant, no sortable headers, no sticky header, no zebra
striping, no selection checkboxes, no MDX prose-table override. Re-adding any of
these is a deliberate future decision, each its own change.

## Verification

- `npm run types:check` passes (fumadocs-mdx + next typegen + tsc --noEmit).
- Docs preview renders (gen-examples ran; `<ComponentPreview name="table-demo" />`
  resolves through `examples-map.ts`).
- Visual: hairline rows, hover tint, numeric right-align, footer total,
  horizontal scroll uses `scrollbar-mac`.
- Theming: light / dark / acrylic all correct via tokens (no hardcoded colors);
  reduced-motion inherited through the spring token.
