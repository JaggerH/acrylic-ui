import * as React from "react"

// Ref-counted across ALL acrylic overlays (Dialog + AlertDialog) so stacking
// works: the body stays painted opaque until the LAST overlay closes. While any
// overlay is open we add `html.modal-acrylic`, so the overlay's `backdrop-filter`
// has real pixels to frost on a TRANSPARENT vibrancy window (Tauri/Electron). On a
// normal opaque-body web page this is a harmless no-op. See acrylic.css / README.
//
// IMPORTANT: this must run only while the overlay is actually OPEN. Radix renders
// `Dialog.Content`'s subtree only when open (Presence), so the effect belongs on a
// node INSIDE the portal content — NOT in the Content wrapper's own render, which
// React keeps mounted even when closed (that would paint the body opaque forever
// and, under vibrancy, kill the window's transparency). Use `<ModalAcrylicBody />`
// as a child of the portal content rather than calling the hook in the wrapper.
let openOverlays = 0

export function useModalAcrylicBody() {
  React.useEffect(() => {
    openOverlays += 1
    document.documentElement.classList.add("modal-acrylic")
    return () => {
      openOverlays = Math.max(0, openOverlays - 1)
      if (openOverlays === 0) document.documentElement.classList.remove("modal-acrylic")
    }
  }, [])
}

// Renders nothing; paints the body opaque for as long as it is mounted. Place it
// INSIDE `Dialog.Content` / `AlertDialog.Content` so it mounts only while open.
export function ModalAcrylicBody(): null {
  useModalAcrylicBody()
  return null
}
