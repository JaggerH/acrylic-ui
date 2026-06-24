"use client"

import { Plus, Trash2 } from "lucide-react"

import { Avatar, AvatarFallback } from "@/registry/acrylic/avatar"
import { Badge } from "@/registry/acrylic/badge"
import { Button } from "@/registry/acrylic/button"
import { Card } from "@/registry/acrylic/card"
import { ExampleBackdrop } from "@/components/example-backdrop"

// Card-in-card: the outer Card is the frosted glass (backdrop-blur). A REAL Card
// nested inside it auto-drops its blur and tints one step darker (the
// `.acr-frosted [data-slot="card"]` rule + the `--acr-card-nested` token), so the
// nested surface reads as a recessed secondary layer — the iOS grouped-list
// pattern — with no extra blur and no border. Each nesting level steps darker, so
// even a 3-deep stack keeps every layer visually distinct.

/** One loan row, rendered as a real nested <Card>. */
function LoanRow() {
  return (
    <Card className="p-2.5">
      <div className="flex items-center gap-2">
        <Avatar className="size-5">
          <AvatarFallback className="bg-emerald-500/90 text-[8px] text-white">
            ML
          </AvatarFallback>
        </Avatar>
        <span className="text-[12px] font-semibold">Michael Lee</span>
        <span className="ms-auto text-[10px] text-muted-foreground">
          10 mins ago
        </span>
      </div>
      <p className="mt-1.5 text-[12px]">456 Oak Avenue, Dallas, TX 7520</p>
      <p className="mt-0.5 text-[10px] text-muted-foreground">
        $750,000 · Purchase - DSCR
      </p>
    </Card>
  )
}

/** Outer column header (label + count + delete) shared by both stacks. */
function ColumnHeader({ name, count }: { name: string; count: number }) {
  return (
    <div className="flex items-center gap-2 px-0.5">
      <span className="text-[13px] font-semibold">{name}</span>
      <Badge variant="secondary" size="sm" className="min-w-5 tabular-nums">
        {count}
      </Badge>
      <Button
        icon
        size="medium"
        variant="ghost"
        aria-label="Delete column"
        className="ms-auto text-muted-foreground hover:text-foreground"
      >
        <Trash2 />
      </Button>
    </div>
  )
}

/** Shared "add new loan" footer row. */
function AddRow() {
  return (
    <button
      type="button"
      className="flex items-center gap-1.5 rounded-lg px-1 py-0.5 text-[13px] font-medium text-foreground transition-colors hover:text-muted-foreground"
    >
      <Plus className="size-4" strokeWidth={2.5} />
      Add new loan
    </button>
  )
}

export default function CardNested() {
  return (
    <ExampleBackdrop className="!flex-row flex-wrap items-start justify-center gap-6">
      {/* Single nest: outer Card → one nested Card per loan. */}
      <Card className="flex w-72 shrink-0 flex-col gap-2.5 p-3 text-foreground">
        <ColumnHeader name="Approving" count={1} />
        <LoanRow />
        <AddRow />
      </Card>

      {/* Three layers deep: outer Card → middle Card → inner Card. The middle
          layer must stay a clearly distinct surface, not wash out. */}
      <Card className="flex w-72 shrink-0 flex-col gap-2.5 p-3 text-foreground">
        <ColumnHeader name="Pipeline" count={1} />
        <Card className="flex flex-col gap-2.5 p-2.5">
          <span className="px-0.5 text-[12px] font-semibold text-muted-foreground">
            Qualification
          </span>
          <LoanRow />
        </Card>
        <AddRow />
      </Card>
    </ExampleBackdrop>
  )
}
