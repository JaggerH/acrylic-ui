import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Acrylic Field — the macOS 26 Form layout family. A macOS Form is a LAYOUT
// wrapper, not a control: each Field is one row (a leading label column + a
// trailing control sharing one baseline), rows stacked with a uniform vertical
// rhythm and divided by 1px hairline separators. Tokens here are spacing +
// typography lifted from the Apple macOS 26 UI Kit (tokens/form.json). Colors
// resolve through the Acrylic theme vars (--foreground/--muted-foreground/
// --destructive/--acr-field) so they flip light/dark.
//
// API mirrors shadcn/ui's Field family verbatim (Field, FieldLabel, FieldTitle,
// FieldDescription, FieldError, FieldContent, FieldGroup, FieldSet, FieldLegend,
// FieldSeparator). Most pieces are presentational; only FieldError holds derived
// state and stays a plain function component (no hooks needed).

const fieldVariants = cva("group/field flex data-[invalid=true]:text-destructive", {
  variants: {
    orientation: {
      // vertical = label over control (the default macOS subtitle stack).
      vertical: "flex-col gap-1.5",
      // horizontal = label leading, control trailing on one baseline.
      horizontal: "flex-row items-center justify-between gap-4",
      // responsive = vertical by default, horizontal once the FieldGroup
      // container is wide enough (~28rem) via container queries.
      responsive:
        "flex-col gap-1.5 @md/field-group:flex-row @md/field-group:items-center @md/field-group:justify-between @md/field-group:gap-4",
    },
  },
  defaultVariants: { orientation: "vertical" },
})

function Field({
  className,
  orientation,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation ?? "vertical"}
      className={cn(fieldVariants({ orientation, className }))}
      {...props}
    />
  )
}

function FieldLabel({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"label"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "label"
  return (
    <Comp
      data-slot="field-label"
      className={cn(
        // SFPro-Medium 13 / foreground; mutes when the field is disabled and
        // tints destructive when the field is invalid.
        "flex select-none items-center gap-2 text-[13px] font-medium text-foreground",
        "group-data-[disabled=true]/field:text-muted-foreground",
        "group-data-[invalid=true]/field:text-destructive",
        "has-[[disabled]]:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-title"
      className={cn(
        "flex items-center gap-2 text-[13px] font-medium text-foreground",
        "group-data-[disabled=true]/field:text-muted-foreground",
        "group-data-[invalid=true]/field:text-destructive",
        className
      )}
      {...props}
    />
  )
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        // The macOS "Subtitle": SFPro-Regular 11 / muted, ~2px below the label.
        "text-[11px] font-normal leading-snug text-muted-foreground",
        "group-data-[disabled=true]/field:opacity-60",
        className
      )}
      {...props}
    />
  )
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      // Groups a control with its title/description in a tight vertical stack
      // (gap ≈ 2px). Used inside horizontal rows and choice rows.
      className={cn("flex flex-1 flex-col gap-0.5", className)}
      {...props}
    />
  )
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>
}) {
  // Render nothing when there's no content to show.
  const list = errors?.filter((e) => e?.message)
  if (!children && (!list || list.length === 0)) return null

  let content: React.ReactNode = children
  if (!content && list) {
    content =
      list.length === 1 ? (
        list[0]?.message
      ) : (
        <ul className="ml-4 flex list-disc flex-col gap-0.5">
          {list.map((e, i) => (
            <li key={i}>{e?.message}</li>
          ))}
        </ul>
      )
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn(
        // Same metrics as the description, recolored to the kit destructive red.
        "text-[11px] font-normal leading-snug text-destructive",
        className
      )}
      {...props}
    >
      {content}
    </div>
  )
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      // Stacks Field rows with the kit row rhythm (~21px) and opens a container
      // query context so `responsive` Fields can flip to horizontal.
      className={cn("@container/field-group flex flex-col gap-5", className)}
      {...props}
    />
  )
}

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  )
}

const fieldLegendVariants = cva("font-medium text-foreground", {
  variants: {
    variant: {
      legend: "text-[15px]",
      label: "text-[13px]",
    },
  },
  defaultVariants: { variant: "legend" },
})

function FieldLegend({
  className,
  variant,
  ...props
}: React.ComponentProps<"legend"> & VariantProps<typeof fieldLegendVariants>) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant ?? "legend"}
      className={cn(fieldLegendVariants({ variant, className }))}
      {...props}
    />
  )
}

function FieldSeparator({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-separator"
      role="separator"
      // 1px hairline using the exact kit separator var (rgba black/white 0.05).
      // -my-2.5 cancels one FieldGroup gap (gap-5/20px) so the separator sits
      // centered WITHIN the row rhythm (~21px, the kit value) instead of adding a
      // full extra gap on each side. Optional children render centered over the line.
      className={cn("relative -my-2.5 h-px bg-[var(--acr-field)]", className)}
      {...props}
    >
      {children && (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--acr-panel)] px-2 text-[11px] text-muted-foreground">
          {children}
        </span>
      )}
    </div>
  )
}

export {
  Field,
  FieldLabel,
  FieldTitle,
  FieldDescription,
  FieldError,
  FieldContent,
  FieldGroup,
  FieldSet,
  FieldLegend,
  FieldSeparator,
  fieldVariants,
}
