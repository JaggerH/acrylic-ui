"use client"

import * as React from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Acrylic Stepper — modeled on the Apple macOS 26 UI Kit Steppers page. A small
// vertical up/down increment control: a number readout (the kit's Text Field look)
// plus a two-button stack in a bezel. The kit's stepper bezel is two stacked
// half-rectangles (each height/2) split by a 1px inset separator, with a chevron
// glyph centered in each half. Geometry (bezel W×H, radius) is lifted verbatim
// from the kit — bezel W×H per size is 13×16 / 17×20 / 20×24 / 23×28 / 30×36 and
// radius is uniform ~height/4 (4/5/6/7/9), never capsule (same as Input). Colors
// resolve through the Acrylic theme vars so they flip light/dark: bezel =
// --acr-control / --acr-control-border, each half hover = --acr-hover, divider =
// --acr-control-border, chevron glyph = currentColor (text-foreground). This is a
// CONTROLLED custom component (no Radix) — supports value/defaultValue, min, max,
// step, onValueChange, disabled, and keyboard ArrowUp/ArrowDown.

const fieldVariants = cva(
  cn(
    "inline-flex min-w-0 items-center justify-end border border-[var(--acr-control-border)] bg-[var(--acr-control)] text-foreground tabular-nums outline-none transition-colors",
    "group-focus-visible:border-ring group-focus-visible:ring-[3px] group-focus-visible:ring-ring/25",
    "data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50"
  ),
  {
    variants: {
      // The five macOS control sizes (heights 16/20/24/28/36 from the kit). Radius
      // matches the Text Field (4/5/6/7/9). The readout width is a sensible default;
      // override via className.
      size: {
        mini: "h-4 w-14 rounded-[4px] px-1.5 text-[10px]",
        small: "h-5 w-16 rounded-[5px] px-1.5 text-[11px]",
        medium: "h-6 w-20 rounded-[6px] px-2 text-[13px]",
        large: "h-7 w-20 rounded-[7px] px-2 text-[13px]",
        xl: "h-9 w-24 rounded-[9px] px-2.5 text-[13px]",
      },
    },
    defaultVariants: { size: "medium" },
  }
)

// The bezel of the up/down button stack. W×H + radius are the kit's exact values.
const bezelVariants = cva(
  cn(
    "inline-flex shrink-0 flex-col overflow-hidden border border-[var(--acr-control-border)] bg-[var(--acr-control)]",
    "data-[disabled=true]:opacity-50"
  ),
  {
    variants: {
      size: {
        mini: "h-4 w-[13px] rounded-[4px]",
        small: "h-5 w-[17px] rounded-[5px]",
        medium: "h-6 w-5 rounded-[6px]",
        large: "h-7 w-[23px] rounded-[7px]",
        xl: "h-9 w-[30px] rounded-[9px]",
      },
    },
    defaultVariants: { size: "medium" },
  }
)

// One arrow button (top half = up, bottom half = down). Each is height/2, fills
// the bezel width, and shows a chevron in currentColor. Hover = --acr-hover.
const arrowVariants = cva(
  cn(
    "flex flex-1 items-center justify-center text-foreground transition-colors outline-none",
    "hover:bg-[var(--acr-hover)] active:bg-[var(--acr-chip)]",
    "disabled:pointer-events-none disabled:opacity-40"
  ),
  {
    variants: {
      size: {
        mini: "[&_svg]:size-2",
        small: "[&_svg]:size-2.5",
        medium: "[&_svg]:size-3",
        large: "[&_svg]:size-3",
        xl: "[&_svg]:size-3.5",
      },
    },
    defaultVariants: { size: "medium" },
  }
)

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

type StepperProps = Omit<
  React.ComponentProps<"div">,
  "defaultValue" | "onChange"
> &
  VariantProps<typeof bezelVariants> & {
    value?: number
    defaultValue?: number
    min?: number
    max?: number
    step?: number
    onValueChange?: (value: number) => void
    disabled?: boolean
  }

function Stepper({
  className,
  size,
  value: valueProp,
  defaultValue = 0,
  min = -Infinity,
  max = Infinity,
  step = 1,
  onValueChange,
  disabled = false,
  ...props
}: StepperProps) {
  const isControlled = valueProp !== undefined
  const [internal, setInternal] = React.useState(() =>
    clamp(defaultValue, min, max)
  )
  const value = isControlled ? clamp(valueProp!, min, max) : internal

  const setValue = React.useCallback(
    (next: number) => {
      const clamped = clamp(next, min, max)
      if (!isControlled) setInternal(clamped)
      if (clamped !== value) onValueChange?.(clamped)
    },
    [isControlled, min, max, value, onValueChange]
  )

  const increment = React.useCallback(() => setValue(value + step), [
    setValue,
    value,
    step,
  ])
  const decrement = React.useCallback(() => setValue(value - step), [
    setValue,
    value,
    step,
  ])

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    if (e.key === "ArrowUp") {
      e.preventDefault()
      increment()
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      decrement()
    }
  }

  const atMax = value >= max
  const atMin = value <= min

  return (
    <div
      data-slot="stepper"
      data-size={size}
      data-disabled={disabled || undefined}
      role="spinbutton"
      aria-valuenow={value}
      aria-valuemin={min === -Infinity ? undefined : min}
      aria-valuemax={max === Infinity ? undefined : max}
      tabIndex={disabled ? undefined : 0}
      onKeyDown={onKeyDown}
      className={cn(
        "group inline-flex items-center gap-1.5 text-foreground outline-none",
        className
      )}
      {...props}
    >
      <span
        data-slot="stepper-field"
        data-disabled={disabled || undefined}
        className={cn(fieldVariants({ size }))}
      >
        {value}
      </span>
      <div
        data-slot="stepper-buttons"
        data-disabled={disabled || undefined}
        className={cn(bezelVariants({ size }))}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="Increment"
          disabled={disabled || atMax}
          onClick={increment}
          className={cn(arrowVariants({ size }))}
        >
          <ChevronUp strokeWidth={2.5} />
        </button>
        <span
          aria-hidden
          className="mx-0.5 h-px shrink-0 bg-[var(--acr-control-border)]"
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label="Decrement"
          disabled={disabled || atMin}
          onClick={decrement}
          className={cn(arrowVariants({ size }))}
        >
          <ChevronDown strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}

export { Stepper }
