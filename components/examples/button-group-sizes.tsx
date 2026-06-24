"use client"

import * as React from "react"

import { Badge } from "@/registry/acrylic/badge"
import { ButtonGroup, ButtonGroupItem } from "@/registry/acrylic/button-group"

// The five kit sizes (1 Mn … 5 XL) of the macOS Segmented Control — height
// 16/20/24/28/36, well radius 4/5/6/14/18, font 10/11/13/13/13. Set once via the
// `size` prop; the well, segments, sliding pill and dividers all scale together.
const SIZES = [
  { size: "mini" as const, label: "mini · 16px" },
  { size: "small" as const, label: "small · 20px" },
  { size: "medium" as const, label: "medium · 24px" },
  { size: "large" as const, label: "large · 28px" },
  { size: "xl" as const, label: "xl · 36px" },
]

const TABS = ["Day", "Week", "Month"]

export default function ButtonGroupSizes() {
  const [value, setValue] = React.useState<Record<string, string>>({})

  return (
    <div className="flex flex-col items-start gap-5 text-foreground">
      {SIZES.map(({ size, label }) => (
        <div key={size} className="flex items-center gap-4">
          <Badge variant="secondary" className="w-[104px] justify-start">
            {label}
          </Badge>
          <ButtonGroup
            variant="segmented"
            size={size}
            value={value[size] ?? "Week"}
            onValueChange={(v) => setValue((prev) => ({ ...prev, [size]: v }))}
          >
            {TABS.map((t) => (
              <ButtonGroupItem key={t} value={t}>
                {t}
              </ButtonGroupItem>
            ))}
          </ButtonGroup>
        </div>
      ))}
    </div>
  )
}
