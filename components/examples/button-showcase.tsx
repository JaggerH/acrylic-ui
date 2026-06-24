"use client"

import { ArrowRight } from "lucide-react"
import { Button } from "@/registry/acrylic/button"

const variants = ["default", "secondary", "destructive", "neutral", "ghost"] as const
const sizes = ["mini", "small", "medium", "large", "xl"] as const

// The full matrix: every variant (rows) in every macOS control size (columns),
// plus a round icon button per variant. Lifted from the Apple macOS 26 UI Kit
// Buttons page. The last row shows `icon` scaling across all five sizes.
export default function ButtonShowcase() {
  return (
    <div className="flex flex-col gap-3">
      {variants.map((variant) => (
        <div key={variant} className="flex flex-wrap items-center gap-3">
          {sizes.map((size) => (
            <Button key={size} variant={variant} size={size}>
              {variant}
            </Button>
          ))}
          <Button variant={variant} icon aria-label={`${variant} icon`}>
            <ArrowRight />
          </Button>
        </div>
      ))}

      {/* icon buttons scale with size — diameter = the control height (16…36) */}
      <div className="flex flex-wrap items-center gap-3">
        {sizes.map((size) => (
          <Button key={size} icon size={size} variant="neutral" aria-label={`icon ${size}`}>
            <ArrowRight />
          </Button>
        ))}
      </div>
    </div>
  )
}
