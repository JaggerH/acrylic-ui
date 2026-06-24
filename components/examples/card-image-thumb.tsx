"use client"

import { Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/registry/acrylic/button"
import { Card } from "@/registry/acrylic/card"
import { ExampleBackdrop } from "@/components/example-backdrop"

// ImageThumbCard — a list-row recipe on the acrylic Card: a 2×2 image-thumbnail
// tile with a count badge, a title / subtitle / meta stack, and a trailing action
// that fades in on hover. `interactive` gives the row the Card's hover lift, so it
// reads as a clickable surface. Generic — pass any thumbnails + fields.

function ImageThumbCard({
  title,
  subtitle,
  meta,
  count,
  tiles,
}: {
  title: string
  subtitle: string
  meta: string
  count: number
  tiles: string[] // gradient classes standing in for image thumbnails
}) {
  return (
    <Card
      interactive
      role="button"
      tabIndex={0}
      className="group flex w-full items-center gap-4 p-4 text-left text-foreground"
    >
      {/* leading media — a 2×2 thumbnail tile with a count badge */}
      <div className="relative size-[72px] shrink-0">
        <div className="grid size-full grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-md bg-white/5">
          {tiles.map((tile, i) => (
            <div key={i} className={cn("size-full", tile)} />
          ))}
        </div>
        <span className="absolute -right-1.5 -top-1.5 min-w-[22px] rounded-full bg-primary px-1.5 py-0.5 text-center text-[10px] font-semibold leading-[14px] tabular-nums text-primary-foreground shadow-[0_2px_6px_rgba(0,0,0,0.4)]">
          {count}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1 pr-8">
        <div className="truncate text-[15px] font-semibold leading-5 tracking-tight">{title}</div>
        <div className="truncate text-[13px] leading-[18px] text-muted-foreground">{subtitle}</div>
        <div className="mt-1 text-[11px] leading-[14px] tabular-nums text-[var(--label-tertiary)]">
          {meta}
        </div>
      </div>

      {/* trailing action — a red acrylic ghost icon button (xl), fades in on hover */}
      <Button
        icon
        size="xl"
        variant="ghost"
        aria-label={`Delete ${title}`}
        onClick={(e) => e.stopPropagation()}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      >
        <Trash2 />
      </Button>
    </Card>
  )
}

const items = [
  {
    title: "Iceland 2024",
    subtitle: "~/Pictures/Trips/Iceland",
    meta: "2024-08-12",
    count: 248,
    tiles: [
      "bg-gradient-to-br from-sky-400 to-indigo-600",
      "bg-gradient-to-br from-emerald-400 to-teal-700",
      "bg-gradient-to-br from-amber-300 to-rose-500",
      "bg-gradient-to-br from-fuchsia-500 to-purple-700",
    ],
  },
  {
    title: "Studio shoot",
    subtitle: "~/Desktop/studio-0901",
    meta: "2024-09-01",
    count: 56,
    tiles: [
      "bg-gradient-to-br from-rose-400 to-orange-600",
      "bg-gradient-to-br from-zinc-300 to-zinc-600",
      "bg-gradient-to-br from-cyan-300 to-blue-600",
      "bg-gradient-to-br from-lime-300 to-green-600",
    ],
  },
]

export default function CardImageThumb() {
  return (
    <ExampleBackdrop className="flex-col">
      <div className="flex w-full max-w-xl flex-col gap-3">
        {items.map((item) => (
          <ImageThumbCard key={item.title} {...item} />
        ))}
      </div>
    </ExampleBackdrop>
  )
}
