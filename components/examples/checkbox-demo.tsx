"use client"

import { Checkbox } from "@/registry/acrylic/checkbox"

// On, off, mixed, and disabled — the four resting looks of the macOS 26
// checkbox.
export default function CheckboxDemo() {
  return (
    <div className="flex items-center gap-6 text-foreground">
      <Checkbox defaultChecked aria-label="Checked" />
      <Checkbox aria-label="Unchecked" />
      <Checkbox checked="indeterminate" aria-label="Mixed" />
      <Checkbox disabled aria-label="Disabled" />
    </div>
  )
}
