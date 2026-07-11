import * as React from "react"
import { Search, X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const searchbarVariants = cva(
  cn(
    "relative flex items-center w-full min-w-0 transition-all rounded-full outline-none",
    "text-foreground selection:bg-primary selection:text-primary-foreground",
    "disabled:cursor-not-allowed disabled:opacity-50"
  ),
  {
    variants: {
      variant: {
        default: "border border-[var(--acr-input-border)] bg-[var(--acr-input)] hover:border-[var(--acr-border)] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/25",
        "over-glass": "bg-[var(--acr-input)] hover:bg-[var(--acr-hover)] border-transparent focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/25",
      },
      size: {
        mini: "h-4 pl-5 pr-4 text-[10px]",
        small: "h-5 pl-6 pr-5 text-[11px]",
        medium: "h-6 pl-7 pr-6 text-[13px]",
        large: "h-7 pl-8 pr-6 text-[13px]",
        xl: "h-9 pl-9 pr-8 text-[13px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "medium",
    },
  }
)

export interface SearchbarProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof searchbarVariants> {
  onClear?: () => void
}

const Searchbar = React.forwardRef<HTMLInputElement, SearchbarProps>(
  ({ className, variant, size = "medium", onClear, value, onChange, disabled, ...props }, ref) => {
    const [localValue, setLocalValue] = React.useState("")
    const isControlled = value !== undefined
    const currentValue = isControlled ? value : localValue

    const handleClear = () => {
      if (!isControlled) {
        setLocalValue("")
      }
      onClear?.()
      if (onChange) {
        const event = {
          target: { value: "" },
          currentTarget: { value: "" },
        } as React.ChangeEvent<HTMLInputElement>
        onChange(event)
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setLocalValue(e.target.value)
      }
      onChange?.(e)
    }

    const hasContent = currentValue !== ""

    return (
      <div
        data-slot="searchbar"
        className={cn(searchbarVariants({ variant, size, className }))}
      >
        <Search
          className={cn("absolute text-muted-foreground pointer-events-none", {
            "left-1.5 size-3": size === "mini",
            "left-1.5 size-3.5": size === "small",
            "left-2 size-3.5": size === "medium" || !size,
            "left-2 size-4": size === "large",
            "left-2.5 size-4.5": size === "xl",
          })}
        />
        <input
          ref={ref}
          type="text"
          value={currentValue}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            "w-full h-full bg-transparent border-0 outline-none p-0 focus:ring-0 focus:outline-none placeholder:text-muted-foreground"
          )}
          {...props}
        />
        {hasContent && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              "absolute flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus:outline-none transition-colors",
              {
                "right-1": size === "mini" || size === "small",
                "right-1.5": size === "medium" || size === "large" || !size,
                "right-2": size === "xl",
              }
            )}
          >
            <X
              className={cn({
                "size-2.5": size === "mini",
                "size-3": size === "small" || size === "medium" || size === "large" || !size,
                "size-3.5": size === "xl",
              })}
            />
          </button>
        )}
      </div>
    )
  }
)
Searchbar.displayName = "Searchbar"

export { Searchbar }
