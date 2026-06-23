import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Acrylic Button — modeled on the Apple macOS 26 UI Kit Buttons page.
// Variants are the kit's four push-button colors + a borderless ghost. Faithful
// to the kit: `default` is the solid, high-emphasis "default button"; the other
// colors are low-emphasis tinted fills with same-hue text. Colors resolve through
// the acrylic theme vars (--primary/--destructive/--acr-*) so they flip light/dark.
// Sizes are the five macOS control sizes; geometry (height/radius/padding/font)
// is lifted verbatim from the kit — note radius is NOT a single formula: mini/
// small/medium are ~quarter-height (4/5/6) while large/xl snap to a full capsule
// (14/18). Hover is a brightness/fill shift, not a color swap, so it reads on glass.
const buttonVariants = cva(
  "inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:                                       // Bordered Default — solid accent, white label (prominent)
          "bg-primary text-primary-foreground shadow-sm hover:brightness-110 active:brightness-95",
        secondary:                                     // Bordered Secondary — 10% accent tint, accent label
          "bg-primary/10 text-primary hover:bg-primary/15 active:bg-primary/20",
        destructive:                                   // Bordered Destructive — 25% red tint, red label
          "bg-destructive/25 text-destructive hover:bg-destructive/35 active:bg-destructive/45",
        neutral:                                       // Neutral — gray fill, foreground label
          "bg-[var(--acr-chip)] text-foreground hover:bg-[var(--acr-chip-hover)]",
        ghost:                                         // Borderless — no fill at rest, accent label (theme color)
          "bg-transparent text-primary hover:bg-[var(--acr-hover)]",
      },
      // The five macOS control sizes (heights 16/20/24/28/36 from the kit).
      size: {
        mini: "h-4 gap-1 rounded-[4px] px-[7px] text-[10px] [&_svg]:size-3",
        small: "h-5 gap-1 rounded-[5px] px-[10px] text-[11px] [&_svg]:size-3",
        medium: "h-6 gap-1.5 rounded-[6px] px-4 text-[13px] [&_svg]:size-3.5",
        large: "h-7 gap-1.5 rounded-[14px] px-4 text-[13px] [&_svg]:size-4",
        xl: "h-9 gap-2 rounded-[18px] px-4 text-[13px] [&_svg]:size-[18px]",
        // Round icon button (the kit's Arrow Button) — square + full-circle radius.
        icon: "size-6 rounded-full [&_svg]:size-4",
      },
    },
    defaultVariants: { variant: "default", size: "medium" },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
