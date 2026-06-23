"use client"

import * as React from "react"
import { Input } from "@/registry/acrylic/input"
import { Button } from "@/registry/acrylic/button"
import { Combobox } from "@/registry/acrylic/combobox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/registry/acrylic/field"

const regions = [
  { value: "us", label: "United States" },
  { value: "eu", label: "Europe" },
  { value: "apac", label: "Asia Pacific" },
]

// Exercises the whole family: vertical + horizontal orientation, a separator
// inside a group, a fieldset with a legend, and an invalid field with an error.
export default function FieldShowcase() {
  const [region, setRegion] = React.useState("")
  return (
    <div className="flex w-full max-w-md flex-col gap-6 text-foreground">
      <FieldGroup>
        {/* Vertical (default): label over control. */}
        <Field>
          <FieldLabel htmlFor="show-project">Project</FieldLabel>
          <Input id="show-project" placeholder="acrylic-ui" />
          <FieldDescription>Used to generate the workspace URL.</FieldDescription>
        </Field>

        <FieldSeparator />

        {/* Horizontal: label leading, control trailing on one baseline. */}
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>Region</FieldTitle>
            <FieldDescription>Where your data is stored.</FieldDescription>
          </FieldContent>
          <Combobox
            options={regions}
            value={region}
            onValueChange={setRegion}
            placeholder="Select…"
            className="w-40"
          />
        </Field>

        <FieldSeparator />

        {/* Invalid field with a FieldError. */}
        <Field data-invalid>
          <FieldLabel htmlFor="show-slug">Slug</FieldLabel>
          <Input id="show-slug" defaultValue="My Project" aria-invalid />
          <FieldError errors={[{ message: "Slug must be lowercase, no spaces." }]} />
        </Field>
      </FieldGroup>

      {/* FieldSet + FieldLegend grouping related rows. */}
      <FieldSet>
        <FieldLegend>Notifications</FieldLegend>
        <FieldGroup>
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Email digest</FieldTitle>
              <FieldDescription>A weekly summary every Monday.</FieldDescription>
            </FieldContent>
            <Button variant="secondary" size="small">
              Enabled
            </Button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  )
}
