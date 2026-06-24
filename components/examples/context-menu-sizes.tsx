"use client"

import * as React from "react"
import { Copy, Scissors, Trash2 } from "lucide-react"
import {
  contextMenuItemVariants,
  contextMenuSurfaceClass,
  type ContextMenuSize,
} from "@/registry/acrylic/context-menu"

import { ExampleBackdrop } from "@/components/example-backdrop"
import { cn } from "@/lib/utils"

// The three kit menu sizes, set once via <ContextMenuContent size="...">. Shown as
// still panels (a live ContextMenu can't render open), each built from the SAME
// `contextMenuItemVariants(size)` the real component uses — so what you see is what
// the prop produces.
const SIZES: { size: ContextMenuSize; label: string }[] = [
  { size: "default", label: "default · 13pt" },
  { size: "sm", label: "sm · 11pt" },
  { size: "xs", label: "xs · 10pt" },
]

function SizedMenu({ size }: { size: ContextMenuSize }) {
  const row = contextMenuItemVariants({ size })
  return (
    <div className={cn(contextMenuSurfaceClass, "w-[180px]")}>
      <div className="px-2 pb-1 pt-1.5 text-[11px] font-semibold text-muted-foreground">Edit</div>
      <div className={cn(row, "bg-[var(--primary)] text-primary-foreground")}>
        <Copy /> Copy
        <span className="ml-auto pl-4 tracking-wide text-primary-foreground/80">⌘C</span>
      </div>
      <div className={row}>
        <Scissors /> Cut
        <span className="ml-auto pl-4 tracking-wide text-[var(--label-tertiary)]">⌘X</span>
      </div>
      <div className="-mx-1 my-1 h-px bg-black/10 dark:bg-white/10" />
      <div className={cn(row, "text-destructive")}>
        <Trash2 /> Delete
      </div>
    </div>
  )
}

export default function ContextMenuSizes() {
  return (
    <ExampleBackdrop className="!flex-row flex-wrap items-start justify-center gap-6">
      {SIZES.map(({ size, label }) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <SizedMenu size={size} />
          <span className="text-[11px] text-white/80">{label}</span>
        </div>
      ))}
    </ExampleBackdrop>
  )
}
