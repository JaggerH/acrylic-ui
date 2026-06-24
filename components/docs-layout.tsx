"use client"

import type { ReactNode } from "react"
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"
import { DocsLayout } from "fumadocs-ui/layouts/docs"
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "fumadocs-ui/layouts/docs/slots/sidebar"
import type * as PageTree from "fumadocs-core/page-tree"

import { DocsSidebar } from "./docs-sidebar"

/** Wraps Fumadocs' DocsLayout but swaps its sidebar panel (`slots.sidebar.root`)
 *  for the Acrylic Sidebar, while reusing Fumadocs' provider/trigger/useSidebar so
 *  the layout grid + collapse logic keep working. Content + TOC stay on DocsPage.
 *  Client component so the slot component functions don't cross the RSC boundary. */
export function AcrylicDocsLayout({
  tree,
  baseOptions,
  children,
}: {
  tree: PageTree.Root
  baseOptions: BaseLayoutProps
  children: ReactNode
}) {
  return (
    <DocsLayout
      tree={tree}
      {...baseOptions}
      // Reserve the sidebar grid column ourselves (the default sidebar normally
      // sets --fd-sidebar-width; our custom root doesn't). 15rem = the kit width;
      // collapse it on mobile where our desktop aside is hidden.
      containerProps={{
        className:
          "[--fd-layout-width:100%] [--fd-sidebar-width:15rem] max-md:[--fd-sidebar-width:0px]",
      }}
      slots={{
        sidebar: {
          provider: SidebarProvider,
          trigger: SidebarTrigger,
          useSidebar,
          root: DocsSidebar,
        },
      }}
    >
      {children}
    </DocsLayout>
  )
}
