"use client"

import { Button } from "@/registry/acrylic/button"
import { Input } from "@/registry/acrylic/input"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/registry/acrylic/dialog"

// The common shadcn Dialog formats, acrylic-styled: basic-with-form, a dialog
// with no close (X) button, and one with scrollable content + a sticky footer.
// Dialog action buttons are medium (the kit uses 24px here, vs large in Alert).
export default function DialogShowcase() {
  return (
    <div className="flex flex-wrap gap-2">
      {/* Basic — header + form + footer actions */}
      <Dialog>
        <DialogTrigger asChild>
          <Button>Edit profile</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Make changes to your profile, then save.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-1">
            <Input placeholder="Name" defaultValue="Jagger" />
            <Input placeholder="Username" defaultValue="@jagger" />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="neutral">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button>Save</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* No close button — dismiss only via the footer */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="neutral">No close button</Button>
        </DialogTrigger>
        <DialogContent showCloseButton={false} className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>Enable notifications?</DialogTitle>
            <DialogDescription>There is no X — choose an option below.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="neutral">Not now</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button>Enable</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Scrollable content with a sticky header + footer */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost">Scrollable</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Terms of Service</DialogTitle>
            <DialogDescription>Scroll to review; header and footer stay put.</DialogDescription>
          </DialogHeader>
          <div className="scrollbar-mac max-h-[40vh] overflow-y-auto pr-1 text-[13px] text-muted-foreground">
            {Array.from({ length: 12 }).map((_, i) => (
              <p key={i} className="mb-2">
                {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            ))}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Agree</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
