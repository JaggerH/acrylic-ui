"use client"

import { useState } from "react"
import { AutoTextarea } from "@/registry/acrylic/auto-textarea"

export default function AutoTextareaDemo() {
  const [value, setValue] = useState("")
  return (
    <AutoTextarea
      value={value}
      onChange={(e) => setValue(e.target.value)}
      maxLines={4}
      className="w-full max-w-md"
      placeholder="Type a few lines — it grows to maxLines, then scrolls…"
    />
  )
}
