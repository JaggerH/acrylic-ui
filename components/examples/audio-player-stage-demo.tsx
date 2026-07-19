"use client"

import * as React from "react"
import { ListMusic, Maximize2 } from "lucide-react"

import { Button } from "@/registry/acrylic/button"
import { AudioPlayerStage, type AudioPlayerStageTrack } from "@/registry/acrylic/audio-player-stage"

type Demo = AudioPlayerStageTrack & { a: string; b: string; duration: number }

const TRACKS: Demo[] = [
  {
    title: "Monaco (feat. a guest with a very long name)",
    artist: "Bad Bunny, Tainy & friends",
    a: "#22c55e",
    b: "#2563eb",
    duration: 215,
    lyrics: [
      { time: 0, text: "The lights are still on, the corner wind slows" },
      { time: 12, text: "Everything you said keeps circling back" },
      { time: 26, text: "Monaco — the night unrolls like silk" },
      { time: 41, text: "We fold the hours into this melody" },
      { time: 58, text: "Neon shatters into stars on the water" },
      { time: 76, text: "Here comes the chorus, fly with the heartbeat" },
      { time: 95, text: "Don't stop now, let this moment stretch" },
      { time: 118, text: "The sea breeze carried all the doubt away" },
      { time: 140, text: "Monaco, I still remember your smile" },
      { time: 165, text: "The lights will die, but this song won't" },
      { time: 190, text: "Slowly, back to where it all began" },
    ],
  },
  {
    title: "Midnight Neon",
    artist: "Aurora Sky",
    a: "#ec4899",
    b: "#8b5cf6",
    duration: 198,
    lyrics: [
      { time: 0, text: "The city hasn't fallen asleep yet" },
      { time: 14, text: "Neon stretches every shadow long" },
      { time: 30, text: "I walk the empty streets in time" },
      { time: 47, text: "Your voice is still here in my headphones" },
      { time: 66, text: "A pink and purple sky is flickering" },
      { time: 88, text: "This second belongs to just us two" },
      { time: 112, text: "Sing it once more, don't let it end" },
      { time: 138, text: "The neon burns until the morning" },
      { time: 168, text: "And I'm still standing here, waiting" },
    ],
  },
  {
    title: "Golden Hour",
    artist: "JVKE",
    a: "#f59e0b",
    b: "#f43f5e",
    duration: 190,
    lyrics: [
      { time: 0, text: "It was just a Sunday afternoon" },
      { time: 15, text: "The light hit different in the room" },
      { time: 32, text: "You turned to me and everything glowed" },
      { time: 52, text: "Golden hour, don't let it go" },
      { time: 74, text: "Time stood still, we didn't say a word" },
      { time: 98, text: "Every second felt like it was gold" },
      { time: 124, text: "Stay a little longer, hold me close" },
      { time: 152, text: "The sun goes down but you still glow" },
    ],
  },
  {
    // no-lyrics fallback — instrumental; the lyrics pane is hidden and the player centers.
    title: "Weightless (Instrumental)",
    artist: "Marconi Union",
    a: "#0ea5e9",
    b: "#14b8a6",
    duration: 240,
    lyrics: [],
  },
]

// covers drawn on a canvas → same-origin data URIs, so color extraction isn't CORS-blocked
function makeCover(a: string, b: string): string {
  if (typeof document === "undefined") return ""
  const c = document.createElement("canvas")
  c.width = 256
  c.height = 256
  const x = c.getContext("2d")!
  const g = x.createLinearGradient(0, 0, 256, 256)
  g.addColorStop(0, a)
  g.addColorStop(1, b)
  x.fillStyle = g
  x.fillRect(0, 0, 256, 256)
  const r = x.createRadialGradient(80, 64, 8, 80, 64, 200)
  r.addColorStop(0, "rgba(255,255,255,0.28)")
  r.addColorStop(1, "rgba(255,255,255,0)")
  x.fillStyle = r
  x.fillRect(0, 0, 256, 256)
  return c.toDataURL()
}

export default function AudioPlayerStageDemo() {
  const [open, setOpen] = React.useState(false)
  const [fullscreen, setFullscreen] = React.useState(false)
  const [ti, setTi] = React.useState(0)
  const [playing, setPlaying] = React.useState(true)
  const [time, setTime] = React.useState(0)
  const [volume, setVolume] = React.useState(0.7)
  const [covers, setCovers] = React.useState<string[]>([])

  React.useEffect(() => {
    setCovers(TRACKS.map((t) => makeCover(t.a, t.b)))
  }, [])

  const t = TRACKS[ti]
  const track: AudioPlayerStageTrack = {
    title: t.title,
    artist: t.artist,
    cover: covers[ti],
    lyrics: t.lyrics,
  }

  const prev = () => { setTi((i) => (i - 1 + TRACKS.length) % TRACKS.length); setTime(0) }
  const next = () => { setTi((i) => (i + 1) % TRACKS.length); setTime(0) }

  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-3 px-2 py-10">
      <Button onClick={() => { setFullscreen(false); setOpen(true) }}>
        <ListMusic />
        Now Playing
      </Button>
      <Button variant="neutral" onClick={() => { setFullscreen(true); setOpen(true) }}>
        <Maximize2 />
        Full screen
      </Button>

      {open && (
        <AudioPlayerStage
          track={track}
          playing={playing}
          currentTime={time}
          duration={t.duration}
          volume={volume}
          nowPlayingLabel="Now Playing"
          autoFullscreen={fullscreen}
          extractFromCover
          colorTransitionMs={400}
          onToggle={() => setPlaying((p) => !p)}
          onPrev={prev}
          onNext={next}
          onSeek={setTime}
          onVolumeChange={setVolume}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}
