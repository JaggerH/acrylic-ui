# Acrylic Table Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a `Table` component to the acrylic-ui registry and document it on the fumadocs docs site — shadcn's Table anatomy 1:1, restyled to the Acrylic macOS material.

**Architecture:** Pure CSS-tier component (native `<table>` elements + `cn()`, no Radix / lucide / CVA, no runtime deps). Colors flow through `--acr-*` tokens so light/dark/acrylic flip for free. Row hover is wired onto the existing Phase-1 spring substrate (color transition only). Follows the 6-step authoring pipeline: source → registry entry → build → docs → register in skill → verify.

**Tech Stack:** React 19 / TypeScript, Tailwind v4, shadcn registry (`shadcn build`), fumadocs-mdx docs.

## Global Constraints

- **No unit-test suite exists for components.** Verification gates are `npm run registry:build`, `npm run types:check`, and the live docs preview — not jest/vitest. Do not invent component unit tests.
- **Tokens only** — never raw hex/rgb, never manual `dark:` pairs. Use `--acr-*` arbitrary values (`bg-[var(--acr-hover)]`) and mapped utilities (`text-muted-foreground`). `--acr-*` are NOT mapped as `--color-acr-*`, so always use arbitrary-value syntax for them.
- **`target` is mandatory** in the registry entry and MUST be `components/acrylic/table.tsx`.
- **Component file opens with a docstring block** (what it is / acrylic delta / how to compose) — the consuming-side workflow reads this, not the website.
- **API is shadcn 1:1** — exactly 8 exports, no new axes. Inherited shadcn rules apply (`className` for layout not color; numeric cells opt into `text-right`).
- All work happens in the repo at `/home/jagger/projects/acrylic-ui` on branch `master` (the active working branch; the `.claude/worktrees/apple-motion` dir is empty and unused).

---

### Task 1: Source component + registry entry + build

**Files:**
- Create: `registry/acrylic/table.tsx`
- Modify: `registry.json` (insert the new item object immediately before the `{ "name": "skeleton", ... }` entry, keeping rough alphabetical order)
- Generated: `public/r/table.json` (by build, do not hand-edit)

**Interfaces:**
- Produces: React components `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption` — each `React.ComponentProps<"table"|"thead"|...>`, importable from `@/registry/acrylic/table`. Consumed by Task 2's demo and doc.

- [ ] **Step 1: Create the source component**

Create `registry/acrylic/table.tsx` with exactly this content:

```tsx
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

// Acrylic Table — shadcn's Table, recolored to the Acrylic macOS material.
//
// Acrylic delta vs shadcn:
//  - Flat glass citizen: no own surface. It sits transparently on whatever it is
//    dropped into and composes inside <Card>; depth comes from the container.
//  - Hairline row separators on --acr-border-soft (header row on the firmer
//    --acr-border); hover tint --acr-hover; selected row --acr-chip.
//  - Row hover is wired onto the spring substrate (color transition only — a row
//    is not a press target, so NO active:scale).
//  - Column labels use the small subheadline size + its tracking companion,
//    muted (text-muted-foreground), Apple label style.
//  - Horizontal overflow uses the macOS thin overlay scrollbar (scrollbar-mac).
//
// Anatomy is shadcn 1:1 — compose Table > TableHeader/TableBody/TableFooter,
// each holding TableRow, cells are TableHead (header) / TableCell (body).
// Right-align numeric columns with className="text-right" on both head and cell.

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto scrollbar-mac"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom border-collapse text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b [&_tr]:border-b-[var(--acr-border)]", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t border-t-[var(--acr-border)] bg-[var(--acr-chip)] font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-b-[var(--acr-border-soft)] transition-colors [transition-timing-function:var(--acr-spring-default)] [transition-duration:var(--acr-spring-default-duration)] hover:bg-[var(--acr-hover)] data-[state=selected]:bg-[var(--acr-chip)]",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-9 px-3 text-left align-middle font-medium whitespace-nowrap text-muted-foreground text-[length:var(--text-subheadline)] [letter-spacing:var(--text-subheadline-tracking)] [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-3 py-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-muted-foreground text-[length:var(--text-footnote)] [letter-spacing:var(--text-footnote-tracking)]", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
}
```

- [ ] **Step 2: Add the registry entry**

In `registry.json`, insert this object into the `items` array immediately **before** the `{ "name": "skeleton", ... }` entry (keeps rough alphabetical order):

