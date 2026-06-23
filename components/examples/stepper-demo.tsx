"use client"

import { Stepper } from "@/registry/acrylic/stepper"

export default function StepperDemo() {
  return (
    <div className="flex w-full items-center justify-center text-foreground">
      <Stepper defaultValue={3} min={0} max={10} />
    </div>
  )
}
