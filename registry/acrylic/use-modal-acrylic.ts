import * as React from "react"

// Ref-counted across ALL acrylic overlays (Dialog + AlertDialog + Sheet) so
// stacking works: the body stays painted opaque until the LAST overlay closes.
// While an overlay is open we add `html.modal-acrylic`, so the overlay's
// `backdrop-filter` has real pixels to frost on a TRANSPARENT vibrancy window
// (Tauri/Electron). On a normal opaque-body web page this is a harmless no-op.
// See acrylic.css / the Tauri guide.
//
// IMPORTANT: the paint must track the overlay's OPEN state, and un-paint the
// moment it starts CLOSING — NOT on unmount. Radix keeps `Content` mounted through
// its exit animation, so an unmount-based un-paint fires ~the exit duration late,
// then the body's own 0.18s background transition lingers on top — the opaque body
// outlives the overlay's fade and reads as a two-step, desynced exit. Painting via
// `<ModalAcrylicBody />` (which watches `Content`'s `data-state`) fades the body out
// in sync with the overlay instead.
let openOverlays = 0

function paintBody() {
  openOverlays += 1
  document.documentElement.classList.add("modal-acrylic")
}

function unpaintBody() {
  openOverlays = Math.max(0, openOverlays - 1)
  if (openOverlays === 0) document.documentElement.classList.remove("modal-acrylic")
}

// Hook form — paints the body for as long as the caller is mounted. Kept for
// manual use; prefer `<ModalAcrylicBody />` inside an overlay's Content so the
// un-paint is synced to the open/closed state rather than mount/unmount.
export function useModalAcrylicBody() {
  React.useEffect(() => {
    paintBody()
    return unpaintBody
  }, [])
}

// Renders an inert marker INSIDE `Dialog`/`AlertDialog`/`Sheet` Content. It paints
// the body while the Content's `data-state` is "open" and un-paints it the instant
// that flips to "closed" (exit start) — so the body's transparency returns in sync
// with the overlay's fade-out, no lingering opaque scrim after the content is gone.
export function ModalAcrylicBody() {
  const ref = React.useRef<HTMLSpanElement>(null)
  React.useEffect(() => {
    const host = ref.current?.closest("[data-state]") ?? null
    let painted = false
    const sync = () => {
      const open = !host || host.getAttribute("data-state") === "open"
      if (open && !painted) {
        painted = true
        paintBody()
      } else if (!open && painted) {
        painted = false
        unpaintBody()
      }
    }
    sync()
    let observer: MutationObserver | undefined
    if (host) {
      observer = new MutationObserver(sync)
      observer.observe(host, { attributes: true, attributeFilter: ["data-state"] })
    }
    return () => {
      observer?.disconnect()
      if (painted) {
        painted = false
        unpaintBody()
      }
    }
  }, [])
  return React.createElement("span", {
    ref,
    "aria-hidden": true,
    style: { display: "none" },
  })
}
