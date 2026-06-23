"use client"

import { Input } from "@/registry/acrylic/input"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/registry/acrylic/field"

// macOS aligned form (Mode 1): labels share one right-aligned column sized to the
// widest ("Email address"), so every input starts at the same x and is equal width.
export default function FieldDemo() {
  return (
    <FieldGroup variant="aligned" className="w-full max-w-md text-foreground">
      <Field>
        <FieldLabel htmlFor="fd-project">Project</FieldLabel>
        <Input id="fd-project" placeholder="acrylic-ui" />
      </Field>
      <Field>
        <FieldLabel htmlFor="fd-email">Email address</FieldLabel>
        <Input id="fd-email" type="email" placeholder="you@example.com" />
        <FieldDescription>Used for sign-in and receipts.</FieldDescription>
      </Field>
    </FieldGroup>
  )
}