```json
    {
      "name": "table",
      "type": "registry:ui",
      "title": "Acrylic Table",
      "description": "A data table — shadcn's Table restyled to the Acrylic material: flat/transparent (composes inside Card), hairline row separators on --acr-border-soft, muted subheadline column labels, and a spring-wired hover tint. Pure CSS, no dependencies.",
      "files": [
        {
          "path": "registry/acrylic/table.tsx",
          "type": "registry:ui",
          "target": "components/acrylic/table.tsx"
        }
      ],
      "registryDependencies": [
        "https://acrylic-ui.vercel.app/r/acrylic.json"
      ]
    },
```

(No `dependencies` key — the source imports only `react` and `cn`, both omitted by convention.)

- [ ] **Step 3: Build the registry**

Run: `npm run registry:build`
Expected: completes without error; emits/updates `public/r/table.json`.

- [ ] **Step 4: Verify the built artifact**

Run: `grep -o '"target": *"components/acrylic/table.tsx"' public/r/table.json`
Expected: prints the matching `"target": "components/acrylic/table.tsx"` line (confirms the file is present with the correct install target).

- [ ] **Step 5: Typecheck**

Run: `npm run types:check`
Expected: PASS (no errors). Fixes any TS issue in the new source before continuing.

- [ ] **Step 6: Commit**

```bash
git add registry/acrylic/table.tsx registry.json public/r/table.json
git commit -m "feat(table): Acrylic Table — shadcn 1:1 + Apple material

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Docs page + live demo

**Files:**
- Create: `components/examples/table-demo.tsx`
- Create: `content/docs/components/table.mdx`
- Modify: `content/docs/components/meta.json` (add `"table"` to `pages`)
- Generated: `components/examples-map.ts` (by `gen-examples.mjs`, do not hand-edit)

**Interfaces:**
- Consumes: the 8 exports from `@/registry/acrylic/table` (Task 1).
- Produces: an example registered under the name `table-demo`, resolved by `<ComponentPreview name="table-demo" />`.

- [ ] **Step 1: Create the demo**

Create `components/examples/table-demo.tsx` with this content (realistic Apple-human dataset, wrapped in a Card, numeric column right-aligned, footer total, caption — exercises every anatomy part):

```tsx
import { Card } from "@/registry/acrylic/card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/acrylic/table"

const invoices = [
  { plan: "iCloud+", detail: "2 TB storage", period: "Monthly", amount: "$9.99" },
  { plan: "Apple Music", detail: "Individual", period: "Monthly", amount: "$10.99" },
  { plan: "Apple TV+", detail: "Family sharing", period: "Monthly", amount: "$9.99" },
  { plan: "Apple Arcade", detail: "200+ games", period: "Monthly", amount: "$6.99" },
]

