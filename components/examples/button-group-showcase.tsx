"use client"

import * as React from "react"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Copy,
  Scissors,
  Clipboard,
} from "lucide-react"

import { Button } from "@/registry/acrylic/button"
import {
  ButtonGroup,
  ButtonGroupItem,
  ButtonGroupToggle,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "@/registry/acrylic/button-group"

// Demonstrates every Button Group variant against the acrylic theme.
export default function ButtonGroupShowcase() {
  const [format, setFormat] = React.useState("center")
  const [marks, setMarks] = React.useState<string[]>(["bold"])

  return (
    <div className="flex flex-col gap-6 text-foreground">
      {/* attached (default): shared gray well, flush buttons, hairline dividers */}
      <Row label="attached">
        <ButtonGroup>
          <Button variant="neutral">
            <Scissors />
            Cut
          </Button>
          <ButtonGroupSeparator />
          <Button variant="neutral">
            <Copy />
            Copy
          </Button>
          <ButtonGroupSeparator />
          <Button variant="neutral">
            <Clipboard />
            Paste
          </Button>
        </ButtonGroup>
      </Row>

      {/* attached with a non-interactive ButtonGroupText slot */}
      <Row label="with text">
        <ButtonGroup>
          <ButtonGroupText>Zoom</ButtonGroupText>
          <ButtonGroupSeparator />
          <Button variant="neutral">100%</Button>
          <ButtonGroupSeparator />
          <Button variant="neutral">Fit</Button>
        </ButtonGroup>
      </Row>

      {/* ghost: flush grouping and dividers, but no shared background well */}
      <Row label="ghost">
        <ButtonGroup variant="ghost">
          <Button variant="neutral">
            <Scissors />
            Cut
          </Button>
          <ButtonGroupSeparator />
          <Button variant="neutral">
            <Copy />
            Copy
          </Button>
          <ButtonGroupSeparator />
          <Button variant="neutral">
            <Clipboard />
            Paste
          </Button>
        </ButtonGroup>
      </Row>

      {/* segmented: controlled value API — the raised white pill SLIDES between
          segments on selection (macOS easing, respects prefers-reduced-motion) */}
      <Row label="segmented">
        <ButtonGroup
          variant="segmented"
          value={format}
          onValueChange={setFormat}
        >
          {(
            [
              ["left", AlignLeft],
              ["center", AlignCenter],
              ["right", AlignRight],
            ] as const
          ).map(([value, Icon]) => (
            <ButtonGroupItem key={value} value={value} aria-label={value}>
              <Icon />
            </ButtonGroupItem>
          ))}
        </ButtonGroup>
      </Row>

      {/* segmented with labels: a wider toolbar so the slide is clearly visible */}
      <Row label="labeled">
        <ButtonGroup
          variant="segmented"
          defaultValue="day"
          onValueChange={() => {}}
        >
          <ButtonGroupItem value="day">Day</ButtonGroupItem>
          <ButtonGroupItem value="week">Week</ButtonGroupItem>
          <ButtonGroupItem value="month">Month</ButtonGroupItem>
          <ButtonGroupItem value="year">Year</ButtonGroupItem>
        </ButtonGroup>
      </Row>

      {/* multiple: a toggle group (select-any) — selected marks tint to the accent;
          several can be on at once. The macOS B/I/U/S formatting toolbar. */}
      <Row label="multiple">
        <ButtonGroup type="multiple" value={marks} onValueChange={setMarks}>
          <ButtonGroupToggle value="bold" aria-label="Bold">
            <Bold />
          </ButtonGroupToggle>
          <ButtonGroupSeparator />
          <ButtonGroupToggle value="italic" aria-label="Italic">
            <Italic />
          </ButtonGroupToggle>
          <ButtonGroupSeparator />
          <ButtonGroupToggle value="underline" aria-label="Underline">
            <Underline />
          </ButtonGroupToggle>
          <ButtonGroupSeparator />
          <ButtonGroupToggle value="strike" aria-label="Strikethrough">
            <Strikethrough />
          </ButtonGroupToggle>
        </ButtonGroup>
      </Row>

      {/* disabled — A and B enable independently (both / one / neither). Unavailable
          buttons dim to 40% and drop their hover, so it's obvious at a glance which
          are usable. */}
      <Row label="disabled">
        <div className="flex flex-col gap-2">
          {(
            [
              ["both", false, false],
              ["A only", false, true],
              ["B only", true, false],
              ["neither", true, true],
            ] as const
          ).map(([state, aOff, bOff]) => (
            <div key={state} className="flex items-center gap-3">
              <span className="w-14 shrink-0 text-[11px] text-muted-foreground">{state}</span>
              <ButtonGroup>
                <Button variant="neutral" disabled={aOff}>Approve</Button>
                <ButtonGroupSeparator />
                <Button variant="neutral" disabled={bOff}>Reject</Button>
              </ButtonGroup>
            </div>
          ))}
        </div>
      </Row>

      {/* disabled in the selectable variants too: a dimmed segment / toggle */}
      <Row label="disabled (selectable)">
        <div className="flex flex-wrap items-center gap-4">
          <ButtonGroup variant="segmented" defaultValue="all">
            <ButtonGroupItem value="all">All</ButtonGroupItem>
            <ButtonGroupItem value="active">Active</ButtonGroupItem>
            <ButtonGroupItem value="archived" disabled>
              Archived
            </ButtonGroupItem>
          </ButtonGroup>
          <ButtonGroup type="multiple" defaultValue={["bold"]}>
            <ButtonGroupToggle value="bold" aria-label="Bold">
              <Bold />
            </ButtonGroupToggle>
            <ButtonGroupSeparator />
            <ButtonGroupToggle value="italic" aria-label="Italic" disabled>
              <Italic />
            </ButtonGroupToggle>
          </ButtonGroup>
        </div>
      </Row>

      {/* split: separate buttons, small gap, no shared well */}
      <Row label="split">
        <ButtonGroup variant="split">
          <Button variant="neutral">
            <Bold />
          </Button>
          <Button variant="neutral">
            <Italic />
          </Button>
          <Button variant="neutral">
            <Underline />
          </Button>
        </ButtonGroup>
      </Row>

    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-20 shrink-0 pt-1 text-xs text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}
