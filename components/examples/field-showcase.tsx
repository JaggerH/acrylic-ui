"use client"

import * as React from "react"
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Info,
  MoreHorizontal,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/registry/acrylic/input"
import { Button } from "@/registry/acrylic/button"
import { Combobox } from "@/registry/acrylic/combobox"
import { GlassCard } from "@/registry/acrylic/glass-card"
import { Field, FieldGroup, FieldLabel } from "@/registry/acrylic/field"

// Mode 2 — the macOS "Trailing accessory options" settings card: a Card-wrapped
// FieldGroup of rows, each label-left / trailing-control-right (grid-cols-[1fr_auto])
// with hairline dividers. Uses our real Input/Combobox/Button; the controls we
// don't ship yet (switch/stepper/radio/popup/info/more) are inline approximations.

function Switch({ on = false }: { on?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-[18px] w-[30px] shrink-0 items-center rounded-full p-0.5 transition-colors",
        on ? "bg-primary" : "bg-[var(--acr-chip)]"
      )}
    >
      <span className={cn("size-3.5 rounded-full bg-white shadow-sm transition-transform", on && "translate-x-3")} />
    </span>
  )
}

function InfoIcon() {
  return <Info className="size-[18px] shrink-0 text-muted-foreground" />
}

function Popup({ children = "Label" }: { children?: React.ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 rounded-[6px] px-1.5 py-0.5 text-[13px] hover:bg-[var(--acr-hover)]"
    >
      <span>{children}</span>
      <ChevronsUpDown className="size-3.5 text-muted-foreground" />
    </button>
  )
}

function Stepper() {
  return (
    <div className="flex items-stretch overflow-hidden rounded-[6px] border border-[var(--acr-control-border)] bg-[var(--acr-control)]">
      <span className="px-2 py-1 text-[13px] tabular-nums">3.00</span>
      <span className="flex flex-col border-l border-[var(--acr-control-border)]">
        <button type="button" className="flex flex-1 items-center justify-center px-1 hover:bg-[var(--acr-hover)]">
          <ChevronUp className="size-3" />
        </button>
        <button type="button" className="flex flex-1 items-center justify-center border-t border-[var(--acr-control-border)] px-1 hover:bg-[var(--acr-hover)]">
          <ChevronDown className="size-3" />
        </button>
      </span>
    </div>
  )
}

function Radio({ label, on = false }: { label: string; on?: boolean }) {
  return (
    <span className={cn("flex items-center gap-1.5 text-[13px]", !on && "text-muted-foreground")}>
      <span className={cn("grid size-3.5 place-items-center rounded-full", on ? "bg-primary" : "bg-[var(--acr-chip)]")}>
        {on && <span className="size-1.5 rounded-full bg-white" />}
      </span>
      {label}
    </span>
  )
}

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
            <InfoIcon />
          </Row>
          <Row label="Popup">
            <Popup />
          </Row>
          <Row label="Toggle">
            <Switch on />
          </Row>
          <Row label="Info Button + Toggle">
            <span className="flex items-center gap-2">
              <InfoIcon />
              <Switch />
            </span>
          </Row>
          <Row label="Label + Info Button">
            <span className="flex items-center gap-2">
              <span className="text-[13px] text-muted-foreground">Label</span>
              <InfoIcon />
            </span>
          </Row>
          <Row label="Stepper">
            <Stepper />
          </Row>
          <Row label="Stepper + Label">
            <span className="flex items-center gap-2">
              <Stepper />
              <span className="text-[13px] text-muted-foreground">seconds</span>
            </span>
          </Row>
          <Row label="Text Field">
            <Input defaultValue="Value" className="w-32" />
          </Row>
          <Row label="Radio buttons">
            <span className="flex items-center gap-4">
              <Radio label="Option 2" on />
              <Radio label="Option 1" />
            </span>
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
              <Popup>Full Screen</Popup>
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
