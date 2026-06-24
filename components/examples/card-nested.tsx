"use client"

import { Plus, Trash2 } from "lucide-react"

import { Avatar, AvatarFallback } from "@/registry/acrylic/avatar"
import { Badge } from "@/registry/acrylic/badge"
import { Button } from "@/registry/acrylic/button"
import { Card } from "@/registry/acrylic/card"
import { ExampleBackdrop } from "@/components/example-backdrop"

// Card-in-card: the outer Card is the frosted glass (backdrop-blur). The INNER
// card is NOT another blurred Card — stacking a second backdrop-blur over the
// already-translucent outer surface double-samples it and leaves a darkened
// seam. Instead the nested surface is a flat black wash that sits ON the glass
// and RECESSES it (darker than the outer surface in both themes), reading as a
// secondary surface (the iOS grouped-list pattern) with no extra blur.
export default function CardNested() {
  return (
    <ExampleBackdrop>
      <Card className="flex w-full max-w-sm flex-col gap-3.5 p-4 text-foreground">
        {/* Outer header */}
        <div className="flex items-center gap-2">
          <h3 className="text-[17px] font-semibold tracking-tight">Approving</h3>
          <Badge variant="secondary" className="min-w-5 px-1.5 tabular-nums">
            1
          </Badge>
          <Button
            icon
            size="large"
            variant="ghost"
            aria-label="Delete"
            className="ms-auto text-muted-foreground hover:text-foreground"
          >
            <Trash2 />
          </Button>
        </div>

        {/* Nested card — a flat fill that RECESSES the surface (darker than the
            outer glass), no second blur. Light keeps the black --acr-chip; dark
            overrides to a black wash too (the white chip would lighten it). */}
        <div className="rounded-xl bg-[var(--acr-chip)] p-3 dark:bg-black/20">
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarFallback className="bg-emerald-500/90 text-[9px] text-white">
                ML
              </AvatarFallback>
            </Avatar>
            <span className="text-[13px] font-semibold">Michael Lee</span>
            <span className="ms-auto text-[11px] text-muted-foreground">
              10 mins ago
            </span>
          </div>
          <p className="mt-2 text-[13px]">456 Oak Avenue, Dallas, TX 7520</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            $750,000 · Purchase - DSCR
          </p>
        </div>

        {/* Outer footer action */}
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg px-1 py-0.5 text-[15px] font-semibold text-foreground transition-colors hover:text-muted-foreground"
        >
          <Plus className="size-4.5" strokeWidth={2.5} />
          Add new loan
        </button>
      </Card>
    </ExampleBackdrop>
  )
}
