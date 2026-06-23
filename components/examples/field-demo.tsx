"use client"

import { Input } from "@/registry/acrylic/input"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/registry/acrylic/field"

// A small sign-up form: vertical Fields (label + Input + description), the last
// one in an invalid state showing a FieldError, all stacked in a FieldGroup.
export default function FieldDemo() {
  return (
    <FieldGroup className="w-full max-w-xs text-foreground">
      <Field>
        <FieldLabel htmlFor="field-demo-name">Name</FieldLabel>
        <Input id="field-demo-name" placeholder="Ada Lovelace" />
        <FieldDescription>The name shown on your profile.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="field-demo-email">Email</FieldLabel>
        <Input id="field-demo-email" type="email" placeholder="ada@example.com" />
        <FieldDescription>We&apos;ll never share your email.</FieldDescription>
      </Field>
      <Field data-invalid>
        <FieldLabel htmlFor="field-demo-password">Password</FieldLabel>
        <Input
          id="field-demo-password"
          type="password"
          defaultValue="123"
          aria-invalid
        />
        <FieldError errors={[{ message: "Must be at least 8 characters." }]} />
      </Field>
    </FieldGroup>
  )
}
