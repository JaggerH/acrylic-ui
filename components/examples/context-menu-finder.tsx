"use client"

import * as React from "react"
import { ChevronRight, Folder, Info, Image as ImageIcon, Smartphone, type LucideIcon } from "lucide-react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  contextMenuItemVariants,
  contextMenuSurfaceClass,
} from "@/registry/acrylic/context-menu"

import { cn } from "@/lib/utils"

// 1:1 of the kit's "Menus / Examples / 13pt" — a Finder desktop menu.
//
// The menu is defined ONCE as `FINDER`. Both panes render from it:
//   • right pane = the live <ContextMenu> (open it on right-click)
//   • left pane  = the same items as a still "full form"
// Radix can't render a contained, always-open ContextMenu (it positions in the
// viewport and has no declarative `open`), so the left pane re-renders the items —
// but from the SAME data, reusing the component's own surface/row classes
// (`contextMenuSurfaceClass` / `contextMenuItemClass`). One definition, no drift.

type MenuEntry =
  | { sep: true }
  | { header: string }
  | { icon?: LucideIcon; label: string; inset?: boolean; sub?: string[] }

const FINDER: MenuEntry[] = [
  { icon: Folder, label: "New Folder" },
  { sep: true },
  { icon: Info, label: "Get Info" },
  { icon: ImageIcon, label: "Change Wallpaper…" },
  { sep: true },
  { header: "Desktop Stacks" },
  { label: "Use Stacks", inset: true },
  { label: "Clean Up By", inset: true, sub: ["Name", "Kind", "Date Modified", "Date Created", "Size", "Tags"] },
  { sep: true },
  { icon: Smartphone, label: "Import from iPhone" },
]

// ----- live menu (the real component) -----
function LiveMenu({ items }: { items: MenuEntry[] }) {
  return (
    <ContextMenuContent className="w-[230px]">
      {items.map((e, i) => {
        if ("sep" in e) return <ContextMenuSeparator key={i} />
        if ("header" in e) return <ContextMenuLabel key={i}>{e.header}</ContextMenuLabel>
        const Icon = e.icon
        if (e.sub)
          return (
            <ContextMenuSub key={i}>
              <ContextMenuSubTrigger inset={e.inset}>
                {Icon && <Icon />}
                {e.label}
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-[150px]">
                {e.sub.map((s) => (
                  <ContextMenuItem key={s}>{s}</ContextMenuItem>
                ))}
              </ContextMenuSubContent>
            </ContextMenuSub>
          )
        return (
          <ContextMenuItem key={i} inset={e.inset}>
            {Icon && <Icon />}
            {e.label}
          </ContextMenuItem>
        )
      })}
    </ContextMenuContent>
  )
}

// ----- static "full form": same data, same classes, plain elements -----
const surface = contextMenuSurfaceClass
const row = contextMenuItemVariants({ size: "default" })

function StaticMenu({ items }: { items: MenuEntry[] }) {
  return (
    <div className={cn(surface, "w-[230px]")}>
      {items.map((e, i) => {
        if ("sep" in e) return <div key={i} className="-mx-1 my-1 h-px bg-black/10 dark:bg-white/10" />
        if ("header" in e)
          return (
            <div key={i} className="px-2 pb-1 pt-1.5 text-[11px] font-semibold text-muted-foreground">
              {e.header}
            </div>
          )
        const Icon = e.icon
        if (e.sub)
          return (
            // submenu trigger (open ⇒ gray) + its open submenu, anchored to this row
            // so "Name" lines up with the trigger automatically
            <div key={i} className="relative">
              <div className={cn(row, "bg-[var(--acr-chip)]", e.inset && "pl-8")}>
                {Icon && <Icon />}
                {e.label}
                <ChevronRight className="ml-auto !size-3 opacity-60" />
              </div>
              <div className={cn(surface, "absolute left-full top-0 w-[150px]")}>
                {e.sub.map((s, j) => (
                  <div key={s} className={cn(row, j === 0 && "bg-[var(--primary)] text-primary-foreground")}>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )
        return (
          <div key={i} className={cn(row, e.inset && "pl-8")}>
            {Icon && <Icon />}
            {e.label}
          </div>
        )
      })}
    </div>
  )
}

function Wallpaper({
  label,
  className,
  contentClassName,
  children,
}: {
  label: string
  className?: string
  contentClassName?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("relative min-h-[32rem] overflow-hidden rounded-[14px]", className)}>
      <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-[#c4b5fd] via-[#a5b4fc] to-[#93c5fd]" />
      <span className="absolute left-3 top-3 z-10 text-[11px] font-medium text-black/40">{label}</span>
      <div className={cn("relative flex h-full min-h-[32rem] justify-center p-5", contentClassName)}>{children}</div>
    </div>
  )
}

export default function ContextMenuFinder() {
  return (
    <div className="-m-10 flex w-[calc(100%+5rem)] flex-col gap-3 self-stretch p-3 sm:flex-row">
      <Wallpaper label="Full form" className="sm:flex-[3]" contentClassName="items-start justify-start pt-5 pl-7">
        <StaticMenu items={FINDER} />
      </Wallpaper>
      <Wallpaper label="Right-click ↓" className="sm:flex-[2]" contentClassName="items-center">
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div className="flex h-44 w-64 select-none items-center justify-center rounded-[12px] border border-dashed border-white/50 bg-white/10 text-[13px] text-black/50 backdrop-blur-sm">
              Right-click the desktop
            </div>
          </ContextMenuTrigger>
          <LiveMenu items={FINDER} />
        </ContextMenu>
      </Wallpaper>
    </div>
  )
}
