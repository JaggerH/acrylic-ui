"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight, RotateCw, Trash2 } from "lucide-react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/registry/acrylic/context-menu"

import { ExampleBackdrop } from "@/components/example-backdrop"

export default function ContextMenuDemo() {
  return (
    <ExampleBackdrop>
      <ContextMenu>
        <ContextMenuTrigger className="flex h-36 w-72 select-none items-center justify-center rounded-[12px] border border-dashed border-border bg-[var(--acr-chip)] text-[13px] text-muted-foreground backdrop-blur-sm">
          Right-click here
        </ContextMenuTrigger>
        <ContextMenuContent className="w-52">
          <ContextMenuItem>
            <ArrowLeft /> Back
            <ContextMenuShortcut>⌘[</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            <ArrowRight /> Forward
            <ContextMenuShortcut>⌘]</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            <RotateCw /> Reload
            <ContextMenuShortcut>⌘R</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem variant="destructive">
            <Trash2 /> Delete
            <ContextMenuShortcut>⌫</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </ExampleBackdrop>
  )
}
