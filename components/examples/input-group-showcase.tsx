"use client"

import { useState } from "react"
import { ArrowRight, Search } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/registry/acrylic/input-group"

const MAX = 140

export default function InputGroupShowcase() {
  const [bio, setBio] = useState("")
  return (
    <div className="flex w-full max-w-md flex-col gap-4 text-foreground">
      {/* Leading icon addon */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-muted-foreground">Leading icon</span>
        <InputGroup>
          <InputGroupInput placeholder="Search…" />
          <InputGroupAddon align="inline-start">
            <Search />
          </InputGroupAddon>
        </InputGroup>
      </div>

      {/* Trailing button addon */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-muted-foreground">Trailing button</span>
        <InputGroup>
          <InputGroupInput placeholder="Add a teammate by email…" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton variant="default">Invite</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>

      {/* Text prefix */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-muted-foreground">Text prefix</span>
        <InputGroup>
          <InputGroupInput placeholder="acme.dev" />
          <InputGroupAddon align="inline-start">
            <InputGroupText>https://</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </div>

      {/* Block-end addon with counter + action */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-muted-foreground">Block-end counter</span>
        <InputGroup>
          <InputGroupInput
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, MAX))}
            placeholder="Short bio…"
          />
          <InputGroupAddon align="block-end">
            <InputGroupText>
              {bio.length}/{MAX}
            </InputGroupText>
            <InputGroupButton className="ml-auto" size="icon">
              <ArrowRight />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>

      {/* Auto-resizing textarea */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-muted-foreground">Auto-resize textarea</span>
        <InputGroup>
          <InputGroupTextarea
            autoResize
            maxRows={5}
            placeholder="Grows from 1 row to 5, then scrolls…"
          />
        </InputGroup>
      </div>
    </div>
  )
}
