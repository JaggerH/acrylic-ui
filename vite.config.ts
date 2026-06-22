import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"

// The demo imports the registry's REAL source via the same `@/` aliases the
// components ship with, so the preview renders exactly what consumers install.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: "@/components/acrylic", replacement: path.resolve(__dirname, "registry/acrylic") },
      { find: "@/lib/utils", replacement: path.resolve(__dirname, "demo/lib/utils.ts") },
      { find: "@", replacement: path.resolve(__dirname, "demo") },
    ],
  },
  server: { port: 4321, strictPort: true },
})
