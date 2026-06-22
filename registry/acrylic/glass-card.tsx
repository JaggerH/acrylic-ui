import * as React from "react"

import { cn } from "@/lib/utils"

/** Dark-glass surface card. A charcoal translucent pane over a blurred backdrop
 *  (the background shows through, softly darkened) — flat at rest with NO shadow,
 *  no rim/border, no inner bevel. `interactive` adds a hover lift + a touch lighter
 *  fill + a soft float shadow that appears only on hover. Pairs with the frosted
 *  Acrylic Dialog panel.
 *
 *  The hover float is a `filter: drop-shadow`, NOT `shadow-[…]`: Tailwind's box-shadow
 *  utility sets the INHERITING `--tw-shadow` var, which any descendant using a
 *  ring/shadow utility composes into its own box-shadow — re-painting the card's float
 *  inside itself (the inner "wrap" seam). A filter doesn't inherit that way. */
const GlassCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }
>(({ className, interactive = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative rounded-xl bg-zinc-950/40 backdrop-blur-xl",
      "transition-[transform,filter,background-color] duration-200",
      interactive &&
        "hover:-translate-y-px hover:bg-zinc-900/55 " +
        "hover:drop-shadow-[0_11px_22px_rgba(0,0,0,0.55)]",
      className
    )}
    {...props}
  />
))
GlassCard.displayName = "GlassCard"

export { GlassCard }
