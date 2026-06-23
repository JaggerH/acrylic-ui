"use client"

import { Slider } from "@/registry/acrylic/slider"

// Single value, a two-thumb range, a stepped slider (with kit-style tick marks),
// and a disabled one. Geometry matches the Apple macOS 26 UI Kit Sliders page.
export default function SliderShowcase() {
  const ticks = Array.from({ length: 9 }, (_, i) => i)
  return (
    <div className="flex w-full max-w-sm flex-col gap-7 text-foreground">
      <div className="flex flex-col gap-2">
        <label className="text-[13px] text-muted-foreground">Single value</label>
        <Slider defaultValue={[40]} max={100} step={1} aria-label="Single value" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13px] text-muted-foreground">Range (two thumbs)</label>
        <Slider defaultValue={[25, 75]} max={100} step={1} aria-label="Range" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13px] text-muted-foreground">Stepped + ticks</label>
        <div className="relative">
          <Slider defaultValue={[50]} max={100} step={12.5} aria-label="Stepped" />
          {/* kit tick marks: 9 small dots beneath the track */}
          <div className="pointer-events-none absolute inset-x-0 -bottom-3 flex justify-between px-1">
            {ticks.map((t) => (
              <span key={t} className="size-[2px] rounded-full bg-foreground/25" />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13px] text-muted-foreground">Disabled</label>
        <Slider defaultValue={[60]} max={100} step={1} disabled aria-label="Disabled" />
      </div>
    </div>
  )
}
