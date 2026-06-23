"use client"

import { Slider } from "@/registry/acrylic/slider"

// A basic single-value slider — a volume control at a sensible width.
export default function SliderDemo() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-2 text-foreground">
      <label className="text-[13px] text-muted-foreground">Volume</label>
      <Slider defaultValue={[60]} max={100} step={1} aria-label="Volume" />
    </div>
  )
}
