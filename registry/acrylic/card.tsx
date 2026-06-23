import * as React from "react"

import { cn } from "@/lib/utils"

/** Card — a dark-glass surface card. A charcoal translucent pane over a blurred backdrop
 *  (the background shows through, softly darkened) — flat at rest with NO shadow,
 *  no rim/border, no inner bevel. `interactive` adds a hover lift + a touch lighter
 *  fill + a soft float shadow that appears only on hover. Pairs with the frosted
 *  Acrylic Dialog panel.
 *
 *  The hover float lives on a `::before` backing layer (an OUTSET box-shadow), not on
 *  the card itself. The surface is translucent, so a shadow painted on the card —
 *  whether `box-shadow` or `filter: drop-shadow` — bleeds THROUGH it as an internal
 *  darkening. An outset box-shadow is never painted under its own box, so on ::before
 *  (inset-0, behind the card) the lift stays purely OUTSIDE the card with no internal
 *  smudge. Scoping it to ::before also keeps `--tw-shadow` off the card's children, so
 *  no descendant re-composes the float into an inner "wrap" seam. */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }
>(({ className, interactive = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative rounded-xl bg-[var(--acr-surface)] backdrop-blur-xl",
      "transition-[transform,background-color] duration-200",
      interactive &&
        "hover:-translate-y-px hover:bg-[var(--acr-surface-hover)] " +
        "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-xl " +
        "before:shadow-[0_12px_28px_rgba(0,0,0,0.28)] before:opacity-0 " +
        "before:transition-opacity before:duration-200 hover:before:opacity-100",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

export { Card }
