"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"

import { cn } from "@/lib/utils"

// Acrylic Radio Group — modeled on the Apple macOS 26 UI Kit Toggles page
// (Radio Button). The control is a circle: unchecked = a gray ring/fill
// (kit: black 5% — wired to --acr-chip so it flips light/dark); checked =
// solid accent fill (kit: #0088FF -> primary) with a white center dot ~30%
// of the circle. The kit ships five control sizes (circle 12/14/16/18/18);
// `medium` (16px) is the canonical default. Disabled dims via opacity,
// matching the kit's accent-50% + group-opacity treatment.
const SIZES = {
  mini: "size-3",
  small: "size-3.5",
  medium: "size-4",
  large: "size-[18px]",
  xl: "size-[18px]",
} as const

type RadioSize = keyof typeof SIZES

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-2.5", className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  size = "medium",
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item> & {
  size?: RadioSize
}) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      data-size={size}
      className={cn(
        // Circle: gray ring/fill at rest -> solid accent when checked. Colors
        // resolve through the Acrylic theme vars so they flip light/dark.
        "relative shrink-0 rounded-full bg-[var(--acr-chip)] outline-none transition-colors",
        "data-[state=checked]:bg-primary",
        "hover:bg-[var(--acr-chip-hover)] data-[state=checked]:hover:bg-primary",
        "focus-visible:ring-[3px] focus-visible:ring-ring/25",
        "disabled:pointer-events-none disabled:opacity-40",
        SIZES[size],
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="absolute inset-0 flex items-center justify-center"
      >
        {/* White center dot (kit ~30% of circle diameter). */}
        <span className="block size-[30%] rounded-full bg-primary-foreground" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
