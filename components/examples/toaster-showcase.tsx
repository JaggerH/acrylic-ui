"use client"

import { toast } from "sonner"
import { Button } from "@/registry/acrylic/button"
import { Toaster } from "@/registry/acrylic/toaster"

// A few notification-banner variants, all rendered through the same acrylic
// <Toaster /> theme: a plain banner, one with an inline action, and the
// success/error status types Sonner ships.
export default function ToasterShowcase() {
  return (
    <>
      <Toaster />
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="secondary"
          onClick={() =>
            toast("New message", { description: "Alex sent you a photo." })
          }
        >
          Default
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            toast("Update available", {
              description: "Version 2.1 is ready to install.",
              action: { label: "Install", onClick: () => {} },
            })
          }
        >
          With action
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            toast.success("Saved", { description: "Your changes are synced." })
          }
        >
          Success
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            toast.error("Upload failed", { description: "Check your connection." })
          }
        >
          Error
        </Button>
      </div>
    </>
  )
}
