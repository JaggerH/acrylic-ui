"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "motion/react"
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

  // Single source of truth for the panel's position along its axis:
  // 0 = fully open, sign*size = fully closed/offscreen. Motion `drag` writes
  // this same value, so drag and programmatic animation never fight.
  const offset = useMotionValue(0)
  const sizeRef = React.useRef(0)
  const inited = React.useRef(false)
  const panelRef = React.useRef<HTMLDivElement>(null)

  // `rendered` gates the portal: stays mounted through the close animation so
  // the exit can play before Radix tears the content down.
  const [rendered, setRendered] = React.useState(open)

  const spring = React.useMemo(
    () =>
      reduced
        ? ({ duration: 0.12, ease: "linear" } as const)
        : ({ type: "spring", bounce: 0.2, duration: 0.3 } as const),
    [reduced]
  )

  const measure = React.useCallback(() => {
    const el = panelRef.current
    if (el) sizeRef.current = axis === "x" ? el.offsetWidth : el.offsetHeight
  }, [axis])

  const offscreen = React.useCallback(() => {
    const fallback = axis === "x" ? window.innerWidth : window.innerHeight
    return sign * (sizeRef.current || fallback)
  }, [axis, sign])

  React.useEffect(() => {
    if (open) setRendered(true)
  }, [open])

  // Before first paint, park a freshly-mounted panel offscreen so the enter
  // animation slides it in (no flash of the open position).
  React.useLayoutEffect(() => {
    if (!rendered || inited.current) return
    inited.current = true
    measure()
    if (open) offset.set(offscreen())
  }, [rendered, open, measure, offscreen, offset])

  // Programmatic open/close (trigger, ESC, overlay click, Close button).
  // Animates from the live value, so an interrupt (reopen mid-close) is smooth.
  React.useEffect(() => {
    if (!rendered) return
    measure()
    if (open) {
      const controls = animate(offset, 0, spring)
      return () => controls.stop()
    }
    const controls = animate(offset, offscreen(), {
      ...spring,
      onComplete: () => setRendered(false),
    })
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, rendered, spring])

  // Scrim dims in proportion to how far the panel has moved out (dim to focus).
  const scrimOpacity = useTransform(offset, (o) => {
    const size = sizeRef.current || 1
    return Math.max(0, 1 - Math.abs(o) / size)
  })

  const handleDragEnd = React.useCallback(
    (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const v = info.velocity[axis]
      const current = offset.get()
      const projected = current + project(v)
      const size = sizeRef.current || Math.abs(offscreen())
      const dismiss =
        Math.sign(projected) === sign && Math.abs(projected) > Math.abs(size) * 0.4
      if (dismiss) {
        // Hand the release velocity into the close spring, then sync Radix
        // state once the panel is gone (returns focus to the trigger).
        animate(offset, offscreen(), {
          type: "spring",
          bounce: 0.2,
          duration: 0.3,
          velocity: v,
          onComplete: () => {
            setRendered(false)
            setOpen(false)
          },
        })
      } else {
        animate(offset, 0, { type: "spring", bounce: 0.2, duration: 0.3, velocity: v })
      }
    },
    [axis, sign, offset, offscreen, setOpen]
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

  const dragProps = reduced
    ? {}
    : {
        drag: axis,
        dragMomentum: false,
        dragElastic: 0.16,
        dragConstraints: sign === 1 ? { left: 0, top: 0 } : { right: 0, bottom: 0 },
        onDragEnd: handleDragEnd,
      }

  return (
    <SheetPortal forceMount>
      {/* Radix owns state/a11y; the motion.div child (via asChild) is the real
          motion DOM node Motion controls. Wrapping the Radix primitive directly
          with motion.create does NOT apply transforms/drag. */}
      <SheetPrimitive.Overlay asChild forceMount>
        <motion.div
          data-slot="sheet-overlay"
          style={{
            opacity: scrimOpacity,
            backdropFilter: "blur(20px) saturate(1.3)",
            WebkitBackdropFilter: "blur(20px) saturate(1.3)",
          }}
          className="fixed inset-0 z-50 bg-[var(--acr-overlay)]"
        />
      </SheetPrimitive.Overlay>
      <SheetPrimitive.Content asChild forceMount {...props}>
        <motion.div
          ref={panelRef}
          data-slot="sheet-content"
          style={{ ...style, ...(axis === "x" ? { x: offset } : { y: offset }) }}
          {...dragProps}
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
