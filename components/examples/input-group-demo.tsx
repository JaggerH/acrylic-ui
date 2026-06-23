"use client"

import { useState } from "react"
import { Search } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/registry/acrylic/input-group"

const MAX = 280

export default function InputGroupDemo() {
  const [value, setValue] = useState("")
  return (
    <div className="flex w-full max-w-md flex-col gap-3 text-foreground">
      {/* Auto-growing comment box: textarea grows to 5 rows, then scrolls. */}
      <InputGroup>
        <InputGroupTextarea
          autoResize
          maxRows={5}
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, MAX))}
          placeholder="Write a comment — it grows as you type…"
        />
        <InputGroupAddon align="block-end">
          <InputGroupText>
            {value.length}/{MAX}
          </InputGroupText>
          <InputGroupButton className="ml-auto" variant="default">
            Send
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      {/* Simple search field: leading icon addon + bare input. */}
      <InputGroup>
        <InputGroupInput placeholder="Search…" />
        <InputGroupAddon align="inline-start">
          <Search />
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
