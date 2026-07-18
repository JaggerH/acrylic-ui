"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { animate, motion, useMotionValue, useTransform } from "motion/react"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { ModalAcrylicBody } from "./use-modal-acrylic"

// --- Motion foundation ---------------------------------------------------
// Sheet is the reference adopter of the acrylic motion contract (Apple's
// fluid-interface model): spring enter/exit from the live value, 1:1 drag
// toward the edge with rubber-band resistance, and a velocity-projected
// dismiss so a flick commits a gesture a slow drag would not. Radix Dialog
// stays underneath for focus trap / scroll lock / ESC / ARIA; Motion only
// owns how the panel and scrim move.

type Side = "top" | "right" | "bottom" | "left"

// Which axis a side drags on, and the sign of its offscreen/closing direction.
const AXIS: Record<Side, "x" | "y"> = { right: "x", left: "x", top: "y", bottom: "y" }
const CLOSE_SIGN: Record<Side, 1 | -1> = { right: 1, bottom: 1, left: -1, top: -1 }

// Apple's momentum projection (exponential decay, not v²/2a). Predicts where a
// flick would come to rest so we snap to the nearest state from there.
function project(velocity: number, decay = 0.998) {
  return ((velocity / 1000) * decay) / (1 - decay)
}

// Progressive resistance past a boundary — the further you pull, the less it
// follows (real things slow before they stop), instead of a hard wall.
function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * overshoot)
}

const DRAG_THRESHOLD = 5 // px of movement before a press becomes a drag

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false)
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])
  return reduced
}

// -------------------------------------------------------------------------

type SheetContextValue = { open: boolean; setOpen: (open: boolean) => void }
const SheetContext = React.createContext<SheetContextValue | null>(null)
function useSheetContext() {
  const ctx = React.useContext(SheetContext)
  if (!ctx) throw new Error("Sheet components must be used within <Sheet>")
  return ctx
}

function Sheet({
  open: openProp,
  defaultOpen,
  onOpenChange,
  children,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Root>) {
  // Controlled/uncontrolled bridge so SheetContent can read + drive open state
  // (needed to animate the exit before Radix unmounts). Public API stays
  // identical to Radix Dialog (open / defaultOpen / onOpenChange).
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen ?? false)
  const isControlled = openProp !== undefined
  const open = isControlled ? !!openProp : uncontrolled
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolled(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange]
  )

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      <SheetPrimitive.Root data-slot="sheet" open={open} onOpenChange={setOpen} {...props}>
        {children}
      </SheetPrimitive.Root>
    </SheetContext.Provider>
  )
}

function SheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetContent({
  className,
  children,
  side = "right",
  style,
  ...props
}: Omit<
  React.ComponentProps<typeof SheetPrimitive.Content>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"
> & { side?: Side }) {
  const { open, setOpen } = useSheetContext()
  const reduced = usePrefersReducedMotion()

  const axis = AXIS[side]
  const sign = CLOSE_SIGN[side]

  // Position as a FRACTION of the panel's own size — 0 = fully open, 1 = fully
  // closed/offscreen — rendered as a percentage transform. This is
  // measurement-free, so the enter travels exactly one panel-width and looks
  // identical on the first open and every open after (pixel measurement was
  // unreliable on first mount through Radix's asChild/Slot ref).
  const pos = useMotionValue(open ? 0 : 1)
  // Reduced motion cross-fades instead of sliding: pos stays 0, this drives it.
  const panelOpacity = useMotionValue(1)
  // Scrim has its own short fade on open/close (measurement-free) so it comes on
  // in sync with the panel on the FIRST open; during an active drag it dims by
  // the live pos instead.
  const overlayBase = useMotionValue(open ? 1 : 0)
  const draggingRef = React.useRef(false)
  const pendingRef = React.useRef(false)
  const panelRef = React.useRef<HTMLDivElement>(null)
  const posAnim = React.useRef<ReturnType<typeof animate> | null>(null)
  const dragState = React.useRef({ start: 0, startPos: 0, size: 1 })
  const samples = React.useRef<{ c: number; t: number }[]>([])

  // `rendered` gates the portal: stays mounted through the close animation so
  // the exit can play before Radix tears the content down.
  const [rendered, setRendered] = React.useState(open)

  const spring = React.useMemo(
    () => ({ type: "spring", bounce: 0.2, duration: 0.3 }) as const,
    []
  )

  const translate = useTransform(pos, (p) => `${sign * p * 100}%`)

  React.useEffect(() => {
    if (open) setRendered(true)
  }, [open])

  // Before first paint, put a freshly-mounted panel in its hidden start state.
  // (pos already inits to 1/offscreen for the slide path; this covers reduced
  // motion, which starts in-place + transparent.)
  React.useLayoutEffect(() => {
    if (!rendered || !open) return
    overlayBase.set(open ? overlayBase.get() : 0)
    if (reduced && pos.get() !== 0) {
      pos.set(0)
      panelOpacity.set(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rendered])

  // Programmatic open/close (trigger, ESC, overlay click, Close button).
  // Animates from the live value, so an interrupt (reopen mid-close) is smooth.
  React.useEffect(() => {
    if (!rendered) return
    // Scrim fades on its own short curve (measurement-free) so it comes on
    // reliably on the FIRST open, in sync with — not lagging — the panel.
    const scrimControls = animate(overlayBase, open ? 1 : 0, {
      duration: 0.2,
      ease: "easeOut",
    })
    if (reduced) {
      pos.set(0) // no vestibular slide — cross-fade only
      const controls = animate(panelOpacity, open ? 1 : 0, {
        duration: 0.15,
        ease: "linear",
        onComplete: open ? undefined : () => setRendered(false),
      })
      return () => {
        controls.stop()
        scrimControls.stop()
      }
    }
    const controls = animate(pos, open ? 0 : 1, {
      ...spring,
      onComplete: open ? undefined : () => setRendered(false),
    })
    posAnim.current = controls
    return () => {
      controls.stop()
      scrimControls.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, rendered, spring, reduced])

  // Scrim: its own fade (overlayBase) for enter/exit; while actively dragging,
  // dim by the live pos (1 - pos), no measurement needed.
  const scrimOpacity = useTransform([pos, overlayBase], ([p, base]) => {
    if (!draggingRef.current) return base as number
    return Math.min(base as number, Math.max(0, 1 - (p as number)))
  })

  // --- Manual 1:1 drag (pointer events) --------------------------------------
  // Replaces Motion's pixel `drag` so the panel can be positioned by a
  // measurement-free percentage. Size is read at pointer-down, when the panel is
  // open and stable (reliable, unlike first-mount measurement).
  const coordOf = React.useCallback(
    (e: React.PointerEvent) => (axis === "x" ? e.clientX : e.clientY),
    [axis]
  )

  const onPointerDown = React.useCallback(
    (e: React.PointerEvent) => {
      if (reduced || (e.button !== undefined && e.button !== 0)) return
      // Don't hijack interactive controls (inputs, buttons, links, the close X).
      if (
        (e.target as HTMLElement).closest(
          'input, textarea, select, button, a, [contenteditable="true"]'
        )
      )
        return
      const el = panelRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      dragState.current = {
        start: coordOf(e),
        startPos: pos.get(),
        size: (axis === "x" ? rect.width : rect.height) || 1,
      }
      samples.current = [{ c: coordOf(e), t: e.timeStamp }]
      pendingRef.current = true
    },
    [reduced, axis, coordOf, pos]
  )

  const onPointerMove = React.useCallback(
    (e: React.PointerEvent) => {
      if (!pendingRef.current && !draggingRef.current) return
      const coord = coordOf(e)
      const { start, startPos, size } = dragState.current
      const delta = coord - start
      if (pendingRef.current) {
        if (Math.abs(delta) < DRAG_THRESHOLD) return
        // Commit to a drag: grab the pointer and interrupt any running animation.
        pendingRef.current = false
        draggingRef.current = true
        posAnim.current?.stop()
        try {
          panelRef.current?.setPointerCapture(e.pointerId)
        } catch {
          /* no-op */
        }
      }
      let next = startPos + (sign * delta) / size
      if (next < 0) next = -rubberband(-next * size, size) / size // rubber-band past open
      pos.set(next)
      const s = samples.current
      s.push({ c: coord, t: e.timeStamp })
      if (s.length > 5) s.shift()
    },
    [coordOf, sign, pos]
  )

  const endDrag = React.useCallback(
    (e: React.PointerEvent) => {
      if (pendingRef.current) {
        pendingRef.current = false
        return // was a tap/click, not a drag
      }
      if (!draggingRef.current) return
      draggingRef.current = false
      try {
        panelRef.current?.releasePointerCapture(e.pointerId)
      } catch {
        /* no-op */
      }
      const { size } = dragState.current
      const s = samples.current
      let vel = 0 // px/s along the axis
      if (s.length >= 2) {
        const a = s[0]
        const b = s[s.length - 1]
        const dt = b.t - a.t || 16
        vel = ((b.c - a.c) / dt) * 1000
      }
      const projectedFrac = pos.get() + (sign * project(vel)) / size
      const velFrac = (sign * vel) / size // fraction/s for the spring hand-off
      if (projectedFrac > 0.4) {
        animate(overlayBase, 0, { duration: 0.2, ease: "easeOut" })
        posAnim.current = animate(pos, 1, {
          ...spring,
          velocity: velFrac,
          onComplete: () => {
            setRendered(false)
            setOpen(false)
          },
        })
      } else {
        posAnim.current = animate(pos, 0, { ...spring, velocity: velFrac })
      }
    },
    [sign, pos, overlayBase, spring, setOpen]
  )

  if (!rendered) return null

  const positional =
    side === "right"
      ? "inset-y-0 right-0 h-full w-3/4 sm:max-w-sm"
      : side === "left"
        ? "inset-y-0 left-0 h-full w-3/4 sm:max-w-sm"
        : side === "top"
          ? "inset-x-0 top-0 h-auto"
          : "inset-x-0 bottom-0 h-auto"

  const dragHandlers = reduced
    ? {}
    : {
        onPointerDown,
        onPointerMove,
        onPointerUp: endDrag,
        onPointerCancel: endDrag,
      }

  return (
    <SheetPortal forceMount>
      {/* Radix owns state/a11y; the motion.div child (via asChild) is the real
          motion DOM node Motion controls. Wrapping the Radix primitive directly
          with motion.create does NOT apply transforms/drag. */}
      <SheetPrimitive.Overlay asChild forceMount>
        <motion.div
          data-slot="sheet-overlay"
          style={{ opacity: scrimOpacity }}
          // Blur via utilities (sets --tw-backdrop-*), so the reduced-transparency
          // rule that zeroes --tw-backdrop-blur actually reaches the scrim.
          className="fixed inset-0 z-50 bg-[var(--acr-overlay)] backdrop-blur-[20px] backdrop-saturate-[1.3]"
        />
      </SheetPrimitive.Overlay>
      <SheetPrimitive.Content asChild forceMount {...props}>
        <motion.div
          ref={panelRef}
          data-slot="sheet-content"
          style={{
            ...style,
            opacity: panelOpacity,
            ...(axis === "x" ? { x: translate } : { y: translate }),
          }}
          {...dragHandlers}
          className={cn(
            "fixed z-50 flex flex-col gap-4 bg-[var(--acr-panel)] backdrop-blur-xl shadow-[0_0_0_1px_var(--acr-border-soft),0_16px_48px_rgba(0,0,0,0.35)]",
            axis === "x" ? "touch-pan-y" : "touch-pan-x",
            positional,
            className
          )}
        >
          <ModalAcrylicBody />
          {children}
          <SheetPrimitive.Close className="absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none">
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        </motion.div>
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="sheet-header" className={cn("flex flex-col gap-1.5 p-4", className)} {...props} />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="sheet-footer" className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />
  )
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
