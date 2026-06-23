"use client"

import * as React from "react"
import { Info, MoreHorizontal } from "lucide-react"

import { Input } from "@/registry/acrylic/input"
import { Button } from "@/registry/acrylic/button"
import { Combobox } from "@/registry/acrylic/combobox"
import { GlassCard } from "@/registry/acrylic/glass-card"
import { Switch } from "@/registry/acrylic/switch"
import { Stepper } from "@/registry/acrylic/stepper"
import { RadioGroup, RadioGroupItem } from "@/registry/acrylic/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/acrylic/select"
import { Field, FieldGroup, FieldLabel } from "@/registry/acrylic/field"

// Mode 2 — the macOS "Trailing accessory options" settings card: a Card-wrapped
// FieldGroup of rows, each label-left / trailing-control-right (grid-cols-[1fr_auto])
// with hairline dividers. Every trailing accessory is a real Acrylic component
// (Switch · Stepper · Select pop-up · RadioGroup · Input · Combobox · Button);
// Info / More are plain glyphs.

// A settings row: label on the left, trailing control on the right.
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Field className="grid-cols-[1fr_auto] px-4 py-2.5">
      <FieldLabel className="font-normal">{label}</FieldLabel>
      {children}
    </Field>
  )
}

export default function FieldShowcase() {
  const [combo, setCombo] = React.useState("value")
  return (
    <div className="w-full max-w-md">
      <p className="mb-3 px-1 text-[15px] font-semibold text-foreground">Trailing accessory options</p>
      <GlassCard className="overflow-hidden bg-[var(--acr-control)]">
        <FieldGroup className="gap-0 divide-y divide-[var(--acr-border-soft)]">
          <Row label="Label">
            <span className="text-[13px] text-muted-foreground">Label</span>
          </Row>
          <Row label="Info">
            <Info className="size-[18px] shrink-0 text-muted-foreground" />
          </Row>
          <Row label="Popup">
            <Select defaultValue="label">
              <SelectTrigger size="small">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="label">Label</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row label="Toggle">
            <Switch size="small" defaultChecked />
          </Row>
          <Row label="Info Button + Toggle">
            <span className="flex items-center gap-2">
              <Info className="size-[18px] shrink-0 text-muted-foreground" />
              <Switch size="small" />
            </span>
          </Row>
          <Row label="Label + Info Button">
            <span className="flex items-center gap-2">
              <span className="text-[13px] text-muted-foreground">Label</span>
              <Info className="size-[18px] shrink-0 text-muted-foreground" />
            </span>
          </Row>
          <Row label="Stepper">
            <Stepper size="small" defaultValue={3} />
          </Row>
          <Row label="Stepper + Label">
            <span className="flex items-center gap-2">
              <Stepper size="small" defaultValue={30} min={0} step={5} />
              <span className="text-[13px] text-muted-foreground">seconds</span>
            </span>
          </Row>
          <Row label="Text Field">
            <Input defaultValue="Value" className="w-32" />
          </Row>
          <Row label="Radio buttons">
            <RadioGroup defaultValue="2" className="flex flex-row items-center gap-4">
              <label className="flex items-center gap-1.5 text-[13px]">
                <RadioGroupItem value="2" size="small" />
                Option 2
              </label>
              <label className="flex items-center gap-1.5 text-[13px]">
                <RadioGroupItem value="1" size="small" />
                Option 1
              </label>
            </RadioGroup>
          </Row>
          <Row label="More button">
            <MoreHorizontal className="size-4 text-muted-foreground" />
          </Row>
          <Row label="Combo Box">
            <Combobox
              options={[{ value: "value", label: "Value" }, { value: "other", label: "Other" }]}
              value={combo}
              onValueChange={setCombo}
              className="w-32"
            />
          </Row>
          <Row label="Menu + Button">
            <span className="flex items-center gap-2">
              <Select defaultValue="full">
                <SelectTrigger size="small">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Screen</SelectItem>
                  <SelectItem value="window">Window</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="neutral" size="small">Choose Display…</Button>
            </span>
          </Row>
          <Row label="Button">
            <Button variant="neutral" size="small">Advanced…</Button>
          </Row>
        </FieldGroup>
      </GlassCard>
    </div>
  )
}
