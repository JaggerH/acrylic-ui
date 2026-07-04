"use client"

import * as React from "react"
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/registry/acrylic/context-menu"

import { ExampleBackdrop } from "@/components/example-backdrop"

// Full menu vocabulary: section header, checkbox + radio groups, a submenu, a
// shortcut column, a separator, and a destructive row — all on the frosted panel.
export default function ContextMenuShowcase() {
  const [bookmarks, setBookmarks] = React.useState(true)
  const [fullUrls, setFullUrls] = React.useState(false)
  const [pane, setPane] = React.useState("pedro")

  return (
    <ExampleBackdrop>
      <ContextMenu>
        <ContextMenuTrigger className="flex h-44 w-80 select-none items-center justify-center rounded-[12px] border border-dashed border-border bg-[var(--acr-chip)] text-[13px] text-muted-foreground backdrop-blur-sm">
          Right-click for the full menu
        </ContextMenuTrigger>
        <ContextMenuContent className="w-60">
          <ContextMenuLabel>Page</ContextMenuLabel>
          <ContextMenuItem inset>
            Back
            <ContextMenuShortcut>⌘[</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem inset disabled>
            Forward
            <ContextMenuShortcut>⌘]</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger inset>More tools</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem>
                Save page…
                <ContextMenuShortcut>⌘S</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem>Create shortcut…</ContextMenuItem>
              <ContextMenuItem>Name window…</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem variant="destructive">Clear data</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>

          <ContextMenuSeparator />
          <ContextMenuCheckboxItem checked={bookmarks} onCheckedChange={setBookmarks}>
            Show Bookmarks
            <ContextMenuShortcut>⌘⇧B</ContextMenuShortcut>
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem checked={fullUrls} onCheckedChange={setFullUrls}>
            Show Full URLs
          </ContextMenuCheckboxItem>

          <ContextMenuSeparator />
          <ContextMenuLabel>People</ContextMenuLabel>
          <ContextMenuRadioGroup value={pane} onValueChange={setPane}>
            <ContextMenuRadioItem value="pedro">Pedro Duarte</ContextMenuRadioItem>
            <ContextMenuRadioItem value="colm">Colm Tuite</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>
    </ExampleBackdrop>
  )
}
