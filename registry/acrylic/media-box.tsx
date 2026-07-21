"use client"

import * as React from "react"
import { ImageOff } from "lucide-react"

import { cn } from "@/lib/utils"

export const MEDIA_BOX_MAX_VIDEO_HEIGHT = 507
export const MEDIA_BOX_MAX_IMAGE_HEIGHT = 510
export const MEDIA_BOX_WIDE_RATIO = 16 / 9
export const MEDIA_BOX_PORTRAIT_RATIO = 9 / 16

export type MediaBoxKind = "image" | "video"

export interface MediaBoxSize {
  width: number
  height: number
  fixedRatio: boolean
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
  maxWidth?: number
  maxHeight?: number
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

export function computeMediaBox({
  naturalWidth,
  naturalHeight,
  containerWidth,
  maxHeight,
  kind = "image",
}: {
  naturalWidth: number
  naturalHeight: number
  containerWidth: number
  maxHeight?: number
  kind?: MediaBoxKind
}): MediaBoxSize {
  const defaultCap = kind === "video" ? MEDIA_BOX_MAX_VIDEO_HEIGHT : MEDIA_BOX_MAX_IMAGE_HEIGHT
  const cap = valid(maxHeight) ? maxHeight! : defaultCap

  if (!valid(containerWidth)) return { width: 0, height: 0, fixedRatio: false }
  if (!valid(naturalWidth) || !valid(naturalHeight)) {
    return {
      width: Math.round(containerWidth),
      height: Math.round(Math.min(containerWidth / MEDIA_BOX_WIDE_RATIO, cap)),
      fixedRatio: false,
    }
  }

  if (kind === "video") {
    if (naturalWidth > naturalHeight) {
      return {
        width: Math.round(containerWidth),
        height: Math.round(containerWidth / MEDIA_BOX_WIDE_RATIO),
        fixedRatio: true,
      }
    }

    const height = Math.min(Math.min(cap, MEDIA_BOX_MAX_VIDEO_HEIGHT), containerWidth / MEDIA_BOX_PORTRAIT_RATIO)
    return {
      width: Math.round(height * MEDIA_BOX_PORTRAIT_RATIO),
      height: Math.round(height),
      fixedRatio: true,
    }
  }

  if (naturalWidth > naturalHeight) {
    return {
      width: Math.round(containerWidth),
      height: Math.round(containerWidth * (naturalHeight / naturalWidth)),
      fixedRatio: false,
    }
  }

  const scale = Math.min(1, Math.min(cap, MEDIA_BOX_MAX_IMAGE_HEIGHT) / naturalHeight)
  return {
    width: Math.round(naturalWidth * scale),
    height: Math.round(naturalHeight * scale),
    fixedRatio: false,
  }
}

export const MediaBox = React.forwardRef<HTMLDivElement, MediaBoxProps>(function MediaBox(
  {
    kind = "image",
    src,
    alt = "",
    naturalWidth,
    naturalHeight,
    mediaSize,
    maxWidth,
    maxHeight,
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
  const imageRef = React.useRef<HTMLImageElement>(null)
  const retryTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const [containerWidth, setContainerWidth] = React.useState(0)
  const [measured, setMeasured] = React.useState<{ width: number; height: number } | null>(null)
  const [failed, setFailed] = React.useState(false)
  const [attempt, setAttempt] = React.useState(0)
  const [pending, setPending] = React.useState(false)

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      wrapperRef.current = node
      if (typeof ref === "function") ref(node)
      else if (ref) ref.current = node
    },
    [ref]
  )

  const clearRetryTimer = React.useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
  }, [])

  React.useLayoutEffect(() => {
    clearRetryTimer()
    setFailed(false)
    setAttempt(0)
    setPending(false)
  }, [src, clearRetryTimer])

  React.useEffect(() => clearRetryTimer, [clearRetryTimer])

  const handleImageError = React.useCallback(() => {
    if (attempt >= maxRetries) {
      setFailed(true)
      return
    }
    setPending(true)
    const delay = retryDelayMs * 2 ** attempt
    retryTimeoutRef.current = setTimeout(() => {
      retryTimeoutRef.current = null
      setAttempt((a) => a + 1)
      setPending(false)
    }, delay)
  }, [attempt, maxRetries, retryDelayMs])

  React.useLayoutEffect(() => {
    const node = wrapperRef.current
    if (!node) return
    setContainerWidth(node.clientWidth)
    const observer = new ResizeObserver((entries) => setContainerWidth(entries[0]?.contentRect.width ?? 0))
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  React.useLayoutEffect(() => {
    if (naturalWidth && naturalHeight) return
    const image = imageRef.current
    if (image?.complete && image.naturalWidth && image.naturalHeight) {
      setMeasured({ width: image.naturalWidth, height: image.naturalHeight })
    }
  }, [naturalWidth, naturalHeight, src])

  const poster = naturalWidth && naturalHeight ? { width: naturalWidth, height: naturalHeight } : measured
  const dims = resolveDims(mediaSize, poster)
  const boundedWidth = maxWidth ? Math.min(containerWidth, maxWidth) : containerWidth
  const box = computeMediaBox({
    naturalWidth: dims?.width ?? 0,
    naturalHeight: dims?.height ?? 0,
    containerWidth: boundedWidth,
    maxHeight,
    kind,
  })
  const effectiveMaxHeight =
    kind === "video"
      ? dims && dims.height >= dims.width
        ? Math.min(maxHeight ?? MEDIA_BOX_MAX_VIDEO_HEIGHT, MEDIA_BOX_MAX_VIDEO_HEIGHT)
        : maxHeight ?? MEDIA_BOX_MAX_VIDEO_HEIGHT
      : dims && dims.height >= dims.width
        ? Math.min(maxHeight ?? MEDIA_BOX_MAX_IMAGE_HEIGHT, MEDIA_BOX_MAX_IMAGE_HEIGHT)
        : maxHeight ?? MEDIA_BOX_MAX_IMAGE_HEIGHT

  React.useEffect(() => {
    onSizingChange?.({
      naturalW: dims?.width ?? 0,
      naturalH: dims?.height ?? 0,
      containerW: boundedWidth,
      maxHeight: effectiveMaxHeight,
      box,
    })
  }, [boundedWidth, box.fixedRatio, box.height, box.width, dims?.height, dims?.width, effectiveMaxHeight, onSizingChange])

  return (
    <div ref={setRefs} data-slot="media-box" className={cn("w-full", className)} style={{ maxWidth }} {...props}>
      <div
        data-slot="media-box-frame"
        className={cn(
          // translateZ(0) promotes the frame to its own compositing layer so the rounded
          // overflow clip is honored for GPU-composited children — without it a playing
          // <video> paints on its own layer and its square corners spill past rounded-2xl.
          "relative block [transform:translateZ(0)] overflow-hidden rounded-2xl border border-[var(--acr-border)] bg-black",
          frameClassName
        )}
        style={{ width: box.width || undefined, height: box.height || undefined }}
      >
        {src && !failed && !pending ? (
          <img
            key={attempt}
            ref={imageRef}
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            loading="lazy"
            className={cn("absolute inset-0 size-full object-contain", imageClassName)}
            onLoad={(event) => {
              if (attempt !== 0) setAttempt(0)
              if (naturalWidth && naturalHeight) return
              const image = event.currentTarget
              if (image.naturalWidth && image.naturalHeight) {
                setMeasured({ width: image.naturalWidth, height: image.naturalHeight })
              }
            }}
            onError={handleImageError}
          />
        ) : null}
        {src && failed ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--acr-card-nested)] text-muted-foreground/50">
            {fallback ?? <ImageOff className="size-7" />}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  )
})
