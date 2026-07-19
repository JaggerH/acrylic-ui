"use client"

import * as React from "react"
import {
  ChevronDown,
  ListMusic,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Silk } from "./silk"
import { type AudioPlayerTrack, ScrollingText, fmtClock } from "./audio-player"
import { Slider } from "./slider"

// AudioPlayerStage — the full-screen "now playing" face of the Audio Player family. It
// shares AudioPlayer's controlled track/playback API and adds an immersive presentation:
// the flowing Silk background (color pulled from the cover), a big cover, marquee title,
// and time-synced karaoke lyrics. Kept in its own file so the lean bar/mini transport
// (audio-player.tsx) never has to pull in the Silk WebGL shader.

export interface AudioPlayerLyric {
  /** start time of this line, in seconds */
  time: number
  text: string
}

/** an AudioPlayer track plus optional timed lyrics for the stage's karaoke pane */
export interface AudioPlayerStageTrack extends AudioPlayerTrack {
  /** LRC-style timed lines; omit/empty → the lyrics pane is hidden (no-lyrics fallback) */
  lyrics?: AudioPlayerLyric[]
}

const DEFAULT_ACCENT = "#5E3AA8"

// ---- cover → dominant vivid color (same-origin / CORS-enabled covers only) ----------
function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")
}
function extractDominant(img: HTMLImageElement): [number, number, number] | null {
  const s = 24
  const c = document.createElement("canvas")
  c.width = s
  c.height = s
  const cx = c.getContext("2d", { willReadFrequently: true })!
  cx.drawImage(img, 0, 0, s, s)
  let data: Uint8ClampedArray
  try {
    data = cx.getImageData(0, 0, s, s).data
  } catch {
    return null // tainted canvas (cross-origin without CORS)
  }
  const buckets = new Map<number, { n: number; r: number; g: number; b: number }>()
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], al = data[i + 3]
    if (al < 8) continue
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    const lum = (r + g + b) / 3
    const sat = max === 0 ? 0 : (max - min) / max
    if (lum < 25 || lum > 235 || sat < 0.15) continue
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4)
    const e = buckets.get(key) || { n: 0, r: 0, g: 0, b: 0 }
    e.n++; e.r += r; e.g += g; e.b += b
    buckets.set(key, e)
  }
  let best: { n: number; r: number; g: number; b: number } | null = null
  for (const e of buckets.values()) if (!best || e.n > best.n) best = e
  if (!best) return null
  return [best.r / best.n, best.g / best.n, best.b / best.n]
}
// keep the silk vivid: scale a too-dark color up to a floor brightness (hue preserved).
function vivify([r, g, b]: [number, number, number]): string {
  const max = Math.max(r, g, b)
  if (max < 150) {
    const k = 150 / Math.max(max, 1)
    r = Math.min(255, r * k); g = Math.min(255, g * k); b = Math.min(255, b * k)
  }
  return rgbToHex(r, g, b)
}

function useCoverColor(cover: string | undefined, enabled: boolean) {
  const [color, setColor] = React.useState<string | undefined>()
  React.useEffect(() => {
    if (!enabled || !cover) {
      setColor(undefined)
      return
    }
    let cancelled = false
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      if (cancelled) return
      const rgb = extractDominant(img)
      setColor(rgb ? vivify(rgb) : undefined)
    }
    img.onerror = () => !cancelled && setColor(undefined)
    img.src = cover
    return () => {
      cancelled = true
    }
  }, [cover, enabled])
  return color
}

// ---- karaoke line: fills bright over dim as the clock crosses [start, end) ----------
function KaraokeLine({
  text,
  start,
  end,
  clockRef,
}: {
  text: string
  start: number
  end: number
  clockRef: React.RefObject<number>
}) {
  const fillRef = React.useRef<HTMLSpanElement>(null)
  React.useEffect(() => {
    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const t = clockRef.current ?? 0
      const p = end > start ? Math.min(1, Math.max(0, (t - start) / (end - start))) : t >= start ? 1 : 0
      const el = fillRef.current
      if (el) el.style.width = (p * 100).toFixed(2) + "%"
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [start, end, clockRef])
  return (
    <span className="relative inline-block whitespace-nowrap">
      <span className="text-white/25">{text}</span>
      <span
        ref={fillRef}
        style={{ width: 0 }}
        className="absolute inset-y-0 left-0 overflow-hidden whitespace-nowrap text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.5)]"
      >
        {text}
      </span>
    </span>
  )
}

export interface AudioPlayerStageProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onVolumeChange"> {
  track: AudioPlayerStageTrack
  playing?: boolean
  /** elapsed seconds; the component runs its own smooth clock between updates */
  currentTime?: number
  duration?: number
  volume?: number
  hasPrev?: boolean
  hasNext?: boolean
  /** force a background color; when set, cover extraction is skipped */
  accentColor?: string
  /** pull the background color from the cover art (needs a same-origin / CORS cover) */
  extractFromCover?: boolean
  /** ms to crossfade the background between tracks (0 = snap) */
  colorTransitionMs?: number
  /** header label above the cover */
  nowPlayingLabel?: string
  /** request the Fullscreen API on mount (call from a user gesture, e.g. a button) */
  autoFullscreen?: boolean
  onToggle?: () => void
  onPrev?: () => void
  onNext?: () => void
  onSeek?: (seconds: number) => void
  onVolumeChange?: (volume: number) => void
  onClose?: () => void
}

