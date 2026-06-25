"use client"

import { Button } from "@/registry/acrylic/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/registry/acrylic/sheet"

// Faithful to shadcn's "sides" example: the same Sheet opening from each edge via
// the `side` prop (top / right / bottom / left). A flex grid of triggers, each
// wired to the matching side.
const SIDES = ["top", "right", "bottom", "left"] as const

export default function SheetShowcase() {
  return (
    <div className="flex flex-wrap gap-2">
      {SIDES.map((side) => (
        <Sheet key={side}>
          <SheetTrigger asChild>
            <Button variant="neutral" className="capitalize">
              {side}
            </Button>
          </SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle className="capitalize">{side} sheet</SheetTitle>
              <SheetDescription>
                Slides in from the {side} edge.
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  )
}
