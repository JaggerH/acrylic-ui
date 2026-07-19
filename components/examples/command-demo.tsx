"use client"

import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
} from "lucide-react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/registry/acrylic/command"

// A standalone command palette (⌘K-style): the filtering input up top, grouped
// results below. Normally Command lives inside a Popover (that's how Combobox
// uses it); here it's shown flat on the frosted panel surface so the pieces are
// visible. Type to filter — cmdk matches each item by its text.
const SHORTCUT = "ms-auto text-[11px] tracking-widest text-muted-foreground"

export default function CommandDemo() {
  return (
    <Command className="w-full max-w-[360px] rounded-[10px] bg-[var(--acr-panel)] shadow-[0_0_0_1px_rgba(190,190,190,0.16),0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <Calendar className="size-3.5 text-muted-foreground" />
            Calendar
          </CommandItem>
          <CommandItem>
            <Smile className="size-3.5 text-muted-foreground" />
            Search Emoji
          </CommandItem>
          <CommandItem>
            <Calculator className="size-3.5 text-muted-foreground" />
            Calculator
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            <User className="size-3.5 text-muted-foreground" />
            Profile
            <span className={SHORTCUT}>⌘P</span>
          </CommandItem>
          <CommandItem>
            <CreditCard className="size-3.5 text-muted-foreground" />
            Billing
            <span className={SHORTCUT}>⌘B</span>
          </CommandItem>
          <CommandItem>
            <Settings className="size-3.5 text-muted-foreground" />
            Settings
            <span className={SHORTCUT}>⌘S</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
