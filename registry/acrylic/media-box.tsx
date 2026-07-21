"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { CardMedia } from "./card"

export const MEDIA_BOX_MAX_VIDEO_HEIGHT = 507
export const MEDIA_BOX_MAX_IMAGE_HEIGHT = 510
export const MEDIA_BOX_WIDE_RATIO = 16 / 9
export const MEDIA_BOX_PORTRAIT_RATIO = 9 / 16

export type MediaBoxKind = "image" | "video"

export interface MediaBoxSize {
  width: number
  height: number
  /** The display aspect ratio (width / height) the frame was sized to. */
  ratio: number
}

export interface MediaBoxSizingSnapshot {
  naturalW: number
  naturalH: number
  containerW: number
  maxHeight: number
  box: MediaBoxSize
}

export interface MediaBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  kind?: MediaBoxKind
  src?: string
  alt?: string
  naturalWidth?: number
  naturalHeight?: number
  mediaSize?: { width: number; height: number } | null
  /** Hard floor on frame width — wins over maxWidth / maxHeight when they conflict. */
  minWidth?: number
  maxWidth?: number
  maxHeight?: number
  /** An extra height ceiling applied ONLY to video (kind="video"), clamped together with
   *  maxHeight. Lets a feed keep tall images (maxHeight) while capping vertical videos to a
   *  compact height — the video still fills at its natural ratio, just shorter (no letterbox). */
  videoMaxHeight?: number
  frameClassName?: string
  imageClassName?: string
  fallback?: React.ReactNode
  onSizingChange?: (snapshot: MediaBoxSizingSnapshot) => void
  /** Failed loads to retry with backoff before giving up and showing `fallback`. */
  maxRetries?: number
  /** Base backoff delay in ms; doubles each attempt (attempt 0 waits this long, attempt 1 waits 2x, ...). */
  retryDelayMs?: number
}

export const MEDIA_BOX_DEFAULT_MAX_RETRIES = 2
export const MEDIA_BOX_DEFAULT_RETRY_DELAY_MS = 800

function valid(n: number | undefined) {
  return typeof n === "number" && Number.isFinite(n) && n > 0
}

function resolveDims(
  media: { width: number; height: number } | null | undefined,
  poster: { width: number; height: number } | null | undefined
) {
  if (media && valid(media.width) && valid(media.height)) return media
  if (poster && valid(poster.width) && valid(poster.height)) return poster
  return null
}

/**
 * Size a frame to the media's NATURAL aspect ratio, then bound its width. Because the frame
 * ratio equals the media's own ratio, the (object-cover) media fills it with no crop and no
 * letterbox. Width is clamped to `[minWidth, min(containerWidth, maxWidth, maxHeight × ratio)]`;
 * `minWidth` is a hard floor applied last, so it wins over maxWidth / maxHeight on conflict.
 */
export function computeMediaBox({
  naturalWidth,
  naturalHeight,
  containerWidth,
  minWidth,
  maxWidth,
  maxHeight,
}: {
  naturalWidth: number
  naturalHeight: number
  containerWidth: number
  minWidth?: number
  maxWidth?: number
  maxHeight?: number
}): MediaBoxSize {
  const ratio = valid(naturalWidth) && valid(naturalHeight) ? naturalWidth / naturalHeight : MEDIA_BOX_WIDE_RATIO

  // With no container to measure against and no floor to fall back on, there's nothing to size yet.
  if (!valid(containerWidth) && !valid(minWidth)) return { width: 0, height: 0, ratio }

  let width = valid(containerWidth) ? containerWidth : minWidth!
  if (valid(maxWidth)) width = Math.min(width, maxWidth!)
  if (valid(maxHeight)) width = Math.min(width, maxHeight! * ratio)
  if (valid(minWidth)) width = Math.max(width, minWidth!) // hard floor — wins over container / maxWidth / maxHeight

  return { width: Math.round(width), height: Math.round(width / ratio), ratio }
}

