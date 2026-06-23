"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/acrylic/select"

export default function SelectDemo() {
  return (
    <div className="w-full max-w-[200px]">
      <Select>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a fruit…" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="cherry">Cherry</SelectItem>
          <SelectItem value="grape">Grape</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
