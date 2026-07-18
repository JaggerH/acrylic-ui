"use client"

import { Trash2 } from "lucide-react"

import { Button } from "@/registry/acrylic/button"
import { Card } from "@/registry/acrylic/card"
import { ExampleBackdrop } from "@/components/example-backdrop"

// ImageThumbCard — a Photos "Albums" list row on the acrylic Card: a 2×2 photo
// mosaic with a count badge, a title / place / date stack, and a trailing action
// that fades in on hover. `interactive` gives the row the Card's hover lift, so it
// reads as a clickable surface. Generic — pass any four photos + fields.

function ImageThumbCard({
  title,
  place,
  date,
  count,
  photos,
}: {
  title: string
  place: string
  date: string
  count: number
  photos: string[] // four thumbnail image URLs
}) {
  return (
    <Card
      interactive
      role="button"
      tabIndex={0}
      className="group flex w-full items-center gap-4 p-4 text-left text-foreground"
    >
      {/* leading media — a 2×2 photo mosaic with a count badge */}
      <div className="relative size-[72px] shrink-0">
        <div className="grid size-full grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-md bg-white/5">
          {photos.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={src} alt="" loading="lazy" className="size-full object-cover" />
          ))}
        </div>
        <span className="absolute -right-1.5 -top-1.5 min-w-[22px] rounded-full bg-primary px-1.5 py-0.5 text-center text-[10px] font-semibold leading-[14px] tabular-nums text-primary-foreground shadow-[0_2px_6px_rgba(0,0,0,0.4)]">
          {count}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1 pr-8">
        <div className="truncate text-[15px] font-semibold leading-5 [letter-spacing:var(--text-title3-tracking)]">
          {title}
        </div>
        <div className="truncate text-[13px] leading-[18px] text-muted-foreground">{place}</div>
        <div className="mt-1 text-[11px] leading-[14px] [letter-spacing:var(--text-subheadline-tracking)] tabular-nums text-[var(--label-tertiary)]">
          {date}
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

const seed = (s: string) => `https://picsum.photos/seed/${s}/160/160`

const items = [
  {
    title: "Iceland",
    place: "Ring Road · Reykjavík",
    date: "August 2024",
    count: 248,
    photos: ["ice1", "ice2", "ice3", "ice4"].map(seed),
  },
  {
    title: "Golden Hour",
    place: "Studio portraits",
    date: "September 1",
    count: 56,
    photos: ["gold1", "gold2", "gold3", "gold4"].map(seed),
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
