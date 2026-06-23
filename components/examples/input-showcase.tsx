"use client"

import { Input } from "@/registry/acrylic/input"

const sizes = ["mini", "small", "medium", "large", "xl"] as const

// The five macOS control sizes (heights 16/20/24/28/36) plus the field states,
// lifted from the Apple macOS 26 UI Kit Text Fields page.
export default function InputShowcase() {
  return (
    <div className="flex flex-col gap-3 text-foreground">
      {sizes.map((size) => (
        <div key={size} className="flex items-center gap-3">
          <span className="w-14 shrink-0 text-xs text-muted-foreground">{size}</span>
          <Input size={size} placeholder={`${size}…`} className="max-w-xs" />
        </div>
      ))}
      <div className="flex items-center gap-3">
        <span className="w-14 shrink-0 text-xs text-muted-foreground">states</span>
        <Input placeholder="Placeholder" className="max-w-[9rem]" />
        <Input defaultValue="Value" className="max-w-[9rem]" />
        <Input placeholder="Disabled" disabled className="max-w-[9rem]" />
      </div>
    </div>
  )
}
