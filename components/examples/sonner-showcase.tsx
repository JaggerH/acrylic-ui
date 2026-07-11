"use client"

import * as React from "react"
import { Check, Download, MessageCircle, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/registry/acrylic/button"
import { ExampleBackdrop } from "@/components/example-backdrop"
import { toast } from "@/registry/acrylic/sonner"

// The static cards show the banner anatomy over a wallpaper; the buttons below fire
// the REAL toasts, which reproduce the same cards (same icon, title, body, actions)
// through the acrylic <Toaster /> — so what you see static is what you get live.
// Geometry/type are from the macOS 26 Notifications page: 344 wide · radius 16 ·
// padding 12/14/12/10 · 32px app icon · 6px icon→text gap (Sonner's) · Title Bold/13 + body
// Regular/13 (same ink).

// Shared app icons — reused by both the static cards and the live toast() calls.
const messagesIcon = (
  <span className="flex size-8 items-center justify-center rounded-[8px] bg-[var(--acr-green)] text-white">
    <MessageCircle className="size-[18px]" />
  </span>
)
const updateIcon = (
  <span className="flex size-8 items-center justify-center rounded-[8px] bg-primary text-white">
    <Download className="size-[18px]" />
  </span>
)

// Bare icons for the Icon variant, styled and sized cleanly.
const successIcon = <Check className="text-[var(--acr-green)]" />
const errorIcon = <X className="text-[var(--acr-red)]" />

const pill =
  "inline-flex h-5 items-center rounded-[5px] px-[10px] text-[11px] font-medium shadow-sm"

// One banner card, styled exactly like the acrylic <Toaster /> output.
function Banner({
  icon,
  title,
  body,
  actions,
  variant = "img",
}: {
  icon?: React.ReactNode
  title: string
  body: string
  actions?: React.ReactNode
  variant?: "img" | "icon"
}) {
  return (
    <div
      className={cn(
        "flex w-[344px] items-center rounded-2xl bg-[var(--acr-toast)] pt-3 pb-3 pr-[14px] shadow-[0_8px_30px_rgba(0,0,0,0.22)] backdrop-blur-2xl backdrop-saturate-150",
        // Padding and Gap based on variant:
        icon && variant === "img" ? "pl-[10px] gap-1.5" : "pl-4 gap-2.5"
      )}
    >
      {icon && (
        <div
          className={cn(
            "shrink-0 flex items-center justify-center",
            variant === "img" ? "size-8" : "size-5 [&_svg]:size-5"
          )}
        >
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-bold leading-tight text-foreground">{title}</p>
        <p className="text-[13px] leading-snug text-foreground">{body}</p>
      </div>
      {/* Sonner renders action/cancel on the right, vertically centered */}
      {actions && <div className="flex shrink-0 items-center gap-2 self-center">{actions}</div>}
    </div>
  )
}

export default function SonnerShowcase() {
  return (
    <ExampleBackdrop className="flex-col gap-6">
      {/* the full-bleed backdrop is the wallpaper that makes the frosted material read */}
      <div className="flex w-full flex-col items-center gap-3">
        <Banner icon={messagesIcon} title="Messages" body="Alex sent you a photo." />
        <Banner
          icon={updateIcon}
          title="Update available"
          body="Version 2.1 is ready to install."
          actions={
            <>
              <span className={`${pill} bg-[var(--acr-chip)] text-foreground`}>Later</span>
              <span className={`${pill} bg-primary text-primary-foreground`}>Install</span>
            </>
          }
        />
        {/* no app icon — text gets extra left padding so it isn't crammed */}
        <Banner title="Reminder" body="Stand-up meeting starts in 10 minutes." />
        <Banner icon={successIcon} title="Saved" body="Your changes are synced." variant="icon" />
        <Banner icon={errorIcon} title="Upload failed" body="Check your connection." variant="icon" />
      </div>

      {/* live triggers — fire the real toasts (top center) into the page's single
          <Toaster /> (the one in the Usage demo above). Each reproduces its card. */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="default"
          onClick={() =>
            toast("Messages", { description: "Alex sent you a photo.", icon: messagesIcon })
          }
        >
          Messages
        </Button>
        <Button
          variant="default"
          onClick={() =>
            toast("Update available", {
              description: "Version 2.1 is ready to install.",
              icon: updateIcon,
              action: { label: "Install", onClick: () => {} },
              cancel: { label: "Later", onClick: () => {} },
            })
          }
        >
          Update
        </Button>
        <Button
          variant="default"
          onClick={() => toast("Reminder", { description: "Stand-up meeting starts in 10 minutes." })}
        >
          Reminder
        </Button>
        <Button
          variant="default"
          onClick={() =>
            toast.success("Saved", { description: "Your changes are synced.", icon: successIcon })
          }
        >
          Success
        </Button>
        <Button
          variant="default"
          onClick={() =>
            toast.error("Upload failed", { description: "Check your connection.", icon: errorIcon })
          }
        >
          Error
        </Button>
        <Button
          variant="default"
          onClick={() => {
            const promise = new Promise((resolve) => setTimeout(resolve, 2000))
            toast.promise(promise, {
              loading: "Saving changes...",
              success: "Changes saved successfully!",
              error: "Could not save changes.",
            })
          }}
        >
          Promise (Spinner)
        </Button>
      </div>
    </ExampleBackdrop>
  )
}
