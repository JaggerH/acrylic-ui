"use client"

import * as React from "react"
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

// Acrylic Context Menu — the macOS 26 Menu (right-click / control-click). The panel
// reuses the frosted Popover material (translucent --acr-panel + backdrop-blur), so
// it reads as the same glass as Combobox/Select. Geometry is lifted from the kit's
// 13pt Menu: 13px SF-Medium rows, a leading icon column, a 6px-radius highlight bar,
// an 11px section Header, a faint hairline Separator, a trailing submenu chevron
// (kit 􀆊), and a muted keyboard-shortcut column. Built on @radix-ui/react-context-
// menu; colors resolve through the theme vars so they flip light/dark.
//
// Highlight = System Blue + white text (the macOS accent), as in the kit's rendered
// menu. A submenu trigger whose child is OPEN drops to a neutral gray instead, so
// focus reads as having moved into the child (matching macOS).
const ContextMenu = ContextMenuPrimitive.Root
const ContextMenuTrigger = ContextMenuPrimitive.Trigger
const ContextMenuGroup = ContextMenuPrimitive.Group
const ContextMenuPortal = ContextMenuPrimitive.Portal
const ContextMenuSub = ContextMenuPrimitive.Sub
const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup

// Frosted Popover material — shared with Combobox / Select / Popover content. No
// `overflow-hidden`: submenus portal out and must not be clipped by the panel.
const menuSurface =
  "z-50 min-w-[10rem] rounded-[12px] border border-[var(--acr-border)] bg-[var(--acr-panel)] p-1.5 text-foreground backdrop-blur-xl shadow-[0_0_0_1px_rgba(190,190,190,0.16),0_16px_48px_rgba(0,0,0,0.45)] outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"

// A menu row: 13px SF-Medium, 16px leading icon, 6px-radius highlight, ~24px tall.
// `inset` reserves the leading icon column for icon-less rows; `group/mi` lets the
// shortcut column flip to white when the row is highlighted.
const menuItem =
  "group/mi relative flex cursor-default select-none items-center gap-2 rounded-[6px] px-2 py-1.5 text-[13px] outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4 data-[inset]:pl-8"

// Leaf-row highlight = the macOS accent (System Blue + white text + white glyphs).
const highlightAccent =
  "data-[highlighted]:bg-[var(--primary)] data-[highlighted]:text-primary-foreground"

const ContextMenuSubTrigger = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <ContextMenuPrimitive.SubTrigger
    ref={ref}
    data-slot="context-menu-sub-trigger"
    data-inset={inset || undefined}
    className={cn(
      menuItem,
      // Accent only while closed; once the child opens, drop to a neutral gray.
      "data-[state=closed]:data-[highlighted]:bg-[var(--primary)] data-[state=closed]:data-[highlighted]:text-primary-foreground",
      "data-[state=open]:bg-[var(--acr-chip)] data-[state=open]:text-foreground",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto !size-3 opacity-60" />
  </ContextMenuPrimitive.SubTrigger>
))
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName

const ContextMenuSubContent = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.SubContent
      ref={ref}
      data-slot="context-menu-sub-content"
      className={cn(menuSurface, "origin-(--radix-context-menu-content-transform-origin)", className)}
      {...props}
    />
  </ContextMenuPrimitive.Portal>
))
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName

const ContextMenuContent = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content
      ref={ref}
      data-slot="context-menu-content"
      className={cn(
        menuSurface,
        "scrollbar-mac max-h-(--radix-context-menu-content-available-height) origin-(--radix-context-menu-content-transform-origin) overflow-y-auto",
        className
      )}
      {...props}
    />
  </ContextMenuPrimitive.Portal>
))
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName

const ContextMenuItem = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & {
    inset?: boolean
    variant?: "default" | "destructive"
  }
>(({ className, inset, variant = "default", ...props }, ref) => (
  <ContextMenuPrimitive.Item
    ref={ref}
    data-slot="context-menu-item"
    data-inset={inset || undefined}
    data-variant={variant}
    className={cn(
      menuItem,
      variant === "destructive"
        ? "text-destructive data-[highlighted]:bg-destructive data-[highlighted]:text-white"
        : highlightAccent,
      className
    )}
    {...props}
  />
))
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName

const ContextMenuCheckboxItem = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <ContextMenuPrimitive.CheckboxItem
    ref={ref}
    data-slot="context-menu-checkbox-item"
    className={cn(menuItem, highlightAccent, "pl-8", className)}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex size-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Check className="!size-3.5" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.CheckboxItem>
))
ContextMenuCheckboxItem.displayName = ContextMenuPrimitive.CheckboxItem.displayName

const ContextMenuRadioItem = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.RadioItem
    ref={ref}
    data-slot="context-menu-radio-item"
    className={cn(menuItem, highlightAccent, "pl-8", className)}
    {...props}
  >
    <span className="absolute left-2 flex size-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Circle className="!size-2 fill-current" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.RadioItem>
))
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName

// Section Header — kit's small gray label. `inset` aligns it to the row text.
const ContextMenuLabel = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Label
    ref={ref}
    data-slot="context-menu-label"
    data-inset={inset || undefined}
    className={cn("px-2 pb-1 pt-1.5 text-[11px] font-semibold text-muted-foreground data-[inset]:pl-8", className)}
    {...props}
  />
))
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName

const ContextMenuSeparator = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Separator
    ref={ref}
    data-slot="context-menu-separator"
    // Kit's faint neutral hairline — much softer than the control --acr-border.
    className={cn("-mx-1 my-1 h-px bg-black/10 dark:bg-white/10", className)}
    {...props}
  />
))
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName

// Keyboard-shortcut column — kit's right-aligned tertiary label (⌘K, ⇧⌘N…). Flips
// to white when the row is highlighted (sitting on the System Blue bar).
function ContextMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn(
        "ml-auto pl-4 text-[13px] tracking-wide text-[var(--label-tertiary)] group-data-[highlighted]/mi:text-primary-foreground/80",
        className
      )}
      {...props}
    />
  )
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
  // Raw class strings — so a static mock of the open menu can reuse the exact
  // surface + row geometry instead of re-deriving (and drifting from) it.
  menuSurface as contextMenuSurfaceClass,
  menuItem as contextMenuItemClass,
}
