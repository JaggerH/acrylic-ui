"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"
import { Check, Minus } from "lucide-react"

import { cn } from "@/lib/utils"

// Acrylic Checkbox — modeled on the Apple macOS 26 UI Kit selection controls
// (Toggles page, sibling of the Radio Button). The control is a rounded square
// (radius ≈ 1/4 of the edge): unchecked = a gray fill (kit: black 5% — wired to
// --acr-chip so it flips light/dark); checked = solid accent fill (kit:
// #0088FF -> primary) with a soft white check; mixed (indeterminate) = accent
// with a white dash bar, the kit's mixed treatment. Edge sizes follow the kit's
// selection-control scale (same as our RadioGroup): 12/14/16/18/18 px.
// Disabled dims via opacity, matching the kit's accent-50% + group-opacity
// treatment. API stays shadcn-compatible (checked / onCheckedChange /
// disabled); `checked="indeterminate"` renders the mixed state.
const SIZES = {
  mini: "size-3",
  small: "size-3.5",
  medium: "size-4",
  large: "size-[18px]",
  xl: "size-[18px]",
} as const

type CheckboxSize = keyof typeof SIZES

function Checkbox({
  className,
  size = "medium",
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & {
  size?: CheckboxSize
}) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      data-size={size}
      className={cn(
        // Rounded square: gray fill at rest -> solid accent when on/mixed.
        // Colors resolve through the Acrylic theme vars so they flip light/dark.
        "relative group shrink-0 rounded-[4px] bg-[var(--acr-chip)] outline-none transition-colors",
        "data-[state=checked]:bg-primary data-[state=indeterminate]:bg-primary",
        "hover:bg-[var(--acr-chip-hover)] data-[state=checked]:hover:bg-primary data-[state=indeterminate]:hover:bg-primary",
        "focus-visible:ring-[3px] focus-visible:ring-ring/25",
        "disabled:pointer-events-none disabled:opacity-40",
        SIZES[size],
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="absolute inset-0 flex items-center justify-center text-primary-foreground"
      >
        {/* Soft white check (~60% of the edge, the kit's mark weight); the
            mixed state swaps it for the white dash bar. The Indicator is only
            mounted while checked or mixed, so both marks stay hidden at rest. */}
        <Check className="hidden size-[60%] group-data-[state=checked]:block" strokeWidth={3} />
        <Minus className="hidden size-[60%] group-data-[state=indeterminate]:block" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
