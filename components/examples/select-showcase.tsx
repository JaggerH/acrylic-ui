"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/registry/acrylic/select"

// Default, grouped (SelectLabel + SelectSeparator), and disabled.
export default function SelectShowcase() {
  return (
    <div className="flex flex-wrap items-start gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">Default</span>
        <Select defaultValue="medium">
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Size…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mini">Mini</SelectItem>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
            <SelectItem value="xl">Extra Large</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">Grouped</span>
        <Select>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Timezone…" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>North America</SelectLabel>
              <SelectItem value="pst">Pacific (PST)</SelectItem>
              <SelectItem value="est">Eastern (EST)</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Europe</SelectLabel>
              <SelectItem value="gmt">London (GMT)</SelectItem>
              <SelectItem value="cet">Central (CET)</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">Disabled</span>
        <Select disabled>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Unavailable…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Option A</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
