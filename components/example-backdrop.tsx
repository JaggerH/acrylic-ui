import * as React from "react"

import { cn } from "@/lib/utils"

/** Layout stage for example previews — centers the demo and carries each example's
 *  layout tweaks (`flex-col`, `gap-*`, `!flex-row flex-wrap`, `min-h-*`, …).
 *
 *  It no longer paints its own wallpaper: the docs site now mounts a global
 *  `<Backdrop>` that, under the Acrylic theme, shows through the (transparent)
 *  preview cell — so translucent surfaces frost over the REAL wallpaper. Under
 *  light/dark there is no wallpaper and they sit on the flat panel, as intended.
 *  The per-example backdrops are therefore redundant and have been removed. */
export function ExampleBackdrop({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex min-h-[18rem] w-full items-center justify-center",
        className
      )}
    >
      {children}
    </div>
  )
}
