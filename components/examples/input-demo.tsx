"use client"

import { Search } from "lucide-react"
import { Input } from "@/registry/acrylic/input"

export default function InputDemo() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-2.5 text-foreground">
      <Input placeholder="Email…" />
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search…" className="pl-8" />
      </div>
      <Input placeholder="Disabled" disabled />
    </div>
  )
}
