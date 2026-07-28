import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/registry/acrylic/field"
import { Input } from "@/registry/acrylic/input"

// One size per row, declared twice: on the Field (label) and on the control.
// Both halves of a row always read at the same size.
const rows = [
  { size: "small" as const, label: "Small", value: "11px label · 11px field" },
  { size: "medium" as const, label: "Medium", value: "13px label · 13px field" },
  { size: "large" as const, label: "Large", value: "15px label · 15px field" },
  { size: "xl" as const, label: "Extra large", value: "17px label · 17px field" },
]

export default function FieldSizes() {
  return (
    <FieldGroup className="w-full max-w-md">
      {rows.map((row) => (
        <Field key={row.size} orientation="vertical" size={row.size}>
          <FieldLabel htmlFor={`field-${row.size}`}>{row.label}</FieldLabel>
          <Input id={`field-${row.size}`} size={row.size} defaultValue={row.value} />
          <FieldDescription>
            The description steps down with it, never up to the label.
          </FieldDescription>
        </Field>
      ))}
    </FieldGroup>
  )
}
