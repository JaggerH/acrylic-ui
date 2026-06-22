import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Acrylic button — the real macOS push-button types, theme-aware:
//   default     = Prominent (accent-filled, the macOS "default" button)
//   secondary   = Bordered Neutral (translucent gray fill)
//   tinted      = Bordered Colored (accent tint)
//   outline     = Bordered, no fill (quieter)
//   ghost       = Borderless / text
//   destructive = red-filled
//   glow        = a standout CTA (non-standard): dark pill + luminous ring
// Hover feedback is brightness/elevation, not a colour swap, so it reads on glass.
const buttonVariants = cva(
  // macOS 26 control corner radius ≈ height/4 (kit: 4/5/6/7/9 px per size), set on
  // each size. Hover/pressed = brightness/fill shift, not a colour swap.
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      // Apple Push Button classes:
      variant: {
        default:                                       // Bordered Default (prominent)
          "bg-primary text-primary-foreground shadow-sm hover:brightness-110",
        secondary:                                     // Bordered Neutral (gray fill)
          "bg-[var(--acr-chip)] text-foreground hover:bg-[var(--acr-chip-hover)]",
        tinted:                                        // Bordered Colored (accent tint)
          "bg-primary/15 text-primary hover:bg-primary/25",
        outline:                                       // bordered, no fill
          "border border-[var(--acr-border)] bg-transparent text-foreground hover:bg-[var(--acr-hover)]",
        ghost:                                         // Borderless (text)
          "text-foreground hover:bg-[var(--acr-hover)]",
        destructive:                                   // Bordered Destructive
          "bg-destructive text-white shadow-sm hover:brightness-110",
        glow:                                          // standout CTA (non-standard)
          "bg-zinc-900/70 text-white backdrop-blur ring-1 ring-sky-400/70 shadow-[0_0_24px_-4px_rgba(56,189,248,0.55)] hover:ring-sky-300 hover:shadow-[0_0_30px_-2px_rgba(56,189,248,0.75)]",
      },
      // The five macOS control sizes (heights from the kit: 16/20/24/28/36).
      size: {
        mini: "h-4 rounded-[4px] px-2 text-[10px] [&_svg]:size-3",
        small: "h-5 rounded-[5px] px-2.5 text-[11px] [&_svg]:size-3",
        medium: "h-6 rounded-[6px] px-3 text-xs [&_svg]:size-3.5",
        large: "h-7 rounded-[7px] px-3.5 text-[13px] [&_svg]:size-4",
        xl: "h-9 rounded-[9px] px-4 text-[15px] [&_svg]:size-[18px]",
        icon: "size-7 rounded-[7px] [&_svg]:size-4",
      },
    },
    defaultVariants: { variant: "default", size: "large" },
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
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
