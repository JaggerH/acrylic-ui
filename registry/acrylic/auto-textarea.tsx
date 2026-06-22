import * as React from "react"
import { cn } from "@/lib/utils"

interface AutoTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Grow with content up to this many rows, then scroll. */
  maxLines?: number
}

/** Frosted-white, auto-growing textarea — a translucent white field (backdrop
 *  blur) that reads independently of the dark page yet matches the acrylic
 *  aesthetic, with a contrasted placeholder. Grows 1 → `maxLines` (default 3).
 *  Uses the optional `.scrollbar-mac` helper (see acrylic.css) when it overflows. */
const AutoTextarea = React.forwardRef<HTMLTextAreaElement, AutoTextareaProps>(
  ({ maxLines = 3, className, value, onChange, ...props }, ref) => {
    const innerRef = React.useRef<HTMLTextAreaElement | null>(null)
    const setRef = (el: HTMLTextAreaElement | null) => {
      innerRef.current = el
      if (typeof ref === "function") ref(el)
      else if (ref) ref.current = el
    }

    const resize = React.useCallback(() => {
      const el = innerRef.current
      if (!el) return
      el.style.height = "auto"
      const cs = getComputedStyle(el)
      const lh = parseFloat(cs.lineHeight) || 20
      const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)
      const max = lh * maxLines + pad
      el.style.height = `${Math.min(el.scrollHeight, max)}px`
      el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden"
    }, [maxLines])

    React.useEffect(resize, [resize, value])

    return (
      <textarea
        ref={setRef}
        rows={1}
        value={value}
        onChange={(e) => { onChange?.(e); resize() }}
        className={cn(
          "w-full resize-none rounded-md border border-transparent bg-white/20 backdrop-blur-2xl backdrop-brightness-150",
          "text-white placeholder:text-white/90",
          "px-3 py-2 text-xs leading-5 outline-none transition-colors",
          "focus:bg-white/25 focus:border-primary disabled:opacity-60 scrollbar-mac",
          className,
        )}
        {...props}
      />
    )
  },
)
AutoTextarea.displayName = "AutoTextarea"

export { AutoTextarea }
