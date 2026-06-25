"use client"

import * as React from "react"
import { ListPlus, Music2, Play, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"

// Audio Playlist — the "current playlist" panel (NetEase-style): a header with a count and
// 收藏全部 / 清空 actions, over a scrollable list of track rows. Each row is a cover (with a
// hover ▶, persistent on the playing track), a title (accent-red while playing) + a meta line
// of quality / MV / VIP badges + artist, and a trailing duration. Fully presentational and
// controlled — drop it inside a Sheet (or any panel) and wire the callbacks to your queue.

const RED = "#ec4141" // NetEase accent red (playing title · MV · VIP)
const GOLD = "#c7a350" // 超清母带 / Hi-Res master

export interface PlaylistTrack {
  id: string
  title: string
  artist?: string
  /** cover art URL; a music glyph is shown when absent */
  cover?: string
  /** length in seconds (rendered mm:ss) */
  duration?: number
  /** VIP-only track */
  vip?: boolean
  /** 超清母带 / Hi-Res master available */
  hires?: boolean
  /** has a music video */
  mv?: boolean
}

export interface AudioPlaylistProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  tracks: PlaylistTrack[]
  /** id of the loaded track (its row is highlighted + shows a persistent ▶) */
  currentId?: string
  /** panel heading (default 播放列表) */
  heading?: string
  /** play this track (row click) */
  onSelect?: (id: string) => void
  onFavoriteAll?: () => void
  onClear?: () => void
}

function fmtDuration(s?: number): string {
  if (!s || !Number.isFinite(s) || s < 0) return ""
  const m = Math.floor(s / 60)
  const r = Math.floor(s % 60)
  return `${m}:${r.toString().padStart(2, "0")}`
}

/** A small outlined badge (超清母带 / MV / VIP). */
function TrackBadge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      className="shrink-0 rounded-[3px] border px-1 py-px text-[10px] font-medium leading-none"
      style={{ color, borderColor: `${color}8c` }}
    >
      {children}
    </span>
  )
}

function AudioPlaylist({
  tracks,
  currentId,
  heading = "播放列表",
  onSelect,
  onFavoriteAll,
  onClear,
  className,
  ...props
}: AudioPlaylistProps) {
  return (
    <div data-slot="audio-playlist" className={cn("flex h-full min-h-0 flex-col text-foreground", className)} {...props}>
      {/* header — heading + count, with 收藏全部 / 清空 actions */}
      <div className="flex items-center justify-between gap-2 px-4 pt-1 pb-3">
        <div className="flex items-baseline gap-1.5">
          <h2 className="text-lg font-bold tracking-tight">{heading}</h2>
          <span className="text-xs text-muted-foreground">{tracks.length}</span>
        </div>
        <div className="flex items-center gap-4 text-[13px] text-muted-foreground">
          <button onClick={onFavoriteAll} className="flex items-center gap-1 transition-colors hover:text-foreground">
            <ListPlus className="size-4" />
            收藏全部
          </button>
          <button onClick={onClear} className="flex items-center gap-1 transition-colors hover:text-foreground">
            <Trash2 className="size-4" />
            清空
          </button>
        </div>
      </div>

      {/* track rows */}
      <div className="scrollbar-mac min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {tracks.map((t) => {
          const isCurrent = t.id === currentId
          return (
            <button
              key={t.id}
              onClick={() => onSelect?.(t.id)}
              className="group flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-[var(--acr-hover)]"
            >
              {/* cover + ▶ overlay (persistent on the playing track, hover otherwise) */}
              <div className="relative size-14 shrink-0 overflow-hidden rounded-xl">
                {t.cover ? (
                  <img src={t.cover} alt="" className="size-full object-cover" />
                ) : (
                  <span className="flex size-full items-center justify-center bg-[var(--acr-chip)] text-muted-foreground">
                    <Music2 className="size-5" />
                  </span>
                )}
                <div
                  className={cn(
                    "absolute inset-0 flex items-center justify-center bg-black/35 transition-opacity",
                    isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}
                >
                  <Play className="size-5 translate-x-px fill-white text-white" />
                </div>
              </div>

              {/* title + meta line */}
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-semibold" style={isCurrent ? { color: RED } : undefined}>
                  {t.title}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  {t.vip && <TrackBadge color={RED}>VIP</TrackBadge>}
                  {t.hires && <TrackBadge color={GOLD}>超清母带</TrackBadge>}
                  {t.mv && <TrackBadge color={RED}>MV ›</TrackBadge>}
                  {t.artist && <span className="truncate">{t.artist}</span>}
                </div>
              </div>

              {/* duration */}
              <span className="shrink-0 text-[13px] tabular-nums text-muted-foreground">{fmtDuration(t.duration)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export { AudioPlaylist, fmtDuration }
