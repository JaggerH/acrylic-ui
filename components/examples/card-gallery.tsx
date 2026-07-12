"use client"

import * as React from "react"

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
  { src: "https://picsum.photos/seed/vlog/600/600", title: "48h 城市漫游 vlog", sub: "STUDIO K · 12万次观看 · 3天前", badge: "12:06" },
  { src: "https://picsum.photos/seed/kyoto/600/600", title: "京都·秋日散步", sub: "@aoi · 22 张", badge: "图集" },
  { src: "https://picsum.photos/seed/tapes/600/600", title: "Midnight Tapes", sub: "Khruangbin · 12 首" },
  { src: "https://picsum.photos/seed/cinema/600/600", title: "如何拍出电影感的运镜", sub: "映画研究所 · 8.4万次观看", badge: "18:32" },
  { src: "https://picsum.photos/seed/kamakura/600/600", title: "镰仓海岸线的黄昏", sub: "@aoi · 18 张" },
  { src: "https://picsum.photos/seed/lofi/600/600", title: "城市轻音乐 Vol.3", sub: "V.A. · 20 首" },
]

function MediaCard({ cover, ratio, style }: { cover: Cover; ratio: string; style: Style }) {
  const overlay = style === "overlay"
  return (
    <Card
      interactive
      role="button"
      tabIndex={0}
      className="group flex flex-col overflow-hidden p-0 text-left focus:outline-none"
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
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-gradient-to-t from-black/85 to-transparent px-3 pb-2.5 pt-8">
            <CardTitle className="self-stretch truncate leading-snug text-white">{cover.title}</CardTitle>
            <CardDescription className="truncate text-white/75">{cover.sub}</CardDescription>
          </div>
        ) : null}
      </div>

      {!overlay ? (
        <div className="flex flex-col gap-1 px-3 pb-3 pt-2.5">
          <CardTitle className="self-stretch truncate leading-snug">{cover.title}</CardTitle>
          <CardDescription className="truncate">{cover.sub}</CardDescription>
        </div>
      ) : null}
    </Card>
  )
}

export default function CardGallery() {
  const [ratio, setRatio] = React.useState<RatioKey>("16:9")
  const [style, setStyle] = React.useState<Style>("default")

  return (
    <ExampleBackdrop className="rounded-2xl bg-[linear-gradient(135deg,#5b21b6_0%,#2563eb_50%,#db2777_100%)] p-6 sm:p-8">
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
