"use client"

import * as React from "react"

import { AudioPlayer } from "@/registry/acrylic/audio-player"

const DURATION = 215 // 3:35

// The `mini` variant, shown the way it sits in a sidebar footer. Local state drives play/seek;
// a 1s tick advances the elapsed time while playing. `onOpen` (cover/title click) would navigate
// to the full player in a real app.
export default function AudioPlayerMiniDemo() {
  const [playing, setPlaying] = React.useState(true)
  const [time, setTime] = React.useState(42)

  React.useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setTime((t) => (t + 1) % DURATION), 1000)
    return () => clearInterval(id)
  }, [playing])

  return (
    <div className="flex w-full justify-center px-2 py-8">
      {/* as it sits at the bottom of a sidebar */}
      <div className="w-[220px] rounded-2xl bg-[var(--acr-surface)] p-2 shadow-[0_16px_48px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="px-1 pb-1.5 text-[11px] text-muted-foreground">Sidebar footer</div>
        <AudioPlayer
          variant="mini"
          track={{ title: "Monaco (feat. someone with a very long name)", artist: "Bad Bunny, Tainy, Jhayco & friends", cover: "https://avatar.vercel.sh/fantasma.png" }}
          playing={playing}
          currentTime={time}
          duration={DURATION}
          onToggle={() => setPlaying((p) => !p)}
          onSeek={setTime}
          onOpen={() => {}}
        />
      </div>
    </div>
  )
}
