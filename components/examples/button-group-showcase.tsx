"use client"

import * as React from "react"
import {
  Bold,
  Italic,
  Underline,
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
  ButtonGroupSeparator,
  ButtonGroupText,
} from "@/registry/acrylic/button-group"

// Demonstrates every Button Group variant against the acrylic theme.
export default function ButtonGroupShowcase() {
  const [format, setFormat] = React.useState("center")

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

      {/* vertical attached group */}
      <Row label="vertical">
        <ButtonGroup orientation="vertical" className="w-32">
          <Button variant="neutral">Top</Button>
          <ButtonGroupSeparator orientation="horizontal" />
          <Button variant="neutral">Middle</Button>
          <ButtonGroupSeparator orientation="horizontal" />
          <Button variant="neutral">Bottom</Button>
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
