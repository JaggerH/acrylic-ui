"use client"

import * as React from "react"
import { Searchbar } from "@/registry/acrylic/searchbar"

export default function SearchbarDemo() {
  const [value, setValue] = React.useState("")

  return (
    <div className="w-full max-w-sm px-4 py-8">
      <Searchbar
        placeholder="Search files, components, settings..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onClear={() => setValue("")}
      />
    </div>
  )
}
