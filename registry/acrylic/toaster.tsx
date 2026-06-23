import { Toaster as Sonner } from "sonner"

import { cn } from "@/lib/utils"

type ToasterProps = React.ComponentProps<typeof Sonner>

// Acrylic Toaster — modeled on the Apple macOS 26 UI Kit Notifications page. A
// Sonner toast is the web equivalent of a macOS notification *banner*: a frosted,
// translucent card that slides in and auto-dismisses. Geometry is lifted from the
// kit banner (344×78, radius 16, 12/14/12/10 padding, Bold/13 title + Regular/13
// body) and the surface uses the acrylic toast var (--acr-toast = white 92% /
// dark 95% over backdrop-blur) so the frosted material flips light/dark for free.
export function Toaster({ className, toastOptions, ...props }: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      position="top-center"
      offset={56}
      className={cn("toaster group", className)}
      toastOptions={{
        ...toastOptions,
        classNames: {
          // Banner card: frosted acrylic surface, 16px radius, kit padding,
          // soft hairline + lifted shadow. width matches the kit's 344px.
          toast:
            "group w-[344px] items-start gap-3 rounded-[16px] border border-[var(--acr-border-soft)] bg-[var(--acr-toast)] py-3 pl-[10px] pr-[14px] text-foreground shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl",
          // App-icon slot — 32×32 leading glyph, matching the kit.
          icon: "mt-0.5 size-8 items-center justify-center [&>svg]:size-8",
          content: "gap-0",
          // Title SFPro-Bold/13, body SFPro-Regular/13 muted.
          title: "text-[13px] font-bold leading-tight",
          description: "text-[13px] leading-snug text-muted-foreground",
          // Action button — accent fill capsule (macOS prominent control).
          actionButton:
            "shrink-0 rounded-[10px] bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground hover:brightness-110",
          cancelButton:
            "shrink-0 rounded-[10px] bg-[var(--acr-chip)] px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-[var(--acr-chip-hover)]",
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