export default function TableDemo() {
  return (
    <Card className="w-full max-w-xl p-2 text-foreground">
      <Table>
        <TableCaption>Your Apple subscriptions this month.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Service</TableHead>
            <TableHead>Detail</TableHead>
            <TableHead>Billing</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((row) => (
            <TableRow key={row.plan}>
              <TableCell className="font-medium">{row.plan}</TableCell>
              <TableCell className="text-muted-foreground">{row.detail}</TableCell>
              <TableCell className="text-muted-foreground">{row.period}</TableCell>
              <TableCell className="text-right tabular-nums">{row.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right tabular-nums">$37.96</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </Card>
  )
}
```

- [ ] **Step 2: Regenerate the examples map**

Run: `node scripts/gen-examples.mjs`
Expected: prints `generated components/examples-map.ts (N examples)`; `components/examples-map.ts` now contains a `"table-demo"` entry.

Verify: `grep table-demo components/examples-map.ts`
Expected: prints the import + the `"table-demo": C..,` map line.

- [ ] **Step 3: Create the doc page**

Create `content/docs/components/table.mdx` with this content:

````mdx
---
title: Table
description: A data table — shadcn's Table restyled to the Acrylic material: flat and transparent so it composes inside a Card, with hairline row separators, muted column labels, and a spring-wired hover tint.
---

The shadcn Table, recolored to the Acrylic palette. The anatomy and API are
copied 1:1 from shadcn; only the material changes — the table is flat and
transparent (no surface of its own), rows are divided by hairlines on the
Acrylic border token, column labels take the small muted subheadline style, and
the hover tint rides the same spring substrate as the rest of the kit. Drop it
inside a `Card` when you want a surface behind it.

## Installation

```bash
npx shadcn add https://acrylic-ui.vercel.app/r/table.json
```

## Usage

<ComponentPreview name="table-demo" />

```tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/acrylic/table"

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Service</TableHead>
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>iCloud+</TableCell>
      <TableCell className="text-right tabular-nums">$9.99</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## Anatomy

- **`Table`** — wraps the `<table>` in a horizontally scrollable container with
  the macOS overlay scrollbar (`scrollbar-mac`).
- **`TableHeader` / `TableBody` / `TableFooter`** — `<thead>` / `<tbody>` /
  `<tfoot>`. The footer carries a faint chip fill and medium weight for totals.
- **`TableRow`** — a row with a hairline bottom border and a spring-wired hover
  tint; the last body row drops its border.
- **`TableHead`** — a column-label cell: muted, small subheadline size.
- **`TableCell`** — a body cell.
- **`TableCaption`** — a muted caption below the table.

## Notes

- **It has no surface of its own.** For a framed look, put it inside a `Card`
  (see the preview). On a bare page it renders flat.
- **Right-align numeric columns** with `className="text-right"` on both the
  `TableHead` and the `TableCell`; add `tabular-nums` so figures line up.
- **Colours are tokens** — pass `className` for layout only, never to override
  the material. Light / dark / acrylic themes flip automatically.
- **Selected rows**: set `data-state="selected"` on a `TableRow` for the chip
  fill.
````

- [ ] **Step 4: Add to the sidebar nav**

In `content/docs/components/meta.json`, add `"table"` to the `pages` array, immediately after `"switch"` (its alphabetical neighbour at the end of the list). The array becomes `[…,"switch","table"]`.

- [ ] **Step 5: Typecheck**

Run: `npm run types:check`
Expected: PASS. (This runs `fumadocs-mdx` + `next typegen` + `tsc`, validating the new mdx frontmatter, the demo, and the generated map together.)

- [ ] **Step 6: Visual verification**

Run: `npm run dev` (background), then open `http://localhost:3000/docs/components/table`.
Expected to SEE: the preview renders the subscriptions table inside a Card — muted column labels, hairline row separators, hover tint on rows, right-aligned amounts, a "Total $37.96" footer row, and the caption. Confirm it reads correctly (no white-on-white, scrollbar appears only on narrow widths). Stop the dev server when done.

- [ ] **Step 7: Commit**

```bash
git add components/examples/table-demo.tsx components/examples-map.ts content/docs/components/table.mdx content/docs/components/meta.json
git commit -m "docs(table): documentation page + live demo

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Register in the acrylic-ui skill + final verify

**Files:**
- Modify: `.claude/skills/acrylic-ui/SKILL.md` (correspondence table + "Not shipped" list)

**Interfaces:**
- Consumes: nothing (documentation-only).
- Produces: the skill now lists `table` as shipped.

- [ ] **Step 1: Add Table to the correspondence table**

In `.claude/skills/acrylic-ui/SKILL.md`, in the "Component correspondence (shadcn ↔ acrylic)" table, add a row in alphabetical position (after the `switch` row, before `tooltip`):

```markdown
| table | `table.tsx` | 1:1 anatomy; flat/transparent, hairline rows, muted subheadline labels, spring hover |
```

- [ ] **Step 2: Remove Table from the "Not shipped" list**

In the same file, the "**Not shipped by acrylic**" paragraph lists `… spinner, table, tabs, textarea …`. Delete `table, ` from that list so it no longer claims Table is missing.

- [ ] **Step 3: Final full verification**

Run: `npm run types:check`
Expected: PASS.

Run: `git status`
Expected: clean working tree (all three commits landed); `git log --oneline -3` shows the table source, docs, and skill commits.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/acrylic-ui/SKILL.md
git commit -m "docs(skill): mark Table as shipped in the acrylic-ui skill

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Deploy note (out of branch scope)

`npx shadcn add @acrylic/table` only works once the site is deployed (git push → Vercel serves `/r/table.json`). That deploy is the maintainer's call and is **not** part of this plan's deliverable — the plan ends at committed, type-checked, visually-verified code on `master`.

## Follow-up (not in this plan)

Per the motion-program notes, the marketplace copy of the skill
(`jagger-skills-marketplace/plugins/acrylic-ui`) is updated separately; this plan
only touches the in-repo `.claude/skills/acrylic-ui/SKILL.md`.
