"use client"

import { RadioGroup, RadioGroupItem } from "@/registry/acrylic/radio-group"
import { FieldLabel } from "@/registry/acrylic/field"

// A small option list with labels. Each row pairs a RadioGroupItem with a
// clickable label (htmlFor -> id), the macOS-standard choice-row layout.
export default function RadioGroupDemo() {
  return (
    <RadioGroup defaultValue="comfortable" className="text-foreground">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="compact" id="r-compact" />
        <FieldLabel htmlFor="r-compact">Compact</FieldLabel>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="comfortable" id="r-comfortable" />
        <FieldLabel htmlFor="r-comfortable">Comfortable</FieldLabel>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="spacious" id="r-spacious" />
        <FieldLabel htmlFor="r-spacious">Spacious</FieldLabel>
      </div>
    </RadioGroup>
  )
}
