"use client"

import { Cloud, Pause } from "lucide-react"

import { Card } from "@/registry/acrylic/card"
import { ExampleBackdrop } from "@/components/example-backdrop"

// Two real surfaces, not two labels: a static Weather-style summary tile above a
// tappable Now-Playing mini-card — an iOS widget stack. The difference between
// "static" and "interactive" reads through behavior (only one lifts on hover), the
// way Apple demonstrates use rather than annotating the widget.
export default function CardDemo() {
  return (
    <ExampleBackdrop>
      <div className="flex w-full max-w-[20rem] flex-col gap-4 text-foreground">
        {/* Static — a Weather summary. Flat, no lift. */}
        <Card className="flex items-center justify-between gap-3 p-4">
          <div>
            <div className="text-[13px] font-medium text-muted-foreground">San Francisco</div>
            <div className="mt-0.5 text-[40px] font-semibold leading-none tracking-tight tabular-nums">
              18°
            </div>
            <div className="mt-1.5 text-[12px] text-muted-foreground">Mostly Clear · H:20° L:13°</div>
          </div>
          <Cloud className="size-10 shrink-0 text-muted-foreground" strokeWidth={1.25} />
        </Card>

        {/* Interactive — Now Playing. Hover to lift. */}
        <Card interactive className="flex items-center gap-3 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://picsum.photos/seed/midnightcity/160/160"
            alt=""
            loading="lazy"
            className="size-14 shrink-0 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-semibold">Midnight City</div>
            <div className="truncate text-[12px] text-muted-foreground">
              M83 · Hurry Up, We&apos;re Dreaming
            </div>
          </div>
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10">
            <Pause className="size-4 fill-current" />
          </div>
        </Card>
      </div>
    </ExampleBackdrop>
  )
}
