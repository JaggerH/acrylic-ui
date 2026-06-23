"use client"

import * as React from "react"
import { Combobox } from "@/registry/acrylic/combobox"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "vite", label: "Vite" },
  { value: "nuxt", label: "Nuxt" },
]

export default function ComboboxDemo() {
  const [value, setValue] = React.useState("")
  return (
    <div className="w-full max-w-[240px]">
      <Combobox
        options={frameworks}
        value={value}
        onValueChange={setValue}
        placeholder="Select framework…"
        searchPlaceholder="Search framework…"
      />
    </div>
  )
}
