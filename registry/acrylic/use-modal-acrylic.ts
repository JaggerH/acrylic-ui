import * as React from "react"

// Ref-counted across ALL acrylic overlays (Dialog + AlertDialog) so stacking
// works: the body stays painted opaque until the LAST overlay closes. While any
// overlay is open we add `html.modal-acrylic`, so the overlay's `backdrop-filter`
// has real pixels to frost on a TRANSPARENT vibrancy window (Tauri/Electron). On a
// normal opaque-body web page this is a harmless no-op. See acrylic.css / README.
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
