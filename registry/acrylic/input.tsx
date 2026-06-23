import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Acrylic Input — the macOS 26 Text Field. A solid control-surface field with a
// hairline border and an accent focus ring, in the five macOS control sizes.
// Geometry (height/radius/padding/font) is lifted from the kit; colors resolve
// through the Acrylic theme vars so they flip light/dark. Unlike Button, radius
// is uniform ~height/4 (4/5/6/7/9) — text fields never go capsule.
// Deliberately NO `backdrop-blur` of its own: it sits inside already-blurred
// chrome, and a nested backdrop-filter would paint a hazy rectangle (artifact).
const inputVariants = cva(
  cn(
    "flex w-full min-w-0 border border-[var(--acr-control-border)] bg-[var(--acr-control)] text-foreground outline-none transition-colors",
    "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
    "hover:border-[var(--acr-border)] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "file:inline-flex file:border-0 file:bg-transparent file:font-medium file:text-foreground"
  ),
  {
    variants: {
      // The five macOS control sizes (heights 16/20/24/28/36 from the kit).
      size: {
        mini: "h-4 rounded-[4px] px-1.5 text-[10px]",
        small: "h-5 rounded-[5px] px-1.5 text-[11px]",
        medium: "h-6 rounded-[6px] px-2 text-[13px]",
        large: "h-7 rounded-[7px] px-2 text-[13px]",
        xl: "h-9 rounded-[9px] px-2.5 text-[13px]",
      },
    },
    defaultVariants: { size: "medium" },
  }
)

function Input({
  className,
  type,
  size,
  ...props
}: Omit<React.ComponentProps<"input">, "size"> &
  VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      data-slot="input"
      data-size={size}
      className={cn(inputVariants({ size, className }))}
      {...props}
    />
  )
}

export { Input, inputVariants }
