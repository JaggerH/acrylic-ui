"use client"

import { toast } from "sonner"
import { Button } from "@/registry/acrylic/button"
import { Toaster } from "@/registry/acrylic/toaster"

export default function ToasterDemo() {
  return (
    <>
      <Toaster />
      <Button
        variant="secondary"
        onClick={() =>
          toast("New message", {
            description: "Alex sent you a photo.",
            action: { label: "Reply", onClick: () => {} },
          })
        }
      >
        Show notification
      </Button>
    </>
  )
}
