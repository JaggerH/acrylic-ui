"use client"

import * as React from "react"
import { Checkbox } from "@/registry/acrylic/checkbox"

const sizes = ["mini", "small", "medium", "large", "xl"] as const

// The five macOS control sizes (edges 12/14/16/18/18) across checked /
// unchecked / mixed / disabled states, lifted from the Apple macOS 26 UI Kit
// selection controls. A labelled row at the bottom shows the conventional
// settings-style usage.
export default function CheckboxShowcase() {
  return (
    <div className="flex flex-col gap-4 text-foreground">
      {sizes.map((size) => (
        <div key={size} className="flex items-center gap-4">
          <span className="w-14 shrink-0 text-xs text-muted-foreground">{size}</span>
          <Checkbox size={size} defaultChecked aria-label={`${size} checked`} />
          <Checkbox size={size} aria-label={`${size} unchecked`} />
          <Checkbox size={size} checked="indeterminate" aria-label={`${size} mixed`} />
          <Checkbox size={size} disabled aria-label={`${size} disabled`} />
        </div>
      ))}
      <label className="flex items-center gap-3 text-[13px]">
        <Checkbox defaultChecked aria-label="Wi-Fi" />
        Wi-Fi
      </label>
    </div>
  )
}
