"use client"

import * as React from "react"
import { Droplet, Moon, Sun } from "lucide-react"

import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"
import { ButtonGroup, ButtonGroupItem } from "@/registry/acrylic/button-group"

// The three registered themes. Acrylic ("Liquid Glass") is the showcase default,
// so the segmented control must offer it explicitly — otherwise, once you toggle
// to Light/Dark there is no way back to Acrylic (Fumadocs' built-in switch is only
// light/dark). Dogfoods the registry's own segmented ButtonGroup.
const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "acrylic", label: "Acrylic", icon: Droplet },
] as const

export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()

  return (
    <ButtonGroup
      variant="segmented"
      size="small"
      value={theme}
      onValueChange={setTheme}
      aria-label="Theme"
      className={cn(className)}
    >
      {THEMES.map(({ value, label, icon: Icon }) => (
        <ButtonGroupItem key={value} value={value} aria-label={label} title={label}>
          <Icon />
        </ButtonGroupItem>
      ))}
    </ButtonGroup>
  )
}
