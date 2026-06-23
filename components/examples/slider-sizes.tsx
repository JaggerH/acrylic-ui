"use client"

import { Slider } from "@/registry/acrylic/slider"

// All five control sizes (kit 1 Mn … 5 XL). Track is 4px for mini/small and 6px
// for medium/large/xl; the pill knob grows 16×12 → 24×20.
const sizes = ["mini", "small", "medium", "large", "xl"] as const

export default function SliderSizes() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6 text-foreground">
      {sizes.map((size) => (
        <div key={size} className="flex flex-col gap-2">
          <label className="text-[13px] capitalize text-muted-foreground">{size}</label>
          <Slider size={size} defaultValue={[50]} max={100} step={1} aria-label={size} />
        </div>
      ))}
    </div>
  )
}
