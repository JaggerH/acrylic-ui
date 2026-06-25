"use client"

import * as React from "react"
import { ListMusic, MessageSquareText, Play } from "lucide-react"

import { AudioPlayer } from "@/registry/acrylic/audio-player"
import { Sheet, SheetContent, SheetTrigger } from "@/registry/acrylic/sheet"

const DURATION = 215 // 3:35

const TOOL =
  "flex size-9 shrink-0 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-[var(--acr-hover)] hover:text-foreground"

// A simple "up next" list — just enough to show the queue Sheet pattern.
const QUEUE = [
  { id: "1", title: "Fantasma", artist: "Tainy, Jhayco", duration: 215 },
  { id: "2", title: "Mojabi Ghost", artist: "Bad Bunny", duration: 234 },
  { id: "3", title: "La Jumpa", artist: "Arcángel, Bad Bunny", duration: 207 },
  { id: "4", title: "Coco Chanel", artist: "Eladio Carrión", duration: 191 },
  { id: "5", title: "TQG", artist: "Karol G, Shakira", duration: 200 },
  { id: "6", title: "Las Mujeres Ya No Lloran", artist: "Shakira", duration: 226 },
]

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`

// A controlled Audio Player: local state drives play/seek/volume, a 1s tick advances the
// elapsed time while playing. The queue button (右下角) opens an "up next" Sheet from the right —
// just a usage example; the list is plain inline JSX, not a separate component.
export default function AudioPlayerDemo() {
  const [playing, setPlaying] = React.useState(false)
  const [time, setTime] = React.useState(42)
  const [volume, setVolume] = React.useState(0.7)
  const [currentId, setCurrentId] = React.useState("1")

  React.useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setTime((t) => (t + 1) % DURATION), 1000)
    return () => clearInterval(id)
  }, [playing])

  return (
    <div className="flex w-full justify-center px-2 py-6">
      <AudioPlayer
        className="max-w-xl"
        track={{ title: "Fantasma", artist: "Tainy, Jhayco", cover: "https://avatar.vercel.sh/fantasma.png" }}
        playing={playing}
        currentTime={time}
        duration={DURATION}
        volume={volume}
        hasPrev
        hasNext
        onToggle={() => setPlaying((p) => !p)}
        onPrev={() => setTime(0)}
        onNext={() => setTime(0)}
        onSeek={setTime}
        onVolumeChange={setVolume}
        actions={
          <>
            <button aria-label="Lyrics" className={TOOL}>
              <MessageSquareText className="size-4" />
            </button>
            {/* queue → opens an "up next" Sheet from the right */}
            <Sheet>
              <SheetTrigger asChild>
                <button aria-label="Up next" className={TOOL}>
                  <ListMusic className="size-4" />
                </button>
              </SheetTrigger>
              <SheetContent className="gap-0 p-0">
                <div className="flex items-baseline gap-1.5 px-4 pt-3 pb-2 text-foreground">
                  <h2 className="text-lg font-bold tracking-tight">Up next</h2>
                  <span className="text-xs text-muted-foreground">{QUEUE.length}</span>
                </div>
                <div className="scrollbar-mac min-h-0 flex-1 overflow-y-auto px-2 pb-2">
                  {QUEUE.map((t) => {
                    const isCurrent = t.id === currentId
                    return (
                      <button
                        key={t.id}
                        onClick={() => setCurrentId(t.id)}
                        className="group flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-[var(--acr-hover)]"
                      >
                        <div className="relative size-11 shrink-0 overflow-hidden rounded-lg">
                          <img src={`https://avatar.vercel.sh/${t.id}.png`} alt="" className="size-full object-cover" />
                          <div
                            className={`absolute inset-0 flex items-center justify-center bg-black/35 transition-opacity ${isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                          >
                            <Play className="size-4 translate-x-px fill-white text-white" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1 text-foreground">
                          <div className={`truncate text-sm font-medium ${isCurrent ? "text-primary" : ""}`}>{t.title}</div>
                          <div className="truncate text-xs text-muted-foreground">{t.artist}</div>
                        </div>
                        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{clock(t.duration)}</span>
                      </button>
                    )
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </>
        }
      />
    </div>
  )
}
