"use client"

import { ArrowRight } from "lucide-react"
import { Button } from "@/registry/acrylic/button"

const variants = ["default", "secondary", "destructive", "neutral", "ghost"] as const
const sizes = ["mini", "small", "medium", "large", "xl"] as const

// The full matrix: every variant (rows) in every macOS control size (columns),
// plus the round icon size. Lifted from the Apple macOS 26 UI Kit Buttons page.
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
          <Button variant={variant} size="icon" aria-label={`${variant} icon`}>
            <ArrowRight />
          </Button>
        </div>
      ))}
    </div>
  )
}
