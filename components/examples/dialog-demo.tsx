"use client"

import { Button } from "@/registry/acrylic/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/registry/acrylic/dialog"

export default function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open dialog</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Acrylic Dialog</DialogTitle>
          <DialogDescription>
            A 72px frosted overlay blurs the page; the panel is a translucent tint.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
