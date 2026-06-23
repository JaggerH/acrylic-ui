"use client"

import { Slider } from "@/registry/acrylic/slider"

// The four linear variants from the kit's "Sliders" family: Standard vs
// Center-biased (fill origin) × plain vs Ticked (the marks add-on).
export default function SliderVariants() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-7 text-foreground">
      <div className="flex flex-col gap-2">
        <label className="text-[13px] text-muted-foreground">Standard</label>
        <Slider defaultValue={[60]} max={100} step={1} aria-label="Standard" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13px] text-muted-foreground">Standard + Ticked</label>
        <Slider defaultValue={[50]} max={100} step={12.5} marks aria-label="Standard ticked" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13px] text-muted-foreground">Center-biased (−100…100)</label>
        <Slider variant="center" defaultValue={[35]} min={-100} max={100} step={1} aria-label="Center-biased" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13px] text-muted-foreground">Center-biased + Ticked</label>
        <Slider
          variant="center"
          defaultValue={[-40]}
          min={-100}
          max={100}
          step={25}
          marks
          aria-label="Center-biased ticked"
        />
      </div>
    </div>
  )
}
