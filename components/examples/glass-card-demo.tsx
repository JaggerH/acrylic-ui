"use client"

import { GlassCard } from "@/registry/acrylic/glass-card"

export default function GlassCardDemo() {
  return (
    <div className="grid w-full max-w-md grid-cols-2 gap-4 text-foreground">
      <GlassCard className="p-5">
        <div className="text-sm font-medium">Static</div>
        <p className="mt-1 text-xs text-muted-foreground">Flat, no shadow.</p>
      </GlassCard>
      <GlassCard interactive className="p-5">
        <div className="text-sm font-medium">Interactive</div>
        <p className="mt-1 text-xs text-muted-foreground">Hover to lift.</p>
      </GlassCard>
    </div>
  )
}
