"use client"

import { Button } from "@/registry/acrylic/button"
import { Input } from "@/registry/acrylic/input"
import { Field, FieldGroup, FieldLabel } from "@/registry/acrylic/field"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/registry/acrylic/sheet"

// Faithful to shadcn's official Sheet demo: an "Edit profile" sheet sliding in
// from the right. SheetContent only has gap-4, so the form body gets its own
// horizontal padding (px-4) to align with the header/footer.
export default function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="neutral">Open</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <FieldGroup variant="aligned" className="px-4 text-foreground">
          <Field>
            <FieldLabel htmlFor="sheet-demo-name">Name</FieldLabel>
            <Input id="sheet-demo-name" defaultValue="Pedro Duarte" />
          </Field>
          <Field>
            <FieldLabel htmlFor="sheet-demo-username">Username</FieldLabel>
            <Input id="sheet-demo-username" defaultValue="@peduarte" />
          </Field>
        </FieldGroup>
        <SheetFooter>
          <Button type="submit">Save changes</Button>
          <SheetClose asChild>
            <Button variant="neutral">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
