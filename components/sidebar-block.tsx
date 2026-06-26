"use client"

import Link from "next/link"
import { ArrowRight, Maximize2, Minimize2 } from "lucide-react"
import { useState } from "react"

import { SidebarDemo } from "@/components/sidebar-demo"
import { Button } from "@/registry/acrylic/button"

/** Home showcase: the shared SidebarDemo (sidebar + inset, built entirely from the
 *  Acrylic components) wrapped in the landing-page hero. The demo itself is shared
 *  verbatim with the Tauri playground (examples/tauri) — only the hero + the
 *  `/docs` link below are web-specific. `framed` gives it the bounded rounded-card
 *  chrome; the Tauri window renders the same demo edge-to-edge. */
export function SidebarBlock() {
  const [expanded, setExpanded] = useState(false)
  const ExpandIcon = expanded ? Minimize2 : Maximize2

  const expandControl = (
    <Button
      icon
      size="large"
      variant="neutral"
      aria-label={expanded ? "Shrink demo" : "Expand demo"}
      aria-pressed={expanded}
      title={expanded ? "Shrink demo" : "Expand demo"}
      onClick={() => setExpanded((value) => !value)}
      className="text-foreground"
    >
      <ExpandIcon />
    </Button>
  )

  return (
    <section className="mx-auto flex h-[calc(100dvh-4rem)] w-full max-w-7xl flex-col overflow-hidden px-4 py-6">
      <div className="shrink-0 pb-5 text-center">
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
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl">
        <div
          className={
            expanded
              ? "fixed inset-0 z-50 flex bg-background transition-all duration-200 ease-out"
              : "relative flex h-full p-3 transition-all duration-200 ease-out sm:p-5"
          }
        >
          <SidebarDemo
            framed
            frameClassName={
              expanded
                ? "h-full rounded-none shadow-none dark:shadow-none [&_[data-slot=sidebar-inset]]:rounded-none [&_[data-slot=sidebar]]:rounded-none"
                : "h-full"
            }
            headerControls={expandControl}
          />
        </div>
      </div>
    </section>
  )
}
