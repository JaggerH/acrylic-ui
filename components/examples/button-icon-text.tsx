"use client"

import { ArrowRight, Download, Plus, Settings, Trash2 } from "lucide-react"
import { Button } from "@/registry/acrylic/button"

const sizes = ["mini", "small", "medium", "large", "xl"] as const

// Icon + label combinations — the case the variant/size matrix doesn't cover.
// Three rows to eyeball alignment: a leading icon across every size (does the
// glyph stay optically centered with the label as the height grows?), a trailing
// icon across every size, and a leading icon across every variant.
export default function ButtonIconText() {
  return (
    <div className="flex flex-col gap-4">
      {/* leading icon + label, every control size */}
      <div className="flex flex-wrap items-center gap-3">
        {sizes.map((size) => (
          <Button key={size} size={size}>
            <Plus /> New
          </Button>
        ))}
      </div>

      {/* label + trailing icon, every control size */}
      <div className="flex flex-wrap items-center gap-3">
        {sizes.map((size) => (
          <Button key={size} size={size} variant="neutral">
            Continue <ArrowRight />
          </Button>
        ))}
      </div>

      {/* leading icon + label, every variant (medium) */}
      <div className="flex flex-wrap items-center gap-3">
        <Button>
          <Download /> Download
        </Button>
        <Button variant="secondary">
          <Settings /> Settings
        </Button>
        <Button variant="destructive">
          <Trash2 /> Delete
        </Button>
        <Button variant="neutral">
          <Plus /> Add
        </Button>
        <Button variant="ghost">
          <Plus /> Add
        </Button>
        <Button variant="link">
          <Plus /> Learn more
        </Button>
      </div>
    </div>
  )
}
