"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Badge } from "@/registry/acrylic/badge"
import { ButtonGroup, ButtonGroupItem } from "@/registry/acrylic/button-group"
import { Card, CardDescription, CardTitle } from "@/registry/acrylic/card"
import { ExampleBackdrop } from "@/components/example-backdrop"

// A gallery / media-card recipe on the acrylic Card, with two live segmented
// controls: a SIZE group that swaps the cover's `aspect-ratio` (16:9 / 3:4 / 1:1 —
// one source stays uniform, different sources keep their own ratio), and a STYLE
// group that toggles `default` (caption under the media) vs `overlay` (caption on a
// bottom scrim). Title + subtitle reuse the Card's own `CardTitle` / `CardDescription`
// type — the same as the Cover-image-card example — so the whole family reads as one.

const RATIOS = { "16:9": "16 / 9", "3:4": "3 / 4", "1:1": "1 / 1" } as const
type RatioKey = keyof typeof RATIOS
type Style = "default" | "overlay"

type Cover = { src: string; title: string; sub: string; badge?: string }

const COVERS: Cover[] = [
  { src: "https://picsum.photos/seed/lisboa/600/600", title: "48 Hours in Lisbon", sub: "Studio K · 120K views · 3d ago", badge: "12:06" },
  { src: "https://picsum.photos/seed/kyoto/600/600", title: "Kyoto in Autumn", sub: "@aoi · 22 photos", badge: "Album" },
  { src: "https://picsum.photos/seed/tapes/600/600", title: "Midnight Tapes", sub: "Khruangbin · 12 tracks" },
  { src: "https://picsum.photos/seed/cinema/600/600", title: "Cinematic Camera Moves", sub: "Film Lab · 84K views", badge: "18:32" },
  { src: "https://picsum.photos/seed/kamakura/600/600", title: "Dusk on the Kamakura Coast", sub: "@aoi · 18 photos" },
  { src: "https://picsum.photos/seed/lofi/600/600", title: "City Lo-Fi, Vol. 3", sub: "Various Artists · 20 tracks" },
]

// Hover feedback WITHOUT the lift: the Card's `interactive` prop bakes in a
// `hover:-translate-y-px` displacement — we drop `interactive` and keep only the
// soft float shadow (on ::before) so the tile gains depth on hover but never moves.
const HOVER_FLOAT =
  "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-xl " +
  "before:shadow-[0_12px_28px_rgba(0,0,0,0.28)] before:opacity-0 before:transition-opacity " +
  "before:[transition-timing-function:var(--acr-spring-default)] before:[transition-duration:var(--acr-spring-default-duration)] hover:before:opacity-100"

// Compact media-caption type — a thumbnail caption, not a full CardHeader. Reuse the
// Card's CardTitle/CardDescription for family consistency but step the size down
// (title3 15px → 13px, body 13px → 12px) so it reads as a caption under the media.
const CAPTION_TITLE = "self-stretch truncate text-[13px] font-semibold leading-snug"
const CAPTION_SUB = "truncate text-[12px] leading-snug"

function MediaCard({ cover, ratio, style }: { cover: Cover; ratio: string; style: Style }) {
  const overlay = style === "overlay"
  return (
    <Card
      role="button"
      tabIndex={0}
      className={`group flex flex-col overflow-hidden p-0 text-left focus:outline-none ${HOVER_FLOAT}`}
    >
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: ratio }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cover.src} alt="" loading="lazy" className="size-full object-cover" />

        {cover.badge ? (
          <Badge
            size="sm"
            className="absolute right-1.5 top-1.5 border-transparent bg-black/60 text-white tabular-nums backdrop-blur-sm"
          >
            {cover.badge}
          </Badge>
        ) : null}

        {overlay ? (
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 bg-gradient-to-t from-black/85 to-transparent px-3 pb-2.5 pt-8">
            <CardTitle className={cn(CAPTION_TITLE, "text-white")}>{cover.title}</CardTitle>
            <CardDescription className={cn(CAPTION_SUB, "text-white/70")}>{cover.sub}</CardDescription>
          </div>
        ) : null}
      </div>

      {!overlay ? (
        <div className="flex flex-col gap-0.5 px-3 pb-3 pt-2.5">
          <CardTitle className={CAPTION_TITLE}>{cover.title}</CardTitle>
          <CardDescription className={CAPTION_SUB}>{cover.sub}</CardDescription>
        </div>
      ) : null}
    </Card>
  )
}

export default function CardGallery() {
  const [ratio, setRatio] = React.useState<RatioKey>("16:9")
  const [style, setStyle] = React.useState<Style>("default")

  return (
    <ExampleBackdrop>
      <div className="flex w-full max-w-3xl flex-col gap-5 text-foreground">
        <div className="flex flex-wrap items-center gap-3">
          <ButtonGroup variant="segmented" size="small" value={ratio} onValueChange={(v) => setRatio(v as RatioKey)}>
            {(Object.keys(RATIOS) as RatioKey[]).map((k) => (
              <ButtonGroupItem key={k} value={k} className="tabular-nums">
                {k}
              </ButtonGroupItem>
            ))}
          </ButtonGroup>
          <ButtonGroup variant="segmented" size="small" value={style} onValueChange={(v) => setStyle(v as Style)}>
            <ButtonGroupItem value="default">Default</ButtonGroupItem>
            <ButtonGroupItem value="overlay">Overlay</ButtonGroupItem>
          </ButtonGroup>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {COVERS.map((cover, i) => (
            <MediaCard key={i} cover={cover} ratio={RATIOS[ratio]} style={style} />
          ))}
        </div>
      </div>
    </ExampleBackdrop>
  )
}
