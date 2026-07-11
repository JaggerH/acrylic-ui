"use client"

import * as React from "react"
import { Searchbar } from "@/registry/acrylic/searchbar"

export default function SearchbarShowcase() {
  const [values, setValues] = React.useState<Record<string, string>>({})

  const handleChange = (id: string, val: string) => {
    setValues((prev) => ({ ...prev, [id]: val }))
  }

  const sizes = ["mini", "small", "medium", "large", "xl"] as const
  const variants = ["default", "over-glass"] as const

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl px-4 py-8">
      {variants.map((variant) => (
        <div key={variant} className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold capitalize text-muted-foreground px-1">
            {variant} Variant
          </h3>
          <div className="grid gap-4 bg-[var(--acr-surface)] border border-[var(--acr-border-soft)] p-6 rounded-2xl backdrop-blur-xl">
            {sizes.map((size) => {
              const id = `${variant}-${size}`
              return (
                <div key={size} className="grid grid-cols-[80px_1fr] items-center gap-4">
                  <span className="text-xs font-mono text-muted-foreground uppercase">
                    {size}
                  </span>
                  <Searchbar
                    variant={variant}
                    size={size}
                    placeholder={`Search ${size}...`}
                    value={values[id] || ""}
                    onChange={(e) => handleChange(id, e.target.value)}
                    onClear={() => handleChange(id, "")}
                  />
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
