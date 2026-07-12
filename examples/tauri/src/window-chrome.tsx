import { useEffect, useState } from "react"
import { getCurrentWindow } from "@tauri-apps/api/window"

import { cn } from "@/lib/utils"

// Custom window chrome for the frameless (decorations:false) Tauri window. We render
// our OWN controls and follow the HOST OS convention:
//   • Windows/Linux → min/max/close caption buttons, injected into the app header
//     (which doubles as the drag region) at the top-right.
//   • macOS        → traffic lights at the top-left in a thin draggable strip above
//     the content (the Finder/Mail pattern).
// Platform is the webview UA (WebView2 → "Windows", WKWebView → "Macintosh"), with a
// `localStorage["acrylic-os"] = "mac" | "win"` override so the other platform's chrome
// can be previewed on this machine (set it in the devtools console, then reload).
const appWindow = getCurrentWindow()

function detectOS(): "mac" | "win" {
  try {
    const forced = localStorage.getItem("acrylic-os")
    if (forced === "mac" || forced === "win") return forced
  } catch {
    /* localStorage unavailable — fall through to UA */
  }
  return /mac/i.test(navigator.userAgent) ? "mac" : "win"
}

export const isMacOS = detectOS() === "mac"

// Shared maximize state: drives the Windows restore icon and hides the resize
// handles while maximized.
function useWindowMaximized() {
  const [maximized, setMaximized] = useState(false)
  useEffect(() => {
    void appWindow.isMaximized().then(setMaximized)
    let unlisten: (() => void) | undefined
    void appWindow
      .onResized(() => void appWindow.isMaximized().then(setMaximized))
      .then((u) => (unlisten = u))
    return () => unlisten?.()
  }, [])
  return maximized
}

// ── Glyphs ───────────────────────────────────────────────────────────────────
function MacGlyph({ kind }: { kind: "close" | "min" | "max" }) {
  const d =
    kind === "close" ? "M1.5 1.5l3 3M4.5 1.5l-3 3" :
    kind === "min" ? "M1.25 3h3.5" :
    "M3 1.25v3.5M1.25 3h3.5"
  return (
    <svg width="6" height="6" viewBox="0 0 6 6" className="text-black/55">
      <path d={d} stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function WinGlyph({ kind, maximized }: { kind: "min" | "max" | "close"; maximized?: boolean }) {
  if (kind === "min") {
    return (
      <svg width="10" height="10" viewBox="0 0 10 10">
        <path d="M0 5h10" stroke="currentColor" strokeWidth="1" />
      </svg>
    )
  }
  if (kind === "close") {
    return (
      <svg width="10" height="10" viewBox="0 0 10 10">
        <path d="M0 0l10 10M10 0L0 10" stroke="currentColor" strokeWidth="1" />
      </svg>
    )
  }
  return maximized ? (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
      <rect x="0.5" y="2.5" width="7" height="7" />
      <path d="M2.5 2.5V0.5h7v7h-2" />
    </svg>
  ) : (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
      <rect x="0.5" y="0.5" width="9" height="9" />
    </svg>
  )
}

// ── macOS traffic lights ──────────────────────────────────────────────────────
// Injected into the SIDEBAR's top-left (the native macOS placement) — NOT a separate
// titlebar. The host row it sits in carries data-tauri-drag-region.
export function MacTrafficLights() {
  const lights = [
    { kind: "close" as const, bg: "#ff5f57", ring: "#e0443e", action: () => appWindow.close() },
    { kind: "min" as const, bg: "#febc2e", ring: "#dea123", action: () => appWindow.minimize() },
    { kind: "max" as const, bg: "#28c840", ring: "#1aab29", action: () => appWindow.toggleMaximize() },
  ]
  return (
    <div className="group flex items-center gap-2">
      {lights.map((l) => (
        <button
          key={l.kind}
          aria-label={l.kind}
          onClick={l.action}
          className="flex size-3 items-center justify-center rounded-full"
          style={{ backgroundColor: l.bg, boxShadow: `inset 0 0 0 0.5px ${l.ring}` }}
        >
          <span className="opacity-0 transition-opacity group-hover:opacity-100">
            <MacGlyph kind={l.kind} />
          </span>
        </button>
      ))}
    </div>
  )
}

// ── Windows caption buttons (injected into the app header) ─────────────────────
function WinControls({ maximized }: { maximized: boolean }) {
  // self-stretch (align-self), NOT h-full: webkit2gtk (the Tauri webview) won't
  // resolve `height:100%` against a parent whose height only comes from flex-stretch,
  // so h-full collapses the button to glyph height and the hover fill stops short of
  // the navbar edges. align-self:stretch fills the full navbar height in every engine.
  const base =
    "flex self-stretch w-[46px] items-center justify-center text-foreground/80 transition-colors"
  return (
    // -mr-4 cancels the header's right padding so the buttons reach the window corner.
    <div className="-mr-4 flex items-stretch self-stretch">
      <button aria-label="Minimize" onClick={() => appWindow.minimize()} className={cn(base, "hover:bg-white/10")}>
        <WinGlyph kind="min" />
      </button>
      <button aria-label="Maximize" onClick={() => appWindow.toggleMaximize()} className={cn(base, "hover:bg-white/10")}>
        <WinGlyph kind="max" maximized={maximized} />
      </button>
      <button aria-label="Close" onClick={() => appWindow.close()} className={cn(base, "hover:bg-[#e81123] hover:text-white")}>
        <WinGlyph kind="close" />
      </button>
    </div>
  )
}

// Windows control cluster, injected into the app header's right edge (Tauri host).
export function WindowControls() {
  const maximized = useWindowMaximized()
  return <WinControls maximized={maximized} />
}

// ── Invisible resize handles ──────────────────────────────────────────────────
// decorations:false drops the native resize borders on Windows (tauri#8519), so we
// re-add them: thin edge strips + corner squares that drive startResizeDragging.
const HANDLES = [
  { dir: "North", cls: "left-2 right-2 top-0 h-[5px] cursor-ns-resize" },
  { dir: "South", cls: "left-2 right-2 bottom-0 h-[5px] cursor-ns-resize" },
  { dir: "West", cls: "top-2 bottom-2 left-0 w-[5px] cursor-ew-resize" },
  { dir: "East", cls: "top-2 bottom-2 right-0 w-[5px] cursor-ew-resize" },
  { dir: "NorthWest", cls: "top-0 left-0 size-2 cursor-nwse-resize" },
  { dir: "NorthEast", cls: "top-0 right-0 size-2 cursor-nesw-resize" },
  { dir: "SouthWest", cls: "bottom-0 left-0 size-2 cursor-nesw-resize" },
  { dir: "SouthEast", cls: "bottom-0 right-0 size-2 cursor-nwse-resize" },
] as const

export function WindowResizeHandles() {
  const maximized = useWindowMaximized()
  if (maximized) return null
  return (
    <>
      {HANDLES.map((h) => (
        <div
          key={h.dir}
          onMouseDown={(e) => {
            if (e.button !== 0) return
            e.preventDefault()
            void appWindow.startResizeDragging(h.dir)
          }}
          className={cn("fixed z-[9999]", h.cls)}
        />
      ))}
    </>
  )
}
