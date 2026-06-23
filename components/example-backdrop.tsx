import * as React from "react"

import { cn } from "@/lib/utils"

/** Full-bleed colorful backdrop for example previews. Breaks out of the preview's
 *  p-10 padding (-m-10 + self-stretch) so the wallpaper fills the whole Example
 *  cell, which makes translucent acrylic surfaces (Card, the Sonner banner)
 *  read as real frosted glass — the blur has high-contrast content to soften.
 *  `className` tweaks the inner content layout (e.g. `flex-col gap-6`). */
export function ExampleBackdrop({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className="relative -m-10 w-[calc(100%+5rem)] self-stretch overflow-hidden">
      <div aria-hidden className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#312e81] via-[#6d28d9] to-[#9d174d]" />
        <div className="absolute -left-12 -top-16 size-64 rounded-full bg-[#ff375f] opacity-90" />
        <div className="absolute right-6 -top-10 size-52 rounded-full bg-[#0a84ff] opacity-90" />
        <div className="absolute -bottom-20 left-1/3 size-64 rounded-full bg-[#ffd60a] opacity-80" />
        <div className="absolute -bottom-6 right-16 size-44 rounded-full bg-[#30d158] opacity-90" />
      </div>
      <div className={cn("relative flex min-h-[18rem] items-center justify-center p-10", className)}>
        {children}
      </div>
    </div>
  )
}
