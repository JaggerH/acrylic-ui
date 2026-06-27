"use client"

import * as React from "react"
import { MailIcon, StarIcon } from "lucide-react"

import {
  ButtonGroup,
  ButtonGroupItem,
} from "@/registry/acrylic/button-group"
import {
  Item,
  ItemAction,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMeta,
  ItemRow,
  ItemTitle,
} from "@/registry/acrylic/item"

const messages = [
  {
    from: "Acrylic Design",
    time: "9:41 AM",
    subject: "ItemRow now has a text-first example",
    preview:
      "Use ItemRow inside ItemContent when a compact preview needs aligned text, metadata, and a trailing status.",
    favorite: true,
  },
  {
    from: "Design Systems",
    time: "Yesterday",
    subject: "Compact rows stay readable",
    preview:
      "Titles truncate independently from timestamps while the body keeps a calm two-line preview.",
    favorite: false,
  },
  {
    from: "A very long sender name from the Acrylic component documentation team",
    time: "Monday",
    subject:
      "This subject line is intentionally long so ItemRow can show title truncation in a narrow text preview",
    preview:
      "This preview text is intentionally longer than the available narrow column width. It should clamp into a compact summary instead of stretching the row or pushing adjacent metadata out of view.",
    favorite: false,
  },
]

const modes = [
  ["default", "Default"],
  ["narrow", "Narrow"],
] as const

type TextMode = (typeof modes)[number][0]

export default function ItemTextDemo() {
  const [mode, setMode] = React.useState<TextMode>("default")
  const isNarrow = mode === "narrow"

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-3">
      <ButtonGroup
        variant="segmented"
        size="small"
        value={mode}
        onValueChange={(value) => setMode(value as TextMode)}
      >
        {modes.map(([value, label]) => (
          <ButtonGroupItem key={value} value={value}>
            {label}
          </ButtonGroupItem>
        ))}
      </ButtonGroup>

      <ItemGroup className={isNarrow ? "w-48" : "w-full"}>
        {messages.map((message) => (
          <Item key={message.subject} variant="outline" size="xs" asChild>
            <button type="button" className="w-full items-start px-3 py-2">
              <ItemContent className="flex min-w-0 flex-col">
                <ItemRow className="h-4 items-center">
                  <ItemTitle className="min-w-0 flex-1 text-[13px] font-semibold leading-4">
                    {message.from}
                  </ItemTitle>
                  <ItemMeta className="text-[11px] leading-4">
                    {message.time}
                  </ItemMeta>
                </ItemRow>
                <ItemRow className="mt-1 h-[13px] items-center">
                  <ItemTitle className="min-w-0 flex-1 text-[11px] font-medium leading-[13px]">
                    {message.subject}
                  </ItemTitle>
                  <ItemAction className="h-3 w-3 text-muted-foreground [&>svg]:size-3">
                    {message.favorite ? <StarIcon /> : <MailIcon />}
                  </ItemAction>
                </ItemRow>
                <ItemDescription className="mt-1 text-[11px] leading-[13px]">
                  {message.preview}
                </ItemDescription>
              </ItemContent>
            </button>
          </Item>
        ))}
      </ItemGroup>
    </div>
  )
}
