"use client"

import { Switch } from "@/registry/acrylic/switch"

const sizes = ["mini", "small", "medium", "large", "xl"] as const

// The five macOS control sizes (track heights 16/20/24/28/36) plus the toggle
// states, lifted from the Apple macOS 26 UI Kit Toggles page. A labelled row at
// the bottom shows the conventional settings-style usage.
export default function SwitchShowcase() {
  return (
    <div className="flex flex-col gap-4 text-foreground">
      {sizes.map((size) => (
        <div key={size} className="flex items-center gap-4">
          <span className="w-14 shrink-0 text-xs text-muted-foreground">{size}</span>
          <Switch size={size} defaultChecked aria-label={`${size} on`} />
          <Switch size={size} aria-label={`${size} off`} />
          <Switch size={size} defaultChecked disabled aria-label={`${size} disabled on`} />
          <Switch size={size} disabled aria-label={`${size} disabled off`} />
        </div>
      ))}
      <label className="flex items-center gap-3 text-[13px]">
        <Switch defaultChecked aria-label="Wi-Fi" />
        Wi-Fi
      </label>
    </div>
  )
}
