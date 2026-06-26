"use client"

import * as React from "react"
import { BadgeCheckIcon } from "lucide-react"

import { Button } from "@/registry/acrylic/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/registry/acrylic/item"

export default function ItemRtlDemo() {
  const [dir, setDir] = React.useState<"ltr" | "rtl">("rtl")

  return (
    <ItemGroup className="w-full max-w-md" dir={dir}>
      <div className="mb-2 flex items-center justify-between gap-2 text-sm">
        <span>Arabic (العربية)</span>
        <Button
          variant="secondary"
          size="small"
          onClick={() => setDir(dir === "rtl" ? "ltr" : "rtl")}
        >
          Toggle
        </Button>
      </div>
      <Item variant="outline">
        <ItemMedia variant="icon">
          <BadgeCheckIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>عنصر أساسي</ItemTitle>
          <ItemDescription>عنصر بسيط يحتوي على عنوان ووصف.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="secondary" size="small">إجراء</Button>
        </ItemActions>
      </Item>
    </ItemGroup>
  )
}
