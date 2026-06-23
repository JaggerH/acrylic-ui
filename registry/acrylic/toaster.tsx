"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

import { cn } from "@/lib/utils"

type ToasterProps = React.ComponentProps<typeof Sonner>

// Acrylic Toaster — modeled on the Apple macOS 26 UI Kit Notifications page. A
// Sonner toast is the web equivalent of a macOS notification *banner*: a frosted,
// translucent card that slides in and auto-dismisses. Geometry is lifted from the
// kit banner (344×78, radius 16, 12/14/12/10 padding, Bold/13 title + Regular/13
// body) and the surface uses the acrylic toast var (--acr-toast, a translucent
// material over a backdrop blur) so the frosted look flips light/dark for free.
//
// Why CSS variables instead of just classes: Sonner injects its CSS at runtime,
// UNLAYERED — so it beats our Tailwind utilities (which live in @layer utilities)
// no matter the specificity (layer order trumps specificity). Fighting that with
// classes silently fails (the bg/border stay Sonner's). So we drive Sonner through
// its OWN variables, set inline (highest precedence): --normal-bg = our acrylic
// material, --normal-border = transparent (no edge — Apple uses the shadow alone,
// which also kills the dark-mode hairline), --border-radius/--width = kit metrics.
// Only props with no Sonner variable (padding, box-shadow) need `!` on a class.
export function Toaster({ className, toastOptions, ...props }: ToasterProps) {
  const { theme = "system" } = useTheme()
  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      offset={56}
      className={cn("toaster group", className)}
      style={
        {
          "--normal-bg": "var(--acr-toast)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "transparent",
          "--border-radius": "16px",
          "--width": "344px",
        } as React.CSSProperties
      }
      toastOptions={{
        ...toastOptions,
        classNames: {
          // Frosted acrylic banner. bg / radius / width / (no) border come from the
          // Sonner vars above; here we add the real material — a backdrop blur +
          // saturate (Sonner sets no backdrop-filter, so the class applies cleanly) —
          // plus kit padding and a soft drop shadow. `!` on padding/shadow because
          // Sonner's unlayered container rule would otherwise win.
          toast:
            "group items-start gap-3 text-foreground !py-3 !pl-[10px] !pr-[14px] !shadow-[0_8px_30px_rgba(0,0,0,0.22)] backdrop-blur-2xl backdrop-saturate-150",
          // App-icon slot — 32×32 leading glyph, matching the kit.
          icon: "mt-0.5 size-8 items-center justify-center [&>svg]:size-8",
          content: "gap-0",
          // Title SFPro-Bold/13, body SFPro-Regular/13 muted.
          title: "text-[13px] font-bold leading-tight",
          description: "text-[13px] leading-snug text-muted-foreground",
          // Action / cancel mirror the acrylic Button (default + neutral, small
          // size). Sonner styles its buttons via a runtime-injected, (0,3,0) rule
          // [data-sonner-toast][data-styled] [data-button] that sets radius/padding/
          // height/font-size/color/background — utility classes can't outrank it, so
          // we force our look with `!` on exactly those props.
          actionButton:
            "self-center !h-5 !gap-1 !rounded-[5px] !bg-primary !px-[10px] !text-[11px] !font-medium !text-primary-foreground !shadow-sm hover:!brightness-110 [&_svg]:!size-3",
          cancelButton:
            "self-center !h-5 !gap-1 !rounded-[5px] !bg-[var(--acr-chip)] !px-[10px] !text-[11px] !font-medium !text-foreground hover:!bg-[var(--acr-chip-hover)] [&_svg]:!size-3",
          // Close affordance — subtle ghost (kit banners have no persistent X).
          closeButton:
            "border-[var(--acr-border-soft)] bg-[var(--acr-chip)] text-foreground hover:bg-[var(--acr-chip-hover)]",
          ...toastOptions?.classNames,
        },
      }}
      {...props}
    />
  )
}
