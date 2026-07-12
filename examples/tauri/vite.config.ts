import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { fileURLToPath } from "node:url"

// `@` resolves to the acrylic-ui repo root so the playground imports the REAL
// registry components (`@/registry/acrylic/*`) and `@/lib/utils` — single source
// of truth, no copies. `dedupe` + the workspace's single pnpm-stored copy keep
// one React instance even though the imported component files live in the root
// package. `fs.allow` lets Vite read those out-of-project source files.
const repoRoot = fileURLToPath(new URL("../../", import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": repoRoot },
    dedupe: ["react", "react-dom"],
  },
  server: {
    // Windows-target dev (`tauri:dev:win`): vite runs in WSL, WebView2 runs on
    // Windows. `host: true` binds 0.0.0.0 so the Windows side can reach it; the
    // `hmr` block pins the HMR client back to localhost:5180 (WSL2 forwards it)
    // instead of a host it can't find across the WSL↔Windows boundary; `usePolling`
    // because WSL inotify doesn't fire for edits made from the Windows side (and is
    // unreliable across the boundary). Linux-target dev works with or without these.
    host: true,
    port: 5180,
    strictPort: true,
    fs: { allow: [repoRoot] },
    hmr: { protocol: "ws", host: "localhost", port: 5180 },
    watch: { usePolling: true },
  },
  // Tauri expects a fixed dev server; envPrefix lets us read TAURI_* if needed.
  clearScreen: false,
})
