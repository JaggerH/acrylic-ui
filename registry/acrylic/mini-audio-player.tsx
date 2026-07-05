"use client"

import * as React from "react"
import { ListMusic, Pause, Play } from "lucide-react"

import { cn } from "@/lib/utils"

// Mini Audio Player — a compact, sidebar-sized "now playing" chip. A shrunk version of the
// AudioPlayer's now-playing info group (cover + title/artist + a bottom seek rail) plus a single
// play/pause. Presentational + controlled — wire it to your audio engine via the callbacks.
//
//   • idle (`track` null/undefined) → renders nothing, so it takes no space when nothing plays.
//   • expanded → cover + title/artist (one clickable unit → onOpen) · play/pause · seek rail.
//   • collapsed (icon-rail sidebar) → just the cover as a button + a hairline progress bar.

export interface MiniAudioPlayerTrack {
  title: string
  artist?: string
  /** cover art URL; a music glyph is shown when absent */
  cover?: string
}

export interface MiniAudioPlayerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** the loaded track; `null`/`undefined` = idle → the component renders nothing */
  track?: MiniAudioPlayerTrack | null
  playing?: boolean
  /** elapsed / total seconds, for the seek rail */
  currentTime?: number
  duration?: number
  /** icon-rail sidebar mode: shrink to just the cover + a progress hairline */
  collapsed?: boolean
  onToggle?: () => void
  /** seek to an absolute position in seconds */
  onSeek?: (seconds: number) => void
  /** open the full player / now-playing surface (cover + title are a button for this) */
  onOpen?: () => void
}

function MiniAudioPlayer({
  track,
  playing = false,
  currentTime = 0,
  duration = 0,
  collapsed = false,
  onToggle,
  onSeek,
  onOpen,
  className,
  ...props
}: MiniAudioPlayerProps) {
  if (!track) return null

  const pct = duration ? Math.max(0, Math.min(100, (currentTime / duration) * 100)) : 0
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration || !onSeek) return
    const r = e.currentTarget.getBoundingClientRect()
    onSeek(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * duration)
  }

  const cover = track.cover ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={track.cover} alt="" loading="lazy" decoding="async" className="size-8 shrink-0 rounded-md object-cover shadow-sm" />
  ) : (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[var(--acr-chip)] text-muted-foreground">
      <ListMusic className="size-3.5" />
    </span>
  )

  if (collapsed) {
    return (
      <div data-slot="mini-audio-player" className={cn("relative", className)} {...props}>
        <button
          onClick={onOpen}
          aria-label={`Open now playing: ${track.title || "Now playing"}`}
          className="relative block overflow-hidden rounded-md transition-transform hover:scale-105"
        >
          {cover}
          <span className="absolute inset-x-0 bottom-0 block h-[2px] bg-foreground/15">
            <span className="block h-full bg-foreground/70" style={{ width: `${pct}%` }} />
          </span>
        </button>
      </div>
    )
  }

  return (
    <div
      data-slot="mini-audio-player"
      className={cn(
        // frosted chip, same material as AudioPlayer's now-playing group; the seek rail hugs the bottom edge
        "relative flex min-w-0 items-center gap-2 rounded-xl bg-[var(--acr-chip)] px-2 pb-2.5 pt-1.5",
        className
      )}
      {...props}
    >
      <button onClick={onOpen} aria-label={`Open now playing: ${track.title || "Now playing"}`} className="flex min-w-0 flex-1 items-center gap-2 text-left">
        {cover}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12px] font-semibold leading-tight">{track.title || "Now playing"}</span>
          {track.artist && <span className="block truncate text-[10px] leading-tight text-muted-foreground">{track.artist}</span>}
        </span>
      </button>
      <button
        onClick={onToggle}
        aria-label={playing ? "Pause" : "Play"}
        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--acr-chip-hover)] text-foreground transition-all hover:scale-105"
      >
        {playing ? <Pause className="size-3.5 fill-current" /> : <Play className="size-3.5 translate-x-px fill-current" />}
      </button>
      {/* seek rail — along the bottom edge of the chip (mirrors audio-player.tsx) */}
      <div onClick={seek} className="absolute inset-x-2 bottom-1 h-[3px] cursor-pointer overflow-hidden rounded-full bg-foreground/15">
        <div className="h-full rounded-full bg-foreground/70" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export { MiniAudioPlayer }
