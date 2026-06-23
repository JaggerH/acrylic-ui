"use client"

import { Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/registry/acrylic/button"
import { Card } from "@/registry/acrylic/card"
import { ExampleBackdrop } from "@/components/example-backdrop"

// A reusable "session" list row — lifted from Snapick's TaskList — rebuilt on the
// acrylic Card: a 2×2 thumbnail tile with a count badge, a title / path / date
// stack, and a trailing trash button that fades in on hover. `interactive` gives
// the whole row the Card's hover lift, so it reads as a clickable surface.

type Session = {
  name: string
  path: string
  date: string
  count: number
  tiles: string[] // gradient classes standing in for photo thumbnails
}

const sessions: Session[] = [
  {
    name: "Iceland 2024",
    path: "~/Pictures/Trips/Iceland",
    date: "2024-08-12",
    count: 248,
    tiles: [
      "bg-gradient-to-br from-sky-400 to-indigo-600",
      "bg-gradient-to-br from-emerald-400 to-teal-700",
      "bg-gradient-to-br from-amber-300 to-rose-500",
      "bg-gradient-to-br from-fuchsia-500 to-purple-700",
    ],
  },
  {
    name: "Studio shoot",
    path: "~/Desktop/studio-0901",
    date: "2024-09-01",
    count: 56,
    tiles: [
      "bg-gradient-to-br from-rose-400 to-orange-600",
      "bg-gradient-to-br from-zinc-300 to-zinc-600",
      "bg-gradient-to-br from-cyan-300 to-blue-600",
      "bg-gradient-to-br from-lime-300 to-green-600",
    ],
  },
]

function Thumbnails({ tiles, count }: { tiles: string[]; count: number }) {
  return (
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
  )
}

function SessionCard({ session }: { session: Session }) {
  return (
    <Card
      interactive
      role="button"
      tabIndex={0}
      className="group flex w-full items-center gap-4 p-4 text-left text-foreground"
    >
      <Thumbnails tiles={session.tiles} count={session.count} />

      <div className="flex min-w-0 flex-1 flex-col gap-1 pr-8">
        <div className="truncate text-[15px] font-semibold leading-5 tracking-tight">
          {session.name}
        </div>
        <div className="truncate text-[13px] leading-[18px] text-muted-foreground">
          {session.path}
        </div>
        <div className="mt-1 text-[11px] leading-[14px] tabular-nums text-[var(--label-tertiary)]">
          {session.date}
        </div>
      </div>

      {/* trailing trash — vertically centered, fades in on row hover */}
      <Button
        variant="ghost"
        size="icon"
        aria-label="Delete session"
        onClick={(e) => e.stopPropagation()}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground opacity-0 transition-[opacity,color] duration-200 hover:!bg-transparent hover:text-destructive group-hover:opacity-100"
      >
        <Trash2 />
      </Button>
    </Card>
  )
}

export default function CardTasklist() {
  return (
    <ExampleBackdrop className="flex-col">
      <div className="flex w-full max-w-xl flex-col gap-3">
        {sessions.map((s) => (
          <SessionCard key={s.name} session={s} />
        ))}
      </div>
    </ExampleBackdrop>
  )
}