export const MediaBox = React.forwardRef<HTMLDivElement, MediaBoxProps>(function MediaBox(
  {
    kind = "image",
    src,
    alt = "",
    naturalWidth,
    naturalHeight,
    mediaSize,
    minWidth,
    maxWidth,
    maxHeight,
    videoMaxHeight,
    frameClassName,
    imageClassName,
    fallback,
    onSizingChange,
    maxRetries = MEDIA_BOX_DEFAULT_MAX_RETRIES,
    retryDelayMs = MEDIA_BOX_DEFAULT_RETRY_DELAY_MS,
    className,
    children,
    ...props
  },
  ref
) {
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = React.useState(0)
  // Intrinsic size discovered from the loaded image (via CardMedia's onNaturalSize) when
  // neither naturalWidth/Height nor mediaSize was supplied up front.
  const [measured, setMeasured] = React.useState<{ width: number; height: number } | null>(null)

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      wrapperRef.current = node
      if (typeof ref === "function") ref(node)
      else if (ref) ref.current = node
    },
    [ref]
  )

  // A new src is a fresh measurement — drop the discovered size until the new image reports.
  React.useLayoutEffect(() => {
    setMeasured(null)
  }, [src])

  React.useLayoutEffect(() => {
    const node = wrapperRef.current
    if (!node) return
    setContainerWidth(node.clientWidth)
    const observer = new ResizeObserver((entries) => setContainerWidth(entries[0]?.contentRect.width ?? 0))
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const provided = valid(naturalWidth) && valid(naturalHeight) ? { width: naturalWidth!, height: naturalHeight! } : null
  const dims = resolveDims(mediaSize, provided ?? measured)
  const baseCap = valid(maxHeight)
    ? maxHeight!
    : kind === "video"
      ? MEDIA_BOX_MAX_VIDEO_HEIGHT
      : MEDIA_BOX_MAX_IMAGE_HEIGHT
  // Video gets an optional tighter ceiling on top of maxHeight (compact verticals in a feed).
  const cap = kind === "video" && valid(videoMaxHeight) ? Math.min(baseCap, videoMaxHeight!) : baseCap
  const box = computeMediaBox({
    naturalWidth: dims?.width ?? 0,
    naturalHeight: dims?.height ?? 0,
    containerWidth,
    minWidth,
    maxWidth,
    maxHeight: cap,
  })

  React.useEffect(() => {
    onSizingChange?.({
      naturalW: dims?.width ?? 0,
      naturalH: dims?.height ?? 0,
      containerW: containerWidth,
      maxHeight: cap,
      box,
    })
  }, [containerWidth, box.width, box.height, box.ratio, dims?.width, dims?.height, cap, onSizingChange])

  // Frame ratio = the media's natural ratio (so object-cover neither crops nor letterboxes).
  // Before the first measurement, hold a neutral 16/9 frame so the pre-load box is sane.
  const ratio = dims ? `${dims.width} / ${dims.height}` : "16 / 9"

  return (
    <div ref={setRefs} data-slot="media-box" className={cn("w-full", className)} style={{ maxWidth }} {...props}>
      {/* CardMedia owns the object-cover image + retry/fallback; MediaBox only picks the
          ratio and width. translateZ(0) + [&_video]:rounded-[inherit] keep a consumer-
          supplied <video> child's corners clipped on hardware-overlay engines (see the
          old MediaBox note — Tauri WebView2 / WKWebView). */}
      <CardMedia
        data-slot="media-box-frame"
        ratio={ratio}
        style={{ width: box.width || undefined }}
        className={cn(
          // Left-aligned by default (a plain block hugs the start of its column). To CENTER a
          // narrower-than-column frame (e.g. a portrait in a wide column), a consumer opts in
          // with `frameClassName="mx-auto"` — see the gallery demo.
          "block [transform:translateZ(0)] rounded-2xl border border-[var(--acr-border)] bg-black [&_video]:rounded-[inherit]",
          frameClassName
        )}
        src={src}
        alt={alt}
        fallback={fallback}
        imageClassName={imageClassName}
        maxRetries={maxRetries}
        retryDelayMs={retryDelayMs}
        onNaturalSize={(width, height) => {
          if (!provided) setMeasured({ width, height })
        }}
      >
        {children}
      </CardMedia>
    </div>
  )
})
