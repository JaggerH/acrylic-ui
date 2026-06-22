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
        onClick={() => toast("Saved", { description: "Your changes have been saved." })}
      >
        Show toast
      </Button>
    </>
  )
}
