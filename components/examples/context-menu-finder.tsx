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

import { ExampleBackdrop } from "@/components/example-backdrop"
import { cn } from "@/lib/utils"

// 1:1 of the kit's "Menus / Examples / 13pt" — a Finder desktop menu.
//
// The menu is defined ONCE as `FINDER`. Both panes render from it:
//   • right pane = the live <ContextMenu> (open it on right-click)
//   • left pane  = the same items as a still "full form"
// Radix can't render a contained, always-open ContextMenu (it positions in the
// viewport and has no declarative `open`), so the left pane re-renders the items —
// from the SAME data, reusing the component's own surface/row classes. The open
// submenu is rendered as a SIBLING layer (not nested inside the panel) so it
// composites like the live portal — otherwise two nested translucent panels let the
// main menu show through the submenu.

type MenuItem = { icon?: LucideIcon; label: string; inset?: boolean; sub?: string[] }
type MenuEntry = { sep: true } | { header: string } | MenuItem

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

const useIsoLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect

function StaticMenu({ items }: { items: MenuEntry[] }) {
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const subTriggerRef = React.useRef<HTMLDivElement>(null)
  const [subTop, setSubTop] = React.useState(0)
  const subEntry = items.find((e): e is MenuItem => "sub" in e && !!e.sub)

  // Anchor the open submenu to the "Clean Up By" row by measuring it, so "Name"
  // lines up with the trigger without a magic offset.
  useIsoLayoutEffect(() => {
    if (wrapRef.current && subTriggerRef.current) {
      const r = subTriggerRef.current.getBoundingClientRect()
      const w = wrapRef.current.getBoundingClientRect()
      setSubTop(r.top - w.top)
    }
  }, [])

  return (
    // wrapper reserves room for the submenu (panel 230 + sub 150 − 7 overlap)
    <div ref={wrapRef} className="relative w-[373px]">
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
              <div key={i} ref={subTriggerRef} className={cn(row, "bg-[var(--acr-chip)]", e.inset && "pl-8")}>
                {Icon && <Icon />}
                {e.label}
                <ChevronRight className="ml-auto !size-3 opacity-60" />
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

      {/* open submenu — a sibling layer (like the live portal), 7px overlap.
          "Name" is the accent-highlighted leaf. */}
      {subEntry?.sub && (
        <div className={cn(surface, "absolute left-[223px] w-[150px]")} style={{ top: subTop }}>
          {subEntry.sub.map((s, j) => (
            <div key={s} className={cn(row, j === 0 && "bg-[var(--primary)] text-primary-foreground")}>
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Caption({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] font-medium text-muted-foreground">{children}</span>
}

export default function ContextMenuFinder() {
  return (
    <ExampleBackdrop className="items-start justify-center gap-10 pt-20 min-h-[34rem]">
      <div className="flex flex-col gap-2">
        <Caption>Full form</Caption>
        <StaticMenu items={FINDER} />
      </div>
      <div className="flex flex-col gap-2">
        <Caption>Right-click ↓</Caption>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div className="flex h-44 w-64 select-none items-center justify-center rounded-[12px] border border-dashed border-border bg-[var(--acr-chip)] text-[13px] text-muted-foreground backdrop-blur-sm">
              Right-click the desktop
            </div>
          </ContextMenuTrigger>
          <LiveMenu items={FINDER} />
        </ContextMenu>
      </div>
    </ExampleBackdrop>
  )
}
