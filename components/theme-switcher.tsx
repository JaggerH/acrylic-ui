"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Droplet, Moon, Sun } from "lucide-react"

import { cn } from "@/lib/utils"
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
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  // The resolved theme is unknown during SSR / first paint; render the default
  // (acrylic) as active so the markup is stable, then hydrate to the real value.
  // Kept controlled throughout (value always defined) to avoid an uncontrolled→
  // controlled flip in the segmented control.
  const active = mounted ? theme ?? "acrylic" : "acrylic"

  return (
    <ButtonGroup
      variant="segmented"
      size="small"
      value={active}
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
