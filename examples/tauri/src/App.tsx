import { ThemeProvider } from "next-themes"

import { SidebarDemo } from "@/components/sidebar-demo"
import { Backdrop } from "@/registry/acrylic/backdrop"
import {
  isMacOS,
  MacTrafficLights,
  WindowControls,
  WindowResizeHandles,
} from "./window-chrome"

// The Tauri playground is now just a thin host around the SAME shared SidebarDemo
// the web landing page renders — no forked shell, no forked gallery. The ONLY
// Tauri-specific concern is the Backdrop: main.tsx adds `.vibrancy` to <html> when
// the Rust side reports native translucency, and the registry CSS then hides the
// <Backdrop> wallpaper so the OS acrylic shows through. In a plain browser (no
// vibrancy) the same <Backdrop> paints the wallpaper instead.
//
// The app is ALWAYS Acrylic — that's the whole point of running over native
// vibrancy — so the theme is `forcedTheme`-locked and the demo hides its 3-way
// switcher (switching to Light/Dark would just cover the native material).
export default function App() {
  return (
    <ThemeProvider attribute="class" forcedTheme="acrylic" enableSystem={false}>
      <Backdrop />
      {/* h-screen w-screen are EXPLICIT (not flex-grow): #root is display:flex, so a
          child without an intrinsic size collapses to its content width. No dedicated
          titlebar on either OS — controls integrate into the app chrome: macOS traffic
          lights at the sidebar top-left, Windows caption buttons in the header. */}
      <div className="h-screen w-screen overflow-hidden">
        <SidebarDemo
          showThemeSwitcher={false}
          windowControls={isMacOS ? undefined : <WindowControls />}
          sidebarControls={isMacOS ? <MacTrafficLights /> : undefined}
        />
      </div>
      <WindowResizeHandles />
    </ThemeProvider>
  )
}
