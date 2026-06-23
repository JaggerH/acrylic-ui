"use client"

import * as React from "react"
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from "lucide-react"

import { Button } from "@/registry/acrylic/button"
import {
  ButtonGroup,
  ButtonGroupItem,
  ButtonGroupSeparator,
} from "@/registry/acrylic/button-group"

// A small macOS-style toolbar: an attached formatting cluster (one gray well,
// flush neutral buttons with hairline dividers) next to a segmented alignment
// control whose active item is a raised white pill that slides on selection.
// (Numeric +/- increment is a Stepper, not a Button Group — see the Stepper page.)
export default function ButtonGroupDemo() {
  const [align, setAlign] = React.useState<"left" | "center" | "right">("center")

  return (
    <div className="flex flex-wrap items-center gap-4 text-foreground">
      {/* attached: a cluster of momentary formatting actions */}
      <ButtonGroup>
        <Button variant="neutral" size="medium" aria-label="Bold">
          <Bold />
        </Button>
        <ButtonGroupSeparator />
        <Button variant="neutral" size="medium" aria-label="Italic">
          <Italic />
        </Button>
        <ButtonGroupSeparator />
        <Button variant="neutral" size="medium" aria-label="Underline">
          <Underline />
        </Button>
      </ButtonGroup>

      {/* segmented: controlled value API — the white pill SLIDES to the selection */}
      <ButtonGroup
        variant="segmented"
        value={align}
        onValueChange={(v) => setAlign(v as "left" | "center" | "right")}
      >
        <ButtonGroupItem value="left" aria-label="Align left">
          <AlignLeft />
        </ButtonGroupItem>
        <ButtonGroupItem value="center" aria-label="Align center">
          <AlignCenter />
        </ButtonGroupItem>
        <ButtonGroupItem value="right" aria-label="Align right">
          <AlignRight />
        </ButtonGroupItem>
      </ButtonGroup>
    </div>
  )
}
