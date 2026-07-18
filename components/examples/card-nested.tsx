"use client"

import { Flag, MoreHorizontal, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/registry/acrylic/badge"
import { Button } from "@/registry/acrylic/button"
import { Card } from "@/registry/acrylic/card"
import { ExampleBackdrop } from "@/components/example-backdrop"

// Card-in-card: the outer Card is the frosted glass (backdrop-blur). `nestedSurface`
// explicitly opts it into nested-card treatment, so real Cards inside it drop their
// blur and tint one step darker via `--acr-card-nested`. Each nesting level steps
// darker, so even a 3-deep stack keeps every layer visually distinct. Content is a
// Reminders-style list of lists — the nesting mechanism is the point; the copy is
// just something human to hang it on.

/** One reminder, rendered as a real nested <Card>. */
function ReminderRow({
  title,
  note,
  time,
  flagged,
}: {
  title: string
  note?: string
  time: string
  flagged?: boolean
}) {
  return (
    <Card className="p-2.5">
      <div className="flex items-center gap-2">
        <span className="size-3.5 shrink-0 rounded-full border-[1.5px] border-primary/70" />
        <span className="text-[13px] font-medium">{title}</span>
        {flagged ? <Flag className="size-3 shrink-0 fill-orange-400 text-orange-400" /> : null}
        <span className="ms-auto text-[11px] tabular-nums text-muted-foreground">{time}</span>
      </div>
      {note ? <p className="mt-0.5 ps-[22px] text-[11px] text-muted-foreground">{note}</p> : null}
    </Card>
  )
}

/** Outer list header (dot + name + count + options) shared by both stacks. */
function ListHeader({ name, count, tint }: { name: string; count: number; tint: string }) {
  return (
    <div className="flex items-center gap-2 px-0.5">
      <span className={cn("size-2.5 shrink-0 rounded-full", tint)} />
      <span className="text-[13px] font-semibold">{name}</span>
      <Badge variant="secondary" size="sm" className="min-w-5 tabular-nums">
        {count}
      </Badge>
      <Button
        icon
        size="medium"
        variant="ghost"
        aria-label="List options"
        className="ms-auto text-muted-foreground hover:text-foreground"
      >
        <MoreHorizontal />
      </Button>
    </div>
  )
}

/** Shared "new reminder" footer row — accent-tinted, like Reminders' add action. */
function AddRow() {
  return (
    <button
      type="button"
      className="flex items-center gap-1.5 rounded-lg px-1 py-0.5 text-[13px] font-medium text-primary transition-colors hover:text-primary/80"
    >
      <Plus className="size-4" strokeWidth={2.5} />
      New Reminder
    </button>
  )
}

export default function CardNested() {
  return (
    <ExampleBackdrop className="!flex-row flex-wrap items-start justify-center gap-6">
      {/* Single nest: outer Card → one nested Card per reminder. */}
      <Card nestedSurface className="flex w-72 shrink-0 flex-col gap-2.5 p-3 text-foreground">
        <ListHeader name="Today" count={3} tint="bg-sky-400" />
        <ReminderRow title="Morning run" note="5 miles · Marina Green" time="7:00 AM" />
        <ReminderRow title="Design review" time="11:30 AM" flagged />
        <ReminderRow title="Call Mom" time="6:00 PM" />
        <AddRow />
      </Card>

      {/* Three layers deep: outer Card → middle Card → inner Card. The middle
          layer must stay a clearly distinct surface, not wash out. */}
      <Card nestedSurface className="flex w-72 shrink-0 flex-col gap-2.5 p-3 text-foreground">
        <ListHeader name="Trips" count={1} tint="bg-orange-400" />
        <Card nestedSurface className="flex flex-col gap-2.5 p-2.5">
          <span className="px-0.5 text-[12px] font-semibold text-muted-foreground">
            Lisbon · May
          </span>
          <ReminderRow title="Confirm Airbnb check-in" time="Apr 2" />
        </Card>
        <AddRow />
      </Card>
    </ExampleBackdrop>
  )
}
