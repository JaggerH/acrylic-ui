"use client"

import * as React from "react"
import * as HoverCardPrimitive from "@radix-ui/react-hover-card"
import {
  ListMusic,
  MoreHorizontal,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Slider } from "./slider"

// Audio Player — a floating capsule transport, Apple-Music "mini player" style, on
// the acrylic frosted material (the Card surface: `bg-[var(--acr-surface)] backdrop-blur-xl`).
// Fully presentational and controlled — wire it to your own audio engine via the callbacks.
//
// Anatomy (two groups):
//   • 播放组件 (transport) — Prev / Play-Pause / Next, plus any `actions` you pass on the
//     right (歌词/队列/more). Always visible, so the bar reads as a persistent control strip.
//   • 歌曲信息组件 (now-playing info) — cover + title + artist + a seek bar, as ONE unit that
//     only appears while a `track` is loaded. The progress/seek rail lives along the bottom
//     edge of THIS group (not the whole pill), matching the macOS now-playing card.
//
// The whole pill is a CAPSULE (rounded-full, radius = height/2). The optional volume control
// reveals a VERTICAL acrylic Slider on hover — drag up/down to set the level.

/** mm:ss from seconds; clamps NaN/∞/negative to 0:00. */
function fmtClock(s: number): string {
  if (!Number.isFinite(s) || s < 0) s = 0
  const m = Math.floor(s / 60)
  const r = Math.floor(s % 60)
  return `${m}:${r.toString().padStart(2, "0")}`
}

export interface AudioPlayerTrack {
  title: string
  artist?: string
  /** cover art URL; a music glyph is shown when absent */
  cover?: string
}

const TOOL =
  "flex size-9 shrink-0 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-[var(--acr-hover)] hover:text-foreground disabled:pointer-events-none disabled:opacity-30"

export interface AudioPlayerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onVolumeChange"> {
  /** layout: the full transport bar (default), or a compact `mini` chip for a sidebar / rail —
   *  cover + title/artist + play/pause + seek rail, no prev/next/volume/actions. */
  variant?: "bar" | "mini"
  /** `mini` only — open the full player (cover + title are a button for this) */
  onOpen?: () => void
  /** the loaded track; `null`/`undefined` = idle (bar: transport stays, info hides; mini: renders nothing) */
  track?: AudioPlayerTrack | null
  playing?: boolean
  /** elapsed / total seconds, for the time readout + seek rail */
  currentTime?: number
  duration?: number
  /** 0..1 — pass together with `onVolumeChange` to show the hover volume slider */
  volume?: number
  hasPrev?: boolean
  hasNext?: boolean
  onPrev?: () => void
  onNext?: () => void
  onToggle?: () => void
  /** seek to an absolute position in seconds */
  onSeek?: (seconds: number) => void
  onVolumeChange?: (volume: number) => void
  /** extra tool buttons rendered at the right end of the transport (歌词 / 队列 / more …) */
  actions?: React.ReactNode
}

