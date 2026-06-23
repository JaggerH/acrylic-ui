"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

// Acrylic Slider — the macOS 26 slider, aligned onto Radix Slider.
// Anatomy lifted from the Apple macOS 26 UI Kit (Sliders and Dials page):
//   • Track (rail): a CAPSULE translucent rail — kit `Track - Unfilled` = black 6%
//     (white 6% dark). We wire it to --acr-chip (the kit's translucent control fill)
//     so it flips light/dark for free. Track height 6px (kit medium/large/xl; mini/
//     small are 4px — see `size` if you need them).
//   • Range (filled): a CAPSULE accent fill — kit `Track - Filled` = #0088FF, which
//     IS --primary (dark #0091FF). So bg-primary matches the kit exactly.
//   • Thumb (knob): the kit's frosted-white rounded pill (medium 20x16, radius=h/2).
//     On the web we use a circular white knob (--acr-control) with a hairline border
//     and the kit's soft ambient shadow. Diameter follows `size` (kit knob heights
//     12/14/16/20). Focus = accent ring (focus-visible:ring-ring/25), disabled dims.
// Geometry is verbatim from the extraction (tokens/slider.json). API stays
// shadcn-compatible (defaultValue/value/min/max/step/onValueChange) and supports
// both horizontal and vertical orientation.

const sizeStyles = {
  // kit knob heights -> web circular knob diameters; track 4px (mini/small) / 6px
  mini: { track: 4, thumb: 12 },
  small: { track: 4, thumb: 14 },
  medium: { track: 6, thumb: 16 },
  large: { track: 6, thumb: 20 },
  xl: { track: 6, thumb: 20 },
} as const

type SliderSize = keyof typeof sizeStyles

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  size = "medium",
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & {
  size?: SliderSize
}) {
  const { track, thumb } = sizeStyles[size]

  // Render one thumb per value (range = two thumbs), like shadcn's Slider.
  const thumbCount = React.useMemo(
    () =>
      Array.isArray(value)
        ? value.length
        : Array.isArray(defaultValue)
          ? defaultValue.length
          : 1,
    [value, defaultValue]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      data-size={size}
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        style={
          {
            "--slider-track": `${track}px`,
          } as React.CSSProperties
        }
        className={cn(
          // capsule translucent rail (kit Track - Unfilled, black/white 6%)
          "relative grow overflow-hidden rounded-full bg-[var(--acr-chip)]",
          "data-[orientation=horizontal]:h-[var(--slider-track)] data-[orientation=horizontal]:w-full",
          "data-[orientation=vertical]:w-[var(--slider-track)] data-[orientation=vertical]:h-full"
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            // capsule accent range (kit Track - Filled = #0088FF == --primary)
            "absolute rounded-full bg-primary",
            "data-[orientation=horizontal]:h-full",
            "data-[orientation=vertical]:w-full"
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: thumbCount }, (_, i) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={i}
          style={
            {
              "--slider-thumb": `${thumb}px`,
            } as React.CSSProperties
          }
          className={cn(
            // frosted-white knob: circular, hairline border, soft ambient shadow
            "block size-[var(--slider-thumb)] shrink-0 rounded-full bg-[var(--acr-control)]",
            "border border-[var(--acr-control-border)]",
            "shadow-[0_1px_3px_rgba(0,0,0,0.18),0_4px_10px_rgba(0,0,0,0.12)]",
            "transition-[box-shadow,transform] outline-none",
            "hover:shadow-[0_1px_3px_rgba(0,0,0,0.22),0_6px_14px_rgba(0,0,0,0.16)]",
            "focus-visible:ring-4 focus-visible:ring-ring/25",
            "active:scale-95",
            "disabled:pointer-events-none disabled:opacity-50"
          )}
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