function AudioPlayerStage({
  track,
  playing = false,
  currentTime = 0,
  duration = 0,
  volume,
  hasPrev = true,
  hasNext = true,
  accentColor,
  extractFromCover = true,
  colorTransitionMs = 400,
  nowPlayingLabel = "正在播放",
  autoFullscreen = false,
  onToggle,
  onPrev,
  onNext,
  onSeek,
  onVolumeChange,
  onClose,
  className,
  ...props
}: AudioPlayerStageProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const [coverFailed, setCoverFailed] = React.useState(false)
  const lyrics = track.lyrics ?? []
  const hasLyrics = lyrics.length > 0

  // background color: explicit accent wins, else extract from cover, else default
  const extracted = useCoverColor(track.cover, extractFromCover && !accentColor && !coverFailed)
  const silkColor = accentColor ?? extracted ?? DEFAULT_ACCENT

  // ---- smooth internal clock (so karaoke stays fluid between 1 Hz time updates) ----
  const clockRef = React.useRef(currentTime)
  const [displayTime, setDisplayTime] = React.useState(currentTime)
  React.useEffect(() => {
    // resync only on real jumps (seek), not on our own echoed updates
    if (Math.abs(currentTime - clockRef.current) > 0.75) {
      clockRef.current = currentTime
      setDisplayTime(currentTime)
    }
  }, [currentTime])
  // a new track always restarts the clock, even if `currentTime` didn't change value
  React.useEffect(() => {
    clockRef.current = currentTime
    setDisplayTime(currentTime)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track])
  React.useEffect(() => {
    if (!playing) return
    let raf = 0
    let last = 0
    let acc = 0
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = last ? (now - last) / 1000 : 0
      last = now
      clockRef.current = Math.min(duration || Infinity, clockRef.current + dt)
      acc += dt
      if (acc >= 0.08) {
        acc = 0
        setDisplayTime(clockRef.current)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, duration])

  const seekTo = (t: number) => {
    clockRef.current = t
    setDisplayTime(t)
    onSeek?.(t)
  }

  // ---- active lyric line + auto-scroll ----
  const active = React.useMemo(() => {
    let idx = 0
    for (let i = 0; i < lyrics.length; i++) {
      if (lyrics[i].time <= displayTime) idx = i
      else break
    }
    return idx
  }, [lyrics, displayTime])
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const lineRefs = React.useRef<(HTMLParagraphElement | null)[]>([])
  React.useEffect(() => {
    const el = lineRefs.current[active]
    const box = scrollRef.current
    if (el && box) box.scrollTo({ top: el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2, behavior: "smooth" })
  }, [active, track])

  // ---- fullscreen ----
  const [isFs, setIsFs] = React.useState(false)
  React.useEffect(() => {
    const onChange = () => setIsFs(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [])
  const toggleFs = () => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void rootRef.current?.requestFullscreen?.()
  }
  // enter fullscreen on mount when asked — relies on the user gesture that mounted us
  // (transient activation is still valid a few ms later, in the effect).
  React.useEffect(() => {
    if (autoFullscreen && !document.fullscreenElement) {
      rootRef.current?.requestFullscreen?.().catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !document.fullscreenElement && onClose?.()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const showVolume = typeof volume === "number" && !!onVolumeChange
  const cover = track.cover && !coverFailed

  return (
    <div
      ref={rootRef}
      data-slot="audio-player-stage"
      className={cn("fixed inset-0 z-[60] overflow-hidden", className)}
      {...props}
    >
      <Silk className="!absolute inset-0" color={silkColor} colorTransitionMs={colorTransitionMs} speed={4} scale={0.8} noiseIntensity={1} rotation={0.05} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />

      <div className="relative flex h-full flex-col px-[5vw] pb-8 pt-5 text-white">
        {/* top chrome */}
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            aria-label="收起"
            className={cn("flex size-9 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white", !onClose && "invisible")}
          >
            <ChevronDown className="size-5" />
          </button>
          <span className="text-[11px] font-medium uppercase tracking-widest text-white/60">{nowPlayingLabel}</span>
          <button
            onClick={toggleFs}
            aria-label={isFs ? "退出全屏" : "全屏"}
            className="flex size-9 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            {isFs ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>
        </div>

        {/* body: two columns when lyrics exist, otherwise a centered player */}
        <div className={cn("flex min-h-0 flex-1 items-center gap-[6vw]", hasLyrics ? "justify-start" : "justify-center")}>
          {/* player */}
          <div className={cn("flex w-full max-w-sm flex-col gap-7", hasLyrics && "shrink-0 md:w-[40%]")}>
            <div className={cn("aspect-square w-[min(60vw,280px)] overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/10 transition-transform duration-500 ease-out", hasLyrics ? "" : "mx-auto", playing ? "scale-100" : "scale-95")}>
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={track.cover} alt="" onError={() => setCoverFailed(true)} className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center bg-white/10"><ListMusic className="size-16 text-white/50" /></div>
              )}
            </div>

            <div className={cn("min-w-0", !hasLyrics && "text-center")}>
              <ScrollingText className="text-2xl font-bold leading-tight [text-shadow:0_1px_12px_rgba(0,0,0,0.4)]">{track.title || nowPlayingLabel}</ScrollingText>
              {track.artist && (
                <ScrollingText className="mt-1 text-base leading-tight text-white/70 [text-shadow:0_1px_10px_rgba(0,0,0,0.5)]">{track.artist}</ScrollingText>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Slider value={[Math.min(displayTime, duration)]} min={0} max={duration || 1} step={1} onValueChange={(v) => seekTo(v[0])} aria-label="进度" />
              <div className="flex justify-between font-mono text-[11px] tabular-nums text-white/50">
                <span>{fmtClock(displayTime)}</span>
                <span>-{fmtClock(Math.max(0, duration - displayTime))}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-8">
              <button onClick={onPrev} disabled={!hasPrev} aria-label="上一首" className="flex size-12 items-center justify-center rounded-full text-white/80 transition-transform hover:scale-105 hover:text-white disabled:pointer-events-none disabled:opacity-30"><SkipBack className="size-7 fill-current" /></button>
              <button onClick={onToggle} aria-label={playing ? "暂停" : "播放"} className="flex size-16 items-center justify-center rounded-full bg-white text-black shadow-lg transition-transform hover:scale-105">
                {playing ? <Pause className="size-7 fill-current" /> : <Play className="size-7 translate-x-0.5 fill-current" />}
              </button>
              <button onClick={onNext} disabled={!hasNext} aria-label="下一首" className="flex size-12 items-center justify-center rounded-full text-white/80 transition-transform hover:scale-105 hover:text-white disabled:pointer-events-none disabled:opacity-30"><SkipForward className="size-7 fill-current" /></button>
            </div>

            {showVolume && (
              <div className="flex items-center gap-3 text-white/60">
                <Volume2 className="size-4 shrink-0" />
                <Slider value={[Math.round((volume ?? 0) * 100)]} min={0} max={100} onValueChange={(v) => onVolumeChange?.(v[0] / 100)} aria-label="音量" className="flex-1" />
              </div>
            )}
          </div>

          {/* lyrics — hidden entirely when the track has none */}
          {hasLyrics && (
            <div ref={scrollRef} className="relative hidden min-h-0 flex-1 overflow-y-auto py-[38vh] [scrollbar-width:none] md:block [&::-webkit-scrollbar]:hidden">
              {lyrics.map((ln, i) => {
                const end = i + 1 < lyrics.length ? lyrics[i + 1].time : duration || ln.time + 4
                return (
                  <p
                    key={i}
                    ref={(el) => { lineRefs.current[i] = el }}
                    onClick={() => seekTo(ln.time)}
                    className={cn("max-w-2xl cursor-pointer px-2 py-2.5 text-2xl font-semibold leading-snug transition-colors duration-300 lg:text-3xl", i !== active && "text-white/30 hover:text-white/55")}
                  >
                    {i === active ? <KaraokeLine text={ln.text} start={ln.time} end={end} clockRef={clockRef} /> : ln.text}
                  </p>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { AudioPlayerStage }
