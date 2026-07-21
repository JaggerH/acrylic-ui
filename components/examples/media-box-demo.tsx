"use client"

import * as React from "react"
import { Maximize2, Play } from "lucide-react"

import { Badge } from "@/registry/acrylic/badge"
import { Button } from "@/registry/acrylic/button"
import {
  MediaBox,
  type MediaBoxSizingSnapshot,
} from "@/registry/acrylic/media-box"
import { ExampleBackdrop } from "@/components/example-backdrop"

const items = {
  wide: {
    label: "Wide video",
    kind: "video" as const,
    src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop",
    naturalWidth: 1600,
    naturalHeight: 900,
  },
  portrait: {
    label: "Tall image",
    kind: "image" as const,
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=720&auto=format&fit=crop",
    naturalWidth: 720,
    naturalHeight: 960,
  },
  player: {
    label: "Overlay slot",
    kind: "video" as const,
    src: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop",
    naturalWidth: 1280,
    naturalHeight: 720,
  },
}

type Key = keyof typeof items

const MIN_WIDTH = 240
const MAX_WIDTH = 520

export default function MediaBoxDemo() {
  const [active, setActive] = React.useState<Key>("wide")
  const [snapshot, setSnapshot] = React.useState<MediaBoxSizingSnapshot | null>(null)
  const item = items[active]

  return (
    <ExampleBackdrop className="flex-col gap-4">
      <div className="flex gap-2">
        {Object.entries(items).map(([key, value]) => (
          <Button
            key={key}
            size="small"
            variant={active === key ? "default" : "neutral"}
            onClick={() => setActive(key as Key)}
          >
            {value.label}
          </Button>
        ))}
      </div>
      <div className="w-full max-w-[520px]">
        <MediaBox
          kind={item.kind}
          src={item.src}
          alt=""
          naturalWidth={item.naturalWidth}
          naturalHeight={item.naturalHeight}
          minWidth={MIN_WIDTH}
          maxWidth={MAX_WIDTH}
          onSizingChange={setSnapshot}
        >
          {active === "player" ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/15">
              <span className="flex size-12 items-center justify-center rounded-full bg-black/55 text-white shadow-sm">
                <Play className="size-5 translate-x-px fill-current" />
              </span>
              <Button
                icon
                size="small"
                variant="ghost"
                aria-label="Open media"
                className="absolute right-2 top-2 bg-black/45 text-white hover:bg-black/60"
              >
                <Maximize2 />
              </Button>
            </div>
          ) : null}
        </MediaBox>
        {/* Constraints → result: the width bounds read as compact pills (the inputs),
            the live measured size is the emphasized output. */}
        <div className="mt-2 flex items-center justify-between gap-3 rounded-lg bg-[var(--acr-card-nested)] px-3 py-2">
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" size="sm" className="tabular-nums">min {MIN_WIDTH}</Badge>
            <Badge variant="secondary" size="sm" className="tabular-nums">max {MAX_WIDTH}</Badge>
          </div>
          <span className="text-[12px] tabular-nums text-foreground">
            {snapshot ? (
              <>
                {snapshot.box.width} × {snapshot.box.height}
                <span className="ml-1 text-muted-foreground">px</span>
              </>
            ) : (
              <span className="text-muted-foreground">measuring…</span>
            )}
          </span>
        </div>
      </div>
    </ExampleBackdrop>
  )
}
