"use client"

import * as React from "react"
import { Combobox } from "@/registry/acrylic/combobox"

const sizes = ["mini", "small", "medium", "large", "xl"] as const
const fruit = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "grape", label: "Grape" },
]

// The five macOS control sizes — the Combobox trigger reuses the Input geometry.
export default function ComboboxShowcase() {
  const [value, setValue] = React.useState<Record<string, string>>({})
  return (
    <div className="flex flex-col gap-3">
      {sizes.map((size) => (
        <div key={size} className="flex items-center gap-3">
          <span className="w-14 shrink-0 text-xs text-muted-foreground">{size}</span>
          <Combobox
            size={size}
            options={fruit}
            value={value[size]}
            onValueChange={(v) => setValue((s) => ({ ...s, [size]: v }))}
            placeholder="Fruit…"
            className="max-w-[220px]"
          />
        </div>
      ))}
    </div>
  )
}
