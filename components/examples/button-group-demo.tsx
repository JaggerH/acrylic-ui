"use client"

import * as React from "react"
import { Minus, Plus, AlignLeft, AlignCenter, AlignRight } from "lucide-react"

import { Button } from "@/registry/acrylic/button"
import {
  ButtonGroup,
  ButtonGroupItem,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "@/registry/acrylic/button-group"

// A small macOS-style toolbar: an attached −/value/+ stepper group (one gray well,
// flush buttons with a hairline divider) next to a segmented alignment group whose
// active item is a raised white pill.
export default function ButtonGroupDemo() {
  const [count, setCount] = React.useState(3)
  const [align, setAlign] = React.useState<"left" | "center" | "right">("center")

  return (
    <div className="flex flex-wrap items-center gap-4 text-foreground">
      {/* attached: −/value/+ */}
      <ButtonGroup>
        <Button
          variant="neutral"
          size="medium"
          aria-label="Decrease"
          onClick={() => setCount((c) => c - 1)}
        >
          <Minus />
        </Button>
        <ButtonGroupSeparator />
        <ButtonGroupText className="min-w-9 tabular-nums">{count}</ButtonGroupText>
        <ButtonGroupSeparator />
        <Button
          variant="neutral"
          size="medium"
          aria-label="Increase"
          onClick={() => setCount((c) => c + 1)}
        >
          <Plus />
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
