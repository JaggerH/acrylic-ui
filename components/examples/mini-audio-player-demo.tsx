"use client"

import * as React from "react"

import { MiniAudioPlayer } from "@/registry/acrylic/mini-audio-player"

const DURATION = 215 // 3:35

// A controlled Mini Audio Player shown the way it sits in a sidebar footer — expanded, and in
// the collapsed icon-rail mode. Local state drives play/seek; a 1s tick advances the elapsed time
// while playing. `onOpen` (cover/title click) would navigate to the full player in a real app.
export default function MiniAudioPlayerDemo() {
  const [playing, setPlaying] = React.useState(true)
  const [time, setTime] = React.useState(42)

  React.useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setTime((t) => (t + 1) % DURATION), 1000)
    return () => clearInterval(id)
  }, [playing])

  const shared = {
    track: { title: "Fantasma", artist: "Tainy, Jhayco", cover: "https://avatar.vercel.sh/fantasma.png" },
    playing,
    currentTime: time,
    duration: DURATION,
    onToggle: () => setPlaying((p) => !p),
    onSeek: setTime,
    onOpen: () => {},
  }

  return (
    <div className="flex w-full flex-wrap items-end justify-center gap-8 px-2 py-8">
      {/* expanded — as it sits at the bottom of a sidebar */}
      <div className="w-[220px] rounded-2xl bg-[var(--acr-surface)] p-2 shadow-[0_0_0_1px_rgba(190,190,190,0.16),0_16px_48px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="px-1 pb-1.5 text-[11px] text-muted-foreground">Sidebar footer</div>
        <MiniAudioPlayer {...shared} />
      </div>
      {/* collapsed — icon-rail sidebar */}
      <div className="flex w-16 flex-col items-center rounded-2xl bg-[var(--acr-surface)] p-2 shadow-[0_0_0_1px_rgba(190,190,190,0.16),0_16px_48px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="pb-1.5 text-[10px] text-muted-foreground">Icon</div>
        <MiniAudioPlayer {...shared} collapsed />
      </div>
    </div>
  )
}
