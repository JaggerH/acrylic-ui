"use client"

import * as React from "react"
import { ArrowUp, Copy, MoreHorizontal, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/registry/acrylic/dropdown-menu"
import { Button } from "@/registry/acrylic/button"

import { ExampleBackdrop } from "@/components/example-backdrop"

export default function DropdownMenuDemo() {
  const [copied, setCopied] = React.useState(false)
  return (
    <ExampleBackdrop>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button icon variant="ghost" size="medium">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-52">
          <DropdownMenuItem onClick={() => { navigator.clipboard.writeText("demo-id-abc123").catch(() => {}) }}>
            <Copy /> Copy ID
            <DropdownMenuShortcut>abc123</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <ArrowUp /> Share
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <Trash2 /> Delete
            <DropdownMenuShortcut>⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ExampleBackdrop>
  )
}
