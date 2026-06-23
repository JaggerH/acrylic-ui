"use client"

import { Switch } from "@/registry/acrylic/switch"

// On, off, and disabled — the three resting looks of the macOS 26 toggle.
export default function SwitchDemo() {
  return (
    <div className="flex items-center gap-6 text-foreground">
      <Switch defaultChecked aria-label="On" />
      <Switch aria-label="Off" />
      <Switch disabled aria-label="Disabled" />
    </div>
  )
}
