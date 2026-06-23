"use client"

import { RadioGroup, RadioGroupItem } from "@/registry/acrylic/radio-group"
import { FieldLabel } from "@/registry/acrylic/field"

// Vertical group, an inline/horizontal group, and a disabled group.
export default function RadioGroupShowcase() {
  return (
    <div className="flex flex-wrap items-start gap-10 text-foreground">
      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">Vertical</span>
        <RadioGroup defaultValue="card">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="card" id="v-card" />
            <FieldLabel htmlFor="v-card">Credit card</FieldLabel>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="paypal" id="v-paypal" />
            <FieldLabel htmlFor="v-paypal">PayPal</FieldLabel>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="transfer" id="v-transfer" />
            <FieldLabel htmlFor="v-transfer">Bank transfer</FieldLabel>
          </div>
        </RadioGroup>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">Inline</span>
        <RadioGroup
          defaultValue="md"
          className="flex flex-row flex-wrap gap-x-5 gap-y-2"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="sm" id="i-sm" />
            <FieldLabel htmlFor="i-sm">Small</FieldLabel>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="md" id="i-md" />
            <FieldLabel htmlFor="i-md">Medium</FieldLabel>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="lg" id="i-lg" />
            <FieldLabel htmlFor="i-lg">Large</FieldLabel>
          </div>
        </RadioGroup>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">Disabled</span>
        <RadioGroup defaultValue="on" disabled>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="on" id="d-on" />
            <FieldLabel htmlFor="d-on">Selected</FieldLabel>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="off" id="d-off" />
            <FieldLabel htmlFor="d-off">Unselected</FieldLabel>
          </div>
        </RadioGroup>
      </div>
    </div>
  )
}
