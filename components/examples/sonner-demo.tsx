"use client"

import { MessageCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/registry/acrylic/button"
import { Toaster } from "@/registry/acrylic/sonner"
import { ExampleBackdrop } from "@/components/example-backdrop"

// The same app icon used by the static card and the live toast, so clicking the
// button produces exactly the banner shown above it.
const messagesIcon = (
  <span className="flex size-8 items-center justify-center rounded-[8px] bg-[var(--acr-green)] text-white">
    <MessageCircle className="size-[18px]" />
  </span>
)

export default function SonnerDemo() {
  return (
    <ExampleBackdrop className="flex-col gap-6">
      {/* the banner, shown statically so the frosted material is visible without firing one */}
      <div className="flex w-[344px] items-center gap-1.5 rounded-2xl bg-[var(--acr-toast)] pt-3 pb-3 pl-[10px] pr-[14px] shadow-[0_8px_30px_rgba(0,0,0,0.22)] backdrop-blur-2xl backdrop-saturate-150">
        <div className="shrink-0">{messagesIcon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold leading-tight text-foreground">New message</p>
          <p className="text-[13px] leading-snug text-foreground">Alex sent you a photo.</p>
        </div>
      </div>

      {/* …and live: click to slide the same banner in from the top */}
      <Toaster />
      <Button
        variant="secondary"
        onClick={() =>
          toast("New message", {
            description: "Alex sent you a photo.",
            icon: messagesIcon,
            action: { label: "Reply", onClick: () => {} },
          })
        }
      >
        Show notification
      </Button>
    </ExampleBackdrop>
  )
}
