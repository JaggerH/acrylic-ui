"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Acrylic Button Group — modeled on the Apple macOS 26 UI Kit "Segmented Controls"
// page. The kit's grouped-control anatomy maps to three composition variants:
//
//  • attached  (default) — action buttons sharing ONE rounded gray "well"
//    (--acr-field, the kit's rgba(0,0,0,0.05) track), flush, separated by
//    `ButtonGroupSeparator` hairlines. The children's outer corners are rounded
//    to the inner (well − padding) radius and inner corners collapsed to square,
//    exactly like the macOS −/value/+ and indent toolbar groups.
//  • segmented — a selectable control: the same gray well, but the ACTIVE item is
//    a RAISED WHITE rounded pill (--acr-control) with a soft shadow floating over
//    the well. macOS SLIDES that pill to the newly-selected segment, so the
//    preferred API is CONTROLLED: pass `value`/`defaultValue`/`onValueChange` on
//    `ButtonGroup` and `ButtonGroupItem` children keyed by `value`. The pill is a
//    single absolutely-positioned indicator that transitions across equal-width
//    segments. For uncontrolled use, the `data-active`/`aria-pressed` styling on
//    plain children still paints the pill (no slide).
//  • split — separate buttons with a small gap (no shared well), still grouped
//    semantically (role="group"). For sub-groups sitting side by side.
//
// Geometry is lifted from the kit: a uniform 2px well inset (p-0.5) so the white
// pill / flush items sit evenly inset on all four sides; the inner radius is the
// well radius (6) minus the 2px inset = 4, keeping pill and well corners
// concentric. Every color resolves through the acrylic theme vars so the whole
// group flips light/dark for free.

const buttonGroupVariants = cva(
  "inline-flex isolate text-foreground data-[orientation=vertical]:flex-col",
  {
    variants: {
      variant: {
        // One shared gray well; uniform 2px inset; children flush with collapsed
        // inner radii and outer corners rounded to the inner (6 − 2) radius.
        attached: cn(
          "items-stretch rounded-[6px] bg-[var(--acr-field)] p-0.5",
          // outer corners follow the inner well radius; inner corners go square so
          // adjacent children read as one continuous capsule.
          "[&>*]:rounded-none",
          "[&>*:first-child]:rounded-l-[4px] [&>*:last-child]:rounded-r-[4px]",
          "data-[orientation=vertical]:[&>*:first-child]:rounded-t-[4px] data-[orientation=vertical]:[&>*:first-child]:rounded-l-none",
          "data-[orientation=vertical]:[&>*:last-child]:rounded-b-[4px] data-[orientation=vertical]:[&>*:last-child]:rounded-r-none"
        ),
        // Selectable segmented control: gray well + active item = white raised pill.
        // Uniform 2px inset; pill radius 4 (= 6 − 2) stays concentric with the well.
        // This styling is the UNCONTROLLED fallback (instant swap, no slide). When
        // controlled via value/ButtonGroupItem the sliding indicator is rendered
        // instead (see ButtonGroup below).
        segmented: cn(
          "items-stretch gap-px rounded-[6px] bg-[var(--acr-field)] p-0.5",
          "[&>*]:rounded-[4px] [&>*]:shadow-none [&>*]:bg-transparent",
          // the active item (data-active or aria-pressed) becomes the white pill.
          "[&>[data-active=true]]:bg-[var(--acr-control)] [&>[aria-pressed=true]]:bg-[var(--acr-control)]",
          "[&>[data-active=true]]:shadow-[0_1px_2px_rgba(0,0,0,0.16),0_0_0_0.5px_rgba(0,0,0,0.04)]",
          "[&>[aria-pressed=true]]:shadow-[0_1px_2px_rgba(0,0,0,0.16),0_0_0_0.5px_rgba(0,0,0,0.04)]"
        ),
        // Separate buttons, small gap, no shared surface.
        split: "items-center gap-1.5 data-[orientation=vertical]:gap-1.5",
      },
    },
    defaultVariants: { variant: "attached" },
  }
)

