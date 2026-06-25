"use client"

import * as React from "react"
import { ListMusic, MessageSquareText } from "lucide-react"

import { AudioPlayer } from "@/registry/acrylic/audio-player"

const DURATION = 215 // 3:35

// A controlled Audio Player: local state drives play/seek/volume, a 1s tick advances the
// elapsed time while playing. Wire the callbacks to your own audio engine the same way.
export default function AudioPlayerDemo() {
  const [playing, setPlaying] = React.useState(false)
  const [time, setTime] = React.useState(42)
  const [volume, setVolume] = React.useState(0.7)

  React.useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setTime((t) => (t + 1) % DURATION), 1000)
    return () => clearInterval(id)
  }, [playing])

  return (
    <div className="flex w-full justify-center px-2 py-6">
      <AudioPlayer
        className="max-w-xl"
        track={{
          title: "Fantasma",
          artist: "Tainy, Jhayco",
          cover: "https://avatar.vercel.sh/fantasma.png",
        }}
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
            <button
              aria-label="Lyrics"
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-[var(--acr-hover)] hover:text-foreground"
            >
              <MessageSquareText className="size-4" />
            </button>
            <button
              aria-label="Queue"
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-[var(--acr-hover)] hover:text-foreground"
            >
              <ListMusic className="size-4" />
            </button>
          </>
        }
      />
    </div>
  )
}