function AudioPlayer({
  variant = "bar",
  onOpen,
  track,
  playing = false,
  currentTime = 0,
  duration = 0,
  volume,
  hasPrev = false,
  hasNext = false,
  onPrev,
  onNext,
  onToggle,
  onSeek,
  onVolumeChange,
  actions,
  className,
  ...props
}: AudioPlayerProps) {
  const pct = track && duration ? (currentTime / duration) * 100 : 0
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!track || !duration || !onSeek) return
    const r = e.currentTarget.getBoundingClientRect()
    onSeek(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * duration)
  }

  // ===== mini variant — a compact chip for a sidebar/rail; renders nothing when idle =====
  if (variant === "mini") {
    if (!track) return null
    const cover = track.cover ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={track.cover} alt="" loading="lazy" decoding="async" className="size-8 shrink-0 rounded-md object-cover shadow-sm" />
    ) : (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[var(--acr-chip)] text-muted-foreground">
        <ListMusic className="size-3.5" />
      </span>
    )
    return (
      <div
        data-slot="audio-player"
        data-variant="mini"
        className={cn("relative flex min-w-0 items-center gap-2 rounded-xl bg-[var(--acr-chip)] px-2 pb-2.5 pt-1.5", className)}
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
        <div onClick={seek} className="absolute inset-x-2 bottom-1 h-[3px] cursor-pointer overflow-hidden rounded-full bg-foreground/15">
          <div className="h-full rounded-full bg-foreground/70" style={{ width: `${pct}%` }} />
        </div>
      </div>
    )
  }

  const showVolume = typeof volume === "number" && !!onVolumeChange
  const VolIcon = volume === 0 ? VolumeX : (volume ?? 1) < 0.5 ? Volume1 : Volume2

  return (
    <div
      data-slot="audio-player"
      className={cn(
        // capsule frosted pill — the HoverCard panel material (`--acr-panel`): a lighter
        // frosted glass that lifts off the backdrop (vs `--acr-surface`, which darkens and
        // blends on a dark page), with the same hairline ring + soft float shadow.
        "relative inline-flex w-full max-w-3xl items-center gap-1.5 rounded-full",
        "bg-[var(--acr-panel)] px-3 py-2 backdrop-blur-xl",
        "shadow-[0_0_0_1px_rgba(190,190,190,0.16),0_16px_48px_rgba(0,0,0,0.45)]",
        className
      )}
      {...props}
    >
      {/* ===== 播放组件 (transport) — always visible ===== */}
      <button onClick={onPrev} disabled={!hasPrev} aria-label="上一首" className={TOOL}>
        <SkipBack className="size-4 fill-current" />
      </button>
      <button
        onClick={onToggle}
        disabled={!track}
        aria-label={playing ? "暂停" : "播放"}
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--acr-chip)] text-foreground transition-all hover:scale-105 hover:bg-[var(--acr-chip-hover)] disabled:pointer-events-none disabled:opacity-30"
      >
        {playing ? (
          <Pause className="size-5 fill-current" />
        ) : (
          <Play className="size-5 translate-x-px fill-current" />
        )}
      </button>
      <button onClick={onNext} disabled={!hasNext} aria-label="下一首" className={TOOL}>
        <SkipForward className="size-4 fill-current" />
      </button>

      {/* ===== 歌曲信息组件 — cover + title/artist + seek, as ONE group; hidden when idle ===== */}
      {track ? (
        <div className="relative mx-1.5 flex min-w-0 flex-1 items-center gap-2.5 rounded-2xl bg-[var(--acr-chip)] px-2 pb-2.5 pt-1.5">
          {track.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={track.cover}
              alt=""
              className="size-9 shrink-0 rounded-md object-cover shadow-sm"
            />
          ) : (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[var(--acr-chip)] text-muted-foreground">
              <ListMusic className="size-4" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold leading-tight">
              {track.title || "播放中"}
            </div>
            {track.artist && (
              <div className="truncate text-[11px] leading-tight text-muted-foreground">
                {track.artist}
              </div>
            )}
          </div>
          <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
            {fmtClock(currentTime)}/{fmtClock(duration)}
          </span>
          {/* seek rail — part of THIS group, along its bottom edge */}
          <div
            onClick={seek}
            className="absolute inset-x-2 bottom-1 h-[3px] cursor-pointer overflow-hidden rounded-full bg-[var(--acr-chip)]"
          >
            <div
              className="h-full rounded-full bg-foreground/70"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="mx-1.5 flex-1" />
      )}

      {/* optional volume — vertical Slider revealed on hover. Uses the Radix HoverCard
          primitive so the panel renders through a Portal: it escapes any `overflow:hidden`
          / clipping ancestor (and isn't bounded by the bar's stacking context), the way a
          plain absolutely-positioned child never could. */}
      {showVolume && (
        <HoverCardPrimitive.Root openDelay={60} closeDelay={120}>
          <HoverCardPrimitive.Trigger asChild>
            <button aria-label="音量" className={TOOL}>
              <VolIcon className="size-4" />
            </button>
          </HoverCardPrimitive.Trigger>
          <HoverCardPrimitive.Portal>
            <HoverCardPrimitive.Content
              side="top"
              sideOffset={10}
              className="z-50 flex h-32 w-9 flex-col items-center rounded-2xl bg-[var(--acr-panel)] px-2 py-2.5 shadow-[0_0_0_1px_rgba(190,190,190,0.16),0_16px_48px_rgba(0,0,0,0.45)] outline-none backdrop-blur-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
            >
              <Slider
                orientation="vertical"
                size="small"
                min={0}
                max={100}
                value={[Math.round((volume ?? 0) * 100)]}
                onValueChange={(v) => onVolumeChange?.(v[0] / 100)}
                aria-label="音量"
                style={{ minHeight: 0 }}
                className="h-full"
              />
            </HoverCardPrimitive.Content>
          </HoverCardPrimitive.Portal>
        </HoverCardPrimitive.Root>
      )}

      {/* caller-supplied right-side tools (歌词 / 队列 / more …) */}
      {actions}
    </div>
  )
}

export { AudioPlayer, fmtClock }