// ── Controlled segmented context ──────────────────────────────────────────────
// Shared by the sliding-pill ButtonGroup and its ButtonGroupItem children so each
// item knows its own selected state and can report clicks back to the group.
type SegmentedContextValue = {
  value: string | undefined
  setValue: (value: string) => void
}

const SegmentedContext = React.createContext<SegmentedContextValue | null>(null)

type ButtonGroupProps = React.ComponentProps<"div"> &
  VariantProps<typeof buttonGroupVariants> & {
    orientation?: "horizontal" | "vertical"
    /** Controlled selected value (segmented variant). */
    value?: string
    /** Uncontrolled initial value (segmented variant). */
    defaultValue?: string
    /** Fires with the new value when a segment is selected. */
    onValueChange?: (value: string) => void
  }

function ButtonGroup({
  className,
  variant,
  orientation = "horizontal",
  value,
  defaultValue,
  onValueChange,
  children,
  ...props
}: ButtonGroupProps) {
  // The sliding pill only applies to the segmented variant when used as a
  // value-driven control (any of value/defaultValue/onValueChange supplied).
  const isControlledSegmented =
    variant === "segmented" &&
    (value !== undefined ||
      defaultValue !== undefined ||
      onValueChange !== undefined)

  if (isControlledSegmented) {
    return (
      <SegmentedSlider
        className={className}
        orientation={orientation}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        {...props}
      >
        {children}
      </SegmentedSlider>
    )
  }

  return (
    <div
      role="group"
      data-slot="button-group"
      data-variant={variant ?? "attached"}
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ variant }), className)}
      {...props}
    >
      {children}
    </div>
  )
}

// The macOS sliding segmented control. Equal-width segments (each flex-1) make the
// slide pure CSS: the indicator's width is 100/N% and it is translated by
// index × 100%. We transition `transform`/`width` with a macOS easing and disable
// it under prefers-reduced-motion. role="radiogroup" + arrow-key navigation.
function SegmentedSlider({
  className,
  orientation = "horizontal",
  value: valueProp,
  defaultValue,
  onValueChange,
  children,
  ...props
}: Omit<ButtonGroupProps, "variant"> & {
  orientation?: "horizontal" | "vertical"
}) {
  const items = React.useMemo(
    () =>
      React.Children.toArray(children).filter(
        (child): child is React.ReactElement<ButtonGroupItemProps> =>
          React.isValidElement(child) &&
          (child.type as { __isButtonGroupItem?: boolean })
            ?.__isButtonGroupItem === true
      ),
    [children]
  )
  const values = items.map((item) => item.props.value)

  const [uncontrolled, setUncontrolled] = React.useState<string | undefined>(
    defaultValue ?? values[0]
  )
  const isControlled = valueProp !== undefined
  const value = isControlled ? valueProp : uncontrolled

  const setValue = React.useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolled(next)
      onValueChange?.(next)
    },
    [isControlled, onValueChange]
  )

  const activeIndex = Math.max(0, values.indexOf(value as string))
  const count = items.length || 1
  const vertical = orientation === "vertical"

  // Keyboard: arrows move selection between segments (radiogroup semantics).
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const next = vertical ? "ArrowDown" : "ArrowRight"
    const prev = vertical ? "ArrowUp" : "ArrowLeft"
    if (event.key === next || event.key === prev) {
      event.preventDefault()
      const delta = event.key === next ? 1 : -1
      const target = (activeIndex + delta + count) % count
      setValue(values[target] as string)
    }
  }

  // Indicator size/offset as a fraction of the INNER TRACK (the content box inside
  // the well's 2px padding). Because the indicator and the flex-1 items share the
  // same un-padded positioning context, width = 100/N% and translate = index×100%
  // line up exactly — no measurement, and the pill never overruns the padding.
  const indicatorStyle: React.CSSProperties = vertical
    ? {
        height: `${100 / count}%`,
        transform: `translateY(${activeIndex * 100}%)`,
      }
    : {
        width: `${100 / count}%`,
        transform: `translateX(${activeIndex * 100}%)`,
      }

  return (
    <div
      role="radiogroup"
      data-slot="button-group"
      data-variant="segmented"
      data-orientation={orientation}
      onKeyDown={onKeyDown}
      className={cn(
        // The well: gray track with a uniform 2px inset on all four sides.
        "inline-flex isolate rounded-[6px] bg-[var(--acr-field)] p-0.5 text-foreground",
        className
      )}
      {...props}
    >
      {/* Inner track = the content box (no padding). Both the sliding pill and the
          flex-1 segments are positioned against THIS box, so the 2px well inset is
          honored evenly on every side and the pill stays inside it. */}
      <div
        data-slot="button-group-track"
        className={cn("relative isolate inline-flex flex-1", vertical && "flex-col")}
      >
        {/* The single white pill. Pinned flush to the inner track (inset-0 ⇒ 2px
            from the well edge top/bottom/left/right) and slid via transform. */}
        <div
          aria-hidden
          data-slot="button-group-indicator"
          className={cn(
            "pointer-events-none absolute left-0 top-0 z-0 rounded-[4px] bg-[var(--acr-control)]",
            "shadow-[0_1px_2px_rgba(0,0,0,0.16),0_0_0_0.5px_rgba(0,0,0,0.04)]",
            "transition-[transform,width,height] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]",
            "motion-reduce:transition-none",
            vertical ? "w-full" : "h-full"
          )}
          style={indicatorStyle}
        />
        <SegmentedContext.Provider value={{ value, setValue }}>
          {children}
        </SegmentedContext.Provider>
      </div>
    </div>
  )
}

