"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { SidebarDemo } from "@/components/sidebar-demo"
import { Button } from "@/registry/acrylic/button"

/** Home showcase: the shared SidebarDemo (sidebar + inset, built entirely from the
 *  Acrylic components) wrapped in the landing-page hero. The demo itself is shared
 *  verbatim with the Tauri playground (examples/tauri) — only the hero + the
 *  `/docs` link below are web-specific. `framed` gives it the bounded rounded-card
 *  chrome; the Tauri window renders the same demo edge-to-edge. */
export function SidebarBlock() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          A whole application, in glass
        </h2>
        <p className="mt-2 text-[15px] text-muted-foreground">
          Sidebar, inset, avatars, nested nav — composed from the Acrylic
          components, floating on the desktop.
        </p>
        <div className="mt-5 flex justify-center">
          <Button asChild size="xl">
            <Link href="/docs">
              Browse the components
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* The shell frosts over the REAL global Backdrop (acrylic) — no faked
          wallpaper — so the demo tracks the live theme as the user switches. */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="relative p-6 sm:p-12">
          <SidebarDemo framed />
        </div>
      </div>
    </section>
  )
}
