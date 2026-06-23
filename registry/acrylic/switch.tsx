"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

// Acrylic Switch — the macOS 26 Toggle, aligned onto Radix Switch.
// Anatomy lifted from the Apple macOS 26 UI Kit (Toggles page):
//   • Track: a CAPSULE (radius = height/2). OFF = the kit's translucent gray rail
//     (black 6% light / white 6% dark) -> wired to --acr-chip so it flips for free.
//     ON = the kit's opaque accent #0088FF (dark #0091FF), which IS --primary.
//   • Knob: the kit's soft white knob, inset 2px (1.5 mini / 3 xl) inside the track,
//     with a layered ambient shadow. The kit knob is actually a wide squircle pill
//     (e.g. medium 32x20); on the web we use a circular white knob sized to the
//     track height minus inset (the conventional Switch look, matching our Slider).
//   • Travel: the CIRCULAR knob is narrower than the kit pill, so it must slide
//     FURTHER to land at the right inset. The checked transform is driven straight
//     from the CSS vars — translate by (trackW - knobDia - 2*inset) — so it lands at
//     the right inset symmetrically with the left and can never drift from a table.
//     Per size: mini 36-13-2*1.5=20, small 44-16-2*2=24, medium 54-20-2*2=30,
//     large 64-24-2*2=36, xl 80-30-2*3=44.
// Track sizes (W x H) verbatim from the kit: 36x16 / 44x20 / 54x24 / 64x28 / 80x36.
// Geometry is from the extraction (tokens/switch.json); focus = accent ring
// (focus-visible:ring-ring/25), disabled dims. API stays shadcn-compatible
// (checked / defaultChecked / onCheckedChange / disabled).

const sizeStyles = {
  // kit: track WxH, knob inset, knob diameter (= trackH - 2*inset).
  // travel is NOT stored — it's derived in CSS from the vars below as
  // (w - knob - 2*inset) so the on position always mirrors the off inset.
  mini: { w: 36, h: 16, inset: 1.5, knob: 13 },
  small: { w: 44, h: 20, inset: 2, knob: 16 },
  medium: { w: 54, h: 24, inset: 2, knob: 20 },
  large: { w: 64, h: 28, inset: 2, knob: 24 },
  xl: { w: 80, h: 36, inset: 3, knob: 30 },
} as const

type SwitchSize = keyof typeof sizeStyles

function Switch({
  className,
  size = "medium",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: SwitchSize
}) {
  const { w, h, inset, knob } = sizeStyles[size]

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      style={
        {
          "--switch-w": `${w}px`,
          "--switch-h": `${h}px`,
          "--switch-pad": `${inset}px`,
          "--switch-knob": `${knob}px`,
        } as React.CSSProperties
      }
      className={cn(
        // capsule track; OFF = translucent gray rail, ON = accent (--primary)
        "peer relative inline-flex shrink-0 items-center rounded-full p-[var(--switch-pad)]",
        "h-[var(--switch-h)] w-[var(--switch-w)]",
        "bg-[var(--acr-chip)] outline-none",
        "transition-colors duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
        "data-[state=checked]:bg-primary",
        "focus-visible:ring-4 focus-visible:ring-ring/25",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // soft white knob: circular, hairline border, layered ambient shadow
          "pointer-events-none block size-[var(--switch-knob)] rounded-full bg-white",
          "border border-[var(--acr-control-border)]",
          "shadow-[0_1px_3px_rgba(0,0,0,0.18),0_4px_10px_rgba(0,0,0,0.12)]",
          // macOS-like spring-ish ease; off=translate-x-0 (left inset),
          // on=translate by (trackW - knob - 2*inset) (right inset, mirrored)
          "transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
          "data-[state=checked]:translate-x-[calc(var(--switch-w)-var(--switch-knob)-2*var(--switch-pad))]"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
