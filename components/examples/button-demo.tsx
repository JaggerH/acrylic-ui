"use client"

import { Sparkles } from "lucide-react"
import { Button } from "@/registry/acrylic/button"

export default function ButtonDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="tinted">Colored</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="ghost">Borderless</Button>
      <Button variant="glow">
        <Sparkles /> Ask Addy
      </Button>
    </div>
  )
}