type ButtonGroupItemProps = React.ComponentProps<"button"> & {
  /** The value this segment selects; matched against ButtonGroup's value. */
  value: string
  asChild?: boolean
}

// A segment in the controlled sliding segmented control. Equal-width (flex-1),
// transparent (the white pill behind it shows selection), role="radio". Use these
// as ButtonGroup children when you pass value/onValueChange.
function ButtonGroupItem({
  className,
  value,
  asChild = false,
  onClick,
  ...props
}: ButtonGroupItemProps) {
  const ctx = React.useContext(SegmentedContext)
  const selected = ctx?.value === value
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      type={asChild ? undefined : "button"}
      role="radio"
      aria-checked={selected}
      data-slot="button-group-item"
      data-active={selected}
      // The active segment is keyboard-reachable; the rest stay out of tab order
      // (arrow keys move between them — standard radiogroup behavior).
      tabIndex={selected ? 0 : -1}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        ctx?.setValue(value)
        onClick?.(event)
      }}
      className={cn(
        "relative z-10 inline-flex flex-1 select-none items-center justify-center whitespace-nowrap",
        "h-6 gap-1.5 rounded-[4px] px-4 text-[13px] font-medium outline-none transition-colors",
        "bg-transparent text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
        "[&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
}
// Tag the component so SegmentedSlider can distinguish real segments from other
// children (separators, stray nodes) when measuring count / values.
;(ButtonGroupItem as unknown as { __isButtonGroupItem: boolean }).__isButtonGroupItem =
  true

// Hairline divider between flush items (attached variant). Lifted from the kit's
// 1px Separator inset ~5px top/bottom on the track — here a thin self-stretching
// rule in --acr-border-soft that flips orientation with the group.
function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & {
  orientation?: "horizontal" | "vertical"
}) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      data-slot="button-group-separator"
      className={cn(
        "shrink-0 self-stretch bg-[var(--acr-border-soft)]",
        orientation === "vertical" ? "my-1 w-px" : "mx-1 h-px",
        className
      )}
      {...props}
    />
  )
}

// Non-interactive text / label slot inside the group (e.g. the value readout in a
// −/value/+ stepper, or a leading label). Matches the segment typography.
function ButtonGroupText({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div"
  return (
    <Comp
      data-slot="button-group-text"
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap px-3 text-[13px] font-medium text-foreground select-none",
        className
      )}
      {...props}
    />
  )
}

export {
  ButtonGroup,
  ButtonGroupItem,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
}
