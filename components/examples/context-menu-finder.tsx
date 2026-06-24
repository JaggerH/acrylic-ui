"use client"

import * as React from "react"
import { ChevronRight, Folder, Info, Image as ImageIcon, Smartphone } from "lucide-react"
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
  contextMenuItemClass,
  contextMenuSurfaceClass,
} from "@/registry/acrylic/context-menu"

import { cn } from "@/lib/utils"

// 1:1 of the kit's "Menus / Examples / 13pt" — a Finder desktop menu. Left pane:
// the menu in its full open form (a static mock, including the open submenu with the
// accent-highlighted leaf). Right pane: the same menu, live, on right-click.
//
// The static mock reuses the component's own `contextMenuSurfaceClass` /
// `contextMenuItemClass`, so the surface + row geometry is identical to the live
// menu (no hand-tuned padding that could drift). `animate-in`-style state classes in
// those strings are inert here (no data-state), which is fine for a still mock.

// ----- static mock primitives, sharing the component's exact classes -----
const surface = contextMenuSurfaceClass
const row = contextMenuItemClass

function Sep() {
  return <div className="-mx-1 my-1 h-px bg-black/10 dark:bg-white/10" />
}
function Header({ children }: { children: React.ReactNode }) {
  return <div className="px-2 pb-1 pt-1.5 text-[11px] font-semibold text-muted-foreground">{children}</div>
}

function StaticFinderMenu() {
  return (
    <div className={cn(surface, "w-[230px]")}>
      <div className={row}>
        <Folder /> New Folder
      </div>
      <Sep />
      <div className={row}>
        <Info /> Get Info
      </div>
      <div className={row}>
        <ImageIcon /> Change Wallpaper…
      </div>
      <Sep />
      <Header>Desktop Stacks</Header>
      <div className={cn(row, "pl-8")}>Use Stacks</div>

      {/* submenu trigger (open ⇒ neutral gray) + its open submenu, absolutely
          anchored to this row so "Name" lines up with "Clean Up By" automatically */}
      <div className="relative">
        <div className={cn(row, "bg-[var(--acr-chip)] pl-8")}>
          Clean Up By
          <ChevronRight className="ml-auto !size-3 opacity-60" />
        </div>
        <div className={cn(surface, "absolute left-full top-0 ml-1 w-[150px]")}>
          <div className={cn(row, "bg-[var(--primary)] text-primary-foreground")}>Name</div>
          <div className={row}>Kind</div>
          <div className={row}>Date Modified</div>
          <div className={row}>Date Created</div>
          <div className={row}>Size</div>
          <div className={row}>Tags</div>
        </div>
      </div>

      <Sep />
      <div className={row}>
        <Smartphone /> Import from iPhone
      </div>
    </div>
  )
}

// ----- live menu (shared item set) -----
function LiveFinderMenu({ children }: { children: React.ReactNode }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-[230px]">
        <ContextMenuItem>
          <Folder /> New Folder
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>
          <Info /> Get Info
        </ContextMenuItem>
        <ContextMenuItem>
          <ImageIcon /> Change Wallpaper…
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuLabel>Desktop Stacks</ContextMenuLabel>
        <ContextMenuItem inset>Use Stacks</ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger inset>Clean Up By</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-[150px]">
            <ContextMenuItem>Name</ContextMenuItem>
            <ContextMenuItem>Kind</ContextMenuItem>
            <ContextMenuItem>Date Modified</ContextMenuItem>
            <ContextMenuItem>Date Created</ContextMenuItem>
            <ContextMenuItem>Size</ContextMenuItem>
            <ContextMenuItem>Tags</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem>
          <Smartphone /> Import from iPhone
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
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
        <StaticFinderMenu />
      </Wallpaper>
      <Wallpaper label="Right-click ↓" className="sm:flex-[2]" contentClassName="items-center">
        <LiveFinderMenu>
          <div className="flex h-44 w-64 select-none items-center justify-center rounded-[12px] border border-dashed border-white/50 bg-white/10 text-[13px] text-black/50 backdrop-blur-sm">
            Right-click the desktop
          </div>
        </LiveFinderMenu>
      </Wallpaper>
    </div>
  )
}
