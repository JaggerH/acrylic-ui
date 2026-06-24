"use client"

import { ArrowRight } from "lucide-react"
import { Button } from "@/registry/acrylic/button"

export default function ButtonDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="neutral">Neutral</Button>
      <Button variant="ghost">Ghost</Button>
      <Button icon variant="neutral" aria-label="Next">
        <ArrowRight />
      </Button>
    </div>
  )
}
