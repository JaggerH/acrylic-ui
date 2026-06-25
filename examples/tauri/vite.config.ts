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
    port: 5180,
    strictPort: true,
    fs: { allow: [repoRoot] },
  },
  // Tauri expects a fixed dev server; envPrefix lets us read TAURI_* if needed.
  clearScreen: false,
})
