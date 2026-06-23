"use client"

import * as React from "react"
import { Stepper } from "@/registry/acrylic/stepper"

// The Stepper from the Apple macOS 26 UI Kit Steppers page: a number readout plus
// an up/down button stack in the kit's bezel. Shows a basic stepper, a custom
// step, and a disabled stepper.
export default function StepperShowcase() {
  const [value, setValue] = React.useState(5)

  return (
    <div className="flex flex-col gap-4 text-foreground">
      <div className="flex items-center gap-3">
        <span className="w-16 shrink-0 text-xs text-muted-foreground">basic</span>
        <Stepper value={value} onValueChange={setValue} min={0} max={20} />
      </div>
      <div className="flex items-center gap-3">
        <span className="w-16 shrink-0 text-xs text-muted-foreground">step 5</span>
        <Stepper defaultValue={30} min={0} max={60} step={5} />
      </div>
      <div className="flex items-center gap-3">
        <span className="w-16 shrink-0 text-xs text-muted-foreground">disabled</span>
        <Stepper defaultValue={3} disabled />
      </div>
    </div>
  )
}
