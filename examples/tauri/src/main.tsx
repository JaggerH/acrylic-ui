import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"

// In a Tauri window, ask the Rust side whether native vibrancy was applied; if so
// mark <html> so the registry's `.vibrancy` CSS turns the body transparent and the
// native OS acrylic shows through. A harmless no-op in a plain browser (no Tauri
// global → the dynamic import / invoke throws and we stay opaque).
async function applyVibrancyFlag() {
  try {
    const { invoke } = await import("@tauri-apps/api/core")
    const active = await invoke<boolean>("window_translucent")
    if (active) document.documentElement.classList.add("vibrancy")
  } catch {
    /* not under Tauri, or command unavailable — stay opaque */
  }
}
void applyVibrancyFlag()

// Dev-only: expose the WebView2-native capture so an external CDP client can grab
// the real composited surface (incl. native acrylic) for automated visual checks.
declare global {
  interface Window {
    __capture?: (path: string) => Promise<string>
  }
}
;(async () => {
  try {
    const { invoke } = await import("@tauri-apps/api/core")
    window.__capture = (path: string) => invoke<string>("capture_webview", { path })
  } catch {
    /* not under Tauri */
  }
})()

ReactDOM.createRoot(document.getElementById("root")!).render(<App />)
